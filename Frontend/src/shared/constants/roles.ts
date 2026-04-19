// Seven roles — mirrors the backend Role enum (see Backend/prisma/schema.prisma).
export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    TRAINER: 'TRAINER',
    STUDENT: 'STUDENT',
    COUNSELLING_MANAGER: 'COUNSELLING_MANAGER',
    COUNSELLOR: 'COUNSELLOR',
    SUPPORT: 'SUPPORT',
    CLIENT: 'CLIENT'
} as const

export type TRole = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABEL: Record<TRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    TRAINER: 'Trainer',
    STUDENT: 'Student',
    COUNSELLING_MANAGER: 'Counselling Manager',
    COUNSELLOR: 'Counsellor',
    SUPPORT: 'Support',
    CLIENT: 'Client'
}

// Landing route per role after login.
export const ROLE_HOME: Record<TRole, string> = {
    SUPER_ADMIN: '/app/admin',
    ADMIN: '/app/admin',
    TRAINER: '/app/trainer',
    STUDENT: '/app/student',
    COUNSELLING_MANAGER: '/app/counsellor',
    COUNSELLOR: '/app/counsellor',
    SUPPORT: '/app/support',
    CLIENT: '/app/client'
}
