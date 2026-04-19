import { Request, Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './enrollment.service'
import { writeAudit } from '../../util/audit'

export const start = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const body = req.body as { courseId: string; batchId?: string }
    const result = await service.startEnrollment(req.auth.tenantId, req.auth.userId, body.courseId, body.batchId)
    await writeAudit({ action: 'enrollment.start', entityType: 'Enrollment', entityId: result.enrollment.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const invoice = await service.verifyPayment(req.auth.tenantId, req.auth.userId, req.body)
    await writeAudit({ action: 'payment.verified', entityType: 'Invoice', entityId: invoice.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, invoice)
}

export const mine = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyEnrollments(req.auth.tenantId, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const adminList = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.adminListEnrollments(req.auth.tenantId, {
        courseId: req.query.courseId as string | undefined,
        userId: req.query.userId as string | undefined,
        status: req.query.status as never
    })
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

// --- Webhooks ---

export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
    const rawBody = (req as unknown as { rawBody?: string }).rawBody || JSON.stringify(req.body)
    const signature = (req.headers['x-razorpay-signature'] as string) || ''
    const result = await service.handleRazorpayWebhook(rawBody, signature)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const zohoBooksWebhook = async (req: Request, res: Response): Promise<void> => {
    const rawBody = (req as unknown as { rawBody?: string }).rawBody || JSON.stringify(req.body)
    const provided = (req.headers['x-zoho-signature'] as string) || (req.query.secret as string) || ''
    const result = await service.handleZohoBooksWebhook(rawBody, provided)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
