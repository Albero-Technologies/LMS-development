import { Role } from '@prisma/client'

// 12-module × 7-role Verify/Edit matrix from PRD E1.
// Each module names the roles allowed to READ or WRITE.
// "OWNER" is handled at row level (not here): e.g. a student reads/writes their OWN enrollment.

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
    | 'batch'
    | 'counsellor_invite'
    | 'counsellor_target'
    | 'monitoring'
    | 'ticket'
    | 'notification'
    | 'dashboard'

export type TAction = 'read' | 'write'

type TPolicy = Record<TModule, { read: Role[]; write: Role[] }>

export const POLICY: TPolicy = {
    tenant: {
        read: [Role.SUPER_ADMIN, Role.ADMIN],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    user: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.COUNSELLOR, Role.TRAINER],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    course: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.COUNSELLOR, Role.SUPPORT, Role.CLIENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
    },
    lesson: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
    },
    enrollment: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.CLIENT, Role.SUPPORT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    invoice: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT, Role.CLIENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    payment: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT, Role.CLIENT],
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
    batch: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.CLIENT, Role.SUPPORT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    counsellor_invite: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLOR],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLOR]
    },
    counsellor_target: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.COUNSELLOR],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    monitoring: {
        read: [Role.SUPER_ADMIN, Role.ADMIN],
        write: []
    },
    ticket: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.STUDENT, Role.TRAINER, Role.CLIENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.STUDENT, Role.TRAINER, Role.CLIENT]
    },
    notification: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.COUNSELLOR, Role.SUPPORT, Role.CLIENT],
        write: [Role.SUPER_ADMIN, Role.ADMIN]
    },
    dashboard: {
        read: [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER, Role.STUDENT, Role.COUNSELLOR, Role.SUPPORT, Role.CLIENT],
        write: []
    }
}

export const can = (role: Role, module: TModule, action: TAction): boolean => POLICY[module][action].includes(role)
