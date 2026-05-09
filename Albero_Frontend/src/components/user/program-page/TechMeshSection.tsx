import { Sparkles, Cpu, Zap } from 'lucide-react'
import { ArmorCodeHero, type ArmorCodeNode } from './ArmorCodeHero'
import { GradientIcon } from './primitives'
import { useScrollReveal } from '@/hooks/useScrollReveal'

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
    hubLabel = 'Studio',
    hubGlyph = '✦',
    heading = (
        <>
            One stack. <span className="alb-gradient-text italic font-medium">Every connection.</span>
        </>
    ),
    accent,
    description = 'See how the tools you learn snap together — from raw data to insight, in one cohesive lab.'
}: Props) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.15)

    return (
        <section
            className="relative overflow-hidden"
            style={{
                // Subtle aurora wash on a dark base — feels modern + premium
                // without overwhelming the foreground content.
                background:
                    'radial-gradient(60% 60% at 20% 10%, rgba(13,79,60,0.42) 0%, transparent 60%), ' +
                    'radial-gradient(50% 50% at 85% 25%, rgba(20,120,95,0.34) 0%, transparent 60%), ' +
                    'radial-gradient(70% 60% at 50% 110%, rgba(52,211,153,0.26) 0%, transparent 70%), ' +
                    '#0a1410',
                color: '#f5f3ea'
            }}>
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
                    <div className="alb-section-badge mb-4" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(245,243,234,0.85)' }}>
                        <Cpu size={12} /> Your toolkit
                    </div>
                    <SectionHeadingDark heading={heading} accent={accent} description={description} />
                </div>

                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10 items-center">
                    {/* Animated canvas — wrapped in a glass card so it visually
                        anchors as a hero artefact rather than a stray drawing. */}
                    <div
                        className="relative rounded-3xl overflow-hidden p-6 md:p-8"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 28px 60px rgba(0,0,0,0.4)'
                        }}>
                        <ArmorCodeHero nodes={nodes} hubLabel={hubLabel} hubGlyph={hubGlyph} height={420} />
                    </div>

                    {/* Three pillar callouts — the "why this is a system, not a
                        zoo" supporting copy. Slot in CMS data later. */}
                    <ul className="space-y-4">
                        <PillarCard
                            icon={<Sparkles size={18} />}
                            title="Industry-grade tools"
                            body="Every lab uses the exact stack hiring teams expect — no toy frameworks, no outdated tutorials."
                        />
                        <PillarCard
                            icon={<Cpu size={18} />}
                            title="Wired together"
                            body="Tools don't sit in silos. You'll move data from raw → modelled → visualised in a single capstone."
                        />
                        <PillarCard
                            icon={<Zap size={18} />}
                            title="Production-ready"
                            body="Mentor reviews push you past the demo gloss to handle scale, edge cases, and on-call moments."
                        />
                    </ul>
                </div>
            </div>
        </section>
    )
}

// Inline dark-bg variant of SectionHeading — the regular primitive uses
// var(--text-primary) which on this dark surface would render in the cream
// body colour (already correct), but the description text gets too low
// contrast. Local copy keeps the dark section legible without forking the
// shared SectionHeading API.
const SectionHeadingDark = ({
    heading,
    accent,
    description
}: {
    heading: React.ReactNode
    accent?: React.ReactNode
    description?: React.ReactNode
}) => (
    <>
        <h2
            className="font-display tracking-[-0.02em] leading-[1.05] font-semibold"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: '#f5f3ea' }}>
            {heading} {accent && <span className="alb-gradient-text italic font-medium">{accent}</span>}
        </h2>
        {description && (
            <p className="mt-4 text-[15px] md:text-[17px] leading-relaxed" style={{ color: 'rgba(245,243,234,0.72)' }}>
                {description}
            </p>
        )}
    </>
)

const PillarCard = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => {
    const [ref, visible] = useScrollReveal<HTMLLIElement>(0.2)
    return (
        <li
            ref={ref}
            className="rounded-2xl p-5 transition-all duration-[600ms] ease-out hover:translate-x-1"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)'
            }}>
            <div className="flex items-start gap-4">
                <GradientIcon size={42}>{icon}</GradientIcon>
                <div className="min-w-0">
                    <h3 className="font-display text-[16.5px] font-semibold" style={{ color: '#f5f3ea' }}>
                        {title}
                    </h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: 'rgba(245,243,234,0.7)' }}>
                        {body}
                    </p>
                </div>
            </div>
        </li>
    )
}
