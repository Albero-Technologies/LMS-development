import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './payment.service'

export const pending = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyPendingInvoices(req.auth.tenantId, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const invoices = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyInvoices(req.auth.tenantId, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const pay = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.createOrderForInvoice(req.auth.tenantId, req.auth.userId, req.params.invoiceId)
    await writeAudit({ action: 'payment.order_created', entityType: 'Invoice', entityId: result.invoiceId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
