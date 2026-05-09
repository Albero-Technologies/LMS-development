import { Briefcase, Sparkles, TrendingUp, Users } from 'lucide-react'
import { SectionShell, SectionHeading } from './primitives'
import { Ticker, type TickerItem } from './Ticker'
import { CompanyMark } from './CompanyMark'
import { resolveCompanyMark } from './company-marks'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export interface AlumniCompany {
    name: string
    /** Optional remote logo. When omitted we render a brand-coloured
     *  monogram via the local CompanyMark registry — same visual weight,
     *  no broken-image squares when a CDN logo fails to resolve. */
    logoUrl?: string
}

export interface AlumniWallStat {
    icon?: 'users' | 'briefcase' | 'trending' | 'sparkles'
    value: string
    label: string
}

interface Props {
    companies: AlumniCompany[]
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    /** Stats strip rendered between the heading and the logo wall. Set
     *  to `null` to hide it. Defaults to the marketing-team trio. */
    stats?: AlumniWallStat[] | null
    tone?: 'white' | 'soft' | 'deep'
}

const DEFAULT_STATS: AlumniWallStat[] = [
    { icon: 'briefcase', value: '180+', label: 'Hiring partners' },
    { icon: 'trending', value: '2.4×', label: 'Avg salary growth' },
    { icon: 'users', value: '92%', label: 'Placement within 6 months' },
    { icon: 'sparkles', value: '14 LPA', label: 'Median offer (top quartile)' }
]

// Premium revamp of the hiring-partners wall. Three-part composition:
//   1. Heading + eyebrow
//   2. Stats strip — proves the wall isn't just vanity logos
//   3. Two-row scrolling logo wall with brand-coloured monogram tiles
// The logo cards now carry a brand-coloured top stripe + sector chip so
// the wall reads as "real partnerships" instead of a clip-art collage.
export const AlumniCompanyWall = ({
    companies,
    heading = (
        <>
            Our alumni now build at <span className="alb-gradient-text italic font-medium">top companies.</span>
        </>
    ),
    accent,
    description = 'Real outcomes — every logo is a real placement, not a paid sponsorship.',
    stats = DEFAULT_STATS,
    tone = 'soft'
}: Props) => {
    if (companies.length === 0) return null
    const items: TickerItem[] = companies.map((c) => ({
        key: c.name,
        content: <CompanyCard company={c} />
    }))
    const row1 = items.filter((_, i) => i % 2 === 0)
    const row2 = items.filter((_, i) => i % 2 === 1)
    return (
        <SectionShell tone={tone} spacing="normal">
            <SectionHeading
                eyebrow="Hiring Partners"
                title={heading}
                accent={accent}
                description={description}
            />

            {stats && stats.length > 0 && <StatsStrip stats={stats} />}

            <div className="space-y-4 mt-8">
                <Ticker items={row1.length ? row1 : items} direction="left" durationSeconds={28} />
                {row2.length > 0 && (
                    <div className="hidden md:block">
                        <Ticker items={row2} direction="right" durationSeconds={32} />
                    </div>
                )}
            </div>
        </SectionShell>
    )
}

// Stats strip — four glass tiles with a brand-tinted icon, metric, and
// label. Reveals on scroll one tile at a time so the section gains motion
// from the moment it enters the viewport.
const StatsStrip = ({ stats }: { stats: AlumniWallStat[] }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    return (
        <div
            ref={ref}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 transition-all duration-[600ms] ease-out"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)'
            }}>
            {stats.map((s, i) => (
                <StatTile key={s.label} stat={s} delayMs={i * 90} />
            ))}
        </div>
    )
}

const ICON_MAP = {
    users: Users,
    briefcase: Briefcase,
    trending: TrendingUp,
    sparkles: Sparkles
} as const

const StatTile = ({ stat, delayMs }: { stat: AlumniWallStat; delayMs: number }) => {
    const Icon = ICON_MAP[stat.icon ?? 'sparkles']
    return (
        <div
            className="rounded-2xl px-4 py-5 flex flex-col items-center text-center transition-all duration-[600ms] ease-out"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                transitionDelay: `${delayMs}ms`
            }}>
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                <Icon size={18} />
            </div>
            <div className="font-display text-[24px] md:text-[28px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
            </div>
            <div className="mt-1.5 text-[11.5px] uppercase tracking-[0.14em] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
            </div>
        </div>
    )
}

// Premium logo card — brand-coloured top stripe, monogram tile, company
// name, and sector chip. Hover lifts the card and saturates the stripe.
const CompanyCard = ({ company }: { company: AlumniCompany }) => {
    const { color, sector } = resolveCompanyMark(company.name)
    return (
        <div
            data-company-card
            className="relative inline-flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                minWidth: 220
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `var(--card-shadow-hover), 0 0 0 4px ${color}1a`
                e.currentTarget.style.borderColor = `${color}66`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--card-shadow-soft)'
                e.currentTarget.style.borderColor = 'var(--hairline)'
            }}>
            {/* Brand stripe — left edge, always visible. Subtle anchor that
                stops the card looking generic when the monogram is a
                muted tone. */}
            <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: `linear-gradient(180deg, ${color}, ${color}99)` }}
            />

            {/* Logo cell — when an external logo URL is provided we render
                it on top of the monogram so a successful image hides the
                fallback. Image-on-error swap keeps a polished look. */}
            <div className="relative ml-1 shrink-0">
                <CompanyMark name={company.name} size={44} />
                {company.logoUrl && (
                    <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="absolute inset-0 w-full h-full object-contain p-2 rounded-xl bg-white"
                        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}
                        loading="lazy"
                        onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                    />
                )}
            </div>

            <div className="flex flex-col min-w-0">
                <span className="font-display text-[15px] font-semibold tracking-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    {company.name}
                </span>
                {sector && (
                    <span
                        className="mt-0.5 inline-flex w-fit items-center gap-1 px-1.5 py-0 rounded-full text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ color, background: `${color}14` }}>
                        <span
                            className="inline-block w-1 h-1 rounded-full"
                            style={{ background: color }}
                        />
                        {sector}
                    </span>
                )}
            </div>
        </div>
    )
}
