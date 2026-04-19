import { describe, it, expect } from 'vitest'
import { comparePassword, hashPassword, isStrongPassword } from '../../src/util/password'

describe('util/password', () => {
    it('hashes a password and roundtrips verify', async () => {
        const hash = await hashPassword('Secret123')
        expect(hash).not.toBe('Secret123')
        expect(await comparePassword('Secret123', hash)).toBe(true)
        expect(await comparePassword('Wrong1234', hash)).toBe(false)
    })

    it('accepts strong passwords and rejects weak ones', () => {
        expect(isStrongPassword('Passw0rd')).toBe(true)
        expect(isStrongPassword('abcdef12')).toBe(true)
        expect(isStrongPassword('short1')).toBe(false)
        expect(isStrongPassword('letters-only')).toBe(false)
        expect(isStrongPassword('12345678')).toBe(false)
    })
})
