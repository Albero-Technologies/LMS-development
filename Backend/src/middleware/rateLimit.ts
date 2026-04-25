import { type NextFunction, type Request, type Response } from 'express'
import { globalLimiter } from '../config/rateLimiter'
import httpError from '../util/httpError'
import responseMessage from '../constant/responseMessage'

// Per-IP global rate limit — defaults to open if limiter not initialized (fail-open on boot).
export default (req: Request, _: Response, next: NextFunction): void => {
    if (!globalLimiter) return next()

    globalLimiter
        .consume(req.ip ?? 'unknown', 1)
        .then(() => next())
        .catch(() => {
            httpError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, 429)
        })
}
