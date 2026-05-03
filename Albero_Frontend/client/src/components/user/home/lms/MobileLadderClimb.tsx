import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Trophy, Sparkles, Flag } from 'lucide-react'

const steps = [
    {
        title: 'Day 1 — Join the cohort',
        body: 'Get matched to a mentor and meet your batch within 7 days of enrollment.'
    },
    {
        title: 'Month 1 — First capstone',
        body: 'Ship your first portfolio-grade project, reviewed live by a senior practitioner.'
    },
    {
        title: 'Month 3 — Mentor sign-off',
        body: 'Pass the mid-program review and earn your IBM SkillsBuild badge.'
    },
    {
        title: 'Month 5 — Mock interviews',
        body: 'Run 6 mock rounds with hiring managers. Resume + LinkedIn rebuilt.'
    },
    {
        title: 'Month 6 — Offer in hand',
        body: 'Referrals routed to 180+ partners. Placement support runs until you sign.'
    }
]

// Mobile vertical ladder. The whole section is taller than the viewport
// so the user scrolls through it; a center rail fills emerald as the
// active step changes, and a hiker icon climbs from rung to rung.
export default function MobileLadderClimb() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const onScroll = () => {
            const el = sectionRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const total = rect.height - window.innerHeight
            const raw = -rect.top / Math.max(total, 1)
            setProgress(Math.min(1, Math.max(0, raw)))
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])

    const climbProgress = Math.min(1, progress / 0.85)
    const trophyProgress = Math.max(0, (progress - 0.8) / 0.2)
    const activeStep = climbProgress >= 1
        ? steps.length - 1
        : Math.min(steps.length - 1, Math.floor(climbProgress * steps.length))

    return (
        <section
            ref={sectionRef}
            className="relative md:hidden"
            // 280vh gives the climb breathing room without being interminable.
            style={{ height: '280vh', background: 'var(--page-bg)' }}>
            <div
                className="sticky top-0 h-screen flex flex-col overflow-hidden"
                style={{ background: 'var(--page-bg)' }}>
                {/* Decorative blob */}
                <div
                    aria-hidden="true"
                    className="absolute -top-20 -right-24 w-[320px] h-[320px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)',
                        filter: 'blur(50px)'
                    }}
                />

                {/* Header */}
                <div className="text-center px-5 pt-[120px] pb-3 relative z-[1]">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[10.5px] font-semibold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <Sparkles size={11} /> Step-by-step success
                    </div>
                    <h2
                        className="font-display tracking-[-0.02em]"
                        style={{
                            color: 'var(--text-primary)',
                            fontSize: 'clamp(26px, 7.5vw, 38px)',
                            lineHeight: 1.05
                        }}>
                        Six months,{' '}
                        <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                            one rung at a time.
                        </span>
                    </h2>
                </div>

                {/* Ladder */}
                <div className="relative flex-1 overflow-hidden px-5 pb-4">
                    <div className="relative h-full max-w-[420px] mx-auto">
                        {/* Vertical rail (background track) */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] rounded-full"
                            style={{ background: 'var(--line)' }}
                        />
                        {/* Vertical rail (filled progress) — grows top-down as climb progresses */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 top-0 w-[3px] rounded-full"
                            style={{
                                background: 'linear-gradient(180deg, var(--accent), var(--brand))',
                                height: `${climbProgress * 100}%`,
                                transition: 'height 120ms linear'
                            }}
                        />

                        {/* Rungs — each is a horizontal line crossing the rail */}
                        <div className="relative h-full flex flex-col justify-between py-6">
                            {steps.map((s, i) => {
                                const reached = i <= activeStep
                                const onLeft = i % 2 === 0
                                return (
                                    <div
                                        key={i}
                                        className="relative flex items-center"
                                        style={{ height: 64 }}>
                                        {/* Rung dot */}
                                        <div
                                            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-[2]"
                                            style={{
                                                background: reached ? 'var(--brand)' : 'var(--surface)',
                                                border: `2px solid ${reached ? 'var(--brand)' : 'var(--line-strong)'}`,
                                                boxShadow: reached ? '0 0 0 4px var(--brand-soft)' : 'none',
                                                transition: 'all 220ms ease'
                                            }}
                                        />
                                        {/* Step number badge sits on the dot */}
                                        <span
                                            className="absolute left-1/2 -translate-x-1/2 -translate-y-[28px] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md z-[2]"
                                            style={{
                                                background: reached ? 'var(--brand)' : 'var(--surface-2)',
                                                color: reached ? 'var(--text-on-inverse)' : 'var(--text-tertiary)',
                                                transition: 'all 220ms ease'
                                            }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>

                                        {/* Card */}
                                        <motion.div
                                            initial={{ opacity: 0, x: onLeft ? -20 : 20 }}
                                            animate={{
                                                opacity: reached ? 1 : 0.4,
                                                x: 0
                                            }}
                                            transition={{ duration: 0.35 }}
                                            className={`absolute ${onLeft ? 'right-1/2 mr-5 text-right' : 'left-1/2 ml-5 text-left'} max-w-[44vw]`}
                                            style={{
                                                background: 'var(--surface)',
                                                border: `1px solid ${reached ? 'var(--brand)' : 'var(--line)'}`,
                                                borderRadius: 12,
                                                padding: '8px 10px',
                                                boxShadow: 'var(--card-shadow)'
                                            }}>
                                            <div
                                                className="text-[10px] font-bold tracking-[0.15em] uppercase mb-0.5"
                                                style={{ color: reached ? 'var(--brand)' : 'var(--text-tertiary)' }}>
                                                Step {i + 1}
                                            </div>
                                            <div
                                                className="font-display text-[12.5px] font-semibold leading-tight"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {s.title}
                                            </div>
                                        </motion.div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Climbing hiker — moves down the rail as climbProgress grows.
                            Sits ABOVE the active rung so it visibly leads the climb. */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 z-[3] flex items-center justify-center w-9 h-9 rounded-full"
                            style={{
                                top: `calc(${Math.min(climbProgress, 1) * 100}% - 18px)`,
                                background: 'var(--brand)',
                                color: 'var(--text-on-inverse)',
                                boxShadow: '0 6px 18px rgba(13,79,60,0.35), 0 0 0 4px var(--page-bg)',
                                transition: 'top 120ms linear'
                            }}>
                            {trophyProgress > 0.5 ? <Trophy size={16} /> : <Flag size={16} />}
                        </div>
                    </div>
                </div>

                {/* Bottom progress bar */}
                <div className="px-5 pb-6 pt-2 relative z-[1]">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className="w-7 h-7 rounded-lg inline-flex items-center justify-center font-mono text-[10.5px] font-bold flex-shrink-0"
                            style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                            {String(activeStep + 1).padStart(2, '0')}
                        </span>
                        <div className="leading-tight min-w-0">
                            <div
                                className="font-display text-[13px] font-semibold truncate"
                                style={{ color: 'var(--text-primary)' }}>
                                {progress >= 0.95 ? 'Offer in hand 🎉' : steps[activeStep].title}
                            </div>
                            <div
                                className="text-[10.5px] leading-snug line-clamp-2"
                                style={{ color: 'var(--text-tertiary)' }}>
                                {progress >= 0.95
                                    ? "You climbed every rung — that's the Albero promise."
                                    : steps[activeStep].body}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[9.5px] tracking-[0.16em] uppercase font-semibold"
                            style={{ color: 'var(--text-tertiary)' }}>
                            Climb
                        </span>
                        <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--line)' }}>
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${progress * 100}%`,
                                    background: 'linear-gradient(90deg, var(--brand), var(--accent))',
                                    transition: 'width 80ms linear'
                                }}
                            />
                        </div>
                        <span
                            className="font-mono text-[10.5px] font-semibold"
                            style={{ color: 'var(--brand)' }}>
                            {Math.round(progress * 100)}%
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}
