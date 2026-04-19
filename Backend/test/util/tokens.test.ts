import { describe, it, expect } from 'vitest'
import { Role } from '@prisma/client'
import {
    hashToken,
    randomToken,
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} from '../../src/util/tokens'

const base = { userId: 'user-1', tenantId: 'tenant-1', role: Role.ADMIN, tokenVersion: 3 }

describe('util/tokens', () => {
    it('signs and verifies an access token', () => {
        const token = signAccessToken(base)
        const decoded = verifyAccessToken(token)
        expect(decoded.sub).toBe('user-1')
        expect(decoded.tid).toBe('tenant-1')
        expect(decoded.role).toBe(Role.ADMIN)
        expect(decoded.ver).toBe(3)
        expect(decoded.typ).toBe('access')
    })

    it('refuses an access token when asked to verify as refresh', () => {
        const access = signAccessToken(base)
        expect(() => verifyRefreshToken(access)).toThrow()
    })

    it('refuses a refresh token when asked to verify as access', () => {
        const refresh = signRefreshToken(base)
        expect(() => verifyAccessToken(refresh)).toThrow()
    })

    it('hashToken is deterministic and different from the input', () => {
        const h1 = hashToken('hello')
        const h2 = hashToken('hello')
        const h3 = hashToken('world')
        expect(h1).toBe(h2)
        expect(h1).not.toBe('hello')
        expect(h1).not.toBe(h3)
        expect(h1).toMatch(/^[0-9a-f]{64}$/)
    })

    it('randomToken generates distinct hex strings', () => {
        const a = randomToken()
        const b = randomToken()
        expect(a).not.toBe(b)
        expect(a).toMatch(/^[0-9a-f]+$/)
        expect(a.length).toBe(64) // 32 bytes → 64 hex chars
    })
})
