// Admin / counsellor enrollments dashboard. Real-time visibility into who has
// enrolled and paid — refreshes from the backend every 30s and on manual
// refetch. The Razorpay webhook flips PENDING_PAYMENT → ACTIVE on capture, so
// pending rows turn into active rows here without anyone having to do anything.
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Download, Search, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { adminListEnrollments, type EnrollmentStatus } from '@features/courses/services/enrollment.service'

const STATUS_TONE: Record<EnrollmentStatus, 'ok' | 'brand' | 'warn' | 'danger' | 'default'> = {
    ACTIVE: 'brand',
    COMPLETED: 'ok',
    PENDING_PAYMENT: 'warn',
    REFUNDED: 'danger',
    CANCELLED: 'default'
}

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    PENDING_PAYMENT: 'Pending payment',
    REFUNDED: 'Refunded',
    CANCELLED: 'Cancelled'
}

const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fullName = (u: { firstName: string | null; lastName: string | null; email: string } | null): string => {
    if (!u) return 'Unknown'
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
    return name || u.email
}

export const EnrollmentsPage = () => {
    const [q, setQ] = useState('')
    const [statusFilter, setStatusFilter] = useState<'' | EnrollmentStatus>('')

    const enrollmentsQuery = useQuery({
        queryKey: ['admin-enrollments', statusFilter || 'all'],
        queryFn: () => adminListEnrollments(statusFilter ? { status: statusFilter } : undefined),
        // Pull fresh every 30s so payments flowing through the webhook show up
        // without a hard refresh. Refocus also refetches.
        refetchInterval: 30_000,
        staleTime: 15_000
    })
    const rows = enrollmentsQuery.data ?? []

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        if (!needle) return rows
        return rows.filter((r) => {
            const name = fullName(r.user).toLowerCase()
            const email = r.user?.email.toLowerCase() ?? ''
            const courseTitle = r.course?.title.toLowerCase() ?? ''
            return name.includes(needle) || email.includes(needle) || courseTitle.includes(needle)
        })
    }, [rows, q])

    const summary = useMemo(() => {
        const active = rows.filter((r) => r.status === 'ACTIVE').length
        const completed = rows.filter((r) => r.status === 'COMPLETED').length
        const pending = rows.filter((r) => r.status === 'PENDING_PAYMENT').length
        return { total: rows.length, active, completed, pending }
    }, [rows])

    const exportCsv = () => {
        if (filtered.length === 0) {
            toast.error('Nothing to export')
            return
        }
        const header = ['Student', 'Email', 'Course', 'Progress%', 'Status', 'Enrolled', 'Started']
        const body = filtered.map((r) => [
            fullName(r.user),
            r.user?.email ?? '',
            r.course?.title ?? '',
            String(r.progressPct ?? 0),
            STATUS_LABEL[r.status],
            fmtDate(r.createdAt),
            fmtDate(r.startedAt)
        ])
        const csv = [header, ...body].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `enrollments-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Exported ${filtered.length} row${filtered.length === 1 ? '' : 's'}`)
    }

    return (
        <>
            <PageHeader
                eyebrow="Revenue-generating"
                title="Enrollments"
                description="Live view of every student enrollment in your institute. Updates as Razorpay payments are captured."
                actions={
                    <>
                        <div className="w-48 hidden sm:block">
                            <Input
                                placeholder="Search student / course"
                                leftIcon={<Search size={14} />}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search enrollments"
                            />
                        </div>
                        <div className="w-44 hidden sm:block">
                            <Select
                                aria-label="Filter by status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as '' | EnrollmentStatus)}>
                                <option value="">All statuses</option>
                                <option value="PENDING_PAYMENT">Pending payment</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="REFUNDED">Refunded</option>
                                <option value="CANCELLED">Cancelled</option>
                            </Select>
                        </div>
                        <Button
                            size="sm"
                            leftIcon={<Download size={14} />}
                            variant="ghost"
                            onClick={exportCsv}>
                            Export CSV
                        </Button>
                    </>
                }
            />

            <div className="grid sm:grid-cols-4 gap-3 mb-4">
                <SummaryStat
                    label="Total"
                    value={summary.total}
                />
                <SummaryStat
                    label="Active"
                    value={summary.active}
                    tone="brand"
                />
                <SummaryStat
                    label="Completed"
                    value={summary.completed}
                    tone="ok"
                />
                <SummaryStat
                    label="Pending payment"
                    value={summary.pending}
                    tone="warn"
                />
            </div>

            {enrollmentsQuery.isLoading ? (
                <Card padded={false}>
                    <div className="p-5 space-y-2">
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-10 w-full"
                            />
                        ))}
                    </div>
                </Card>
            ) : enrollmentsQuery.isError ? (
                <Card>
                    <div className="flex items-center gap-3 text-fg-soft">
                        <AlertCircle
                            size={18}
                            className="text-[var(--color-danger)]"
                        />
                        <span className="text-sm">
                            Could not load enrollments. {enrollmentsQuery.error instanceof Error ? enrollmentsQuery.error.message : ''}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => enrollmentsQuery.refetch()}>
                            Retry
                        </Button>
                    </div>
                </Card>
            ) : filtered.length === 0 ? (
                <Empty
                    icon={<GraduationCap size={32} />}
                    title={q || statusFilter ? 'No matches' : 'No enrollments yet'}
                    description={
                        q || statusFilter
                            ? 'Try clearing filters or searching for something else.'
                            : 'Once students enrol in your courses, they will show up here in real time.'
                    }
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">Student</th>
                                    <th className="py-3 px-5">Course</th>
                                    <th className="py-3 px-5">Progress</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5">Enrolled</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5">
                                            <div className="font-medium text-fg">{fullName(row.user)}</div>
                                            {row.user?.email && <div className="text-xs text-fg-muted">{row.user.email}</div>}
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">{row.course?.title ?? '—'}</td>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden w-32">
                                                    <div
                                                        className="h-full bg-[var(--color-brand-500)]"
                                                        style={{ width: `${row.progressPct ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-xs">{row.progressPct ?? 0}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STATUS_TONE[row.status]}>
                                                <GraduationCap size={10} /> {STATUS_LABEL[row.status]}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(row.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </>
    )
}

const SummaryStat = ({ label, value, tone }: { label: string; value: number; tone?: 'brand' | 'ok' | 'warn' }) => (
    <Card>
        <div className="text-[11px] uppercase tracking-wider text-fg-muted font-medium">{label}</div>
        <div
            className={
                tone === 'brand'
                    ? 'text-2xl font-semibold text-[var(--color-brand-600)] mt-1'
                    : tone === 'ok'
                      ? 'text-2xl font-semibold text-[var(--color-success)] mt-1'
                      : tone === 'warn'
                        ? 'text-2xl font-semibold text-[var(--color-warning)] mt-1'
                        : 'text-2xl font-semibold text-fg mt-1'
            }>
            {value}
        </div>
    </Card>
)
