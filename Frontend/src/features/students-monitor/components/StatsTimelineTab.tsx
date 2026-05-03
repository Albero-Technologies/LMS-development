import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, IndianRupee, TrendingUp, UserPlus, Target, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { getStatsTimeline, listTeamBuckets, type StatsTimelineResponse, type StatsWindow, type TimelineBucket } from '../services/studentsMonitor.service'

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

// Stats / charts tab — three plots:
//   1. Activity timeline (signups + enrolments + revenue, time-bucketed)
//   2. Period-over-period sales comparison (current window vs previous)
//   3. Target vs Achieved per counsellor (from team-buckets endpoint)
// Charts are drawn with a tiny custom SVG renderer so we don't need to
// bring in recharts; the data-shape is small (≤ ~60 buckets / ≤ ~20 reps).

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

    // Previous-period comparison — same length, immediately before current.
    const compareParams = useMemo(() => {
        if (!params || !params.from || !params.to) {
            // Preset windows: we let backend resolve "previous" by passing an
            // explicit date pair. Use the same length as the preset.
            const lengths: Partial<Record<StatsWindow, number>> = {
                hour: 60 * 60 * 1000,
                day: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000,
                year: 365 * 24 * 60 * 60 * 1000
            }
            const len = lengths[(params?.window ?? 'month') as StatsWindow]
            if (!len) return null
            const now = Date.now()
            return {
                window: 'custom' as StatsWindow,
                from: new Date(now - 2 * len).toISOString(),
                to: new Date(now - len).toISOString()
            }
        }
        const fromMs = new Date(params.from).getTime()
        const toMs = new Date(params.to).getTime()
        if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return null
        const len = toMs - fromMs
        return {
            window: 'custom' as StatsWindow,
            from: new Date(fromMs - len).toISOString(),
            to: new Date(fromMs).toISOString()
        }
    }, [params])

    const statsQuery = useQuery({
        queryKey: ['students-monitor', 'stats', { tenantSlug, params }],
        queryFn: () => {
            if (!params) throw new Error('Invalid range')
            return getStatsTimeline({ ...params, tenantSlug })
        },
        enabled: !!params,
        staleTime: 60_000
    })

    const compareQuery = useQuery({
        queryKey: ['students-monitor', 'stats', 'compare', { tenantSlug, compareParams }],
        queryFn: () => {
            if (!compareParams) throw new Error('Invalid range')
            return getStatsTimeline({ ...compareParams, tenantSlug })
        },
        enabled: !!compareParams,
        staleTime: 60_000
    })

    const teamsQuery = useQuery({
        queryKey: ['students-monitor', 'team-buckets', 'targets', { tenantSlug }],
        queryFn: () => listTeamBuckets({ tenantSlug }),
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
                    <Button size="sm" variant={preset === 'year-pick' ? 'primary' : 'ghost'} onClick={() => setPreset('year-pick')}>
                        Year
                    </Button>
                    <Button size="sm" variant={preset === 'custom' ? 'primary' : 'ghost'} onClick={() => setPreset('custom')}>
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
                            <Input type="date" aria-label="From" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                            <span className="text-fg-muted text-xs">to</span>
                            <Input type="date" aria-label="To" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                        </div>
                    )}
                </div>
            </Card>

            {!params ? (
                <Empty icon={<Calendar size={32} />} title="Pick a date range" description="Select both From and To dates to see the timeline." />
            ) : statsQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-3" />
                    <Skeleton className="h-40 w-full" />
                </Card>
            ) : statsQuery.isError || !statsQuery.data ? (
                <Empty icon={<Calendar size={32} />} title="Could not load stats" description="Try a smaller window or refresh." />
            ) : (
                <>
                    <KpiStrip current={statsQuery.data} previous={compareQuery.data ?? null} />
                    <Card>
                        <SectionHeader title="Activity timeline" subtitle="Signups, enrolments, and revenue per bucket — hover a bar for the exact numbers." />
                        <TimelineChart series={statsQuery.data.series} />
                    </Card>
                    <Card>
                        <SectionHeader title="Period over period" subtitle="Current window compared with the same length immediately before. Use this to spot week-on-week or month-on-month swings." />
                        <ComparisonChart current={statsQuery.data} previous={compareQuery.data ?? null} />
                    </Card>
                    <Card>
                        <SectionHeader title="Target vs achieved" subtitle="Per-counsellor revenue share against their bucket totals. The target is the sum of paid + pending fees; achieved is the paid amount." />
                        <TargetChart teams={teamsQuery.data ?? null} loading={teamsQuery.isLoading} />
                    </Card>
                </>
            )}
        </div>
    )
}

// ---------- Headline KPI strip --------------------------------------------

const KpiStrip = ({ current, previous }: { current: StatsTimelineResponse; previous: StatsTimelineResponse | null }) => {
    const tiles: { label: string; value: string; prevValue?: number; curValue: number; icon: React.ReactNode; accent: string }[] = [
        {
            label: 'Signups',
            value: current.totals.signups.toLocaleString(),
            curValue: current.totals.signups,
            prevValue: previous?.totals.signups,
            icon: <UserPlus size={16} />,
            accent: 'bg-[var(--color-brand-500)]'
        },
        {
            label: 'Enrolments',
            value: current.totals.enrolments.toLocaleString(),
            curValue: current.totals.enrolments,
            prevValue: previous?.totals.enrolments,
            icon: <TrendingUp size={16} />,
            accent: 'bg-[var(--color-purple-500,#8b5cf6)]'
        },
        {
            label: 'Revenue',
            value: fmtPaiseINR(current.totals.revenue),
            curValue: current.totals.revenue,
            prevValue: previous?.totals.revenue,
            icon: <IndianRupee size={16} />,
            accent: 'bg-[var(--color-success,#10b981)]'
        },
        {
            label: 'Conversion',
            value: current.totals.signups > 0 ? `${Math.round((current.totals.converted / current.totals.signups) * 100)}%` : '—',
            curValue: current.totals.signups > 0 ? (current.totals.converted / current.totals.signups) * 100 : 0,
            prevValue: previous && previous.totals.signups > 0 ? (previous.totals.converted / previous.totals.signups) * 100 : undefined,
            icon: <Target size={16} />,
            accent: 'bg-[var(--color-warn,#f59e0b)]'
        }
    ]
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tiles.map((t) => (
                <Card key={t.label} className="!p-4 relative overflow-hidden">
                    <span className={`absolute inset-y-0 left-0 w-1 ${t.accent}`} aria-hidden />
                    <div className="flex items-start justify-between gap-3 pl-2">
                        <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-wide text-fg-muted">{t.label}</div>
                            <div className="mt-1 text-2xl font-bold text-fg font-mono leading-tight">{t.value}</div>
                            <DeltaBadge current={t.curValue} previous={t.prevValue} />
                        </div>
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-surface-2 text-fg-soft flex items-center justify-center">
                            {t.icon}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

const DeltaBadge = ({ current, previous }: { current: number; previous?: number }) => {
    if (previous === undefined) return null
    if (previous === 0 && current === 0) {
        return <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-fg-muted"><Minus size={11} /> flat</span>
    }
    if (previous === 0) {
        return <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--color-success,#10b981)]"><ArrowUpRight size={11} /> new</span>
    }
    const delta = ((current - previous) / previous) * 100
    const up = delta >= 0
    return (
        <span
            className={`mt-1 inline-flex items-center gap-1 text-[11px] ${up ? 'text-[var(--color-success,#10b981)]' : 'text-[var(--color-danger,#ef4444)]'}`}>
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(Math.round(delta))}% vs prev
        </span>
    )
}

// ---------- Section header ------------------------------------------------

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        {subtitle && <p className="text-xs text-fg-muted mt-0.5">{subtitle}</p>}
    </div>
)

// ---------- Timeline chart ------------------------------------------------

// Three-series line/bar chart drawn in HTML+CSS so it's responsive without
// fiddly viewBox math. Each bucket renders three vertical bars; revenue
// is normalised to its own max so the height ratio stays readable.
const TimelineChart = ({ series }: { series: TimelineBucket[] }) => {
    if (series.length === 0) {
        return <div className="text-sm text-fg-muted text-center py-8">No activity in this window.</div>
    }
    const maxCount = Math.max(1, ...series.map((s) => Math.max(s.signups, s.enrolments)))
    const maxRevenue = Math.max(1, ...series.map((s) => s.revenue))

    // Show every Nth label so they don't overlap.
    const labelEvery = Math.max(1, Math.ceil(series.length / 12))

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-end gap-4 text-[11px] text-fg-muted">
                <Legend color="var(--color-brand-500)" label="Signups" />
                <Legend color="var(--color-purple-500,#8b5cf6)" label="Enrolments" />
                <Legend color="var(--color-success,#10b981)" label="Revenue" />
            </div>
            <div className="relative h-56 border-l border-b border-line">
                {/* Y-axis grid lines */}
                {[0.25, 0.5, 0.75, 1].map((p) => (
                    <div
                        key={p}
                        aria-hidden
                        className="absolute left-0 right-0 border-t border-dashed border-line/60"
                        style={{ bottom: `${p * 100}%` }}
                    />
                ))}
                <div className="absolute inset-0 flex items-end gap-px">
                    {series.map((b) => (
                        <div
                            key={b.bucket}
                            className="flex-1 flex items-end justify-center gap-[2px] h-full group relative"
                            title={`${b.label} · ${b.signups} signups · ${b.enrolments} enrolments · ${fmtPaiseINR(b.revenue)}`}>
                            <Bar height={(b.signups / maxCount) * 100} color="var(--color-brand-500)" />
                            <Bar height={(b.enrolments / maxCount) * 100} color="var(--color-purple-500,#8b5cf6)" />
                            <Bar height={(b.revenue / maxRevenue) * 100} color="var(--color-success,#10b981)" />
                            <div
                                aria-hidden
                                className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-fg text-bg text-[10px] font-mono whitespace-nowrap pointer-events-none z-10">
                                {b.label}: {b.signups}↑ {b.enrolments}● {fmtPaiseINR(b.revenue)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-end gap-px text-[10px] text-fg-muted">
                {series.map((b, i) => (
                    <div key={b.bucket} className="flex-1 text-center truncate">
                        {i % labelEvery === 0 ? b.label : ''}
                    </div>
                ))}
            </div>
        </div>
    )
}

const Bar = ({ height, color }: { height: number; color: string }) => (
    <span
        className="flex-1 max-w-[8px] rounded-t-sm transition-all"
        style={{ height: `${Math.max(2, height)}%`, background: color }}
    />
)

const Legend = ({ color, label }: { color: string; label: string }) => (
    <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
    </span>
)

// ---------- Period-over-period comparison chart ---------------------------

const ComparisonChart = ({ current, previous }: { current: StatsTimelineResponse; previous: StatsTimelineResponse | null }) => {
    if (!previous) {
        return <div className="text-sm text-fg-muted text-center py-6">Comparison loading…</div>
    }
    const rows = [
        { label: 'Signups', cur: current.totals.signups, prev: previous.totals.signups, fmt: (n: number) => n.toLocaleString() },
        { label: 'Enrolments', cur: current.totals.enrolments, prev: previous.totals.enrolments, fmt: (n: number) => n.toLocaleString() },
        { label: 'Revenue', cur: current.totals.revenue, prev: previous.totals.revenue, fmt: fmtPaiseINR },
        { label: 'Converted', cur: current.totals.converted, prev: previous.totals.converted, fmt: (n: number) => n.toLocaleString() },
        { label: 'Lost', cur: current.totals.lost, prev: previous.totals.lost, fmt: (n: number) => n.toLocaleString() }
    ]
    return (
        <div className="space-y-3">
            {rows.map((r) => {
                const max = Math.max(1, r.cur, r.prev)
                return (
                    <div key={r.label} className="grid grid-cols-[120px_1fr_120px] items-center gap-3">
                        <span className="text-xs text-fg-soft">{r.label}</span>
                        <div className="space-y-1">
                            <BarRow label="Now" value={r.cur} max={max} color="var(--color-brand-500)" fmt={r.fmt} />
                            <BarRow label="Prev" value={r.prev} max={max} color="rgba(100, 116, 139, 0.6)" fmt={r.fmt} />
                        </div>
                        <Delta cur={r.cur} prev={r.prev} />
                    </div>
                )
            })}
        </div>
    )
}

const BarRow = ({ label, value, max, color, fmt }: { label: string; value: number; max: number; color: string; fmt: (n: number) => string }) => (
    <div className="flex items-center gap-2">
        <span className="text-[10px] text-fg-muted w-8">{label}</span>
        <div className="flex-1 h-4 bg-surface-2 rounded-sm overflow-hidden relative">
            <span className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${(value / max) * 100}%`, background: color }} />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-mono text-fg-soft">{fmt(value)}</span>
        </div>
    </div>
)

const Delta = ({ cur, prev }: { cur: number; prev: number }) => {
    if (prev === 0 && cur === 0) {
        return <span className="text-[11px] text-fg-muted inline-flex items-center gap-1"><Minus size={11} /> flat</span>
    }
    if (prev === 0) {
        return <span className="text-[11px] text-[var(--color-success,#10b981)] inline-flex items-center gap-1"><ArrowUpRight size={11} /> new</span>
    }
    const delta = ((cur - prev) / prev) * 100
    const up = delta >= 0
    return (
        <span className={`text-[11px] inline-flex items-center gap-1 ${up ? 'text-[var(--color-success,#10b981)]' : 'text-[var(--color-danger,#ef4444)]'}`}>
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(Math.round(delta))}%
        </span>
    )
}

// ---------- Target vs achieved (per counsellor) ---------------------------

interface TeamsLite {
    buckets: { manager: { id: string; name: string } | null; counsellors: { id: string; name: string; revenuePaid: number; revenuePending: number; studentsCount: number }[] }[]
}

const TargetChart = ({ teams, loading }: { teams: TeamsLite | null; loading: boolean }) => {
    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        )
    }
    if (!teams) return null

    // Flatten all counsellors across managers, then drop those with zero
    // activity. Sort by total revenue (paid + pending) descending so the
    // biggest contributors land at the top.
    const counsellors = teams.buckets
        .flatMap((b) => b.counsellors.map((c) => ({ ...c, manager: b.manager?.name ?? '—' })))
        .filter((c) => c.studentsCount > 0 || c.revenuePaid > 0 || c.revenuePending > 0)
        .sort((a, b) => b.revenuePaid + b.revenuePending - (a.revenuePaid + a.revenuePending))
        .slice(0, 12)

    if (counsellors.length === 0) {
        return <div className="text-sm text-fg-muted text-center py-6">No team data yet — add counsellors and assign students.</div>
    }

    const maxValue = Math.max(1, ...counsellors.map((c) => c.revenuePaid + c.revenuePending))

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-end gap-4 text-[11px] text-fg-muted">
                <Legend color="var(--color-success,#10b981)" label="Achieved (paid)" />
                <Legend color="rgba(100, 116, 139, 0.4)" label="Target (paid + pending)" />
            </div>
            {counsellors.map((c) => {
                const target = c.revenuePaid + c.revenuePending
                const pct = target > 0 ? Math.round((c.revenuePaid / target) * 100) : 0
                return (
                    <div key={c.id} className="grid grid-cols-[160px_1fr_60px] items-center gap-3">
                        <div className="min-w-0">
                            <div className="text-xs font-medium text-fg truncate">{c.name}</div>
                            <div className="text-[10px] text-fg-muted truncate">{c.manager} · {c.studentsCount} students</div>
                        </div>
                        <div className="relative h-5 bg-surface-2 rounded-sm overflow-hidden">
                            <span
                                className="absolute inset-y-0 left-0 rounded-sm"
                                style={{ width: `${(target / maxValue) * 100}%`, background: 'rgba(100, 116, 139, 0.4)' }}
                            />
                            <span
                                className="absolute inset-y-0 left-0 rounded-sm"
                                style={{ width: `${(c.revenuePaid / maxValue) * 100}%`, background: 'var(--color-success,#10b981)' }}
                            />
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-mono text-fg">
                                {fmtPaiseINR(c.revenuePaid)} / {fmtPaiseINR(target)}
                            </span>
                        </div>
                        <span className="text-xs font-mono text-fg-soft text-right">{pct}%</span>
                    </div>
                )
            })}
        </div>
    )
}
