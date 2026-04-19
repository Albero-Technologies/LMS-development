import {
    CounsellorTaskStatus,
    EnrollmentStatus,
    InvoiceStatus,
    Prisma,
    Role
} from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'
import {
    TAssignManager,
    TCreateTask,
    TReportRange,
    TTaskListQuery,
    TUpdateTask
} from './counsellor-management.schema'

// ----- date helpers --------------------------------------------------------

export const resolveRange = (range: TReportRange): { from: Date; to: Date } => {
    if (range.from && range.to) return { from: range.from, to: range.to }
    const now = new Date()
    const day = 24 * 60 * 60 * 1000
    switch (range.preset) {
        case 'today': {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            return { from: start, to: now }
        }
        case 'week':
            return { from: new Date(now.getTime() - 7 * day), to: now }
        case 'month':
            return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
        case 'quarter': {
            const q = Math.floor(now.getMonth() / 3)
            return { from: new Date(now.getFullYear(), q * 3, 1), to: now }
        }
        case 'year':
            return { from: new Date(now.getFullYear(), 0, 1), to: now }
        default:
            return { from: new Date(now.getTime() - 30 * day), to: now }
    }
}

// ----- team membership -----------------------------------------------------

export const listManagedCounsellors = async (tenantId: string, managerId: string) => {
    return db.client.user.findMany({
        where: { tenantId, managerId, role: Role.COUNSELLOR },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            phone: true,
            status: true,
            lastLoginAt: true,
            createdAt: true
        },
        orderBy: { firstName: 'asc' }
    })
}

const getManagedCounsellorIds = async (tenantId: string, managerId: string): Promise<string[]> => {
    const rows = await db.client.user.findMany({
        where: { tenantId, managerId, role: Role.COUNSELLOR },
        select: { id: true }
    })
    return rows.map((r) => r.id)
}

const assertManagerOwnsCounsellor = async (
    tenantId: string,
    role: Role,
    actorId: string,
    counsellorId: string
): Promise<void> => {
    if (role === Role.SUPER_ADMIN || role === Role.ADMIN) return
    if (role !== Role.COUNSELLING_MANAGER) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_MANAGER')
    }
    const owned = await db.client.user.findFirst({
        where: { id: counsellorId, tenantId, managerId: actorId, role: Role.COUNSELLOR },
        select: { id: true }
    })
    if (!owned) throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_TEAM_MEMBER')
}

export const assignManager = async (tenantId: string, input: TAssignManager) => {
    const counsellor = await db.client.user.findFirst({
        where: { id: input.counsellorId, tenantId, role: Role.COUNSELLOR }
    })
    if (!counsellor) throw AppError.notFound(responseMessage.NOT_FOUND('Counsellor'), 'COUNSELLOR_NOT_FOUND')
    if (input.managerId) {
        const manager = await db.client.user.findFirst({
            where: { id: input.managerId, tenantId, role: Role.COUNSELLING_MANAGER }
        })
        if (!manager) throw AppError.notFound(responseMessage.NOT_FOUND('Manager'), 'MANAGER_NOT_FOUND')
    }
    return db.client.user.update({
        where: { id: input.counsellorId },
        data: { managerId: input.managerId },
        select: { id: true, email: true, firstName: true, lastName: true, managerId: true }
    })
}

// ----- reports -------------------------------------------------------------

type TReportRow = {
    counsellorId: string
    name: string
    email: string
    employeeCode: string | null
    signups: number
    activeEnrolments: number
    completedEnrolments: number
    revenue: number
    pendingAmount: number
}

const counsellorReportFor = async (
    tenantId: string,
    counsellorId: string,
    from: Date,
    to: Date
): Promise<Omit<TReportRow, 'name' | 'email' | 'employeeCode'>> => {
    const [signups, activeEnrolments, completedEnrolments, revenueAgg, pendingAgg] = await Promise.all([
        db.client.studentSignup.count({
            where: { tenantId, counsellorId, createdAt: { gte: from, lte: to } }
        }),
        db.client.enrollment.count({
            where: {
                tenantId,
                counsellorId,
                status: EnrollmentStatus.ACTIVE,
                createdAt: { gte: from, lte: to }
            }
        }),
        db.client.enrollment.count({
            where: {
                tenantId,
                counsellorId,
                status: EnrollmentStatus.COMPLETED,
                createdAt: { gte: from, lte: to }
            }
        }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: InvoiceStatus.PAID,
                paidAt: { gte: from, lte: to },
                enrollment: { counsellorId }
            }
        }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: { in: [InvoiceStatus.DUE, InvoiceStatus.FAILED] },
                enrollment: { counsellorId }
            }
        })
    ])

    return {
        counsellorId,
        signups,
        activeEnrolments,
        completedEnrolments,
        revenue: revenueAgg._sum.totalAmount ?? 0,
        pendingAmount: pendingAgg._sum.totalAmount ?? 0
    }
}

// Per-counsellor report. Counsellor sees their own; manager sees team member's; admin sees any.
export const getCounsellorReport = async (
    tenantId: string,
    role: Role,
    actorId: string,
    counsellorId: string,
    range: TReportRange
) => {
    if (role === Role.COUNSELLOR && actorId !== counsellorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_OWNER')
    }
    if (role === Role.COUNSELLING_MANAGER) {
        await assertManagerOwnsCounsellor(tenantId, role, actorId, counsellorId)
    }
    const counsellor = await db.client.user.findFirst({
        where: { id: counsellorId, tenantId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            managerId: true,
            manager: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
    })
    if (!counsellor) throw AppError.notFound(responseMessage.NOT_FOUND('Counsellor'), 'COUNSELLOR_NOT_FOUND')

    const { from, to } = resolveRange(range)
    const stats = await counsellorReportFor(tenantId, counsellorId, from, to)
    return {
        counsellor,
        range: { from, to, preset: range.preset ?? null },
        stats
    }
}

// Aggregate team report — manager sees own counsellors; admin can view a manager's team.
export const getTeamReport = async (
    tenantId: string,
    role: Role,
    actorId: string,
    range: TReportRange,
    managerIdOverride?: string
) => {
    let managerId = actorId
    if (role === Role.SUPER_ADMIN || role === Role.ADMIN) {
        if (!managerIdOverride) {
            throw AppError.badRequest('managerId is required for admin team reports', 'MANAGER_ID_REQUIRED')
        }
        managerId = managerIdOverride
    } else if (role !== Role.COUNSELLING_MANAGER) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_MANAGER')
    }

    const counsellors = await db.client.user.findMany({
        where: { tenantId, managerId, role: Role.COUNSELLOR },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true
        }
    })

    const { from, to } = resolveRange(range)

    const rows: TReportRow[] = await Promise.all(
        counsellors.map(async (c) => {
            const stats = await counsellorReportFor(tenantId, c.id, from, to)
            return {
                ...stats,
                name: `${c.firstName} ${c.lastName}`,
                email: c.email,
                employeeCode: c.employeeCode
            }
        })
    )

    const totals = rows.reduce(
        (acc, r) => ({
            signups: acc.signups + r.signups,
            activeEnrolments: acc.activeEnrolments + r.activeEnrolments,
            completedEnrolments: acc.completedEnrolments + r.completedEnrolments,
            revenue: acc.revenue + r.revenue,
            pendingAmount: acc.pendingAmount + r.pendingAmount
        }),
        { signups: 0, activeEnrolments: 0, completedEnrolments: 0, revenue: 0, pendingAmount: 0 }
    )

    return {
        range: { from, to, preset: range.preset ?? null },
        managerId,
        teamSize: rows.length,
        totals,
        rows
    }
}

// ----- tasks ---------------------------------------------------------------

export const createTask = async (
    tenantId: string,
    role: Role,
    actorId: string,
    input: TCreateTask
) => {
    await assertManagerOwnsCounsellor(tenantId, role, actorId, input.assigneeId)
    const task = await db.client.counsellorTask.create({
        data: {
            tenantId,
            assigneeId: input.assigneeId,
            createdById: actorId,
            title: input.title,
            description: input.description,
            priority: input.priority,
            dueAt: input.dueAt
        }
    })
    await notifyQueue.add(NOTIFY_JOB, {
        tenantId,
        userId: input.assigneeId,
        template: 'counsellor_task_assigned',
        data: { title: input.title, dueAt: input.dueAt?.toISOString() ?? null, priority: input.priority }
    })
    return task
}

export const listTasks = async (
    tenantId: string,
    role: Role,
    actorId: string,
    query: TTaskListQuery
) => {
    const where: Prisma.CounsellorTaskWhereInput = { tenantId }
    if (query.status) where.status = query.status

    if (role === Role.COUNSELLOR) {
        where.assigneeId = actorId
    } else if (role === Role.COUNSELLING_MANAGER) {
        const teamIds = await getManagedCounsellorIds(tenantId, actorId)
        where.assigneeId = query.assigneeId && teamIds.includes(query.assigneeId) ? query.assigneeId : { in: teamIds }
    } else if (query.assigneeId) {
        where.assigneeId = query.assigneeId
    }

    return db.client.counsellorTask.findMany({
        where,
        include: {
            assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }]
    })
}

export const updateTask = async (
    tenantId: string,
    role: Role,
    actorId: string,
    taskId: string,
    input: TUpdateTask
) => {
    const task = await db.client.counsellorTask.findFirst({ where: { id: taskId, tenantId } })
    if (!task) throw AppError.notFound(responseMessage.NOT_FOUND('Task'), 'TASK_NOT_FOUND')

    if (role === Role.COUNSELLOR) {
        if (task.assigneeId !== actorId) {
            throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_ASSIGNEE')
        }
        // Counsellors can only flip status (e.g. mark done) — they don't re-author task content.
        if (
            input.title !== undefined ||
            input.description !== undefined ||
            input.priority !== undefined ||
            input.dueAt !== undefined
        ) {
            throw AppError.forbidden('Counsellors can only update task status', 'COUNSELLOR_STATUS_ONLY')
        }
    } else if (role === Role.COUNSELLING_MANAGER) {
        await assertManagerOwnsCounsellor(tenantId, role, actorId, task.assigneeId)
    }

    const completedAt =
        input.status === CounsellorTaskStatus.DONE && task.status !== CounsellorTaskStatus.DONE ? new Date() : task.completedAt

    const updated = await db.client.counsellorTask.update({
        where: { id: task.id },
        data: {
            title: input.title,
            description: input.description ?? undefined,
            priority: input.priority,
            status: input.status,
            dueAt: input.dueAt ?? undefined,
            completedAt
        }
    })

    if (input.status === CounsellorTaskStatus.DONE && task.status !== CounsellorTaskStatus.DONE) {
        await notifyQueue.add(NOTIFY_JOB, {
            tenantId,
            userId: task.createdById,
            template: 'counsellor_task_completed',
            data: { title: updated.title, by: actorId }
        })
    }

    return updated
}

export const deleteTask = async (
    tenantId: string,
    role: Role,
    actorId: string,
    taskId: string
): Promise<void> => {
    const task = await db.client.counsellorTask.findFirst({ where: { id: taskId, tenantId } })
    if (!task) throw AppError.notFound(responseMessage.NOT_FOUND('Task'), 'TASK_NOT_FOUND')
    if (role === Role.COUNSELLING_MANAGER) {
        await assertManagerOwnsCounsellor(tenantId, role, actorId, task.assigneeId)
    } else if (role === Role.COUNSELLOR) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NO_DELETE_PERMISSION')
    }
    await db.client.counsellorTask.delete({ where: { id: task.id } })
}

// ----- profile -------------------------------------------------------------

// Counsellor's own profile card — id, employee code, manager.
export const getMyProfile = async (tenantId: string, userId: string) => {
    const me = await db.client.user.findFirst({
        where: { id: userId, tenantId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            employeeCode: true,
            managerId: true,
            manager: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true }
            }
        }
    })
    if (!me) throw AppError.notFound(responseMessage.NOT_FOUND('User'), 'USER_NOT_FOUND')
    return me
}

// ----- guards re-exported for use by counsellor-invite.service.ts ----------

export { assertManagerOwnsCounsellor }
