import { cn } from '@shared/helpers/cn'
import { useAuthStore } from '@shared/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { getMyTenant } from '@features/admin/services/tenant.service'

// Tenant-branded loader (§2.1). Three cubes that scale + fade in sequence,
// painted in the tenant's brand color. Falls back to the platform aurora
// violet (`--color-brand-500`) for the unauth/public flow where we don't yet
// know which tenant is asking.
//
// Uses two predefined sizes: inline (small dot indicator) and full (centred,
// larger, intended as a Suspense fallback or initial-app loader).

interface Props {
    size?: 'sm' | 'md' | 'lg'
    label?: string
    fullscreen?: boolean
    className?: string
}

const SIZE = {
    sm: { cube: 'w-2 h-2', gap: 'gap-1.5' },
    md: { cube: 'w-3 h-3', gap: 'gap-2' },
    lg: { cube: 'w-4 h-4', gap: 'gap-2.5' }
} as const

export const BoxLoader = ({ size = 'md', label, fullscreen, className }: Props) => {
    // Only attempt the tenant lookup when authenticated — public/auth pages
    // would otherwise see a flash of platform color before the API responds.
    const isAuthed = useAuthStore((s) => !!s.accessToken)
    const tenantQuery = useQuery({
        queryKey: ['tenant', 'me'],
        queryFn: getMyTenant,
        enabled: isAuthed,
        staleTime: 5 * 60_000,
        retry: false
    })

    const color = tenantQuery.data?.brandingColor || 'var(--color-brand-500)'
    const s = SIZE[size]

    const inner = (
        <div
            className={cn('flex flex-col items-center', label && 'gap-3', className)}
            role="status"
            aria-live="polite">
            <div
                className={cn('flex items-end', s.gap)}
                aria-hidden>
                <span
                    className={cn(s.cube, 'rounded-sm box-loader-cube')}
                    style={{ background: color, animationDelay: '0ms' }}
                />
                <span
                    className={cn(s.cube, 'rounded-sm box-loader-cube')}
                    style={{ background: color, animationDelay: '160ms' }}
                />
                <span
                    className={cn(s.cube, 'rounded-sm box-loader-cube')}
                    style={{ background: color, animationDelay: '320ms' }}
                />
            </div>
            {label && <span className="text-xs text-fg-soft">{label}</span>}
            <span className="sr-only">Loading…</span>
        </div>
    )

    if (fullscreen) {
        return (
            <div
                className="fixed inset-0 grid place-items-center bg-bg/80 backdrop-blur-sm z-50"
                role="status"
                aria-live="polite">
                {inner}
            </div>
        )
    }
    return inner
}
