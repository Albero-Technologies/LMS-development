import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, GraduationCap, ArrowRight, Activity, IndianRupee, AlertCircle } from 'lucide-react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Tabs, type TabDef } from '@shared/components/ui/Tabs'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Button } from '@shared/components/ui/Button'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { listAllTenants } from '@features/admin/services/tenant.service'
import { UserDetailModal } from '@features/users/components/UserDetailModal'
import {
    CATEGORY_LABELS,
    CATEGORY_TONE,
    STUDENT_CATEGORIES,
    listMonitorStudents,
    type StudentCategory
} from '../services/studentsMonitor.service'
import { TeamBucketsTab } from '../components/TeamBucketsTab'
import { StatsTimelineTab } from '../components/StatsTimelineTab'
import { PaymentRequestsTab } from '../components/PaymentRequestsTab'

const fmtDateShort = (iso: string | null): string => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

type TabValue = 'students' | 'teams' | 'stats' | 'payments'

const TABS: readonly TabDef<TabValue>[] = [
    { value: 'students', label: 'Students' },
    { value: 'teams', label: 'Teams' },
    { value: 'stats', label: 'Charts' },
    { value: 'payments', label: 'Payments' }
] as const

// Sales Funnel — single page, four tabs. Each tab is its own component so
// the page itself stays focused on shell concerns (role, tenant filter).
// Renamed from "Students Monitor" because the surface covers more than just
// students: payment requests, team rollups, and timeline charts all live
// here too.
export const SalesFunnelPage = () => {
    const role = useAuthStore((s) => s.user?.role)
    const isSuperAdmin = role === ROLES.SUPER_ADMIN

    const [tab, setTab] = useState<TabValue>('students')
    const [tenantSlug, setTenantSlug] = useState<string>('__all__')

    const tenantOptionsQuery = useQuery({
        queryKey: ['admin', 'tenants', 'minimal'],
        queryFn: listAllTenants,
        enabled: isSuperAdmin,
        staleTime: 5 * 60_000
    })

    const tenantSlugForApi = isSuperAdmin && tenantSlug !== '__all__' ? tenantSlug : isSuperAdmin ? '__all__' : undefined

    return (
        <>
            <PageHeader
                eyebrow="Sales console"
                title="Sales Funnel"
                description="Watch every prospect, student, and counsellor in one place — categorised, attributed, and trended."
                actions={
                    isSuperAdmin && (
                        <div className="w-60">
                            <Select
                                aria-label="Tenant filter"
                                value={tenantSlug}
                                onChange={(e) => setTenantSlug(e.target.value)}>
                                <option value="__all__">All tenants</option>
                                {tenantOptionsQuery.data?.map((t) => (
                                    <option key={t.id} value={t.slug}>
                                        {t.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    )
                }
            />

            <Tabs<TabValue> tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

            {tab === 'students' && <StudentsTab tenantSlug={tenantSlugForApi} />}
            {tab === 'teams' && <TeamBucketsTab tenantSlug={tenantSlugForApi} />}
            {tab === 'stats' && <StatsTimelineTab tenantSlug={tenantSlugForApi} />}
            {tab === 'payments' && <PaymentRequestsTab tenantSlug={tenantSlugForApi} />}
        </>
    )
}

// ---------- Students tab ---------------------------------------------------

const StudentsTab = ({ tenantSlug }: { tenantSlug?: string }) => {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<StudentCategory | 'ALL'>('ALL')
    const [page, setPage] = useState(1)
    const pageSize = 25
    const [openId, setOpenId] = useState<string | null>(null)

    const studentsQuery = useQuery({
        queryKey: ['students-monitor', 'list', { tenantSlug, search, category, page }],
        queryFn: () =>
            listMonitorStudents({
                page,
                pageSize,
                q: search || undefined,
                category: category === 'ALL' ? undefined : category,
                tenantSlug
            }),
        staleTime: 30_000,
        placeholderData: (prev) => prev
    })

    const data = studentsQuery.data
    const items = data?.items ?? []
    const totals = data?.totals
    const allTotal = useMemo(() => {
        if (!totals) return 0
        // Don't double-count overlapping flags. The funnel-headline tile is
        // really "rows scanned" — fall back to scanned when present.
        return data?.scanned ?? totals.ACTIVE + totals.INACTIVE + totals.DEAD
    }, [totals, data])

    const conversionRate = useMemo(() => {
        if (!totals) return 0
        const denom = (totals.ACTIVE ?? 0) + (totals.INACTIVE ?? 0) + (totals.FEES_PAID ?? 0)
        if (!denom) return 0
        return Math.round(((totals.FEES_PAID ?? 0) / denom) * 100)
    }, [totals])

    return (
        <>
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <KpiTile
                    label="In funnel"
                    value={allTotal.toLocaleString()}
                    sub="across all stages"
                    icon={<GraduationCap size={16} />}
                    accent="brand"
                />
                <KpiTile
                    label="Active"
                    value={(totals?.ACTIVE ?? 0).toLocaleString()}
                    sub={`${totals?.INACTIVE ?? 0} dormant`}
                    icon={<Activity size={16} />}
                    accent="brand"
                />
                <KpiTile
                    label="Fees pending"
                    value={(totals?.FEES_PENDING ?? 0).toLocaleString()}
                    sub={`${totals?.FOLLOW_UP ?? 0} follow-ups`}
                    icon={<AlertCircle size={16} />}
                    accent="warn"
                />
                <KpiTile
                    label="Conversion"
                    value={`${conversionRate}%`}
                    sub={`${totals?.FEES_PAID ?? 0} paid · ${totals?.DEAD ?? 0} dead`}
                    icon={<IndianRupee size={16} />}
                    accent="ok"
                />
            </div>

            {/* Category chips — one row, scroll-x on small screens */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <CategoryChip
                    label="All"
                    count={allTotal}
                    active={category === 'ALL'}
                    onClick={() => {
                        setCategory('ALL')
                        setPage(1)
                    }}
                />
                {STUDENT_CATEGORIES.map((c) => (
                    <CategoryChip
                        key={c}
                        label={CATEGORY_LABELS[c]}
                        count={totals?.[c] ?? 0}
                        active={category === c}
                        tone={CATEGORY_TONE[c]}
                        onClick={() => {
                            setCategory(c)
                            setPage(1)
                        }}
                    />
                ))}
            </div>

            <Card padded={false}>
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Search by name, email, phone"
                            leftIcon={<Search size={14} />}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(1)
                            }}
                            aria-label="Search students"
                        />
                    </div>
                    <span className="text-xs text-fg-muted">
                        {data ? `${data.total.toLocaleString()} ${data.total === 1 ? 'student' : 'students'}` : '—'}
                    </span>
                </div>

                {studentsQuery.isLoading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                ) : items.length === 0 ? (
                    <Empty
                        icon={<GraduationCap size={32} />}
                        title="No students"
                        description="Adjust the chips, search, or invite some leads."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wide text-fg-muted bg-surface-2">
                                    <th className="py-2.5 px-5 font-semibold">Student</th>
                                    {tenantSlug === '__all__' && <th className="py-2.5 px-5 font-semibold">Tenant</th>}
                                    <th className="py-2.5 px-5 font-semibold">Stage</th>
                                    <th className="py-2.5 px-5 font-semibold">Counsellor / Trainer</th>
                                    <th className="py-2.5 px-5 font-semibold">Course</th>
                                    <th className="py-2.5 px-5 font-semibold text-right">Fees</th>
                                    <th className="py-2.5 px-5 font-semibold text-right">Last seen</th>
                                    <th className="py-2.5 px-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hover:bg-surface-hover cursor-pointer"
                                        onClick={(e) => {
                                            if ((e.target as HTMLElement).closest('button')) return
                                            setOpenId(s.id)
                                        }}>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[var(--color-brand-500)] text-white text-xs flex items-center justify-center font-semibold">
                                                    {s.name[0]?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-fg font-medium truncate">{s.name}</div>
                                                    <div className="text-xs text-fg-muted truncate">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {tenantSlug === '__all__' && (
                                            <td className="py-3 px-5 text-xs text-fg-soft truncate">{s.tenant.name}</td>
                                        )}
                                        <td className="py-3 px-5">
                                            <Badge tone={CATEGORY_TONE[s.primaryCategory]}>{CATEGORY_LABELS[s.primaryCategory]}</Badge>
                                            <FlagDots flags={s.flags} primary={s.primaryCategory} />
                                        </td>
                                        <td className="py-3 px-5 text-xs">
                                            {s.counsellor ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)]" aria-hidden />
                                                    <span className="text-fg font-medium truncate">{s.counsellor.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-fg-muted">No counsellor</span>
                                            )}
                                            {s.trainer ? (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="inline-flex w-1.5 h-1.5 rounded-full bg-[var(--color-purple-500,#8b5cf6)]" aria-hidden />
                                                    <span className="text-fg-soft truncate">{s.trainer.name}</span>
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="py-3 px-5 text-xs">
                                            {s.enrollments.length === 0 ? (
                                                <span className="text-fg-muted">No enrolment</span>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    {s.enrollments.slice(0, 1).map((e) => (
                                                        <div key={e.id} className="flex items-center gap-2">
                                                            <span className="text-fg truncate">{e.course?.title ?? 'Course'}</span>
                                                            <ProgressPill pct={e.progressPct} />
                                                        </div>
                                                    ))}
                                                    {s.enrollments.length > 1 && (
                                                        <span className="text-fg-muted">+{s.enrollments.length - 1} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-right">
                                            <div className="text-fg font-mono font-medium">{fmtPaiseINR(s.payments.totalPaid)}</div>
                                            {s.payments.pendingAmount > 0 && (
                                                <div className="text-[var(--color-warn)] font-mono">
                                                    {fmtPaiseINR(s.payments.pendingAmount)} due
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg-muted text-right">{fmtDateShort(s.lastLoginAt)}</td>
                                        <td className="py-3 px-5 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                rightIcon={<ArrowRight size={12} />}
                                                onClick={() => setOpenId(s.id)}>
                                                Open
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data && data.total > pageSize && (
                    <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-fg-muted">
                        <span>
                            Page {data.page} · showing {items.length} of {data.total}
                        </span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" disabled={data.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                Previous
                            </Button>
                            <Button size="sm" variant="ghost" disabled={items.length < pageSize} onClick={() => setPage((p) => p + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <UserDetailModal open={!!openId} userId={openId} canEdit onClose={() => setOpenId(null)} />
        </>
    )
}

// ---------- Small UI primitives -------------------------------------------

type Tone = 'brand' | 'ok' | 'warn' | 'danger' | 'purple' | 'default'

const TONE_RING: Record<Tone, string> = {
    brand: 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white',
    ok: 'border-[var(--color-success,#10b981)] bg-[var(--color-success,#10b981)] text-white',
    danger: 'border-[var(--color-danger,#ef4444)] bg-[var(--color-danger,#ef4444)] text-white',
    warn: 'border-[var(--color-warn,#f59e0b)] bg-[var(--color-warn,#f59e0b)] text-white',
    purple: 'border-[var(--color-purple-500,#8b5cf6)] bg-[var(--color-purple-500,#8b5cf6)] text-white',
    default: 'border-fg-muted bg-fg-muted text-white'
}

const TONE_SOFT: Record<Tone, string> = {
    brand: 'border-[var(--color-brand-500)] text-[var(--color-brand-700)] bg-[var(--color-brand-50,rgba(13,79,60,0.08))]',
    ok: 'border-[var(--color-success,#10b981)] text-[var(--color-success,#10b981)] bg-[rgba(16,185,129,0.08)]',
    danger: 'border-[var(--color-danger,#ef4444)] text-[var(--color-danger,#ef4444)] bg-[rgba(239,68,68,0.08)]',
    warn: 'border-[var(--color-warn,#f59e0b)] text-[var(--color-warn,#f59e0b)] bg-[rgba(245,158,11,0.08)]',
    purple: 'border-[var(--color-purple-500,#8b5cf6)] text-[var(--color-purple-500,#8b5cf6)] bg-[rgba(139,92,246,0.08)]',
    default: 'border-line text-fg-soft bg-surface-2'
}

const CategoryChip = ({
    label,
    count,
    active,
    tone = 'default',
    onClick
}: {
    label: string
    count: number
    active?: boolean
    tone?: Tone
    onClick: () => void
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            active ? TONE_RING[tone] + ' shadow-sm' : TONE_SOFT[tone] + ' hover:translate-y-[-1px]'
        }`}>
        <span>{label}</span>
        <span
            className={`inline-flex items-center justify-center min-w-[20px] h-[18px] rounded-full px-1.5 text-[10px] font-bold ${
                active ? 'bg-white/30 text-white' : 'bg-white/60 text-fg'
            }`}>
            {count}
        </span>
    </button>
)

const KpiTile = ({
    label,
    value,
    sub,
    icon,
    accent
}: {
    label: string
    value: string | number
    sub?: string
    icon?: React.ReactNode
    accent: Tone
}) => {
    const accentStyle: Record<Tone, string> = {
        brand: 'bg-[var(--color-brand-500)]',
        ok: 'bg-[var(--color-success,#10b981)]',
        danger: 'bg-[var(--color-danger,#ef4444)]',
        warn: 'bg-[var(--color-warn,#f59e0b)]',
        purple: 'bg-[var(--color-purple-500,#8b5cf6)]',
        default: 'bg-fg-muted'
    }
    return (
        <Card className="!p-4 relative overflow-hidden">
            <span className={`absolute inset-y-0 left-0 w-1 ${accentStyle[accent]}`} aria-hidden />
            <div className="flex items-start justify-between gap-3 pl-2">
                <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</div>
                    <div className="mt-1 text-2xl font-bold text-fg font-mono leading-tight">{value}</div>
                    {sub && <div className="mt-0.5 text-[11px] text-fg-muted">{sub}</div>}
                </div>
                {icon && <div className="shrink-0 w-8 h-8 rounded-lg bg-surface-2 text-fg-soft flex items-center justify-center">{icon}</div>}
            </div>
        </Card>
    )
}

const ProgressPill = ({ pct }: { pct: number }) => {
    const safe = Math.max(0, Math.min(100, pct))
    return (
        <span className="inline-flex items-center gap-1 text-[10px] text-fg-muted font-mono">
            <span className="w-12 h-1 rounded-full bg-surface-2 overflow-hidden">
                <span className="block h-full bg-[var(--color-brand-500)]" style={{ width: `${safe}%` }} />
            </span>
            {safe}%
        </span>
    )
}

const FlagDots = ({ flags, primary }: { flags: Record<StudentCategory, boolean>; primary: StudentCategory }) => {
    const extras = STUDENT_CATEGORIES.filter((c) => flags[c] && c !== primary)
    if (extras.length === 0) return null
    return (
        <div className="mt-1 flex flex-wrap gap-1">
            {extras.map((c) => (
                <span key={c} className="text-[10px] text-fg-muted">
                    +{CATEGORY_LABELS[c].toLowerCase()}
                </span>
            ))}
        </div>
    )
}

