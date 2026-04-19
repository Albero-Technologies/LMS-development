import { Request } from 'express'
import responseMessage from '../constant/responseMessage'
import { THttpErrror } from '../types/types'
import config from '../config/config'
import { EApplicationEnvironment } from '../constant/application'
import logger from './logger'
import AppError from './AppError'
import { ZodError } from 'zod'

const isZodError = (err: unknown): err is ZodError =>
    err instanceof ZodError || (typeof err === 'object' && err !== null && (err as { name?: string }).name === 'ZodError')

export default (err: Error | unknown, req: Request, errorStatusCode = 500): THttpErrror => {
    let statusCode = errorStatusCode
    let code = 'INTERNAL_ERROR'
    let message = responseMessage.SOMETHING_WENT_WRONG
    let details: unknown = null

    if (err instanceof AppError) {
        statusCode = err.statusCode
        code = err.code
        message = err.message
        details = err.details
    } else if (isZodError(err)) {
        statusCode = 400
        code = 'VALIDATION_ERROR'
        message = responseMessage.VALIDATION_ERROR
        details = err.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
        }))
    } else if (err instanceof Error) {
        message = err.message || message
    }

    const errorObj: THttpErrror = {
        success: false,
        statusCode,
        code,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },
        message,
        data: null,
        details,
        trace: err instanceof Error ? { error: err.stack } : null
    }

    logger.error('CONTROLLER_ERROR', {
        meta: {
            statusCode,
            code,
            message,
            path: req.originalUrl,
            method: req.method
        }
    })

    if (config.ENV === EApplicationEnvironment.PRODUCTION) {
        delete errorObj.request.ip
        delete errorObj.trace
    }

    return errorObj
}
