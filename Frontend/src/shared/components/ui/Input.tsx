import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@shared/helpers/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    hint?: string
    error?: string
    leftIcon?: ReactNode
    rightSlot?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, Props>(
    ({ label, hint, error, leftIcon, rightSlot, className, id, ...rest }, ref) => {
        const inputId = id ?? rest.name
        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-medium text-fg-soft">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-muted">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={cn('input', leftIcon && 'pl-9', rightSlot && 'pr-10', className)}
                        aria-invalid={!!error || undefined}
                        {...rest}
                    />
                    {rightSlot && <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>}
                </div>
                {error ? (
                    <p className="text-xs text-[var(--color-danger)]">{error}</p>
                ) : hint ? (
                    <p className="text-xs text-fg-muted">{hint}</p>
                ) : null}
            </div>
        )
    }
)
Input.displayName = 'Input'

type TAProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string
    hint?: string
    error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TAProps>(
    ({ label, hint, error, className, id, ...rest }, ref) => {
        const inputId = id ?? rest.name
        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-medium text-fg-soft">
                        {label}
                    </label>
                )}
                <textarea
                    id={inputId}
                    ref={ref}
                    className={cn('input min-h-24 resize-y', className)}
                    aria-invalid={!!error || undefined}
                    {...rest}
                />
                {error ? (
                    <p className="text-xs text-[var(--color-danger)]">{error}</p>
                ) : hint ? (
                    <p className="text-xs text-fg-muted">{hint}</p>
                ) : null}
            </div>
        )
    }
)
Textarea.displayName = 'Textarea'
