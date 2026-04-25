import { type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { type TInviteUserInput, type TListUsersQuery, type TUpdateUserInput } from './user.schema'
import { createInvite } from '../auth/auth.service'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'

export const listUsers = async (
    tenantId: string,
    actorId: string,
    actorRole: Role,
    query: TListUsersQuery & { tenantSlug?: string }
) => {
    // SUPER_ADMIN can scope to any tenant via ?tenantSlug=foo, or pass
    // tenantSlug=__all__ to list across every customer tenant (the platform
    // tenant — where the SA themselves lives — is excluded so it stays
    // hidden from the customer-tenant management view). Everyone else is
    // locked to their own tenant by the auth context.
    let where: Prisma.UserWhereInput = { tenantId, deletedAt: null }
    if (actorRole === Role.SUPER_ADMIN) {
        if (query.tenantSlug === '__all__') {
            where = { deletedAt: null, tenant: { slug: { not: 'platform' } } }
        } else if (query.tenantSlug) {
            const t = await db.client.tenant.findUnique({ where: { slug: query.tenantSlug }, select: { id: true } })
            where = { tenantId: t?.id ?? '__none__', deletedAt: null }
        }
    }
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

    // Counsellors are auto-scoped to their own students — i.e. anyone who
    // signed up through one of their share-links. Otherwise they'd see the
    // full tenant directory which they have no business managing.
    if (actorRole === Role.COUNSELLOR && query.trainerScope !== 'me' && query.managerScope !== 'me') {
        where.role = Role.STUDENT
        where.studentSignup = { is: { counsellorId: actorId } }
    }

    // Prisma rejects `false` in a `select` block for relations — you either
    // include the key with a select object or omit it entirely. So we build
    // the select as a Prisma type and add the tenant join only for SAs.
    const baseSelect = {
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
    } satisfies Prisma.UserSelect

    const userSelect: Prisma.UserSelect =
        actorRole === Role.SUPER_ADMIN
            ? { ...baseSelect, tenant: { select: { id: true, name: true, slug: true } } }
            : baseSelect

    const [items, total] = await Promise.all([
        db.client.user.findMany({
            where,
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            orderBy: { createdAt: 'desc' },
            select: userSelect
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
            createdAt: true,
            employeeCode: true,
            managerId: true,
            manager: { select: { id: true, firstName: true, lastName: true, email: true } },
            // Hydrate the full picture for the detail modal — onboarding form
            // submission (signup) for students, plus an invoice history for
            // the fees view, plus enrolment summary.
            studentSignup: {
                select: {
                    id: true,
                    address: true,
                    city: true,
                    state: true,
                    qualification: true,
                    interest: true,
                    notes: true,
                    extra: true,
                    dateOfBirth: true,
                    counsellor: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
            },
            enrollments: {
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    course: { select: { id: true, title: true, slug: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            },
            invoices: {
                select: {
                    id: true,
                    number: true,
                    totalAmount: true,
                    currency: true,
                    status: true,
                    dueAt: true,
                    paidAt: true,
                    createdAt: true,
                    enrollment: { select: { course: { select: { title: true } } } }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            }
        }
    })
    if (!user) throw AppError.notFound(responseMessage.NOT_FOUND('User'), 'USER_NOT_FOUND')
    return user
}

export const updateUser = async (tenantId: string, id: string, actorId: string, input: TUpdateUserInput) => {
    const existing = await db.client.user.findFirst({ where: { id, tenantId } })
    if (!existing) throw AppError.notFound(responseMessage.NOT_FOUND('User'), 'USER_NOT_FOUND')

    // A user cannot suspend or downgrade themselves — that's a fast way to
    // lock yourself out of your own tenant.
    if (id === actorId && (input.status === 'SUSPENDED' || (input.role && input.role !== existing.role))) {
        throw AppError.badRequest('You cannot change your own role or status', 'SELF_MODIFY_FORBIDDEN')
    }

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
