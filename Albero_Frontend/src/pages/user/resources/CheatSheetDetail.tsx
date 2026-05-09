import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import {
    ArrowLeft,
    ArrowRight,
    ChevronRight,
    Code2,
    Database,
    BarChart3,
    FileSpreadsheet,
    Calculator,
    PieChart,
    Brain,
    Sparkles,
    Download,
    FileText
} from 'lucide-react'
import CodeBlock from '@/components/ui/code-block'
import { findSheet, listSheets } from '@/constants/cheatsheet-content'

const iconMap = {
    python: Code2,
    sql: Database,
    powerbi: BarChart3,
    excel: FileSpreadsheet,
    statistics: Calculator,
    tableau: PieChart,
    ml: Brain,
    genai: Sparkles
} as const

export default function CheatSheetDetail() {
    const { slug = '' } = useParams<{ slug?: string }>()
    const location = useLocation()
    const sheet = findSheet(slug)
    const all = listSheets()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, [location.pathname])

    if (!sheet)
        return (
            <Navigate
                to="/resources/cheatsheet"
                replace
            />
        )

    const Icon = iconMap[sheet.iconKey]
    const related = all.filter((s) => s.slug !== sheet.slug).slice(0, 4)

    return (
        <div
            className="min-h-screen relative"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Hero */}
            <section className="relative pt-[140px] pb-12 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    <nav
                        className="flex items-center gap-2 text-[12.5px] mb-7 flex-wrap"
                        style={{ color: 'var(--text-tertiary)' }}>
                        <Link
                            to="/resources/cheatsheet"
                            className="hover:underline">
                            CheatSheets
                        </Link>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--text-primary)' }}>{sheet.title}</span>
                    </nav>

                    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}>
                            <div
                                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md mb-5"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <Icon size={12} /> Quick reference · {sheet.pages} {sheet.pages > 1 ? 'pages' : 'page'}
                            </div>

                            <h1
                                className="font-display text-[36px] md:text-[52px] lg:text-[64px] font-medium tracking-[-0.02em] leading-[0.98] mb-3 max-w-[620px]"
                                style={{ color: 'var(--text-primary)' }}>
                                {sheet.title}
                            </h1>
                            <p
                                className="font-display italic font-light text-[18px] md:text-[20px] mb-5"
                                style={{ color: 'var(--brand)' }}>
                                {sheet.tagline}
                            </p>
                            <p
                                className="text-[15.5px] leading-relaxed max-w-[620px] mb-8"
                                style={{ color: 'var(--text-secondary)' }}>
                                {sheet.description}
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    className="px-5 py-2.5 rounded-full text-[13.5px] font-semibold inline-flex items-center gap-1.5"
                                    style={{
                                        background: 'var(--brand)',
                                        color: 'var(--text-on-inverse)',
                                        boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                                    }}>
                                    <Download size={14} /> Download PDF
                                </button>
                                <Link
                                    to="/resources/cheatsheet"
                                    className="px-5 py-2.5 rounded-full text-[13.5px] font-semibold inline-flex items-center gap-1.5"
                                    style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line-strong)' }}>
                                    <ArrowLeft size={14} /> All sheets
                                </Link>
                            </div>
                        </motion.div>

                        {/* Cover card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="rounded-3xl aspect-[4/5] relative overflow-hidden flex flex-col justify-between p-7"
                            style={{ background: sheet.accentGradient, color: '#fff', boxShadow: 'var(--card-shadow-hover)' }}>
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 pointer-events-none opacity-15"
                                style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0, transparent 50%)' }}
                            />
                            <div className="relative z-[1] flex items-center justify-between">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-wider uppercase bg-white/15 border border-white/20">
                                    <FileText size={12} /> PDF
                                </div>
                                <Icon
                                    size={28}
                                    className="text-white/40"
                                />
                            </div>
                            <div className="relative z-[1]">
                                <span
                                    className="font-display font-semibold tracking-[-0.02em] text-white block leading-[0.92]"
                                    style={{ fontSize: 'clamp(48px, 8vw, 72px)' }}>
                                    {sheet.title.split(' ')[0]}
                                </span>
                                <span
                                    className="font-display italic font-light text-white/85 block mt-2"
                                    style={{ fontSize: 'clamp(18px, 2.4vw, 24px)' }}>
                                    cheat sheet
                                </span>
                                <div className="mt-6 text-[11.5px] tracking-[0.18em] uppercase font-semibold text-white/70">
                                    {sheet.groups.length} sections · {sheet.groups.reduce((acc, g) => acc + g.items.length, 0)} snippets
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content groups */}
            <section className="px-5 md:px-8 pb-16">
                <div className="max-w-[1180px] mx-auto">
                    {sheet.groups.map((g, gi) => (
                        <motion.div
                            key={gi}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.4 }}
                            className="mb-12">
                            {/* Section header */}
                            <div className="flex items-baseline gap-4 mb-5">
                                <span
                                    className="font-display text-[20px] md:text-[24px] font-light italic"
                                    style={{ color: 'var(--brand)' }}>
                                    {String(gi + 1).padStart(2, '0')}.
                                </span>
                                <h2
                                    className="font-display text-[24px] md:text-[30px] font-semibold tracking-[-0.01em]"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {g.title}
                                </h2>
                            </div>
                            {g.intro && (
                                <p
                                    className="text-[14.5px] leading-relaxed mb-5 max-w-[760px]"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    {g.intro}
                                </p>
                            )}

                            <div className="grid md:grid-cols-2 gap-5">
                                {g.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-2xl overflow-hidden flex flex-col"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                        <div
                                            className="px-5 py-3 border-b flex items-center justify-between"
                                            style={{ borderColor: 'var(--line)' }}>
                                            <span
                                                className="text-[11px] tracking-[0.16em] uppercase font-semibold"
                                                style={{ color: 'var(--brand)' }}>
                                                {item.label}
                                            </span>
                                            {item.language && (
                                                <span
                                                    className="text-[10.5px] font-mono"
                                                    style={{ color: 'var(--text-tertiary)' }}>
                                                    {item.language}
                                                </span>
                                            )}
                                        </div>
                                        {item.code ? (
                                            <div className="-mt-2 -mb-1 [&>div]:rounded-none [&>div]:my-0 [&>div]:border-0 [&>div]:shadow-none">
                                                <CodeBlock
                                                    code={item.code}
                                                    language={item.language || 'text'}
                                                    showLines={false}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="p-5 text-[14px]"
                                                style={{ color: 'var(--text-secondary)' }}>
                                                {item.note}
                                            </div>
                                        )}
                                        {item.note && item.code && (
                                            <div
                                                className="px-5 py-3 border-t text-[12.5px] italic"
                                                style={{ borderColor: 'var(--line)', background: 'var(--surface-2)', color: 'var(--text-tertiary)' }}>
                                                {item.note}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Related */}
            {related.length > 0 && (
                <section
                    className="px-5 md:px-8 pb-24"
                    style={{ background: 'var(--page-bg-soft)' }}>
                    <div className="max-w-[1180px] mx-auto pt-16">
                        <div className="flex items-end justify-between mb-8">
                            <h2
                                className="font-display text-[28px] md:text-[36px] font-medium tracking-[-0.02em]"
                                style={{ color: 'var(--text-primary)' }}>
                                More cheat sheets
                            </h2>
                            <Link
                                to="/resources/cheatsheet"
                                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                All sheets <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {related.map((s) => {
                                const RelIcon = iconMap[s.iconKey]
                                return (
                                    <Link
                                        key={s.slug}
                                        to={`/resources/cheatsheet/${s.slug}`}
                                        className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                        <div
                                            className="aspect-[4/3] flex items-end justify-between p-5"
                                            style={{ background: s.accentGradient, color: '#fff' }}>
                                            <span className="font-display font-semibold text-[20px] tracking-tight">{s.title.split(' ')[0]}</span>
                                            <RelIcon
                                                size={28}
                                                className="text-white/40"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3
                                                className="font-display text-[16px] font-semibold leading-tight mb-1"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {s.title}
                                            </h3>
                                            <p
                                                className="text-[12px]"
                                                style={{ color: 'var(--text-tertiary)' }}>
                                                PDF · {s.pages} {s.pages > 1 ? 'pages' : 'page'}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
