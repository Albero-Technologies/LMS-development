import { useNavigate } from 'react-router-dom'
import { TicketCheck, AlertTriangle, CheckCircle2, Clock, Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'

const PRIORITY = [
    { id: 'T-201', subj: 'Payment failed but marked paid', prio: 'danger' as const, age: '2h' },
    { id: 'T-200', subj: 'Cannot access enrolled course', prio: 'warn' as const, age: '30m' },
    { id: 'T-198', subj: 'Invoice GSTIN edit', prio: 'default' as const, age: '1d' }
]

export const SupportDashboard = () => {
    const navigate = useNavigate()
    return (
        <>
            <PageHeader
                eyebrow="Support"
                title="Your queue"
                description="SLA-aware ticket triage."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => navigate('/app/tickets')}>
                        New ticket
                    </Button>
                }
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Open"
                    value={14}
                    icon={<TicketCheck size={18} />}
                    accent="brand"
                />
                <StatCard
                    label="SLA breached"
                    value={2}
                    tone="down"
                    delta="investigate"
                    icon={<AlertTriangle size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Resolved today"
                    value={9}
                    tone="up"
                    icon={<CheckCircle2 size={18} />}
                    accent="teal"
                />
                <StatCard
                    label="Avg first-response"
                    value="14m"
                    icon={<Clock size={18} />}
                    accent="purple"
                />
            </div>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-fg">Priority queue</h2>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/app/tickets')}>
                        All tickets
                    </Button>
                </div>
                <ul className="divide-y">
                    {PRIORITY.map((t) => (
                        <li
                            key={t.id}
                            className="py-3 flex items-center gap-3">
                            <Badge tone={t.prio}>{t.prio === 'danger' ? 'p1' : t.prio === 'warn' ? 'p2' : 'p3'}</Badge>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-fg truncate">{t.subj}</div>
                                <div className="text-xs text-fg-muted mt-0.5 font-mono">{t.id}</div>
                            </div>
                            <div className="text-xs text-fg-muted">{t.age}</div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/app/tickets/${t.id}`)}>
                                Open
                            </Button>
                        </li>
                    ))}
                </ul>
            </Card>
        </>
    )
}
