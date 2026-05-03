import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Video, MessageSquareText, Hammer, Briefcase } from 'lucide-react'

const steps = [
    {
        n: '01',
        Icon: Video,
        title: 'Live cohort classes',
        desc: '3–4 live sessions every week with working practitioners. Recordings posted within 12 hours, watchable on 1.5×.',
        meta: 'Mon · Wed · Fri · 8 PM IST'
    },
    {
        n: '02',
        Icon: MessageSquareText,
        title: '1:1 mentorship',
        desc: 'Weekly 30-minute calls with a senior mentor. Resume reviews, project deep-dives, mock interviews — all included.',
        meta: 'Match within 7 days of joining'
    },
    {
        n: '03',
        Icon: Hammer,
        title: 'Industry projects',
        desc: '8–12 portfolio-grade projects on real datasets from e-commerce, finance, and healthcare. Reviewed by mentors weekly.',
        meta: 'Yours to keep on GitHub'
    },
    {
        n: '04',
        Icon: Briefcase,
        title: 'Career sprint',
        desc: 'Resume, LinkedIn, mock interviews, referrals. Ongoing placement support until you land your role.',
        meta: 'Until offer in hand'
    }
]

export default function LearningExperience() {
    // Cycle which step "pulses" so the roadmap feels alive even at rest.
    // Pause the cycling whenever the user is hovering anywhere in the section
    // (so the running pulse + travelling-dot don't fight their attention).
    const [pulse, setPulse] = useState(0)
    const [paused, setPaused] = useState(false)
    useEffect(() => {
        if (paused) return
        const t = window.setInterval(() => setPulse((i) => (i + 1) % steps.length), 1800)
        return () => window.clearInterval(t)
    }, [paused])

    return (
        <section
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Background grid */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                    maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 50%, transparent 95%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 50%, transparent 95%)'
                }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                <div className="text-center max-w-[760px] mx-auto mb-16">
                    <div
                        className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
                        style={{ color: 'var(--brand)' }}>
                        How Albero works
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[58px] leading-[0.96] tracking-[-0.02em] font-medium"
                        style={{ color: 'var(--text-primary)' }}>
                        Built around your{' '}
                        <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                            outcome,
                        </span>
                        <br />
                        not just your syllabus.
                    </h2>
                    <p
                        className="mt-5 text-[16px] leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}>
                        Four pieces that actually drive a career change. Hover the section to pause the animation; move the cursor away to resume.
                    </p>
                </div>

                {/* Horizontal roadmap (desktop) → vertical (mobile) */}
                <div className="relative">
                    {/* ── Desktop: horizontal straight line connecting all 4 orbs ── */}
                    {/* The orbs sit on a 4-column grid, so their centres land at
                        x = 1/8, 3/8, 5/8, 7/8 of the row width (i.e. 150, 450,
                        750, 1050 inside this 1200-wide viewBox). The line spans
                        only between the first and last orb so it doesn't poke
                        out either end. */}
                    <svg
                        aria-hidden="true"
                        className="hidden md:block absolute left-0 right-0 top-[36px] w-full pointer-events-none"
                        height="20"
                        viewBox="0 0 1200 20"
                        preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="albRoadmapGradient" x1="0" x2="1" y1="0" y2="0">
                                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.08" />
                                <stop offset="50%" stopColor="var(--brand)" stopOpacity="0.55" />
                                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.08" />
                            </linearGradient>
                        </defs>

                        {/* Static dashed base line */}
                        <line
                            x1="150"
                            y1="10"
                            x2="1050"
                            y2="10"
                            stroke="var(--line-strong)"
                            strokeWidth="1.5"
                            strokeDasharray="4 6"
                        />

                        {/* Animated bright pulse — re-traces left → right when scrolled in */}
                        <motion.line
                            x1="150"
                            y1="10"
                            x2="1050"
                            y2="10"
                            stroke="url(#albRoadmapGradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, ease: 'easeInOut' }}
                        />

                        {/* Travelling glow dot — runs along the straight line,
                            unmounts while the section is hovered. */}
                        {!paused && (
                            <motion.circle
                                r="5"
                                fill="var(--brand)"
                                filter="drop-shadow(0 0 8px var(--brand))">
                                <animateMotion
                                    dur="6s"
                                    repeatCount="indefinite"
                                    path="M 150 10 L 1050 10"
                                />
                            </motion.circle>
                        )}
                    </svg>

                    {/* Step nodes — desktop horizontal grid */}
                    <div className="hidden md:grid md:grid-cols-4 gap-6 relative">
                        {steps.map((s, i) => {
                            const Icon = s.Icon
                            const isPulse = pulse === i
                            return (
                                <motion.div
                                    key={s.n}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    onMouseEnter={() => setPulse(i)}
                                    className="relative flex flex-col items-center text-center group">
                                    {/* Node — pulse ring */}
                                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                                        {/* Outer expanding pulse */}
                                        {isPulse && (
                                            <>
                                                <motion.span
                                                    aria-hidden="true"
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ background: 'var(--brand-soft)' }}
                                                    initial={{ scale: 1, opacity: 0.7 }}
                                                    animate={{ scale: 1.7, opacity: 0 }}
                                                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                                                />
                                                <motion.span
                                                    aria-hidden="true"
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ background: 'var(--brand-soft)' }}
                                                    initial={{ scale: 1, opacity: 0.5 }}
                                                    animate={{ scale: 1.4, opacity: 0 }}
                                                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                                                />
                                            </>
                                        )}

                                        <span
                                            className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all"
                                            style={{
                                                background: isPulse ? 'var(--brand)' : 'var(--surface)',
                                                color: isPulse ? 'var(--text-on-inverse)' : 'var(--brand)',
                                                border: `2px solid ${isPulse ? 'var(--brand)' : 'var(--line-strong)'}`,
                                                boxShadow: isPulse ? '0 0 0 6px var(--brand-soft)' : 'var(--card-shadow)'
                                            }}>
                                            <Icon size={22} />
                                        </span>
                                    </div>

                                    <div
                                        className="font-mono text-[10px] tracking-[0.22em] font-semibold mb-2"
                                        style={{ color: isPulse ? 'var(--brand)' : 'var(--text-tertiary)' }}>
                                        STEP {s.n}
                                    </div>

                                    <div
                                        className="rounded-2xl p-5 transition-all w-full"
                                        style={{
                                            background: 'var(--surface)',
                                            border: '1px solid',
                                            borderColor: isPulse ? 'var(--brand)' : 'var(--line)',
                                            boxShadow: isPulse ? 'var(--card-shadow-hover)' : 'var(--card-shadow)'
                                        }}>
                                        <h3
                                            className="font-display text-[19px] font-semibold leading-tight mb-2"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {s.title}
                                        </h3>
                                        <p
                                            className="text-[13px] leading-relaxed mb-3"
                                            style={{ color: 'var(--text-secondary)' }}>
                                            {s.desc}
                                        </p>
                                        <div
                                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px]"
                                            style={{
                                                background: 'var(--surface-2)',
                                                color: 'var(--text-tertiary)',
                                                border: '1px solid var(--line)'
                                            }}>
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ background: 'var(--brand)' }}
                                            />
                                            {s.meta}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* ── Mobile: vertical timeline with pulse ── */}
                    <div className="md:hidden relative">
                        <div
                            aria-hidden="true"
                            className="absolute left-7 top-4 bottom-4 w-px"
                            style={{ background: 'var(--line-strong)' }}
                        />
                        <div className="space-y-8">
                            {steps.map((s, i) => {
                                const Icon = s.Icon
                                const isPulse = pulse === i
                                return (
                                    <motion.div
                                        key={s.n}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{ duration: 0.45 }}
                                        className="relative pl-16">
                                        <div className="absolute left-0 top-1.5 w-14 h-14 flex items-center justify-center">
                                            {isPulse && (
                                                <motion.span
                                                    aria-hidden="true"
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ background: 'var(--brand-soft)' }}
                                                    initial={{ scale: 1, opacity: 0.6 }}
                                                    animate={{ scale: 1.6, opacity: 0 }}
                                                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                                                />
                                            )}
                                            <span
                                                className="relative w-12 h-12 rounded-full flex items-center justify-center"
                                                style={{
                                                    background: isPulse ? 'var(--brand)' : 'var(--surface)',
                                                    color: isPulse ? 'var(--text-on-inverse)' : 'var(--brand)',
                                                    border: `2px solid ${isPulse ? 'var(--brand)' : 'var(--line-strong)'}`,
                                                    boxShadow: isPulse ? '0 0 0 5px var(--brand-soft)' : 'none'
                                                }}>
                                                <Icon size={18} />
                                            </span>
                                        </div>

                                        <div
                                            className="rounded-2xl p-5"
                                            style={{
                                                background: 'var(--surface)',
                                                border: '1px solid var(--line)',
                                                boxShadow: 'var(--card-shadow)'
                                            }}>
                                            <div
                                                className="font-mono text-[10px] tracking-[0.22em] font-semibold mb-1.5"
                                                style={{ color: 'var(--text-tertiary)' }}>
                                                STEP {s.n}
                                            </div>
                                            <h3
                                                className="font-display text-[20px] font-semibold leading-tight mb-2"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {s.title}
                                            </h3>
                                            <p
                                                className="text-[13.5px] leading-relaxed mb-3"
                                                style={{ color: 'var(--text-secondary)' }}>
                                                {s.desc}
                                            </p>
                                            <div
                                                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px]"
                                                style={{
                                                    background: 'var(--surface-2)',
                                                    color: 'var(--text-tertiary)',
                                                    border: '1px solid var(--line)'
                                                }}>
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ background: 'var(--brand)' }}
                                                />
                                                {s.meta}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
