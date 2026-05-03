import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, GraduationCap, Users, LineChart, ArrowRight } from 'lucide-react'
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

const fmtDateShort = (iso: string | null): string => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

type TabValue = 'students' | 'teams' | 'stats'

const TABS: readonly TabDef<TabValue>[] = [
    { value: 'students', label: 'Students' },
    { value: 'teams', label: 'Team Buckets' },
    { value: 'stats', label: 'Stats & Charts' }
] as const

export const StudentsMonitorPage = () => {
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
                eyebrow="Sales monitoring"
                title="Students"
                description="Track every student in your funnel — paid, pending, follow-up, or dead. Drill into team buckets and timelines from the tabs."
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

            <Tabs<TabValue>
                tabs={TABS}
                value={tab}
                onChange={setTab}
                className="mb-5"
            />

            {tab === 'students' && <StudentsTab tenantSlug={tenantSlugForApi} />}
            {tab === 'teams' && <TeamBucketsTab tenantSlug={tenantSlugForApi} />}
            {tab === 'stats' && <StatsTimelineTab tenantSlug={tenantSlugForApi} />}
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
        staleTime: 30_000
    })

    const data = studentsQuery.data
    const items = data?.items ?? []
    const totals = data?.totals
    const allTotal = useMemo(() => (totals ? Object.values(totals).reduce((n, v) => n + v, 0) : 0), [totals])

    return (
        <>
            {/* KPI tiles per category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                <CategoryTile
                    label="All"
                    value={allTotal}
                    active={category === 'ALL'}
                    onClick={() => {
                        setCategory('ALL')
                        setPage(1)
                    }}
                />
                {STUDENT_CATEGORIES.map((c) => (
                    <CategoryTile
                        key={c}
                        label={CATEGORY_LABELS[c]}
                        value={totals?.[c] ?? 0}
                        active={category === c}
                        tone={CATEGORY_TONE[c]}
                        onClick={() => {
                            setCategory(c)
                            setPage(1)
                        }}
                    />
                ))}
            </div>

            {/* Search + table */}
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
                        description="Adjust the filters or invite some leads."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted bg-surface-2">
                                    <th className="py-3 px-5">Student</th>
                                    {tenantSlug === '__all__' && <th className="py-3 px-5">Tenant</th>}
                                    <th className="py-3 px-5">Category</th>
                                    <th className="py-3 px-5">Counsellor</th>
                                    <th className="py-3 px-5">Trainer</th>
                                    <th className="py-3 px-5">Courses</th>
                                    <th className="py-3 px-5">Fees</th>
                                    <th className="py-3 px-5">Last login</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
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
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] text-white text-xs flex items-center justify-center font-semibold">
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
                                            <FlagDots flags={s.flags} />
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg">
                                            {s.counsellor ? (
                                                <>
                                                    <div className="font-medium">{s.counsellor.name}</div>
                                                    <div className="text-fg-muted truncate">{s.counsellor.email}</div>
                                                </>
                                            ) : (
                                                <span className="text-fg-muted">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg">
                                            {s.trainer ? (
                                                <>
                                                    <div className="font-medium">{s.trainer.name}</div>
                                                    <div className="text-fg-muted truncate">{s.trainer.email}</div>
                                                </>
                                            ) : (
                                                <span className="text-fg-muted">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-xs">
                                            {s.enrollments.length === 0 ? (
                                                <span className="text-fg-muted">—</span>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    {s.enrollments.slice(0, 2).map((e) => (
                                                        <span key={e.id} className="text-fg truncate">
                                                            {e.course?.title ?? 'Course'} · {e.progressPct}%
                                                        </span>
                                                    ))}
                                                    {s.enrollments.length > 2 && (
                                                        <span className="text-fg-muted">+{s.enrollments.length - 2}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-xs">
                                            <div className="text-fg font-medium">{fmtPaiseINR(s.payments.totalPaid)}</div>
                                            {s.payments.pendingAmount > 0 && (
                                                <div className="text-[var(--color-danger)]">
                                                    {fmtPaiseINR(s.payments.pendingAmount)} due
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDateShort(s.lastLoginAt)}</td>
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
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={data.page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={items.length < pageSize}
                                onClick={() => setPage((p) => p + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <UserDetailModal
                open={!!openId}
                userId={openId}
                canEdit
                onClose={() => setOpenId(null)}
            />
        </>
    )
}

const FlagDots = ({ flags }: { flags: Record<StudentCategory, boolean> }) => {
    const active = STUDENT_CATEGORIES.filter((c) => flags[c])
    if (active.length <= 1) return null
    return (
        <div className="mt-1 flex flex-wrap gap-1">
            {active.map((c) => (
                <span key={c} className="text-[10px] text-fg-muted">
                    · {CATEGORY_LABELS[c]}
                </span>
            ))}
        </div>
    )
}

type Tone = 'brand' | 'ok' | 'warn' | 'danger' | 'purple' | 'default'

const TONE_BG: Record<Tone, string> = {
    brand: 'bg-[var(--color-brand-500)] text-white',
    ok: 'bg-[var(--color-success-soft,rgba(16,185,129,0.16))] text-[var(--color-success,#10b981)]',
    danger: 'bg-[var(--color-danger-soft,rgba(239,68,68,0.16))] text-[var(--color-danger,#ef4444)]',
    warn: 'bg-[var(--color-warn-soft,rgba(245,158,11,0.16))] text-[var(--color-warn,#f59e0b)]',
    purple: 'bg-[var(--color-purple-soft,rgba(139,92,246,0.16))] text-[var(--color-purple,#8b5cf6)]',
    default: 'bg-surface-2 text-fg'
}

const CategoryTile = ({
    label,
    value,
    active,
    tone = 'default',
    onClick
}: {
    label: string
    value: number
    active?: boolean
    tone?: Tone
    onClick: () => void
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-left rounded-lg border p-3 transition-colors ${active ? 'border-[var(--color-brand-500)] ring-1 ring-[var(--color-brand-500)]/40' : 'border-transparent hover:bg-surface-hover'}`}>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</span>
                <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold ${TONE_BG[tone]}`}>
                    {value}
                </span>
            </div>
            <div className="text-2xl font-semibold text-fg">{value.toLocaleString()}</div>
        </button>
    )
}

// Re-export the icon constants used by the sidebar so we can keep them in
// sync. Tabs use Users/LineChart at the page level — see TABS above.
export { Users, LineChart, GraduationCap }
