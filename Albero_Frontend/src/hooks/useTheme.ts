import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'albero-theme'

const readFromDom = (): Theme => {
    if (typeof document === 'undefined') return 'light'
    const attr = document.documentElement.getAttribute('data-theme')
    if (attr === 'light' || attr === 'dark') return attr
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'light' || stored === 'dark') return stored
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
}

// Single source of truth lives on `<html data-theme>` (set by the no-flash
// bootstrap script in index.html). Every useTheme caller subscribes to a
// MutationObserver on that attribute, so whenever ANY component toggles
// the theme, every other useTheme instance re-renders with the new value.
//
// Previously each useTheme had its own React state copy — so toggling the
// theme from the navbar updated the toggle button but left things like
// TechMeshSection reading the stale value until a refresh remounted them.
const subscribe = (notify: () => void) => {
    if (typeof document === 'undefined') return () => {}
    const observer = new MutationObserver(notify)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const onStorage = (e: StorageEvent) => {
        if (e.key !== STORAGE_KEY) return
        if (e.newValue === 'light' || e.newValue === 'dark') {
            // Storage events fire across tabs only — propagate cross-tab
            // toggles into this tab's DOM so the observer above triggers.
            document.documentElement.setAttribute('data-theme', e.newValue)
        }
    }
    window.addEventListener('storage', onStorage)
    return () => {
        observer.disconnect()
        window.removeEventListener('storage', onStorage)
    }
}

export function useTheme() {
    const theme = useSyncExternalStore(
        subscribe,
        readFromDom,
        // Server snapshot — Vite SPA never SSRs but the type still wants it.
        () => 'light' as Theme
    )

    const apply = useCallback((next: Theme) => {
        document.documentElement.setAttribute('data-theme', next)
        try {
            localStorage.setItem(STORAGE_KEY, next)
        } catch {
            /* ignore quota / private-mode errors */
        }
        // No setState here — the MutationObserver above will fire and
        // useSyncExternalStore will re-snapshot for ALL instances.
    }, [])

    const toggle = useCallback(() => {
        apply(theme === 'dark' ? 'light' : 'dark')
    }, [theme, apply])

    return { theme, setTheme: apply, toggle }
}
