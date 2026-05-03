import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, ChevronRight, Plus, Code2, Database, BarChart3, FileSpreadsheet, Calculator, PieChart, Clock, Sparkles } from 'lucide-react'
import CodeBlock from '@/components/ui/code-block'
import { findGuide, listGuides } from '@/constants/interview-guide-content'

const iconMap = {
    python: Code2,
    sql: Database,
    powerbi: BarChart3,
    excel: FileSpreadsheet,
    statistics: Calculator,
    tableau: PieChart
} as const

const difficultyColor = {
    Easy: { bg: 'rgba(16,185,129,0.14)', fg: '#059669' },
    Medium: { bg: 'rgba(251,191,36,0.18)', fg: '#b45309' },
    Hard: { bg: 'rgba(244,63,94,0.16)', fg: '#be123c' }
}

export default function InterviewGuideDetail() {
    const { slug = '' } = useParams<{ slug?: string }>()
    const location = useLocation()
    const guide = findGuide(slug)
    const all = listGuides()
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
    const [filter, setFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all')

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, [location.pathname])

    if (!guide) return <Navigate to="/resources/interview-guides" replace />

    const Icon = iconMap[guide.iconKey]
    const related = all.filter((g) => g.slug !== guide.slug).slice(0, 4)

    const totalQ = guide.sections.reduce((acc, s) => acc + s.qas.length, 0)

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Hero */}
            <section className="relative pt-[140px] pb-12 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -left-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    <nav className="flex items-center gap-2 text-[12.5px] mb-7 flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
                        <Link to="/resources/interview-guides" className="hover:underline">
                            Interview Guides
                        </Link>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--text-primary)' }}>{guide.title}</span>
                    </nav>

                    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div className="flex flex-wrap items-center gap-2 mb-5">
                                <span
                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <Icon size={12} /> Interview Prep
                                </span>
                                {guide.badge && (
                                    <span
                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md"
                                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                        <Sparkles size={11} /> {guide.badge}
                                    </span>
                                )}
                            </div>

                            <h1
                                className="font-display text-[36px] md:text-[52px] lg:text-[60px] font-medium tracking-[-0.02em] leading-[0.98] mb-3 max-w-[720px]"
                                style={{ color: 'var(--text-primary)' }}>
                                {guide.title}
                            </h1>
                            <p className="font-display italic font-light text-[18px] md:text-[20px] mb-5" style={{ color: 'var(--brand)' }}>
                                {guide.tagline}
                            </p>
                            <p className="text-[15.5px] leading-relaxed max-w-[720px] mb-7" style={{ color: 'var(--text-secondary)' }}>
                                {guide.description}
                            </p>

                            <div
                                className="flex items-center flex-wrap gap-x-5 gap-y-2 text-[12.5px]"
                                style={{ color: 'var(--text-tertiary)' }}>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock size={12} /> {guide.readMin} min read
                                </span>
                                <span>·</span>
                                <span>{totalQ} questions</span>
                                <span>·</span>
                                <span>{guide.sections.length} sections</span>
                            </div>
                        </motion.div>

                        {/* Cover */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="rounded-3xl aspect-[5/3] relative overflow-hidden flex items-end justify-between p-7"
                            style={{ background: guide.accentGradient, color: '#fff', boxShadow: 'var(--card-shadow-hover)' }}>
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 pointer-events-none opacity-15"
                                style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0, transparent 50%)' }}
                            />
                            <div className="relative z-[1]">
                                <span
                                    className="font-display font-semibold tracking-[-0.02em] leading-[0.92] block"
                                    style={{ fontSize: 'clamp(40px, 6vw, 56px)' }}>
                                    {guide.title.replace('Fundamentals of ', '')}
                                </span>
                                <span
                                    className="font-display italic font-light text-white/85 block mt-1"
                                    style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
                                    interview prep
                                </span>
                            </div>
                            <Icon size={56} className="text-white/40 absolute top-6 right-6" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Section nav + difficulty filter */}
            <section className="px-5 md:px-8 mb-10">
                <div className="max-w-[1180px] mx-auto">
                    <div
                        className="rounded-2xl p-4 md:p-5 grid md:grid-cols-[1fr_auto] gap-4 items-center"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                        <div className="flex flex-wrap gap-2">
                            <span
                                className="text-[11px] tracking-[0.18em] uppercase font-semibold mr-2 self-center"
                                style={{ color: 'var(--text-tertiary)' }}>
                                Sections
                            </span>
                            {guide.sections.map((s, i) => (
                                <a
                                    key={i}
                                    href={`#section-${i}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        const el = document.getElementById(`section-${i}`)
                                        if (el) {
                                            const y = el.getBoundingClientRect().top + window.pageYOffset - 100
                                            window.scrollTo({ top: y, behavior: 'smooth' })
                                        }
                                    }}
                                    className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors"
                                    style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line)' }}>
                                    {s.title}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                            <span
                                className="text-[11px] tracking-[0.18em] uppercase font-semibold"
                                style={{ color: 'var(--text-tertiary)' }}>
                                Filter
                            </span>
                            {(['all', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setFilter(d)}
                                    className="px-2.5 py-1 rounded-full text-[12px] font-semibold transition-colors"
                                    style={{
                                        background:
                                            filter === d
                                                ? d === 'all'
                                                    ? 'var(--brand)'
                                                    : difficultyColor[d].bg
                                                : 'transparent',
                                        color:
                                            filter === d
                                                ? d === 'all'
                                                    ? 'var(--text-on-inverse)'
                                                    : difficultyColor[d].fg
                                                : 'var(--text-secondary)',
                                        border: `1px solid ${
                                            filter === d
                                                ? d === 'all'
                                                    ? 'var(--brand)'
                                                    : difficultyColor[d].fg
                                                : 'var(--line)'
                                        }`
                                    }}>
                                    {d === 'all' ? 'All' : d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Q&A sections */}
            <section className="px-5 md:px-8 pb-16">
                <div className="max-w-[1180px] mx-auto">
                    {guide.sections.map((sec, sectionIdx) => {
                        const visible = sec.qas.filter((qa) => filter === 'all' || qa.difficulty === filter)
                        if (visible.length === 0) return null
                        return (
                            <div key={sectionIdx} id={`section-${sectionIdx}`} className="mb-14 scroll-mt-32">
                                <div className="flex items-baseline gap-4 mb-6">
                                    <span className="font-display text-[20px] md:text-[24px] font-light italic" style={{ color: 'var(--brand)' }}>
                                        {String(sectionIdx + 1).padStart(2, '0')}.
                                    </span>
                                    <h2
                                        className="font-display text-[26px] md:text-[32px] font-semibold tracking-[-0.01em]"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {sec.title}
                                    </h2>
                                    <span
                                        className="ml-auto text-[12px]"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        {visible.length} {visible.length === 1 ? 'question' : 'questions'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {visible.map((qa, qaIdx) => {
                                        const key = `${sectionIdx}-${qaIdx}`
                                        const open = !!openMap[key]
                                        const dc = difficultyColor[qa.difficulty]
                                        return (
                                            <motion.div
                                                key={key}
                                                initial={{ opacity: 0, y: 8 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: Math.min(qaIdx * 0.03, 0.2) }}
                                                className="rounded-2xl overflow-hidden"
                                                style={{
                                                    background: 'var(--surface)',
                                                    border: `1px solid ${open ? 'var(--brand)' : 'var(--line)'}`,
                                                    boxShadow: open ? 'var(--card-shadow)' : 'none'
                                                }}>
                                                <button
                                                    onClick={() => setOpenMap((m) => ({ ...m, [key]: !m[key] }))}
                                                    className="w-full flex items-start justify-between gap-4 p-5 text-left">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <span
                                                            className="font-mono text-[12px] font-semibold flex-shrink-0 mt-1"
                                                            style={{ color: 'var(--text-tertiary)' }}>
                                                            Q{String(qaIdx + 1).padStart(2, '0')}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                                <span
                                                                    className="text-[10.5px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-md"
                                                                    style={{ background: dc.bg, color: dc.fg }}>
                                                                    {qa.difficulty}
                                                                </span>
                                                                {qa.tags &&
                                                                    qa.tags.map((t, j) => (
                                                                        <span
                                                                            key={j}
                                                                            className="text-[10.5px] px-2 py-0.5 rounded-md"
                                                                            style={{
                                                                                background: 'var(--surface-2)',
                                                                                color: 'var(--text-tertiary)',
                                                                                border: '1px solid var(--line)'
                                                                            }}>
                                                                            {t}
                                                                        </span>
                                                                    ))}
                                                            </div>
                                                            <span
                                                                className="font-display text-[17px] md:text-[18px] font-semibold leading-snug"
                                                                style={{ color: 'var(--text-primary)' }}>
                                                                {qa.q}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full transition-transform mt-1"
                                                        style={{
                                                            background: open ? 'var(--brand)' : 'var(--surface-2)',
                                                            color: open ? 'var(--text-on-inverse)' : 'var(--text-primary)',
                                                            transform: open ? 'rotate(45deg)' : 'rotate(0deg)'
                                                        }}>
                                                        <Plus size={16} />
                                                    </span>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {open && (
                                                        <motion.div
                                                            key="content"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                                            className="overflow-hidden">
                                                            <div className="px-5 pb-5">
                                                                <p
                                                                    className="text-[14.5px] leading-relaxed mb-2"
                                                                    style={{ color: 'var(--text-secondary)' }}>
                                                                    {qa.a}
                                                                </p>
                                                                {qa.code && (
                                                                    <CodeBlock
                                                                        code={qa.code}
                                                                        language={qa.language || 'text'}
                                                                        showLines={false}
                                                                    />
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
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
                                More interview guides
                            </h2>
                            <Link
                                to="/resources/interview-guides"
                                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                All guides <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {related.map((g) => {
                                const RelIcon = iconMap[g.iconKey]
                                return (
                                    <Link
                                        key={g.slug}
                                        to={`/resources/interview-guides/${g.slug}`}
                                        className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                        <div
                                            className="aspect-[5/3] flex items-end justify-between p-5"
                                            style={{ background: g.accentGradient, color: '#fff' }}>
                                            <span className="font-display font-semibold text-[18px] tracking-tight">
                                                {g.title.replace('Fundamentals of ', '')}
                                            </span>
                                            <RelIcon size={28} className="text-white/40" />
                                        </div>
                                        <div className="p-5">
                                            <h3
                                                className="font-display text-[16px] font-semibold leading-tight mb-2 line-clamp-2"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {g.title}
                                            </h3>
                                            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                                                {g.questionCount} questions · {g.readMin} min
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="mt-12 text-center">
                            <Link
                                to="/resources/interview-guides"
                                className="inline-flex items-center gap-2 text-[14px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                <ArrowLeft size={14} /> Back to all interview guides
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
