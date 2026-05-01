// Derive the full brand-* shade scale (50, 100, 300, 500, 600, 700, 900) from
// a single hex base color. Each tier is a linear mix between the base and
// either white (lighter tiers) or black (darker tiers) — close enough to a
// hand-tuned design palette that custom tenant colors look coherent without
// us shipping a full color tool. Returns CSS hex strings.
//
// Used by:
//  - AppLayout (authenticated app surface — applies on tenant brand fetch)
//  - TenantBrandingContext (public per-tenant pages — applies via slug-resolved
//    brand color)
//
// The base index.css ships defaults for all seven tiers; we override every
// tier when a tenant has a custom color so accents, surfaces, and active
// states all paint coherently. Overriding only `500/600/700` (the previous
// behaviour) left brand-50/100/300 stuck on the original blue, which made
// callout backgrounds and tab indicator pills clash with custom colors.

type Rgb = [number, number, number]

const clamp = (v: number): number => Math.max(0, Math.min(255, Math.round(v)))

const hexToRgb = (hex: string): Rgb => {
    let h = hex.trim().replace(/^#/, '')
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const n = parseInt(h, 16)
    if (Number.isNaN(n) || h.length !== 6) return [0, 98, 255] // safe fallback (default brand-500)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const rgbToHex = ([r, g, b]: Rgb): string =>
    '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]

export type BrandPalette = {
    50: string
    100: string
    300: string
    500: string
    600: string
    700: string
    900: string
}

// Mix ratios picked to match the visual rhythm of the default palette
// (e.g. brand-50 = #e8f0fe sits at ~9% of brand-500 = #0062ff against white).
export const deriveBrandPalette = (hex: string): BrandPalette => {
    const base = hexToRgb(hex)
    return {
        50: rgbToHex(mix(WHITE, base, 0.1)),
        100: rgbToHex(mix(WHITE, base, 0.2)),
        300: rgbToHex(mix(WHITE, base, 0.55)),
        500: rgbToHex(base),
        600: rgbToHex(mix(base, BLACK, 0.1)),
        700: rgbToHex(mix(base, BLACK, 0.25)),
        900: rgbToHex(mix(base, BLACK, 0.6))
    }
}

// Apply a palette to the document root, returning a cleanup that restores the
// pre-application values. Caller is responsible for invoking the cleanup on
// unmount so the public marketing surface (which uses a different brand) can
// reset cleanly when the user navigates back.
export const applyBrandPalette = (palette: BrandPalette): (() => void) => {
    const root = document.documentElement
    const tiers = [50, 100, 300, 500, 600, 700, 900] as const
    const original: Record<number, string> = {}
    for (const tier of tiers) {
        original[tier] = root.style.getPropertyValue(`--color-brand-${tier}`)
        root.style.setProperty(`--color-brand-${tier}`, palette[tier])
    }
    return () => {
        for (const tier of tiers) {
            root.style.setProperty(`--color-brand-${tier}`, original[tier])
        }
    }
}
