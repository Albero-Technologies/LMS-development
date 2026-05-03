import { type Request, type Response } from 'express'
import { Role } from '@prisma/client'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import db from '../../service/db'
import AppError from '../../util/AppError'
import * as service from './ticket.service'
import { writeAudit } from '../../util/audit'

// SUPER_ADMIN can target any tenant via `?tenantId=<uuid>` so the platform
// account can monitor support tickets across tenants. Other roles silently
// ignore the override and stay on their JWT tenant.
const resolveTenantId = async (req: Request): Promise<string> => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED, 'NO_AUTH')
    const override = typeof req.query.tenantId === 'string' ? req.query.tenantId.trim() : ''
    if (override && req.auth.role === Role.SUPER_ADMIN) {
        const exists = await db.client.tenant.findUnique({ where: { id: override }, select: { id: true } })
        if (!exists) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
        return override
    }
    return req.auth.tenantId
}

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const result = await service.listTickets(tenantId, req.auth.role, req.auth.userId, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const ticket = await service.getTicket(tenantId, req.auth.role, req.auth.userId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, ticket)
}

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const ticket = await service.createTicket(tenantId, req.auth.userId, req.body)
    await writeAudit({ action: 'ticket.create', entityType: 'Ticket', entityId: ticket.id, tenantId }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, ticket)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const ticket = await service.updateTicket(tenantId, req.auth.role, req.params.id, req.body)
    await writeAudit({ action: 'ticket.update', entityType: 'Ticket', entityId: ticket.id, tenantId, metadata: { status: ticket.status } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, ticket)
}

export const addComment = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const comment = await service.addComment(tenantId, req.auth.role, req.auth.userId, req.params.id, req.body)
    httpResponse(req, res, 201, responseMessage.CREATED, comment)
}
