import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@shared/stores/authStore'

// Single shared axios instance. All feature-level API callers use this.
export const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
})

// ---- Request: attach JWT ----------------------------------------------------

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
        config.headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return config
})

// ---- Response: refresh-token rotation on 401 -------------------------------
//
// On 401 we attempt /auth/refresh once, then retry the original request.
// A module-level promise guards against a thundering herd of parallel
// refreshes when many requests 401 at the same time.

let refreshInFlight: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
    if (refreshInFlight) return refreshInFlight
    refreshInFlight = axios
        .post<{ data: { accessToken: string } }>('/api/v1/auth/refresh', {}, { withCredentials: true })
        .then((res) => {
            const token = res.data?.data?.accessToken ?? null
            if (token) useAuthStore.getState().setAccessToken(token)
            return token
        })
        .catch(() => null)
        .finally(() => {
            // Release the lock one tick later so parallel resolvers see the same promise.
            setTimeout(() => {
                refreshInFlight = null
            }, 0)
        })
    return refreshInFlight
}

api.interceptors.response.use(
    (r) => r,
    async (err: AxiosError) => {
        const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
        if (err.response?.status === 401 && original && !original._retry) {
            original._retry = true
            const token = await refreshAccessToken()
            if (token) return api(original)
            useAuthStore.getState().clear()
        }
        return Promise.reject(err)
    }
)

// ---- API error extraction — all backend errors follow a consistent shape ---
// { success: false, statusCode, message, code?, details? }

export type ApiError = {
    statusCode: number
    message: string
    code?: string
    details?: unknown
}

export const toApiError = (err: unknown): ApiError => {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as Partial<ApiError> | undefined
        return {
            statusCode: err.response?.status ?? 0,
            message: data?.message ?? err.message ?? 'Network error',
            code: data?.code,
            details: data?.details
        }
    }
    return { statusCode: 0, message: err instanceof Error ? err.message : 'Unknown error' }
}
