import ResourceLayout from '@/components/user/resources/ResourceLayout'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, FileText, Code2, Database, BarChart3, FileSpreadsheet, Calculator, PieChart, Brain, Sparkles } from 'lucide-react'
import { listSheets } from '@/constants/cheatsheet-content'
import { useCollection } from '@/hooks/useContent'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'
import { cheatSheetsHubSEO } from '@/constants/seo'

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

// Map a CMS `category` (the schema's select field) to a sensible icon key
// + accent gradient. Falls back to a brand-tinted gradient + the FileText
// glyph for any category we haven't styled yet.
const CATEGORY_TO_ICON: Record<string, keyof typeof iconMap> = {
    SQL: 'sql',
    Python: 'python',
    Pandas: 'python',
    Statistics: 'statistics',
    Excel: 'excel',
    'Power BI': 'powerbi',
    Tableau: 'tableau'
}
const DEFAULT_ACCENT = 'linear-gradient(135deg, #0d4f3c 0%, #34d399 100%)'

export default function CheatSheet() {
    const navigate = useNavigate()
    const fallback = listSheets()
    const cmsQuery = useCollection('cheatsheets')

    // Map CMS items into the same shape the cards expect. Backend entries
    // appear FIRST so newly-published cheatsheets surface at the top of the
    // page; static items follow as a baseline. We dedupe by slug so a CMS
    // entry with the same slug as a constant overrides it cleanly.
    const cmsItems = (cmsQuery.data?.items ?? []).map((it) => {
        const data = it.data as { title?: string; description?: string; category?: string; code?: string }
        const iconKey = (data.category && CATEGORY_TO_ICON[data.category]) || 'sql'
        return {
            slug: it.slug,
            title: String(data.title ?? it.slug),
            description: String(data.description ?? ''),
            tags: data.category ? [data.category] : [],
            pages: 1,
            iconKey,
            accentGradient: DEFAULT_ACCENT
        }
    })
    const cmsSlugs = new Set(cmsItems.map((c) => c.slug))
    const all = [...cmsItems, ...fallback.filter((s) => !cmsSlugs.has(s.slug))]

    return (
        <>
            <SEO
                title={cheatSheetsHubSEO.title}
                description={cheatSheetsHubSEO.description}
                keywords={cheatSheetsHubSEO.keywords}
                url={cheatSheetsHubSEO.url}
                canonical={cheatSheetsHubSEO.canonical}
                image={cheatSheetsHubSEO.image}
                type={cheatSheetsHubSEO.type}
            />
            <StructuredData page="cheatSheets" />
            <ResourceLayout
                eyebrow="Quick Reference"
                title="One-page cheat sheets for"
                highlight="real-world work"
                description="Free, printable one-pagers for every key concept — from Python and SQL to DAX, ML, and GenAI. Designed for fast revision and on-the-job lookup."
                icon={FileText}
                stats={[
                    { value: `${all.length}+`, label: 'Sheets' },
                    { value: 'PDF', label: 'Downloads' },
                    { value: 'Free', label: 'Always' }
                ]}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {all.map((s, i) => {
                        const Icon = iconMap[s.iconKey]
                        return (
                            <motion.button
                                key={s.slug}
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                                whileHover={{ y: -4 }}
                                onClick={() => navigate(`/resources/cheatsheet/${s.slug}`)}
                                className="group relative text-left rounded-2xl overflow-hidden transition-all"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <div
                                    className="aspect-[4/3] flex items-end justify-between p-5"
                                    style={{ background: s.accentGradient, color: '#fff' }}>
                                    <span className="font-display font-semibold text-[22px] tracking-tight">{s.title.split(' ')[0]}</span>
                                    <Icon
                                        size={32}
                                        className="text-white/40"
                                    />
                                </div>
                                <div className="p-5">
                                    <h3
                                        className="font-display text-[18px] font-semibold leading-tight mb-1.5"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {s.title}
                                    </h3>
                                    <p
                                        className="text-[13px] leading-relaxed mb-4 line-clamp-3"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {s.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {s.tags.slice(0, 3).map((t, j) => (
                                            <span
                                                key={j}
                                                className="px-2 py-0.5 rounded-md text-[10.5px]"
                                                style={{
                                                    background: 'var(--surface-2)',
                                                    color: 'var(--text-tertiary)',
                                                    border: '1px solid var(--line)'
                                                }}>
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                    <div
                                        className="flex items-center justify-between pt-3 border-t"
                                        style={{ borderColor: 'var(--line)' }}>
                                        <span
                                            className="text-[11px] tracking-[0.16em] uppercase font-semibold"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            PDF · {s.pages} {s.pages > 1 ? 'pages' : 'page'}
                                        </span>
                                        <span
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-transform group-hover:rotate-45"
                                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                            <ArrowUpRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            </ResourceLayout>
        </>
    )
}
