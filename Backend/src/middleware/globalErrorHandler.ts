import { type NextFunction, type Request, type Response } from 'express'
import { type THttpErrror } from '../types/types'
import logger from '../util/logger'

// Last-resort error handler. Most errors flowing here are AppErrors with a
// proper statusCode + structured body, but a thrown native Error (e.g. a
// Prisma TypeError) can land here too — fall back to 500 + a serialized
// message instead of crashing the response with `res.status(undefined)`.
export default (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const e = err as Partial<THttpErrror> & { message?: string; name?: string; stack?: string }

    if (typeof e?.statusCode === 'number') {
        res.status(e.statusCode).json(err)
        return
    }

    // Unknown error shape — log it with the full stack so we can fix the
    // root cause, but don't leak internals to the client.
    logger.error('UNHANDLED_ERROR', {
        meta: {
            url: req.originalUrl,
            name: e?.name,
            message: e?.message,
            stack: e?.stack
        }
    })

    res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        data: null
    })
}
