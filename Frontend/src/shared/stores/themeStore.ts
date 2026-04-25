import { create } from 'zustand'

// Three-mode theme: explicit light/dark, plus `system` which follows the OS
// `prefers-color-scheme` media query and updates live as the user flips it.
export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'learnhub.theme'

const prefersDark = (): boolean =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches

const resolveEffective = (t: Theme): 'light' | 'dark' => (t === 'system' ? (prefersDark() ? 'dark' : 'light') : t)

const readInitial = (): Theme => {
    if (typeof window === 'undefined') return 'light'
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    } catch {
        /* private mode — fall through */
    }
    return 'light'
}

const apply = (t: Theme) => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', resolveEffective(t))
    try {
        localStorage.setItem(STORAGE_KEY, t)
    } catch {
        /* storage blocked — just live with the in-memory toggle */
    }
}

type ThemeState = {
    theme: Theme
    setTheme: (t: Theme) => void
    toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: readInitial(),
    setTheme: (t) => {
        apply(t)
        set({ theme: t })
    },
    // The header toggle is binary — flip between explicit light/dark, ignoring
    // 'system' (so a user who's clicking the icon always gets a known state).
    toggle: () => {
        const current = get().theme
        const next: Theme = resolveEffective(current) === 'dark' ? 'light' : 'dark'
        apply(next)
        set({ theme: next })
    }
}))

// Live-update when the user is on `system` and the OS preference changes.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
        if (useThemeStore.getState().theme === 'system') {
            document.documentElement.setAttribute('data-theme', resolveEffective('system'))
        }
    }
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange)
    else if (typeof mq.addListener === 'function') mq.addListener(onChange)

    // Re-apply on boot so a `system` preference immediately reflects the OS state.
    apply(useThemeStore.getState().theme)
}
