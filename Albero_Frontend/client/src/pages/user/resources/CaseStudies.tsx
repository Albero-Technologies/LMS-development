import ResourceLayout from '@/components/user/resources/ResourceLayout'
import { FolderOpen, Award, TrendingUp, ArrowRight, Building2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { listCaseStudies } from '@/constants/case-study-content'

const stats = [
    { v: '12+', l: 'Global brands analysed', icon: Building2 },
    { v: '6+', l: 'Industries covered', icon: FolderOpen },
    { v: '40+', l: 'Business strategies', icon: TrendingUp }
]

export default function CaseStudies() {
    const navigate = useNavigate()
    const all = listCaseStudies()
    const featured = all.filter((c) => c.badge).slice(0, 3)
    const everything = all

    return (
        <ResourceLayout
            eyebrow={`${all.length} In-Depth Case Studies`}
            title="Learn from the"
            highlight="world's best brands"
            description="In-depth case studies breaking down the business models, marketing strategies, and growth stories behind the world's most successful companies."
            icon={FolderOpen}>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mb-16 max-w-3xl mx-auto">
                {stats.map((s, i) => {
                    const Icon = s.icon
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-2xl p-5 text-center"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow)'
                            }}>
                            <Icon
                                size={24}
                                className="mx-auto mb-3"
                                style={{ color: 'var(--brand)' }}
                            />
                            <div
                                className="font-display text-[28px] md:text-[34px] font-semibold leading-none"
                                style={{ color: 'var(--text-primary)' }}>
                                {s.v}
                            </div>
                            <div
                                className="text-[11px] tracking-[0.16em] uppercase font-semibold mt-2"
                                style={{ color: 'var(--text-tertiary)' }}>
                                {s.l}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Brand grid (clickable) */}
            <div className="mb-20">
                <div className="text-center mb-8">
                    <h2
                        className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em] mb-3"
                        style={{ color: 'var(--text-primary)' }}>
                        Explore by brand
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Click any brand to read the full case study.
                    </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                    {everything.map((c, i) => (
                        <motion.button
                            key={c.slug}
                            initial={{ opacity: 0, scale: 0.92 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: Math.min(i * 0.025, 0.3) }}
                            whileHover={{ scale: 1.05, y: -3 }}
                            onClick={() => navigate(`/resources/case-studies/${c.slug}`)}
                            className="font-display aspect-square rounded-xl flex items-center justify-center font-semibold text-[14px] md:text-[16px] tracking-tight"
                            style={{ background: c.coverGradient, color: '#fff', boxShadow: '0 8px 24px rgba(10,14,31,0.10)' }}>
                            {c.brand}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Top picks (dark stage) */}
            <div
                className="mb-20 rounded-3xl p-8 md:p-12 relative overflow-hidden"
                style={{
                    background: 'var(--surface-inverse)',
                    color: 'var(--text-on-inverse)',
                    border: '1px solid var(--line)'
                }}>
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-[12px] font-semibold tracking-tight"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'var(--text-on-inverse)' }}>
                        <Award size={13} style={{ color: 'oklch(0.852 0.199 91.936)' }} /> Mentor Recommendations
                    </div>
                    <h2 className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em] mb-3">
                        Top picks by our mentors
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Hand-picked by industry experts who mentor at Albero — the case studies every student should read.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {featured.map((f, i) => (
                        <motion.button
                            key={f.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -6 }}
                            onClick={() => navigate(`/resources/case-studies/${f.slug}`)}
                            className="text-left rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            <div
                                className="aspect-video flex items-center justify-center font-display text-[28px] font-semibold tracking-tight relative"
                                style={{ background: f.coverGradient, color: '#fff' }}>
                                {f.brand}
                                {f.badge && (
                                    <span
                                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                                        style={{ background: '#fff', color: '#0a0e1f' }}>
                                        {f.badge}
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="font-display text-[20px] font-semibold mb-2 leading-tight">{f.brand} Case Study</h3>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {f.tags.slice(0, 2).map((t, j) => (
                                        <span
                                            key={j}
                                            className="px-2.5 py-0.5 rounded-full text-[11px]"
                                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[13.5px] leading-relaxed mb-4 line-clamp-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {f.description}
                                </p>
                                <div
                                    className="flex items-center gap-2 pt-3 border-t"
                                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                                        style={{ background: 'rgba(52,211,153,0.18)', color: '#34d399' }}>
                                        {f.author.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                                    </div>
                                    <span className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                        {f.author.name}
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* All studies list */}
            <div>
                <h2
                    className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em] text-center mb-10"
                    style={{ color: 'var(--text-primary)' }}>
                    All case studies
                </h2>
                <div className="space-y-5">
                    {everything.map((s, i) => (
                        <motion.button
                            key={s.slug}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: Math.min(i * 0.04, 0.3) }}
                            onClick={() => navigate(`/resources/case-studies/${s.slug}`)}
                            className="w-full grid md:grid-cols-[1fr_140px] gap-6 p-6 rounded-2xl text-left transition-colors hover:-translate-y-0.5"
                            style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                            <div>
                                <div className="text-[11.5px] mb-2" style={{ color: 'var(--text-tertiary)' }}>
                                    {s.sector} · {s.author.name}
                                </div>
                                <h3
                                    className="font-display text-[22px] font-semibold mb-2"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {s.title}
                                </h3>
                                <p
                                    className="text-[14px] leading-relaxed mb-4 line-clamp-2"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    {s.description}
                                </p>
                                <div
                                    className="flex flex-wrap items-center gap-3 text-[12px]"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    <span>{s.date}</span>
                                    <span>·</span>
                                    <span>{s.readMin} min read</span>
                                    <div className="flex gap-2">
                                        {s.tags.map((t, j) => (
                                            <span key={j}>#{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-end">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </ResourceLayout>
    )
}
