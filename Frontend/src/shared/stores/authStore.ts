import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import type { TRole } from '@shared/constants/roles'

export type TAuthUser = {
    id: string
    tenantId: string
    email: string
    phone: string | null
    firstName: string
    lastName: string
    role: TRole
    avatarUrl?: string | null
    status?: string
}

// Display helper — most UI wants a single string. Falls back to email if both
// names are empty (e.g. legacy seed rows).
export const fullName = (u: Pick<TAuthUser, 'firstName' | 'lastName' | 'email'> | null | undefined): string => {
    if (!u) return ''
    const joined = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
    return joined || u.email
}

type AuthState = {
    user: TAuthUser | null
    accessToken: string | null
    hydrated: boolean
    persistent: boolean
    setAuth: (user: TAuthUser, accessToken: string, opts?: { remember?: boolean }) => void
    setAccessToken: (token: string) => void
    setUser: (user: TAuthUser) => void
    clear: () => void
    markHydrated: () => void
}

// "Remember me" decides where the persisted blob lives:
//  - checked  → localStorage  (survives browser restart, weeks-to-months)
//  - default  → sessionStorage (cleared when the tab/browser closes)
//
// A small flag in localStorage tells us which storage to read from on the
// next page load. setItem writes to the chosen storage and removes from the
// other so we never end up with stale state in both. removeItem nukes both
// for a clean logout.
const PERSIST_FLAG = 'learnhub.auth.persistent'

const isPersistent = (): boolean => {
    try {
        return typeof window !== 'undefined' && window.localStorage.getItem(PERSIST_FLAG) === '1'
    } catch {
        return false
    }
}

const switchingStorage: StateStorage = {
    getItem: (name) => {
        if (typeof window === 'undefined') return null
        try {
            return (isPersistent() ? window.localStorage : window.sessionStorage).getItem(name)
        } catch {
            return null
        }
    },
    setItem: (name, value) => {
        if (typeof window === 'undefined') return
        try {
            if (isPersistent()) {
                window.localStorage.setItem(name, value)
                window.sessionStorage.removeItem(name)
            } else {
                window.sessionStorage.setItem(name, value)
                window.localStorage.removeItem(name)
            }
        } catch {
            /* private mode — fine */
        }
    },
    removeItem: (name) => {
        if (typeof window === 'undefined') return
        try {
            window.localStorage.removeItem(name)
            window.sessionStorage.removeItem(name)
        } catch {
            /* private mode — fine */
        }
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            hydrated: false,
            persistent: isPersistent(),
            setAuth: (user, accessToken, opts) => {
                // The remember toggle lands BEFORE the persist middleware writes,
                // so the next setItem call routes to the right storage.
                if (typeof window !== 'undefined') {
                    try {
                        if (opts?.remember) window.localStorage.setItem(PERSIST_FLAG, '1')
                        else window.localStorage.removeItem(PERSIST_FLAG)
                    } catch {
                        /* private mode — fine */
                    }
                }
                set({ user, accessToken, persistent: !!opts?.remember })
            },
            setAccessToken: (accessToken) => set({ accessToken }),
            setUser: (user) => set({ user }),
            clear: () => {
                if (typeof window !== 'undefined') {
                    try {
                        window.localStorage.removeItem(PERSIST_FLAG)
                    } catch {
                        /* private mode — fine */
                    }
                }
                set({ user: null, accessToken: null, persistent: false })
            },
            markHydrated: () => set({ hydrated: true })
        }),
        {
            name: 'learnhub.auth',
            storage: createJSONStorage(() => switchingStorage),
            partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
            onRehydrateStorage: () => (state) => {
                state?.markHydrated()
            }
        }
    )
)
