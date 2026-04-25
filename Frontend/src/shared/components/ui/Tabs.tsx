import { type ReactNode } from 'react'
import { cn } from '@shared/helpers/cn'

export type TabDef<TValue extends string> = {
    value: TValue
    label: ReactNode
    count?: number
    disabled?: boolean
}

type Props<TValue extends string> = {
    tabs: readonly TabDef<TValue>[]
    value: TValue
    onChange: (v: TValue) => void
    className?: string
}

export function Tabs<TValue extends string>({ tabs, value, onChange, className }: Props<TValue>) {
    return (
        <div
            role="tablist"
            className={cn('flex items-center gap-1 border-b -mx-1 px-1 overflow-x-auto', className)}>
            {tabs.map((t) => {
                const active = t.value === value
                return (
                    <button
                        key={t.value}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        disabled={t.disabled}
                        onClick={() => onChange(t.value)}
                        className={cn(
                            'relative px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                            active ? 'text-brand' : 'text-fg-soft hover:text-fg',
                            t.disabled && 'opacity-50 cursor-not-allowed'
                        )}>
                        <span className="inline-flex items-center gap-2">
                            {t.label}
                            {typeof t.count === 'number' && (
                                <span
                                    className={cn(
                                        'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold',
                                        active ? 'bg-[var(--color-brand-500)] text-white' : 'bg-surface-2 text-fg-muted'
                                    )}>
                                    {t.count}
                                </span>
                            )}
                        </span>
                        {active && (
                            <span
                                className="absolute inset-x-2 -bottom-px h-0.5 bg-[var(--color-brand-500)] rounded-full"
                                aria-hidden
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
