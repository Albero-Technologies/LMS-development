import { SectionShell, SectionHeading } from './primitives'
import { Ticker, type TickerItem } from './Ticker'

export interface AlumniCompany {
    name: string
    logoUrl?: string
}

interface Props {
    companies: AlumniCompany[]
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    tone?: 'white' | 'soft' | 'deep'
}

// Two-row scrolling logo wall. Logos render greyscale by default, fade to
// full colour on hover. Mobile collapses to a single row.
export const AlumniCompanyWall = ({
    companies,
    heading = (
        <>
            Our alumni now build at <span className="alb-gradient-text italic font-medium">top companies.</span>
        </>
    ),
    accent,
    description = '180+ hiring partners across product, services, and bulge-bracket finance.',
    tone = 'soft'
}: Props) => {
    if (companies.length === 0) return null
    const items: TickerItem[] = companies.map((c) => ({
        key: c.name,
        content: <CompanyLogo company={c} />
    }))
    const row1 = items.filter((_, i) => i % 2 === 0)
    const row2 = items.filter((_, i) => i % 2 === 1)
    return (
        <SectionShell tone={tone} spacing="normal">
            <SectionHeading eyebrow="Hiring Partners" title={heading} accent={accent} description={description} />
            <div className="space-y-3">
                <Ticker items={row1.length ? row1 : items} direction="left" durationSeconds={50} />
                {row2.length > 0 && (
                    <div className="hidden md:block">
                        <Ticker items={row2} direction="right" durationSeconds={56} />
                    </div>
                )}
            </div>
        </SectionShell>
    )
}

const CompanyLogo = ({ company }: { company: AlumniCompany }) => (
    <div
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl transition-all hover:scale-[1.04]"
        style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            minWidth: 140,
            height: 64
        }}>
        {company.logoUrl ? (
            <img
                src={company.logoUrl}
                alt={company.name}
                className="max-h-8 object-contain transition-all"
                style={{ filter: 'grayscale(1)', opacity: 0.7 }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'grayscale(0)'
                    e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'grayscale(1)'
                    e.currentTarget.style.opacity = '0.7'
                }}
                loading="lazy"
            />
        ) : (
            <span className="font-display text-[15px] font-semibold whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                {company.name}
            </span>
        )}
    </div>
)
