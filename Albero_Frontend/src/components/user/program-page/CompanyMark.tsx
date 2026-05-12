import { resolveCompanyMark } from './company-marks'

interface CompanyMarkProps {
    name: string
    /** Tile diameter in CSS px. */
    size?: number
}

// Renders real company logos via Google's public favicon service
// (www.google.com/s2/favicons) — no CORS issues, no auth, always available.
// Falls back to a polished gradient monogram tile on load error.
export const CompanyMark = ({ name, size = 44 }: CompanyMarkProps) => {
    const { monogram, color, logoUrl } = resolveCompanyMark(name)
    const fontSize = monogram.length >= 3 ? Math.round(size * 0.3) : Math.round(size * 0.38)

    if (!logoUrl) {
        return (
            <MonogramTile
                monogram={monogram}
                color={color}
                size={size}
                fontSize={fontSize}
            />
        )
    }

    return (
        <div
            className="relative shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
                width: size,
                height: size,
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 6px rgba(0,0,0,0.08)'
            }}
            aria-hidden="true">
            <img
                src={logoUrl}
                alt={name}
                width={Math.round(size * 0.7)}
                height={Math.round(size * 0.7)}
                className="object-contain"
                loading="lazy"
                onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    const wrapper = img.parentElement!
                    // Swap wrapper to monogram tile styling
                    wrapper.style.background = `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
                    wrapper.style.border = 'none'
                    wrapper.style.boxShadow = `0 6px 16px ${color}40`
                    img.style.display = 'none'
                    const mono = wrapper.querySelector<HTMLElement>('[data-mono]')
                    if (mono) mono.style.display = 'flex'
                }}
            />
            {/* Monogram revealed on error */}
            <div
                data-mono
                className="absolute inset-0 items-center justify-center text-white font-display font-bold tracking-tight"
                style={{ display: 'none', fontSize }}>
                {monogram}
            </div>
        </div>
    )
}

const MonogramTile = ({ monogram, color, size, fontSize }: { monogram: string; color: string; size: number; fontSize: number }) => (
    <div
        className="relative shrink-0 rounded-xl flex items-center justify-center font-display font-bold tracking-tight text-white"
        style={{
            width: size,
            height: size,
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            fontSize,
            boxShadow: `0 6px 16px ${color}40, inset 0 1px 0 rgba(255,255,255,0.25)`
        }}
        aria-hidden="true">
        {monogram}
        <span
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%)' }}
        />
    </div>
)
