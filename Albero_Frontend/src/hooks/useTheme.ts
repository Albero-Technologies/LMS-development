import { useEffect, useState, useCallback } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'albero-theme'

function readInitial(): Theme {
    if (typeof window === 'undefined') return 'light'
    const attr = document.documentElement.getAttribute('data-theme') as Theme | null
    if (attr === 'light' || attr === 'dark') return attr
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(readInitial)

    const apply = useCallback((next: Theme) => {
        document.documentElement.setAttribute('data-theme', next)
        try {
            localStorage.setItem(STORAGE_KEY, next)
        } catch {
            /* ignore */
        }
        setThemeState(next)
    }, [])

    const toggle = useCallback(() => {
        apply(theme === 'dark' ? 'light' : 'dark')
    }, [theme, apply])

    // Sync across tabs
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
                document.documentElement.setAttribute('data-theme', e.newValue)
                setThemeState(e.newValue)
            }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    return { theme, setTheme: apply, toggle }
}
