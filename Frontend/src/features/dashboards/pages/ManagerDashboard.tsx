// Counselling-Manager dashboard. Renders:
//  - Team headline KPIs (target this month / achieved / remaining / completion %)
//  - Top + bottom performer cards
//  - Per-member breakdown table with target / achieved / remaining / incentive
//  - Multi-month team revenue tracker
//  - Incentive slab reference card
//
// All data comes from `/counsellor/reports/manager-dashboard` in one
// round-trip. No mocks here.
import { useEffect, useMemo, useState } from 'react'
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
import { Select } from '@shared/components/ui/Select'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'
import { Input } from '@shared/components/ui/Input'
import { Empty } from '@shared/components/ui/Empty'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { cn } from '@shared/helpers/cn'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { toApiError } from '@shared/libs/api'
import {
    getManagerDashboard,
    setCounsellorTarget,
    type ManagerDashboard,
    type ManagerMember,
    type ManagerProfile
} from '@features/counsellor/services/counsellor.service'

// SetTargetModal accepts either a counsellor row or the manager themselves —
// both share the same shape (id, name, monthly target).
type TargetSubject = {
    id: string
    name: string
    target: { signups: number; enrolments: number; revenue: number }
}
import { listUsers, updateUser } from '@features/users/services/user.service'

export const ManagerDashboardPage = () => {
    const navigate = useNavigate()
    const role = useAuthStore((s) => s.user?.role)
    const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
    const userId = useAuthStore((s) => s.user?.id)

    // Admins / SAs choose which manager's team to view + manage. Managers
    // always see their own team — no picker.
    const managersQuery = useQuery({
        queryKey: ['users', 'managers'],
        queryFn: () => listUsers({ role: 'COUNSELLING_MANAGER', pageSize: 100 }),
        enabled: isAdmin,
        staleTime: 60_000
    })
    const managers = managersQuery.data?.items ?? []
    const [selectedManagerId, setSelectedManagerId] = useState<string>('')
    useEffect(() => {
        if (isAdmin && !selectedManagerId && managers.length > 0) setSelectedManagerId(managers[0].id)
    }, [isAdmin, selectedManagerId, managers])

    // Admin must pick a manager before the dashboard is meaningful — for
    // managers, server defaults to their own id.
    const effectiveManagerId = isAdmin ? selectedManagerId : userId
    const dashQuery = useQuery({
        queryKey: ['manager-dashboard', effectiveManagerId],
        queryFn: () => getManagerDashboard(isAdmin ? selectedManagerId : undefined),
        enabled: !isAdmin || !!selectedManagerId,
        staleTime: 60_000
    })
    const [editing, setEditing] = useState<ManagerMember | null>(null)
    const [targetSubject, setTargetSubject] = useState<TargetSubject | null>(null)

    const data = dashQuery.data ?? null

    return (
        <>
            <PageHeader
                eyebrow={isAdmin ? 'Counselling teams' : 'Counselling team'}
                title={isAdmin ? 'Counsellor targets' : 'Manager console'}
                description={
                    isAdmin
                        ? 'Pick a manager to review their team and set targets per counsellor.'
                        : 'Live team revenue + targets + incentive tier per counsellor.'
                }
                actions={
                    <>
                        {isAdmin && managers.length > 0 && (
                            <div className="w-64">
                                <Select
                                    aria-label="Choose manager"
                                    value={selectedManagerId}
                                    onChange={(e) => setSelectedManagerId(e.target.value)}>
                                    {managers.map((m) => (
                                        <option
                                            key={m.id}
                                            value={m.id}>
                                            {`${m.firstName} ${m.lastName}`.trim() || m.email}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                        {!isAdmin && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate('/app/users')}>
                                Manage team
                            </Button>
                        )}
                    </>
                }
            />

            {isAdmin && managers.length === 0 && !managersQuery.isLoading ? (
                <Empty
                    icon={<Trophy size={32} />}
                    title="No counselling managers yet"
                    description="Invite a manager from the Users page first — counsellors and targets roll up under managers."
                />
            ) : dashQuery.isLoading || !data ? (
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
                    title={isAdmin ? 'This manager has no counsellors yet' : 'No counsellors on your team yet'}
                    description={
                        isAdmin
                            ? 'Assign counsellors to this manager from the Users page — once they have direct reports, targets and rollups appear here.'
                            : 'Once an admin assigns counsellors to you, their performance will roll up here.'
                    }
                />
            ) : (
                <>
                    {isAdmin && data.manager && (
                        <ManagerTargetCard
                            manager={data.manager}
                            onSetTarget={() => data.manager && setTargetSubject(data.manager)}
                        />
                    )}
                    <KpiRow data={data} />
                    <PerformerRow data={data} />
                    <TeamTable
                        data={data}
                        onEdit={setEditing}
                        onSetTarget={(m) => setTargetSubject(m)}
                    />
                    <MonthlyTrackerRow data={data} />
                    <IncentiveSlabsCard slabs={data.incentiveSlabs} />
                </>
            )}

            <EditMemberModal
                member={editing}
                onClose={() => setEditing(null)}
            />

            <SetTargetModal
                subject={targetSubject}
                onClose={() => setTargetSubject(null)}
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

// Admin-only card that surfaces the manager's own personal target (separate
// from the team rollup). Counsellor targets sum into the team total; the
// manager's target is their individual quota — the admin sets it from here.
const ManagerTargetCard = ({ manager, onSetTarget }: { manager: ManagerProfile; onSetTarget: () => void }) => {
    const hasTarget = manager.target.revenue > 0 || manager.target.signups > 0 || manager.target.enrolments > 0
    return (
        <Card className="!p-4 mb-4 border-l-4 border-[var(--color-brand-500)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-[var(--color-brand-700)] inline-flex items-center gap-1">
                        <Target size={12} /> Manager target · this month
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-fg">{manager.name}</span>
                        <span className="text-xs text-fg-muted">{manager.email}</span>
                    </div>
                    {hasTarget ? (
                        <div className="mt-2 flex items-center gap-4 text-xs text-fg-soft flex-wrap">
                            <span>
                                <span className="text-fg-muted">Revenue · </span>
                                <span className="font-mono text-fg">{fmtPaiseINR(manager.target.revenue)}</span>
                            </span>
                            <span>
                                <span className="text-fg-muted">Enrolments · </span>
                                <span className="font-mono text-fg">{manager.target.enrolments}</span>
                            </span>
                            <span>
                                <span className="text-fg-muted">Signups · </span>
                                <span className="font-mono text-fg">{manager.target.signups}</span>
                            </span>
                        </div>
                    ) : (
                        <div className="mt-2 text-xs text-fg-muted">No personal target set for this month yet.</div>
                    )}
                </div>
                <Button
                    size="sm"
                    leftIcon={<Target size={12} />}
                    onClick={onSetTarget}>
                    {hasTarget ? 'Update target' : 'Set target'}
                </Button>
            </div>
        </Card>
    )
}

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

const TeamTable = ({
    data,
    onEdit,
    onSetTarget
}: {
    data: ManagerDashboard
    onEdit: (m: ManagerMember) => void
    onSetTarget: (m: ManagerMember) => void
}) => (
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
                                <div className="inline-flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        leftIcon={<Target size={12} />}
                                        onClick={() => onSetTarget(m)}>
                                        Set target
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        leftIcon={<UserPen size={12} />}
                                        onClick={() => onEdit(m)}>
                                        Edit
                                    </Button>
                                </div>
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

// Per-user monthly-target editor. Used both for counsellors (set by manager
// or admin) and for the manager's own personal target (admin/SA only — the
// backend rejects manager self-set). Same modal works for both because the
// `CounsellorTarget` table is keyed on a User id, not a role.
const SetTargetModal = ({ subject, onClose }: { subject: TargetSubject | null; onClose: () => void }) => {
    const queryClient = useQueryClient()
    const [signups, setSignups] = useState('0')
    const [enrolments, setEnrolments] = useState('0')
    const [revenueRupees, setRevenueRupees] = useState('0')

    // Seed from the row when the modal opens. Revenue from the backend is in
    // paise; we let admins type rupees and convert on submit.
    useEffect(() => {
        if (!subject) return
        setSignups(String(subject.target.signups || 0))
        setEnrolments(String(subject.target.enrolments || 0))
        setRevenueRupees(String(Math.round((subject.target.revenue || 0) / 100)))
    }, [subject])

    const mutation = useMutation({
        mutationFn: () => {
            if (!subject) throw new Error('No subject selected')
            const now = new Date()
            const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
            return setCounsellorTarget({
                counsellorId: subject.id,
                periodStart,
                targetSignups: Math.max(0, Math.trunc(Number(signups) || 0)),
                targetEnrolments: Math.max(0, Math.trunc(Number(enrolments) || 0)),
                targetRevenue: Math.max(0, Math.round((Number(revenueRupees) || 0) * 100))
            })
        },
        onSuccess: () => {
            toast.success('Target updated')
            void queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] })
            onClose()
        },
        onError: (err: unknown) => toast.error(toApiError(err).message || 'Could not save target')
    })

    return (
        <Modal
            open={!!subject}
            onClose={onClose}
            title="Set monthly target"
            description={subject ? `${subject.name} · current month` : ''}
            footer={
                subject && (
                    <>
                        <Button
                            variant="ghost"
                            onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            loading={mutation.isPending}
                            onClick={() => mutation.mutate()}>
                            Save target
                        </Button>
                    </>
                )
            }>
            {subject && (
                <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                            label="Signups"
                            type="number"
                            min={0}
                            value={signups}
                            onChange={(e) => setSignups(e.target.value)}
                        />
                        <Input
                            label="Enrolments"
                            type="number"
                            min={0}
                            value={enrolments}
                            onChange={(e) => setEnrolments(e.target.value)}
                        />
                    </div>
                    <Input
                        label="Revenue target (₹)"
                        type="number"
                        min={0}
                        value={revenueRupees}
                        onChange={(e) => setRevenueRupees(e.target.value)}
                        hint="Stored in paise. Achieved revenue is the sum of paid invoices linked to this user in the period."
                    />
                    <div className="text-[11px] text-fg-muted inline-flex items-center gap-1">
                        <ChevronRight size={11} /> Targets are scoped to the current calendar month. Counsellor targets roll up into team totals; the manager's own target is a personal quota.
                    </div>
                </div>
            )}
        </Modal>
    )
}
