import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Clock, ChevronRight, PlayCircle, GraduationCap, Users, CheckCircle2 } from 'lucide-react'
import { findSession, listSessions } from '@/constants/soft-skill-content'

export default function SoftSkillSessionPage() {
    const { slug = '' } = useParams<{ slug?: string }>()
    const location = useLocation()
    const session = findSession(slug)
    const all = listSessions()
    const [activeSection, setActiveSection] = useState<string>('')

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, [location.pathname])

    useEffect(() => {
        if (!session || session.toc.length === 0) return
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id)
                })
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        )
        session.toc.forEach((t) => {
            const el = document.getElementById(t.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [slug, session])

    if (!session) return <Navigate to="/resources/soft-skills" replace />

    const Icon = session.Icon
    const related = all.filter((s) => s.slug !== session.slug).slice(0, 3)

    return (
        <div
            className="min-h-screen relative"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Hero */}
            <section className="relative pt-[140px] pb-10 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    <nav className="flex items-center gap-2 text-[12.5px] mb-7 flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
                        <Link to="/resources/soft-skills" className="hover:underline">
                            Soft Skills
                        </Link>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--text-primary)' }}>{session.title}</span>
                    </nav>

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center gap-2 mb-5 flex-wrap">
                            <span
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <Icon size={12} /> Soft Skills · {session.level}
                            </span>
                            <span
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md"
                                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                Free
                            </span>
                        </div>

                        <h1
                            className="font-display text-[36px] md:text-[52px] lg:text-[64px] font-medium tracking-[-0.02em] leading-[0.98] mb-4 max-w-[860px]"
                            style={{ color: 'var(--text-primary)' }}>
                            {session.title}
                        </h1>
                        <p
                            className="text-[17px] md:text-[19px] italic font-display font-light leading-snug mb-5 max-w-[760px]"
                            style={{ color: 'var(--brand)' }}>
                            {session.tagline}
                        </p>
                        <p className="text-[16px] leading-relaxed max-w-[760px] mb-8" style={{ color: 'var(--text-secondary)' }}>
                            {session.description}
                        </p>

                        <div
                            className="flex items-center flex-wrap gap-x-6 gap-y-2 pb-7 border-b text-[12.5px]"
                            style={{ borderColor: 'var(--line)', color: 'var(--text-tertiary)' }}>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={12} /> {session.duration}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <GraduationCap size={12} /> {session.level}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Users size={12} /> {session.audience.join(' · ')}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Video tile + key outcomes */}
            <section className="px-5 md:px-8 mb-12">
                <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1.5fr_1fr] gap-6">
                    {/* Video tile */}
                    <button
                        className="group relative aspect-video rounded-3xl overflow-hidden flex items-center justify-center"
                        style={{ background: session.coverGradient, boxShadow: 'var(--card-shadow-hover)' }}>
                        <div
                            className="absolute inset-0 pointer-events-none opacity-15"
                            style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0, transparent 50%)' }}
                        />
                        <span
                            className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase"
                            style={{ background: '#fff', color: '#000' }}>
                            Free
                        </span>
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xl">
                            <PlayCircle size={40} style={{ color: '#0a0e1f' }} />
                        </div>
                        <div
                            className="absolute bottom-5 left-5 right-5 font-display text-[28px] md:text-[40px] font-extrabold tracking-tight text-center italic"
                            style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                            {session.title}
                        </div>
                    </button>

                    {/* Outcomes card */}
                    <div
                        className="rounded-3xl p-6 md:p-7"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                        <div
                            className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-4"
                            style={{ color: 'var(--brand)' }}>
                            What you'll learn
                        </div>
                        <ul className="space-y-3">
                            {session.keyOutcomes.map((o, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 text-[14.5px] leading-snug"
                                    style={{ color: 'var(--text-primary)' }}>
                                    <CheckCircle2
                                        size={16}
                                        className="flex-shrink-0 mt-0.5"
                                        style={{ color: 'var(--brand)' }}
                                    />
                                    <span>{o}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Body + sidebar */}
            <section className="relative px-5 md:px-8 pb-20">
                <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1fr_240px] gap-12">
                    <article className="min-w-0">{session.content}</article>

                    {session.toc.length > 0 && (
                        <aside className="hidden lg:block">
                            <div
                                className="sticky top-32 rounded-xl p-5"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                <div
                                    className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-3"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    On this page
                                </div>
                                <ul className="space-y-1.5">
                                    {session.toc.map((t, i) => (
                                        <li key={i}>
                                            <a
                                                href={`#${t.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    const el = document.getElementById(t.id)
                                                    if (el) {
                                                        const y = el.getBoundingClientRect().top + window.pageYOffset - 100
                                                        window.scrollTo({ top: y, behavior: 'smooth' })
                                                    }
                                                }}
                                                className="block py-1 text-[13px] transition-colors"
                                                style={{
                                                    color: activeSection === t.id ? 'var(--brand)' : 'var(--text-secondary)',
                                                    borderLeft: `2px solid ${activeSection === t.id ? 'var(--brand)' : 'transparent'}`,
                                                    paddingLeft: '0.6rem'
                                                }}>
                                                {t.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    )}
                </div>
            </section>

            {/* Related */}
            {related.length > 0 && (
                <section className="px-5 md:px-8 pb-24" style={{ background: 'var(--page-bg-soft)' }}>
                    <div className="max-w-[1180px] mx-auto pt-16">
                        <div className="flex items-end justify-between mb-8">
                            <h2
                                className="font-display text-[28px] md:text-[36px] font-medium tracking-[-0.02em]"
                                style={{ color: 'var(--text-primary)' }}>
                                More soft-skill sessions
                            </h2>
                            <Link
                                to="/resources/soft-skills"
                                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                All sessions <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {related.map((s) => {
                                const RelIcon = s.Icon
                                return (
                                    <Link
                                        key={s.slug}
                                        to={`/resources/soft-skills/${s.slug}`}
                                        className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                        <div
                                            className="aspect-video flex items-center justify-center relative"
                                            style={{ background: s.coverGradient }}>
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                                <PlayCircle size={22} style={{ color: '#0a0e1f' }} />
                                            </div>
                                            <RelIcon
                                                size={36}
                                                className="absolute top-4 right-4 text-white/30"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3
                                                className="font-display text-[17px] font-semibold leading-tight mb-2"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {s.title}
                                            </h3>
                                            <p
                                                className="text-[13px] leading-relaxed mb-3 line-clamp-2"
                                                style={{ color: 'var(--text-secondary)' }}>
                                                {s.tagline}
                                            </p>
                                            <div className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
                                                {s.duration} · {s.level}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="mt-12 text-center">
                            <Link
                                to="/resources/soft-skills"
                                className="inline-flex items-center gap-2 text-[14px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                <ArrowLeft size={14} /> Back to all soft skills
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
