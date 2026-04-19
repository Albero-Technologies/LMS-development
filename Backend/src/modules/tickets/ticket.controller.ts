import { Request, Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './ticket.service'
import { writeAudit } from '../../util/audit'

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.listTickets(req.auth.tenantId, req.auth.role, req.auth.userId, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const ticket = await service.getTicket(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id as string)
    httpResponse(req, res, 200, responseMessage.SUCCESS, ticket)
}

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const ticket = await service.createTicket(req.auth.tenantId, req.auth.userId, req.body)
    await writeAudit({ action: 'ticket.create', entityType: 'Ticket', entityId: ticket.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, ticket)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const ticket = await service.updateTicket(req.auth.tenantId, req.auth.role, req.params.id as string, req.body)
    await writeAudit({ action: 'ticket.update', entityType: 'Ticket', entityId: ticket.id, metadata: { status: ticket.status } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, ticket)
}

export const addComment = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const comment = await service.addComment(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id as string, req.body)
    httpResponse(req, res, 201, responseMessage.CREATED, comment)
}
