import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, IndianRupee, TrendingUp, UserPlus } from 'lucide-react'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { getStatsTimeline, type StatsTimelineResponse, type StatsWindow, type TimelineBucket } from '../services/studentsMonitor.service'

// Stats / charts tab — driven by a single useQuery that re-runs whenever the
// preset window or custom range changes. Drawn with a tiny inline SVG bar
// chart so we don't pull in recharts; the timeline is short (max ~60 buckets)
// and the data shape is simple, so a custom renderer keeps the bundle lean.

type WindowPreset = Exclude<StatsWindow, 'custom'>

const PRESETS: { value: WindowPreset; label: string }[] = [
    { value: 'hour', label: 'Last hour' },
    { value: 'day', label: 'Last 24h' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
    { value: 'year', label: 'Last year' }
]

const YEARS = (() => {
    const cur = new Date().getFullYear()
    return [cur, cur - 1, cur - 2, cur - 3]
})()

export const StatsTimelineTab = ({ tenantSlug }: { tenantSlug?: string }) => {
    const [preset, setPreset] = useState<WindowPreset | 'year-pick' | 'custom'>('month')
    const [year, setYear] = useState<number>(YEARS[0])
    const [customFrom, setCustomFrom] = useState<string>('')
    const [customTo, setCustomTo] = useState<string>('')

    const params = useMemo(() => {
        if (preset === 'year-pick') {
            return {
                window: 'custom' as StatsWindow,
                from: new Date(Date.UTC(year, 0, 1)).toISOString(),
                to: new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString()
            }
        }
        if (preset === 'custom') {
            if (!customFrom || !customTo) return null
            const from = new Date(`${customFrom}T00:00:00.000Z`)
            const to = new Date(`${customTo}T23:59:59.000Z`)
            if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null
            return { window: 'custom' as StatsWindow, from: from.toISOString(), to: to.toISOString() }
        }
        return { window: preset }
    }, [preset, year, customFrom, customTo])

    const statsQuery = useQuery({
        queryKey: ['students-monitor', 'stats', { tenantSlug, params }],
        queryFn: () => {
            if (!params) throw new Error('Invalid range')
            return getStatsTimeline({ ...params, tenantSlug })
        },
        enabled: !!params,
        staleTime: 60_000
    })

    return (
        <div className="space-y-4">
            {/* Window controls */}
            <Card padded={false}>
                <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-fg-muted mr-2">
                        <Calendar size={13} /> Range
                    </span>
                    {PRESETS.map((p) => (
                        <Button
                            key={p.value}
                            size="sm"
                            variant={preset === p.value ? 'primary' : 'ghost'}
                            onClick={() => setPreset(p.value)}>
                            {p.label}
                        </Button>
                    ))}
                    <Button
                        size="sm"
                        variant={preset === 'year-pick' ? 'primary' : 'ghost'}
                        onClick={() => setPreset('year-pick')}>
                        Year
                    </Button>
                    <Button
                        size="sm"
                        variant={preset === 'custom' ? 'primary' : 'ghost'}
                        onClick={() => setPreset('custom')}>
                        Custom
                    </Button>

                    {preset === 'year-pick' && (
                        <div className="ml-auto flex items-center gap-2">
                            <select
                                aria-label="Year"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="h-9 rounded-md border bg-surface text-fg text-sm px-2">
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {preset === 'custom' && (
                        <div className="ml-auto flex items-center gap-2">
                            <Input
                                type="date"
                                aria-label="From"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                            />
                            <span className="text-fg-muted text-xs">to</span>
                            <Input
                                type="date"
                                aria-label="To"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </Card>

            {!params ? (
                <Empty
                    icon={<Calendar size={32} />}
                    title="Pick a date range"
                    description="Select both From and To dates to see the timeline."
                />
            ) : statsQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-3" />
                    <Skeleton className="h-40 w-full" />
                </Card>
            ) : statsQuery.isError || !statsQuery.data ? (
                <Empty
                    icon={<Calendar size={32} />}
                    title="Could not load stats"
                    description="Try a smaller window or refresh."
                />
            ) : (
                <StatsBody data={statsQuery.data} />
            )}
        </div>
    )
}

const StatsBody = ({ data }: { data: StatsTimelineResponse }) => {
    const { totals, series } = data
    const conversionPct = totals.signups > 0 ? Math.round((totals.converted / totals.signups) * 100) : 0
    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Signups"
                    value={totals.signups.toLocaleString()}
                    delta={`${totals.converted} converted · ${totals.lost} lost`}
                    icon={<UserPlus size={18} />}
                    accent="brand"
                />
                <StatCard
                    label="Enrolments"
                    value={totals.enrolments.toLocaleString()}
                    delta={`${conversionPct}% conversion`}
                    icon={<TrendingUp size={18} />}
                    accent="purple"
                />
                <StatCard
                    label="Revenue collected"
                    value={fmtPaiseINR(totals.revenue)}
                    delta={`${data.granularity} granularity`}
                    icon={<IndianRupee size={18} />}
                    accent="teal"
                />
                <StatCard
                    label="Period"
                    value={`${formatRange(data.from)} → ${formatRange(data.to)}`}
                    delta={`${series.length} buckets`}
                    icon={<Calendar size={18} />}
                    accent="orange"
                />
            </div>

            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-fg">Activity timeline</h3>
                    <div className="flex items-center gap-3 text-[11px] text-fg-muted">
                        <LegendDot color="var(--color-brand-500)" label="Signups" />
                        <LegendDot color="var(--color-purple-500,#8b5cf6)" label="Enrolments" />
                        <LegendDot color="var(--color-success,#10b981)" label="Revenue" />
                    </div>
                </div>
                <BarChart series={series} />
            </Card>
        </>
    )
}

const LegendDot = ({ color, label }: { color: string; label: string }) => (
    <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
    </span>
)

const formatRange = (iso: string): string => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

// Tiny three-series bar chart. Each bucket shows three stacked-side-by-side
// bars (signups / enrolments / revenue) so trend lines stay readable even
// without a charting library. Revenue is scaled into its own axis to share
// the same height with count series.
const BarChart = ({ series }: { series: TimelineBucket[] }) => {
    if (series.length === 0) {
        return <div className="text-sm text-fg-muted text-center py-8">No activity in this window.</div>
    }
    const maxCount = Math.max(1, ...series.map((s) => Math.max(s.signups, s.enrolments)))
    const maxRevenue = Math.max(1, ...series.map((s) => s.revenue))

    const W = 100
    const H = 100
    const groupW = W / series.length
    const barW = groupW / 3.5

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H + 18}`} preserveAspectRatio="none" className="w-full" style={{ minHeight: 220 }}>
                {/* Bars */}
                {series.map((b, i) => {
                    const x = i * groupW
                    const signupsH = (b.signups / maxCount) * H
                    const enrolH = (b.enrolments / maxCount) * H
                    const revH = (b.revenue / maxRevenue) * H
                    return (
                        <g key={b.bucket}>
                            <rect x={x + barW * 0.2} y={H - signupsH} width={barW} height={signupsH} fill="var(--color-brand-500)" rx={0.4} />
                            <rect x={x + barW * 1.4} y={H - enrolH} width={barW} height={enrolH} fill="var(--color-purple-500,#8b5cf6)" rx={0.4} />
                            <rect x={x + barW * 2.6} y={H - revH} width={barW} height={revH} fill="var(--color-success,#10b981)" rx={0.4} opacity={0.85} />
                            <title>
                                {`${b.label} · ${b.signups} signups · ${b.enrolments} enrolments · ${(b.revenue / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}`}
                            </title>
                        </g>
                    )
                })}
                {/* X labels — show every nth label so they don't overlap */}
                {series.map((b, i) => {
                    const step = Math.max(1, Math.ceil(series.length / 12))
                    if (i % step !== 0) return null
                    return (
                        <text
                            key={`label-${b.bucket}`}
                            x={i * groupW + groupW / 2}
                            y={H + 14}
                            fontSize={3.5}
                            textAnchor="middle"
                            fill="currentColor"
                            opacity={0.5}>
                            {b.label}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}
