import { api } from '@shared/libs/api'
import type { TRole } from '@shared/constants/roles'

type Envelope<T> = { success: boolean; message: string; data: T }

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED'

export type UserRow = {
    id: string
    email: string
    role: TRole
    status: UserStatus
    firstName: string
    lastName: string
    phone: string | null
    avatarUrl: string | null
    lastLoginAt: string | null
    createdAt: string
    // Only populated for SUPER_ADMIN cross-tenant listing.
    tenant?: { id: string; name: string; slug: string }
}

export type UserListResponse = {
    items: UserRow[]
    total: number
    page: number
    pageSize: number
}

export type UserListQuery = {
    page?: number
    pageSize?: number
    role?: TRole
    status?: UserStatus
    q?: string
    /** Trainer scope — auto-filters to students enrolled in the actor's courses. */
    trainerScope?: 'me'
    /** Manager scope — auto-filters to counsellors reporting to the actor. */
    managerScope?: 'me'
    /** SUPER_ADMIN-only: scope to a specific tenant slug, or '__all__' for cross-tenant. */
    tenantSlug?: string
}

export const listUsers = async (query: UserListQuery): Promise<UserListResponse> => {
    const { data } = await api.get<Envelope<UserListResponse>>('/users', { params: query })
    return data.data
}

export type InviteUserPayload = { email: string; role: TRole; firstName?: string; lastName?: string }

export const inviteUser = async (payload: InviteUserPayload): Promise<{ inviteId: string; email: string; role: TRole; expiresAt: string }> => {
    const { data } = await api.post<Envelope<{ inviteId: string; email: string; role: TRole; expiresAt: string }>>('/users/invites', payload)
    return data.data
}

export const updateUserStatus = async (id: string, status: UserStatus): Promise<UserRow> => {
    const { data } = await api.patch<Envelope<UserRow>>(`/users/${id}`, { status })
    return data.data
}

// Rich user-detail payload used by the row-click modal. Includes onboarding
// signup metadata (address, education, professional, etc.), enrolments, and
// invoice history. Backend returns nullable refs for non-student roles.
export type UserInvoice = {
    id: string
    number: string
    totalAmount: number
    currency: string
    status: 'DRAFT' | 'DUE' | 'PAID' | 'FAILED' | 'REFUNDED'
    dueAt: string | null
    paidAt: string | null
    createdAt: string
    enrollment: { course: { title: string } | null } | null
}

export type UserEnrolment = {
    id: string
    status: string
    createdAt: string
    course: { id: string; title: string; slug: string } | null
}

export type StudentSignupExtra = {
    education?: { graduation?: Record<string, unknown>; masters?: Record<string, unknown> }
    professional?: Record<string, unknown>
    gap?: Record<string, unknown>
}

export type UserDetail = UserRow & {
    employeeCode: string | null
    managerId: string | null
    manager: { id: string; firstName: string; lastName: string; email: string } | null
    studentSignup: {
        id: string
        address: string | null
        city: string | null
        state: string | null
        qualification: string | null
        interest: string | null
        notes: string | null
        extra: StudentSignupExtra | null
        dateOfBirth: string | null
        counsellor: { id: string; firstName: string; lastName: string; email: string } | null
    } | null
    enrollments: UserEnrolment[]
    invoices: UserInvoice[]
}

export const getUserDetail = async (id: string): Promise<UserDetail> => {
    const { data } = await api.get<Envelope<UserDetail>>(`/users/${id}`)
    return data.data
}

export type UpdateUserPayload = {
    firstName?: string
    lastName?: string
    phone?: string
    role?: TRole
    status?: UserStatus
}

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<UserRow> => {
    const { data } = await api.patch<Envelope<UserRow>>(`/users/${id}`, payload)
    return data.data
}
