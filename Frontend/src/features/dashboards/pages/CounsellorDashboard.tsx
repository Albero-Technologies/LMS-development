import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { UserPlus, Link2, Target, IndianRupee, ArrowRight, Calendar, TrendingUp, CheckCircle2, Users, ClipboardList } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { getMyDashboard } from '../services/dashboard.service'
import { getMyTargetHistory, type CounsellorMonthBucket } from '@features/counsellor/services/counsellor.service'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { cn } from '@shared/helpers/cn'
import { ManagerDashboardPage } from './ManagerDashboard'

// Real-data dashboard for both COUNSELLOR and COUNSELLING_MANAGER.
// Backend returns different stat shapes per role; we render the cards that
// match what came back so a manager doesn't see "My signups: 0".
export const CounsellorDashboard = () => {
    const role = useAuthStore((s) => s.user?.role)
    // Manager gets a dedicated, richer dashboard — team breakdown, multi-month
    // tracker, incentive slab, top/bottom performer. Counsellors fall through
    // to the personal view in CounsellorView below.
    if (role === ROLES.COUNSELLING_MANAGER) return <ManagerDashboardPage />
    return <CounsellorView />
}

const CounsellorView = () => {
    const navigate = useNavigate()
    const role = useAuthStore((s) => s.user?.role)
    const isManager = role === ROLES.COUNSELLING_MANAGER


    const dashQuery = useQuery({ queryKey: ['dashboard', 'me'], queryFn: getMyDashboard, staleTime: 60_000 })
    const historyQuery = useQuery({
        queryKey: ['counsellor', 'targets', 'history'],
        queryFn: () => getMyTargetHistory(5),
        enabled: !isManager,
        staleTime: 60_000
    })
    const stats = dashQuery.data?.stats ?? {}
    const target = dashQuery.data?.target as { revenuePaise?: number; achievedPaise?: number } | null | undefined
    const nextActions = dashQuery.data?.nextActions ?? []
    const history = historyQuery.data ?? []
    const currentMonth = history[history.length - 1]

    const targetTotal = target?.revenuePaise ?? 0

    return (
        <>
            <PageHeader
                eyebrow={isManager ? 'Counselling team' : 'Admissions'}
                title={isManager ? 'Manager console' : 'Counsellor console'}
                description={isManager ? 'Aggregate totals across your direct reports.' : 'Real-time totals from your pipeline.'}
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/app/counsellor/pipeline')}>
                            Open pipeline
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Link2 size={14} />}
                            onClick={() => navigate('/app/counsellor/invites')}>
                            New invite link
                        </Button>
                    </>
                }
            />

            {dashQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-24"
                        />
                    ))}
                </div>
            ) : isManager ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Team size"
                        value={stats.teamSize ?? 0}
                        icon={<Users size={18} />}
                        accent="brand"
                    />
                    <StatCard
                        label="Signups · MTD"
                        value={stats.signupsThisMonth ?? 0}
                        icon={<UserPlus size={18} />}
                        accent="purple"
                    />
                    <StatCard
                        label="Active students"
                        value={stats.activeStudents ?? 0}
                        icon={<Users size={18} />}
                        accent="teal"
                    />
                    <StatCard
                        label="Open tasks"
                        value={stats.openTasks ?? 0}
                        icon={<ClipboardList size={18} />}
                        accent="orange"
                    />
                </div>
            ) : (
                <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <StatCard
                            label="My signups"
                            value={stats.mySignups ?? 0}
                            icon={<UserPlus size={18} />}
                            accent="brand"
                        />
                        <StatCard
                            label="Target this month"
                            value={fmtPaiseINR(currentMonth?.target.revenue ?? targetTotal)}
                            delta={currentMonth ? `${currentMonth.target.enrolments} enrolments target` : 'No target set'}
                            icon={<Target size={18} />}
                            accent="purple"
                        />
                        <StatCard
                            label="Achieved · MTD"
                            value={fmtPaiseINR(currentMonth?.actual.revenue ?? stats.revenueThisMonth ?? 0)}
                            delta={currentMonth ? `${currentMonth.actual.enrolments} enrolments` : '—'}
                            tone="up"
                            icon={<IndianRupee size={18} />}
                            accent="teal"
                        />
                        <StatCard
                            label="To hit target"
                            value={
                                currentMonth && currentMonth.target.revenue > 0
                                    ? fmtPaiseINR(currentMonth.revenueRemaining)
                                    : fmtPaiseINR(0)
                            }
                            delta={
                                currentMonth && currentMonth.target.enrolments > 0
                                    ? `${currentMonth.enrolmentsRemaining} enrolment(s) remaining`
                                    : 'Set a target to see this'
                            }
                            tone={currentMonth && currentMonth.completionRate.revenue >= 100 ? 'up' : 'down'}
                            icon={<TrendingUp size={18} />}
                            accent="orange"
                        />
                    </div>
                    <MonthlyTracker
                        history={history}
                        loading={historyQuery.isLoading}
                    />
                </>
            )}

            <Card className="mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-fg">Next actions</h2>
                    <Link to="/app/counsellor/pipeline">
                        <Button
                            size="sm"
                            variant="ghost"
                            rightIcon={<ArrowRight size={14} />}>
                            Pipeline
                        </Button>
                    </Link>
                </div>
                {nextActions.length === 0 ? (
                    <div className="text-sm text-fg-soft py-4 text-center">All caught up.</div>
                ) : (
                    <ul className="space-y-2.5">
                        {nextActions.map((a, i) => (
                            <li key={i}>
                                <Link
                                    to={a.link.startsWith('/app') ? a.link : `/app${a.link}`}
                                    className="w-full border rounded-md p-3 flex items-center justify-between hover:bg-surface-hover transition-colors text-left">
                                    <span className="text-sm text-fg">{a.label}</span>
                                    <Badge tone="brand">Open</Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </>
    )
}

// Multi-month performance grid. Each card = one month with revenue achieved
// vs target. The progress bar fills based on revenue completion %, with a
// sub-line for enrolments. Hovering / clicking a future month is intentionally
// disabled — counsellors can only review history, not edit it.
const MonthlyTracker = ({ history, loading }: { history: CounsellorMonthBucket[]; loading: boolean }) => {
    if (loading) {
        return (
            <Card>
                <Skeleton className="h-6 w-1/3 mb-3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-32"
                        />
                    ))}
                </div>
            </Card>
        )
    }

    if (history.length === 0) return null

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-fg inline-flex items-center gap-2">
                    <Calendar size={16} /> Monthly tracker
                </h2>
                <span className="text-xs text-fg-muted">Revenue achieved vs target — last {history.length} months</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {history.map((m) => {
                    const isCurrent = m === history[history.length - 1]
                    const pct = m.completionRate.revenue
                    const hit = pct >= 100
                    const noTarget = m.target.revenue === 0
                    return (
                        <div
                            key={m.period.start}
                            className={cn(
                                'rounded-md border p-3 transition-colors',
                                isCurrent
                                    ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]'
                                    : 'border-[var(--color-border)] bg-surface'
                            )}>
                            <div className="flex items-center justify-between text-[11px] text-fg-muted mb-2">
                                <span className="font-mono uppercase">{m.period.label}</span>
                                {hit ? (
                                    <CheckCircle2
                                        size={12}
                                        className="text-[var(--color-success)]"
                                    />
                                ) : null}
                            </div>
                            <div className="text-sm font-semibold text-fg">{fmtPaiseINR(m.actual.revenue)}</div>
                            <div className="text-[11px] text-fg-muted">of {noTarget ? '—' : fmtPaiseINR(m.target.revenue)}</div>
                            <div className="mt-2 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full transition-all',
                                        hit ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand-500)]'
                                    )}
                                    style={{ width: `${noTarget ? 0 : pct}%` }}
                                />
                            </div>
                            <div className="mt-1.5 text-[11px] text-fg-soft flex items-center justify-between">
                                <span>{noTarget ? 'No target' : `${pct}%`}</span>
                                <span>
                                    {m.actual.enrolments}/{noTarget ? '—' : m.target.enrolments} enrol
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
