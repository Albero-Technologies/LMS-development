import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './public-purchase.service'

// All three handlers are public (no auth). The audit log captures actor
// info from the request even without a userId so we can reconstruct who
// initiated each step from IPs + user-agent.

export const init = async (req: Request, res: Response): Promise<void> => {
    const result = await service.initPurchase(req.body)
    await writeAudit(
        {
            action: 'purchase.init',
            entityType: 'Enquiry',
            entityId: result.purchaseId,
            metadata: { courseId: result.courseId, orderId: result.orderId, amount: result.amount }
        },
        req
    )
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}

export const verify = async (req: Request, res: Response): Promise<void> => {
    const result = await service.verifyPurchase(req.body)
    await writeAudit(
        {
            action: 'purchase.verify',
            entityType: 'Enquiry',
            entityId: req.body.purchaseId as string,
            metadata: { invoiceNumber: result.invoiceNumber, alreadyProcessed: result.alreadyProcessed }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const cancel = async (req: Request, res: Response): Promise<void> => {
    const result = await service.cancelPurchase(req.body)
    await writeAudit(
        {
            action: 'purchase.cancel',
            entityType: 'Enquiry',
            entityId: req.body.purchaseId as string
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
