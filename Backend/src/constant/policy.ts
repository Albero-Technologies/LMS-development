import { Role } from '@prisma/client'

// Module × role read/write matrix.
// "OWNER" semantics (e.g. counsellor reads only own targets, manager only own team) are enforced
// inside services after the gate — this matrix is the broad-strokes filter.

export type TModule =
    | 'tenant'
    | 'user'
    | 'course'
    | 'lesson'
    | 'enrollment'
    | 'invoice'
    | 'payment'
    | 'quiz'
    | 'quiz_attempt'
    | 'assignment'
    | 'assignment_submission'
    | 'batch'
    | 'counsellor_invite'
    | 'counsellor_target'
    | 'counsellor_report'
    | 'counsellor_task'
    | 'counsellor_team'
    | 'monitoring'
    | 'ticket'
    | 'notification'
    | 'dashboard'

export type TAction = 'read' | 'write'

type TPolicy = Record<TModule, { read: Role[]; write: Role[] }>

const COUNSELLING_ROLES = [Role.COUNSELLING_MANAGER, Role.COUNSELLOR] as const

export const POLICY: TPolicy = {
    tenant: {
        read: [Role.SUPER_ADMIN, Role.ADMIN],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    user: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.COUNSELLING_MANAGER, Role.COUNSELLOR, Role.TRAINER],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLING_MANAGER]
    },
    course: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, ...COUNSELLING_ROLES, Role.SUPPORT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
    },
    lesson: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
    },
    enrollment: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.SUPPORT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    invoice: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    payment: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT]
    },
    quiz: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
    },
    quiz_attempt: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT]
    },
    assignment: {
        // Trainer/admin author + grade. Students read so they can see the brief.
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
    },
    assignment_submission: {
        // Students submit; staff read everything (their own listings filter
        // to "for assignments I authored / for my courses").
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT],
        write: [Role.STUDENT]
    },
    batch: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.SUPPORT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    counsellor_invite: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, ...COUNSELLING_ROLES],
        write: [Role.SUPER_ADMIN, Role.ADMIN, ...COUNSELLING_ROLES]
    },
    counsellor_target: {
        // Counsellors read their own; managers read team; admin reads all (enforced in service).
        read: [Role.SUPER_ADMIN, Role.ADMIN, ...COUNSELLING_ROLES],
        // Counsellors cannot set their own targets — managers and admins can.
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLING_MANAGER]
    },
    counsellor_report: {
        // Counsellor reads own report; manager reads team reports; admin reads all.
        read: [Role.SUPER_ADMIN, Role.ADMIN, ...COUNSELLING_ROLES],
        write: []
    },
    counsellor_task: {
        // Counsellor reads + updates status of own tasks; manager creates / assigns; admin everything.
        read: [Role.SUPER_ADMIN, Role.ADMIN, ...COUNSELLING_ROLES],
        write: [Role.SUPER_ADMIN, Role.ADMIN, ...COUNSELLING_ROLES]
    },
    counsellor_team: {
        // Roster of counsellors-under-manager. Managers + admin only.
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLING_MANAGER],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLING_MANAGER]
    },
    monitoring: {
        read: [Role.SUPER_ADMIN, Role.ADMIN],
        write: []
    },
    ticket: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.STUDENT, Role.TRAINER],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.STUDENT, Role.TRAINER]
    },
    notification: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, ...COUNSELLING_ROLES, Role.SUPPORT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    dashboard: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, ...COUNSELLING_ROLES, Role.SUPPORT],
        write: []
    }
}

export const can = (role: Role, module: TModule, action: TAction): boolean => POLICY[module][action].includes(role)
