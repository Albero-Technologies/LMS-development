// LearnHub wordmark — professional, sans-serif only, no italic flourishes.
// The graphite chevron sits beside the word; both scale via the `size` prop.
import { cn } from '@shared/helpers/cn'

type Props = {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    onDark?: boolean
}

const SIZE = {
    sm: { cube: 'w-6 h-6', text: 'text-sm', iconSize: 14 },
    md: { cube: 'w-7 h-7', text: 'text-[15px]', iconSize: 16 },
    lg: { cube: 'w-9 h-9', text: 'text-lg', iconSize: 20 }
} as const

export const Brand = ({ className, size = 'md', onDark = false }: Props) => {
    const s = SIZE[size]
    return (
        <div className={cn('flex items-center gap-2.5 select-none', className)}>
            <div
                className={cn(
                    s.cube,
                    'rounded-md flex items-center justify-center bg-[var(--color-brand-500)] shrink-0'
                )}
                aria-hidden>
                <svg
                    width={s.iconSize}
                    height={s.iconSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    {/* graduation cap — readable at any size */}
                    <path d="M3 9l9-4 9 4-9 4-9-4z" />
                    <path d="M7 11v4c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4" />
                </svg>
            </div>
            <span
                className={cn(
                    'font-semibold tracking-tight leading-none',
                    s.text,
                    onDark ? 'text-white' : 'text-fg'
                )}>
                LearnHub
            </span>
        </div>
    )
}
