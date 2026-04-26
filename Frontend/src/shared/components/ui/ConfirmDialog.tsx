// Confirmation dialog for destructive or irreversible actions — drop-in
// replacement for `window.confirm()`. Backed by the project's Modal so it
// matches the rest of the UI and respects theme + branding.
//
// Two ways to use it:
//
// 1) Imperative (preferred for one-off action handlers):
//
//    const confirm = useConfirm()
//    const ok = await confirm({
//        title: 'Delete course?',
//        description: 'Existing enrolments stay, the course is hidden from the catalog.',
//        confirmLabel: 'Delete',
//        tone: 'danger'
//    })
//    if (ok) deleteCourse()
//
// 2) Declarative (controlled by a parent):
//
//    <ConfirmDialog
//        open={open}
//        onClose={() => setOpen(false)}
//        onConfirm={() => doIt()}
//        title="..." description="..." tone="danger"
//    />
//
// Imperative wins because it keeps every call site to one line and removes
// the per-component "open / pending / target" state-machine boilerplate.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export type ConfirmTone = 'danger' | 'warning' | 'info'

export type ConfirmOptions = {
    title: string
    description?: ReactNode
    confirmLabel?: string
    cancelLabel?: string
    tone?: ConfirmTone
}

const TONE_ICON: Record<ConfirmTone, typeof AlertTriangle> = {
    danger: AlertTriangle,
    warning: AlertCircle,
    info: Info
}

const TONE_CHIP: Record<ConfirmTone, string> = {
    danger: 'bg-[var(--color-danger-50,rgba(239,68,68,0.12))] text-[var(--color-danger,#ef4444)]',
    warning: 'bg-[var(--color-warning-50,rgba(234,179,8,0.12))] text-[var(--color-warning,#eab308)]',
    info: 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
}

const TONE_BUTTON: Record<ConfirmTone, 'danger' | 'primary'> = {
    danger: 'danger',
    warning: 'primary',
    info: 'primary'
}

export const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'info',
    loading = false
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description?: ReactNode
    confirmLabel?: string
    cancelLabel?: string
    tone?: ConfirmTone
    loading?: boolean
}) => {
    const Icon = TONE_ICON[tone]
    const buttonVariant = TONE_BUTTON[tone]
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="sm">
            <div className="flex items-start gap-3">
                <span className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${TONE_CHIP[tone]}`}>
                    <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-fg">{title}</h2>
                    {description && <div className="mt-1.5 text-sm text-fg-soft leading-relaxed">{description}</div>}
                </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}>
                    {cancelLabel}
                </Button>
                <Button
                    // Buttons in this codebase use `variant`; `danger` is the
                    // red destructive variant, `primary` the brand-coloured
                    // default. Falls back gracefully if the variant doesn't
                    // exist (renders as primary).
                    variant={buttonVariant as 'danger' | 'primary'}
                    loading={loading}
                    onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    )
}

// ---- Imperative API -------------------------------------------------------

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

interface PendingState extends ConfirmOptions {
    resolve: (ok: boolean) => void
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
    const [pending, setPending] = useState<PendingState | null>(null)

    const confirm: ConfirmFn = useCallback(
        (opts) =>
            new Promise<boolean>((resolve) => {
                setPending({ ...opts, resolve })
            }),
        []
    )

    const close = (ok: boolean) => {
        if (!pending) return
        pending.resolve(ok)
        setPending(null)
    }

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {pending && (
                <ConfirmDialog
                    open
                    onClose={() => close(false)}
                    onConfirm={() => close(true)}
                    title={pending.title}
                    description={pending.description}
                    confirmLabel={pending.confirmLabel}
                    cancelLabel={pending.cancelLabel}
                    tone={pending.tone}
                />
            )}
        </ConfirmContext.Provider>
    )
}

export const useConfirm = (): ConfirmFn => {
    const ctx = useContext(ConfirmContext)
    if (!ctx) throw new Error('useConfirm must be called inside <ConfirmProvider>')
    return ctx
}
