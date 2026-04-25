import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'

// Custom install banner. The browser fires `beforeinstallprompt` once when the
// PWA is installable; we capture the event, hold it, and surface our own UI
// instead of relying on each browser's mini-bar (Chrome's address-bar icon is
// easy to miss, Safari iOS doesn't have one at all).
//
// Only shown to authenticated users — public marketing visitors get a sign-up
// path first, not an "install this app" pitch they don't have context for.
// Dismiss persists for 30 days so we don't nag every visit.

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const STORAGE_KEY = 'albero.pwa.install.dismissed'
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000
const SHOW_AFTER_MS = 8000

const isDismissed = (): boolean => {
    try {
        const v = localStorage.getItem(STORAGE_KEY)
        if (!v) return false
        const ts = Number(v)
        if (!Number.isFinite(ts)) return false
        return Date.now() - ts < DISMISS_TTL_MS
    } catch {
        return false
    }
}

export const PwaInstallPrompt = () => {
    const isAuthed = useAuthStore((s) => !!s.user)
    const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!isAuthed) return
        if (isDismissed()) return

        let timer: ReturnType<typeof setTimeout> | undefined
        const handler = (e: Event) => {
            e.preventDefault()
            setEvent(e as BeforeInstallPromptEvent)
            timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS)
        }

        window.addEventListener('beforeinstallprompt', handler as EventListener)

        // Hide the banner if the user installs through the browser's native UI mid-session.
        const installedHandler = () => {
            setVisible(false)
            setEvent(null)
        }
        window.addEventListener('appinstalled', installedHandler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler as EventListener)
            window.removeEventListener('appinstalled', installedHandler)
            if (timer) clearTimeout(timer)
        }
    }, [isAuthed])

    if (!isAuthed || !visible || !event) return null

    const handleInstall = async () => {
        try {
            await event.prompt()
            const result = await event.userChoice
            if (result.outcome === 'dismissed') {
                try {
                    localStorage.setItem(STORAGE_KEY, String(Date.now()))
                } catch {
                    /* private mode — fine */
                }
            }
        } finally {
            setVisible(false)
            setEvent(null)
        }
    }

    const handleDismiss = () => {
        setVisible(false)
        try {
            localStorage.setItem(STORAGE_KEY, String(Date.now()))
        } catch {
            /* private mode — fine */
        }
    }

    return (
        <div
            role="dialog"
            aria-label="Install Albero Academy"
            className="fixed bottom-4 right-4 z-[60] max-w-sm rounded-xl border border-[var(--color-border)] bg-surface shadow-[var(--shadow-lift)]">
            <div className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                    <Download size={18} />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-semibold text-fg">Install Albero Academy</div>
                    <p className="mt-0.5 text-xs text-fg-soft">Get a faster, app-like experience with offline access and push notifications.</p>
                    <div className="mt-3 flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleInstall}>
                            Install
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}>
                            Not now
                        </Button>
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Dismiss install prompt"
                    onClick={handleDismiss}
                    className="-mt-1 -mr-1 rounded p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg">
                    <X size={14} />
                </button>
            </div>
        </div>
    )
}
