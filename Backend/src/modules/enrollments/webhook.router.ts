import { Router } from 'express'
import * as ctrl from './enrollment.controller'
import { asyncHandler } from '../../middleware/asyncHandler'
import { webhookLimiter } from '../../config/rateLimiter'
import { type NextFunction, type Request, type Response } from 'express'
import httpError from '../../util/httpError'
import responseMessage from '../../constant/responseMessage'

// Rate-limit + raw-body parsing is wired at app.ts for these routes.
const router = Router()

const throttle = (req: Request, _: Response, next: NextFunction): void => {
    if (!webhookLimiter) return next()
    webhookLimiter
        .consume(req.ip ?? 'unknown', 1)
        .then(() => next())
        .catch(() => httpError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, 429))
}

router.post('/razorpay', throttle, asyncHandler(ctrl.razorpayWebhook))

export default router
