import {
    AuthProvider,
    CoursePublishState,
    EnrollmentStatus,
    InvoiceStatus,
    PaymentGateway,
    type Prisma,
    Role,
    UserStatus
} from '@prisma/client'
import crypto from 'crypto'
import db from '../../service/db'
import config from '../../config/config'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import logger from '../../util/logger'
import { hashPassword } from '../../util/password'
import { resolveRazorpay, verifyPaymentSignature } from '../payments/razorpay.client'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'
import { pickCounsellor } from '../enquiries/enquiry.service'
import type { TInitPurchaseInput, TVerifyPurchaseInput, TCancelPurchaseInput } from './public-purchase.schema'

// Resolve a tenant by slug for public traffic. Mirrors enquiries' resolver
// but doesn't accept Host-header subdomain lookups — callers always pass the
// slug explicitly so embedded checkouts (where Host is not the tenant
// origin) keep working.
const resolveTenant = async (slug: string) => {
    const tenant = await db.client.tenant.findUnique({ where: { slug } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
        throw AppError.forbidden('Tenant is not accepting enrolments right now', 'TENANT_INACTIVE')
    }
    return tenant
}

const findCourse = async (tenantId: string, slug: string) => {
    const course = await db.client.course.findUnique({
        where: { tenantId_slug: { tenantId, slug } }
    })
    if (!course || course.deletedAt) throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')
    if (course.publishState !== CoursePublishState.PUBLISHED) {
        throw AppError.forbidden('Course is not published', 'COURSE_NOT_PUBLISHED')
    }
    if (course.price <= 0) {
        // Free courses don't go through the purchase flow — admins can enrol
        // students directly. Fail loudly so the public site doesn't quietly
        // collect zero-rupee orders.
        throw AppError.badRequest('Course has no payable price', 'COURSE_FREE')
    }
    return course
}

const computeTotal = (priceMinor: number, gstPercent: number): { gstAmount: number; totalAmount: number } => {
    // Course price is exclusive of GST in this codebase. Round HALF UP to
    // the nearest paise so Razorpay's amount field stays an integer.
    const gstAmount = Math.round((priceMinor * gstPercent) / 100)
    const totalAmount = priceMinor + gstAmount
    return { gstAmount, totalAmount }
}

interface PurchaseIntent {
    courseId: string
    courseSlug: string
    courseTitle: string
    priceMinor: number
    gstAmount: number
    totalAmount: number
    currency: string
    razorpayOrderId: string
    razorpayKeyId: string
    status: 'pending' | 'completed' | 'cancelled' | 'failed'
    initiatedAt: string
    completedAt?: string
    invoiceId?: string
    enrollmentId?: string
    userId?: string
}

const readPurchaseIntent = (extra: unknown): PurchaseIntent | null => {
    const blob = extra as { purchaseIntent?: PurchaseIntent } | null
    return blob?.purchaseIntent ?? null
}

// /init — creates a Razorpay order + an Enquiry that captures the intent.
// The Enquiry is the durable bookkeeping row; if checkout never completes we
// still know who tried, so a counsellor can chase them. The orderId is
// stamped onto extra.purchaseIntent so /verify can find it again.
export const initPurchase = async (input: TInitPurchaseInput) => {
    const tenant = await resolveTenant(input.tenantSlug)
    const course = await findCourse(tenant.id, input.courseSlug)

    const { gstAmount, totalAmount } = computeTotal(course.price, course.gstPercent)

    const rp = await resolveRazorpay(tenant.id)
    const order = await rp.client.orders.create({
        amount: totalAmount,
        currency: course.currency,
        // Razorpay receipt has a 40-char limit; uuid (36) is fine but we
        // shorten in case we ever prefix.
        receipt: `enq-${crypto.randomBytes(8).toString('hex')}`,
        notes: { tenantId: tenant.id, courseId: course.id, source: 'public-purchase' }
    })

    const purchaseIntent: PurchaseIntent = {
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        priceMinor: course.price,
        gstAmount,
        totalAmount,
        currency: course.currency,
        razorpayOrderId: order.id,
        razorpayKeyId: rp.keyId,
        status: 'pending',
        initiatedAt: new Date().toISOString()
    }

    const assignedToId = await pickCounsellor(tenant.id)

    const enquiry = await db.client.enquiry.create({
        data: {
            tenantId: tenant.id,
            name: input.name,
            email: input.email,
            phone: input.phone,
            course: course.title,
            city: input.city,
            message: input.message ?? `Started checkout for ${course.title}`,
            source: input.utmSource ? `utm:${input.utmSource}` : 'website-checkout',
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            extra: { purchaseIntent } as unknown as Prisma.InputJsonValue,
            assignedToId
        }
    })

    return {
        purchaseId: enquiry.id,
        orderId: order.id,
        amount: totalAmount,
        currency: course.currency,
        keyId: rp.keyId,
        courseTitle: course.title,
        courseId: course.id,
        prefill: { name: input.name, email: input.email, phone: input.phone }
    }
}

// /verify — Razorpay handed the frontend an order_id + payment_id +
// signature. We verify the HMAC against the tenant's secret, then on success
// build the student account, enrolment, and invoice — and queue the
// credentials email. Idempotent: re-posting the same payload returns the
// same result without duplicate writes.
export const verifyPurchase = async (input: TVerifyPurchaseInput) => {
    const enquiry = await db.client.enquiry.findUnique({ where: { id: input.purchaseId } })
    if (!enquiry) throw AppError.notFound(responseMessage.NOT_FOUND('Purchase'), 'PURCHASE_NOT_FOUND')

    const intent = readPurchaseIntent(enquiry.extra)
    if (!intent) throw AppError.badRequest('Purchase has no intent record', 'PURCHASE_NO_INTENT')
    if (intent.razorpayOrderId !== input.razorpayOrderId) {
        throw AppError.badRequest('Order id mismatch', 'PURCHASE_ORDER_MISMATCH')
    }

    // Idempotency — replays return the previously persisted result instead
    // of creating duplicate users/enrolments.
    if (intent.status === 'completed' && intent.userId && intent.enrollmentId) {
        return {
            enrolled: true,
            alreadyProcessed: true,
            courseTitle: intent.courseTitle,
            email: enquiry.email,
            loginUrl: `${config.PUBLIC_SITE_URL}/login`
        }
    }

    const ok = await verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature, enquiry.tenantId)
    if (!ok) {
        await db.client.enquiry.update({
            where: { id: enquiry.id },
            data: {
                extra: { purchaseIntent: { ...intent, status: 'failed' } } as unknown as Prisma.InputJsonValue
            }
        })
        throw AppError.badRequest('Payment signature invalid', 'PURCHASE_SIGNATURE_INVALID')
    }

    const tempPassword = generateTempPassword()
    const [firstName, ...rest] = enquiry.name.trim().split(/\s+/)
    const lastName = rest.join(' ') || '—'

    // Atomically materialise the User + Enrollment + Invoice + Enquiry update
    // so a partial failure doesn't leave the world half-paid.
    const result = await db.client.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
            where: { tenantId_email: { tenantId: enquiry.tenantId, email: enquiry.email } }
        })
        if (!user) {
            user = await tx.user.create({
                data: {
                    tenantId: enquiry.tenantId,
                    email: enquiry.email,
                    phone: enquiry.phone,
                    passwordHash: await hashPassword(tempPassword),
                    firstName,
                    lastName,
                    role: Role.STUDENT,
                    status: UserStatus.ACTIVE,
                    emailVerified: true,
                    provider: AuthProvider.LOCAL
                }
            })
        }

        // If the same user previously enrolled in this course, reuse the row
        // and just nudge it back to ACTIVE (covers a refund-then-rebuy edge).
        const enrollment = await tx.enrollment.upsert({
            where: { tenantId_userId_courseId: { tenantId: enquiry.tenantId, userId: user.id, courseId: intent.courseId } },
            update: { status: EnrollmentStatus.ACTIVE, startedAt: new Date() },
            create: {
                tenantId: enquiry.tenantId,
                userId: user.id,
                courseId: intent.courseId,
                status: EnrollmentStatus.ACTIVE,
                startedAt: new Date()
            }
        })

        // Tenant-scoped, monotonic invoice number — mirrors the existing
        // payment service's pattern (count + 1, padded).
        const count = await tx.invoice.count({ where: { tenantId: enquiry.tenantId } })
        const invoiceNumber = `ALB-${String(count + 1).padStart(6, '0')}`

        const invoice = await tx.invoice.create({
            data: {
                tenantId: enquiry.tenantId,
                userId: user.id,
                enrollmentId: enrollment.id,
                number: invoiceNumber,
                amount: intent.priceMinor,
                gstPercent: Math.round((intent.gstAmount * 100) / Math.max(intent.priceMinor, 1)),
                gstAmount: intent.gstAmount,
                totalAmount: intent.totalAmount,
                currency: intent.currency,
                gateway: PaymentGateway.RAZORPAY,
                gatewayOrderId: input.razorpayOrderId,
                gatewayPaymentId: input.razorpayPaymentId,
                status: InvoiceStatus.PAID,
                paidAt: new Date()
            }
        })

        const completedIntent: PurchaseIntent = {
            ...intent,
            status: 'completed',
            completedAt: new Date().toISOString(),
            invoiceId: invoice.id,
            enrollmentId: enrollment.id,
            userId: user.id
        }

        await tx.enquiry.update({
            where: { id: enquiry.id },
            data: {
                stage: 'CONVERTED',
                extra: { purchaseIntent: completedIntent } as unknown as Prisma.InputJsonValue
            }
        })

        return { user, enrollment, invoice, completedIntent }
    })

    // Outside the transaction — if the email queue is down we still want the
    // user account to exist. Failures here are logged + retried by BullMQ.
    const loginUrl = `${config.PUBLIC_SITE_URL}/login`
    try {
        await notifyQueue.add(NOTIFY_JOB, {
            tenantId: enquiry.tenantId,
            userId: result.user.id,
            template: 'enrollment_credentials',
            data: {
                firstName: result.user.firstName,
                courseTitle: intent.courseTitle,
                email: result.user.email,
                tempPassword,
                loginUrl
            }
        })
    } catch (err) {
        logger.error('PURCHASE_EMAIL_QUEUE_FAILED', { meta: { enquiryId: enquiry.id, err: (err as Error).message } })
    }

    return {
        enrolled: true,
        alreadyProcessed: false,
        courseTitle: intent.courseTitle,
        email: result.user.email,
        loginUrl,
        invoiceNumber: result.invoice.number
    }
}

// /cancel — Razorpay checkout was dismissed without payment. We don't need
// any signed payload here; the worst case is a curious user toggling the
// state of their own pending lead. Stage moves to DEMO_SCHEDULED so the
// counsellor inbox flags them for follow-up.
export const cancelPurchase = async (input: TCancelPurchaseInput) => {
    const enquiry = await db.client.enquiry.findUnique({ where: { id: input.purchaseId } })
    if (!enquiry) throw AppError.notFound(responseMessage.NOT_FOUND('Purchase'), 'PURCHASE_NOT_FOUND')

    const intent = readPurchaseIntent(enquiry.extra)
    if (intent && intent.status === 'completed') {
        // Already paid — don't let a stale cancel call wipe the conversion.
        return { ok: true, message: 'Payment was already completed', alreadyConverted: true }
    }

    const updated = await db.client.enquiry.update({
        where: { id: enquiry.id },
        data: {
            stage: 'DEMO_SCHEDULED',
            message: input.reason
                ? `Cancelled checkout — ${input.reason}`
                : `Cancelled checkout — wants a demo for ${intent?.courseTitle ?? enquiry.course}`,
            extra: intent
                ? ({ purchaseIntent: { ...intent, status: 'cancelled' } } as unknown as Prisma.InputJsonValue)
                : (enquiry.extra as Prisma.InputJsonValue | undefined)
        },
        include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    })

    return {
        ok: true,
        message: "We'll have a counsellor reach out to schedule a free demo.",
        assignedCounsellor: updated.assignedTo
            ? { id: updated.assignedTo.id, name: `${updated.assignedTo.firstName} ${updated.assignedTo.lastName}` }
            : null
    }
}

// 12-character, mixed-case + digit random string. URL-safe alphabet so the
// password is easy to type from the email (no 0/O, l/1 confusion).
const generateTempPassword = (): string => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    const buf = crypto.randomBytes(12)
    let out = ''
    for (let i = 0; i < buf.length; i++) out += alphabet[buf[i] % alphabet.length]
    return out
}
