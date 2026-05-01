// Counselling-Manager dashboard. Renders:
//  - Team headline KPIs (target this month / achieved / remaining / completion %)
//  - Top + bottom performer cards
//  - Per-member breakdown table with target / achieved / remaining / incentive
//  - Multi-month team revenue tracker
//  - Incentive slab reference card
//
// All data comes from `/counsellor/reports/manager-dashboard` in one
// round-trip. No mocks here.
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TrendingUp, TrendingDown, Target, IndianRupee, Calendar, Trophy, Zap, ChevronRight, UserPen, Pause, Play } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Modal } from '@shared/components/ui/Modal'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'
import { Input } from '@shared/components/ui/Input'
import { Empty } from '@shared/components/ui/Empty'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { cn } from '@shared/helpers/cn'
import { getManagerDashboard, type ManagerDashboard, type ManagerMember } from '@features/counsellor/services/counsellor.service'
import { updateUser } from '@features/users/services/user.service'

export const ManagerDashboardPage = () => {
    const navigate = useNavigate()
    const dashQuery = useQuery({
        queryKey: ['manager-dashboard'],
        queryFn: () => getManagerDashboard(),
        staleTime: 60_000
    })
    const [editing, setEditing] = useState<ManagerMember | null>(null)

    const data = dashQuery.data ?? null

    return (
        <>
            <PageHeader
                eyebrow="Counselling team"
                title="Manager console"
                description="Live team revenue + targets + incentive tier per counsellor."
                actions={
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/app/users')}>
                        Manage team
                    </Button>
                }
            />

            {dashQuery.isLoading || !data ? (
                <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-24"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-48" />
                </div>
            ) : data.teamSize === 0 ? (
                <Empty
                    icon={<Trophy size={32} />}
                    title="No counsellors on your team yet"
                    description="Once an admin assigns counsellors to you, their performance will roll up here."
                />
            ) : (
                <>
                    <KpiRow data={data} />
                    <PerformerRow data={data} />
                    <TeamTable
                        data={data}
                        onEdit={setEditing}
                    />
                    <MonthlyTrackerRow data={data} />
                    <IncentiveSlabsCard slabs={data.incentiveSlabs} />
                </>
            )}

            <EditMemberModal
                member={editing}
                onClose={() => setEditing(null)}
            />
        </>
    )
}

const KpiRow = ({ data }: { data: ManagerDashboard }) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
            label="Team target · MTD"
            value={fmtPaiseINR(data.teamTotals.targetRevenue)}
            delta={`${data.teamTotals.targetEnrolments} enrolments target`}
            icon={<Target size={18} />}
            accent="purple"
        />
        <StatCard
            label="Achieved · MTD"
            value={fmtPaiseINR(data.teamTotals.actualRevenue)}
            delta={`${data.teamTotals.actualEnrolments} enrolments`}
            tone="up"
            icon={<IndianRupee size={18} />}
            accent="teal"
        />
        <StatCard
            label="Remaining"
            value={fmtPaiseINR(data.teamTotals.revenueRemaining)}
            delta={`${data.teamTotals.enrolmentsRemaining} enrolments to go`}
            tone={data.teamTotals.completionPct >= 100 ? 'up' : 'down'}
            icon={<TrendingUp size={18} />}
            accent="orange"
        />
        <StatCard
            label="Team completion"
            value={`${data.teamTotals.completionPct}%`}
            delta={`Incentive pool ${fmtPaiseINR(data.teamTotals.incentivePayout)}`}
            icon={<Zap size={18} />}
            accent="brand"
        />
    </div>
)

const PerformerRow = ({ data }: { data: ManagerDashboard }) => {
    if (!data.topPerformer && !data.bottomPerformer) return null
    return (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {data.topPerformer && (
                <Card className="!p-4 border-l-4 border-[var(--color-success)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-[var(--color-success)] inline-flex items-center gap-1">
                                <Trophy size={12} /> Top performer
                            </div>
                            <div className="text-base font-semibold text-fg mt-1">{data.topPerformer.name}</div>
                            <div className="text-xs text-fg-muted mt-0.5">
                                {fmtPaiseINR(data.topPerformer.revenue)} · {data.topPerformer.pct}% of target
                            </div>
                        </div>
                    </div>
                </Card>
            )}
            {data.bottomPerformer && data.bottomPerformer.id !== data.topPerformer?.id && (
                <Card className="!p-4 border-l-4 border-[var(--color-warning)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-[var(--color-warning)] inline-flex items-center gap-1">
                                <TrendingDown size={12} /> Needs support
                            </div>
                            <div className="text-base font-semibold text-fg mt-1">{data.bottomPerformer.name}</div>
                            <div className="text-xs text-fg-muted mt-0.5">
                                {fmtPaiseINR(data.bottomPerformer.revenue)} · {data.bottomPerformer.pct}% of target
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

const TeamTable = ({ data, onEdit }: { data: ManagerDashboard; onEdit: (m: ManagerMember) => void }) => (
    <Card
        padded={false}
        className="mb-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="text-base font-semibold text-fg">Team breakdown · this month</h2>
            <span className="text-xs text-fg-muted">
                {data.teamSize} counsellor{data.teamSize === 1 ? '' : 's'}
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-fg-muted bg-surface-2">
                        <th className="py-3 px-5">Counsellor</th>
                        <th className="py-3 px-5">Target</th>
                        <th className="py-3 px-5">Achieved</th>
                        <th className="py-3 px-5">Remaining</th>
                        <th className="py-3 px-5">Progress</th>
                        <th className="py-3 px-5">Incentive</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.members.map((m) => (
                        <tr
                            key={m.id}
                            className="hover:bg-surface-hover">
                            <td className="py-3 px-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] text-white text-xs flex items-center justify-center font-semibold">
                                        {m.name[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-fg font-medium truncate">{m.name}</div>
                                        <div className="text-xs text-fg-muted truncate">
                                            {m.email}
                                            {m.status !== 'ACTIVE' && (
                                                <Badge
                                                    tone="warn"
                                                    className="ml-2">
                                                    {m.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-5 font-mono text-xs">
                                {m.target.revenue > 0 ? fmtPaiseINR(m.target.revenue) : <span className="text-fg-muted">—</span>}
                            </td>
                            <td className="py-3 px-5 font-mono text-xs text-fg">{fmtPaiseINR(m.actual.revenue)}</td>
                            <td className="py-3 px-5 font-mono text-xs">
                                {m.target.revenue > 0 ? (
                                    <span className={m.completionPct >= 100 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}>
                                        {fmtPaiseINR(m.revenueRemaining)} / {m.enrolmentsRemaining} enrol
                                    </span>
                                ) : (
                                    <span className="text-fg-muted">No target</span>
                                )}
                            </td>
                            <td className="py-3 px-5">
                                <div className="w-28">
                                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full transition-all',
                                                m.completionPct >= 100 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand-500)]'
                                            )}
                                            style={{ width: `${m.target.revenue > 0 ? m.completionPct : 0}%` }}
                                        />
                                    </div>
                                    <div className="text-[10px] font-mono text-fg-muted mt-0.5">
                                        {m.target.revenue > 0 ? `${m.completionPct}%` : '—'}
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-5 text-xs">
                                <Badge tone={m.incentive.ratePct >= 5 ? 'ok' : m.incentive.ratePct > 0 ? 'warn' : 'default'}>
                                    {m.incentive.tier} · {m.incentive.ratePct}%
                                </Badge>
                                <div className="text-[11px] text-fg-muted mt-0.5 font-mono">{fmtPaiseINR(m.incentive.payout)}</div>
                            </td>
                            <td className="py-3 px-5 text-right">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={<UserPen size={12} />}
                                    onClick={() => onEdit(m)}>
                                    Edit
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
)

const MonthlyTrackerRow = ({ data }: { data: ManagerDashboard }) => (
    <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-fg inline-flex items-center gap-2">
                <Calendar size={16} /> Team performance · last {data.monthly.length} months
            </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.monthly.map((m, i) => {
                const isCurrent = i === data.monthly.length - 1
                const noTarget = m.target === 0
                const hit = m.pct >= 100
                return (
                    <div
                        key={m.start}
                        className={cn(
                            'rounded-md border p-3 transition-colors',
                            isCurrent ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]' : 'border-[var(--color-border)] bg-surface'
                        )}>
                        <div className="text-[11px] text-fg-muted font-mono uppercase mb-2">{m.label}</div>
                        <div className="text-sm font-semibold text-fg">{fmtPaiseINR(m.actual)}</div>
                        <div className="text-[11px] text-fg-muted">of {noTarget ? '—' : fmtPaiseINR(m.target)}</div>
                        <div className="mt-2 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                                className={cn('h-full transition-all', hit ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand-500)]')}
                                style={{ width: `${noTarget ? 0 : m.pct}%` }}
                            />
                        </div>
                        <div className="mt-1.5 text-[11px] text-fg-soft">{noTarget ? 'No target' : `${m.pct}% achieved`}</div>
                    </div>
                )
            })}
        </div>
    </Card>
)

const IncentiveSlabsCard = ({ slabs }: { slabs: ManagerDashboard['incentiveSlabs'] }) => (
    <Card>
        <h2 className="text-base font-semibold text-fg mb-2 inline-flex items-center gap-2">
            <Zap size={16} /> Incentive slabs
        </h2>
        <p className="text-xs text-fg-muted mb-4">Default tiers — applied automatically based on each counsellor's monthly revenue completion %.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {slabs.map((s) => (
                <div
                    key={s.minPct}
                    className="rounded-md border p-4">
                    <div className="text-sm font-semibold text-fg">{s.label}</div>
                    <div className="mt-1 text-xs text-fg-muted">≥ {s.minPct}% completion</div>
                    <div className="mt-2 text-2xl font-semibold text-fg">{s.rate}%</div>
                    <div className="text-[11px] text-fg-muted">of revenue</div>
                </div>
            ))}
        </div>
    </Card>
)

// Inline edit a counsellor — manager flow. Suspend / reinstate done via the
// status mutation; first/last/phone editable in a single submit.
const EditMemberModal = ({ member, onClose }: { member: ManagerMember | null; onClose: () => void }) => {
    const queryClient = useQueryClient()
    const confirm = useConfirm()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')

    const memberId = member?.id

    useMemo(() => {
        if (!member) return
        const [fn, ...rest] = member.name.split(' ')
        setFirstName(fn ?? '')
        setLastName(rest.join(' '))
        setPhone('')
    }, [member])

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!memberId) throw new Error('No member selected')
            return updateUser(memberId, { firstName, lastName, phone: phone || undefined })
        },
        onSuccess: () => {
            toast.success('Counsellor updated')
            void queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] })
            void queryClient.invalidateQueries({ queryKey: ['users'] })
            onClose()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not update')
    })

    const statusMutation = useMutation({
        mutationFn: (status: 'ACTIVE' | 'SUSPENDED') => {
            if (!memberId) throw new Error('No member selected')
            return updateUser(memberId, { status })
        },
        onSuccess: (_, status) => {
            toast.success(status === 'SUSPENDED' ? 'Counsellor suspended' : 'Counsellor reinstated')
            void queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] })
            void queryClient.invalidateQueries({ queryKey: ['users'] })
            onClose()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not change status')
    })

    return (
        <Modal
            open={!!member}
            onClose={onClose}
            title="Edit counsellor"
            description={member?.email ?? ''}
            footer={
                member && (
                    <>
                        {member.status === 'SUSPENDED' ? (
                            <Button
                                variant="ghost"
                                leftIcon={<Play size={12} />}
                                loading={statusMutation.isPending && statusMutation.variables === 'ACTIVE'}
                                onClick={() => statusMutation.mutate('ACTIVE')}>
                                Reinstate
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                leftIcon={<Pause size={12} />}
                                className="!text-[var(--color-danger)]"
                                loading={statusMutation.isPending && statusMutation.variables === 'SUSPENDED'}
                                onClick={async () => {
                                    const ok = await confirm({
                                        title: `Suspend ${member.name}?`,
                                        description:
                                            'They lose dashboard access immediately and any active session is invalidated. You can reinstate anytime.',
                                        confirmLabel: 'Suspend',
                                        tone: 'danger'
                                    })
                                    if (ok) statusMutation.mutate('SUSPENDED')
                                }}>
                                Suspend
                            </Button>
                        )}
                        <Button
                            loading={saveMutation.isPending}
                            onClick={() => saveMutation.mutate()}>
                            Save
                        </Button>
                    </>
                )
            }>
            {member && (
                <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                            label="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <Input
                            label="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <Input
                        label="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 ..."
                    />
                    <div className="text-[11px] text-fg-muted inline-flex items-center gap-1">
                        <ChevronRight size={11} /> Counsellors can only be suspended, not deleted. Suspending revokes their access immediately.
                    </div>
                </div>
            )}
        </Modal>
    )
}
