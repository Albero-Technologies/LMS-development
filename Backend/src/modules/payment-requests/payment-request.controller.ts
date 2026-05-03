import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import AppError from '../../util/AppError'
import * as service from './payment-request.service'
import type {
    TCancelPaymentRequestInput,
    TCreatePaymentRequestInput,
    TListPaymentRequestsInput,
    TReviewPaymentRequestInput
} from './payment-request.schema'

const ctxFrom = (req: Request) => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    return { role: req.auth.role, tenantId: req.auth.tenantId, userId: req.auth.userId }
}

export const create = async (req: Request, res: Response): Promise<void> => {
    const data = await service.createPaymentRequest(req.body as TCreatePaymentRequestInput, ctxFrom(req))
    httpResponse(req, res, 201, responseMessage.CREATED, data)
}

export const list = async (req: Request, res: Response): Promise<void> => {
    const data = await service.listPaymentRequests(req.query as unknown as TListPaymentRequestsInput, ctxFrom(req))
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const review = async (req: Request, res: Response): Promise<void> => {
    const data = await service.reviewPaymentRequest(req.params.id, req.body as TReviewPaymentRequestInput, ctxFrom(req))
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const cancel = async (req: Request, res: Response): Promise<void> => {
    const data = await service.cancelPaymentRequest(req.params.id, req.body as TCancelPaymentRequestInput, ctxFrom(req))
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}
