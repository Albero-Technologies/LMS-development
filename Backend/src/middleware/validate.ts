import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'
import httpError from '../util/httpError'

type TSource = 'body' | 'query' | 'params'

// Parse & replace req[source] with the typed, validated payload.
export const validate = <T>(schema: ZodSchema<T>, source: TSource = 'body') => {
    return (req: Request, _: Response, next: NextFunction): void => {
        const parsed = schema.safeParse(req[source])
        if (!parsed.success) return httpError(next, parsed.error, req, 400)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(req as any)[source] = parsed.data
        next()
    }
}
