import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'learnhub.theme'

const readInitial = (): Theme => {
    if (typeof document === 'undefined') return 'light'
    const attr = document.documentElement.getAttribute('data-theme')
    return attr === 'dark' ? 'dark' : 'light'
}

const apply = (t: Theme) => {
    document.documentElement.setAttribute('data-theme', t)
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
    toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        apply(next)
        set({ theme: next })
    }
}))
