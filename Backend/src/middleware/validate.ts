import { type NextFunction, type Request, type Response } from 'express'
import { type ZodSchema } from 'zod'
import httpError from '../util/httpError'

type TSource = 'body' | 'query' | 'params'

// Parse & overwrite req[source] with the validated/typed payload.
//
// Express 5 made `req.query` a read-only getter on the prototype, which means
// `req.query = parsed.data` throws "Cannot set property query…" and mutating
// the returned object in place doesn't necessarily stick because the getter
// can re-derive on access. We shadow the prototype's getter by defining an
// own data property on the request instance — controllers downstream then
// read the validated, typed payload directly through `req.query`.
export const validate = <T extends Record<string, unknown>>(schema: ZodSchema<T>, source: TSource = 'body') => {
    return (req: Request, _: Response, next: NextFunction): void => {
        const parsed = schema.safeParse(req[source])
        if (!parsed.success) {
            return httpError(next, parsed.error, req, 400)
        }
        Object.defineProperty(req, source, {
            value: parsed.data,
            writable: true,
            configurable: true,
            enumerable: true
        })
        next()
    }
}
