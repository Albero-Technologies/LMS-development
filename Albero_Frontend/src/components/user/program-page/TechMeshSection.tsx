import { Sparkles, Cpu, Zap } from 'lucide-react'
import { ArmorCodeHero, type ArmorCodeNode } from './ArmorCodeHero'
import { GradientIcon } from './primitives'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useTheme } from '@/hooks/useTheme'

interface Props {
    nodes: ArmorCodeNode[]
    /** Title in the centre node — defaults to a brand glyph. */
    hubLabel?: string
    hubGlyph?: string
    /** Section heading override. */
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
}

// Standalone section that promotes the canvas hero to its own dedicated
// "stack-overview" surface. Replaces the small embedded canvas inside the
// program hero — gives the animation room to breathe + adds three brand
// pillar callouts on the right (mobile: stacked under the canvas).
//
// Visually: deep navy aurora-mesh background, frosted glass canvas card,
// brand-coloured pillar tiles, gradient SectionHeading. Mobile collapses
// to a single column with the canvas first.
export const TechMeshSection = ({
    nodes,
    hubLabel = 'Albero',
    hubGlyph = '✦',
    heading = (
        <>
            Build skills that <span className="alb-gradient-text italic font-medium">top companies hire for.</span>
        </>
    ),
    accent,
    description = 'Master AI, Data Science, Full Stack Development, CyberSecurity, Data Engineering, and Finance through live mentor-led programs designed around real industry expectations and high-growth career outcomes.'
}: Props) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.15)
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <section
            className="relative overflow-hidden"
            style={
                isDark
                    ? {
                          // Dark mode = emerald-dominant. Brand chord layered
                          // over a deep teal base so the section reads as
                          // "green section in dark mode", not "generic dark".
                          background:
                              'radial-gradient(70% 65% at 18% 8%, rgba(20,120,95,0.62) 0%, transparent 60%), ' +
                              'radial-gradient(55% 60% at 86% 28%, rgba(52,211,153,0.5) 0%, transparent 60%), ' +
                              'radial-gradient(75% 60% at 50% 110%, rgba(13,79,60,0.55) 0%, transparent 70%), ' +
                              '#06140f',
                          color: '#f5f3ea'
                      }
                    : {
                          // Light variant — clean ivory surface with the
                          // faintest emerald hint at the edges. Section bg
                          // is explicit (#fbfaf3) so it never inherits a
                          // dark colour from a misresolved CSS variable.
                          background:
                              'radial-gradient(60% 60% at 20% 10%, rgba(20,120,95,0.07) 0%, transparent 60%), ' +
                              'radial-gradient(50% 50% at 85% 25%, rgba(52,211,153,0.06) 0%, transparent 60%), ' +
                              'radial-gradient(70% 60% at 50% 110%, rgba(13,79,60,0.04) 0%, transparent 70%), ' +
                              '#fbfaf3'
                      }
            }>
            {/* Top fade — softens the transition from the previous (light) section. */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-24 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, var(--surface) 0%, transparent 100%)', opacity: 0.08 }}
            />
            <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
                <div
                    ref={ref}
                    className="text-center mx-auto max-w-3xl mb-12 transition-all duration-[600ms] ease-out"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(16px)'
                    }}>
                    <div
                        className="alb-section-badge mb-4"
                        style={
                            isDark
                                ? {
                                      background: 'rgba(255,255,255,0.06)',
                                      borderColor: 'rgba(255,255,255,0.12)',
                                      color: 'rgba(245,243,234,0.85)'
                                  }
                                : undefined
                        }>
                        <Cpu size={12} /> Premium Career-Tech Ecosystem
                    </div>
                    <SectionHeadingAdaptive
                        heading={heading}
                        accent={accent}
                        description={description}
                        isDark={isDark}
                    />
                </div>

                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10 items-center">
                    {/* ── Desktop (lg+): animated orbital canvas ──
                        Wrapped in a glass card with a subtle brand-coloured
                        stroke at the top so the section identity reads at a
                        glance. 480px tall to give the data-flow room to
                        breathe. Hidden on mobile because the fractional node
                        coordinates clip labels like "Power BI" / "Tableau"
                        at narrow viewport widths — the mobile mesh below
                        renders the same nodes as a clean grid instead. */}
                    <div
                        className="hidden lg:block relative rounded-3xl p-6 md:p-8 overflow-hidden"
                        style={{
                            background: isDark
                                ? 'linear-gradient(180deg, rgba(20,120,95,0.18) 0%, rgba(13,79,60,0.10) 100%)'
                                : 'linear-gradient(180deg, #ffffff 0%, #fdfbf3 100%)',
                            border: `1px solid ${isDark ? 'rgba(52,211,153,0.18)' : 'var(--hairline)'}`,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: isDark
                                ? '0 28px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(52,211,153,0.12)'
                                : '0 22px 48px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
                        }}>
                        <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-[2px]"
                            style={{ background: 'var(--gradient-aurora)' }}
                        />
                        <ArmorCodeHero
                            nodes={nodes}
                            hubLabel={hubLabel}
                            hubGlyph={hubGlyph}
                            height={480}
                        />
                    </div>

                    {/* ── Mobile (<lg): static tool mesh ──
                        Same nodes the orbital canvas would render, laid out
                        as a hub-and-grid that actually fits a 360px screen.
                        No animation (it'd compete with the pillar reveals
                        below), no fractional positioning (the source of the
                        label-clipping on mobile). */}
                    <MobileToolMesh
                        nodes={nodes}
                        hubLabel={hubLabel}
                        hubGlyph={hubGlyph}
                        isDark={isDark}
                    />

                    {/* Three pillar callouts — the "why this is a system, not a
                        zoo" supporting copy. Slot in CMS data later. */}
                    <ul className="space-y-4">
                        <PillarCard
                            icon={<Sparkles size={18} />}
                            title="Industry-Aligned Learning"
                            body="Train on modern tools, workflows, and technologies inspired by the ecosystems used at Microsoft, IBM, Cisco, J.P. Morgan, and other global leaders."
                            isDark={isDark}
                        />
                        <PillarCard
                            icon={<Cpu size={18} />}
                            title="Real Projects. Real Experience."
                            body="Build portfolio-grade projects, solve practical business problems, and gain hands-on exposure that prepares you for actual interviews and job environments."
                            isDark={isDark}
                        />
                        <PillarCard
                            icon={<Zap size={18} />}
                            title="Career Acceleration Support"
                            body="Get dedicated mentorship, resume building, mock interviews, placement assistance, and career guidance designed to help you secure high-paying opportunities."
                            isDark={isDark}
                        />
                    </ul>
                </div>
            </div>
        </section>
    )
}

// Theme-adaptive heading — dark mode reads in cream, light mode falls
// back to the system text tokens. The italic accent always uses the
// shared brand gradient so the section identity stays consistent.
const SectionHeadingAdaptive = ({
    heading,
    accent,
    description,
    isDark
}: {
    heading: React.ReactNode
    accent?: React.ReactNode
    description?: React.ReactNode
    isDark: boolean
}) => (
    <>
        <h2
            className="font-display tracking-[-0.02em] leading-[1.05] font-semibold"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: isDark ? '#f5f3ea' : 'var(--text-primary)' }}>
            {heading} {accent && <span className="alb-gradient-text italic font-medium">{accent}</span>}
        </h2>
        {description && (
            <p
                className="mt-4 text-[15px] md:text-[17px] leading-relaxed"
                style={{ color: isDark ? 'rgba(245,243,234,0.72)' : 'var(--text-secondary)' }}>
                {description}
            </p>
        )}
    </>
)

// ── Mobile replacement for the orbital canvas ──
// Renders the same `nodes` the canvas would, but as a hub-and-spokes static
// layout: the central hub at the top, all tool nodes below as a 2-column
// grid. Each tile carries its node's brand colour as a left edge so the
// "every tool has its own identity" feeling from the canvas survives, and
// a faint sweep line connects the hub to the first tile to suggest the
// "river of data" the canvas animates. No <canvas>, no rAF, no fractional
// coordinates — so labels can never clip the section.
const MobileToolMesh = ({
    nodes,
    hubLabel,
    hubGlyph,
    isDark
}: {
    nodes: ArmorCodeNode[]
    hubLabel: string
    hubGlyph: string
    isDark: boolean
}) => {
    return (
        <div
            className="lg:hidden relative rounded-3xl p-5 overflow-hidden"
            style={{
                background: isDark
                    ? 'linear-gradient(180deg, rgba(20,120,95,0.18) 0%, rgba(13,79,60,0.10) 100%)'
                    : 'linear-gradient(180deg, #ffffff 0%, #fdfbf3 100%)',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.18)' : 'var(--hairline)'}`,
                boxShadow: isDark
                    ? '0 18px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(52,211,153,0.12)'
                    : '0 14px 32px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.6)'
            }}>
            {/* Brand stripe along the top — matches the desktop card. */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: 'var(--gradient-aurora)' }}
            />

            {/* Soft emerald wash behind the hub, gives the centre the
                "hub aura" the canvas creates with radial gradients. */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                    top: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(52,211,153,0.22) 0%, transparent 70%)',
                    filter: 'blur(28px)'
                }}
            />

            {/* ── Hub ── */}
            <div className="relative z-[1] flex flex-col items-center pt-3 pb-5">
                <div
                    className="relative w-16 h-16 rounded-full inline-flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, #0d4f3c 0%, #14785f 55%, #34d399 100%)',
                        boxShadow: '0 8px 24px rgba(13,79,60,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
                        color: '#fff'
                    }}>
                    <span
                        aria-hidden="true"
                        className="absolute -inset-1.5 rounded-full"
                        style={{ border: '1px solid rgba(52,211,153,0.32)' }}
                    />
                    <span className="font-display text-[22px] leading-none font-bold">{hubGlyph}</span>
                </div>
                <div
                    className="mt-3 font-display text-[15px] font-semibold tracking-tight"
                    style={{ color: isDark ? '#f5f3ea' : 'var(--text-primary)' }}>
                    {hubLabel}
                </div>
                <div
                    className="mt-0.5 text-[10.5px] tracking-[0.18em] uppercase font-semibold"
                    style={{ color: isDark ? 'rgba(52,211,153,0.85)' : 'var(--brand)' }}>
                    Your stack
                </div>
            </div>

            {/* ── Tool grid ──
                2 columns at all mobile widths. Each tile shows the node's
                glyph in a brand-coloured circle + its label below. Labels
                wrap naturally on long names — no truncation needed because
                the column has its full share of viewport width. */}
            <ul className="relative z-[1] grid grid-cols-2 gap-2.5">
                {nodes.map((n) => (
                    <li
                        key={n.id}
                        className="relative rounded-2xl px-3 py-3 flex items-center gap-3 overflow-hidden"
                        style={{
                            background: isDark ? 'rgba(20,120,95,0.10)' : '#ffffff',
                            border: `1px solid ${isDark ? 'rgba(52,211,153,0.16)' : 'var(--hairline)'}`,
                            boxShadow: isDark ? 'inset 0 1px 0 rgba(52,211,153,0.08)' : '0 1px 0 rgba(15,23,42,0.04)'
                        }}>
                        {/* Brand-coloured edge so each tile reads as that
                            tool's identity instead of a generic chiclet. */}
                        <span
                            aria-hidden="true"
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                            style={{ background: n.color }}
                        />
                        <span
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                            style={{
                                background: isDark ? '#ffffff' : '#ffffff',
                                border: `1.5px solid ${n.color}`,
                                color: n.color,
                                fontWeight: 700,
                                boxShadow: `0 4px 10px ${n.color}26`
                            }}>
                            <span style={{ fontSize: 15, lineHeight: 1 }}>{n.glyph}</span>
                        </span>
                        <span
                            className="text-[12.5px] font-semibold leading-tight min-w-0"
                            style={{
                                color: isDark ? 'rgba(245,243,234,0.85)' : 'var(--text-primary)',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word'
                            }}>
                            {n.label}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Footer caption — mirrors what the canvas's particle flow
                visually communicates: these tools snap together into a
                single working stack. */}
            <div
                className="relative z-[1] mt-4 pt-3 border-t flex items-center justify-center gap-1.5 text-[11px]"
                style={{
                    borderColor: isDark ? 'rgba(52,211,153,0.14)' : 'var(--hairline)',
                    color: isDark ? 'rgba(245,243,234,0.65)' : 'var(--text-tertiary)'
                }}>
                <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--brand)' }}
                />
                {nodes.length} tools · one cohesive lab
            </div>
        </div>
    )
}

const PillarCard = ({ icon, title, body, isDark }: { icon: React.ReactNode; title: string; body: string; isDark: boolean }) => {
    const [ref, visible] = useScrollReveal<HTMLLIElement>(0.2)
    return (
        <li
            ref={ref}
            className="rounded-2xl p-5 transition-all duration-[600ms] ease-out hover:translate-x-1"
            style={{
                // Mirror the canvas card — emerald-tinted in dark, pure
                // white in light. Keeps the trio visually unified with the
                // section identity instead of looking like grey chiclets.
                background: isDark ? 'linear-gradient(180deg, rgba(20,120,95,0.16) 0%, rgba(13,79,60,0.08) 100%)' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.16)' : 'var(--hairline)'}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isDark ? '0 16px 36px rgba(0,0,0,0.32), inset 0 1px 0 rgba(52,211,153,0.1)' : 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)'
            }}>
            <div className="flex items-start gap-4">
                <GradientIcon size={42}>{icon}</GradientIcon>
                <div className="min-w-0">
                    <h3
                        className="font-display text-[16.5px] font-semibold"
                        style={{ color: isDark ? '#f5f3ea' : 'var(--text-primary)' }}>
                        {title}
                    </h3>
                    <p
                        className="mt-1 text-[13.5px] leading-relaxed"
                        style={{ color: isDark ? 'rgba(245,243,234,0.7)' : 'var(--text-secondary)' }}>
                        {body}
                    </p>
                </div>
            </div>
        </li>
    )
}
