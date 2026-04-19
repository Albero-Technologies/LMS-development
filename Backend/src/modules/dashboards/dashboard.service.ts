import { EnrollmentStatus, InvoiceStatus, QuizAttemptStatus, Role, TicketStatus } from '@prisma/client'
import db from '../../service/db'
import quicker from '../../util/quicker'
import { getCounsellorTarget } from '../counsellor-invites/counsellor-invite.service'

// Per-role dashboards (PRD E5) — stats + next-action list. Each role returns the shape its UI needs.

export const getDashboard = async (tenantId: string, role: Role, userId: string) => {
    switch (role) {
        case Role.SUPER_ADMIN:
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
        case Role.CLIENT:
            return clientDashboard(tenantId, userId)
        default:
            return { stats: {}, nextActions: [] }
    }
}

const adminDashboard = async (tenantId: string) => {
    const [
        totalStudents,
        totalTrainers,
        totalCounsellors,
        activeEnrollments,
        coursesPublished,
        overdueInvoices,
        paidThisMonth,
        signupsThisMonth
    ] = await Promise.all([
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
        nextActions:
            overdueInvoices > 0
                ? [{ label: `Follow up on ${overdueInvoices} overdue invoice(s)`, link: '/admin/invoices?status=DUE' }]
                : [{ label: 'Invite a new trainer', link: '/admin/users/invites' }]
    }
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
    const [activeEnrollments, completedCourses, pendingInvoices, quizzesAttempted, pendingTotalAgg] = await Promise.all([
        db.client.enrollment.count({ where: { tenantId, userId, status: EnrollmentStatus.ACTIVE } }),
        db.client.enrollment.count({ where: { tenantId, userId, status: EnrollmentStatus.COMPLETED } }),
        db.client.invoice.count({ where: { tenantId, userId, status: InvoiceStatus.DUE } }),
        db.client.quizAttempt.count({ where: { tenantId, userId, status: QuizAttemptStatus.SUBMITTED } }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { tenantId, userId, status: InvoiceStatus.DUE }
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
            pendingAmount: pendingTotalAgg._sum.totalAmount ?? 0,
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

const clientDashboard = async (tenantId: string, userId: string) => {
    const [activeLearners, completions] = await Promise.all([
        db.client.enrollment.count({ where: { tenantId, status: EnrollmentStatus.ACTIVE } }),
        db.client.enrollment.count({ where: { tenantId, status: EnrollmentStatus.COMPLETED } })
    ])
    return {
        stats: { activeLearners, completions, userId },
        nextActions: [{ label: 'Download latest progress report', link: '/client/reports/latest' }]
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
