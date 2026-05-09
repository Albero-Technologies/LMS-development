import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import AppError from '../../util/AppError'
import { writeAudit } from '../../util/audit'
import * as service from './demo-mode.service'
import type { TBulkUpdateDemoInput, TListDemoEnrolmentsInput, TSendPaymentReminderInput, TUpdateDemoEnrolmentInput } from './demo-mode.schema'

const ctxFrom = (req: Request) => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    return { role: req.auth.role, tenantId: req.auth.tenantId, userId: req.auth.userId }
}

export const list = async (req: Request, res: Response): Promise<void> => {
    const data = await service.listDemoEnrolments(req.query as unknown as TListDemoEnrolmentsInput, ctxFrom(req))
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    const enrolment = await service.updateDemoEnrolment(req.params.id, req.body as TUpdateDemoEnrolmentInput, ctxFrom(req))
    await writeAudit(
        {
            action: 'demo_mode.update',
            entityType: 'Enrollment',
            entityId: enrolment.id,
            tenantId: enrolment.tenantId,
            metadata: { accessTier: enrolment.accessTier, demoLessonLimit: enrolment.demoLessonLimit }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, enrolment)
}

export const bulk = async (req: Request, res: Response): Promise<void> => {
    const result = await service.bulkUpdateDemo(req.body as TBulkUpdateDemoInput, ctxFrom(req))
    await writeAudit(
        {
            action: 'demo_mode.bulk_update',
            metadata: { ok: result.ok.length, failed: result.failed.length, total: result.totalRequested }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const reminder = async (req: Request, res: Response): Promise<void> => {
    const result = await service.sendPaymentReminder(req.body as TSendPaymentReminderInput, ctxFrom(req))
    await writeAudit(
        {
            action: 'demo_mode.payment_reminder_sent',
            entityType: 'Enrollment',
            entityId: req.body.enrolmentId,
            metadata: { sentTo: result.sentTo, pendingAmount: result.pendingAmount }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
