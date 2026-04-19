import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, acceptInviteSchema } from '../../src/modules/auth/auth.schema'

describe('auth schemas', () => {
    describe('loginSchema', () => {
        it('accepts a valid login', () => {
            const res = loginSchema.safeParse({ email: 'a@b.io', password: 'x' })
            expect(res.success).toBe(true)
        })

        it('rejects bad email + missing password', () => {
            expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false)
            expect(loginSchema.safeParse({ email: 'a@b.io', password: '' }).success).toBe(false)
        })
    })

    describe('registerSchema', () => {
        const valid = {
            email: 'new@acme.dev',
            password: 'Passw0rd',
            firstName: 'New',
            lastName: 'Student',
            tenantSlug: 'acme'
        }

        it('accepts a complete valid payload', () => {
            expect(registerSchema.safeParse(valid).success).toBe(true)
        })

        it('rejects weak passwords', () => {
            expect(registerSchema.safeParse({ ...valid, password: 'shorty' }).success).toBe(false)
            expect(registerSchema.safeParse({ ...valid, password: 'letters-only' }).success).toBe(false)
            expect(registerSchema.safeParse({ ...valid, password: '12345678' }).success).toBe(false)
        })

        it('requires a tenantSlug', () => {
            const { tenantSlug: _, ...rest } = valid
            expect(registerSchema.safeParse(rest).success).toBe(false)
        })
    })

    describe('acceptInviteSchema', () => {
        it('requires token + strong password', () => {
            const res = acceptInviteSchema.safeParse({
                token: 'x'.repeat(64),
                password: 'Passw0rd',
                firstName: 'A',
                lastName: 'B'
            })
            expect(res.success).toBe(true)
        })

        it('rejects a short token', () => {
            const res = acceptInviteSchema.safeParse({
                token: 'short',
                password: 'Passw0rd',
                firstName: 'A',
                lastName: 'B'
            })
            expect(res.success).toBe(false)
        })
    })
})
