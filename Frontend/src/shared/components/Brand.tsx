// Albero Academy wordmark — professional, sans-serif only, no italic flourishes.
// The brand cube sits beside the wordmark; both scale via the `size` prop.
// Pass `iconOnly` (e.g. when the sidebar is collapsed) to render just the cube.
import { cn } from '@shared/helpers/cn'

type Props = {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    onDark?: boolean
    iconOnly?: boolean
}

const SIZE = {
    sm: { cube: 'w-6 h-6', text: 'text-sm', iconSize: 14 },
    md: { cube: 'w-7 h-7', text: 'text-[15px]', iconSize: 16 },
    lg: { cube: 'w-9 h-9', text: 'text-lg', iconSize: 20 }
} as const

export const Brand = ({ className, size = 'md', onDark = false, iconOnly = false }: Props) => {
    const s = SIZE[size]
    return (
        <div className={cn('flex items-center gap-2.5 select-none', className)}>
            <div
                className={cn(s.cube, 'rounded-md flex items-center justify-center bg-[var(--color-brand-500)] shrink-0')}
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
                    <path d="M3 9l9-4 9 4-9 4-9-4z" />
                    <path d="M7 11v4c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4" />
                </svg>
            </div>
            {!iconOnly && (
                <span className={cn('font-semibold tracking-tight leading-none whitespace-nowrap', s.text, onDark ? 'text-white' : 'text-fg')}>
                    Albero Academy
                </span>
            )}
        </div>
    )
}
