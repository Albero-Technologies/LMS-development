import { type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { type TInviteUserInput, type TListUsersQuery, type TUpdateUserInput } from './user.schema'
import { createInvite } from '../auth/auth.service'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'

export const listUsers = async (tenantId: string, actorId: string, query: TListUsersQuery) => {
    const where: Prisma.UserWhereInput = { tenantId }
    if (query.role) where.role = query.role
    if (query.status) where.status = query.status
    if (query.q) {
        where.OR = [
            { email: { contains: query.q, mode: 'insensitive' } },
            { firstName: { contains: query.q, mode: 'insensitive' } },
            { lastName: { contains: query.q, mode: 'insensitive' } }
        ]
    }

    // §5.3 Phase B — relationship scopes that resolve via the auth context.
    if (query.trainerScope === 'me') {
        // Students enrolled in any course owned by the actor.
        where.role = Role.STUDENT
        where.enrollments = { some: { course: { trainerId: actorId } } }
    }
    if (query.managerScope === 'me') {
        // Counsellors directly reporting to the actor.
        where.role = Role.COUNSELLOR
        where.managerId = actorId
    }

    const [items, total] = await Promise.all([
        db.client.user.findMany({
            where,
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                lastLoginAt: true,
                createdAt: true
            }
        }),
        db.client.user.count({ where })
    ])

    return { items, total, page: query.page, pageSize: query.pageSize }
}

export const getUser = async (tenantId: string, id: string) => {
    const user = await db.client.user.findFirst({
        where: { id, tenantId },
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            lastLoginAt: true,
            createdAt: true
        }
    })
    if (!user) throw AppError.notFound(responseMessage.NOT_FOUND('User'), 'USER_NOT_FOUND')
    return user
}

export const updateUser = async (tenantId: string, id: string, input: TUpdateUserInput) => {
    const existing = await db.client.user.findFirst({ where: { id, tenantId } })
    if (!existing) throw AppError.notFound(responseMessage.NOT_FOUND('User'), 'USER_NOT_FOUND')

    // Role or status changes invalidate active sessions.
    const bumpTokenVersion = input.role !== undefined || input.status !== undefined
    const user = await db.client.user.update({
        where: { id },
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            role: input.role,
            status: input.status,
            ...(bumpTokenVersion ? { tokenVersion: { increment: 1 } } : {})
        }
    })
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName
    }
}

export const softDeleteUser = async (tenantId: string, id: string) => {
    const existing = await db.client.user.findFirst({ where: { id, tenantId } })
    if (!existing) throw AppError.notFound(responseMessage.NOT_FOUND('User'), 'USER_NOT_FOUND')
    await db.client.user.update({
        where: { id },
        data: { deletedAt: new Date(), tokenVersion: { increment: 1 } }
    })
}

export const invite = async (tenantId: string, invitedById: string, input: TInviteUserInput) => {
    // Prevent inviting an already-active user at the same email.
    const existing = await db.client.user.findUnique({
        where: { tenantId_email: { tenantId, email: input.email.toLowerCase() } }
    })
    if (existing && existing.status === 'ACTIVE') {
        throw AppError.conflict(responseMessage.ALREADY_EXISTS('User'), 'USER_ACTIVE')
    }

    const result = await createInvite(tenantId, input.email, input.role, invitedById)

    await notifyQueue.add(NOTIFY_JOB, {
        tenantId,
        toEmail: input.email.toLowerCase(),
        template: 'invite',
        data: { role: input.role, token: result.token }
    })

    return { inviteId: result.invite.id, email: result.invite.email, role: result.invite.role, expiresAt: result.invite.expiresAt }
}

export const allowedRolesToInvite = (actor: Role): Role[] => {
    if (actor === Role.SUPER_ADMIN) return Object.values(Role)
    if (actor === Role.ADMIN) return [Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.COUNSELLING_MANAGER, Role.COUNSELLOR, Role.SUPPORT]
    if (actor === Role.COUNSELLING_MANAGER) return [Role.COUNSELLOR]
    return []
}
