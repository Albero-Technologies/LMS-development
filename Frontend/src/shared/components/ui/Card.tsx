import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@shared/helpers/cn'

type Props = HTMLAttributes<HTMLDivElement> & {
    padded?: boolean
    children: ReactNode
}

export const Card = ({ padded = true, className, children, ...rest }: Props) => (
    <div
        className={cn('card', padded && 'p-5', className)}
        {...rest}>
        {children}
    </div>
)

type StatProps = {
    label: string
    value: ReactNode
    delta?: string
    tone?: 'neutral' | 'up' | 'down'
    icon?: ReactNode
    accent?: 'brand' | 'purple' | 'teal' | 'orange' | 'pink'
}

const ACCENT_FILL: Record<NonNullable<StatProps['accent']>, string> = {
    brand: 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]',
    purple: 'bg-[var(--color-purple-soft)] text-[var(--color-purple)]',
    teal: 'bg-[var(--color-teal-soft)] text-[var(--color-teal)]',
    orange: 'bg-[var(--color-orange-soft)] text-[var(--color-orange)]',
    pink: 'bg-[var(--color-pink-soft)] text-[var(--color-pink)]'
}

export const StatCard = ({ label, value, delta, tone = 'neutral', icon, accent = 'brand' }: StatProps) => (
    <div className="card p-3.5 sm:p-5 h-full">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-medium text-fg-muted">{label}</div>
                <div className="mt-1.5 sm:mt-2 text-[1.4rem] sm:text-[1.75rem] font-bold tracking-tight text-fg font-mono leading-none">{value}</div>
                {delta && (
                    <div
                        className={cn(
                            'mt-1.5 sm:mt-2 text-[10.5px] sm:text-xs font-medium inline-flex items-center gap-1',
                            tone === 'up' && 'text-[var(--color-success)]',
                            tone === 'down' && 'text-[var(--color-danger)]',
                            tone === 'neutral' && 'text-fg-muted'
                        )}>
                        {delta}
                    </div>
                )}
            </div>
            {icon && <div className={cn('shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center', ACCENT_FILL[accent])}>{icon}</div>}
        </div>
    </div>
)
