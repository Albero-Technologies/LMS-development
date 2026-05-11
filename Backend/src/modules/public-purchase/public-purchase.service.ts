import {
    AuthProvider,
    CoursePublishState,
    EnrollmentAccessTier,
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
import { enqueueNotification } from '../notifications/notification.queue'
import { pickCounsellor, pushEnquiryToSheet } from '../enquiries/enquiry.service'
import { createPasswordResetToken } from '../auth/auth.service'
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
    // Two-stage fees: REGISTRATION is the small "reserve your seat" payment;
    // FULL settles the entire course fee. fullCourseFeeMinor is always the
    // authoritative course price, so the counsellor follow-up can quote the
    // exact remaining balance regardless of which path the student took.
    paymentType: 'REGISTRATION' | 'FULL'
    fullCourseFeeMinor: number
    tierKey?: string
    tierLabel?: string
    tierPriceMinor?: number
}

// Default registration fee in paise (₹5,000). Tenants override this via
// `tenant.settings.payments.registrationFeeMinor` when they want a different
// reservation amount; courses can also pin their own with
// `course.registrationFeeMinor`.
const DEFAULT_REGISTRATION_FEE_MINOR = 5_000_00

const resolveRegistrationFee = (settings: unknown, courseOverrideMinor: number | null | undefined): number => {
    if (typeof courseOverrideMinor === 'number' && Number.isFinite(courseOverrideMinor) && courseOverrideMinor > 0) {
        return Math.round(courseOverrideMinor)
    }
    const blob = settings as { payments?: { registrationFeeMinor?: number } } | null
    const v = blob?.payments?.registrationFeeMinor
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.round(v)
    return DEFAULT_REGISTRATION_FEE_MINOR
}

// Pricing tier shape stored on Course.priceTiers. Frontend mirror lives in
// Albero_Frontend/src/constants/programs.ts; admins can edit via the CMS.
interface CoursePriceTier {
    key: string
    label?: string
    priceMinor: number
    emiMinor?: number
    recommended?: boolean
    features?: string[]
}

const readPriceTiers = (raw: unknown): CoursePriceTier[] => {
    if (!Array.isArray(raw)) return []
    return raw
        .filter((t): t is CoursePriceTier => {
            if (!t || typeof t !== 'object') return false
            const obj = t as Record<string, unknown>
            return typeof obj.key === 'string' && typeof obj.priceMinor === 'number' && Number.isFinite(obj.priceMinor) && obj.priceMinor > 0
        })
        .map((t) => ({ ...t }))
}

// Resolve the authoritative full-fee amount for a course. If the request
// names a tierKey AND that key exists in Course.priceTiers, charge the tier
// price; otherwise fall back to Course.price (legacy single-price flow).
const resolveFullPriceMinor = (
    course: { price: number; priceTiers: unknown },
    tierKey: string | undefined
): { priceMinor: number; tier: CoursePriceTier | null } => {
    const tiers = readPriceTiers(course.priceTiers)
    if (tierKey) {
        const tier = tiers.find((t) => t.key === tierKey)
        if (tier) return { priceMinor: tier.priceMinor, tier }
    }
    return { priceMinor: course.price, tier: null }
}

const readPurchaseIntent = (extra: unknown): PurchaseIntent | null => {
    const blob = extra as { purchaseIntent?: Partial<PurchaseIntent> } | null
    const raw = blob?.purchaseIntent
    if (!raw) return null
    // Backfill the new fields for older intents written before paymentType
    // existed on the schema. They are always FULL — registration is a new
    // flow — and fullCourseFeeMinor falls back to the priceMinor we charged.
    return {
        ...(raw as PurchaseIntent),
        paymentType: raw.paymentType ?? 'FULL',
        fullCourseFeeMinor: raw.fullCourseFeeMinor ?? raw.priceMinor ?? 0
    }
}

// /init — creates a Razorpay order + an Enquiry that captures the intent.
// The Enquiry is the durable bookkeeping row; if checkout never completes we
// still know who tried, so a counsellor can chase them. The orderId is
// stamped onto extra.purchaseIntent so /verify can find it again.
export const initPurchase = async (input: TInitPurchaseInput) => {
    const tenant = await resolveTenant(input.tenantSlug)
    const course = await findCourse(tenant.id, input.courseSlug)

    // Charged amount depends on paymentType. REGISTRATION → flat tenant
    // (or per-course) fee; FULL → tier price if a known tierKey was sent,
    // otherwise the legacy course.price. Tier metadata from the request
    // (label / priceMinor) is recorded as advisory copy only — the price
    // we charge is always read from the database.
    const isRegistration = input.paymentType === 'REGISTRATION'
    const registrationFeeMinor = resolveRegistrationFee(tenant.settings, course.registrationFeeMinor)
    const { priceMinor: fullPriceMinor, tier } = resolveFullPriceMinor(course, input.tierKey)
    const chargedPriceMinor = isRegistration ? registrationFeeMinor : fullPriceMinor
    const resolvedTierLabel = tier?.label ?? input.tierLabel

    const { gstAmount, totalAmount } = computeTotal(chargedPriceMinor, course.gstPercent)

    const rp = await resolveRazorpay(tenant.id)
    const order = await rp.client.orders.create({
        amount: totalAmount,
        currency: course.currency,
        // Razorpay receipt has a 40-char limit; uuid (36) is fine but we
        // shorten in case we ever prefix.
        receipt: `enq-${crypto.randomBytes(8).toString('hex')}`,
        notes: {
            tenantId: tenant.id,
            courseId: course.id,
            source: 'public-purchase',
            paymentType: input.paymentType
        }
    })

    const purchaseIntent: PurchaseIntent = {
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        priceMinor: chargedPriceMinor,
        gstAmount,
        totalAmount,
        currency: course.currency,
        razorpayOrderId: order.id,
        razorpayKeyId: rp.keyId,
        status: 'pending',
        initiatedAt: new Date().toISOString(),
        paymentType: input.paymentType,
        fullCourseFeeMinor: fullPriceMinor,
        tierKey: input.tierKey ?? tier?.key,
        tierLabel: resolvedTierLabel,
        tierPriceMinor: tier?.priceMinor ?? input.tierPriceMinor
    }

    const assignedToId = await pickCounsellor(tenant.id)

    const intentSummary = isRegistration
        ? `Reserve seat (${resolvedTierLabel ?? 'tier'}) for ${course.title}`
        : `Full payment (${resolvedTierLabel ?? 'full'}) for ${course.title}`

    const enquiry = await db.client.enquiry.create({
        data: {
            tenantId: tenant.id,
            name: input.name,
            email: input.email,
            phone: input.phone,
            course: course.title,
            city: input.city,
            message: input.message ?? intentSummary,
            source: input.utmSource ? `utm:${input.utmSource}` : 'website-checkout',
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            extra: { purchaseIntent } as unknown as Prisma.InputJsonValue,
            assignedToId
        }
    })

    // Same fire-and-forget sheet push as the contact form, but flagged as
    // an enrol-checkout row so the marketing team can filter the funnel.
    void pushEnquiryToSheet(tenant.id, enquiry, 'enroll-checkout').catch((err: unknown) => {
        logger.error('SHEETS_PUSH_FAILED', { meta: { enquiryId: enquiry.id, err: (err as Error).message } })
    })

    return {
        purchaseId: enquiry.id,
        orderId: order.id,
        amount: totalAmount,
        currency: course.currency,
        keyId: rp.keyId,
        courseTitle: course.title,
        courseId: course.id,
        paymentType: input.paymentType,
        priceMinor: chargedPriceMinor,
        gstAmount,
        totalAmount,
        fullCourseFeeMinor: fullPriceMinor,
        balanceMinor: isRegistration ? Math.max(fullPriceMinor - chargedPriceMinor, 0) : 0,
        tierKey: input.tierKey ?? tier?.key,
        tierLabel: resolvedTierLabel,
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
            loginUrl: `${config.STUDENT_PORTAL_URL}/login`,
            paymentType: intent.paymentType,
            amountPaidMinor: intent.totalAmount,
            balanceDueMinor: intent.paymentType === 'REGISTRATION' ? Math.max(intent.fullCourseFeeMinor - intent.priceMinor, 0) : 0
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
    const isRegistration = intent.paymentType === 'REGISTRATION'
    const balanceMinor = isRegistration ? Math.max(intent.fullCourseFeeMinor - intent.priceMinor, 0) : 0
    const balanceWithGst = isRegistration ? balanceMinor + Math.round((balanceMinor * 18) / 100) : 0

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

        // Resolve the access tier + demo expiry based on what the student
        // just paid. REGISTRATION → DEMO with optional expiry from
        // course.demoExpiryDays; FULL → unrestricted FULL access.
        // Re-enrolment (refund-then-rebuy edge) gets the same upgrade.
        const accessTier = isRegistration ? EnrollmentAccessTier.DEMO : EnrollmentAccessTier.FULL
        const courseRow = await tx.course.findUnique({
            where: { id: intent.courseId },
            select: { demoExpiryDays: true }
        })
        const demoExpiresAt =
            isRegistration && courseRow?.demoExpiryDays && courseRow.demoExpiryDays > 0
                ? new Date(Date.now() + courseRow.demoExpiryDays * 24 * 60 * 60 * 1000)
                : null

        const enrollment = await tx.enrollment.upsert({
            where: { tenantId_userId_courseId: { tenantId: enquiry.tenantId, userId: user.id, courseId: intent.courseId } },
            update: {
                status: EnrollmentStatus.ACTIVE,
                startedAt: new Date(),
                accessTier,
                demoExpiresAt
            },
            create: {
                tenantId: enquiry.tenantId,
                userId: user.id,
                courseId: intent.courseId,
                status: EnrollmentStatus.ACTIVE,
                accessTier,
                demoExpiresAt,
                startedAt: new Date()
            }
        })

        // Tenant-scoped, monotonic invoice numbers — mirrors the existing
        // payment service's pattern (count + 1, padded). Reserve two slots
        // when the registration path also writes a DUE invoice for the balance.
        const baseCount = await tx.invoice.count({ where: { tenantId: enquiry.tenantId } })
        const paidNumber = `ALB-${String(baseCount + 1).padStart(6, '0')}`

        const invoice = await tx.invoice.create({
            data: {
                tenantId: enquiry.tenantId,
                userId: user.id,
                enrollmentId: enrollment.id,
                number: paidNumber,
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

        let balanceInvoice: typeof invoice | null = null
        if (isRegistration && balanceMinor > 0) {
            const balanceNumber = `ALB-${String(baseCount + 2).padStart(6, '0')}`
            balanceInvoice = await tx.invoice.create({
                data: {
                    tenantId: enquiry.tenantId,
                    userId: user.id,
                    enrollmentId: enrollment.id,
                    number: balanceNumber,
                    amount: balanceMinor,
                    gstPercent: 18,
                    gstAmount: balanceWithGst - balanceMinor,
                    totalAmount: balanceWithGst,
                    currency: intent.currency,
                    gateway: PaymentGateway.RAZORPAY,
                    status: InvoiceStatus.DUE,
                    dueAt: null
                }
            })
        }

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

        return { user, enrollment, invoice, balanceInvoice, completedIntent }
    })

    // Outside the transaction — if the email queue is down we still want the
    // user account to exist. The enqueueNotification helper falls back to
    // inline processing so the Notification row + bell update still happen
    // even when the worker is unreachable.
    // Send students into the dashboard SPA (STUDENT_PORTAL_URL), not the
    // marketing landing site (PUBLIC_SITE_URL). The marketing site Sign-in
    // button already redirects there, but transactional URLs deep-link
    // directly to skip the bounce.
    const portal = config.STUDENT_PORTAL_URL
    const loginUrl = `${portal}/login`

    // Issue a one-time "set your new password" token. The student lands on
    // /student/set-password?token=… in the dashboard, picks a new password,
    // and is signed in. Defaults to 24h expiry — long enough that a delayed
    // email (spam folder, slow inbox sync) still works the next morning.
    const { token: resetToken } = await createPasswordResetToken(result.user.id, 'enrollment_welcome', 60 * 24)
    const setPasswordUrl = `${portal}/student/set-password?token=${encodeURIComponent(resetToken)}`

    // Tenant branding for the welcome email — pulled here so the queue job
    // body stays self-contained (the worker doesn't have to do another
    // tenant lookup to render the template).
    const tenant = await db.client.tenant.findUnique({
        where: { id: enquiry.tenantId },
        select: { name: true, brandingColor: true, brandingLogo: true }
    })

    await enqueueNotification({
        tenantId: enquiry.tenantId,
        userId: result.user.id,
        template: 'enrollment_credentials',
        data: {
            firstName: result.user.firstName,
            courseTitle: intent.courseTitle,
            email: result.user.email,
            tempPassword,
            loginUrl,
            setPasswordUrl,
            tenantName: tenant?.name ?? '',
            brandColor: tenant?.brandingColor ?? '#0d4f3c',
            brandLogo: tenant?.brandingLogo ?? null
        }
    })

    // Real-time push so the admin Payments page + Sales Funnel update
    // without a refresh — webhook fires the same event a moment later but
    // we don't need to wait for it.
    try {
        const { emitToTenant } = await import('../../service/socket')
        emitToTenant(enquiry.tenantId, 'payments:updated', {
            kind: 'captured',
            invoiceId: result.invoice.id,
            amount: intent.totalAmount,
            ts: Date.now()
        })
    } catch (err) {
        logger.warn('PURCHASE_SYNC_EMIT_FAILED', { meta: { err: (err as Error).message } })
    }

    // Heads-up to admin + manager + assigned counsellor that money landed.
    // Drives the funnel "live activity" tab + email digest. Best-effort:
    // failures are logged inside enqueueNotification and never thrown.
    const amountDisplay = `₹${(intent.totalAmount / 100).toLocaleString('en-IN')}`
    const studentDisplayName = `${result.user.firstName} ${result.user.lastName}`.trim()
    const stakeholderIds = await collectPaymentStakeholders(enquiry.tenantId, enquiry.assignedToId)
    for (const recipientId of stakeholderIds) {
        await enqueueNotification({
            tenantId: enquiry.tenantId,
            userId: recipientId,
            template: 'payment_received_admin',
            data: {
                studentName: studentDisplayName,
                courseTitle: intent.courseTitle,
                amountDisplay,
                method: intent.paymentType === 'REGISTRATION' ? 'ONLINE · registration' : 'ONLINE · full',
                invoiceNumber: result.invoice.number
            }
        })
    }

    return {
        enrolled: true,
        alreadyProcessed: false,
        courseTitle: intent.courseTitle,
        email: result.user.email,
        loginUrl,
        invoiceNumber: result.invoice.number,
        paymentType: intent.paymentType,
        amountPaidMinor: intent.totalAmount,
        balanceDueMinor: result.balanceInvoice?.totalAmount ?? 0,
        balanceInvoiceNumber: result.balanceInvoice?.number
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

// Resolve who should be notified when a public payment lands. Returns a
// dedup'd list of user ids: the assigned counsellor (if any), every ADMIN
// in the tenant, and every COUNSELLING_MANAGER. Suspended/deleted users
// are filtered out so we don't email shut-down accounts.
const collectPaymentStakeholders = async (tenantId: string, assignedCounsellorId: string | null | undefined): Promise<string[]> => {
    const staff = await db.client.user.findMany({
        where: {
            tenantId,
            role: { in: [Role.ADMIN, Role.COUNSELLING_MANAGER] },
            status: UserStatus.ACTIVE,
            deletedAt: null
        },
        select: { id: true }
    })
    const ids = new Set<string>(staff.map((u) => u.id))
    if (assignedCounsellorId) ids.add(assignedCounsellorId)
    return Array.from(ids)
}

// 12-character, mixed-case + digit random string. URL-safe alphabet so the
// password is easy to type from the email (no 0/O, l/1 confusion).
const generateTempPassword = (): string => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    const buf = crypto.randomBytes(12)
    let out = ''
    for (const byte of buf) out += alphabet[byte % alphabet.length]
    return out
}
