import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@shared/helpers/cn'

type Props = {
    open: boolean
    onClose: () => void
    title?: string
    description?: string
    children: ReactNode
    footer?: ReactNode
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-3xl'
}

export const Modal = ({ open, onClose, title, description, children, footer, size = 'md', className }: Props) => {
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prevOverflow
        }
    }, [open, onClose])

    if (!open) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}>
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
            />
            <div className={cn('relative w-full bg-surface border rounded-lg shadow-lift flex flex-col max-h-[90vh]', SIZE[size], className)}>
                {(title || description) && (
                    <header className="flex items-start justify-between gap-4 p-5 border-b">
                        <div className="min-w-0">
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-base font-semibold text-fg">
                                    {title}
                                </h2>
                            )}
                            {description && <p className="mt-1 text-sm text-fg-soft">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close dialog"
                            className="btn btn-ghost btn-icon btn-sm shrink-0">
                            <X size={14} />
                        </button>
                    </header>
                )}
                <div className="p-5 overflow-y-auto flex-1">{children}</div>
                {footer && <footer className="p-4 border-t flex items-center justify-end gap-2">{footer}</footer>}
            </div>
        </div>,
        document.body
    )
}
