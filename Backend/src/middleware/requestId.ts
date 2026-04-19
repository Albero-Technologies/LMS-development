import { NextFunction, Request, Response } from 'express'
import crypto from 'crypto'

// Assigns a correlation ID to every request so logs + errors can be traced end-to-end.
export default (req: Request, res: Response, next: NextFunction): void => {
    const incoming = (req.headers['x-request-id'] as string) || ''
    const id = incoming && /^[a-z0-9-]{8,64}$/i.test(incoming) ? incoming : crypto.randomUUID()
    req.requestId = id
    res.setHeader('x-request-id', id)
    next()
}
