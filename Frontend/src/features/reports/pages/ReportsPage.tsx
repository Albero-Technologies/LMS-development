import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Users, CreditCard, TrendingUp, Download, FileText, ClipboardCheck, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Select } from '@shared/components/ui/Select'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { getReports } from '@features/dashboards/services/dashboard.service'
import { listAllTenants } from '@features/admin/services/tenant.service'
import { downloadTablePdf, viewTablePdf, fmtPaiseINR } from '@shared/libs/pdf'

// Real-data reports. Backend `/dashboard/reports` returns per-tenant KPIs +
// 8-week revenue trend; SUPER_ADMIN gets the platform-wide aggregate.
// Export downloads a PDF — no email roundtrip.
export const ReportsPage = () => {
    const role = useAuthStore((s) => s.user?.role)
    const isSuperAdmin = role === ROLES.SUPER_ADMIN
    const [saTenantSlug, setSaTenantSlug] = useState<string>('__all__')

    const tenantsQuery = useQuery({
        queryKey: ['tenants'],
        queryFn: listAllTenants,
        enabled: isSuperAdmin,
        staleTime: 60_000
    })

    const reportsQuery = useQuery({
        queryKey: ['reports', isSuperAdmin ? saTenantSlug : 'tenant'],
        queryFn: () => getReports(isSuperAdmin ? { tenantSlug: saTenantSlug } : undefined),
        staleTime: 60_000
    })

    const data = reportsQuery.data
    const stats = data?.stats
    const trend = useMemo(() => data?.trend ?? [], [data?.trend])

    const buildReportInput = () => {
        if (!data || !stats) return null
        return {
            title: data.scope === 'platform' ? 'Albero Academy — Platform report' : 'Tenant report',
            subtitle: `Generated for the last 7 days`,
            summary: [
                { label: 'Active learners (7d)', value: String(stats.activeLearners) },
                { label: 'New signups', value: String(stats.signupsThisWeek) },
                { label: 'Collected (7d)', value: fmtPaiseINR(stats.collectedThisWeek) },
                { label: 'Quiz attempts', value: String(stats.quizAttempts) }
            ],
            head: [['Week', 'Revenue', 'Paid invoices']],
            body: trend.map((t) => [t.week, fmtPaiseINR(t.revenue), t.count])
        }
    }

    const previewPdf = () => {
        const input = buildReportInput()
        if (!input) return
        viewTablePdf(input)
    }

    const exportPdf = () => {
        const input = buildReportInput()
        if (!input) return
        downloadTablePdf(`reports-${new Date().toISOString().slice(0, 10)}.pdf`, input)
        toast.success('PDF downloaded')
    }

    // Build a tiny SVG trend from the real revenue series.
    const path = useMemo(() => {
        if (trend.length === 0) return ''
        const max = Math.max(...trend.map((t) => t.revenue), 1)
        const w = 600
        const h = 220
        const step = w / Math.max(1, trend.length - 1)
        const points = trend.map((t, i) => `${i * step},${h - (t.revenue / max) * (h - 30) - 10}`)
        return `M${points.join(' L')}`
    }, [trend])

    return (
        <>
            <PageHeader
                eyebrow="Analytics"
                title="Reports"
                description={
                    data?.scope === 'platform'
                        ? 'Platform-wide rollup across every tenant.'
                        : 'Live KPIs for your tenant.'
                }
                actions={
                    <>
                        {isSuperAdmin && (
                            <div className="w-56">
                                <Select
                                    aria-label="Scope tenant"
                                    value={saTenantSlug}
                                    onChange={(e) => setSaTenantSlug(e.target.value)}>
                                    <option value="__all__">All tenants</option>
                                    {(tenantsQuery.data ?? []).map((t) => (
                                        <option
                                            key={t.id}
                                            value={t.slug}>
                                            {t.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Eye size={14} />}
                            disabled={!data}
                            onClick={previewPdf}>
                            View PDF
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Download size={14} />}
                            disabled={!data}
                            onClick={exportPdf}>
                            Download PDF
                        </Button>
                    </>
                }
            />

            {reportsQuery.isLoading || !stats ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-24"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Active learners (7d)"
                        value={stats.activeLearners}
                        icon={<Users size={18} />}
                        accent="brand"
                    />
                    <StatCard
                        label="Signups (7d)"
                        value={stats.signupsThisWeek}
                        icon={<TrendingUp size={18} />}
                        accent="purple"
                    />
                    <StatCard
                        label="Collected (7d)"
                        value={fmtPaiseINR(stats.collectedThisWeek)}
                        icon={<CreditCard size={18} />}
                        accent="teal"
                    />
                    <StatCard
                        label="Quiz attempts (7d)"
                        value={stats.quizAttempts}
                        icon={<ClipboardCheck size={18} />}
                        accent="orange"
                    />
                </div>
            )}

            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-fg">Revenue trend</h2>
                        <p className="text-xs text-fg-muted mt-1">Paid invoices, last 8 weeks.</p>
                    </div>
                    <div className="text-xs text-fg-muted">
                        Total enrolments · {stats?.totalEnrollments ?? 0} | Students · {stats?.totalStudents ?? 0}
                    </div>
                </div>
                <div className="h-64 mt-4 relative rounded-md overflow-hidden grid-dots">
                    {trend.length === 0 ? (
                        <div className="absolute inset-0 grid place-items-center text-sm text-fg-muted">
                            <div className="text-center">
                                <FileText size={28} className="mx-auto mb-2 opacity-50" />
                                No revenue yet — chart fills in once invoices are paid.
                            </div>
                        </div>
                    ) : (
                        <svg
                            viewBox="0 0 600 220"
                            className="absolute inset-0 w-full h-full"
                            preserveAspectRatio="none">
                            <defs>
                                <linearGradient
                                    id="rp-grad"
                                    x1="0"
                                    x2="0"
                                    y1="0"
                                    y2="1">
                                    <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.32" />
                                    <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={path}
                                stroke="var(--color-brand-500)"
                                strokeWidth="2"
                                fill="none"
                            />
                            <path
                                d={`${path} L600,220 L0,220 Z`}
                                fill="url(#rp-grad)"
                            />
                        </svg>
                    )}
                </div>
                {trend.length > 0 && (
                    <div className="grid grid-cols-8 gap-1 text-[10px] text-fg-muted text-center mt-2 font-mono">
                        {trend.map((t) => (
                            <span key={t.week}>{t.week}</span>
                        ))}
                    </div>
                )}
            </Card>

            <div className="text-xs text-fg-muted mt-6 inline-flex items-center gap-1">
                <LineChart size={11} /> Live data — refreshes every minute.
            </div>
        </>
    )
}
