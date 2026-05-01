import { api } from '@shared/libs/api'
import type { TAuthUser } from '@shared/stores/authStore'

type Envelope<T> = { success: boolean; message: string; data: T }

type LoginPayload = { email: string; password: string }
type RegisterPayload = { tenantName: string; email: string; password: string; firstName: string; lastName: string; phone?: string }

export type LoginResponse = { accessToken: string; user: TAuthUser }
export type UpdateProfilePayload = { firstName?: string; lastName?: string; phone?: string }

export const loginRequest = async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<Envelope<LoginResponse>>('/auth/login', payload)
    return data.data
}

export const registerRequest = async (payload: RegisterPayload): Promise<LoginResponse> => {
    const { data } = await api.post<Envelope<LoginResponse>>('/auth/register', payload)
    return data.data
}

export const forgotPasswordRequest = async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
}

export const meRequest = async (): Promise<TAuthUser> => {
    const { data } = await api.get<Envelope<{ user: TAuthUser }>>('/auth/me')
    return data.data.user
}

export const updateMeRequest = async (payload: UpdateProfilePayload): Promise<TAuthUser> => {
    const { data } = await api.patch<Envelope<{ user: TAuthUser }>>('/auth/me', payload)
    return data.data.user
}

export type ChangePasswordPayload = { currentPassword: string; newPassword: string }
export const changePasswordRequest = async (payload: ChangePasswordPayload): Promise<void> => {
    await api.post('/auth/me/password', payload)
}

export const logoutRequest = async (): Promise<void> => {
    await api.post('/auth/logout')
}
