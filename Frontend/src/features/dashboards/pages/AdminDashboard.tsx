import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, CreditCard, Activity, ArrowRight, Building2, IndianRupee, GraduationCap, AlertTriangle } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { getMyDashboard } from '../services/dashboard.service'

// Real-data dashboard. The backend's `/dashboard/me` endpoint returns a
// per-role payload — SA gets a platform-wide rollup, ADMIN gets their own
// tenant. Stats keys differ between the two; the page picks which cards to
// render based on what's present in the response.
const fmtINR = (paise: number | undefined) => {
    if (!paise) return '₹0'
    if (paise >= 100_00_000) return `₹${(paise / 1_00_00_000).toFixed(1)}Cr`
    if (paise >= 100_000) return `₹${(paise / 1_00_000).toFixed(1)}L`
    if (paise >= 1000) return `₹${(paise / 1000).toFixed(1)}K`
    return `₹${paise / 100}`
}

export const AdminDashboard = () => {
    const navigate = useNavigate()
    const role = useAuthStore((s) => s.user?.role)
    const isSuperAdmin = role === ROLES.SUPER_ADMIN

    const dashboardQuery = useQuery({
        queryKey: ['dashboard', 'me'],
        queryFn: getMyDashboard,
        staleTime: 60_000
    })

    const stats = dashboardQuery.data?.stats ?? {}
    const nextActions = dashboardQuery.data?.nextActions ?? []

    return (
        <>
            <PageHeader
                eyebrow={isSuperAdmin ? 'Platform' : 'Institute'}
                title={isSuperAdmin ? 'Platform overview' : 'Mission control'}
                description={
                    isSuperAdmin
                        ? 'Aggregate health across every tenant. Drill into a tenant from the Tenants page.'
                        : 'Real-time tenant health. Every card links to its full report.'
                }
            />

            {dashboardQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-24"
                        />
                    ))}
                </div>
            ) : isSuperAdmin ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/app/admin/tenants')}
                        className="text-left">
                        <StatCard
                            label="Active tenants"
                            value={stats.tenantsActive ?? 0}
                            delta={`${stats.tenantsTrial ?? 0} trial · ${stats.tenantsSuspended ?? 0} suspended`}
                            icon={<Building2 size={18} />}
                            accent="brand"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/app/users')}
                        className="text-left">
                        <StatCard
                            label="Total users"
                            value={stats.totalUsers ?? 0}
                            delta={`${stats.totalStudents ?? 0} students`}
                            icon={<Users size={18} />}
                            accent="purple"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/app/admin/tenants')}
                        className="text-left">
                        <StatCard
                            label="SaaS revenue · MTD"
                            value={fmtINR(stats.saasRevenueThisMonth)}
                            delta={`${fmtINR(stats.saasOutstanding)} outstanding`}
                            icon={<IndianRupee size={18} />}
                            accent="teal"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/app/courses')}
                        className="text-left">
                        <StatCard
                            label="Courses live"
                            value={stats.coursesPublished ?? 0}
                            delta={`${stats.activeEnrollments ?? 0} active enrolments`}
                            icon={<BookOpen size={18} />}
                            accent="orange"
                        />
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/app/users')}
                        className="text-left">
                        <StatCard
                            label="Active students"
                            value={stats.totalStudents ?? 0}
                            delta={`${stats.totalTrainers ?? 0} trainers`}
                            icon={<GraduationCap size={18} />}
                            accent="brand"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/app/courses')}
                        className="text-left">
                        <StatCard
                            label="Courses live"
                            value={stats.coursesPublished ?? 0}
                            delta={`${stats.activeEnrollments ?? 0} active enrolments`}
                            icon={<BookOpen size={18} />}
                            accent="purple"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/app/payments')}
                        className="text-left">
                        <StatCard
                            label="Revenue · MTD"
                            value={fmtINR(stats.revenueThisMonth)}
                            delta={`${stats.signupsThisMonth ?? 0} new signups`}
                            icon={<CreditCard size={18} />}
                            accent="teal"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/app/payments')}
                        className="text-left">
                        <StatCard
                            label="Overdue invoices"
                            value={stats.overdueInvoices ?? 0}
                            delta={(stats.overdueInvoices ?? 0) > 0 ? 'Needs follow-up' : 'All clear'}
                            icon={<AlertTriangle size={18} />}
                            accent="orange"
                        />
                    </button>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-fg">{isSuperAdmin ? 'Platform health' : 'System health'}</h2>
                        <Button
                            size="sm"
                            variant="ghost"
                            rightIcon={<ArrowRight size={14} />}
                            onClick={() => navigate(isSuperAdmin ? '/app/admin/tenants' : '/app/payments')}>
                            {isSuperAdmin ? 'Tenants' : 'Payments'}
                        </Button>
                    </div>
                    <MonitoringPanel monitoring={dashboardQuery.data?.monitoring} />
                </Card>

                <Card>
                    <h2 className="text-base font-semibold text-fg mb-4">Next actions</h2>
                    {nextActions.length === 0 ? (
                        <div className="text-sm text-fg-soft py-4 text-center">Nothing waiting on you.</div>
                    ) : (
                        <ul className="space-y-2.5">
                            {nextActions.map((n, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(n.link.startsWith('/app') ? n.link : `/app${n.link}`)}
                                        className="w-full border rounded-md p-3 flex items-center justify-between hover:bg-surface-hover transition-colors text-left">
                                        <span className="text-sm text-fg">{n.label}</span>
                                        <Badge tone="brand">Open</Badge>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </>
    )
}

interface MonitoringSnapshot {
    application?: {
        uptime?: string
        environment?: string
        memoryUsage?: { heapTotal?: string; heapUsed?: string }
    }
    system?: {
        cpuUsage?: number[]
        totalMemory?: string
        freeMemory?: string
    }
}

// Renders the live snapshot returned by /dashboard/me's `monitoring` field.
// Backend (util/quicker.ts) returns pre-formatted strings — we just display
// them. Falls back to a friendly em-dash when the field is missing.
const fmtUptime = (raw?: string): string => {
    if (!raw) return '—'
    // Backend gives "1234.56 Seconds" — convert to a readable hh:mm:ss.
    const n = Number(raw.split(' ')[0])
    if (!Number.isFinite(n)) return raw
    const days = Math.floor(n / 86400)
    const hours = Math.floor((n % 86400) / 3600)
    const mins = Math.floor((n % 3600) / 60)
    const secs = Math.floor(n % 60)
    if (days > 0) return `${days}d ${hours}h ${mins}m`
    if (hours > 0) return `${hours}h ${mins}m`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
}

const MonitoringPanel = ({ monitoring }: { monitoring: unknown }) => {
    const m = (monitoring ?? {}) as MonitoringSnapshot
    const uptime = m.application?.uptime
    const heap = m.application?.memoryUsage
    const sys = m.system
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm text-fg-soft inline-flex items-center gap-2">
                    <Activity size={14} /> Backend uptime
                </span>
                <span className="text-sm font-mono text-fg">{fmtUptime(uptime)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm text-fg-soft inline-flex items-center gap-2">
                    <Activity size={14} /> Heap used
                </span>
                <span className="text-sm font-mono text-fg">
                    {heap?.heapUsed ?? '—'} / {heap?.heapTotal ?? '—'}
                </span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm text-fg-soft inline-flex items-center gap-2">
                    <Activity size={14} /> System memory
                </span>
                <span className="text-sm font-mono text-fg">
                    {sys?.freeMemory ?? '—'} free / {sys?.totalMemory ?? '—'}
                </span>
            </div>
        </div>
    )
}
