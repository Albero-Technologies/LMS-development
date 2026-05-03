import ResourceLayout from '@/components/user/resources/ResourceLayout'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Target, Sparkles, Code2, FileSpreadsheet, BarChart3, Database, Calculator, PieChart, ArrowRight, Clock } from 'lucide-react'
import { listGuides } from '@/constants/interview-guide-content'

const iconMap = {
    python: Code2,
    sql: Database,
    powerbi: BarChart3,
    excel: FileSpreadsheet,
    statistics: Calculator,
    tableau: PieChart
} as const

export default function InterviewGuides() {
    const navigate = useNavigate()
    const all = listGuides()
    const totalQ = all.reduce((acc, g) => acc + g.questionCount, 0)

    return (
        <ResourceLayout
            eyebrow="Interview Preparation"
            title="Crack every interview"
            highlight="with confidence"
            description="Curated questions, expert answers, and proven strategies — everything you need to prepare for data analytics, programming, and BI tool interviews."
            icon={Target}
            stats={[
                { value: `${all.length}+`, label: 'Topics' },
                { value: `${totalQ}+`, label: 'Questions' },
                { value: '100%', label: 'Free' }
            ]}>
            {/* Topic chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                <span
                    className="text-[11px] font-semibold tracking-[0.22em] uppercase mr-2"
                    style={{ color: 'var(--text-tertiary)' }}>
                    Topics
                </span>
                {all.map((g, i) => {
                    const Icon = iconMap[g.iconKey]
                    return (
                        <motion.button
                            key={g.slug}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => navigate(`/resources/interview-guides/${g.slug}`)}
                            className="px-4 py-2 rounded-full inline-flex items-center gap-2 text-[13.5px] transition-colors"
                            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}>
                            <Icon size={14} style={{ color: 'var(--brand)' }} />
                            {g.title.replace('Fundamentals of ', '')}
                        </motion.button>
                    )
                })}
            </div>

            {/* Hottest interview guides */}
            <div className="mb-20">
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold mb-4"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <Sparkles size={13} /> Trending Right Now
                    </div>
                    <h2
                        className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em]"
                        style={{ color: 'var(--text-primary)' }}>
                        Hottest interview guides
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {all.slice(0, 4).map((g, i) => (
                        <motion.button
                            key={g.slug}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ y: -6 }}
                            onClick={() => navigate(`/resources/interview-guides/${g.slug}`)}
                            className="group relative rounded-2xl p-6 text-left transition-all duration-300"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow)'
                            }}>
                            <div className="flex items-start justify-between mb-3">
                                <span
                                    className="font-display text-[34px] font-semibold leading-none"
                                    style={{ color: 'var(--line-strong)' }}>
                                    #{i + 1}
                                </span>
                                {g.badge && (
                                    <span
                                        className="px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase"
                                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                        {g.badge}
                                    </span>
                                )}
                            </div>
                            <h3
                                className="font-display text-[17px] font-semibold mb-2"
                                style={{ color: 'var(--text-primary)' }}>
                                {g.title}
                            </h3>
                            <p
                                className="text-[12.5px] leading-relaxed mb-4 line-clamp-3"
                                style={{ color: 'var(--text-secondary)' }}>
                                {g.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {g.tags.slice(0, 2).map((t, j) => (
                                    <span
                                        key={j}
                                        className="px-2 py-0.5 rounded-md text-[10.5px]"
                                        style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)', border: '1px solid var(--line)' }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <div
                                className="flex items-center justify-between pt-3 border-t"
                                style={{ borderColor: 'var(--line)' }}>
                                <span
                                    className="text-[11px] inline-flex items-center gap-1.5"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    <Clock size={11} /> {g.readMin} min
                                </span>
                                <span
                                    className="text-[11.5px] tracking-wide font-semibold inline-flex items-center gap-1"
                                    style={{ color: 'var(--brand)' }}>
                                    {g.questionCount} Questions <ArrowRight size={11} />
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* All interview guides */}
            <div>
                <div className="text-center mb-10">
                    <h2
                        className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em] mb-3"
                        style={{ color: 'var(--text-primary)' }}>
                        All interview guides
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Pick a topic and start preparing — each guide is packed with real interview questions and clear answers.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {all.map((g, i) => {
                        const Icon = iconMap[g.iconKey]
                        return (
                            <motion.button
                                key={g.slug}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -6 }}
                                onClick={() => navigate(`/resources/interview-guides/${g.slug}`)}
                                className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <div className="h-32 flex items-center justify-center relative" style={{ background: g.accentGradient }}>
                                    <span className="font-display text-3xl md:text-4xl font-semibold text-white drop-shadow">
                                        {g.title.replace('Fundamentals of ', '')}
                                    </span>
                                    <Icon className="absolute right-5 bottom-5 text-white/30" size={48} />
                                </div>
                                <div className="p-5">
                                    <h3
                                        className="font-display text-[17px] font-semibold mb-2"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {g.title} — Interview Questions &amp; Answers
                                    </h3>
                                    <p
                                        className="text-[12.5px] leading-relaxed mb-4"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {g.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-[11px]"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            {g.questionCount} questions · {g.readMin} min read
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1 text-[12px] font-semibold"
                                            style={{ color: 'var(--brand)' }}>
                                            Read <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            </div>
        </ResourceLayout>
    )
}
