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

// SUPER_ADMIN cross-tenant listing — used by the SA panel (§4.1). Includes
// counts so the table can show "X users / Y courses" without N+1 round-trips.
export const listAllTenants = async () => {
    const rows = await db.client.tenant.findMany({
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

// Manual status flip (e.g. mark a wire transfer as PAID without going through
// Razorpay). The Razorpay-driven happy path will update via webhook + a
// separate verify endpoint in the next batch.
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

export const updateBranding = async (tenantId: string, input: TUpdateTenantBrandingInput) => {
    const data: Prisma.TenantUpdateInput = {}
    if (input.name !== undefined) data.name = input.name
    if (input.brandingLogo !== undefined) data.brandingLogo = input.brandingLogo
    if (input.brandingColor !== undefined) data.brandingColor = input.brandingColor
    if (input.settings !== undefined) data.settings = input.settings as Prisma.InputJsonValue

    const tenant = await db.client.tenant.update({ where: { id: tenantId }, data })
    return tenant
}
