import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { UserPlus, Link2, Target, IndianRupee, ArrowRight, Users, ClipboardList } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { getMyDashboard } from '../services/dashboard.service'
import { fmtPaiseINR } from '@shared/libs/pdf'

// Real-data dashboard for both COUNSELLOR and COUNSELLING_MANAGER.
// Backend returns different stat shapes per role; we render the cards that
// match what came back so a manager doesn't see "My signups: 0".
export const CounsellorDashboard = () => {
    const navigate = useNavigate()
    const role = useAuthStore((s) => s.user?.role)
    const isManager = role === ROLES.COUNSELLING_MANAGER

    const dashQuery = useQuery({ queryKey: ['dashboard', 'me'], queryFn: getMyDashboard, staleTime: 60_000 })
    const stats = dashQuery.data?.stats ?? {}
    const target = dashQuery.data?.target as { revenuePaise?: number; achievedPaise?: number } | null | undefined
    const nextActions = dashQuery.data?.nextActions ?? []

    const targetTotal = target?.revenuePaise ?? 0
    const targetDone = target?.achievedPaise ?? stats.revenueThisMonth ?? 0
    const pct = targetTotal > 0 ? Math.min(100, Math.round((targetDone / targetTotal) * 100)) : 0

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
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="My signups"
                        value={stats.mySignups ?? 0}
                        icon={<UserPlus size={18} />}
                        accent="brand"
                    />
                    <StatCard
                        label="Target progress"
                        value={`${pct}%`}
                        delta={targetTotal > 0 ? `${fmtPaiseINR(targetDone)} / ${fmtPaiseINR(targetTotal)}` : 'No target set'}
                        icon={<Target size={18} />}
                        accent="purple"
                    />
                    <StatCard
                        label="Revenue · MTD"
                        value={fmtPaiseINR(stats.revenueThisMonth)}
                        icon={<IndianRupee size={18} />}
                        accent="teal"
                    />
                    <StatCard
                        label="Active students"
                        value={stats.activeStudents ?? 0}
                        icon={<UserPlus size={18} />}
                        accent="orange"
                    />
                </div>
            )}

            <Card>
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
