import { ArrowRight } from 'lucide-react'
import { SectionShell, SectionHeading } from './primitives'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export interface RoadmapStep {
    title: string
    description: string
}

interface Props {
    steps: RoadmapStep[]
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    tone?: 'white' | 'soft'
}

// 4-step horizontal roadmap on desktop, vertical on mobile. Numbered
// circles connected by a dashed brand-coloured line. Mirrors the
// Meritshot "Your Career Growth Roadmap" pattern.
export const CareerRoadmap = ({
    steps,
    heading = (
        <>
            Your Career Growth <span className="alb-gradient-text italic font-medium">Roadmap</span>
        </>
    ),
    accent,
    description = 'Four guided phases — from polishing your profile to landing the offer.',
    tone = 'white'
}: Props) => {
    if (steps.length === 0) return null
    return (
        <SectionShell tone={tone} spacing="normal">
            <SectionHeading eyebrow="The Journey" title={heading} accent={accent} description={description} />
            <div className="relative">
                {/* Desktop dashed connector — sits behind the numbered circles. */}
                <div
                    aria-hidden="true"
                    className="hidden md:block absolute left-0 right-0"
                    style={{
                        top: 30,
                        height: 0,
                        borderTop: '2px dashed var(--hairline)'
                    }}
                />
                <ol className="relative grid md:grid-cols-4 gap-8 md:gap-6">
                    {steps.map((step, i) => (
                        <RoadmapStepCard key={step.title} step={step} index={i + 1} delayMs={i * 80} />
                    ))}
                </ol>
            </div>
        </SectionShell>
    )
}

const RoadmapStepCard = ({ step, index, delayMs }: { step: RoadmapStep; index: number; delayMs: number }) => {
    const [ref, visible] = useScrollReveal<HTMLLIElement>(0.2)
    return (
        <li
            ref={ref}
            className="relative flex md:flex-col gap-4 md:gap-5 transition-all duration-[600ms] ease-out"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transitionDelay: `${delayMs}ms`
            }}>
            {/* Numbered circle */}
            <div
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 font-display text-[22px] font-bold relative z-[1]"
                style={{
                    background: 'var(--surface)',
                    border: '2px solid var(--brand)',
                    color: 'var(--brand)',
                    boxShadow: '0 4px 18px rgba(13, 79, 60, 0.16)'
                }}>
                {index}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-display text-[18px] font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                </p>
            </div>

            {/* Mobile-only arrow connector between steps */}
            {index < 4 && (
                <div className="md:hidden absolute left-[28px] top-[60px] bottom-0 w-0.5" style={{ background: 'var(--hairline)' }} />
            )}
        </li>
    )
}

// Default sensible roadmap copy — used when CMS data is missing so the
// section never shows up empty.
export const DEFAULT_ROADMAP_STEPS: RoadmapStep[] = [
    {
        title: 'Profile Power-Up',
        description: 'Resume, LinkedIn, and GitHub aligned to the role you want — reviewed by hiring managers.'
    },
    {
        title: 'Skill Transformation',
        description: 'Master the in-demand stack with mentor-led labs, code reviews, and weekly accountability.'
    },
    {
        title: 'Interview Readiness',
        description: 'Mock interviews, system-design walkthroughs, and behavioural prep tailored to your target role.'
    },
    {
        title: 'Opportunity Maximisation',
        description: 'Direct intros to our 180+ hiring partners, salary negotiation coaching, and offer support.'
    }
]

export const RoadmapArrow = ArrowRight // re-export so consumers don't double-import
