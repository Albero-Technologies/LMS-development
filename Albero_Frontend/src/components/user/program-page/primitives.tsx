import type { ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

// ──────────────────────────────────────────────────────────────────────
// Section primitives shared by every redesigned program-page section.
// One file so consuming components only have one import to remember.
// ──────────────────────────────────────────────────────────────────────

type Tone = 'white' | 'soft' | 'deep'

const toneBg: Record<Tone, React.CSSProperties> = {
    white: { background: 'var(--surface)' },
    soft: { background: 'var(--section-soft)' },
    deep: { background: 'var(--section-deep)', color: '#f5f3ea' }
}

interface SectionShellProps {
    /** Background tone — alternate to break up the page rhythm. */
    tone?: Tone
    /** Constrain inner content width. Default 1180px (matches hero grid). */
    maxWidth?: number
    /** Vertical padding multiplier — 'tight' ~ 56px, 'normal' ~ 96px, 'roomy' ~ 128px. */
    spacing?: 'tight' | 'normal' | 'roomy'
    id?: string
    className?: string
    children: ReactNode
}

const padBy: Record<NonNullable<SectionShellProps['spacing']>, string> = {
    tight: 'py-14 md:py-16',
    normal: 'py-20 md:py-24',
    roomy: 'py-24 md:py-32'
}

/** Standard section frame — handles bg tone, padding, max-width, fade-up. */
export const SectionShell = ({ tone = 'white', maxWidth = 1180, spacing = 'normal', id, className, children }: SectionShellProps) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>()
    return (
        <section
            id={id}
            className={`relative ${padBy[spacing]} px-5 md:px-8 ${className ?? ''}`}
            style={toneBg[tone]}>
            <div
                ref={ref}
                className={`mx-auto transition-all duration-[600ms] ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ maxWidth }}>
                {children}
            </div>
        </section>
    )
}

/** Pill label that sits above section headings — "· PROVEN CAREER OUTCOMES ·". */
export const SectionBadge = ({ children, icon }: { children: ReactNode; icon?: ReactNode }) => (
    <div className="alb-section-badge mb-4">
        {icon}
        {children}
    </div>
)

/** Heading + sub-heading block. Pass `accent` to render a gradient word. */
export const SectionHeading = ({
    eyebrow,
    title,
    accent,
    description,
    align = 'center'
}: {
    eyebrow?: string
    title: ReactNode
    accent?: ReactNode
    description?: ReactNode
    align?: 'left' | 'center'
}) => {
    const wrap = align === 'center' ? 'text-center mx-auto' : 'text-left'
    return (
        <div className={`mb-10 md:mb-14 max-w-3xl ${wrap}`}>
            {eyebrow && <SectionBadge>{eyebrow}</SectionBadge>}
            <h2
                className="font-display tracking-[-0.02em] leading-[1.05] font-semibold"
                style={{
                    fontSize: 'clamp(28px, 5vw, 48px)',
                    color: 'var(--text-primary)'
                }}>
                {title} {accent && <span className="alb-gradient-text italic font-medium">{accent}</span>}
            </h2>
            {description && (
                <p
                    className="mt-4 text-[15px] md:text-[17px] leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}>
                    {description}
                </p>
            )}
        </div>
    )
}

/** Subtle wave divider between alternating sections — pure SVG, ~6KB. */
export const WaveDivider = ({ from = 'white', to = 'soft' }: { from?: Tone; to?: Tone }) => {
    const fromColor = from === 'deep' ? '#0a0f1e' : from === 'soft' ? 'var(--section-soft)' : 'var(--surface)'
    const toColor = to === 'deep' ? '#0a0f1e' : to === 'soft' ? 'var(--section-soft)' : 'var(--surface)'
    return (
        <div
            aria-hidden="true"
            className="relative"
            style={{ background: fromColor }}>
            <svg
                className="block w-full h-[60px] md:h-[80px]"
                viewBox="0 0 1200 80"
                preserveAspectRatio="none">
                <path
                    d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
                    fill={toColor}
                />
            </svg>
        </div>
    )
}

/** Gradient-icon container — 48×48 rounded square with the brand aurora.
 *  Drop-shadow uses the same hue as the gradient so the icon looks like
 *  it casts a brand-coloured glow, not a generic grey box-shadow. */
export const GradientIcon = ({ children, size = 48 }: { children: ReactNode; size?: number }) => (
    <div
        className="rounded-xl flex items-center justify-center text-white shrink-0"
        style={{
            width: size,
            height: size,
            background: 'var(--gradient-aurora)',
            boxShadow: 'var(--glow-brand)'
        }}>
        {children}
    </div>
)

/** Frosted glass card — for nodes that float above the aurora mesh. */
export const GlassCard = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={`alb-glass rounded-2xl p-6 ${className ?? ''}`}>{children}</div>
)
