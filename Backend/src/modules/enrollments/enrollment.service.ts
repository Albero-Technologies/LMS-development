import { CoursePublishState, EnrollmentStatus, InvoiceStatus, PaymentEventStatus, PaymentGateway, type Prisma } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { resolveRazorpay, verifyPaymentSignature, verifyWebhookSignature } from '../payments/razorpay.client'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'
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

        const number = await generateInvoiceNumber(tenantId)

        // For a free course, skip Razorpay entirely — mark invoice PAID and activate enrollment.
        if (totalAmount === 0) {
            const invoice = await tx.invoice.create({
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
        const order = await rp.client.orders.create({
            amount: totalAmount,
            currency: course.currency,
            receipt: number,
            notes: { tenantId, courseId, enrollmentId: enrollment.id, userId }
        })

        const invoice = await tx.invoice.create({
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
        payload: { payment?: { entity: { id: string; order_id: string; amount: number; status: string; notes?: Record<string, string> } } }
    }
    const payment = parsed.payload?.payment?.entity
    const eventId = parsed.id
    if (!payment || !eventId) return { ok: true, skipped: true }

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
        } else if (parsed.event === 'payment.failed' && tenantPayment.status === 'PENDING') {
            await db.client.tenantPayment.update({ where: { id: tenantPayment.id }, data: { status: 'FAILED' } })
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
                await tx.enrollment.update({
                    where: { id: invoice.enrollmentId },
                    data: { status: EnrollmentStatus.ACTIVE, startedAt: new Date() }
                })
            }
        }

        if (parsed.event === 'payment.failed') {
            await tx.invoice.update({ where: { id: invoice.id }, data: { status: InvoiceStatus.FAILED } })
        }
    })

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
