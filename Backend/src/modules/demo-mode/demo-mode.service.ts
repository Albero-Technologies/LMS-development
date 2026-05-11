import { EnrollmentAccessTier, type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { enqueueNotification } from '../notifications/notification.queue'
import type { TBulkUpdateDemoInput, TListDemoEnrolmentsInput, TSendPaymentReminderInput, TUpdateDemoEnrolmentInput } from './demo-mode.schema'

interface ScopeContext {
    role: Role
    tenantId: string
    userId: string
}

const READ_ROLES = [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLING_MANAGER, Role.COUNSELLOR] as const
const WRITE_ROLES = [Role.SUPER_ADMIN, Role.ADMIN] as const

const ensureCanRead = (role: Role) => {
    if (!(READ_ROLES as readonly Role[]).includes(role)) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')
    }
}

const ensureCanWrite = (role: Role) => {
    if (!(WRITE_ROLES as readonly Role[]).includes(role)) {
        throw AppError.forbidden('Only admins can edit demo configuration', 'ROLE_FORBIDDEN')
    }
}

const resolveTenantScope = async (slug: string | undefined, ctx: ScopeContext): Promise<{ tenantId?: string; tenant?: Prisma.TenantWhereInput }> => {
    if (ctx.role !== Role.SUPER_ADMIN) return { tenantId: ctx.tenantId }
    if (!slug || slug === '__all__') return { tenant: { slug: { not: 'platform' } } }
    const tenant = await db.client.tenant.findUnique({ where: { slug } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    return { tenantId: tenant.id }
}

const fmtName = (u: { firstName: string; lastName: string }): string => `${u.firstName} ${u.lastName}`.trim() || '—'

export const listDemoEnrolments = async (input: TListDemoEnrolmentsInput, ctx: ScopeContext) => {
    ensureCanRead(ctx.role)

    const tenantScope = await resolveTenantScope(input.tenantSlug, ctx)
    const where: Prisma.EnrollmentWhereInput = {
        ...tenantScope,
        deletedAt: null
    }
    if (input.accessTier) where.accessTier = input.accessTier as EnrollmentAccessTier
    if (input.courseId) where.courseId = input.courseId
    if (input.q) {
        const q = input.q
        where.user = {
            OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } }
            ]
        }
    }

    const [items, total] = await Promise.all([
        db.client.enrollment.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true } },
                course: { select: { id: true, title: true, demoEnabled: true, demoLessonDefault: true, demoExpiryDays: true } },
                tenant: { select: { id: true, name: true, slug: true } },
                invoices: { select: { totalAmount: true, status: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize
        }),
        db.client.enrollment.count({ where })
    ])

    return {
        items: items.map((e) => {
            const totalPaid = e.invoices.filter((i) => i.status === 'PAID').reduce((n, i) => n + i.totalAmount, 0)
            const pendingAmount = e.invoices.filter((i) => i.status === 'DUE' || i.status === 'DRAFT').reduce((n, i) => n + i.totalAmount, 0)
            return {
                id: e.id,
                tenantId: e.tenantId,
                tenant: e.tenant,
                user: { id: e.user.id, name: fmtName(e.user), email: e.user.email, lastLoginAt: e.user.lastLoginAt?.toISOString() ?? null },
                course: e.course,
                accessTier: e.accessTier,
                status: e.status,
                progressPct: e.progressPct,
                demoLessonLimit: e.demoLessonLimit,
                demoLessonAllowlist: e.demoLessonAllowlist,
                demoExpiresAt: e.demoExpiresAt?.toISOString() ?? null,
                manualUpgradeAt: e.manualUpgradeAt?.toISOString() ?? null,
                manualUpgradeReason: e.manualUpgradeReason,
                paymentStatus: pendingAmount > 0 ? 'PENDING' : totalPaid > 0 ? 'PAID' : 'NONE',
                pendingAmount,
                totalPaid,
                createdAt: e.createdAt.toISOString()
            }
        }),
        total,
        page: input.page,
        pageSize: input.pageSize
    }
}

const applyDemoUpdate = async (enrolmentId: string, ctx: ScopeContext, input: TUpdateDemoEnrolmentInput, options: { auditNote?: string } = {}) => {
    const enrolment = await db.client.enrollment.findFirst({
        where: { id: enrolmentId, ...(ctx.role === Role.SUPER_ADMIN ? {} : { tenantId: ctx.tenantId }) }
    })
    if (!enrolment) throw AppError.notFound(responseMessage.NOT_FOUND('Enrolment'), 'ENROLMENT_NOT_FOUND')

    const data: Prisma.EnrollmentUpdateInput = {}
    let upgradedToFull = false

    if (input.accessTier !== undefined) {
        data.accessTier = input.accessTier
        if (input.accessTier === EnrollmentAccessTier.FULL && enrolment.accessTier !== EnrollmentAccessTier.FULL) {
            upgradedToFull = true
            data.manualUpgradeAt = new Date()
            data.manualUpgradeReason = input.manualUpgradeReason ?? options.auditNote ?? null
            data.manualUpgradeById = ctx.userId
            data.demoExpiresAt = null
        }
    }
    if (input.demoLessonLimit !== undefined) data.demoLessonLimit = input.demoLessonLimit
    if (input.demoLessonAllowlist !== undefined) data.demoLessonAllowlist = input.demoLessonAllowlist
    if (input.demoExpiresAt !== undefined) data.demoExpiresAt = input.demoExpiresAt ? new Date(input.demoExpiresAt) : null

    const updated = await db.client.enrollment.update({ where: { id: enrolment.id }, data })
    return { updated, upgradedToFull }
}

export const updateDemoEnrolment = async (enrolmentId: string, input: TUpdateDemoEnrolmentInput, ctx: ScopeContext) => {
    ensureCanWrite(ctx.role)

    if (input.accessTier === EnrollmentAccessTier.FULL && (!input.manualUpgradeReason || input.manualUpgradeReason.trim() === '')) {
        throw AppError.badRequest('Force-upgrading to FULL requires a reason for the audit log', 'UPGRADE_REASON_REQUIRED')
    }

    const result = await applyDemoUpdate(enrolmentId, ctx, input)

    // Live-unlock notification when an admin force-upgrades. Mirrors the
    // Razorpay webhook path so the student gets the same toast on their
    // open dashboard tab.
    if (result.upgradedToFull) {
        try {
            const { emitToUser } = await import('../../service/socket')
            emitToUser(result.updated.userId, 'enrollment:unlocked', {
                enrollmentId: result.updated.id,
                courseId: result.updated.courseId,
                manual: true,
                ts: Date.now()
            })
        } catch {
            /* socket optional; never block the write */
        }
    }
    return result.updated
}

export const bulkUpdateDemo = async (input: TBulkUpdateDemoInput, ctx: ScopeContext) => {
    ensureCanWrite(ctx.role)
    if (input.accessTier === EnrollmentAccessTier.FULL && (!input.manualUpgradeReason || input.manualUpgradeReason.trim() === '')) {
        throw AppError.badRequest('Force-upgrading to FULL requires a reason', 'UPGRADE_REASON_REQUIRED')
    }

    const ok: string[] = []
    const failed: { id: string; reason: string }[] = []
    for (const id of input.enrolmentIds) {
        try {
            await applyDemoUpdate(id, ctx, {
                accessTier: input.accessTier,
                demoLessonLimit: input.demoLessonLimit,
                manualUpgradeReason: input.manualUpgradeReason
            })
            ok.push(id)
        } catch (err) {
            failed.push({ id, reason: err instanceof Error ? err.message : 'unknown' })
        }
    }
    return { ok, failed, totalRequested: input.enrolmentIds.length }
}

export const sendPaymentReminder = async (input: TSendPaymentReminderInput, ctx: ScopeContext) => {
    ensureCanWrite(ctx.role)

    const enrolment = await db.client.enrollment.findFirst({
        where: { id: input.enrolmentId, ...(ctx.role === Role.SUPER_ADMIN ? {} : { tenantId: ctx.tenantId }) },
        include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
            course: { select: { title: true } },
            invoices: { select: { totalAmount: true, status: true, number: true } }
        }
    })
    if (!enrolment) throw AppError.notFound(responseMessage.NOT_FOUND('Enrolment'), 'ENROLMENT_NOT_FOUND')

    const pendingAmount = enrolment.invoices.filter((i) => i.status === 'DUE' || i.status === 'DRAFT').reduce((n, i) => n + i.totalAmount, 0)

    await enqueueNotification({
        tenantId: enrolment.tenantId,
        userId: enrolment.user.id,
        template: 'billing_reminder',
        data: {
            firstName: enrolment.user.firstName,
            amount: `${(pendingAmount / 100).toLocaleString('en-IN')}`,
            currency: 'INR',
            planLabel: enrolment.course.title,
            note: input.note ?? '',
            tenantName: ''
        }
    })
    return { ok: true, sentTo: enrolment.user.email, pendingAmount }
}
