import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './user.service'
import AppError from '../../util/AppError'
import { writeAudit } from '../../util/audit'

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.listUsers(req.auth.tenantId, req.auth.userId, req.auth.role, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const user = await service.getUser(req.auth.tenantId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, user)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const user = await service.updateUser(req.auth.tenantId, req.params.id, req.auth.userId, req.body)
    await writeAudit({ action: 'user.update', entityType: 'User', entityId: user.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, user)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.softDeleteUser(req.auth.tenantId, req.params.id)
    await writeAudit({ action: 'user.delete', entityType: 'User', entityId: req.params.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const invite = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const allowed = service.allowedRolesToInvite(req.auth.role)
    if (!allowed.includes(req.body.role)) {
        throw AppError.forbidden('You cannot invite this role', 'INVITE_ROLE_FORBIDDEN')
    }
    const result = await service.invite(req.auth.tenantId, req.auth.userId, req.body)
    await writeAudit({ action: 'user.invite', entityType: 'User', metadata: { email: result.email, role: result.role } }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}
