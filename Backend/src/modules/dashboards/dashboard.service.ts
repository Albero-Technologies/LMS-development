import { EnrollmentStatus, InvoiceStatus, LeadStage, QuizAttemptStatus, Role, TicketStatus } from '@prisma/client'
import db from '../../service/db'

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
    const [totalStudents, totalTrainers, activeEnrollments, coursesPublished, overdueInvoices, paidThisMonth] = await Promise.all([
        db.client.user.count({ where: { tenantId, role: Role.STUDENT } }),
        db.client.user.count({ where: { tenantId, role: Role.TRAINER } }),
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
        })
    ])

    return {
        stats: {
            totalStudents,
            totalTrainers,
            activeEnrollments,
            coursesPublished,
            overdueInvoices,
            revenueThisMonth: paidThisMonth._sum.totalAmount ?? 0
        },
        nextActions: overdueInvoices > 0
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
    const [activeEnrollments, completedCourses, pendingInvoices, quizzesAttempted] = await Promise.all([
        db.client.enrollment.count({ where: { tenantId, userId, status: EnrollmentStatus.ACTIVE } }),
        db.client.enrollment.count({ where: { tenantId, userId, status: EnrollmentStatus.COMPLETED } }),
        db.client.invoice.count({ where: { tenantId, userId, status: InvoiceStatus.DUE } }),
        db.client.quizAttempt.count({ where: { tenantId, userId, status: QuizAttemptStatus.SUBMITTED } })
    ])

    const nextLesson = await db.client.enrollment.findFirst({
        where: { tenantId, userId, status: EnrollmentStatus.ACTIVE },
        orderBy: { updatedAt: 'desc' },
        include: { course: { select: { id: true, title: true } } }
    })

    const actions = []
    if (pendingInvoices > 0) actions.push({ label: 'Pay pending invoice', link: '/my/invoices' })
    if (nextLesson) actions.push({ label: `Continue ${nextLesson.course.title}`, link: `/my/courses/${nextLesson.courseId}` })
    if (actions.length === 0) actions.push({ label: 'Browse courses', link: '/courses' })

    return {
        stats: { activeEnrollments, completedCourses, pendingInvoices, quizzesAttempted },
        nextActions: actions
    }
}

const counsellorDashboard = async (tenantId: string, userId: string) => {
    const [myLeads, newStage, enrolled, dueFollowUps] = await Promise.all([
        db.client.lead.count({ where: { tenantId, assignedToId: userId } }),
        db.client.lead.count({ where: { tenantId, assignedToId: userId, stage: LeadStage.NEW } }),
        db.client.lead.count({ where: { tenantId, assignedToId: userId, stage: LeadStage.ENROLLED } }),
        db.client.lead.count({
            where: { tenantId, assignedToId: userId, nextActionAt: { lte: new Date() } }
        })
    ])

    const next = await db.client.lead.findFirst({
        where: { tenantId, assignedToId: userId, nextActionAt: { lte: new Date() } },
        orderBy: { nextActionAt: 'asc' },
        select: { id: true, name: true }
    })

    return {
        stats: { myLeads, newStage, enrolled, dueFollowUps },
        nextActions: next
            ? [{ label: `Follow up on ${next.name}`, link: `/counsellor/leads/${next.id}` }]
            : [{ label: 'Add a new lead', link: '/counsellor/leads/new' }]
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
    // B2B clients see aggregate stats for users they own. In Phase 1 we scope by email domain; for now
    // we show platform-wide read-only counts for their tenant.
    const [activeLearners, completions] = await Promise.all([
        db.client.enrollment.count({ where: { tenantId, status: EnrollmentStatus.ACTIVE } }),
        db.client.enrollment.count({ where: { tenantId, status: EnrollmentStatus.COMPLETED } })
    ])
    return {
        stats: { activeLearners, completions, userId },
        nextActions: [{ label: 'Download latest progress report', link: '/client/reports/latest' }]
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
