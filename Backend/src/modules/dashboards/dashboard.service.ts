import { EnrollmentStatus, InvoiceStatus, type Prisma, QuizAttemptStatus, Role, TicketStatus } from '@prisma/client'
import db from '../../service/db'
import quicker from '../../util/quicker'
import { getCounsellorTarget } from '../counsellor-invites/counsellor-invite.service'

// Per-role dashboards (PRD E5) — stats + next-action list. Each role returns the shape its UI needs.

export const getDashboard = async (tenantId: string, role: Role, userId: string) => {
    switch (role) {
        case Role.SUPER_ADMIN:
            // Platform-wide aggregate — SA's tenant is the empty `platform`
            // tenant so the per-tenant query would return all zeros.
            return superAdminDashboard()
        case Role.ADMIN:
            return adminDashboard(tenantId)
        case Role.TRAINER:
            return trainerDashboard(tenantId, userId)
        case Role.STUDENT:
            return studentDashboard(tenantId, userId)
        case Role.COUNSELLING_MANAGER:
            return managerDashboard(tenantId, userId)
        case Role.COUNSELLOR:
            return counsellorDashboard(tenantId, userId)
        case Role.SUPPORT:
            return supportDashboard(tenantId)
        default:
            return { stats: {}, nextActions: [] }
    }
}

// SUPER_ADMIN — platform-wide rollup excluding the platform tenant itself.
const superAdminDashboard = async () => {
    const exclPlatform = { tenant: { slug: { not: 'platform' as const } } }
    const [
        tenantsActive,
        tenantsTrial,
        tenantsSuspended,
        totalUsers,
        totalStudents,
        activeEnrollments,
        coursesPublished,
        paidThisMonthAgg,
        saasPaidThisMonthAgg,
        saasOutstandingAgg
    ] = await Promise.all([
        db.client.tenant.count({ where: { status: 'ACTIVE', slug: { not: 'platform' } } }),
        db.client.tenant.count({ where: { status: 'TRIAL', slug: { not: 'platform' } } }),
        db.client.tenant.count({ where: { status: 'SUSPENDED', slug: { not: 'platform' } } }),
        db.client.user.count({ where: { ...exclPlatform, deletedAt: null } }),
        db.client.user.count({ where: { ...exclPlatform, role: Role.STUDENT, deletedAt: null } }),
        db.client.enrollment.count({ where: { ...exclPlatform, status: EnrollmentStatus.ACTIVE } }),
        db.client.course.count({ where: { ...exclPlatform, publishState: 'PUBLISHED' } }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { ...exclPlatform, status: InvoiceStatus.PAID, paidAt: { gte: firstDayOfMonth() } }
        }),
        db.client.tenantPayment.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID', paidAt: { gte: firstDayOfMonth() } }
        }),
        db.client.tenantPayment.aggregate({
            _sum: { amount: true },
            where: { status: 'PENDING' }
        })
    ])

    return {
        stats: {
            tenantsActive,
            tenantsTrial,
            tenantsSuspended,
            totalUsers,
            totalStudents,
            activeEnrollments,
            coursesPublished,
            // Tenant-side: gross student-fee revenue across all tenants this month.
            studentRevenueThisMonth: paidThisMonthAgg._sum.totalAmount ?? 0,
            // Platform-side: SaaS billing collected from tenants this month.
            saasRevenueThisMonth: saasPaidThisMonthAgg._sum.amount ?? 0,
            saasOutstanding: saasOutstandingAgg._sum.amount ?? 0
        },
        monitoring: getMonitoringSnapshot(),
        nextActions: [
            { label: 'Issue an invoice', link: '/admin/tenants' },
            { label: 'Add a tenant', link: '/admin/tenants' }
        ]
    }
}

const adminDashboard = async (tenantId: string) => {
    const [totalStudents, totalTrainers, totalCounsellors, activeEnrollments, coursesPublished, overdueInvoices, paidThisMonth, signupsThisMonth] =
        await Promise.all([
            db.client.user.count({ where: { tenantId, role: Role.STUDENT } }),
            db.client.user.count({ where: { tenantId, role: Role.TRAINER } }),
            db.client.user.count({ where: { tenantId, role: Role.COUNSELLOR } }),
            db.client.enrollment.count({ where: { tenantId, status: EnrollmentStatus.ACTIVE } }),
            db.client.course.count({ where: { tenantId, publishState: 'PUBLISHED' } }),
            db.client.invoice.count({ where: { tenantId, status: InvoiceStatus.DUE } }),
            db.client.invoice.aggregate({
                _sum: { totalAmount: true },
                where: {
                    tenantId,
                    status: InvoiceStatus.PAID,
                    paidAt: { gte: firstDayOfMonth() }
                }
            }),
            db.client.studentSignup.count({
                where: { tenantId, createdAt: { gte: firstDayOfMonth() } }
            })
        ])

    return {
        stats: {
            totalStudents,
            totalTrainers,
            totalCounsellors,
            activeEnrollments,
            coursesPublished,
            overdueInvoices,
            revenueThisMonth: paidThisMonth._sum.totalAmount ?? 0,
            signupsThisMonth
        },
        monitoring: getMonitoringSnapshot(),
        nextActions: buildAdminNextActions({ overdueInvoices, signupsThisMonth, totalStudents })
    }
}

const buildAdminNextActions = (args: {
    overdueInvoices: number
    signupsThisMonth: number
    totalStudents: number
}): { label: string; link: string }[] => {
    const out: { label: string; link: string }[] = []
    if (args.overdueInvoices > 0) {
        out.push({ label: `Follow up on ${args.overdueInvoices} overdue invoice(s)`, link: '/payments' })
    }
    if (args.totalStudents === 0) {
        out.push({ label: 'Invite your first student', link: '/users' })
    }
    if (args.signupsThisMonth === 0) {
        out.push({ label: 'Open a counsellor invite link', link: '/counsellor/invites' })
    }
    if (out.length === 0) {
        out.push({ label: 'Review weekly reports', link: '/reports' })
    }
    return out
}

const trainerDashboard = async (tenantId: string, userId: string) => {
    const [myCourses, draftCourses, pendingQuizzes, activeStudents] = await Promise.all([
        db.client.course.count({ where: { tenantId, trainerId: userId } }),
        db.client.course.count({ where: { tenantId, trainerId: userId, publishState: 'DRAFT' } }),
        db.client.quiz.count({ where: { tenantId, course: { trainerId: userId }, isPublished: false } }),
        db.client.enrollment.count({
            where: { tenantId, status: EnrollmentStatus.ACTIVE, course: { trainerId: userId } }
        })
    ])

    const firstDraft = await db.client.course.findFirst({
        where: { tenantId, trainerId: userId, publishState: 'DRAFT' },
        select: { id: true, title: true }
    })

    return {
        stats: { myCourses, draftCourses, pendingQuizzes, activeStudents },
        nextActions: firstDraft
            ? [{ label: `Publish your draft: ${firstDraft.title}`, link: `/trainer/courses/${firstDraft.id}` }]
            : [{ label: 'Create your next course', link: '/trainer/courses/new' }]
    }
}

const studentDashboard = async (tenantId: string, userId: string) => {
    // Pending fees only count when the underlying enrollment is genuinely
    // unpaid (PENDING_PAYMENT) or unresolved. Orphan DUE invoices left over
    // from the pre-idempotency-fix days (where the same course had a paid
    // invoice plus a ghost DUE one) are silently excluded — same filter as
    // listMyInvoices in payment.service.ts. Without this, paid students see
    // a phantom "Pending fees ₹X" tile on the dashboard forever.
    const pendingInvoiceWhere: Prisma.InvoiceWhereInput = {
        tenantId,
        userId,
        status: InvoiceStatus.DUE,
        OR: [
            { enrollmentId: null }, // standalone invoice with no enrolment
            { enrollment: { status: { in: [EnrollmentStatus.PENDING_PAYMENT] } } }
        ]
    }

    const [activeEnrollments, completedCourses, pendingInvoices, quizzesAttempted, pendingTotalAgg] = await Promise.all([
        db.client.enrollment.count({ where: { tenantId, userId, status: EnrollmentStatus.ACTIVE } }),
        db.client.enrollment.count({ where: { tenantId, userId, status: EnrollmentStatus.COMPLETED } }),
        db.client.invoice.count({ where: pendingInvoiceWhere }),
        db.client.quizAttempt.count({ where: { tenantId, userId, status: QuizAttemptStatus.SUBMITTED } }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: pendingInvoiceWhere
        })
    ])

    const nextLesson = await db.client.enrollment.findFirst({
        where: { tenantId, userId, status: EnrollmentStatus.ACTIVE },
        orderBy: { updatedAt: 'desc' },
        include: { course: { select: { id: true, title: true } } }
    })

    const actions: { label: string; link: string }[] = []
    if (pendingInvoices > 0) actions.push({ label: 'Pay pending invoice', link: '/my/payments/pending' })
    if (nextLesson) actions.push({ label: `Continue ${nextLesson.course.title}`, link: `/my/courses/${nextLesson.courseId}` })
    if (actions.length === 0) actions.push({ label: 'Browse free courses', link: '/courses?free=1' })

    return {
        stats: {
            activeEnrollments,
            completedCourses,
            pendingInvoices,
            pendingAmount: pendingTotalAgg._sum?.totalAmount ?? 0,
            quizzesAttempted
        },
        nextActions: actions
    }
}

const counsellorDashboard = async (tenantId: string, userId: string) => {
    const [signupsCount, activeStudents, paidThisMonthAgg, pendingAmountAgg, target] = await Promise.all([
        db.client.studentSignup.count({ where: { tenantId, counsellorId: userId } }),
        db.client.enrollment.count({
            where: { tenantId, counsellorId: userId, status: EnrollmentStatus.ACTIVE }
        }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: InvoiceStatus.PAID,
                paidAt: { gte: firstDayOfMonth() },
                enrollment: { counsellorId: userId }
            }
        }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: { in: [InvoiceStatus.DUE, InvoiceStatus.FAILED] },
                enrollment: { counsellorId: userId }
            }
        }),
        getCounsellorTarget(tenantId, userId)
    ])

    const recent = await db.client.studentSignup.findFirst({
        where: { tenantId, counsellorId: userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true }
    })

    return {
        stats: {
            mySignups: signupsCount,
            activeStudents,
            revenueThisMonth: paidThisMonthAgg._sum.totalAmount ?? 0,
            pendingAmount: pendingAmountAgg._sum.totalAmount ?? 0
        },
        target,
        nextActions: recent
            ? [{ label: `View ${recent.firstName} ${recent.lastName}'s progress`, link: `/counsellor/students` }]
            : [{ label: 'Create a new onboarding link', link: '/counsellor/invites/new' }]
    }
}

const managerDashboard = async (tenantId: string, managerId: string) => {
    const teamIdsRows = await db.client.user.findMany({
        where: { tenantId, managerId, role: Role.COUNSELLOR },
        select: { id: true }
    })
    const teamIds = teamIdsRows.map((u) => u.id)

    const monthStart = firstDayOfMonth()

    const [signupsThisMonth, activeStudents, paidThisMonthAgg, openTasks] = await Promise.all([
        db.client.studentSignup.count({
            where: { tenantId, counsellorId: { in: teamIds }, createdAt: { gte: monthStart } }
        }),
        db.client.enrollment.count({
            where: {
                tenantId,
                counsellorId: { in: teamIds },
                status: EnrollmentStatus.ACTIVE
            }
        }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: InvoiceStatus.PAID,
                paidAt: { gte: monthStart },
                enrollment: { counsellorId: { in: teamIds } }
            }
        }),
        db.client.counsellorTask.count({
            where: { tenantId, assigneeId: { in: teamIds }, status: { not: 'DONE' } }
        })
    ])

    return {
        stats: {
            teamSize: teamIds.length,
            signupsThisMonth,
            activeStudents,
            revenueThisMonth: paidThisMonthAgg._sum.totalAmount ?? 0,
            openTasks
        },
        nextActions: [
            { label: 'View team report', link: '/counsellor/reports/team' },
            { label: 'Assign a task', link: '/counsellor/tasks/new' }
        ]
    }
}

const supportDashboard = async (tenantId: string) => {
    const [openTickets, inProgress, resolvedToday, urgent] = await Promise.all([
        db.client.ticket.count({ where: { tenantId, status: TicketStatus.OPEN } }),
        db.client.ticket.count({ where: { tenantId, status: TicketStatus.IN_PROGRESS } }),
        db.client.ticket.count({
            where: { tenantId, status: TicketStatus.RESOLVED, resolvedAt: { gte: startOfDay() } }
        }),
        db.client.ticket.count({ where: { tenantId, priority: 'URGENT', status: { not: TicketStatus.CLOSED } } })
    ])

    const next = await db.client.ticket.findFirst({
        where: { tenantId, status: TicketStatus.OPEN },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        select: { id: true, number: true, subject: true }
    })

    return {
        stats: { openTickets, inProgress, resolvedToday, urgent },
        nextActions: next
            ? [{ label: `Respond to #${next.number}: ${next.subject}`, link: `/support/tickets/${next.id}` }]
            : [{ label: 'Review knowledge base', link: '/support/kb' }]
    }
}

// Reports endpoint (§4.3 / §13). Per-tenant KPI rollup with weekly trend
// data. SUPER_ADMIN sees the platform-wide aggregate by default, or can
// scope to a single tenant via `tenantSlug`. Everyone else sees their
// own tenant only.
export const getReports = async (tenantId: string, role: Role, tenantSlug?: string) => {
    const isSuperAdmin = role === Role.SUPER_ADMIN

    let baseTenantFilter: { tenantId?: string; tenant?: { slug: { not: 'platform' } } } = isSuperAdmin
        ? { tenant: { slug: { not: 'platform' as const } } }
        : { tenantId }
    if (isSuperAdmin && tenantSlug && tenantSlug !== '__all__') {
        const t = await db.client.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
        baseTenantFilter = { tenantId: t?.id ?? '__none__' }
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000)
    const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86_400_000)

    const [activeLearners, signupsThisWeek, paidThisWeekAgg, quizAttempts, totalEnrollments, totalStudents, paidPayments] = await Promise.all([
        // Active learners — distinct students with lesson progress in last 7 days.
        db.client.user.count({
            where: {
                ...baseTenantFilter,
                role: Role.STUDENT,
                deletedAt: null,
                lastLoginAt: { gte: sevenDaysAgo }
            }
        }),
        db.client.studentSignup.count({
            where: { ...baseTenantFilter, createdAt: { gte: sevenDaysAgo } }
        }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { ...baseTenantFilter, status: InvoiceStatus.PAID, paidAt: { gte: sevenDaysAgo } }
        }),
        db.client.quizAttempt.count({
            where: { ...baseTenantFilter, startedAt: { gte: sevenDaysAgo } }
        }),
        db.client.enrollment.count({ where: { ...baseTenantFilter } }),
        db.client.user.count({ where: { ...baseTenantFilter, role: Role.STUDENT, deletedAt: null } }),
        db.client.invoice.findMany({
            where: { ...baseTenantFilter, status: InvoiceStatus.PAID, paidAt: { gte: eightWeeksAgo } },
            select: { totalAmount: true, paidAt: true }
        })
    ])

    // Bin paid invoices into 8 weekly buckets for the trend chart.
    const trend: { week: string; revenue: number; count: number }[] = []
    for (let i = 7; i >= 0; i--) {
        const start = new Date(Date.now() - (i + 1) * 7 * 86_400_000)
        const end = new Date(Date.now() - i * 7 * 86_400_000)
        const bucket = paidPayments.filter((p) => p.paidAt && p.paidAt >= start && p.paidAt < end)
        trend.push({
            week: `W-${i}`,
            revenue: bucket.reduce((n, p) => n + p.totalAmount, 0),
            count: bucket.length
        })
    }

    return {
        scope: isSuperAdmin ? 'platform' : 'tenant',
        stats: {
            activeLearners,
            signupsThisWeek,
            collectedThisWeek: paidThisWeekAgg._sum.totalAmount ?? 0,
            quizAttempts,
            totalEnrollments,
            totalStudents
        },
        trend
    }
}

// Admin-only system snapshot. Heavier metrics still come from /metrics (Prometheus).
export const getMonitoringSnapshot = () => {
    return {
        application: quicker.getApplicationHealth(),
        system: quicker.getSystemHealth(),
        timestamp: Date.now()
    }
}

const firstDayOfMonth = (): Date => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

const startOfDay = (): Date => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
