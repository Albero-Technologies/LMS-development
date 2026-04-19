import { describe, it, expect } from 'vitest'
import { Request } from 'express'
import { z } from 'zod'
import errorObject from '../../src/util/errorObject'
import AppError from '../../src/util/AppError'

const req = {
    ip: '127.0.0.1',
    method: 'GET',
    originalUrl: '/api/v1/x',
    headers: {}
} as unknown as Request

describe('util/errorObject', () => {
    it('maps a plain Error to a 500 JSON envelope', () => {
        const out = errorObject(new Error('boom'), req, 500)
        expect(out.success).toBe(false)
        expect(out.statusCode).toBe(500)
        expect(out.code).toBe('INTERNAL_ERROR')
        expect(out.message).toBe('boom')
    })

    it('maps an AppError to its declared status + code', () => {
        const out = errorObject(AppError.forbidden('nope', 'ROLE_FORBIDDEN'), req)
        expect(out.statusCode).toBe(403)
        expect(out.code).toBe('ROLE_FORBIDDEN')
        expect(out.message).toBe('nope')
    })

    it('maps a ZodError to 400 + details', () => {
        const parsed = z.object({ email: z.string().email() }).safeParse({ email: 'nope' })
        expect(parsed.success).toBe(false)
        if (parsed.success) return
        const out = errorObject(parsed.error, req)
        expect(out.statusCode).toBe(400)
        expect(out.code).toBe('VALIDATION_ERROR')
        expect(Array.isArray(out.details)).toBe(true)
    })
})
