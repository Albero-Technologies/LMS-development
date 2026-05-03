import { EnrollmentStatus, EnquiryStage, InvoiceStatus, type Prisma, Role, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import type { TListStudentsInput, TTeamBucketsInput, TStatsTimelineInput, StudentCategory } from './students-monitor.schema'

// 30 days of inactivity flips a user from ACTIVE → INACTIVE for monitoring
// purposes. Keep this single constant — counsellor follow-up cadence is
// trained around it (the email we send when a student crosses this line).
const INACTIVITY_DAYS = 30
const INACTIVITY_MS = INACTIVITY_DAYS * 24 * 60 * 60 * 1000

interface ScopeContext {
    role: Role
    tenantId: string
    userId: string
}

// Resolve the tenant filter for the actor. SA can pick any tenant via
// tenantSlug ("__all__" disables the filter); everyone else is locked to
// their own tenant — silently ignoring slugs they shouldn't see.
const resolveTenantScope = async (slug: string | undefined, ctx: ScopeContext): Promise<{ tenantWhere: Prisma.UserWhereInput; tenantId: string | null }> => {
    if (ctx.role === Role.SUPER_ADMIN) {
        if (!slug || slug === '__all__') {
            return { tenantWhere: { tenant: { slug: { not: 'platform' } } }, tenantId: null }
        }
        const tenant = await db.client.tenant.findUnique({ where: { slug } })
        if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
        return { tenantWhere: { tenantId: tenant.id }, tenantId: tenant.id }
    }
    return { tenantWhere: { tenantId: ctx.tenantId }, tenantId: ctx.tenantId }
}

// Counsellor scoping. COUNSELLOR sees only their own students; MANAGER sees
// their team's; ADMIN+ sees everything in the tenant unless they pass
// `counsellorId` to drill in.
const buildCounsellorFilter = async (
    ctx: ScopeContext,
    explicitCounsellorId: string | undefined
): Promise<{ counsellorIds: string[] | null; trainerId: string | null }> => {
    if (ctx.role === Role.COUNSELLOR) {
        return { counsellorIds: [ctx.userId], trainerId: null }
    }
    if (ctx.role === Role.COUNSELLING_MANAGER) {
        const team = await db.client.user.findMany({
            where: { tenantId: ctx.tenantId, managerId: ctx.userId, role: Role.COUNSELLOR, deletedAt: null },
            select: { id: true }
        })
        const ids = [ctx.userId, ...team.map((u) => u.id)]
        if (explicitCounsellorId && ids.includes(explicitCounsellorId)) return { counsellorIds: [explicitCounsellorId], trainerId: null }
        return { counsellorIds: ids, trainerId: null }
    }
    if (ctx.role === Role.TRAINER) {
        return { counsellorIds: null, trainerId: ctx.userId }
    }
    if (explicitCounsellorId && (ctx.role === Role.ADMIN || ctx.role === Role.SUPER_ADMIN)) {
        return { counsellorIds: [explicitCounsellorId], trainerId: null }
    }
    return { counsellorIds: null, trainerId: null }
}

// Roles allowed to see this view at all. SUPPORT and STUDENT are excluded.
const isMonitorRole = (role: Role): boolean =>
    role === Role.SUPER_ADMIN || role === Role.ADMIN || role === Role.COUNSELLING_MANAGER || role === Role.COUNSELLOR || role === Role.TRAINER

interface StudentRow {
    id: string
    name: string
    email: string
    phone: string | null
    status: UserStatus
    createdAt: string
    lastLoginAt: string | null
    tenant: { id: string; name: string; slug: string }
    counsellor: { id: string; name: string; email: string } | null
    trainer: { id: string; name: string; email: string } | null
    enrollments: { id: string; status: string; progressPct: number; course: { id: string; title: string } | null }[]
    payments: { totalPaid: number; pendingAmount: number; paidCount: number; pendingCount: number }
    primaryCategory: StudentCategory
    flags: Record<StudentCategory, boolean>
}

const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`.trim() || '—'

// Resolve the primary category from the derived flags. Priority:
//   DEAD → FEES_PENDING → FOLLOW_UP → INACTIVE → FEES_PAID → ACTIVE
// Order picked so the loudest signal wins — a suspended student is always
// DEAD even if they technically paid; a fees-pending student outranks an
// "active" tag because the counsellor needs to know about the balance.
const resolveCategory = (flags: Record<StudentCategory, boolean>): StudentCategory => {
    if (flags.DEAD) return 'DEAD'
    if (flags.FEES_PENDING) return 'FEES_PENDING'
    if (flags.FOLLOW_UP) return 'FOLLOW_UP'
    if (flags.INACTIVE) return 'INACTIVE'
    if (flags.FEES_PAID) return 'FEES_PAID'
    return 'ACTIVE'
}

const computeFlags = (
    user: { status: UserStatus; lastLoginAt: Date | null; createdAt: Date },
    payments: { totalPaid: number; pendingAmount: number; pendingCount: number; paidCount: number },
    enrollments: { status: string; progressPct: number }[],
    enquiryStage: EnquiryStage | null
): Record<StudentCategory, boolean> => {
    const now = Date.now()
    const recentLogin = user.lastLoginAt ? now - user.lastLoginAt.getTime() < INACTIVITY_MS : false
    const hasActiveEnrolment = enrollments.some((e) => e.status === EnrollmentStatus.ACTIVE)
    const allEnrolmentsCompleted = enrollments.length > 0 && enrollments.every((e) => e.status === EnrollmentStatus.COMPLETED)

    const dead = user.status === UserStatus.SUSPENDED || enquiryStage === EnquiryStage.LOST
    const feesPending = payments.pendingAmount > 0 || payments.pendingCount > 0
    const feesPaid = !feesPending && payments.paidCount > 0
    const inactive = !dead && !recentLogin
    const active = !dead && !inactive && hasActiveEnrolment
    // Follow-up: no enrolment yet, OR low progress + stale activity, OR
    // sitting in a counselling stage that demands attention.
    const followUp =
        !dead &&
        !active &&
        !allEnrolmentsCompleted &&
        (enrollments.length === 0 || (!recentLogin && enrollments.some((e) => e.progressPct < 30)) || enquiryStage === EnquiryStage.NEW || enquiryStage === EnquiryStage.DEMO_SCHEDULED)

    return { ACTIVE: active, INACTIVE: inactive, FEES_PAID: feesPaid, FEES_PENDING: feesPending, FOLLOW_UP: followUp, DEAD: dead }
}

interface StudentAggregate {
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
        phone: string | null
        status: UserStatus
        lastLoginAt: Date | null
        createdAt: Date
        tenant: { id: string; name: string; slug: string }
    }
    enrollments: {
        id: string
        status: EnrollmentStatus
        progressPct: number
        course: { id: string; title: string; trainerId: string | null; trainer: { id: string; firstName: string; lastName: string; email: string } | null } | null
    }[]
    invoices: { totalAmount: number; status: InvoiceStatus }[]
    counsellor: { id: string; firstName: string; lastName: string; email: string } | null
    enquiryStage: EnquiryStage | null
}

export const listStudents = async (input: TListStudentsInput, ctx: ScopeContext) => {
    if (!isMonitorRole(ctx.role)) throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')

    const { tenantWhere } = await resolveTenantScope(input.tenantSlug, ctx)
    const { counsellorIds, trainerId } = await buildCounsellorFilter(ctx, input.counsellorId)

    // Build the raw User predicate. We pull every STUDENT in scope and
    // filter by category client-side — categories are derived from joined
    // data (invoices + enrolments + enquiries) so a SQL-only filter would
    // leak abstraction into half a dozen places.
    const userWhere: Prisma.UserWhereInput = {
        ...tenantWhere,
        role: Role.STUDENT,
        deletedAt: null
    }

    if (input.q) {
        const q = input.q
        userWhere.OR = [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } }
        ]
    }

    if (counsellorIds && counsellorIds.length > 0) {
        userWhere.studentSignup = { is: { counsellorId: { in: counsellorIds } } }
    }

    if (trainerId) {
        userWhere.enrollments = {
            some: { course: { trainerId } }
        }
    }

    // Pull in one shot — pagination happens after categorisation since the
    // category filter can prune the page count. We cap at pageSize * 5 so a
    // page of FEES_PENDING students doesn't require scanning the entire tenant.
    const limit = input.pageSize * 5
    const offset = (input.page - 1) * input.pageSize

    const users = await db.client.user.findMany({
        where: userWhere,
        include: {
            tenant: { select: { id: true, name: true, slug: true } },
            studentSignup: {
                select: {
                    counsellorId: true,
                    counsellor: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
            },
            enrollments: {
                where: { deletedAt: null },
                select: {
                    id: true,
                    status: true,
                    progressPct: true,
                    course: {
                        select: {
                            id: true,
                            title: true,
                            trainerId: true,
                            trainer: { select: { id: true, firstName: true, lastName: true, email: true } }
                        }
                    }
                }
            },
            invoices: {
                select: { totalAmount: true, status: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    })

    // Pull related enquiries in one query keyed by email (cheaper than joining
    // for every row). Enquiries don't always have a userId, but they are
    // tenant-scoped + email-keyed by the public-purchase + onboarding flows.
    const tenantIds = Array.from(new Set(users.map((u) => u.tenantId)))
    const emails = users.map((u) => u.email)
    const enquiries = await db.client.enquiry.findMany({
        where: {
            tenantId: { in: tenantIds },
            email: { in: emails }
        },
        select: { tenantId: true, email: true, stage: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    })
    const stageByKey = new Map<string, EnquiryStage>()
    for (const e of enquiries) {
        const key = `${e.tenantId}|${e.email}`
        if (!stageByKey.has(key)) stageByKey.set(key, e.stage)
    }

    const aggregates: StudentAggregate[] = users.map((u) => ({
        user: {
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phone: u.phone,
            status: u.status,
            lastLoginAt: u.lastLoginAt,
            createdAt: u.createdAt,
            tenant: u.tenant
        },
        enrollments: u.enrollments,
        invoices: u.invoices,
        counsellor: u.studentSignup?.counsellor ?? null,
        enquiryStage: stageByKey.get(`${u.tenantId}|${u.email}`) ?? null
    }))

    const rows: StudentRow[] = aggregates.map((agg) => {
        const totalPaid = agg.invoices.filter((i) => i.status === InvoiceStatus.PAID).reduce((n, i) => n + i.totalAmount, 0)
        const pendingAmount = agg.invoices.filter((i) => i.status === InvoiceStatus.DUE || i.status === InvoiceStatus.DRAFT).reduce((n, i) => n + i.totalAmount, 0)
        const paidCount = agg.invoices.filter((i) => i.status === InvoiceStatus.PAID).length
        const pendingCount = agg.invoices.filter((i) => i.status === InvoiceStatus.DUE || i.status === InvoiceStatus.DRAFT).length
        const payments = { totalPaid, pendingAmount, paidCount, pendingCount }
        const flags = computeFlags(agg.user, payments, agg.enrollments, agg.enquiryStage)
        const trainerCandidate = agg.enrollments.find((e) => e.course?.trainer)?.course?.trainer ?? null

        return {
            id: agg.user.id,
            name: fullName(agg.user),
            email: agg.user.email,
            phone: agg.user.phone,
            status: agg.user.status,
            createdAt: agg.user.createdAt.toISOString(),
            lastLoginAt: agg.user.lastLoginAt?.toISOString() ?? null,
            tenant: agg.user.tenant,
            counsellor: agg.counsellor ? { id: agg.counsellor.id, name: fullName(agg.counsellor), email: agg.counsellor.email } : null,
            trainer: trainerCandidate ? { id: trainerCandidate.id, name: fullName(trainerCandidate), email: trainerCandidate.email } : null,
            enrollments: agg.enrollments.map((e) => ({
                id: e.id,
                status: e.status,
                progressPct: e.progressPct,
                course: e.course ? { id: e.course.id, title: e.course.title } : null
            })),
            payments,
            primaryCategory: resolveCategory(flags),
            flags
        }
    })

    const categoryFilter = input.category
    const filtered = categoryFilter ? rows.filter((r) => r.flags[categoryFilter]) : rows
    const paged = filtered.slice(offset, offset + input.pageSize)

    // Summary counters across the *unfiltered* pull so the tabs reflect the
    // full bucket sizes regardless of which category the user selected.
    const totals: Record<StudentCategory, number> = { ACTIVE: 0, INACTIVE: 0, FEES_PAID: 0, FEES_PENDING: 0, FOLLOW_UP: 0, DEAD: 0 }
    for (const r of rows) {
        ;(Object.keys(r.flags) as StudentCategory[]).forEach((k) => {
            if (r.flags[k]) totals[k] += 1
        })
    }

    return {
        items: paged,
        total: filtered.length,
        page: input.page,
        pageSize: input.pageSize,
        scanned: rows.length,
        totals
    }
}

// ---------------------------------------------------------------------------
// Team buckets
// ---------------------------------------------------------------------------

interface TeamBucketCounsellor {
    id: string
    name: string
    email: string
    employeeCode: string | null
    studentsCount: number
    activeStudents: number
    feesPaid: number
    feesPending: number
    revenuePaid: number
    revenuePending: number
}

interface TeamBucket {
    manager: { id: string; name: string; email: string } | null
    counsellors: TeamBucketCounsellor[]
    totals: {
        students: number
        active: number
        feesPaid: number
        feesPending: number
        revenuePaid: number
        revenuePending: number
    }
}

const counsellorRollup = async (counsellor: { id: string; firstName: string; lastName: string; email: string; employeeCode: string | null }, tenantId: string): Promise<TeamBucketCounsellor> => {
    const signups = await db.client.studentSignup.findMany({
        where: { tenantId, counsellorId: counsellor.id },
        include: {
            user: {
                include: {
                    enrollments: { where: { deletedAt: null }, select: { status: true, progressPct: true } },
                    invoices: { select: { totalAmount: true, status: true } }
                }
            }
        }
    })

    let activeStudents = 0
    let feesPaid = 0
    let feesPending = 0
    let revenuePaid = 0
    let revenuePending = 0

    for (const s of signups) {
        const u = s.user
        if (!u) continue
        const totalPaid = u.invoices.filter((i) => i.status === InvoiceStatus.PAID).reduce((n: number, i) => n + i.totalAmount, 0)
        const pendingAmount = u.invoices.filter((i) => i.status === InvoiceStatus.DUE || i.status === InvoiceStatus.DRAFT).reduce((n: number, i) => n + i.totalAmount, 0)
        revenuePaid += totalPaid
        revenuePending += pendingAmount
        const recentLogin = u.lastLoginAt ? Date.now() - u.lastLoginAt.getTime() < INACTIVITY_MS : false
        const hasActive = u.enrollments.some((e) => e.status === EnrollmentStatus.ACTIVE)
        if (u.status === UserStatus.ACTIVE && recentLogin && hasActive) activeStudents += 1
        if (pendingAmount === 0 && totalPaid > 0) feesPaid += 1
        if (pendingAmount > 0) feesPending += 1
    }

    return {
        id: counsellor.id,
        name: fullName(counsellor),
        email: counsellor.email,
        employeeCode: counsellor.employeeCode,
        studentsCount: signups.length,
        activeStudents,
        feesPaid,
        feesPending,
        revenuePaid,
        revenuePending
    }
}

export const listTeamBuckets = async (input: TTeamBucketsInput, ctx: ScopeContext) => {
    if (!isMonitorRole(ctx.role)) throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')

    const { tenantWhere, tenantId: scopedTenantId } = await resolveTenantScope(input.tenantSlug, ctx)

    // Tenant filter for User queries — share with the children fetches below.
    const userTenantWhere: Prisma.UserWhereInput = tenantWhere

    // Manager scope: see their own bucket only.
    if (ctx.role === Role.COUNSELLING_MANAGER) {
        const manager = await db.client.user.findUnique({ where: { id: ctx.userId } })
        if (!manager) return { buckets: [], unmanagedCounsellors: [] }
        const team = await db.client.user.findMany({
            where: { tenantId: ctx.tenantId, managerId: ctx.userId, role: Role.COUNSELLOR, deletedAt: null },
            orderBy: { firstName: 'asc' }
        })
        const counsellors = await Promise.all(team.map((c) => counsellorRollup(c, ctx.tenantId)))
        const totals = aggregateTotals(counsellors)
        const bucket: TeamBucket = {
            manager: { id: manager.id, name: fullName(manager), email: manager.email },
            counsellors,
            totals
        }
        return { buckets: [bucket], unmanagedCounsellors: [] }
    }

    // Counsellor scope: their own bucket only.
    if (ctx.role === Role.COUNSELLOR) {
        const counsellor = await db.client.user.findUnique({ where: { id: ctx.userId } })
        if (!counsellor) return { buckets: [], unmanagedCounsellors: [] }
        const rollup = await counsellorRollup(counsellor, ctx.tenantId)
        const totals = aggregateTotals([rollup])
        const manager = counsellor.managerId
            ? await db.client.user.findUnique({ where: { id: counsellor.managerId }, select: { id: true, firstName: true, lastName: true, email: true } })
            : null
        return {
            buckets: [
                {
                    manager: manager ? { id: manager.id, name: fullName(manager), email: manager.email } : null,
                    counsellors: [rollup],
                    totals
                }
            ],
            unmanagedCounsellors: []
        }
    }

    // ADMIN / SUPER_ADMIN: list every manager + their counsellors. Use
    // `tenantWhere` so SA's tenantSlug filter applies.
    const managers = await db.client.user.findMany({
        where: { ...userTenantWhere, role: Role.COUNSELLING_MANAGER, deletedAt: null },
        orderBy: [{ tenant: { name: 'asc' } }, { firstName: 'asc' }],
        include: { tenant: { select: { id: true, name: true, slug: true } } }
    })

    const buckets: (TeamBucket & { tenant: { id: string; name: string; slug: string } })[] = []
    for (const mgr of managers) {
        const team = await db.client.user.findMany({
            where: { tenantId: mgr.tenantId, managerId: mgr.id, role: Role.COUNSELLOR, deletedAt: null },
            orderBy: { firstName: 'asc' }
        })
        const counsellors = await Promise.all(team.map((c) => counsellorRollup(c, mgr.tenantId)))
        buckets.push({
            tenant: mgr.tenant,
            manager: { id: mgr.id, name: fullName(mgr), email: mgr.email },
            counsellors,
            totals: aggregateTotals(counsellors)
        })
    }

    // Unmanaged counsellors — direct admins / orphan rows. Surfaced separately
    // so totals don't double-count anyone.
    const unmanagedRaw = await db.client.user.findMany({
        where: {
            ...userTenantWhere,
            role: Role.COUNSELLOR,
            managerId: null,
            deletedAt: null
        },
        include: { tenant: { select: { id: true, name: true, slug: true } } },
        orderBy: { firstName: 'asc' }
    })
    const unmanagedCounsellors = await Promise.all(
        unmanagedRaw.map(async (c) => ({
            tenant: c.tenant,
            ...(await counsellorRollup(c, c.tenantId))
        }))
    )

    return { buckets, unmanagedCounsellors, scopedTenantId }
}

const aggregateTotals = (counsellors: TeamBucketCounsellor[]): TeamBucket['totals'] => {
    return counsellors.reduce(
        (acc, c) => ({
            students: acc.students + c.studentsCount,
            active: acc.active + c.activeStudents,
            feesPaid: acc.feesPaid + c.feesPaid,
            feesPending: acc.feesPending + c.feesPending,
            revenuePaid: acc.revenuePaid + c.revenuePaid,
            revenuePending: acc.revenuePending + c.revenuePending
        }),
        { students: 0, active: 0, feesPaid: 0, feesPending: 0, revenuePaid: 0, revenuePending: 0 }
    )
}

// ---------------------------------------------------------------------------
// Stats timeline
// ---------------------------------------------------------------------------

interface TimelineBucket {
    bucket: string
    label: string
    signups: number
    enrolments: number
    revenue: number
    enquiries: number
    converted: number
    lost: number
}

const resolveWindow = (input: TStatsTimelineInput): { from: Date; to: Date; granularity: 'minute' | 'hour' | 'day' | 'month' } => {
    const to = input.to ? new Date(input.to) : new Date()
    if (input.window === 'custom' && input.from) {
        const from = new Date(input.from)
        const span = to.getTime() - from.getTime()
        const day = 24 * 60 * 60 * 1000
        const granularity: 'hour' | 'day' | 'month' = span <= 2 * day ? 'hour' : span <= 90 * day ? 'day' : 'month'
        return { from, to, granularity }
    }
    if (input.window === 'hour') return { from: new Date(to.getTime() - 60 * 60 * 1000), to, granularity: 'minute' }
    if (input.window === 'day') return { from: new Date(to.getTime() - 24 * 60 * 60 * 1000), to, granularity: 'hour' }
    if (input.window === 'week') return { from: new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000), to, granularity: 'day' }
    if (input.window === 'year') return { from: new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000), to, granularity: 'month' }
    // default: month
    return { from: new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000), to, granularity: 'day' }
}

const bucketKey = (d: Date, granularity: 'minute' | 'hour' | 'day' | 'month'): string => {
    const yyyy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    const hh = String(d.getUTCHours()).padStart(2, '0')
    const mi = String(d.getUTCMinutes()).padStart(2, '0')
    if (granularity === 'minute') return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    if (granularity === 'hour') return `${yyyy}-${mm}-${dd}T${hh}:00`
    if (granularity === 'day') return `${yyyy}-${mm}-${dd}`
    return `${yyyy}-${mm}`
}

const bucketLabel = (key: string, granularity: 'minute' | 'hour' | 'day' | 'month'): string => {
    if (granularity === 'minute') return key.slice(11)
    if (granularity === 'hour') return key.slice(11, 16)
    if (granularity === 'day') return key.slice(5)
    return key
}

const enumerateBuckets = (from: Date, to: Date, granularity: 'minute' | 'hour' | 'day' | 'month'): string[] => {
    const out: string[] = []
    const cursor = new Date(from)
    while (cursor <= to) {
        out.push(bucketKey(cursor, granularity))
        if (granularity === 'minute') cursor.setUTCMinutes(cursor.getUTCMinutes() + 1)
        else if (granularity === 'hour') cursor.setUTCHours(cursor.getUTCHours() + 1)
        else if (granularity === 'day') cursor.setUTCDate(cursor.getUTCDate() + 1)
        else cursor.setUTCMonth(cursor.getUTCMonth() + 1)
        if (out.length > 2000) break // hard cap
    }
    return Array.from(new Set(out))
}

export const getStatsTimeline = async (input: TStatsTimelineInput, ctx: ScopeContext) => {
    if (!isMonitorRole(ctx.role)) throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')

    const { tenantWhere } = await resolveTenantScope(input.tenantSlug, ctx)
    const { counsellorIds } = await buildCounsellorFilter(ctx, input.counsellorId)
    const { from, to, granularity } = resolveWindow(input)

    // Tenant filter for non-User tables (Enquiry / Enrollment / Invoice).
    const tenantIdFilter: Prisma.IntFilter | Prisma.StringFilter | undefined = undefined // placeholder for type lint
    void tenantIdFilter
    const tenantWhereForOther = (tenantWhere.tenantId
        ? { tenantId: tenantWhere.tenantId as string }
        : tenantWhere.tenant?.slug
          ? { tenant: tenantWhere.tenant as Prisma.TenantWhereInput }
          : { tenant: { slug: { not: 'platform' as const } } }) as Prisma.EnquiryWhereInput

    // Enquiries (signups + conversions + lost)
    const enquiries = await db.client.enquiry.findMany({
        where: {
            ...tenantWhereForOther,
            createdAt: { gte: from, lte: to },
            ...(counsellorIds && counsellorIds.length > 0 ? { assignedToId: { in: counsellorIds } } : {})
        },
        select: { createdAt: true, stage: true }
    })

    // Enrolments
    const enrolmentWhere: Prisma.EnrollmentWhereInput = {
        ...(tenantWhere.tenantId ? { tenantId: tenantWhere.tenantId as string } : {}),
        ...(tenantWhere.tenant?.slug ? { tenant: tenantWhere.tenant as Prisma.TenantWhereInput } : {}),
        deletedAt: null,
        createdAt: { gte: from, lte: to },
        ...(counsellorIds && counsellorIds.length > 0 ? { counsellorId: { in: counsellorIds } } : {})
    }
    const enrolments = await db.client.enrollment.findMany({
        where: enrolmentWhere,
        select: { createdAt: true }
    })

    // Revenue from PAID invoices in the window. Counsellor scope joins via
    // enrollment.counsellorId so manager / counsellor totals only see what
    // they earned. Admin / SA see the full tenant.
    const invoiceWhere: Prisma.InvoiceWhereInput = {
        ...(tenantWhere.tenantId ? { tenantId: tenantWhere.tenantId as string } : {}),
        ...(tenantWhere.tenant?.slug ? { tenant: tenantWhere.tenant as Prisma.TenantWhereInput } : {}),
        status: InvoiceStatus.PAID,
        paidAt: { gte: from, lte: to },
        ...(counsellorIds && counsellorIds.length > 0 ? { enrollment: { counsellorId: { in: counsellorIds } } } : {})
    }
    const invoices = await db.client.invoice.findMany({
        where: invoiceWhere,
        select: { paidAt: true, totalAmount: true }
    })

    const map = new Map<string, TimelineBucket>()
    for (const key of enumerateBuckets(from, to, granularity)) {
        map.set(key, { bucket: key, label: bucketLabel(key, granularity), signups: 0, enrolments: 0, revenue: 0, enquiries: 0, converted: 0, lost: 0 })
    }

    for (const e of enquiries) {
        const key = bucketKey(e.createdAt, granularity)
        const bucket = map.get(key)
        if (!bucket) continue
        bucket.enquiries += 1
        bucket.signups += 1
        if (e.stage === EnquiryStage.CONVERTED) bucket.converted += 1
        if (e.stage === EnquiryStage.LOST) bucket.lost += 1
    }

    for (const en of enrolments) {
        const key = bucketKey(en.createdAt, granularity)
        const bucket = map.get(key)
        if (bucket) bucket.enrolments += 1
    }

    for (const inv of invoices) {
        if (!inv.paidAt) continue
        const key = bucketKey(inv.paidAt, granularity)
        const bucket = map.get(key)
        if (bucket) bucket.revenue += inv.totalAmount
    }

    const series = Array.from(map.values()).sort((a, b) => a.bucket.localeCompare(b.bucket))
    const totals = series.reduce(
        (acc, b) => ({
            signups: acc.signups + b.signups,
            enrolments: acc.enrolments + b.enrolments,
            revenue: acc.revenue + b.revenue,
            enquiries: acc.enquiries + b.enquiries,
            converted: acc.converted + b.converted,
            lost: acc.lost + b.lost
        }),
        { signups: 0, enrolments: 0, revenue: 0, enquiries: 0, converted: 0, lost: 0 }
    )

    return {
        from: from.toISOString(),
        to: to.toISOString(),
        granularity,
        window: input.window,
        series,
        totals
    }
}
