import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Award, ShieldCheck, Stamp, BadgeCheck, Sparkles, ScanLine, ChevronLeft, ChevronRight } from 'lucide-react'

const certs = [
    {
        title: 'Albero Industry Certificate',
        issuer: 'Albero Academy',
        desc: 'Co-signed by your mentor and a hiring manager — every certificate ID is verifiable on our platform.',
        Icon: Award,
        accent: 'oklch(0.623 0.214 259.815)'
    },
    {
        title: 'Microsoft & AWS Partner Badges',
        issuer: 'Partner-issued',
        desc: 'Eligible for Microsoft DA-100 and AWS Cloud Practitioner partner pathways inside our flagship tracks.',
        Icon: ShieldCheck,
        accent: 'oklch(0.795 0.184 86.047)'
    },
    {
        title: 'Project-Backed Capstone Seal',
        issuer: 'Mentor verified',
        desc: 'Each capstone is reviewed and stamped by a senior practitioner — proof you shipped, not just attended.',
        Icon: Stamp,
        accent: 'oklch(0.627 0.265 303.9)'
    }
]

// ── Co-branded credentials (IBM / Microsoft / AWS / Google) ─────────────────
type Credential = {
    issuer: string
    slug: string
    color: string
    title: string
    audience: string
    bullets: string[]
}

const credentials: Credential[] = [
    {
        issuer: 'IBM',
        slug: 'ibm',
        color: '#0530AD',
        title: 'IBM SkillsBuild — Data Science Professional',
        audience: 'Data Science · AI/ML cohorts',
        bullets: [
            'Co-issued IBM badge on Credly',
            'Free IBM Cloud credits during the program',
            'Capstone reviewed against IBM hiring rubric'
        ]
    },
    {
        issuer: 'Microsoft',
        slug: 'microsoft',
        color: '#0078D4',
        title: 'Microsoft Learn — DA-100 & AI-900 Pathways',
        audience: 'Data Analytics · BI cohorts',
        bullets: [
            'Microsoft Certified: Data Analyst Associate prep',
            'Azure credits + Power BI Pro licence',
            'Voucher for one Microsoft exam included'
        ]
    },
    {
        issuer: 'AWS',
        slug: 'amazonaws',
        color: '#FF9900',
        title: 'AWS Cloud Practitioner — Pathway Partner',
        audience: 'Data Engineering · MLOps cohorts',
        bullets: [
            'AWS Cloud Practitioner exam prep included',
            '$200 AWS credits for capstone deployments',
            'AWS-aligned MLOps capstone walk-through'
        ]
    },
    {
        issuer: 'Google',
        slug: 'google',
        color: '#4285F4',
        title: 'Google Cloud — Data Engineer Track',
        audience: 'Data Engineering cohorts',
        bullets: [
            'Google Cloud Skills Boost labs',
            'BigQuery + Looker Studio capstone',
            'Pathway alignment with Google Cloud certs'
        ]
    }
]

export default function Certifications() {
    return (
        <section
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Decor washes */}
            <div
                aria-hidden="true"
                className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                aria-hidden="true"
                className="absolute bottom-[-30%] right-[-15%] w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(70px)' }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                <div className="text-center max-w-[760px] mx-auto mb-14">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <BadgeCheck size={12} /> Certifications
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium"
                        style={{ color: 'var(--text-primary)' }}>
                        Credentials hiring managers{' '}
                        <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                            actually trust.
                        </span>
                    </h2>
                    <p
                        className="mt-4 text-[15.5px]"
                        style={{ color: 'var(--text-secondary)' }}>
                        Verifiable, project-backed, and partner-aligned — every certificate has a unique ID employers can verify online.
                    </p>
                </div>

                {/* Hero certificate mock */}
                <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-3xl p-8 md:p-10 overflow-hidden"
                        style={{
                            background:
                                'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow-hover)'
                        }}>
                        {/* Inner faux-paper */}
                        <div
                            className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
                            style={{
                                background: 'var(--surface)',
                                border: '1.5px solid var(--brand)',
                                boxShadow: 'inset 0 0 0 6px var(--page-bg-soft)'
                            }}>
                            {/* Watermark */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] font-display italic"
                                style={{ fontSize: 220, color: 'var(--brand)' }}>
                                Albero
                            </div>

                            {/* Top */}
                            <div className="relative z-[1] flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
                                        style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                                            <path d="M12 3 C 7 7, 5 12, 12 21 C 19 12, 17 7, 12 3 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                            <path d="M12 8 L12 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <div className="leading-tight">
                                        <div className="font-display text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            Albero Academy
                                        </div>
                                        <div className="text-[10.5px] tracking-[0.22em] uppercase font-semibold" style={{ color: 'var(--brand)' }}>
                                            Certificate of Completion
                                        </div>
                                    </div>
                                </div>
                                <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold tracking-[0.16em] uppercase"
                                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                    <Sparkles size={11} /> Verified
                                </span>
                            </div>

                            {/* Body */}
                            <div className="relative z-[1] mb-6">
                                <div
                                    className="text-[12px] tracking-[0.18em] uppercase font-semibold mb-2"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    This certifies that
                                </div>
                                <div
                                    className="font-display text-[36px] md:text-[44px] leading-tight italic"
                                    style={{ color: 'var(--text-primary)' }}>
                                    Aanya Kapoor
                                </div>
                                <div
                                    className="mt-4 text-[14.5px] max-w-[520px]"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    has successfully completed the{' '}
                                    <span className="font-semibold" style={{ color: 'var(--brand)' }}>
                                        Data Analytics
                                    </span>{' '}
                                    program with capstone projects reviewed and approved by industry mentors.
                                </div>
                            </div>

                            {/* Footer signatures */}
                            <div className="relative z-[1] grid grid-cols-3 gap-4 pt-5 border-t" style={{ borderColor: 'var(--line)' }}>
                                <div>
                                    <div className="font-display italic text-[16px]" style={{ color: 'var(--text-primary)' }}>
                                        Rahul Krishnan
                                    </div>
                                    <div className="text-[10.5px] mt-1 tracking-[0.14em] uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                                        Lead Mentor
                                    </div>
                                </div>
                                <div>
                                    <div className="font-display italic text-[16px]" style={{ color: 'var(--text-primary)' }}>
                                        Priya Verma
                                    </div>
                                    <div className="text-[10.5px] mt-1 tracking-[0.14em] uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                                        Hiring Partner
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-1.5 mb-1 text-[10.5px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                                        <ScanLine size={11} /> ID: ALB-2025-AK7421
                                    </div>
                                    <div className="ml-auto w-16 h-16 rounded-md grid grid-cols-6 gap-[2px] p-1.5"
                                         style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                                        {Array.from({ length: 36 }).map((_, k) => (
                                            <span
                                                key={k}
                                                className="rounded-[1px]"
                                                style={{
                                                    background: Math.random() > 0.45 ? 'var(--text-primary)' : 'transparent'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right column — value props */}
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { v: '12,000+', l: 'Issued certificates', sub: 'And every one verifiable online' },
                            { v: '180+', l: 'Hiring partners', sub: 'Recognise and accept our credentials' },
                            { v: '4.8 / 5', l: 'Mentor signing satisfaction', sub: 'Across the 2025 cohorts' }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-30px' }}
                                transition={{ duration: 0.45, delay: i * 0.07 }}
                                className="rounded-3xl p-6"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <div
                                    className="font-display text-[36px] leading-none font-semibold tracking-[-0.02em]"
                                    style={{ color: 'var(--brand)' }}>
                                    {s.v}
                                </div>
                                <div className="text-[13.5px] font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
                                    {s.l}
                                </div>
                                <div className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                    {s.sub}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Certified-by carousel (IBM, Microsoft, AWS, Google) ── */}
                <CertifiedByCarousel />

                {/* Three-up cert types */}
                <div className="grid md:grid-cols-3 gap-5">
                    {certs.map((c, i) => {
                        const Icon = c.Icon
                        return (
                            <motion.div
                                key={c.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="group relative rounded-2xl p-4 md:p-6 overflow-hidden transition-all hover:-translate-y-1"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 top-0 h-1"
                                    style={{ background: c.accent }}
                                />
                                <div
                                    className="w-12 h-12 rounded-xl inline-flex items-center justify-center mb-5"
                                    style={{ background: c.accent, color: '#fff' }}>
                                    <Icon size={20} />
                                </div>
                                <h3
                                    className="font-display text-[20px] font-semibold leading-tight mb-1.5"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {c.title}
                                </h3>
                                <div
                                    className="text-[11.5px] tracking-[0.14em] uppercase font-semibold mb-3"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    {c.issuer}
                                </div>
                                <p
                                    className="text-[13.5px] leading-relaxed"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    {c.desc}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Certified-by carousel — slides between IBM / Microsoft / AWS / Google
// credentials with auto-cycling, prev/next, and dot pagination.
// ─────────────────────────────────────────────────────────────────────────────

function CertifiedByCarousel() {
    const trackRef = useRef<HTMLDivElement | null>(null)
    const [active, setActive] = useState(0)
    const [paused, setPaused] = useState(false)

    const scrollTo = (i: number) => {
        const el = trackRef.current
        if (!el) return
        const node = el.children[i] as HTMLElement | undefined
        if (!node) return
        const target = node.offsetLeft - (el.clientWidth - node.offsetWidth) / 2
        const max = el.scrollWidth - el.clientWidth
        el.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: 'smooth' })
        setActive(i)
    }
    const next = () => scrollTo((active + 1) % credentials.length)
    const prev = () => scrollTo((active - 1 + credentials.length) % credentials.length)

    // Auto-cycle every 4.5s when not paused
    useEffect(() => {
        if (paused) return
        const t = window.setInterval(() => {
            scrollTo((active + 1) % credentials.length)
        }, 4500)
        return () => window.clearInterval(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, paused])

    // Sync active when user drags/swipes
    useEffect(() => {
        const el = trackRef.current
        if (!el) return
        let frame = 0
        const onScroll = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => {
                const center = el.scrollLeft + el.clientWidth / 2
                const items = Array.from(el.children) as HTMLElement[]
                let best = 0
                let bestDist = Infinity
                items.forEach((it, i) => {
                    const c = it.offsetLeft + it.offsetWidth / 2
                    const d = Math.abs(c - center)
                    if (d < bestDist) {
                        best = i
                        bestDist = d
                    }
                })
                setActive(best)
            })
        }
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div
            className="my-12 rounded-3xl p-6 md:p-8 relative overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--line)'
            }}>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2 text-[10.5px] font-semibold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <BadgeCheck size={11} /> Certified by
                    </div>
                    <h3
                        className="font-display text-[24px] md:text-[28px] font-semibold leading-tight"
                        style={{ color: 'var(--text-primary)' }}>
                        Industry-recognised credentials.
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prev}
                        aria-label="Previous credential"
                        className="w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            color: 'var(--text-primary)'
                        }}>
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={next}
                        aria-label="Next credential"
                        className="w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors"
                        style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div
                ref={trackRef}
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollPaddingLeft: 12, scrollPaddingRight: 12 }}>
                {credentials.map((c, i) => (
                    <motion.article
                        key={c.issuer + i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                        className="snap-start flex-shrink-0 w-[250px] md:w-[360px] rounded-2xl p-5 md:p-6 transition-all"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid',
                            borderColor: i === active ? c.color : 'var(--line)',
                            boxShadow: i === active ? 'var(--card-shadow-hover)' : 'var(--card-shadow)'
                        }}>
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl"
                                style={{
                                    background: 'var(--page-bg-soft)',
                                    border: '1px solid var(--line)'
                                }}>
                                <img
                                    src={`https://cdn.simpleicons.org/${c.slug}/${c.color.replace('#', '')}`}
                                    alt={c.issuer}
                                    width={22}
                                    height={22}
                                    loading="lazy"
                                    onError={(e) => {
                                        const img = e.currentTarget
                                        const fallback = document.createElement('span')
                                        fallback.textContent = c.issuer.charAt(0)
                                        fallback.className = 'inline-flex items-center justify-center w-[22px] h-[22px] rounded-md text-[12px] font-bold text-white'
                                        fallback.setAttribute('style', `background:${c.color}`)
                                        img.replaceWith(fallback)
                                    }}
                                />
                                <span
                                    className="font-display text-[14.5px] font-semibold"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {c.issuer}
                                </span>
                            </div>
                            <span
                                className="px-2 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] uppercase"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                Pathway
                            </span>
                        </div>

                        <h4
                            className="font-display text-[18px] md:text-[19px] font-semibold leading-tight mb-1.5"
                            style={{ color: 'var(--text-primary)' }}>
                            {c.title}
                        </h4>
                        <div
                            className="text-[12px] mb-4"
                            style={{ color: 'var(--brand)' }}>
                            {c.audience}
                        </div>

                        <ul className="space-y-2">
                            {c.bullets.map((b, j) => (
                                <li key={j} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                                    <span
                                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ background: c.color }}
                                    />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </motion.article>
                ))}
            </div>

            {/* Dots */}
            <AnimatePresence>
                <div className="flex items-center justify-center gap-1.5 mt-5">
                    {credentials.map((_, i) => (
                        <button
                            key={i}
                            aria-label={`Go to credential ${i + 1}`}
                            onClick={() => scrollTo(i)}
                            className="rounded-full transition-all"
                            style={{
                                width: i === active ? 22 : 6,
                                height: 6,
                                background: i === active ? 'var(--brand)' : 'var(--line-strong)'
                            }}
                        />
                    ))}
                </div>
            </AnimatePresence>
        </div>
    )
}
