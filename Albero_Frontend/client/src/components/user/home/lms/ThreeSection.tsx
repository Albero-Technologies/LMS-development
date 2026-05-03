import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Sparkles, Cpu, Layers, Atom } from 'lucide-react'

const ThreeShowcase = lazy(() => import('@/components/common/ThreeShowcase'))

// A 3D-anchored editorial section. Lazy-loads the WebGL canvas so the bundle
// stays light for visitors who never reach this section.

const callouts = [
    { Icon: Atom, label: 'Live + Mentor-led', sub: 'Real practitioners, weekly' },
    { Icon: Layers, label: 'Portfolio capstones', sub: '8–12 reviewed projects' },
    { Icon: Cpu, label: 'AI-native curriculum', sub: 'GenAI baked into every track' }
]

export default function ThreeSection() {
    const navigate = useNavigate()
    return (
        <section
            className="relative py-20 md:py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Decor */}
            <div
                aria-hidden="true"
                className="absolute -top-24 -right-32 w-[420px] h-[420px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-32 w-[460px] h-[460px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
                    {/* Left — copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5 }}>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold tracking-[0.18em] uppercase"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            <Sparkles size={12} /> Built for builders
                        </div>
                        <h2
                            className="font-display tracking-[-0.02em]"
                            style={{
                                color: 'var(--text-primary)',
                                fontSize: 'clamp(34px, 4.6vw, 56px)',
                                lineHeight: 1.02
                            }}>
                            Learning that{' '}
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                ships.
                            </span>
                        </h2>
                        <p
                            className="mt-5 text-[15.5px] leading-relaxed max-w-[520px]"
                            style={{ color: 'var(--text-secondary)' }}>
                            Every cohort is built around production-grade work — capstones reviewed by IBM and Microsoft mentors,
                            referrals into 180+ hiring partners, and a placement sprint that runs until you have an offer in hand.
                        </p>

                        <ul className="mt-7 grid sm:grid-cols-3 gap-3">
                            {callouts.map(({ Icon, label, sub }) => (
                                <li
                                    key={label}
                                    className="rounded-2xl p-4"
                                    style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--line)',
                                        boxShadow: 'var(--card-shadow)'
                                    }}>
                                    <div
                                        className="w-9 h-9 rounded-lg inline-flex items-center justify-center mb-3"
                                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="font-display text-[14px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                        {label}
                                    </div>
                                    <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                        {sub}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-5 py-3 rounded-full text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px]"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 8px 18px rgba(13,79,60,0.30)'
                                }}>
                                See Programs &amp; Pricing <ArrowUpRight size={14} />
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-5 py-3 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                                style={{
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--line-strong)'
                                }}>
                                Talk to a counsellor
                            </button>
                        </div>
                    </motion.div>

                    {/* Right — 3D canvas */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-[28px] overflow-hidden w-full max-w-full"
                        style={{
                            background:
                                'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow-hover)',
                            // Aspect-ratio plus minHeight overflowed on narrow phones
                            // (360px minHeight × 5/4 = 450px wide). Cap height
                            // explicitly so the canvas always fits the parent column.
                            aspectRatio: '5 / 4',
                            minHeight: 280,
                            maxHeight: 'min(60vh, 480px)'
                        }}>
                        {/* Browser-style header */}
                        <div
                            className="absolute top-0 left-0 right-0 z-[2] px-4 py-2.5 flex items-center justify-between"
                            style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                                <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                                <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                            </div>
                            <span
                                className="font-mono text-[10.5px] tracking-tight"
                                style={{ color: 'var(--text-secondary)' }}>
                                albero.academy/preview
                            </span>
                            <span style={{ width: 32 }} />
                        </div>

                        {/* Canvas */}
                        <div className="absolute inset-0 pt-10">
                            <Suspense
                                fallback={
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div
                                            className="w-10 h-10 rounded-full border-2 animate-spin"
                                            style={{ borderColor: 'var(--brand-soft)', borderTopColor: 'var(--brand)' }}
                                        />
                                    </div>
                                }>
                                <ThreeShowcase variant="knowledge-graph" />
                            </Suspense>
                        </div>

                        {/* Floating label */}
                        <div
                            className="absolute bottom-4 left-4 right-4 z-[2] px-4 py-3 rounded-2xl flex items-center justify-between"
                            style={{
                                // Theme-aware: --surface tracks light/dark; the
                                // alpha layer keeps the canvas faintly visible
                                // through the panel without sacrificing text
                                // contrast (was hardcoded white → washed out in
                                // light mode and unreadable in dark mode).
                                background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid var(--line)'
                            }}>
                            <div className="leading-tight">
                                <div className="text-[10.5px] tracking-[0.16em] uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                    Knowledge graph
                                </div>
                                <div className="font-display text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    You · 8 skills · 14 hiring partners — live
                                </div>
                            </div>
                            <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-tight"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <Sparkles size={11} /> Live
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
