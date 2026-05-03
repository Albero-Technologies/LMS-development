import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { Sparkles, Trophy } from 'lucide-react'

const steps = [
    {
        title: 'Day 1 — Join the cohort',
        body: 'Get matched to a mentor and meet your batch within 7 days of enrollment.',
        accent: '#0d4f3c'
    },
    {
        title: 'Month 1 — First capstone',
        body: 'Ship your first portfolio-grade project, reviewed live by a senior practitioner.',
        accent: '#1d6f4f'
    },
    {
        title: 'Month 3 — Mentor sign-off',
        body: 'Pass the mid-program review and earn your IBM SkillsBuild badge.',
        accent: '#0530AD'
    },
    {
        title: 'Month 5 — Mock interviews',
        body: 'Run 6 mock rounds with hiring managers. Resume + LinkedIn rebuilt.',
        accent: '#b86a18'
    },
    {
        title: 'Month 6 — Offer in hand',
        body: 'Referrals routed to 180+ partners. Placement support runs until you sign.',
        accent: '#34d399'
    }
]

// Mobile-only ladder. Scrolls naturally (no sticky pin) so the page flow
// stays smooth on phones. Each rung uses its own IntersectionObserver via
// `useInView` so the card swings in from the right and the rung dot pops
// the moment that step enters the viewport — feels like climbing without
// fighting scroll.
export default function MobileLadderClimb() {
    return (
        <section
            className="relative md:hidden py-12 px-5"
            style={{ background: 'var(--page-bg)' }}>
            {/* Decorative blob */}
            <div
                aria-hidden="true"
                className="absolute -top-12 -right-16 w-[260px] h-[260px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)',
                    filter: 'blur(50px)'
                }}
            />

            {/* Header */}
            <div className="text-center mb-8 relative z-[1]">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[10px] font-semibold tracking-[0.18em] uppercase"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                    <Sparkles size={11} /> Step-by-step success
                </div>
                <h2
                    className="font-display tracking-[-0.02em]"
                    style={{
                        color: 'var(--text-primary)',
                        fontSize: 'clamp(26px, 7.5vw, 36px)',
                        lineHeight: 1.1
                    }}>
                    Six months,{' '}
                    <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                        one rung at a time.
                    </span>
                </h2>
                <p
                    className="mt-3 text-[13px] leading-relaxed max-w-[320px] mx-auto"
                    style={{ color: 'var(--text-secondary)' }}>
                    Scroll through every milestone — each rung lights up as you reach it.
                </p>
            </div>

            {/* Rungs */}
            <ol className="relative max-w-[420px] mx-auto space-y-5">
                {/* Vertical rail — runs the full ol from top-2 to bottom-2 */}
                <div
                    aria-hidden="true"
                    className="absolute top-2 bottom-2 w-[3px] rounded-full"
                    style={{ left: 22, background: 'var(--line)' }}
                />

                {steps.map((s, i) => (
                    <Rung
                        key={i}
                        index={i}
                        title={s.title}
                        body={s.body}
                        accent={s.accent}
                    />
                ))}

                {/* Trophy at the top of the climb */}
                <FinaleRung />
            </ol>
        </section>
    )
}

function Rung({ index, title, body, accent }: { index: number; title: string; body: string; accent: string }) {
    const ref = useRef<HTMLLIElement | null>(null)
    const inView = useInView(ref, { once: true, amount: 0.5 })

    return (
        <li
            ref={ref}
            className="relative flex items-stretch gap-4">
            {/* Rail column — fixed-width gutter that holds the dot centred on the
                vertical rail. Card sits in the flex-1 column to the right so the
                dot can never overlap card text. */}
            <div className="relative flex-shrink-0" style={{ width: 32 }}>
                <motion.span
                    aria-hidden="true"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.05 }}
                    className="absolute z-[2] w-5 h-5 rounded-full"
                    style={{
                        left: 22 - 10, // rail at 22px, dot is 20px wide — left edge at 12 centres it
                        top: 14,
                        background: inView ? accent : 'var(--surface)',
                        border: `2px solid ${accent}`,
                        boxShadow: inView ? `0 0 0 4px ${accent}22, 0 4px 10px ${accent}40` : 'none'
                    }}>
                    <motion.span
                        aria-hidden="true"
                        initial={{ scale: 0.6, opacity: 0.6 }}
                        animate={inView ? { scale: 2, opacity: 0 } : { scale: 0.6, opacity: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full"
                        style={{ background: accent }}
                    />
                </motion.span>
            </div>

            {/* Card column */}
            <motion.div
                initial={{ opacity: 0, x: 28 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 28 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.12 }}
                className="flex-1 min-w-0"
                style={{
                    background: 'var(--surface)',
                    border: `1px solid ${inView ? accent + '55' : 'var(--line)'}`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    boxShadow: inView ? `0 6px 18px ${accent}1a` : 'var(--card-shadow)'
                }}>
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="font-mono text-[10px] font-bold tracking-[0.16em] px-1.5 py-0.5 rounded-md"
                        style={{
                            background: `${accent}15`,
                            color: accent
                        }}>
                        STEP {String(index + 1).padStart(2, '0')}
                    </span>
                </div>
                <h3
                    className="font-display text-[14px] font-semibold leading-tight mb-1"
                    style={{ color: 'var(--text-primary)' }}>
                    {title}
                </h3>
                <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}>
                    {body}
                </p>
            </motion.div>
        </li>
    )
}

function FinaleRung() {
    const ref = useRef<HTMLLIElement | null>(null)
    const inView = useInView(ref, { once: true, amount: 0.6 })

    return (
        <li
            ref={ref}
            className="relative flex items-stretch gap-4 pt-2">
            {/* Rail column with trophy badge centred on the rail */}
            <div className="relative flex-shrink-0" style={{ width: 32 }}>
                <motion.div
                    initial={{ scale: 0, rotate: -45, opacity: 0 }}
                    animate={inView ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -45, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                    className="absolute z-[2] w-9 h-9 rounded-full inline-flex items-center justify-center"
                    style={{
                        left: 22 - 18, // 9*4=36px wide, half = 18, centre on rail at 22 → left = 4
                        top: 8,
                        background: 'linear-gradient(135deg, var(--brand), var(--accent))',
                        color: '#fff',
                        boxShadow: '0 8px 22px rgba(13,79,60,0.35)'
                    }}>
                    <Trophy size={16} />
                </motion.div>

                {inView && (
                    <>
                        {[0, 60, 120, 180, 240, 300].map((angle, k) => (
                            <motion.span
                                key={k}
                                aria-hidden="true"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    x: Math.cos((angle * Math.PI) / 180) * 26,
                                    y: Math.sin((angle * Math.PI) / 180) * 26
                                }}
                                transition={{ duration: 1.2, delay: 0.3 + k * 0.05 }}
                                className="absolute w-1.5 h-1.5 rounded-full"
                                style={{
                                    left: 22 - 3,
                                    top: 26,
                                    background: 'var(--accent)'
                                }}
                            />
                        ))}
                    </>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, x: 28 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 28 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.25 }}
                className="flex-1 min-w-0"
                style={{
                    background: 'linear-gradient(135deg, var(--brand-soft) 0%, var(--accent-soft) 100%)',
                    border: '1px solid var(--brand)',
                    borderRadius: 14,
                    padding: '14px 16px'
                }}>
                <div
                    className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1"
                    style={{ color: 'var(--brand)' }}>
                    The summit
                </div>
                <h3
                    className="font-display text-[16px] font-semibold leading-tight"
                    style={{ color: 'var(--text-primary)' }}>
                    Offer in hand 🎉
                </h3>
                <p
                    className="text-[12px] mt-1 leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}>
                    You climbed every rung — that's the Albero promise.
                </p>
            </motion.div>
        </li>
    )
}
