import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@shared/helpers/cn'

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    size?: Size
    loading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
}

const VARIANT: Record<Variant, string> = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    subtle: 'btn-subtle',
    danger: 'btn-danger'
}

const SIZE: Record<Size, string> = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    icon: 'btn-icon',
    'icon-sm': 'btn-icon btn-sm'
}

export const Button = forwardRef<HTMLButtonElement, Props>(
    (
        { className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, disabled, type = 'button', ...rest },
        ref
    ) => (
        <button
            ref={ref}
            type={type}
            className={cn('btn', VARIANT[variant], SIZE[size], className)}
            disabled={disabled ?? loading}
            aria-busy={loading || undefined}
            {...rest}>
            {loading ? (
                <span
                    className="inline-block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin"
                    aria-hidden
                />
            ) : (
                leftIcon
            )}
            {children}
            {!loading && rightIcon}
        </button>
    )
)
Button.displayName = 'Button'
