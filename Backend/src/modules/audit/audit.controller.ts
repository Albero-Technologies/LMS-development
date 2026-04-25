import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './audit.service'

const parseDate = (v: unknown): Date | undefined => {
    if (typeof v !== 'string' || v.length === 0) return undefined
    const d = new Date(v)
    return Number.isFinite(d.getTime()) ? d : undefined
}

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))

    const result = await service.listAuditLogs(
        { actorRole: req.auth.role, actorTenantId: req.auth.tenantId },
        {
            page,
            pageSize,
            tenantId: typeof req.query.tenantId === 'string' ? req.query.tenantId : undefined,
            userId: typeof req.query.userId === 'string' ? req.query.userId : undefined,
            action: typeof req.query.action === 'string' ? req.query.action : undefined,
            dateFrom: parseDate(req.query.dateFrom),
            dateTo: parseDate(req.query.dateTo),
            search: typeof req.query.search === 'string' ? req.query.search : undefined
        }
    )

    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
