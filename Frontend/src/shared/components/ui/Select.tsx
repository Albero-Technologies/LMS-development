import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@shared/helpers/cn'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string
    hint?: string
    error?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(({ label, hint, error, className, id, children, ...rest }, ref) => {
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
                <select
                    id={inputId}
                    ref={ref}
                    className={cn('input appearance-none pr-9', className)}
                    aria-invalid={!!error || undefined}
                    {...rest}>
                    {children}
                </select>
                <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted"
                />
            </div>
            {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : hint ? <p className="text-xs text-fg-muted">{hint}</p> : null}
        </div>
    )
})
Select.displayName = 'Select'
