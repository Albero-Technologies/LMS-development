import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import requestId from '../../src/middleware/requestId'

const makeReq = (headers: Record<string, string> = {}): Request => ({ headers }) as unknown as Request

const makeRes = (): Response => {
    const headers: Record<string, string> = {}
    return {
        setHeader: (k: string, v: string) => {
            headers[k.toLowerCase()] = v
        },
        getHeader: (k: string) => headers[k.toLowerCase()]
    } as unknown as Response
}

describe('middleware/requestId', () => {
    it('generates a uuid when no X-Request-Id is present', () => {
        const req = makeReq()
        const res = makeRes()
        const next = vi.fn()
        requestId(req, res, next)
        expect(req.requestId).toBeTruthy()
        expect((res.getHeader as (k: string) => string)('x-request-id')).toBe(req.requestId)
        expect(next).toHaveBeenCalledOnce()
    })

    it('trusts a well-formed incoming header', () => {
        const req = makeReq({ 'x-request-id': 'abc-123-xyz-789-000' })
        const res = makeRes()
        const next = vi.fn()
        requestId(req, res, next)
        expect(req.requestId).toBe('abc-123-xyz-789-000')
    })

    it('falls back to uuid if the incoming id looks suspicious', () => {
        const req = makeReq({ 'x-request-id': 'has spaces in it!' })
        const res = makeRes()
        const next = vi.fn()
        requestId(req, res, next)
        expect(req.requestId).not.toBe('has spaces in it!')
        expect(req.requestId?.length).toBeGreaterThan(8)
    })
})
