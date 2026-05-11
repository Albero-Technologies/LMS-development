import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Linkedin, Star, Calendar, Briefcase } from 'lucide-react'
import { useTilt } from '@/hooks/useInteractive'

type Mentor = {
    name: string
    role: string
    company: string
    initials: string
    tint: string
    badge: string
    rating: string
    experience: string
    bio: string
    skills: string[]
    image?: string
}

const mentors: Mentor[] = [
    {
        name: 'Heena Arora',
        role: 'Associate Data Scientist',
        company: 'PwC (ex-Amazon)',
        initials: 'HA',
        tint: 'oklch(0.65 0.22 30)',
        badge: 'PwC (ex-Amazon)',
        rating: '4.9',
        experience: '3+ years',
        bio: 'Builds production data-science systems at PwC, formerly at Amazon. Mentors AI/ML and Data Science cohorts.',
        skills: ['Data Science', 'Image Analytics', 'Python', 'SQL']
        // image: '/mentors/heena-arora.jpg'  // ← uncomment and set path when photo is available
    },
    {
        name: 'Anand Tripathi',
        role: 'Data Analyst',
        company: 'Google',
        initials: 'AT',
        tint: 'oklch(0.6 0.2 250)',
        badge: 'Google',
        rating: '4.9',
        experience: '1+ year',
        bio: 'Drives product analytics at Google. Reviews capstones for the Data Analytics cohort and runs SQL deep-dives.',
        skills: ['Data Analytics', 'Big Data', 'Product Analytics']
        // image: '/mentors/anand-tripathi.jpg'
    },
    {
        name: 'Shubham Verma',
        role: 'Senior Data Scientist',
        company: 'Cognizant',
        initials: 'SV',
        tint: 'oklch(0.7 0.15 200)',
        badge: 'Cognizant',
        rating: '4.9',
        experience: '3+ years',
        bio: 'Specialises in machine learning systems and MLOps. Mentors AI/ML cohort and runs production ML reviews.',
        skills: ['Python', 'Machine Learning', 'SQL']
        // image: '/mentors/shubham-verma.jpg'
    },
    {
        name: 'Akshat Khandelwal',
        role: 'Senior Finance BI Developer',
        company: 'Autodesk',
        initials: 'AK',
        tint: 'oklch(0.62 0.2 280)',
        badge: 'Autodesk',
        rating: '4.8',
        experience: '3+ years',
        bio: 'Designs finance BI systems at Autodesk. Mentors Business Analytics cohort with a strong storytelling lens.',
        skills: ['Power BI', 'Python', 'SQL']
        // image: '/mentors/akshat-khandelwal.jpg'
    },
    {
        name: 'Aanya Sharma',
        role: 'Senior Data Scientist',
        company: 'Microsoft',
        initials: 'AS',
        tint: 'oklch(0.623 0.214 259.815)',
        badge: 'Microsoft',
        rating: '4.9',
        experience: '8 years',
        bio: '8 years building recommender systems and large-scale personalisation. Mentors AI/ML cohort.',
        skills: ['Recommender Systems', 'PyTorch', 'Python']
        // image: '/mentors/aanya-sharma.jpg'
    },
    {
        name: 'Rahul Krishnan',
        role: 'Engineering Manager',
        company: 'Razorpay',
        initials: 'RK',
        tint: 'oklch(0.696 0.17 162)',
        badge: 'Razorpay',
        rating: '5.0',
        experience: '10 years',
        bio: 'Hires Full-Stack engineers at Razorpay. Reviews capstone projects and runs system-design rounds.',
        skills: ['React', 'Node', 'System Design']
        // image: '/mentors/rahul-krishnan.jpg'
    },
    {
        name: 'Priya Verma',
        role: 'Lead Analyst',
        company: 'Deloitte Consulting',
        initials: 'PV',
        tint: 'oklch(0.795 0.184 86.047)',
        badge: 'Deloitte',
        rating: '4.9',
        experience: '6 years',
        bio: 'Mentors Business Analytics cohort. Trains for IB & consulting interviews with case-frameworks.',
        skills: ['SQL', 'Power BI', 'Case Frameworks']
        // image: '/mentors/priya-verma.jpg'
    },
    {
        name: 'Neeraj Bhatt',
        role: 'Staff ML Engineer',
        company: 'Walmart Labs',
        initials: 'NB',
        tint: 'oklch(0.627 0.265 303.9)',
        badge: 'Walmart Labs',
        rating: '4.9',
        experience: '9 years',
        bio: 'Specialises in MLOps and production ML systems. Capstone reviewer for the AI/ML flagship.',
        skills: ['MLOps', 'Kubernetes', 'AWS']
        // image: '/mentors/neeraj-bhatt.jpg'
    }
]

export default function Mentors() {
    const trackRef = useRef<HTMLDivElement | null>(null)
    const [active, setActive] = useState(0)
    const [cardWidth, setCardWidth] = useState(0)

    // Measure track visible width so each card = exactly 1/4
    useEffect(() => {
        const el = trackRef.current
        if (!el) return
        const measure = () => setCardWidth((el.clientWidth - 3 * 20) / 4)
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Scroll the container directly (not via scrollIntoView, which scrolls the page).
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
    const next = () => scrollTo(Math.min(active + 1, mentors.length - 1))
    const prev = () => scrollTo(Math.max(active - 1, 0))

    // Track scroll → keep `active` in sync
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
        <section
            className="relative py-24 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <div
                aria-hidden="true"
                className="absolute -top-32 right-[-15%] w-[640px] h-[640px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />

            <div className="max-w-[1320px] mx-auto relative z-[1] px-5 md:px-8">
                <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-end mb-12">
                    <div>
                        <div
                            className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
                            style={{ color: 'var(--brand)' }}>
                            Industry mentors
                        </div>
                        <h2
                            className="font-display text-[40px] md:text-[58px] leading-[0.96] tracking-[-0.02em] font-medium"
                            style={{ color: 'var(--text-primary)' }}>
                            Meet your{' '}
                            <span
                                className="italic font-light"
                                style={{ color: 'var(--brand)' }}>
                                mentors.
                            </span>
                        </h2>
                    </div>
                    <div className="flex md:flex-row md:items-end md:justify-end gap-4">
                        <p
                            className="text-[15.5px] leading-relaxed max-w-[480px]"
                            style={{ color: 'var(--text-secondary)' }}>
                            Industry veterans from top companies who share real-world experience and practical insights that textbooks can't teach.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={prev}
                                aria-label="Previous mentor"
                                className="w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors"
                                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}>
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={next}
                                aria-label="Next mentor"
                                className="w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors"
                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carousel inside the same constrained wrapper — overflow clipped cleanly */}
            <div className="max-w-[1320px] mx-auto relative z-[1] px-5 md:px-8">
                <div
                    ref={trackRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {mentors.map((m, i) => (
                        <MentorCard
                            key={m.name}
                            m={m}
                            i={i}
                            active={active}
                            cardWidth={cardWidth}
                        />
                    ))}
                </div>

                {/* Dots */}
                <AnimatePresence>
                    <div className="flex items-center justify-center gap-1.5 mt-6">
                        {mentors.map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Go to mentor ${i + 1}`}
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
        </section>
    )
}

// ─── MentorCard — extracted so each instance can own its own tilt ref ─────────
function MentorCard({ m, i, active, cardWidth }: { m: Mentor; i: number; active: number; cardWidth: number }) {
    const tiltRef = useTilt<HTMLDivElement>({ max: 5, glareSelector: '[data-glare]' })
    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.05 }}
            className="snap-start flex-shrink-0 flex flex-col"
            style={{
                width: cardWidth > 0 ? cardWidth : undefined,
                minWidth: cardWidth > 0 ? cardWidth : undefined,
                transform: i === active ? 'scale(1.0)' : 'scale(0.97)'
            }}>
            <div
                ref={tiltRef}
                className="relative rounded-3xl overflow-hidden transition-all flex flex-col h-full"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    boxShadow: i === active ? 'var(--card-shadow-hover)' : 'var(--card-shadow)'
                }}>
                {/* Glare layer driven by useTilt */}
                <div
                    aria-hidden="true"
                    data-glare
                    className="absolute inset-0 pointer-events-none z-[3] mix-blend-overlay"
                />
                {/* Photo block — shows real photo if `m.image` is set, falls back to initials avatar */}
                <div
                    className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
                    style={{ background: m.tint }}>
                    {m.image ? (
                        <img
                            src={m.image}
                            alt={m.name}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                    ) : (
                        <>
                            {/* Subtle dot pattern */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 opacity-30"
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                                    backgroundSize: '14px 14px'
                                }}
                            />
                            <span
                                className="font-display text-[88px] font-semibold leading-none italic"
                                style={{ color: 'rgba(255,255,255,0.95)' }}>
                                {m.initials}
                            </span>
                        </>
                    )}
                    <span
                        className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-tight z-[2]"
                        style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(6px)' }}>
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: '#34d399' }}
                        />
                        {m.badge}
                    </span>
                    <span
                        className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10.5px] font-bold z-[2]"
                        style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--accent)' }}>
                        <Star
                            size={11}
                            fill="currentColor"
                        />{' '}
                        {m.rating}
                    </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                    <h3
                        className="font-display text-[19px] font-semibold leading-tight mb-1"
                        style={{ color: 'var(--text-primary)' }}>
                        {m.name}
                    </h3>
                    <div
                        className="text-[12.5px] mb-3"
                        style={{ color: 'var(--brand)' }}>
                        {m.role} · {m.company}
                    </div>

                    <div
                        className="flex items-center gap-3 text-[11.5px] mb-4"
                        style={{ color: 'var(--text-tertiary)' }}>
                        <span className="inline-flex items-center gap-1">
                            <Briefcase size={11} /> {m.experience}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={11} /> Mentoring
                        </span>
                    </div>

                    <p
                        className="text-[13px] leading-relaxed mb-4"
                        style={{ color: 'var(--text-secondary)' }}>
                        {m.bio}
                    </p>

                    {/* Skills push the CTA row to the bottom via flex-1 on this wrapper */}
                    <div className="flex-1 flex flex-col justify-end">
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {m.skills.map((s, j) => (
                                <span
                                    key={j}
                                    className="px-2 py-0.5 rounded-full text-[10.5px]"
                                    style={{
                                        background: 'var(--surface-2)',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--line)'
                                    }}>
                                    {s}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold transition-colors"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)'
                                }}>
                                Book session
                            </button>
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center gap-1.5 text-[12px] font-semibold opacity-70 hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--text-primary)' }}>
                                <Linkedin size={13} /> Profile
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    )
}
