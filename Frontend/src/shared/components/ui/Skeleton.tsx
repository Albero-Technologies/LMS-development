import type { HTMLAttributes } from 'react'
import { cn } from '@shared/helpers/cn'

// Signature skeleton: hairline shimmer that uses the aurora violet at 8%.
export const Skeleton = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('relative overflow-hidden rounded-md bg-[color-mix(in_oklch,var(--color-ink-100)_6%,transparent)]', className)}
        {...rest}>
        <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/6 to-transparent animate-[shimmer_1.6s_infinite]"
            aria-hidden
        />
    </div>
)
