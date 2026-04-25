import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { TicketCheck, AlertTriangle, CheckCircle2, Clock, Plus, ArrowRight } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getMyDashboard } from '../services/dashboard.service'

// Real-data support dashboard. Backend reports tenant ticket counts by status.
export const SupportDashboard = () => {
    const navigate = useNavigate()
    const dashQuery = useQuery({ queryKey: ['dashboard', 'me'], queryFn: getMyDashboard, staleTime: 60_000 })
    const stats = dashQuery.data?.stats ?? {}
    const nextActions = dashQuery.data?.nextActions ?? []

    return (
        <>
            <PageHeader
                eyebrow="Support"
                title="Your queue"
                description="Live ticket counts for this tenant."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => navigate('/app/tickets')}>
                        New ticket
                    </Button>
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
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Open"
                        value={stats.openTickets ?? 0}
                        icon={<TicketCheck size={18} />}
                        accent="brand"
                    />
                    <StatCard
                        label="In progress"
                        value={stats.inProgress ?? 0}
                        icon={<Clock size={18} />}
                        accent="purple"
                    />
                    <StatCard
                        label="Resolved today"
                        value={stats.resolvedToday ?? 0}
                        tone="up"
                        icon={<CheckCircle2 size={18} />}
                        accent="teal"
                    />
                    <StatCard
                        label="Urgent"
                        value={stats.urgent ?? 0}
                        tone={(stats.urgent ?? 0) > 0 ? 'down' : 'neutral'}
                        icon={<AlertTriangle size={18} />}
                        accent="orange"
                    />
                </div>
            )}

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-fg">Next actions</h2>
                    <Link to="/app/tickets">
                        <Button
                            size="sm"
                            variant="ghost"
                            rightIcon={<ArrowRight size={14} />}>
                            All tickets
                        </Button>
                    </Link>
                </div>
                {nextActions.length === 0 ? (
                    <div className="text-sm text-fg-soft py-4 text-center">All clear.</div>
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
