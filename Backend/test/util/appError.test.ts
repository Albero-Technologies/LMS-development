import { describe, it, expect } from 'vitest'
import AppError from '../../src/util/AppError'

describe('util/AppError', () => {
    it('assigns status + code + message', () => {
        const err = new AppError(418, 'teapot', 'TEAPOT')
        expect(err).toBeInstanceOf(Error)
        expect(err.statusCode).toBe(418)
        expect(err.code).toBe('TEAPOT')
        expect(err.message).toBe('teapot')
    })

    it('static helpers set the right status codes', () => {
        expect(AppError.badRequest('x').statusCode).toBe(400)
        expect(AppError.unauthorized('x').statusCode).toBe(401)
        expect(AppError.forbidden('x').statusCode).toBe(403)
        expect(AppError.notFound('x').statusCode).toBe(404)
        expect(AppError.conflict('x').statusCode).toBe(409)
        expect(AppError.tooMany('x').statusCode).toBe(429)
    })

    it('preserves instanceof across throw/catch', () => {
        try {
            throw AppError.forbidden('nope', 'FORBIDDEN_XYZ')
        } catch (e) {
            expect(e).toBeInstanceOf(AppError)
            expect((e as AppError).code).toBe('FORBIDDEN_XYZ')
        }
    })
})
