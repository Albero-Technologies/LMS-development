import { type Prisma, Role, TicketStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { type TAddCommentInput, type TCreateTicketInput, type TListTicketsQuery, type TUpdateTicketInput } from './ticket.schema'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'
import { emitToUser } from '../../service/socket'

const generateTicketNumber = async (tenantId: string): Promise<string> => {
    const prefix = new Date().toISOString().slice(0, 7).replace('-', '')
    const count = await db.client.ticket.count({ where: { tenantId, number: { startsWith: `T${prefix}-` } } })
    return `T${prefix}-${String(count + 1).padStart(4, '0')}`
}

const isStaffRole = (role: Role): boolean => role === Role.SUPER_ADMIN || role === Role.ADMIN || role === Role.SUPPORT

export const createTicket = async (tenantId: string, openerId: string, input: TCreateTicketInput) => {
    const number = await generateTicketNumber(tenantId)
    return db.client.ticket.create({
        data: {
            tenantId,
            number,
            openerId,
            subject: input.subject,
            description: input.description,
            priority: input.priority,
            status: TicketStatus.OPEN
        }
    })
}

export const listTickets = async (tenantId: string, role: Role, actorId: string, query: TListTicketsQuery) => {
    const where: Prisma.TicketWhereInput = { tenantId }
    // Non-staff roles only see their own tickets.
    if (!isStaffRole(role)) where.openerId = actorId
    if (query.status) where.status = query.status
    if (query.assigneeId) where.assigneeId = query.assigneeId

    const [items, total] = await Promise.all([
        db.client.ticket.findMany({
            where,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            include: {
                opener: { select: { id: true, firstName: true, lastName: true, email: true } },
                assignee: { select: { id: true, firstName: true, lastName: true } }
            }
        }),
        db.client.ticket.count({ where })
    ])

    return { items, total, page: query.page, pageSize: query.pageSize }
}

export const getTicket = async (tenantId: string, role: Role, actorId: string, id: string) => {
    const ticket = await db.client.ticket.findFirst({
        where: { id, tenantId },
        include: {
            opener: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignee: { select: { id: true, firstName: true, lastName: true } },
            comments: {
                orderBy: { createdAt: 'asc' },
                include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } }
            }
        }
    })
    if (!ticket) throw AppError.notFound(responseMessage.NOT_FOUND('Ticket'))
    if (!isStaffRole(role) && ticket.openerId !== actorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'TICKET_NOT_OWNED')
    }
    // Hide internal comments from non-staff.
    if (!isStaffRole(role)) {
        ticket.comments = ticket.comments.filter((c) => !c.internal)
    }
    return ticket
}

export const updateTicket = async (tenantId: string, role: Role, id: string, input: TUpdateTicketInput) => {
    if (!isStaffRole(role)) throw AppError.forbidden(responseMessage.FORBIDDEN, 'TICKET_STAFF_ONLY')
    const ticket = await db.client.ticket.findFirst({ where: { id, tenantId } })
    if (!ticket) throw AppError.notFound(responseMessage.NOT_FOUND('Ticket'))

    const updated = await db.client.ticket.update({
        where: { id },
        data: {
            subject: input.subject,
            priority: input.priority,
            status: input.status,
            assigneeId: input.assigneeId,
            resolvedAt: input.status === TicketStatus.RESOLVED || input.status === TicketStatus.CLOSED ? new Date() : undefined
        }
    })

    // Notify the opener on status change.
    if (input.status && input.status !== ticket.status) {
        await notifyQueue.add(NOTIFY_JOB, {
            tenantId,
            userId: ticket.openerId,
            template: 'ticket_update',
            data: { ticketNumber: ticket.number, status: input.status }
        })
    }

    // Real-time push so any open ticket views invalidate. Both opener and
    // assignee may have the page open; emit to both rooms.
    emitToUser(ticket.openerId, 'tickets:updated', { id: ticket.id })
    if (ticket.assigneeId && ticket.assigneeId !== ticket.openerId) {
        emitToUser(ticket.assigneeId, 'tickets:updated', { id: ticket.id })
    }

    return updated
}

export const addComment = async (tenantId: string, role: Role, authorId: string, ticketId: string, input: TAddCommentInput) => {
    const ticket = await db.client.ticket.findFirst({ where: { id: ticketId, tenantId } })
    if (!ticket) throw AppError.notFound(responseMessage.NOT_FOUND('Ticket'))

    if (!isStaffRole(role) && ticket.openerId !== authorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'TICKET_NOT_OWNED')
    }
    // Non-staff can never post internal comments.
    const internal = isStaffRole(role) ? input.internal : false

    const comment = await db.client.ticketComment.create({
        data: {
            ticketId,
            authorId,
            body: input.body,
            internal
        }
    })

    // Push to whichever party didn't write the comment. Internal notes go only
    // to staff (the assignee, if any).
    const targets = new Set<string>()
    if (internal) {
        if (ticket.assigneeId && ticket.assigneeId !== authorId) targets.add(ticket.assigneeId)
    } else {
        if (ticket.openerId !== authorId) targets.add(ticket.openerId)
        if (ticket.assigneeId && ticket.assigneeId !== authorId) targets.add(ticket.assigneeId)
    }
    for (const id of targets) emitToUser(id, 'tickets:updated', { id: ticket.id })

    return comment
}
