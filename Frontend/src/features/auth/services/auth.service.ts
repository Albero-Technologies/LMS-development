import { api } from '@shared/libs/api'
import type { TAuthUser } from '@shared/stores/authStore'

type Envelope<T> = { success: boolean; message: string; data: T }

type LoginPayload = { email: string; password: string }
type RegisterPayload = { tenantName: string; email: string; password: string; name: string; phone?: string }

export type LoginResponse = { accessToken: string; user: TAuthUser }

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
    const { data } = await api.get<Envelope<TAuthUser>>('/auth/me')
    return data.data
}

export const logoutRequest = async (): Promise<void> => {
    await api.post('/auth/logout')
}
