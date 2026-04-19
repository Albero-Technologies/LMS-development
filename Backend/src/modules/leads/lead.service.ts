import { Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import {
    TCreateInteractionInput,
    TCreateLeadInput,
    TListLeadsQuery,
    TMoveStageInput,
    TUpdateLeadInput
} from './lead.schema'

export const createLead = async (tenantId: string, actorId: string, input: TCreateLeadInput) => {
    return db.client.lead.create({
        data: {
            tenantId,
            createdById: actorId,
            name: input.name,
            email: input.email?.toLowerCase(),
            phone: input.phone,
            source: input.source,
            stage: input.stage,
            assignedToId: input.assignedToId ?? actorId,
            nextActionAt: input.nextActionAt,
            notes: input.notes
        }
    })
}

export const listLeads = async (tenantId: string, role: Role, actorId: string, query: TListLeadsQuery) => {
    const where: Prisma.LeadWhereInput = { tenantId }
    // Counsellors only see their own leads; admins see all.
    if (role === Role.COUNSELLOR) where.assignedToId = actorId
    if (query.stage) where.stage = query.stage
    if (query.assignedToId) where.assignedToId = query.assignedToId
    if (query.q) {
        where.OR = [
            { name: { contains: query.q, mode: 'insensitive' } },
            { email: { contains: query.q, mode: 'insensitive' } },
            { phone: { contains: query.q, mode: 'insensitive' } }
        ]
    }

    const [items, total] = await Promise.all([
        db.client.lead.findMany({
            where,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: [{ stage: 'asc' }, { createdAt: 'desc' }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize
        }),
        db.client.lead.count({ where })
    ])

    return { items, total, page: query.page, pageSize: query.pageSize }
}

export const getLead = async (tenantId: string, role: Role, actorId: string, id: string) => {
    const lead = await db.client.lead.findFirst({
        where: { id, tenantId },
        include: {
            interactions: {
                orderBy: { happenedAt: 'desc' },
                include: { user: { select: { id: true, firstName: true, lastName: true } } }
            },
            assignedTo: { select: { id: true, firstName: true, lastName: true } }
        }
    })
    if (!lead) throw AppError.notFound(responseMessage.NOT_FOUND('Lead'))
    if (role === Role.COUNSELLOR && lead.assignedToId !== actorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'LEAD_NOT_ASSIGNED')
    }
    return lead
}

export const updateLead = async (tenantId: string, role: Role, actorId: string, id: string, input: TUpdateLeadInput) => {
    const lead = await db.client.lead.findFirst({ where: { id, tenantId } })
    if (!lead) throw AppError.notFound(responseMessage.NOT_FOUND('Lead'))
    if (role === Role.COUNSELLOR && lead.assignedToId !== actorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'LEAD_NOT_ASSIGNED')
    }
    return db.client.lead.update({
        where: { id },
        data: {
            name: input.name,
            email: input.email?.toLowerCase(),
            phone: input.phone,
            source: input.source,
            stage: input.stage,
            assignedToId: input.assignedToId,
            nextActionAt: input.nextActionAt,
            notes: input.notes
        }
    })
}

export const moveStage = async (tenantId: string, role: Role, actorId: string, id: string, input: TMoveStageInput) => {
    const lead = await db.client.lead.findFirst({ where: { id, tenantId } })
    if (!lead) throw AppError.notFound(responseMessage.NOT_FOUND('Lead'))
    if (role === Role.COUNSELLOR && lead.assignedToId !== actorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'LEAD_NOT_ASSIGNED')
    }
    return db.client.lead.update({ where: { id }, data: { stage: input.stage } })
}

export const addInteraction = async (tenantId: string, actorId: string, leadId: string, input: TCreateInteractionInput) => {
    const lead = await db.client.lead.findFirst({ where: { id: leadId, tenantId } })
    if (!lead) throw AppError.notFound(responseMessage.NOT_FOUND('Lead'))

    return db.client.leadInteraction.create({
        data: {
            leadId,
            userId: actorId,
            type: input.type,
            note: input.note,
            durationSec: input.durationSec
        }
    })
}
