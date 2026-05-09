import { CoursePublishState, EnrollmentAccessTier, EnrollmentStatus, InvoiceStatus, PaymentEventStatus, PaymentGateway, type Prisma, Role, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { resolveRazorpay, verifyPaymentSignature, verifyWebhookSignature } from '../payments/razorpay.client'
import { notifyQueue, NOTIFY_JOB, enqueueNotification } from '../notifications/notification.queue'
import { emitToTenant } from '../../service/socket'
import logger from '../../util/logger'

const generateInvoiceNumber = async (tenantId: string): Promise<string> => {
    // Tenant-scoped sequential number. Format: YYYYMM-XXXX.
    const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '')
    const count = await db.client.invoice.count({
        where: { tenantId, number: { startsWith: `${yyyymm}-` } }
    })
    return `${yyyymm}-${String(count + 1).padStart(4, '0')}`
}

// Create enrollment + DUE invoice + Razorpay order. Returns checkout payload for the client.
export const startEnrollment = async (tenantId: string, userId: string, courseId: string, batchId?: string) => {
    const course = await db.client.course.findFirst({
        where: { id: courseId, tenantId, publishState: CoursePublishState.PUBLISHED }
    })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')

    const existing = await db.client.enrollment.findFirst({
        where: { tenantId, userId, courseId }
    })
    if (existing && existing.status !== EnrollmentStatus.REFUNDED && existing.status !== EnrollmentStatus.CANCELLED) {
        // Re-issue the order on a pending enrollment; reject if already ACTIVE.
        if (existing.status !== EnrollmentStatus.PENDING_PAYMENT) {
            throw AppError.conflict('Already enrolled', 'ALREADY_ENROLLED')
        }
    }

    if (batchId) {
        const batch = await db.client.batch.findFirst({ where: { id: batchId, tenantId, courseId } })
        if (!batch) throw AppError.badRequest('Batch does not belong to course', 'BATCH_COURSE_MISMATCH')
    }

    const gstAmount = Math.round((course.price * course.gstPercent) / 100)
    const totalAmount = course.price + gstAmount

    return db.client.$transaction(async (tx) => {
        const enrollment = existing
            ? await tx.enrollment.update({
                  where: { id: existing.id },
                  data: { status: EnrollmentStatus.PENDING_PAYMENT, batchId: batchId ?? existing.batchId }
              })
            : await tx.enrollment.create({
                  data: {
                      tenantId,
                      userId,
                      courseId,
                      batchId,
                      status: EnrollmentStatus.PENDING_PAYMENT
                  }
              })

        // Idempotent invoice handling — when the student first hits "Enrol" we
        // create a DUE invoice. When they hit "Pay now" the controller calls
        // this same service (the Razorpay order is re-issued each time so the
        // checkout always works), but the invoice itself must be reused —
        // otherwise we'd ship two invoices for the same course and the
        // student's Fees page would show a "ghost" pending balance even after
        // they paid the first one.
        const reusableInvoice = existing
            ? await tx.invoice.findFirst({
                  where: { enrollmentId: existing.id, status: InvoiceStatus.DUE }
              })
            : null

        // For a free course, skip Razorpay entirely — mark invoice PAID and activate enrollment.
        if (totalAmount === 0) {
            const number = reusableInvoice ? reusableInvoice.number : await generateInvoiceNumber(tenantId)
            const invoice = reusableInvoice
                ? await tx.invoice.update({
                      where: { id: reusableInvoice.id },
                      data: { status: InvoiceStatus.PAID, paidAt: new Date() }
                  })
                : await tx.invoice.create({
                      data: {
                          tenantId,
                          userId,
                          enrollmentId: enrollment.id,
                          number,
                          amount: course.price,
                          currency: course.currency,
                          gstPercent: course.gstPercent,
                          gstAmount,
                          totalAmount,
                          gateway: PaymentGateway.RAZORPAY,
                          status: InvoiceStatus.PAID,
                          paidAt: new Date()
                      }
                  })
            await tx.enrollment.update({
                where: { id: enrollment.id },
                data: { status: EnrollmentStatus.ACTIVE, startedAt: new Date() }
            })
            return { enrollment, invoice, free: true as const, order: null }
        }

        // Paid course — create Razorpay order using the tenant's own keys
        // when configured, otherwise the platform default.
        const rp = await resolveRazorpay(tenantId)
        const number = reusableInvoice ? reusableInvoice.number : await generateInvoiceNumber(tenantId)
        const order = await rp.client.orders.create({
            amount: totalAmount,
            currency: course.currency,
            receipt: number,
            notes: { tenantId, courseId, enrollmentId: enrollment.id, userId }
        })

        const invoice = reusableInvoice
            ? await tx.invoice.update({
                  where: { id: reusableInvoice.id },
                  // Refresh the order id so the client checkout uses the latest
                  // order (Razorpay orders can expire). Amount/total stay the
                  // same since the course price hasn't moved.
                  data: { gatewayOrderId: order.id }
              })
            : await tx.invoice.create({
                  data: {
                      tenantId,
                      userId,
                      enrollmentId: enrollment.id,
                      number,
                      amount: course.price,
                      currency: course.currency,
                      gstPercent: course.gstPercent,
                      gstAmount,
                      totalAmount,
                      gateway: PaymentGateway.RAZORPAY,
                      gatewayOrderId: order.id,
                      status: InvoiceStatus.DUE,
                      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                  }
              })

        return {
            enrollment,
            invoice,
            free: false as const,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: rp.keyId
            }
        }
    })
}

// Called by client after Razorpay Checkout handshake — verifies signature and marks invoice paid.
export const verifyPayment = async (
    tenantId: string,
    userId: string,
    input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
) => {
    const invoice = await db.client.invoice.findFirst({
        where: { tenantId, userId, gatewayOrderId: input.razorpayOrderId }
    })
    if (!invoice) throw AppError.notFound(responseMessage.NOT_FOUND('Invoice'))
    if (invoice.status === InvoiceStatus.PAID) return invoice

    const ok = await verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature, tenantId)
    if (!ok) throw AppError.badRequest(responseMessage.PAYMENT_VERIFICATION_FAILED, 'SIGNATURE_INVALID')

    const updated = await db.client.$transaction(async (tx) => {
        const inv = await tx.invoice.update({
            where: { id: invoice.id },
            data: {
                gatewayPaymentId: input.razorpayPaymentId,
                status: InvoiceStatus.PAID,
                paidAt: new Date()
            }
        })

        if (inv.enrollmentId) {
            await tx.enrollment.update({
                where: { id: inv.enrollmentId },
                data: { status: EnrollmentStatus.ACTIVE, startedAt: new Date() }
            })
        }

        await tx.paymentEvent.create({
            data: {
                tenantId,
                invoiceId: inv.id,
                gateway: PaymentGateway.RAZORPAY,
                gatewayEventId: `client-verify-${input.razorpayPaymentId}`,
                gatewayOrderId: input.razorpayOrderId,
                gatewayPaymentId: input.razorpayPaymentId,
                status: PaymentEventStatus.VERIFIED,
                amount: inv.totalAmount,
                rawPayload: { source: 'client-verify' },
                signatureValid: true
            }
        })

        return inv
    })

    // Fire enrollment + payment notification jobs.
    const enrollment = updated.enrollmentId
        ? await db.client.enrollment.findUnique({
              where: { id: updated.enrollmentId },
              include: { course: { select: { title: true } } }
          })
        : null
    if (enrollment) {
        await notifyQueue.add(NOTIFY_JOB, {
            tenantId,
            userId,
            template: 'enrollment',
            data: { courseTitle: enrollment.course.title }
        })
    }
    await notifyQueue.add(NOTIFY_JOB, {
        tenantId,
        userId,
        template: 'payment',
        data: { invoiceNumber: updated.number, amount: (updated.totalAmount / 100).toFixed(2), currency: updated.currency }
    })

    return updated
}

// Razorpay webhook — idempotent via (gatewayEventId) unique on PaymentEvent.
//
// Three event kinds are wired through the same handler:
//   payment.captured   → invoice flips to PAID, enrolment ACTIVE, all
//                        stakeholders notified, dashboards invalidated.
//   payment.failed     → invoice flips to FAILED, student emailed,
//                        counsellor + admin pinged.
//   refund.processed   → invoice REFUNDED with audit metadata, enrolment
//                        cancelled, refund column on Payments page updates.
//
// Every state change emits a `payments:updated` socket event scoped to the
// tenant so the admin Payments page + SA tenant view + Sales Funnel
// recompute totals without a page refresh.
export const handleRazorpayWebhook = async (rawBody: string, signature: string) => {
    // Webhook delivery is from a single endpoint; we accept the platform secret
    // here. Tenant-specific webhook secrets are validated downstream when we
    // know which tenant the order belongs to.
    if (!(await verifyWebhookSignature(rawBody, signature))) {
        throw AppError.badRequest(responseMessage.WEBHOOK_SIGNATURE_INVALID, 'WEBHOOK_SIGNATURE_INVALID')
    }

    const parsed = JSON.parse(rawBody) as {
        event: string
        id: string
        payload: {
            payment?: { entity: { id: string; order_id: string; amount: number; status: string; notes?: Record<string, string> } }
            refund?: { entity: { id: string; payment_id: string; amount: number; status: string; notes?: Record<string, string> } }
        }
    }

    const eventId = parsed.id
    if (!eventId) return { ok: true, skipped: true }

    // ---- refund.processed ------------------------------------------------
    // Refunds carry a refund entity, not a payment entity. The payment_id
    // links back to the original Invoice so we can mark it REFUNDED and
    // surface the amount on the Payments page.
    if (parsed.event === 'refund.processed' || parsed.event === 'refund.created' || parsed.event === 'refund.failed') {
        const refund = parsed.payload?.refund?.entity
        if (!refund) return { ok: true, skipped: true }

        const invoice = await db.client.invoice.findFirst({ where: { gatewayPaymentId: refund.payment_id } })
        if (!invoice) {
            logger.warn('WEBHOOK_REFUND_INVOICE_NOT_FOUND', { meta: { paymentId: refund.payment_id } })
            return { ok: true, skipped: true }
        }

        const alreadyProcessed = await db.client.paymentEvent.findUnique({ where: { gatewayEventId: eventId } })
        if (alreadyProcessed) return { ok: true, duplicate: true }

        await db.client.$transaction(async (tx) => {
            await tx.paymentEvent.create({
                data: {
                    tenantId: invoice.tenantId,
                    invoiceId: invoice.id,
                    gateway: PaymentGateway.RAZORPAY,
                    gatewayEventId: eventId,
                    gatewayOrderId: invoice.gatewayOrderId,
                    gatewayPaymentId: refund.payment_id,
                    status: PaymentEventStatus.REFUNDED,
                    amount: refund.amount,
                    rawPayload: parsed as unknown as Prisma.InputJsonValue,
                    signatureValid: true
                }
            })
            if (parsed.event === 'refund.processed' && invoice.status !== InvoiceStatus.REFUNDED) {
                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: { status: InvoiceStatus.REFUNDED, refundedAt: new Date() }
                })
                if (invoice.enrollmentId) {
                    await tx.enrollment.update({
                        where: { id: invoice.enrollmentId },
                        data: { status: EnrollmentStatus.REFUNDED }
                    })
                }
            }
        })

        await fanoutPaymentSync(invoice.tenantId, {
            kind: 'refund',
            invoiceId: invoice.id,
            paymentId: refund.payment_id,
            amount: refund.amount
        })
        await notifyPaymentStakeholders(invoice.tenantId, invoice.userId, invoice.id, 'refund.processed', refund.amount)
        return { ok: true, kind: 'refund' }
    }

    const payment = parsed.payload?.payment?.entity
    if (!payment) return { ok: true, skipped: true }

    // Tenant SaaS invoices live in TenantPayment, not Invoice. Razorpay order
    // notes carry `kind: 'tenant_saas'` so we can route the webhook to the
    // right table without scanning both unconditionally.
    if (payment.notes?.kind === 'tenant_saas') {
        const tenantPayment = await db.client.tenantPayment.findFirst({ where: { gatewayOrderId: payment.order_id } })
        if (!tenantPayment) {
            logger.warn('WEBHOOK_TENANT_PAYMENT_NOT_FOUND', { meta: { orderId: payment.order_id } })
            return { ok: true, skipped: true }
        }
        if (parsed.event === 'payment.captured' && tenantPayment.status !== 'PAID') {
            await db.client.tenantPayment.update({
                where: { id: tenantPayment.id },
                data: { status: 'PAID', gatewayPaymentId: payment.id, paidAt: new Date() }
            })
            await fanoutPaymentSync(tenantPayment.tenantId, { kind: 'saas', tenantPaymentId: tenantPayment.id, amount: tenantPayment.amount })
        } else if (parsed.event === 'payment.failed' && tenantPayment.status === 'PENDING') {
            await db.client.tenantPayment.update({ where: { id: tenantPayment.id }, data: { status: 'FAILED' } })
            await fanoutPaymentSync(tenantPayment.tenantId, { kind: 'saas', tenantPaymentId: tenantPayment.id, status: 'FAILED' })
        }
        return { ok: true, kind: 'tenant_saas' }
    }

    // Student course fees — original flow.
    const invoice = await db.client.invoice.findFirst({ where: { gatewayOrderId: payment.order_id } })
    if (!invoice) {
        logger.warn('WEBHOOK_INVOICE_NOT_FOUND', { meta: { orderId: payment.order_id } })
        return { ok: true, skipped: true }
    }

    const alreadyProcessed = await db.client.paymentEvent.findUnique({ where: { gatewayEventId: eventId } })
    if (alreadyProcessed) return { ok: true, duplicate: true }

    await db.client.$transaction(async (tx) => {
        await tx.paymentEvent.create({
            data: {
                tenantId: invoice.tenantId,
                invoiceId: invoice.id,
                gateway: PaymentGateway.RAZORPAY,
                gatewayEventId: eventId,
                gatewayOrderId: payment.order_id,
                gatewayPaymentId: payment.id,
                status: parsed.event === 'payment.captured' ? PaymentEventStatus.VERIFIED : PaymentEventStatus.FAILED,
                amount: payment.amount,
                rawPayload: parsed as unknown as Prisma.InputJsonValue,
                signatureValid: true
            }
        })

        if (parsed.event === 'payment.captured' && invoice.status !== InvoiceStatus.PAID) {
            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: InvoiceStatus.PAID, gatewayPaymentId: payment.id, paidAt: new Date() }
            })
            if (invoice.enrollmentId) {
                // After the invoice flips to PAID, recompute the enrolment
                // access tier. If the student's outstanding balance is now
                // zero (sum of DUE/DRAFT invoices == 0), upgrade DEMO →
                // FULL so all lessons unlock immediately.
                const enrollmentSnapshot = await tx.enrollment.findUnique({ where: { id: invoice.enrollmentId } })
                const outstanding = await tx.invoice.aggregate({
                    _sum: { totalAmount: true },
                    where: {
                        enrollmentId: invoice.enrollmentId,
                        status: { in: [InvoiceStatus.DUE, InvoiceStatus.DRAFT] }
                    }
                })
                const remaining = outstanding._sum.totalAmount ?? 0
                const shouldUpgrade =
                    enrollmentSnapshot?.accessTier === EnrollmentAccessTier.DEMO && remaining === 0
                await tx.enrollment.update({
                    where: { id: invoice.enrollmentId },
                    data: {
                        status: EnrollmentStatus.ACTIVE,
                        startedAt: new Date(),
                        ...(shouldUpgrade ? { accessTier: EnrollmentAccessTier.FULL, demoExpiresAt: null } : {})
                    }
                })
            }
        }

        if (parsed.event === 'payment.failed') {
            await tx.invoice.update({ where: { id: invoice.id }, data: { status: InvoiceStatus.FAILED } })
        }
    })

    // Fan-out — socket invalidation + per-stakeholder notifications. Both
    // best-effort: any failure is logged but the webhook still acks 200 so
    // Razorpay doesn't retry the already-persisted event.
    await fanoutPaymentSync(invoice.tenantId, {
        kind: parsed.event === 'payment.captured' ? 'captured' : 'failed',
        invoiceId: invoice.id,
        paymentId: payment.id,
        amount: payment.amount
    })

    // Per-student unlock event. We re-read the enrolment after the
    // transaction so the socket payload reflects the post-upgrade tier.
    // This drives the green "🎉 Full access unlocked!" toast on the
    // student's open dashboard session and refetches the lesson list.
    if (parsed.event === 'payment.captured' && invoice.enrollmentId) {
        const fresh = await db.client.enrollment.findUnique({
            where: { id: invoice.enrollmentId },
            select: { id: true, userId: true, accessTier: true, courseId: true }
        })
        if (fresh && fresh.accessTier === EnrollmentAccessTier.FULL) {
            try {
                const { emitToUser } = await import('../../service/socket')
                emitToUser(fresh.userId, 'enrollment:unlocked', {
                    enrollmentId: fresh.id,
                    courseId: fresh.courseId,
                    ts: Date.now()
                })
            } catch (err) {
                logger.warn('ENROLLMENT_UNLOCK_EMIT_FAILED', { meta: { err: (err as Error).message } })
            }
        }
    }

    await notifyPaymentStakeholders(invoice.tenantId, invoice.userId, invoice.id, parsed.event, payment.amount)

    return { ok: true }
}

export const listMyEnrollments = async (tenantId: string, userId: string) => {
    return db.client.enrollment.findMany({
        where: { tenantId, userId },
        include: {
            course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } },
            batch: { select: { id: true, name: true, code: true, startDate: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export const adminListEnrollments = async (tenantId: string, query: { courseId?: string; userId?: string; status?: EnrollmentStatus }) => {
    const where: Prisma.EnrollmentWhereInput = { tenantId }
    if (query.courseId) where.courseId = query.courseId
    if (query.userId) where.userId = query.userId
    if (query.status) where.status = query.status

    return db.client.enrollment.findMany({
        where,
        include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
            course: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
    })
}

// ---- Webhook fan-out helpers --------------------------------------------

interface PaymentSyncEvent {
    kind: 'captured' | 'failed' | 'refund' | 'saas'
    invoiceId?: string
    tenantPaymentId?: string
    paymentId?: string
    amount?: number
    status?: string
}

// Push a `payments:updated` socket message to the tenant room. The
// dashboard hooks already invalidate the matching TanStack queries on
// receipt, so the Payments page totals + Sales Funnel tiles + counsellor
// pipeline all refresh without a page reload. Best-effort — if the socket
// server isn't running (worker process), this is a no-op.
const fanoutPaymentSync = (tenantId: string, event: PaymentSyncEvent): Promise<void> => {
    try {
        emitToTenant(tenantId, 'payments:updated', { ...event, ts: Date.now() })
    } catch (err) {
        logger.warn('PAYMENT_SYNC_EMIT_FAILED', { meta: { tenantId, err: (err as Error).message } })
    }
    return Promise.resolve()
}

// Notify the student + assigned counsellor + every tenant ADMIN/MANAGER
// of a payment lifecycle event. Templates differ by event:
//   payment.captured  → admin/manager/counsellor get `payment_received_admin`
//   payment.failed    → student gets a "payment failed" mail; admin/counsellor pinged
//   refund.processed  → student + admin notified
const notifyPaymentStakeholders = async (
    tenantId: string,
    studentUserId: string,
    invoiceId: string,
    event: string,
    amountMinor: number
): Promise<void> => {
    const [tenant, student, invoice, staff] = await Promise.all([
        db.client.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
        db.client.user.findUnique({
            where: { id: studentUserId },
            select: { id: true, email: true, firstName: true, lastName: true }
        }),
        db.client.invoice.findUnique({
            where: { id: invoiceId },
            select: { number: true, enrollmentId: true, totalAmount: true }
        }),
        db.client.user.findMany({
            where: { tenantId, role: { in: [Role.ADMIN, Role.COUNSELLING_MANAGER] }, status: UserStatus.ACTIVE, deletedAt: null },
            select: { id: true }
        })
    ])
    if (!student || !invoice) return

    const enrollment = invoice.enrollmentId
        ? await db.client.enrollment.findUnique({
              where: { id: invoice.enrollmentId },
              select: {
                  counsellorId: true,
                  course: { select: { title: true } }
              }
          })
        : null

    const studentName = `${student.firstName} ${student.lastName}`.trim() || student.email
    const courseTitle = enrollment?.course?.title ?? ''
    const amountDisplay = `₹${(amountMinor / 100).toLocaleString('en-IN')}`

    const stakeholderIds = new Set<string>(staff.map((s) => s.id))
    if (enrollment?.counsellorId) stakeholderIds.add(enrollment.counsellorId)

    if (event === 'payment.captured') {
        for (const recipientId of stakeholderIds) {
            await enqueueNotification({
                tenantId,
                userId: recipientId,
                template: 'payment_received_admin',
                data: { studentName, courseTitle, amountDisplay, method: 'ONLINE', invoiceNumber: invoice.number }
            })
        }
        return
    }

    if (event === 'payment.failed') {
        // Student first — they need to see the bounce immediately.
        await enqueueNotification({
            tenantId,
            userId: student.id,
            template: 'payment',
            data: {
                invoiceNumber: invoice.number,
                amount: amountDisplay,
                currency: 'INR',
                failed: true,
                tenantName: tenant?.name ?? ''
            }
        })
        for (const recipientId of stakeholderIds) {
            await enqueueNotification({
                tenantId,
                userId: recipientId,
                template: 'payment_received_admin',
                data: { studentName, courseTitle, amountDisplay, method: 'ONLINE · FAILED', invoiceNumber: invoice.number }
            })
        }
        return
    }

    if (event === 'refund.processed') {
        await enqueueNotification({
            tenantId,
            userId: student.id,
            template: 'payment',
            data: {
                invoiceNumber: invoice.number,
                amount: amountDisplay,
                currency: 'INR',
                refunded: true,
                tenantName: tenant?.name ?? ''
            }
        })
        for (const recipientId of stakeholderIds) {
            await enqueueNotification({
                tenantId,
                userId: recipientId,
                template: 'payment_received_admin',
                data: { studentName, courseTitle, amountDisplay, method: 'REFUND', invoiceNumber: invoice.number }
            })
        }
    }
}
