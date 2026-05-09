import ResourceLayout from '@/components/user/resources/ResourceLayout'
import { FolderOpen, Award, TrendingUp, ArrowRight, Building2, Clock, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { listCaseStudies, type CaseStudyEntry } from '@/constants/case-study-content'
import { useCollection } from '@/hooks/useContent'
import { CompanyMark } from '@/components/user/program-page/CompanyMark'
import { resolveCompanyMark } from '@/components/user/program-page/company-marks'

const stats = [
    { v: '12+', l: 'Global brands analysed', icon: Building2 },
    { v: '6+', l: 'Industries covered', icon: FolderOpen },
    { v: '40+', l: 'Business strategies', icon: TrendingUp }
]

const DEFAULT_GRADIENT = 'linear-gradient(135deg,#0d4f3c,#34d399)'

export default function CaseStudies() {
    const navigate = useNavigate()
    const fallback = listCaseStudies()
    const cmsQuery = useCollection('case-studies')

    // Map CMS rows into the same `CaseStudyEntry` shape the cards consume.
    // Backend captures the headline marketing fields (brand, title, sector,
    // founded, keyFacts) — the deeper rich content (full TOC, ReactNode body)
    // stays in code. New CMS entries link to the detail route, which falls
    // back to a 404 if no constant matches; future work: render CMS detail
    // body via a lightweight HTML renderer.
    // Index constants by lowercased slug + brand so we can re-route a CMS
    // row to the matching constants slug when their brand lines up. Without
    // this, a CMS row with a CMS-generated slug (e.g. "razorpay-cms-row")
    // links to /resources/case-studies/razorpay-cms-row, which findCaseStudy
    // can't resolve — and the detail page redirects back to the hub.
    const norm = (s: string) => s.trim().toLowerCase()
    const constantsByKey = new Map<string, CaseStudyEntry>()
    fallback.forEach((c) => {
        constantsByKey.set(`slug:${norm(c.slug)}`, c)
        constantsByKey.set(`brand:${norm(c.brand)}`, c)
    })

    const cmsCases: CaseStudyEntry[] = (cmsQuery.data?.items ?? []).map((it) => {
        const data = it.data as { brand?: string; title?: string; sector?: string; founded?: string; keyFacts?: string }
        const facts = String(data.keyFacts ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((line) => {
                const [label, ...rest] = line.split(':')
                return { label: label.trim(), value: rest.join(':').trim() || label.trim() }
            })
        const brand = String(data.brand ?? it.slug)
        // If a constants entry exists for this brand/slug, use its slug as
        // the link target — keeps the detail page resolvable + reuses the
        // hand-written cover gradient + sector for visual consistency.
        const match =
            constantsByKey.get(`slug:${norm(it.slug)}`) ?? constantsByKey.get(`brand:${norm(brand)}`)
        return {
            slug: match?.slug ?? it.slug,
            brand: match?.brand ?? brand,
            title: String(data.title ?? data.brand ?? match?.title ?? it.slug),
            description: match?.description ?? '',
            sector: String(data.sector ?? match?.sector ?? '—'),
            founded: String(data.founded ?? match?.founded ?? '—'),
            headquarters: match?.headquarters ?? '—',
            coverGradient: match?.coverGradient ?? DEFAULT_GRADIENT,
            badge: match?.badge,
            tags: [String(data.sector ?? match?.tags[0] ?? 'Business')],
            author: { name: 'Albero Editorial', role: 'Editor' },
            readMin: match?.readMin ?? 8,
            date: it.publishedAt ? new Date(it.publishedAt).toLocaleDateString() : (match?.date ?? ''),
            keyFacts: facts.length > 0 ? facts : (match?.keyFacts ?? []),
            toc: [],
            content: null
        }
    })

    // Dedup CMS-vs-constants on BOTH slug and brand-name (case-insensitive).
    // Now that CMS rows alias to the constants slug above, both keys catch
    // every overlap and constants entries don't render twice.
    const cmsKeys = new Set<string>()
    cmsCases.forEach((c) => {
        cmsKeys.add(`slug:${norm(c.slug)}`)
        cmsKeys.add(`brand:${norm(c.brand)}`)
    })
    const all = [
        ...cmsCases,
        ...fallback.filter((c) => !cmsKeys.has(`slug:${norm(c.slug)}`) && !cmsKeys.has(`brand:${norm(c.brand)}`))
    ]
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

            {/* Brand grid — premium logo tiles. Each card pairs the brand
                monogram (CompanyMark) with the company name + sector chip,
                so the wall reads as "real partnerships" instead of plain
                colour swatches. Theme-aware via CSS variables. */}
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {everything.map((c, i) => (
                        <BrandTile key={c.slug} entry={c} index={i} onClick={() => navigate(`/resources/case-studies/${c.slug}`)} />
                    ))}
                </div>
            </div>

            {/* Top picks — always-dark "spotlight" stage. Hardcoded colours
                rather than --surface-inverse because that token flips with
                the active theme; this card is meant to read as a curated
                dark surface in BOTH light + dark mode. */}
            <div
                className="mb-20 rounded-3xl p-8 md:p-12 relative overflow-hidden"
                style={{
                    background:
                        'radial-gradient(60% 60% at 20% 10%, rgba(20,120,95,0.45) 0%, transparent 60%), ' +
                        'radial-gradient(50% 50% at 85% 25%, rgba(52,211,153,0.35) 0%, transparent 60%), ' +
                        'radial-gradient(70% 60% at 50% 110%, rgba(13,79,60,0.4) 0%, transparent 70%), ' +
                        '#06140f',
                    color: '#f5f3ea',
                    border: '1px solid rgba(52,211,153,0.18)'
                }}>
                {/* Brand stripe across the top — same anchor used by the
                    Industry Toolkit + TechMesh cards, keeps the section
                    identity consistent. */}
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, #0d4f3c, #14785f, #34d399)' }}
                />

                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-[12px] font-bold tracking-[0.2em] uppercase"
                        style={{ background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.3)', color: 'rgba(245,243,234,0.92)' }}>
                        <Award size={13} style={{ color: '#34d399' }} /> Mentor Recommendations
                    </div>
                    <h2
                        className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em] mb-3"
                        style={{ color: '#f5f3ea' }}>
                        Top picks by our <span className="alb-gradient-text italic font-medium">mentors.</span>
                    </h2>
                    <p style={{ color: 'rgba(245,243,234,0.7)', maxWidth: 640, margin: '0 auto' }}>
                        Hand-picked by industry experts who mentor at Albero — the case studies every student should read.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {featured.map((f, i) => (
                        <FeaturedCaseCard key={f.slug} entry={f} index={i} onClick={() => navigate(`/resources/case-studies/${f.slug}`)} />
                    ))}
                </div>
            </div>

            {/* All studies — list view with brand mark + meta + arrow. */}
            <div>
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 text-[11px] font-bold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <Sparkles size={12} /> Full Library
                    </div>
                    <h2
                        className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em]"
                        style={{ color: 'var(--text-primary)' }}>
                        All case studies
                    </h2>
                </div>
                <div className="space-y-4">
                    {everything.map((s, i) => (
                        <CaseStudyListRow key={s.slug} entry={s} index={i} onClick={() => navigate(`/resources/case-studies/${s.slug}`)} />
                    ))}
                </div>
            </div>
        </ResourceLayout>
    )
}

// ──────────────────────────────────────────────────────────────────────
// Brand tile — replaces the previous plain coloured square with a
// premium logo card. Shows the company monogram chip, name, and the
// sector pulled from the registry. Theme-aware so it reads cleanly in
// both light + dark mode.
// ──────────────────────────────────────────────────────────────────────
const BrandTile = ({ entry, index, onClick }: { entry: CaseStudyEntry; index: number; onClick: () => void }) => {
    const { color, sector } = resolveCompanyMark(entry.brand)
    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className="group relative rounded-2xl p-4 md:p-5 text-left overflow-hidden transition-all"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}66`
                e.currentTarget.style.boxShadow = `var(--card-shadow-hover), 0 0 0 4px ${color}1a`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow-soft)'
            }}>
            {/* Brand-coloured ribbon — anchors each tile to its identity. */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
            />
            <div className="flex items-center gap-3">
                <CompanyMark name={entry.brand} size={48} />
                <div className="min-w-0 flex-1">
                    <div className="font-display text-[16px] md:text-[17px] font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                        {entry.brand}
                    </div>
                    {(sector ?? entry.sector) && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[9.5px] font-bold tracking-[0.12em] uppercase" style={{ color, background: `${color}14` }}>
                            <span className="inline-block w-1 h-1 rounded-full" style={{ background: color }} />
                            {sector ?? entry.sector}
                        </div>
                    )}
                </div>
                <ArrowRight
                    size={16}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color }}
                />
            </div>
        </motion.button>
    )
}

// ──────────────────────────────────────────────────────────────────────
// Featured card on the dark "Top picks" stage. All colours hardcoded so
// the card stays readable regardless of the user's theme — this section
// is intentionally a dark surface in BOTH modes.
// ──────────────────────────────────────────────────────────────────────
const FeaturedCaseCard = ({ entry, index, onClick }: { entry: CaseStudyEntry; index: number; onClick: () => void }) => {
    const { color } = resolveCompanyMark(entry.brand)
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            onClick={onClick}
            className="text-left rounded-2xl overflow-hidden transition-all"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 16px 36px rgba(0,0,0,0.32)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}66`
                e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.45), 0 0 0 4px ${color}24`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.32)'
            }}>
            {/* Cover with brand monogram + badge. Centres the company
                identity in a dark glassy panel rather than a flat colour
                fill. */}
            <div
                className="relative aspect-video flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${color}33 0%, transparent 70%), rgba(0,0,0,0.4)` }}>
                <CompanyMark name={entry.brand} size={88} />
                {entry.badge && (
                    <span
                        className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                        style={{ background: '#f5f3ea', color: '#06140f' }}>
                        <Sparkles size={10} /> {entry.badge}
                    </span>
                )}
            </div>
            <div className="p-5">
                <h3 className="font-display text-[19px] font-semibold mb-2 leading-tight" style={{ color: '#f5f3ea' }}>
                    {entry.brand} Case Study
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {entry.tags.slice(0, 2).map((t, j) => (
                        <span
                            key={j}
                            className="px-2.5 py-0.5 rounded-full text-[11px]"
                            style={{ background: 'rgba(52,211,153,0.10)', color: 'rgba(245,243,234,0.85)', border: '1px solid rgba(52,211,153,0.22)' }}>
                            {t}
                        </span>
                    ))}
                </div>
                <p className="text-[13.5px] leading-relaxed mb-4 line-clamp-3" style={{ color: 'rgba(245,243,234,0.72)' }}>
                    {entry.description}
                </p>
                <div className="flex items-center justify-between gap-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style={{ background: 'rgba(52,211,153,0.20)', color: '#34d399' }}>
                            {entry.author.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-[12.5px]" style={{ color: 'rgba(245,243,234,0.7)' }}>
                            {entry.author.name}
                        </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: 'rgba(245,243,234,0.6)' }}>
                        <Clock size={11} /> {entry.readMin} min
                    </span>
                </div>
            </div>
        </motion.button>
    )
}

// ──────────────────────────────────────────────────────────────────────
// Compact list row for the "All case studies" rail. Uses CompanyMark for
// the brand identity instead of the previous brand-arrow-only layout.
// ──────────────────────────────────────────────────────────────────────
const CaseStudyListRow = ({ entry, index, onClick }: { entry: CaseStudyEntry; index: number; onClick: () => void }) => {
    const { color, sector } = resolveCompanyMark(entry.brand)
    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index * 0.04, 0.3) }}
            onClick={onClick}
            className="group relative w-full grid grid-cols-[auto_1fr_auto] gap-5 p-5 rounded-2xl text-left items-center transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', boxShadow: 'var(--card-shadow-soft)' }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}66`
                e.currentTarget.style.boxShadow = `var(--card-shadow-hover), 0 0 0 4px ${color}14`
                e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow-soft)'
                e.currentTarget.style.transform = 'none'
            }}>
            <CompanyMark name={entry.brand} size={56} />
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color }}>
                        {sector ?? entry.sector}
                    </span>
                    <span style={{ color: 'var(--hairline)' }}>·</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {entry.author.name}
                    </span>
                </div>
                <h3 className="font-display text-[19px] md:text-[22px] font-semibold leading-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {entry.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {entry.description}
                </p>
                <div className="flex flex-wrap items-center gap-2.5 text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
                    {entry.date && <span>{entry.date}</span>}
                    {entry.date && <span>·</span>}
                    <span className="inline-flex items-center gap-1">
                        <Clock size={10} /> {entry.readMin} min read
                    </span>
                    {entry.tags.length > 0 && (
                        <>
                            <span>·</span>
                            <div className="flex gap-1.5">
                                {entry.tags.slice(0, 3).map((t, j) => (
                                    <span key={j}>#{t}</span>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div
                className="hidden sm:flex w-11 h-11 rounded-full items-center justify-center transition-all"
                style={{ background: `${color}14`, color }}>
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </div>
        </motion.button>
    )
}
