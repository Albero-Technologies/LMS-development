import { describe, it, expect } from 'vitest'
import openapi from '../../src/docs/openapi'

describe('OpenAPI spec', () => {
    it('declares OpenAPI 3.x + has title and version', () => {
        expect(openapi.openapi.startsWith('3.')).toBe(true)
        expect(openapi.info.title).toContain('LearnHub')
        expect(openapi.info.version).toBeTruthy()
    })

    it('documents core Phase 1 endpoints', () => {
        const expected = [
            '/health',
            '/metrics',
            '/auth/login',
            '/auth/register',
            '/tenants/me',
            '/courses',
            '/enrollments',
            '/enrollments/verify-payment',
            '/quizzes',
            '/batches',
            '/leads',
            '/tickets',
            '/notifications',
            '/dashboard/me',
            '/uploads/avatars',
            '/webhooks/razorpay'
        ]
        for (const p of expected) {
            expect(openapi.paths, `missing path ${p}`).toHaveProperty(p)
        }
    })

    it('declares bearer auth + refresh cookie security schemes', () => {
        expect(openapi.components.securitySchemes).toHaveProperty('bearerAuth')
        expect(openapi.components.securitySchemes).toHaveProperty('refreshCookie')
    })

    it('every path uses known HTTP methods only', () => {
        const allowed = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'parameters'])
        for (const [p, ops] of Object.entries(openapi.paths)) {
            for (const verb of Object.keys(ops as object)) {
                expect(allowed.has(verb), `${p} uses unknown verb ${verb}`).toBe(true)
            }
        }
    })
})
