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
