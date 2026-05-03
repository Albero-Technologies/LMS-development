import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Clock, Calendar, ChevronRight, Building2, MapPin, TrendingUp, Users } from 'lucide-react'
import { findCaseStudy, listCaseStudies } from '@/constants/case-study-content'

export default function CaseStudyDetail() {
    const { slug = '' } = useParams<{ slug?: string }>()
    const location = useLocation()
    const study = findCaseStudy(slug)
    const all = listCaseStudies()
    const [activeSection, setActiveSection] = useState<string>('')

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, [location.pathname])

    useEffect(() => {
        if (!study || study.toc.length === 0) return
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id)
                })
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        )
        study.toc.forEach((t) => {
            const el = document.getElementById(t.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [slug, study])

    if (!study) return <Navigate to="/resources/case-studies" replace />

    const related = all.filter((c) => c.slug !== study.slug && c.sector === study.sector).slice(0, 3)
    const initials = study.author.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* ── Hero ── */}
            <section className="relative pt-[140px] pb-10 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    <nav
                        className="flex items-center gap-2 text-[12.5px] mb-7 flex-wrap"
                        style={{ color: 'var(--text-tertiary)' }}>
                        <Link to="/resources/case-studies" className="hover:underline">
                            Case Studies
                        </Link>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--brand)' }}>{study.sector}</span>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--text-primary)' }}>{study.brand}</span>
                    </nav>

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center gap-2 mb-5 flex-wrap">
                            {study.badge && (
                                <span
                                    className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md"
                                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                    ✦ {study.badge}
                                </span>
                            )}
                            <span
                                className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                {study.sector}
                            </span>
                        </div>

                        <h1
                            className="font-display text-[36px] md:text-[52px] lg:text-[60px] font-medium tracking-[-0.02em] leading-[1.02] mb-5 max-w-[920px]"
                            style={{ color: 'var(--text-primary)' }}>
                            {study.title}
                        </h1>
                        <p
                            className="text-[16px] md:text-[18px] leading-relaxed mb-8 max-w-[820px]"
                            style={{ color: 'var(--text-secondary)' }}>
                            {study.description}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-4 pb-7 border-b" style={{ borderColor: 'var(--line)' }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full inline-flex items-center justify-center font-semibold text-[12px]"
                                    style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                    {initials}
                                </div>
                                <div className="leading-tight">
                                    <div className="text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {study.author.name}
                                    </div>
                                    <div className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
                                        {study.author.role}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-x-5 gap-y-2 flex-wrap text-[12.5px]"
                                style={{ color: 'var(--text-tertiary)' }}>
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar size={12} /> {study.date}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock size={12} /> {study.readMin} min read
                                </span>
                                <div className="inline-flex flex-wrap gap-1.5">
                                    {study.tags.map((t, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 rounded-md"
                                            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--line)' }}>
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Brand cover + key facts */}
            <section className="px-5 md:px-8 mb-12">
                <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1fr_320px] gap-6">
                    {/* Brand cover */}
                    <div
                        className="aspect-[16/8] rounded-3xl flex items-end justify-center relative overflow-hidden"
                        style={{ background: study.coverGradient, boxShadow: 'var(--card-shadow-hover)' }}>
                        <div
                            className="absolute inset-0 pointer-events-none opacity-15"
                            style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0, transparent 50%)' }}
                        />
                        <span
                            className="font-display font-semibold text-white tracking-[-0.02em]"
                            style={{ fontSize: 'clamp(48px, 9vw, 110px)' }}>
                            {study.brand}
                        </span>
                    </div>

                    {/* Brand fact card */}
                    <div
                        className="rounded-3xl p-6"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                        <div
                            className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-4"
                            style={{ color: 'var(--text-tertiary)' }}>
                            Brand snapshot
                        </div>
                        <div className="space-y-3">
                            <FactRow icon={Building2} label="Sector" value={study.sector} />
                            <FactRow icon={Calendar} label="Founded" value={study.founded} />
                            <FactRow icon={MapPin} label="HQ" value={study.headquarters} />
                            {study.revenue && <FactRow icon={TrendingUp} label="Revenue" value={study.revenue} />}
                            {study.employees && <FactRow icon={Users} label="Employees" value={study.employees} />}
                        </div>
                    </div>
                </div>
            </section>

            {/* Key facts strip */}
            <section className="px-5 md:px-8 mb-14">
                <div className="max-w-[1180px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {study.keyFacts.map((kf, i) => (
                            <div
                                key={i}
                                className="rounded-2xl p-5"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                <div
                                    className="font-display text-[26px] md:text-[30px] leading-none font-semibold tracking-[-0.02em]"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {kf.value}
                                </div>
                                <div
                                    className="text-[11px] tracking-[0.16em] uppercase font-semibold mt-2.5"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    {kf.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Body + sidebar */}
            <section className="relative px-5 md:px-8 pb-20">
                <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1fr_240px] gap-12">
                    <article className="min-w-0">{study.content}</article>
                    {study.toc.length > 0 && (
                        <aside className="hidden lg:block">
                            <div
                                className="sticky top-32 rounded-xl p-5"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                <div
                                    className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-3"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    Sections
                                </div>
                                <ul className="space-y-1.5">
                                    {study.toc.map((t, i) => (
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
                                More from {study.sector}
                            </h2>
                            <Link
                                to="/resources/case-studies"
                                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                All case studies <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {related.map((c) => (
                                <Link
                                    key={c.slug}
                                    to={`/resources/case-studies/${c.slug}`}
                                    className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                    <div
                                        className="aspect-[16/9] flex items-center justify-center relative"
                                        style={{ background: c.coverGradient }}>
                                        <span className="font-display text-[28px] md:text-[34px] font-semibold text-white tracking-[-0.02em]">
                                            {c.brand}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <div
                                            className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2"
                                            style={{ color: 'var(--brand)' }}>
                                            {c.sector}
                                        </div>
                                        <h3
                                            className="font-display text-[17px] font-semibold leading-tight mb-2 line-clamp-2"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {c.title}
                                        </h3>
                                        <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                            {c.date} · {c.readMin} min read
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Link
                                to="/resources/case-studies"
                                className="inline-flex items-center gap-2 text-[14px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                <ArrowLeft size={14} /> Back to all case studies
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

function FactRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 text-[13.5px]">
            <span className="inline-flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                <Icon size={13} style={{ color: 'var(--brand)' }} />
                {label}
            </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {value}
            </span>
        </div>
    )
}
