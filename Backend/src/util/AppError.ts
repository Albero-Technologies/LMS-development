// Domain error — thrown inside services, translated to HTTP by controller/error handler.
export default class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly details?: unknown

    constructor(statusCode: number, message: string, code = 'APP_ERROR', details?: unknown) {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.details = details
        Object.setPrototypeOf(this, AppError.prototype)
    }

    static badRequest(msg: string, code = 'BAD_REQUEST', details?: unknown) {
        return new AppError(400, msg, code, details)
    }

    static unauthorized(msg: string, code = 'UNAUTHORIZED') {
        return new AppError(401, msg, code)
    }

    static forbidden(msg: string, code = 'FORBIDDEN') {
        return new AppError(403, msg, code)
    }

    static notFound(msg: string, code = 'NOT_FOUND') {
        return new AppError(404, msg, code)
    }

    static conflict(msg: string, code = 'CONFLICT') {
        return new AppError(409, msg, code)
    }

    static tooMany(msg: string, code = 'TOO_MANY_REQUESTS') {
        return new AppError(429, msg, code)
    }
}
