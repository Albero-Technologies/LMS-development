import { NextFunction, Request, RequestHandler, Response } from 'express'
import httpError from '../util/httpError'
import AppError from '../util/AppError'

// Wrap async route handlers so thrown errors route through the global error handler.
export const asyncHandler = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
    return (req, res, next) => {
        handler(req, res, next).catch((err: unknown) => {
            const status = err instanceof AppError ? err.statusCode : 500
            httpError(next, err, req, status)
        })
    }
}
