// Inline SVG / CSS decorative layers — used by section renderers as
// backgrounds. All inline so no asset pipeline involvement; all positioned
// absolutely so they sit behind content.
//
// Pieces:
//
//   <DotGrid>     — Repeating dot pattern. Use behind hero / CTA banners
//                    to add tactile texture without competing visually.
//   <BrandOrb>    — Soft animated gradient orb. Drops behind hero image
//                    cards for a Linear/Stripe-style glow.
//   <MeshBg>      — Multi-stop radial mesh gradient. Replaces flat fills
//                    on hero / CTA backgrounds.
//   <NoiseLayer>  — Subtle SVG noise overlay. Cuts the perceived flatness
//                    of large brand-coloured surfaces.
//   <IsoGrid>     — Fading isometric grid. Use sparingly behind feature
//                    sections that need a "blueprint" feel.

import type { CSSProperties } from 'react'

interface DotGridProps {
    className?: string
    size?: number
    opacity?: number
    color?: string
}

export const DotGrid = ({ className, size = 24, opacity = 0.18, color = 'currentColor' }: DotGridProps) => {
    const style: CSSProperties = {
        backgroundImage: `radial-gradient(circle at 1px 1px, ${color} 1px, transparent 0)`,
        backgroundSize: `${size}px ${size}px`,
        opacity
    }
    return (
        <div
            aria-hidden
            className={`absolute inset-0 pointer-events-none ${className ?? ''}`}
            style={style}
        />
    )
}

interface BrandOrbProps {
    className?: string
    /** Optional inline style for positioning + size. */
    style?: CSSProperties
}

// Animated gradient orb — pure CSS keyframe (drift + pulse). Used as a
// decorative layer behind hero cards or in empty corners. The animation is
// always-on (CSS-driven) but pauses gracefully under prefers-reduced-motion
// via the global rule in index.css.
export const BrandOrb = ({ className, style }: BrandOrbProps) => (
    <div
        aria-hidden
        className={`brand-orb pointer-events-none ${className ?? ''}`}
        style={style}
    />
)

interface MeshBgProps {
    className?: string
    /** "light" overlays a soft brand mesh; "dark" overlays a deep brand mesh. */
    tone?: 'light' | 'dark' | 'sunrise'
}

const MESH_BG: Record<NonNullable<MeshBgProps['tone']>, string> = {
    light:
        'radial-gradient(45% 40% at 10% 10%, color-mix(in srgb, var(--color-brand-500) 18%, transparent) 0%, transparent 70%), radial-gradient(35% 30% at 90% 80%, color-mix(in srgb, var(--color-brand-300) 22%, transparent) 0%, transparent 70%), radial-gradient(40% 35% at 50% 110%, color-mix(in srgb, var(--color-purple) 14%, transparent) 0%, transparent 70%)',
    dark:
        'radial-gradient(50% 45% at 0% 0%, color-mix(in srgb, var(--color-brand-300) 30%, var(--color-brand-700)) 0%, var(--color-brand-700) 50%, var(--color-brand-900) 100%)',
    sunrise:
        'radial-gradient(60% 55% at 50% 0%, color-mix(in srgb, var(--color-orange) 28%, transparent) 0%, transparent 65%), radial-gradient(40% 40% at 0% 100%, color-mix(in srgb, var(--color-pink) 22%, transparent) 0%, transparent 65%), radial-gradient(50% 50% at 100% 100%, color-mix(in srgb, var(--color-brand-500) 22%, transparent) 0%, transparent 65%)'
}

export const MeshBg = ({ className, tone = 'light' }: MeshBgProps) => (
    <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none ${className ?? ''}`}
        style={{ background: MESH_BG[tone] }}
    />
)

interface NoiseLayerProps {
    opacity?: number
    className?: string
}

// SVG fractal noise — gives large brand-coloured surfaces a film-grain feel
// without resorting to a raster asset. Light opacity by default; bumping it
// past 0.2 starts to feel "TV static" rather than "premium texture".
export const NoiseLayer = ({ opacity = 0.08, className }: NoiseLayerProps) => (
    <svg
        aria-hidden
        className={`absolute inset-0 w-full h-full pointer-events-none ${className ?? ''}`}
        style={{ opacity, mixBlendMode: 'overlay' }}>
        <filter id="noise">
            <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="2"
                stitchTiles="stitch"
            />
            <feColorMatrix
                type="saturate"
                values="0"
            />
        </filter>
        <rect
            width="100%"
            height="100%"
            filter="url(#noise)"
        />
    </svg>
)

interface IsoGridProps {
    className?: string
    opacity?: number
}

// Faded isometric grid — gives feature sections a subtle "blueprint" base
// without committing to a hand-drawn illustration. Lines are var-driven so
// the grid picks up the active brand colour.
export const IsoGrid = ({ className, opacity = 0.07 }: IsoGridProps) => (
    <svg
        aria-hidden
        className={`absolute inset-0 w-full h-full pointer-events-none ${className ?? ''}`}
        style={{ opacity }}
        preserveAspectRatio="xMidYMid slice">
        <defs>
            <pattern
                id="iso"
                width="60"
                height="35"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(0)">
                <path
                    d="M0 17.5 L30 0 L60 17.5 L30 35 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.7"
                />
            </pattern>
            <radialGradient
                id="iso-fade"
                cx="50%"
                cy="50%"
                r="60%">
                <stop
                    offset="0%"
                    stopColor="white"
                    stopOpacity="1"
                />
                <stop
                    offset="100%"
                    stopColor="white"
                    stopOpacity="0"
                />
            </radialGradient>
            <mask id="iso-mask">
                <rect
                    width="100%"
                    height="100%"
                    fill="url(#iso-fade)"
                />
            </mask>
        </defs>
        <rect
            width="100%"
            height="100%"
            fill="url(#iso)"
            mask="url(#iso-mask)"
            color="var(--color-brand-700)"
        />
    </svg>
)
