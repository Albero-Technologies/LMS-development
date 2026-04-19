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

    it('counsellors manage their invite links; students cannot', () => {
        expect(can(Role.COUNSELLOR, 'counsellor_invite', 'read')).toBe(true)
        expect(can(Role.COUNSELLOR, 'counsellor_invite', 'write')).toBe(true)
        expect(can(Role.STUDENT, 'counsellor_invite', 'read')).toBe(false)
    })

    it('counsellors view targets; managers + admins write them', () => {
        expect(can(Role.COUNSELLOR, 'counsellor_target', 'read')).toBe(true)
        expect(can(Role.COUNSELLOR, 'counsellor_target', 'write')).toBe(false)
        expect(can(Role.COUNSELLING_MANAGER, 'counsellor_target', 'write')).toBe(true)
        expect(can(Role.ADMIN, 'counsellor_target', 'write')).toBe(true)
    })

    it('counsellor_team is manager + admin only', () => {
        expect(can(Role.COUNSELLING_MANAGER, 'counsellor_team', 'read')).toBe(true)
        expect(can(Role.COUNSELLING_MANAGER, 'counsellor_team', 'write')).toBe(true)
        expect(can(Role.COUNSELLOR, 'counsellor_team', 'read')).toBe(false)
        expect(can(Role.STUDENT, 'counsellor_team', 'read')).toBe(false)
    })

    it('both counselling roles read reports + tasks; counsellor writes own task', () => {
        expect(can(Role.COUNSELLOR, 'counsellor_report', 'read')).toBe(true)
        expect(can(Role.COUNSELLING_MANAGER, 'counsellor_report', 'read')).toBe(true)
        expect(can(Role.STUDENT, 'counsellor_report', 'read')).toBe(false)
        expect(can(Role.COUNSELLOR, 'counsellor_task', 'write')).toBe(true)
    })

    it('only admins read monitoring; nobody writes it', () => {
        expect(can(Role.ADMIN, 'monitoring', 'read')).toBe(true)
        expect(can(Role.COUNSELLOR, 'monitoring', 'read')).toBe(false)
        for (const r of Object.values(Role)) {
            expect(can(r, 'monitoring', 'write')).toBe(false)
        }
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
