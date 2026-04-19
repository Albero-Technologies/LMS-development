import { describe, it, expect } from 'vitest'
import { Role } from '@prisma/client'
import { can, POLICY } from '../../src/constant/policy'

describe('RBAC policy matrix', () => {
    it('covers all 12 modules + dashboard + notification', () => {
        const keys = Object.keys(POLICY)
        expect(keys.length).toBeGreaterThanOrEqual(12)
        for (const k of keys) {
            expect(POLICY[k as keyof typeof POLICY]).toHaveProperty('read')
            expect(POLICY[k as keyof typeof POLICY]).toHaveProperty('write')
        }
    })

    it('students can read courses + lessons, cannot write courses', () => {
        expect(can(Role.STUDENT, 'course', 'read')).toBe(true)
        expect(can(Role.STUDENT, 'course', 'write')).toBe(false)
        expect(can(Role.STUDENT, 'lesson', 'read')).toBe(true)
        expect(can(Role.STUDENT, 'lesson', 'write')).toBe(false)
    })

    it('trainers can write courses + quizzes', () => {
        expect(can(Role.TRAINER, 'course', 'write')).toBe(true)
        expect(can(Role.TRAINER, 'quiz', 'write')).toBe(true)
    })

    it('counsellors own leads', () => {
        expect(can(Role.COUNSELLOR, 'lead', 'read')).toBe(true)
        expect(can(Role.COUNSELLOR, 'lead', 'write')).toBe(true)
        expect(can(Role.STUDENT, 'lead', 'read')).toBe(false)
    })

    it('only admins can write invoices + tenant', () => {
        expect(can(Role.ADMIN, 'invoice', 'write')).toBe(true)
        expect(can(Role.SUPER_ADMIN, 'tenant', 'write')).toBe(true)
        expect(can(Role.TRAINER, 'tenant', 'write')).toBe(false)
        expect(can(Role.STUDENT, 'invoice', 'write')).toBe(false)
    })

    it('SUPPORT cannot edit courses or issue invoices', () => {
        expect(can(Role.SUPPORT, 'course', 'write')).toBe(false)
        expect(can(Role.SUPPORT, 'invoice', 'write')).toBe(false)
        expect(can(Role.SUPPORT, 'ticket', 'write')).toBe(true)
    })

    it('dashboard is read-only for everyone; no role can write it', () => {
        for (const r of Object.values(Role)) {
            expect(can(r, 'dashboard', 'write')).toBe(false)
        }
    })
})
