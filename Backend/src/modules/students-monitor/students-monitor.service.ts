import { EnrollmentAccessTier, EnrollmentStatus, EnquiryStage, InvoiceStatus, type Prisma, Role, UserStatus } from '@prisma/client'
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

// Mutates `where` to narrow the user query for a given category. Each
// branch encodes the cheap part of the rule — JS-side `computeFlags` still
// runs afterwards to apply the full logic (e.g. the "no follow-up if the
// student has paid recently" exception), but this is enough to slash the
// tenant scan from O(all-students) to O(category-students).
const applyCategoryWhere = (where: Prisma.UserWhereInput, category: StudentCategory, inactivityCutoff: Date): void => {
    switch (category) {
        case 'DEMO':
            // Any active enrolment whose access tier is DEMO. The JS pass
            // re-checks balance state so we still flag implied-balance rows.
            where.enrollments = {
                some: { accessTier: EnrollmentAccessTier.DEMO, deletedAt: null }
            }
            return
        case 'DEAD':
            where.status = UserStatus.SUSPENDED
            return
        case 'FEES_PENDING':
            where.invoices = { some: { status: { in: [InvoiceStatus.DUE, InvoiceStatus.DRAFT] } } }
            return
        case 'FEES_PAID':
            // At least one PAID invoice AND no DUE/DRAFT invoices.
            where.invoices = { some: { status: InvoiceStatus.PAID } }
            where.NOT = [
                ...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []),
                { invoices: { some: { status: { in: [InvoiceStatus.DUE, InvoiceStatus.DRAFT] } } } }
            ]
            return
        case 'INACTIVE':
            where.OR = [
                ...(Array.isArray(where.OR) ? where.OR : []),
                { lastLoginAt: null },
                { lastLoginAt: { lt: inactivityCutoff } }
            ]
            where.status = { not: UserStatus.SUSPENDED }
            return
        case 'ACTIVE':
            where.lastLoginAt = { gte: inactivityCutoff }
            where.status = UserStatus.ACTIVE
            where.enrollments = {
                some: { status: EnrollmentStatus.ACTIVE, deletedAt: null }
            }
            return
        case 'FOLLOW_UP':
            // Two heuristics: no enrolments at all, OR low progress + stale activity.
            // The "stale activity" half can't be expressed without a self-join,
            // so we leave it for JS-side filtering; the SQL form catches the
            // "no enrolments yet" case which is by far the largest bucket.
            where.OR = [
                ...(Array.isArray(where.OR) ? where.OR : []),
                { enrollments: { none: { deletedAt: null } } },
                { enrollments: { some: { progressPct: { lt: 30 } } } }
            ]
            return
    }
}

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
    enrollments: { id: string; status: string; progressPct: number; accessTier: EnrollmentAccessTier; course: { id: string; title: string } | null }[]
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

    // DEMO is set by the caller from the enrolment.accessTier check —
    // false here because computeFlags doesn't see the access tier. The
    // caller spreads the result and overrides DEMO before persisting.
    return { ACTIVE: active, INACTIVE: inactive, FEES_PAID: feesPaid, FEES_PENDING: feesPending, FOLLOW_UP: followUp, DEAD: dead, DEMO: false }
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
        accessTier: EnrollmentAccessTier
        course: { id: string; title: string; price: number; gstPercent: number; trainerId: string | null; trainer: { id: string; firstName: string; lastName: string; email: string } | null } | null
        invoices: { amount: number; totalAmount: number; status: InvoiceStatus }[]
    }[]
    invoices: { amount: number; totalAmount: number; status: InvoiceStatus }[]
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

    // Server-side category narrowing — push the cheap parts of each
    // category's predicate into Prisma so we don't have to pull and
    // discard half the tenant. The remaining nuances (e.g. FOLLOW_UP's
    // "low progress" rule) are still resolved in JS after the fetch,
    // but the candidate set is small now.
    const inactivityCutoff = new Date(Date.now() - INACTIVITY_MS)
    if (input.category) {
        applyCategoryWhere(userWhere, input.category, inactivityCutoff)
    }

    // Pagination happens after the in-JS category re-check so totals stay
    // consistent. We over-fetch by 2x so the client filter can prune
    // false-positives (e.g. a row that satisfies the SQL FEES_PENDING
    // predicate but is now DEAD because the user was suspended).
    const limit = Math.max(input.pageSize * 2, 50)
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
                    accessTier: true,
                    course: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            gstPercent: true,
                            trainerId: true,
                            trainer: { select: { id: true, firstName: true, lastName: true, email: true } }
                        }
                    },
                    invoices: { select: { amount: true, totalAmount: true, status: true } }
                }
            },
            invoices: {
                select: { totalAmount: true, amount: true, status: true }
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
        const pendingFromInvoices = agg.invoices.filter((i) => i.status === InvoiceStatus.DUE || i.status === InvoiceStatus.DRAFT).reduce((n, i) => n + i.totalAmount, 0)
        const paidCount = agg.invoices.filter((i) => i.status === InvoiceStatus.PAID).length
        const pendingCount = agg.invoices.filter((i) => i.status === InvoiceStatus.DUE || i.status === InvoiceStatus.DRAFT).length

        // Compute the implied balance for any DEMO enrolments — covers the
        // case where the registration fee was paid but no DUE balance
        // invoice was generated yet (legacy rows pre-dating the
        // public-purchase migration). Admin/SA/counsellor dashboards use
        // this to nudge students to settle the full fee even when there's
        // no formal invoice to point at.
        const demoBalanceImplied = agg.enrollments.reduce((sum, en) => {
            if (en.accessTier !== EnrollmentAccessTier.DEMO || !en.course) return sum
            const paidPrincipal = (en.invoices ?? []).filter((i) => i.status === InvoiceStatus.PAID).reduce((n, i) => n + i.amount, 0)
            const remainingPrincipal = Math.max(0, en.course.price - paidPrincipal)
            const gst = en.course.gstPercent ?? 18
            return sum + remainingPrincipal + Math.round((remainingPrincipal * gst) / 100)
        }, 0)
        const pendingAmount = pendingFromInvoices > 0 ? pendingFromInvoices : demoBalanceImplied

        const payments = { totalPaid, pendingAmount, paidCount, pendingCount }
        const flags = computeFlags(agg.user, payments, agg.enrollments, agg.enquiryStage)
        // Demo students always trip the DEMO flag, regardless of whether
        // their balance invoice has been written yet — the UI uses this to
        // colour the pill + drive the new DEMO chip filter.
        const isDemoEnrolled = agg.enrollments.some((e) => e.accessTier === EnrollmentAccessTier.DEMO)
        const allFlags = { ...flags, DEMO: isDemoEnrolled }
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
                accessTier: e.accessTier,
                course: e.course ? { id: e.course.id, title: e.course.title } : null
            })),
            payments,
            primaryCategory: isDemoEnrolled && pendingAmount > 0 ? 'DEMO' : resolveCategory(flags),
            flags: allFlags
        }
    })

    const categoryFilter = input.category
    const filtered = categoryFilter ? rows.filter((r) => r.flags[categoryFilter]) : rows
    const paged = filtered.slice(offset, offset + input.pageSize)

    // Per-category totals are derived from a separate set of scoped COUNT
    // queries so the chips show stable counts even when the table is
    // filtered to one category. The 6 counts run in parallel and are fast
    // because each predicate is indexed (status / invoices.status / lastLoginAt).
    const totals = await computeCategoryTotals(userWhere, inactivityCutoff)

    return {
        items: paged,
        total: filtered.length,
        page: input.page,
        pageSize: input.pageSize,
        scanned: rows.length,
        totals
    }
}

// Build per-category totals using narrow COUNT queries off the same
// user-where (less the category filter, which we add per call). Drops the
// existing category narrowing from the where so each count reflects the
// FULL scoped tenant slice, not just the active filter.
const computeCategoryTotals = async (baseWhere: Prisma.UserWhereInput, inactivityCutoff: Date): Promise<Record<StudentCategory, number>> => {
    const stripped: Prisma.UserWhereInput = { ...baseWhere }
    delete stripped.status
    delete stripped.invoices
    delete stripped.lastLoginAt
    delete stripped.NOT
    // We can't reliably strip OR/enrollments because those may have been set
    // by the trainer scope or category narrowing — clone what we know is
    // category-derived. For simplicity, rebuild from scratch on the fields
    // the caller controls (tenantId/role/q/etc.) by reading explicit keys.
    const safeWhere: Prisma.UserWhereInput = {
        tenantId: stripped.tenantId,
        tenant: stripped.tenant,
        role: stripped.role,
        deletedAt: stripped.deletedAt,
        OR: stripped.OR,
        studentSignup: stripped.studentSignup
    }

    const counts = await Promise.all([
        db.client.user.count({
            where: { ...safeWhere, status: UserStatus.ACTIVE, lastLoginAt: { gte: inactivityCutoff }, enrollments: { some: { status: EnrollmentStatus.ACTIVE, deletedAt: null } } }
        }),
        db.client.user.count({
            where: { ...safeWhere, status: { not: UserStatus.SUSPENDED }, OR: [...(safeWhere.OR ?? []), { lastLoginAt: null }, { lastLoginAt: { lt: inactivityCutoff } }] }
        }),
        db.client.user.count({
            where: { ...safeWhere, invoices: { some: { status: InvoiceStatus.PAID } }, NOT: { invoices: { some: { status: { in: [InvoiceStatus.DUE, InvoiceStatus.DRAFT] } } } } }
        }),
        db.client.user.count({
            where: { ...safeWhere, invoices: { some: { status: { in: [InvoiceStatus.DUE, InvoiceStatus.DRAFT] } } } }
        }),
        db.client.user.count({
            where: { ...safeWhere, OR: [...(safeWhere.OR ?? []), { enrollments: { none: { deletedAt: null } } }, { enrollments: { some: { progressPct: { lt: 30 } } } }] }
        }),
        db.client.user.count({ where: { ...safeWhere, status: UserStatus.SUSPENDED } }),
        // DEMO — registration paid but full fee outstanding. Cheap to count
        // because Enrollment.accessTier is indexed (see migration 20260509160000).
        db.client.user.count({
            where: { ...safeWhere, enrollments: { some: { accessTier: EnrollmentAccessTier.DEMO, deletedAt: null } } }
        })
    ])
    return {
        ACTIVE: counts[0],
        INACTIVE: counts[1],
        FEES_PAID: counts[2],
        FEES_PENDING: counts[3],
        FOLLOW_UP: counts[4],
        DEAD: counts[5],
        DEMO: counts[6]
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
