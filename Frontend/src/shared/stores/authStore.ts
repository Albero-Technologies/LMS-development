import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TRole } from '@shared/constants/roles'

export type TAuthUser = {
    id: string
    tenantId: string
    email: string
    name: string
    role: TRole
    avatarUrl?: string | null
}

type AuthState = {
    user: TAuthUser | null
    accessToken: string | null
    hydrated: boolean
    setAuth: (user: TAuthUser, accessToken: string) => void
    setAccessToken: (token: string) => void
    setUser: (user: TAuthUser) => void
    clear: () => void
    markHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            hydrated: false,
            setAuth: (user, accessToken) => set({ user, accessToken }),
            setAccessToken: (accessToken) => set({ accessToken }),
            setUser: (user) => set({ user }),
            clear: () => set({ user: null, accessToken: null }),
            markHydrated: () => set({ hydrated: true })
        }),
        {
            name: 'learnhub.auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
            onRehydrateStorage: () => (state) => {
                state?.markHydrated()
            }
        }
    )
)
