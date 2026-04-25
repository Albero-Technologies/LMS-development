import { type NextFunction, type Request, type Response } from 'express'
import { type ZodSchema } from 'zod'
import httpError from '../util/httpError'

type TSource = 'body' | 'query' | 'params'

// Parse & replace req[source] with the typed, validated payload.
export const validate = <T>(schema: ZodSchema<T>, source: TSource = 'body') => {
    return (req: Request, _: Response, next: NextFunction): void => {
        const parsed = schema.safeParse(req[source])
        if (!parsed.success) {
            return httpError(next, parsed.error, req, 400)
        }
        // Express's Request fields are typed as the source schema for body/query/params,
        // but we're replacing them with the parsed/typed payload. Cast through Record so we
        // don't need `any` here.
        ;(req as unknown as Record<TSource, T>)[source] = parsed.data
        next()
    }
}
