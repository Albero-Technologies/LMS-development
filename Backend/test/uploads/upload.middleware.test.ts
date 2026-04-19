import { describe, it, expect } from 'vitest'
import path from 'path'
import { publicUrlFor } from '../../src/middleware/upload'

describe('upload/publicUrlFor', () => {
    it('rewrites an absolute disk path under public/ into a /uploads URL', () => {
        const abs = path.join(__dirname, '..', '..', 'public', 'uploads', 'avatars', 'tenant-1', 'abc.png')
        const url = publicUrlFor(abs)
        expect(url.startsWith('/uploads/')).toBe(true)
        expect(url).toContain('avatars/tenant-1/abc.png')
    })

    it('always normalises separators to forward slashes', () => {
        const abs = path.join(__dirname, '..', '..', 'public', 'uploads', 'ticket-attachments', 'tenant-x', 'file.pdf')
        const url = publicUrlFor(abs)
        expect(url.includes('\\')).toBe(false)
    })
})
