import { Sparkles } from 'lucide-react'
import { Ticker, type TickerItem } from './Ticker'
import { ToolIcon } from './ToolIcon'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useTheme } from '@/hooks/useTheme'

export interface ToolStripItem {
    name: string
    /** Optional override icon URL — when omitted, the ToolIcon registry
     *  picks a brand-coloured Lucide glyph for the tool name. */
    iconUrl?: string
}

interface Props {
    /** Tools / technologies to render in the strip. */
    tools: ToolStripItem[]
    /** Section heading override — defaults to a count-aware string. */
    heading?: React.ReactNode
    /** Italic accent line under the heading — defaults to "woven into every lab.". */
    accent?: React.ReactNode
    /** Subtitle under the heading. Optional. */
    description?: string
    /** Background tone — set 'soft' to alternate against surrounding white sections,
     *  'deep' for the premium dark-mode look. */
    tone?: 'white' | 'soft' | 'deep'
}

// Premium two-row scrolling tool ticker. Modernised pass:
//   - Centred eyebrow chip with brand-coloured pulse dot
//   - Tight headline that no longer doubles the accent line
//   - Pills sit on a subtle aurora-tinted glass plate so they read as a
//     unified strip even on dark backgrounds
//   - Per-pill glow on hover + brand-coloured icon halo
//   - Single-row mobile fallback with reduced pill density
export const ScrollingToolStrip = ({ tools, heading, accent, description, tone = 'soft' }: Props) => {
    const [headingRef, headingVisible] = useScrollReveal<HTMLDivElement>(0.2)
    const { theme } = useTheme()
    if (tools.length === 0) return null

    const isDarkSection = tone === 'deep' && theme === 'dark'
    const items: TickerItem[] = tools.map((t) => ({
        key: t.name,
        content: (
            <ToolPill
                tool={t}
                onDarkSection={isDarkSection}
            />
        )
    }))
    const row1 = items.filter((_, i) => i % 2 === 0)
    const row2 = items.filter((_, i) => i % 2 === 1)

    // Default headline split — keeps the count + the italic accent in
    // separate slots so callers can override either independently.
    // Earlier callers passed the accent INSIDE the heading prop AND
    // accent prop, which duplicated the text. Defaults below render
    // both halves at most once.
    const resolvedHeading = heading ?? `${tools.length}+ industry tools,`
    const resolvedAccent = accent ?? 'woven into every lab.'

    // `tone="deep"` only renders the dark emerald wash in dark mode. In
    // light mode the same tone falls back to a softer brand-tinted plate
    // so the section harmonises with the rest of the light palette.
    const isDark = tone === 'deep' && theme === 'dark'
    const sectionStyle: React.CSSProperties = isDark
        ? {
              // Dark mode = emerald-dominant. Brand chord at higher alpha
              // over a deep-teal base so the section feels like an
              // *emerald* dark section, not a generic black surface.
              background:
                  'radial-gradient(75% 65% at 20% 0%, rgba(20,120,95,0.6) 0%, transparent 60%), ' +
                  'radial-gradient(60% 60% at 80% 30%, rgba(52,211,153,0.5) 0%, transparent 60%), ' +
                  'radial-gradient(80% 50% at 50% 110%, rgba(13,79,60,0.5) 0%, transparent 70%), ' +
                  '#06140f',
              color: '#f5f3ea'
          }
        : tone === 'deep'
          ? {
                // Light-mode "deep" — explicit ivory base with a soft
                // emerald hint at the edges. Always renders light, never
                // inherits dark via a CSS variable indirection.
                background:
                    'radial-gradient(70% 60% at 20% 0%, rgba(20,120,95,0.07) 0%, transparent 60%), ' +
                    'radial-gradient(60% 60% at 80% 30%, rgba(52,211,153,0.07) 0%, transparent 60%), ' +
                    '#fbfaf3'
            }
          : tone === 'soft'
            ? { background: 'var(--section-soft)' }
            : { background: 'var(--surface)' }

    const eyebrowStyle: React.CSSProperties = isDark
        ? {
              background: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.12)',
              color: 'rgba(245,243,234,0.8)'
          }
        : {}

    return (
        <section
            className="relative overflow-hidden py-20 md:py-28 px-5 md:px-8"
            style={sectionStyle}>
            {/* Soft top + bottom gradient seams when on dark — keeps the
                section from looking "boxy" against the next light section. */}
            {isDark && (
                <>
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-16"
                        style={{ background: 'linear-gradient(180deg, rgba(245,243,234,0.04) 0%, transparent 100%)' }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-16"
                        style={{ background: 'linear-gradient(0deg, rgba(245,243,234,0.04) 0%, transparent 100%)' }}
                    />
                </>
            )}

            <div
                ref={headingRef}
                className="relative max-w-3xl mx-auto text-center mb-12 md:mb-16 transition-all duration-[600ms] ease-out"
                style={{
                    opacity: headingVisible ? 1 : 0,
                    transform: headingVisible ? 'translateY(0)' : 'translateY(16px)'
                }}>
                {/* Eyebrow chip — manually styled here (instead of the shared
                    .alb-section-badge primitive) so it reads as crisp on dark. */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'var(--surface)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'var(--hairline)'}`,
                        color: isDark ? 'rgba(245,243,234,0.8)' : 'var(--text-secondary)',
                        ...eyebrowStyle
                    }}>
                    <span className="relative inline-flex w-1.5 h-1.5">
                        <span
                            className="absolute inset-0 rounded-full"
                            style={{ background: 'var(--brand)' }}
                        />
                        <span
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ background: 'var(--brand)', opacity: 0.7 }}
                        />
                    </span>
                    Industry Toolkit
                </div>

                <h2
                    className="font-display tracking-[-0.025em] leading-[1.05] font-semibold mt-5"
                    style={{
                        fontSize: 'clamp(28px, 5vw, 52px)',
                        color: isDark ? '#f5f3ea' : 'var(--text-primary)'
                    }}>
                    {resolvedHeading}
                    {resolvedAccent && (
                        <>
                            {' '}
                            <span className="alb-gradient-text italic font-medium">{resolvedAccent}</span>
                        </>
                    )}
                </h2>

                {description !== '' && (
                    <p
                        className="mt-5 text-[15px] md:text-[16.5px] leading-relaxed max-w-2xl mx-auto"
                        style={{ color: isDark ? 'rgba(245,243,234,0.72)' : 'var(--text-secondary)' }}>
                        {description ?? 'Hands-on labs use the exact stack hiring teams expect — no toy projects, no outdated frameworks.'}
                    </p>
                )}

                {/* Hint chip — small "live count" line so the section feels
                    data-driven rather than static marketing copy. */}
                <div
                    className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold"
                    style={{ color: isDark ? 'rgba(245,243,234,0.6)' : 'var(--text-tertiary)' }}>
                    <Sparkles
                        size={13}
                        style={{ color: 'var(--brand)' }}
                    />
                    <span>{tools.length} tools in this program · all production-grade</span>
                </div>
            </div>

            {/* Aurora glass plate that holds the two ticker rows. The plate
                gives the strip a "premium" frame so pills don't look like
                they float in space. Emerald-tinted in dark; pure white in
                light so the section identity matches the TechMesh card. */}
            <div
                className="relative max-w-7xl mx-auto rounded-3xl py-7 md:py-9 overflow-hidden"
                style={{
                    background: isDark
                        ? 'linear-gradient(180deg, rgba(20,120,95,0.18) 0%, rgba(13,79,60,0.10) 100%)'
                        : 'linear-gradient(180deg, #ffffff 0%, #fdfbf3 100%)',
                    border: `1px solid ${isDark ? 'rgba(52,211,153,0.18)' : 'var(--hairline)'}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: isDark
                        ? '0 28px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(52,211,153,0.14)'
                        : '0 18px 40px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}>
                {/* Brand stripe along the top of the plate — adds a colour
                    anchor so the section identity reads at a glance. */}
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: 'var(--gradient-aurora)' }}
                />
                <div className="space-y-4 md:space-y-5">
                    <Ticker
                        items={row1.length ? row1 : items}
                        direction="left"
                        durationSeconds={20}
                    />
                    {row2.length > 0 && (
                        <div className="hidden md:block">
                            <Ticker
                                items={row2}
                                direction="right"
                                durationSeconds={24}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

// Premium pill — bigger icon halo, refined typography, hover lift + glow.
// On a dark section the default --surface variable resolves to a dark
// near-black, which makes the pills disappear into the plate. The
// `onDarkSection` flag swaps in an emerald-tinted fill + green hairline
// so the pills sit *on top of* the plate AND keep the section's emerald
// identity coherent (instead of looking like neutral slate chiclets).
const ToolPill = ({ tool, onDarkSection = false }: { tool: ToolStripItem; onDarkSection?: boolean }) => {
    const restBg = onDarkSection ? 'linear-gradient(180deg, rgba(20,120,95,0.28) 0%, rgba(13,79,60,0.18) 100%)' : 'var(--surface)'
    const restBorder = onDarkSection ? 'rgba(52,211,153,0.28)' : 'var(--hairline)'
    const restShadow = onDarkSection ? '0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(52,211,153,0.14)' : 'var(--card-shadow-soft)'
    const hoverShadow = onDarkSection
        ? '0 12px 28px rgba(0,0,0,0.5), 0 0 0 4px rgba(52,211,153,0.24)'
        : 'var(--card-shadow-hover), 0 0 0 4px rgba(13,79,60,0.06)'
    const iconCellBg = onDarkSection ? 'rgba(52,211,153,0.12)' : 'var(--surface-2)'
    const iconCellBorder = onDarkSection ? 'rgba(52,211,153,0.22)' : 'var(--hairline)'
    return (
        <div
            className="inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full transition-all duration-300 hover:translate-y-[-3px]"
            style={{
                background: restBg,
                border: `1px solid ${restBorder}`,
                boxShadow: restShadow,
                color: onDarkSection ? '#f5f3ea' : 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = hoverShadow
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = restShadow
            }}>
            {tool.iconUrl ? (
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: iconCellBg, border: `1px solid ${iconCellBorder}` }}>
                    <img
                        src={tool.iconUrl}
                        alt=""
                        className="w-4 h-4 object-contain"
                        loading="lazy"
                        width={16}
                        height={16}
                    />
                </div>
            ) : (
                <ToolIcon name={tool.name} />
            )}
            <span className="text-[13.5px] md:text-[14.5px] font-semibold whitespace-nowrap tracking-tight">{tool.name}</span>
        </div>
    )
}
