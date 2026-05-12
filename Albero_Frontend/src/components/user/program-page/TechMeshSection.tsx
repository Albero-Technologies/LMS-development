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
                    {/* Animated canvas — wrapped in a glass card with a
                        subtle brand-coloured stroke at the top so the
                        section identity reads at a glance. The canvas is
                        bigger now (480px) to give the data-flow design
                        more room to breathe, matching the design refs. */}
                    <div
                        className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
                        style={{
                            // Card backdrop:
                            //   dark — emerald-tinted glass (visible green wash
                            //   that matches the section identity)
                            //   light — pure white surface (no dark gradient
                            //   sneaking in via the previous translucent stack)
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
                        {/* Brand stripe along the top — the same anchor used
                            by the Industry Toolkit plate, kept consistent. */}
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
