import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './notification.service'

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
    const result = await service.listMyNotifications(req.auth.tenantId, req.auth.userId, page, pageSize)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const markRead = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.markAsRead(req.auth.tenantId, req.auth.userId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}
