// Tenant-aware wordmark. Default props paint the platform identity
// ("LearnHub Platform"), but callers can override the wordmark text and
// supply a tenant-uploaded logo. When `logoUrl` is set, the brand cube is
// replaced with the actual logo image — falls back to the cap glyph if the
// image fails to load. Used in:
//   - AppLayout sidebar (renders the signed-in user's tenant brand, or the
//     platform identity for SUPER_ADMIN).
//   - PublicLayout (uses the platform default for unauthenticated marketing
//     pages where there's no tenant context yet).
import { useState } from 'react'
import { cn } from '@shared/helpers/cn'

type Props = {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    onDark?: boolean
    iconOnly?: boolean
    /** Wordmark text. Defaults to the platform identity. */
    name?: string
    /** Optional remote logo URL (tenant.brandingLogo). Falls back to the
     *  built-in glyph when missing OR when the URL fails to load. */
    logoUrl?: string | null
}

const SIZE = {
    sm: { cube: 'w-6 h-6', text: 'text-sm', iconSize: 14 },
    md: { cube: 'w-7 h-7', text: 'text-[15px]', iconSize: 16 },
    lg: { cube: 'w-9 h-9', text: 'text-lg', iconSize: 20 }
} as const

const PLATFORM_NAME = 'LearnHub Platform'

export const Brand = ({ className, size = 'md', onDark = false, iconOnly = false, name = PLATFORM_NAME, logoUrl }: Props) => {
    const s = SIZE[size]
    const [logoOk, setLogoOk] = useState(true)
    const showLogo = !!logoUrl && logoOk

    return (
        <div className={cn('flex items-center gap-2.5 select-none', className)}>
            <div
                className={cn(
                    s.cube,
                    'rounded-md flex items-center justify-center shrink-0 overflow-hidden',
                    showLogo ? 'bg-white/5' : 'bg-[var(--color-brand-500)]'
                )}
                aria-hidden>
                {showLogo ? (
                    <img
                        src={logoUrl as string}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={() => setLogoOk(false)}
                    />
                ) : (
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
                )}
            </div>
            {!iconOnly && (
                <span
                    className={cn(
                        'font-semibold tracking-tight leading-none whitespace-nowrap truncate max-w-[160px]',
                        s.text,
                        onDark ? 'text-white' : 'text-fg'
                    )}
                    title={name}>
                    {name}
                </span>
            )}
        </div>
    )
}
