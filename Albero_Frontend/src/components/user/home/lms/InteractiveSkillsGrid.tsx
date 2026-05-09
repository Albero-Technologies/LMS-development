import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Sparkles, Wand2 } from 'lucide-react'
import { useMagnet, useCountUp } from '@/hooks/useInteractive'

// ─── Skill data ──────────────────────────────────────────────────────────────

type Skill = { label: string; track: string; size: 's' | 'm' | 'l' }

// Roughly 5–6 chips per track so every programme has enough surface area to
// land. Sizes are mixed (s / m / l) so the cloud breathes visually instead of
// becoming a uniform wall of pills.
const skills: Skill[] = [
    // Data Analytics
    { label: 'SQL', track: 'data-analytics', size: 'l' },
    { label: 'Statistics', track: 'data-analytics', size: 'm' },
    { label: 'Pandas', track: 'data-analytics', size: 's' },
    { label: 'Hypothesis Testing', track: 'data-analytics', size: 'm' },
    { label: 'Looker', track: 'data-analytics', size: 's' },

    // Business Analytics
    { label: 'Power BI', track: 'business-analytics', size: 'm' },
    { label: 'Tableau', track: 'business-analytics', size: 'm' },
    { label: 'DAX', track: 'business-analytics', size: 's' },
    { label: 'Case Frameworks', track: 'business-analytics', size: 'm' },
    { label: 'Storytelling', track: 'business-analytics', size: 's' },

    // Data Science with ML & GenAI
    { label: 'Python', track: 'data-science-ai', size: 'l' },
    { label: 'LLMs', track: 'data-science-ai', size: 'l' },
    { label: 'PyTorch', track: 'data-science-ai', size: 's' },
    { label: 'LangChain', track: 'data-science-ai', size: 'm' },
    { label: 'Hugging Face', track: 'data-science-ai', size: 'm' },
    { label: 'MLOps', track: 'data-science-ai', size: 'm' },
    { label: 'RAG', track: 'data-science-ai', size: 's' },

    // Full-Stack
    { label: 'React', track: 'full-stack', size: 'l' },
    { label: 'Node.js', track: 'full-stack', size: 'm' },
    { label: 'TypeScript', track: 'full-stack', size: 'm' },
    { label: 'MongoDB', track: 'full-stack', size: 's' },
    { label: 'System Design', track: 'full-stack', size: 'm' },

    // Data Engineering
    { label: 'Spark', track: 'data-engineering', size: 'm' },
    { label: 'Airflow', track: 'data-engineering', size: 's' },
    { label: 'dbt', track: 'data-engineering', size: 's' },
    { label: 'Snowflake', track: 'data-engineering', size: 'm' },
    { label: 'Kafka', track: 'data-engineering', size: 'm' },
    { label: 'AWS', track: 'data-engineering', size: 's' },

    // Cybersecurity
    { label: 'Linux', track: 'cybersecurity', size: 'm' },
    { label: 'OWASP Top 10', track: 'cybersecurity', size: 'm' },
    { label: 'Burp Suite', track: 'cybersecurity', size: 's' },
    { label: 'SIEM / Splunk', track: 'cybersecurity', size: 's' },
    { label: 'Pentest', track: 'cybersecurity', size: 'm' },
    { label: 'Wireshark', track: 'cybersecurity', size: 's' },

    // Product Analytics
    { label: 'Mixpanel', track: 'product-analytics', size: 's' },
    { label: 'Amplitude', track: 'product-analytics', size: 's' },
    { label: 'A/B Testing', track: 'product-analytics', size: 'm' },
    { label: 'Funnels', track: 'product-analytics', size: 'm' },
    { label: 'Cohort Analysis', track: 'product-analytics', size: 'm' },

    // Investment Banking
    { label: 'Excel', track: 'investment-banking', size: 'm' },
    { label: 'Valuations', track: 'investment-banking', size: 'm' },
    { label: 'DCF', track: 'investment-banking', size: 's' },
    { label: 'M&A', track: 'investment-banking', size: 's' },
    { label: 'LBO', track: 'investment-banking', size: 's' },
    { label: 'Pitchbooks', track: 'investment-banking', size: 'm' }
]

const trackMeta: Record<string, { name: string; color: string }> = {
    'data-analytics': { name: 'Data Analytics', color: '#0078D4' },
    'business-analytics': { name: 'Business Analytics', color: '#B86A18' },
    'data-science-ai': { name: 'Data Science & AI', color: '#7c3aed' },
    'full-stack': { name: 'Full-Stack', color: '#10b981' },
    'data-engineering': { name: 'Data Engineering', color: '#ef4444' },
    cybersecurity: { name: 'Cybersecurity', color: '#06b6d4' },
    'product-analytics': { name: 'Product Analytics', color: '#f97316' },
    'investment-banking': { name: 'Investment Banking', color: '#6366f1' }
}

const SIZE_CLASSES: Record<Skill['size'], string> = {
    s: 'text-[12px] py-1.5 px-3',
    m: 'text-[14px] py-2 px-4',
    l: 'text-[16px] py-2.5 px-5'
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InteractiveSkillsGrid() {
    const navigate = useNavigate()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const cloudRef = useRef<HTMLDivElement | null>(null)
    const [activeTrack, setActiveTrack] = useState<string | null>(null)

    const ctaRef = useMagnet<HTMLButtonElement>({ strength: 10 })

    const learnersRef = useCountUp<HTMLSpanElement>({ end: 12000, suffix: '+', duration: 1800 })
    const skillsCountRef = useCountUp<HTMLSpanElement>({ end: 120, suffix: '+', duration: 1800 })
    const placedRef = useCountUp<HTMLSpanElement>({ end: 92, suffix: '%', duration: 1800 })

    // ── Cursor-following backdrop blob (no React state) ─────────────────────
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        if (window.matchMedia('(pointer: coarse)').matches) return
        const blob = container.querySelector('[data-blob]') as HTMLElement | null
        if (!blob) return
        gsap.set(blob, { xPercent: -50, yPercent: -50 })
        const xTo = gsap.quickTo(blob, 'x', { duration: 0.6, ease: 'power3' })
        const yTo = gsap.quickTo(blob, 'y', { duration: 0.6, ease: 'power3' })

        const onMove = (e: PointerEvent) => {
            const rect = container.getBoundingClientRect()
            xTo(e.clientX - rect.left)
            yTo(e.clientY - rect.top)
        }
        container.addEventListener('pointermove', onMove)
        return () => container.removeEventListener('pointermove', onMove)
    }, [])

    // ── Idle wobble. We pause it when the cloud has an active track so the
    //    GPU isn't fighting two transform sources on the same chip. ─────────
    useEffect(() => {
        const cloud = cloudRef.current
        if (!cloud) return
        const chips = cloud.querySelectorAll<HTMLElement>('[data-chip]')
        const tweens: gsap.core.Tween[] = []
        chips.forEach((chip) => {
            const ampX = (Math.random() - 0.5) * 4
            const ampY = (Math.random() - 0.5) * 4
            const dur = 3 + Math.random() * 2
            tweens.push(
                gsap.to(chip, {
                    x: ampX,
                    y: ampY,
                    duration: dur,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: Math.random() * 0.6
                })
            )
        })
        return () => {
            tweens.forEach((t) => t.kill())
        }
    }, [])

    // Pause/resume the wobble depending on hover state.
    useEffect(() => {
        const cloud = cloudRef.current
        if (!cloud) return
        const chips = cloud.querySelectorAll<HTMLElement>('[data-chip]')
        chips.forEach((chip) => {
            gsap.getTweensOf(chip).forEach((t) => {
                if (activeTrack) t.pause()
                else t.resume()
            })
        })
    }, [activeTrack])

    return (
        <section
            ref={containerRef}
            className="relative py-24 px-5 md:px-8 overflow-hidden alb-skills"
            style={{ background: 'var(--page-bg-soft)', color: 'var(--text-primary)' }}>
            {/* Cursor blob */}
            <div
                aria-hidden="true"
                data-blob
                className="absolute pointer-events-none"
                style={{
                    width: 380,
                    height: 380,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    left: 0,
                    top: 0,
                    zIndex: 0
                }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14 items-center">
                    {/* Left — copy + counters */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5 }}>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold tracking-[0.18em] uppercase"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            <Wand2 size={12} /> Skills you'll ship with
                        </div>
                        <h2
                            className="font-display tracking-[-0.02em]"
                            style={{
                                color: 'var(--text-primary)',
                                fontSize: 'clamp(34px, 4.6vw, 56px)',
                                lineHeight: 1.02
                            }}>
                            Hover a skill —{' '}
                            <span
                                className="italic font-light"
                                style={{ color: 'var(--brand)' }}>
                                see its track.
                            </span>
                        </h2>
                        <p
                            className="mt-5 text-[15.5px] leading-relaxed max-w-[520px]"
                            style={{ color: 'var(--text-secondary)' }}>
                            Every Albero programme maps to a working role. Hover any chip to highlight every other skill in the same track.
                        </p>

                        <div
                            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
                            style={{
                                background: activeTrack ? 'var(--surface)' : 'transparent',
                                border: activeTrack ? `1px solid ${trackMeta[activeTrack].color}40` : '1px solid transparent',
                                color: activeTrack ? trackMeta[activeTrack].color : 'var(--text-tertiary)',
                                boxShadow: activeTrack ? 'var(--card-shadow)' : 'none',
                                minHeight: 36
                            }}>
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    background: activeTrack ? trackMeta[activeTrack].color : 'var(--text-tertiary)'
                                }}
                            />
                            {activeTrack ? trackMeta[activeTrack].name : 'Hover any chip to start'}
                        </div>

                        <div className="mt-7 grid grid-cols-3 gap-5 max-w-[480px]">
                            <Stat label="Learners">
                                <span ref={learnersRef} />
                            </Stat>
                            <Stat label="Skills taught">
                                <span ref={skillsCountRef} />
                            </Stat>
                            <Stat label="Placed">
                                <span ref={placedRef} />
                            </Stat>
                        </div>

                        <button
                            ref={ctaRef}
                            onClick={() => navigate(activeTrack ? `/programs/${activeTrack}` : '/pricing')}
                            className="mt-8 px-5 py-3 rounded-full text-[13.5px] font-bold inline-flex items-center justify-center gap-2"
                            style={{
                                background: 'var(--brand)',
                                color: 'var(--text-on-inverse)',
                                boxShadow: '0 8px 18px rgba(13,79,60,0.30)'
                            }}>
                            <Sparkles size={14} />
                            {activeTrack ? `Explore ${trackMeta[activeTrack].name}` : 'Explore all programs'}
                            <ArrowUpRight size={14} />
                        </button>
                    </motion.div>

                    {/* Right — skills cloud
                        Heavy heavy lifting is done with a CSS attribute selector
                        (`[data-active]`) on the cloud — no per-chip state, so
                        moving the cursor across chips never re-renders React. */}
                    <div
                        ref={cloudRef}
                        data-active={activeTrack ?? ''}
                        className="alb-skills-cloud relative flex flex-wrap items-center justify-center gap-2 md:gap-2.5 py-6"
                        style={{ minHeight: 440 }}
                        onMouseLeave={() => setActiveTrack(null)}>
                        {skills.map((s) => {
                            const meta = trackMeta[s.track]
                            return (
                                <button
                                    key={s.label}
                                    data-chip
                                    data-track={s.track}
                                    onPointerEnter={() => setActiveTrack(s.track)}
                                    onClick={() => navigate(`/programs/${s.track}`)}
                                    className={`alb-chip rounded-full font-display font-semibold tracking-tight ${SIZE_CLASSES[s.size]}`}
                                    style={
                                        {
                                            // Track-specific colour stored once via CSS variable
                                            // so the active-state styles can read it without JS.
                                            ['--chip-color' as string]: meta.color
                                        } as React.CSSProperties
                                    }>
                                    {s.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div
                className="font-display text-[28px] md:text-[32px] leading-none font-semibold tracking-[-0.02em]"
                style={{ color: 'var(--brand)' }}>
                {children}
            </div>
            <div
                className="text-[10.5px] tracking-[0.16em] uppercase mt-2"
                style={{ color: 'var(--text-tertiary)' }}>
                {label}
            </div>
        </div>
    )
}
