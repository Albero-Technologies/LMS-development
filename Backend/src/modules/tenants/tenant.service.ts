import { AuthProvider, type Prisma, Role, TenantStatus, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { hashPassword } from '../../util/password'
import { type TCreateTenantInput, type TUpdateTenantBrandingInput } from './tenant.schema'

// Bootstrap a tenant with its first admin — a single transaction so a failed admin create
// never leaves a tenant orphaned.
export const createTenant = async (input: TCreateTenantInput) => {
    const existing = await db.client.tenant.findUnique({ where: { slug: input.slug } })
    if (existing) throw AppError.conflict(responseMessage.ALREADY_EXISTS('Tenant'), 'TENANT_EXISTS')

    const adminPasswordHash = await hashPassword(input.adminPassword)

    return db.client.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                name: input.name,
                slug: input.slug,
                plan: input.plan || 'FREE',
                status: TenantStatus.ACTIVE,
                brandingLogo: input.brandingLogo,
                brandingColor: input.brandingColor
            }
        })

        const admin = await tx.user.create({
            data: {
                tenantId: tenant.id,
                email: input.adminEmail.toLowerCase(),
                passwordHash: adminPasswordHash,
                firstName: input.adminFirstName,
                lastName: input.adminLastName,
                role: Role.ADMIN,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                provider: AuthProvider.LOCAL
            }
        })

        return { tenant, admin: { id: admin.id, email: admin.email, role: admin.role } }
    })
}

export const getTenant = async (tenantId: string) => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    return tenant
}

// The platform tenant (§3.3) is where SUPER_ADMIN identities live. It must
// never appear in the cross-tenant SA listing, never be exposed via the public
// slug endpoint, and never be reachable by tenant-scoped business logic.
export const PLATFORM_TENANT_SLUG = 'platform'

// Public read for the website renderer — given a tenant slug + collection
// slug, return only published items (no drafts). No auth; the tenant slug
// in the URL is the only access control needed for content marked public.
export const listPublicCollectionItems = async (tenantSlug: string, collectionSlug: string) => {
    if (tenantSlug === PLATFORM_TENANT_SLUG) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    const tenant = await db.client.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    const collection = await db.client.collection.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug: collectionSlug } },
        include: {
            items: {
                where: { published: true },
                orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
            }
        }
    })
    if (!collection) throw AppError.notFound(responseMessage.NOT_FOUND('Collection'), 'COLLECTION_NOT_FOUND')
    return {
        id: collection.id,
        slug: collection.slug,
        name: collection.name,
        fields: collection.fields,
        items: collection.items
    }
}

// Public detail read for a single published item — used by blog/resource
// detail pages on the marketing site. Drafts (`published: false`) are hidden
// even with a direct slug, so unfinished posts don't leak.
export const getPublicCollectionItem = async (tenantSlug: string, collectionSlug: string, itemSlug: string) => {
    if (tenantSlug === PLATFORM_TENANT_SLUG) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    const tenant = await db.client.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    const collection = await db.client.collection.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug: collectionSlug } },
        select: { id: true, slug: true, name: true, fields: true }
    })
    if (!collection) throw AppError.notFound(responseMessage.NOT_FOUND('Collection'), 'COLLECTION_NOT_FOUND')
    const item = await db.client.collectionItem.findFirst({
        where: { collectionId: collection.id, slug: itemSlug, published: true }
    })
    if (!item) throw AppError.notFound(responseMessage.NOT_FOUND('Item'), 'ITEM_NOT_FOUND')
    return { collection, item }
}

// Public lookup by slug. Returns only the safe-to-expose subset that the
// per-tenant landing page needs to render branding without leaking SA-only
// fields (settings, plan, status). The `landing` JSON sub-key IS surfaced
// because that's literally the landing page's content. Everything else
// (environment secrets, billing, contacts, notes) stays private.
export const getPublicTenantBySlug = async (slug: string) => {
    if (slug === PLATFORM_TENANT_SLUG) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    const tenant = await db.client.tenant.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true, brandingLogo: true, brandingColor: true, status: true, settings: true }
    })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    if (tenant.status === 'SUSPENDED') throw AppError.forbidden('Tenant is suspended', 'TENANT_SUSPENDED')
    const landing = (tenant.settings as { landing?: unknown } | null)?.landing ?? null
    return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        brandingLogo: tenant.brandingLogo,
        brandingColor: tenant.brandingColor,
        landing
    }
}

// SUPER_ADMIN client-payments aggregate (§4.4). Returns one row per tenant
// with their total outstanding TenantPayment balance + last paid date so the
// SA can chase up overdue tenants from a single view.
export const listClientPaymentsSummary = async () => {
    const tenants = await db.client.tenant.findMany({
        where: { slug: { not: PLATFORM_TENANT_SLUG } },
        select: {
            id: true,
            name: true,
            slug: true,
            settings: true,
            saasPayments: { select: { amount: true, status: true, paidAt: true, periodEnd: true, createdAt: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    const now = Date.now()
    return tenants.map((t) => {
        const payments = t.saasPayments
        const outstanding = payments.filter((p) => p.status === 'PENDING' || p.status === 'FAILED').reduce((n, p) => n + p.amount, 0)
        const overdueCount = payments.filter(
            (p) => (p.status === 'PENDING' || p.status === 'FAILED') && p.periodEnd && p.periodEnd.getTime() < now
        ).length
        const pendingCount = payments.filter((p) => p.status === 'PENDING').length
        const lastPaid = payments
            .filter((p): p is typeof p & { paidAt: Date } => p.status === 'PAID' && p.paidAt !== null)
            .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())[0]
        const contacts = (t.settings as { contacts?: { primaryEmail?: string; primaryPhone?: string } } | null)?.contacts
        return {
            id: t.id,
            name: t.name,
            slug: t.slug,
            outstanding,
            overdueCount,
            pendingCount,
            lastPaidAt: lastPaid ? lastPaid.paidAt.toISOString() : null,
            contactEmail: contacts?.primaryEmail ?? null,
            contactPhone: contacts?.primaryPhone ?? null
        }
    })
}

// SUPER_ADMIN cross-tenant listing — used by the SA panel (§4.1). Includes
// counts so the table can show "X users / Y courses" without N+1 round-trips.
// The platform tenant is filtered out — SAs aren't supposed to see their own
// internal tenant in the customer-tenant pickers.
export const listAllTenants = async () => {
    const rows = await db.client.tenant.findMany({
        where: { slug: { not: PLATFORM_TENANT_SLUG } },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { users: true, courses: true } }
        }
    })
    return rows.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        status: t.status,
        brandingLogo: t.brandingLogo,
        brandingColor: t.brandingColor,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        userCount: t._count.users,
        courseCount: t._count.courses
    }))
}

// SUPER_ADMIN tenant detail — overview-tab payload. Returns the tenant + the
// first ADMIN user (the contact person), counts, and full settings JSON.
export const getTenantDetail = async (tenantId: string) => {
    const tenant = await db.client.tenant.findUnique({
        where: { id: tenantId },
        include: {
            _count: { select: { users: true, courses: true, enquiries: true, tickets: true } }
        }
    })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')

    const admin = await db.client.user.findFirst({
        where: { tenantId, role: 'ADMIN', deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, lastLoginAt: true, createdAt: true }
    })

    return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        brandingLogo: tenant.brandingLogo,
        brandingColor: tenant.brandingColor,
        settings: tenant.settings,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        admin,
        counts: {
            users: tenant._count.users,
            courses: tenant._count.courses,
            enquiries: tenant._count.enquiries,
            tickets: tenant._count.tickets
        }
    }
}

export const setTenantStatus = async (tenantId: string, status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL') => {
    const tenant = await db.client.tenant.update({
        where: { id: tenantId },
        data: { status }
    })
    return tenant
}

// SUPER_ADMIN — send a billing reminder to a tenant (§4.2). Triggers an email
// + an in-app notification through the existing queue, and appends a Note for
// the audit trail so subsequent SAs can see what was sent and when.
export interface TBillingReminderInput {
    amount?: number
    currency?: string
    dueDate?: string
    planLabel?: string
    note?: string
    senderId: string
    senderName: string
}

export const sendBillingReminder = async (tenantId: string, input: TBillingReminderInput) => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')

    const admin = await db.client.user.findFirst({
        where: { tenantId, role: 'ADMIN', deletedAt: null },
        orderBy: { createdAt: 'asc' }
    })

    // Resolve recipient: prefer the tenant's contact email if configured, else the
    // first ADMIN's email. Always queue an in-app notification for the admin user.
    const settings = (tenant.settings as { contacts?: { primaryEmail?: string } } | null) ?? null
    const toEmail = settings?.contacts?.primaryEmail || admin?.email
    if (!toEmail) {
        throw AppError.badRequest('Tenant has no contact email or ADMIN user — set a primary contact in the Contacts tab first.', 'TENANT_NO_CONTACT')
    }

    // Import locally to avoid a circular import between tenants and notifications.
    const { notifyQueue, NOTIFY_JOB } = await import('../notifications/notification.queue')

    await notifyQueue.add(NOTIFY_JOB, {
        tenantId,
        userId: admin?.id,
        toEmail: admin ? undefined : toEmail,
        toName: admin ? undefined : tenant.name,
        template: 'billing_reminder',
        data: {
            amount: input.amount,
            currency: input.currency ?? 'INR',
            dueDate: input.dueDate,
            planLabel: input.planLabel ?? tenant.plan,
            note: input.note
        }
    })

    // Append a note to the tenant's settings.notes for the audit trail.
    interface NoteRow {
        id: string
        body: string
        createdAt: string
        createdBy?: { id: string; name: string }
    }
    const existingNotes = Array.isArray((tenant.settings as { notes?: unknown[] } | null)?.notes)
        ? ((tenant.settings as { notes: unknown[] }).notes as NoteRow[])
        : []
    const bodyParts = [
        `Billing reminder sent to ${toEmail}.`,
        input.amount ? ` Amount: ${input.currency ?? 'INR'} ${input.amount}.` : '',
        input.dueDate ? ` Due ${input.dueDate}.` : '',
        input.planLabel ? ` Plan: ${input.planLabel}.` : '',
        input.note ? `\n\nMessage:\n${input.note}` : ''
    ]
    const noteEntry: NoteRow = {
        id: `rmd-${Date.now()}`,
        body: bodyParts.join(''),
        createdAt: new Date().toISOString(),
        createdBy: { id: input.senderId, name: input.senderName }
    }
    const nextSettings = {
        ...((tenant.settings as Record<string, unknown> | null) ?? {}),
        notes: [noteEntry, ...existingNotes]
    }
    await db.client.tenant.update({
        where: { id: tenantId },
        data: { settings: nextSettings as unknown as Prisma.InputJsonValue }
    })

    return { sentTo: toEmail, queued: true }
}

// ---- Tenant SaaS billing (§4.4 + §10.2) ------------------------------------

export interface TCreateTenantPaymentInput {
    amount: number // paise
    currency?: string
    planLabel?: string
    periodStart?: Date
    periodEnd?: Date
    description?: string
    createdById: string
}

export const createTenantPayment = async (tenantId: string, input: TCreateTenantPaymentInput) => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')

    return db.client.tenantPayment.create({
        data: {
            tenantId,
            amount: input.amount,
            currency: input.currency ?? 'INR',
            planLabel: input.planLabel,
            periodStart: input.periodStart,
            periodEnd: input.periodEnd,
            description: input.description,
            createdById: input.createdById
        }
    })
}

export const listTenantPayments = async (tenantId: string) => {
    return db.client.tenantPayment.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
    })
}

// Manual status flip (e.g. mark a wire transfer as PAID outside Razorpay).
export const setTenantPaymentStatus = async (
    tenantId: string,
    paymentId: string,
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
) => {
    const payment = await db.client.tenantPayment.findFirst({ where: { id: paymentId, tenantId } })
    if (!payment) throw AppError.notFound(responseMessage.NOT_FOUND('Payment'), 'PAYMENT_NOT_FOUND')

    return db.client.tenantPayment.update({
        where: { id: paymentId },
        data: {
            status,
            paidAt: status === 'PAID' ? (payment.paidAt ?? new Date()) : null
        }
    })
}

// Tenant ADMIN flow (§10.2). Creates a Razorpay order for one of THEIR PENDING
// SaaS invoices so they can pay via the embedded checkout. Reuses an existing
// order if one has already been issued (idempotent).
export const createTenantPaymentOrder = async (tenantId: string, paymentId: string) => {
    const payment = await db.client.tenantPayment.findFirst({ where: { id: paymentId, tenantId } })
    if (!payment) throw AppError.notFound(responseMessage.NOT_FOUND('Payment'), 'PAYMENT_NOT_FOUND')
    if (payment.status === 'PAID') throw AppError.conflict('Already paid', 'PAYMENT_PAID')
    if (payment.status === 'CANCELLED' || payment.status === 'REFUNDED') {
        throw AppError.badRequest('This payment is no longer collectable', 'PAYMENT_CLOSED')
    }
    if (payment.amount <= 0) throw AppError.badRequest('Nothing to charge', 'PAYMENT_ZERO')

    // Lazy-import the Razorpay client to keep the tenants module decoupled.
    const { getRazorpay } = await import('../payments/razorpay.client')
    const rp = getRazorpay()

    let orderId = payment.gatewayOrderId
    if (!orderId) {
        const order = await rp.orders.create({
            amount: payment.amount,
            currency: payment.currency,
            receipt: `saas-${payment.id.slice(0, 12)}`,
            notes: { tenantId, paymentId, kind: 'tenant_saas' }
        })
        orderId = order.id
        await db.client.tenantPayment.update({
            where: { id: paymentId },
            data: { gatewayOrderId: orderId, gateway: 'RAZORPAY' }
        })
    }

    return {
        paymentId: payment.id,
        order: {
            id: orderId,
            amount: payment.amount,
            currency: payment.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        }
    }
}

// Tenant ADMIN: verify the Razorpay handshake after the user completes checkout.
export const verifyTenantPaymentSignature = async (
    tenantId: string,
    paymentId: string,
    input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
) => {
    const payment = await db.client.tenantPayment.findFirst({ where: { id: paymentId, tenantId } })
    if (!payment) throw AppError.notFound(responseMessage.NOT_FOUND('Payment'), 'PAYMENT_NOT_FOUND')
    if (payment.status === 'PAID') return payment
    if (payment.gatewayOrderId !== input.razorpayOrderId) {
        throw AppError.badRequest('Order id mismatch', 'PAYMENT_ORDER_MISMATCH')
    }

    const { verifyPaymentSignature } = await import('../payments/razorpay.client')
    // SaaS billing always uses the platform Razorpay account, so no tenantId here.
    const ok = await verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature)
    if (!ok) throw AppError.badRequest(responseMessage.PAYMENT_VERIFICATION_FAILED, 'SIGNATURE_INVALID')

    return db.client.tenantPayment.update({
        where: { id: paymentId },
        data: {
            status: 'PAID',
            gatewayPaymentId: input.razorpayPaymentId,
            paidAt: new Date()
        }
    })
}

// List the current tenant's own SaaS invoices (for tenant ADMIN's billing page).
export const listMyTenantPayments = async (tenantId: string) => {
    return db.client.tenantPayment.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
    })
}

export const updateBranding = async (tenantId: string, input: TUpdateTenantBrandingInput) => {
    const data: Prisma.TenantUpdateInput = {}
    if (input.name !== undefined) data.name = input.name
    if (input.brandingLogo !== undefined) data.brandingLogo = input.brandingLogo
    if (input.brandingColor !== undefined) data.brandingColor = input.brandingColor
    if (input.settings !== undefined) data.settings = input.settings as Prisma.InputJsonValue

    const tenant = await db.client.tenant.update({ where: { id: tenantId }, data })
    return tenant
}
