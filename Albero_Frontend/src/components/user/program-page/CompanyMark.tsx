import { resolveCompanyMark } from './company-marks'

interface CompanyMarkProps {
    name: string
    /** Tile diameter in CSS px. */
    size?: number
}

// Premium monogram chip for the alumni wall. We deliberately don't fetch
// external logos — broken-image squares from rate-limited CDNs are a
// worse experience than a polished typography mark. Each chip is a
// brand-coloured tile with a subtle gradient + inner highlight that
// reads as a real "logo lockup" rather than a placeholder.
export const CompanyMark = ({ name, size = 44 }: CompanyMarkProps) => {
    const { monogram, color } = resolveCompanyMark(name)
    const fontSize = monogram.length >= 3 ? Math.round(size * 0.32) : Math.round(size * 0.42)
    return (
        <div
            className="relative shrink-0 rounded-xl flex items-center justify-center font-display font-bold tracking-tight"
            style={{
                width: size,
                height: size,
                background: `linear-gradient(135deg, ${color} 0%, ${color}d9 100%)`,
                color: '#fff',
                fontSize,
                boxShadow: `0 6px 16px ${color}33, inset 0 1px 0 rgba(255,255,255,0.25)`
            }}
            aria-hidden="true">
            {monogram}
            {/* Inner sheen — top-left highlight for the polished look. */}
            <span
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%)' }}
            />
        </div>
    )
}
