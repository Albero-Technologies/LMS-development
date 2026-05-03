import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Calendar,
    Users,
    BookOpen,
    MessageSquare,
    TicketCheck,
    Pause,
    Play,
    Save,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    KeyRound
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Modal } from '@shared/components/ui/Modal'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'
import { Select } from '@shared/components/ui/Select'
import { Tabs } from '@shared/components/ui/Tabs'
import { useAuthStore, fullName } from '@shared/stores/authStore'
import {
    FEATURE_FLAGS,
    createTenantPayment,
    getTenantDetail,
    isFeatureEnabled,
    listTenantPayments,
    readBillingPlan,
    readContacts,
    readEnvironment,
    readFeatureFlags,
    readNotes,
    sendBillingReminder,
    setTenantPaymentStatus,
    setTenantStatus,
    updateTenantById,
    type BillingPlan,
    type FeatureFlagKey,
    type FeatureFlags,
    type TenantContacts,
    type TenantDetail,
    type TenantEnvironment,
    type TenantNote,
    type TenantPaymentStatus,
    type TenantSettings,
    type TenantStatus
} from '../services/tenant.service'

const STATUS_TONE: Record<TenantStatus, 'ok' | 'warn' | 'default'> = {
    ACTIVE: 'ok',
    TRIAL: 'warn',
    SUSPENDED: 'default'
}

type Tab = 'overview' | 'features' | 'billing' | 'payments' | 'environment' | 'contacts' | 'notes'

const TAB_DEFS = [
    { value: 'overview' as const, label: 'Overview' },
    { value: 'features' as const, label: 'Features' },
    { value: 'billing' as const, label: 'Billing' },
    { value: 'payments' as const, label: 'Payments' },
    { value: 'environment' as const, label: 'Environment' },
    { value: 'contacts' as const, label: 'Contacts' },
    { value: 'notes' as const, label: 'Notes' }
]

export const TenantDetailPage = () => {
    const { id = '' } = useParams()
    const [tab, setTab] = useState<Tab>('overview')
    const queryClient = useQueryClient()
    const confirm = useConfirm()

    const detailQuery = useQuery({
        queryKey: ['tenants', id],
        queryFn: () => getTenantDetail(id),
        enabled: id.length > 0,
        staleTime: 60_000
    })

    const statusMutation = useMutation({
        mutationFn: (status: TenantStatus) => setTenantStatus(id, status),
        onSuccess: (tenant) => {
            toast.success(`Tenant status updated to ${tenant.status}`)
            void queryClient.invalidateQueries({ queryKey: ['tenants'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not update status')
    })

    if (detailQuery.isLoading) {
        return (
            <>
                <BackLink />
                <Card>
                    <Skeleton className="h-6 w-1/3 mb-3" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </Card>
            </>
        )
    }

    if (detailQuery.isError || !detailQuery.data) {
        return (
            <>
                <BackLink />
                <Empty
                    icon={<Building2 size={32} />}
                    title="Tenant not found"
                    description="It may have been deleted or you're missing access."
                />
            </>
        )
    }

    const tenant = detailQuery.data
    const isSuspended = tenant.status === 'SUSPENDED'

    return (
        <>
            <BackLink />
            <PageHeader
                eyebrow="Super Admin · Tenant"
                title={tenant.name}
                description={`/${tenant.slug} · created ${new Date(tenant.createdAt).toLocaleDateString()}`}
                actions={
                    <>
                        <Badge tone={STATUS_TONE[tenant.status]}>{tenant.status}</Badge>
                        <Badge tone="brand">{tenant.plan}</Badge>
                        {isSuspended ? (
                            <Button
                                size="sm"
                                leftIcon={<Play size={12} />}
                                loading={statusMutation.isPending}
                                onClick={() => statusMutation.mutate('ACTIVE')}>
                                Reinstate
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<Pause size={12} />}
                                loading={statusMutation.isPending}
                                onClick={async () => {
                                    const ok = await confirm({
                                        title: `Suspend ${tenant.name}?`,
                                        description:
                                            'Every user in this tenant is locked out until you reinstate. Public landing pages also stop loading.',
                                        confirmLabel: 'Suspend',
                                        tone: 'danger'
                                    })
                                    if (ok) statusMutation.mutate('SUSPENDED')
                                }}
                                className="!text-[var(--color-danger)]">
                                Suspend
                            </Button>
                        )}
                    </>
                }
            />

            <Tabs<Tab>
                tabs={TAB_DEFS}
                value={tab}
                onChange={setTab}
                className="mb-4"
            />

            {tab === 'overview' && <OverviewTab tenant={tenant} />}
            {tab === 'features' && (
                <FeaturesTab
                    tenant={tenant}
                    queryKey={['tenants', id]}
                />
            )}
            {tab === 'billing' && (
                <BillingTab
                    tenant={tenant}
                    queryKey={['tenants', id]}
                />
            )}
            {tab === 'payments' && <PaymentsTab tenantId={id} />}
            {tab === 'environment' && (
                <EnvironmentTab
                    tenant={tenant}
                    queryKey={['tenants', id]}
                />
            )}
            {tab === 'contacts' && (
                <ContactsTab
                    tenant={tenant}
                    queryKey={['tenants', id]}
                />
            )}
            {tab === 'notes' && (
                <NotesTab
                    tenant={tenant}
                    queryKey={['tenants', id]}
                />
            )}
        </>
    )
}

// -----------------------------------------------------------------------------
// Overview tab
// -----------------------------------------------------------------------------

const OverviewTab = ({ tenant }: { tenant: TenantDetail }) => (
    <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-fg mb-3">Tenant info</h3>
            <Row
                label="Name"
                value={tenant.name}
            />
            <Row
                label="Slug"
                value={`/${tenant.slug}`}
                mono
            />
            <Row
                label="Plan"
                value={tenant.plan}
            />
            <Row
                label="Status"
                value={tenant.status}
            />
            <Row
                label="Created"
                value={new Date(tenant.createdAt).toLocaleString()}
            />
            <Row
                label="Updated"
                value={new Date(tenant.updatedAt).toLocaleString()}
            />
        </Card>

        <Card>
            <h3 className="text-sm font-semibold text-fg mb-3">By the numbers</h3>
            <StatRow
                label="Users"
                value={tenant.counts.users}
                icon={<Users size={14} />}
            />
            <StatRow
                label="Courses"
                value={tenant.counts.courses}
                icon={<BookOpen size={14} />}
            />
            <StatRow
                label="Enquiries"
                value={tenant.counts.enquiries}
                icon={<MessageSquare size={14} />}
            />
            <StatRow
                label="Tickets"
                value={tenant.counts.tickets}
                icon={<TicketCheck size={14} />}
            />
        </Card>

        <Card className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-fg mb-3">Tenant admin</h3>
            {tenant.admin ? <AdminCard admin={tenant.admin} /> : <p className="text-sm text-fg-soft">No ADMIN user found for this tenant.</p>}
        </Card>

        <Card className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-fg mb-1">Coming next</h3>
            <p className="text-xs text-fg-muted mb-3">
                Environment (per-tenant credentials) lands in the next batch alongside the tenant-side Razorpay checkout.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-fg-soft">
                <span className="px-2 py-1 rounded border border-dashed">Environment (coming)</span>
                <Link
                    to="/app/audit-logs"
                    className="px-2 py-1 rounded border hover:bg-surface-hover text-[var(--color-brand-500)]">
                    Activity logs (open)
                </Link>
            </div>
        </Card>
    </div>
)

// -----------------------------------------------------------------------------
// Features tab — per-tenant feature flags. Toggles persist into
// `tenant.settings.features`. Backend gates can read these as enforcement
// gets wired in module by module.
// -----------------------------------------------------------------------------

const FeaturesTab = ({ tenant, queryKey }: { tenant: TenantDetail; queryKey: readonly unknown[] }) => {
    const queryClient = useQueryClient()
    const initial = useMemo(() => readFeatureFlags(tenant), [tenant])
    const [flags, setFlags] = useState<FeatureFlags>(initial)

    useEffect(() => setFlags(initial), [initial])

    const dirty = useMemo(() => {
        for (const def of FEATURE_FLAGS) {
            if (isFeatureEnabled(initial, def.key) !== isFeatureEnabled(flags, def.key)) return true
        }
        return false
    }, [initial, flags])

    const saveMutation = useMutation({
        mutationFn: () => {
            const settings: TenantSettings = { ...(tenant.settings ?? {}), features: flags }
            return updateTenantById(tenant.id, { settings })
        },
        onSuccess: () => {
            toast.success('Feature flags saved')
            void queryClient.invalidateQueries({ queryKey })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save features')
    })

    const toggle = (key: FeatureFlagKey) => {
        const next = { ...flags, [key]: !isFeatureEnabled(flags, key) }
        setFlags(next)
    }

    const reset = () => setFlags(initial)

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-end gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={reset}
                    disabled={!dirty}>
                    Discard
                </Button>
                <Button
                    size="sm"
                    leftIcon={<Save size={12} />}
                    loading={saveMutation.isPending}
                    disabled={!dirty}
                    onClick={() => saveMutation.mutate()}>
                    Save
                </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
                {FEATURE_FLAGS.map((def) => {
                    const enabled = isFeatureEnabled(flags, def.key)
                    return (
                        <Card
                            key={def.key}
                            className="!p-4 flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-fg">{def.label}</span>
                                    <span className="text-[10px] font-mono text-fg-muted">{def.key}</span>
                                </div>
                                <p className="mt-1 text-xs text-fg-soft">{def.description}</p>
                            </div>
                            <Toggle
                                checked={enabled}
                                onChange={() => toggle(def.key)}
                            />
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] ' +
            (checked ? 'bg-[var(--color-brand-500)]' : 'bg-[var(--color-border)]')
        }>
        <span
            aria-hidden
            className={
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ' +
                (checked ? 'translate-x-5' : 'translate-x-0')
            }
        />
    </button>
)

// -----------------------------------------------------------------------------
// Billing tab — plan/cycle/amount + send-reminder flow (§4.2).
// Plan settings live in `tenant.settings.billing`. Reminders go through the
// notification queue (email + in-app) and append a Note for the audit trail.
// -----------------------------------------------------------------------------

const CYCLE_OPTIONS: { value: NonNullable<BillingPlan['cycle']>; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
]

const BillingTab = ({ tenant, queryKey }: { tenant: TenantDetail; queryKey: readonly unknown[] }) => {
    const queryClient = useQueryClient()
    const initial = useMemo(() => readBillingPlan(tenant), [tenant])
    const [plan, setPlan] = useState<BillingPlan>(initial)
    useEffect(() => setPlan(initial), [initial])

    // Reminder draft state — separate from plan state because sending is a
    // distinct mutation that can happen multiple times.
    const [reminderAmount, setReminderAmount] = useState<string>('')
    const [reminderDueDate, setReminderDueDate] = useState<string>('')
    const [reminderNote, setReminderNote] = useState<string>('')

    const dirty =
        plan.cycle !== initial.cycle ||
        plan.amount !== initial.amount ||
        plan.currency !== initial.currency ||
        plan.nextDueDate !== initial.nextDueDate ||
        plan.notes !== initial.notes

    const savePlanMutation = useMutation({
        mutationFn: () => {
            const settings: TenantSettings = { ...(tenant.settings ?? {}), billing: plan }
            return updateTenantById(tenant.id, { settings })
        },
        onSuccess: () => {
            toast.success('Billing plan saved')
            void queryClient.invalidateQueries({ queryKey })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save billing plan')
    })

    const reminderMutation = useMutation({
        mutationFn: () =>
            sendBillingReminder(tenant.id, {
                amount: reminderAmount ? Number(reminderAmount) : plan.amount,
                currency: plan.currency,
                dueDate: reminderDueDate || plan.nextDueDate || undefined,
                planLabel: tenant.plan + (plan.cycle ? ` · ${plan.cycle}` : ''),
                note: reminderNote.trim() || undefined
            }),
        onSuccess: (res) => {
            toast.success(`Reminder queued — sent to ${res.sentTo}`)
            setReminderAmount('')
            setReminderDueDate('')
            setReminderNote('')
            void queryClient.invalidateQueries({ queryKey })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not send reminder')
    })

    return (
        <div className="grid lg:grid-cols-2 gap-4">
            <Card>
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-fg">Plan & cycle</h3>
                        <p className="mt-0.5 text-xs text-fg-muted">Used as the default for billing reminders. Stored on the tenant settings.</p>
                    </div>
                    <Button
                        size="sm"
                        leftIcon={<Save size={12} />}
                        loading={savePlanMutation.isPending}
                        disabled={!dirty}
                        onClick={() => savePlanMutation.mutate()}>
                        Save
                    </Button>
                </div>

                <div className="space-y-3">
                    <Select
                        label="Billing cycle"
                        value={plan.cycle ?? 'monthly'}
                        onChange={(e) => setPlan({ ...plan, cycle: e.target.value as BillingPlan['cycle'] })}>
                        {CYCLE_OPTIONS.map((c) => (
                            <option
                                key={c.value}
                                value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </Select>
                    <div className="grid grid-cols-[2fr_1fr] gap-3">
                        <Input
                            label="Amount"
                            type="number"
                            min={0}
                            value={plan.amount ?? ''}
                            onChange={(e) => setPlan({ ...plan, amount: e.target.value === '' ? undefined : Number(e.target.value) })}
                            placeholder="0"
                        />
                        <Select
                            label="Currency"
                            value={plan.currency ?? 'INR'}
                            onChange={(e) => setPlan({ ...plan, currency: e.target.value })}>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </Select>
                    </div>
                    <Input
                        label="Next due date"
                        type="date"
                        value={plan.nextDueDate ? plan.nextDueDate.slice(0, 10) : ''}
                        onChange={(e) => setPlan({ ...plan, nextDueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                    <Textarea
                        label="Internal notes (optional)"
                        rows={2}
                        value={plan.notes ?? ''}
                        onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                        placeholder="Discount terms, contract end date, etc."
                    />
                </div>
            </Card>

            <Card>
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-fg">Send a reminder</h3>
                        <p className="mt-0.5 text-xs text-fg-muted">
                            Emails the tenant's primary contact (or ADMIN), pings their bell, and logs a Note with what was sent.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Override amount"
                            type="number"
                            min={0}
                            value={reminderAmount}
                            onChange={(e) => setReminderAmount(e.target.value)}
                            placeholder={plan.amount ? String(plan.amount) : 'plan default'}
                        />
                        <Input
                            label="Override due date"
                            type="date"
                            value={reminderDueDate}
                            onChange={(e) => setReminderDueDate(e.target.value)}
                        />
                    </div>
                    <Textarea
                        label="Note to admin (optional)"
                        rows={3}
                        value={reminderNote}
                        onChange={(e) => setReminderNote(e.target.value)}
                        placeholder="One-line context — e.g. 'Final reminder before access pause on Friday.'"
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            leftIcon={<Mail size={12} />}
                            loading={reminderMutation.isPending}
                            onClick={() => reminderMutation.mutate()}>
                            Send reminder
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

// -----------------------------------------------------------------------------
// Payments tab — SaaS billing records (platform invoicing the tenant). §4.4 + §10.2.
// SA can issue an invoice; tenant-side Razorpay checkout lands in the next batch.
// For now SA can also manually flip status (e.g. wire transfer reconciliation).
// -----------------------------------------------------------------------------

const PAYMENT_STATUS_TONE: Record<TenantPaymentStatus, 'ok' | 'warn' | 'danger' | 'default'> = {
    PAID: 'ok',
    PENDING: 'warn',
    FAILED: 'danger',
    CANCELLED: 'default',
    REFUNDED: 'default'
}

const fmtCurrency = (paise: number, currency: string): string => {
    if (currency === 'INR') return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    return `${currency} ${(paise / 100).toFixed(2)}`
}

const PaymentsTab = ({ tenantId }: { tenantId: string }) => {
    const queryClient = useQueryClient()
    const confirm = useConfirm()
    const [createOpen, setCreateOpen] = useState(false)

    const paymentsQuery = useQuery({
        queryKey: ['tenants', tenantId, 'payments'],
        queryFn: () => listTenantPayments(tenantId),
        staleTime: 30_000
    })

    const createMutation = useMutation({
        mutationFn: (payload: {
            amountRupees: number
            currency: string
            planLabel?: string
            periodStart?: string
            periodEnd?: string
            description?: string
        }) =>
            createTenantPayment(tenantId, {
                amount: Math.round(payload.amountRupees * 100),
                currency: payload.currency,
                planLabel: payload.planLabel,
                periodStart: payload.periodStart ? new Date(payload.periodStart).toISOString() : undefined,
                periodEnd: payload.periodEnd ? new Date(payload.periodEnd).toISOString() : undefined,
                description: payload.description
            }),
        onSuccess: () => {
            toast.success('Payment record created')
            void queryClient.invalidateQueries({ queryKey: ['tenants', tenantId, 'payments'] })
            setCreateOpen(false)
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not create payment')
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: TenantPaymentStatus }) => setTenantPaymentStatus(tenantId, id, status),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['tenants', tenantId, 'payments'] }),
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not update status')
    })

    const payments = paymentsQuery.data ?? []
    const paidTotal = payments.filter((p) => p.status === 'PAID').reduce((n, p) => n + p.amount, 0)
    const pendingTotal = payments.filter((p) => p.status === 'PENDING').reduce((n, p) => n + p.amount, 0)

    return (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
                <SummaryCard
                    label="Paid (lifetime)"
                    value={fmtCurrency(paidTotal, 'INR')}
                />
                <SummaryCard
                    label="Pending"
                    value={fmtCurrency(pendingTotal, 'INR')}
                />
                <Card className="!p-4 flex items-center justify-end">
                    <Button
                        size="sm"
                        leftIcon={<Plus size={12} />}
                        onClick={() => setCreateOpen(true)}>
                        New invoice
                    </Button>
                </Card>
            </div>

            {paymentsQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : payments.length === 0 ? (
                <Empty
                    icon={<Mail size={32} />}
                    title="No SaaS billing records yet"
                    description="Create the first invoice to bill the tenant for their subscription."
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">Created</th>
                                    <th className="py-3 px-5">Plan / period</th>
                                    <th className="py-3 px-5">Amount</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5 text-xs text-fg-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-5">
                                            <div className="text-fg">{p.planLabel ?? '—'}</div>
                                            {(p.periodStart || p.periodEnd) && (
                                                <div className="text-xs text-fg-muted">
                                                    {p.periodStart ? new Date(p.periodStart).toLocaleDateString() : '?'} →{' '}
                                                    {p.periodEnd ? new Date(p.periodEnd).toLocaleDateString() : '?'}
                                                </div>
                                            )}
                                            {p.description && <div className="text-xs text-fg-soft mt-0.5 line-clamp-1">{p.description}</div>}
                                        </td>
                                        <td className="py-3 px-5 font-mono text-sm">{fmtCurrency(p.amount, p.currency)}</td>
                                        <td className="py-3 px-5">
                                            <Badge tone={PAYMENT_STATUS_TONE[p.status]}>{p.status}</Badge>
                                            {p.paidAt && (
                                                <div className="text-[10px] text-fg-muted mt-0.5">Paid {new Date(p.paidAt).toLocaleDateString()}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-right">
                                            {p.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        loading={statusMutation.isPending && statusMutation.variables?.id === p.id}
                                                        onClick={() => statusMutation.mutate({ id: p.id, status: 'PAID' })}>
                                                        Mark paid
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={async () => {
                                                            const ok = await confirm({
                                                                title: 'Cancel this invoice?',
                                                                description:
                                                                    'It is removed from the outstanding ledger. The tenant is no longer billed for this entry.',
                                                                confirmLabel: 'Cancel invoice',
                                                                cancelLabel: 'Keep',
                                                                tone: 'danger'
                                                            })
                                                            if (ok) statusMutation.mutate({ id: p.id, status: 'CANCELLED' })
                                                        }}
                                                        className="!text-[var(--color-danger)]">
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                            {p.status === 'PAID' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={async () => {
                                                        const ok = await confirm({
                                                            title: 'Mark as refunded?',
                                                            description:
                                                                'This only flips the local status — issue the actual refund from your Razorpay dashboard.',
                                                            confirmLabel: 'Mark refunded',
                                                            tone: 'warning'
                                                        })
                                                        if (ok) statusMutation.mutate({ id: p.id, status: 'REFUNDED' })
                                                    }}>
                                                    Refund
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <CreatePaymentModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={(payload) => createMutation.mutate(payload)}
                isPending={createMutation.isPending}
            />
        </div>
    )
}

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
    <Card className="!p-4">
        <div className="text-xs text-fg-muted">{label}</div>
        <div className="mt-1 font-mono text-2xl font-semibold text-fg">{value}</div>
    </Card>
)

const CreatePaymentModal = ({
    open,
    onClose,
    onSubmit,
    isPending
}: {
    open: boolean
    onClose: () => void
    onSubmit: (payload: {
        amountRupees: number
        currency: string
        planLabel?: string
        periodStart?: string
        periodEnd?: string
        description?: string
    }) => void
    isPending: boolean
}) => {
    const [amountRupees, setAmountRupees] = useState('')
    const [currency, setCurrency] = useState('INR')
    const [planLabel, setPlanLabel] = useState('')
    const [periodStart, setPeriodStart] = useState('')
    const [periodEnd, setPeriodEnd] = useState('')
    const [description, setDescription] = useState('')

    const reset = () => {
        setAmountRupees('')
        setCurrency('INR')
        setPlanLabel('')
        setPeriodStart('')
        setPeriodEnd('')
        setDescription('')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const n = Number(amountRupees)
        if (!Number.isFinite(n) || n <= 0) return
        onSubmit({
            amountRupees: n,
            currency,
            planLabel: planLabel.trim() || undefined,
            periodStart: periodStart || undefined,
            periodEnd: periodEnd || undefined,
            description: description.trim() || undefined
        })
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="New SaaS invoice"
            description="Issues a billing record for this tenant. Razorpay payment flow lands in the next batch — for now you can mark wire transfers as paid manually."
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            reset()
                            onClose()
                        }}>
                        Cancel
                    </Button>
                    <Button
                        form="new-tp-form"
                        type="submit"
                        loading={isPending}
                        disabled={!amountRupees || Number(amountRupees) <= 0}>
                        Create
                    </Button>
                </>
            }>
            <form
                id="new-tp-form"
                onSubmit={submit}
                className="space-y-4">
                <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <Input
                        label="Amount"
                        type="number"
                        min={1}
                        required
                        value={amountRupees}
                        onChange={(e) => setAmountRupees(e.target.value)}
                        placeholder="2999"
                    />
                    <Select
                        label="Currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </Select>
                </div>
                <Input
                    label="Plan label (optional)"
                    value={planLabel}
                    onChange={(e) => setPlanLabel(e.target.value)}
                    placeholder="e.g. GROWTH · monthly"
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Period start"
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                    />
                    <Input
                        label="Period end"
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                </div>
                <Textarea
                    label="Description (optional)"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Internal notes or line-item description for the invoice."
                />
            </form>
        </Modal>
    )
}

// -----------------------------------------------------------------------------
// Contacts tab — primary + secondary email/phone, used for billing reminders.
// -----------------------------------------------------------------------------

const ContactsTab = ({ tenant, queryKey }: { tenant: TenantDetail; queryKey: readonly unknown[] }) => {
    const queryClient = useQueryClient()
    const initial = useMemo(() => readContacts(tenant), [tenant])
    const [contacts, setContacts] = useState<TenantContacts>(initial)

    useEffect(() => setContacts(initial), [initial])

    const dirty =
        contacts.primaryEmail !== initial.primaryEmail ||
        contacts.primaryPhone !== initial.primaryPhone ||
        contacts.secondaryEmail !== initial.secondaryEmail ||
        contacts.secondaryPhone !== initial.secondaryPhone

    const saveMutation = useMutation({
        mutationFn: () => {
            const settings: TenantSettings = { ...(tenant.settings ?? {}), contacts }
            return updateTenantById(tenant.id, { settings })
        },
        onSuccess: () => {
            toast.success('Contacts saved')
            void queryClient.invalidateQueries({ queryKey })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save contacts')
    })

    return (
        <Card className="max-w-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-fg">Tenant contacts</h3>
                    <p className="mt-0.5 text-xs text-fg-muted">
                        Used for billing alerts, reminder emails, and outage broadcasts. Stored on the tenant settings.
                    </p>
                </div>
                <Button
                    size="sm"
                    leftIcon={<Save size={12} />}
                    loading={saveMutation.isPending}
                    disabled={!dirty}
                    onClick={() => saveMutation.mutate()}>
                    Save
                </Button>
            </div>

            <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        label="Primary email"
                        type="email"
                        value={contacts.primaryEmail ?? ''}
                        onChange={(e) => setContacts({ ...contacts, primaryEmail: e.target.value })}
                        leftIcon={<Mail size={14} />}
                        placeholder="admin@institute.edu"
                    />
                    <Input
                        label="Primary phone"
                        value={contacts.primaryPhone ?? ''}
                        onChange={(e) => setContacts({ ...contacts, primaryPhone: e.target.value })}
                        leftIcon={<Phone size={14} />}
                        placeholder="+91 ..."
                    />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        label="Secondary email"
                        type="email"
                        value={contacts.secondaryEmail ?? ''}
                        onChange={(e) => setContacts({ ...contacts, secondaryEmail: e.target.value })}
                        leftIcon={<Mail size={14} />}
                    />
                    <Input
                        label="Secondary phone"
                        value={contacts.secondaryPhone ?? ''}
                        onChange={(e) => setContacts({ ...contacts, secondaryPhone: e.target.value })}
                        leftIcon={<Phone size={14} />}
                    />
                </div>
            </div>
        </Card>
    )
}

// -----------------------------------------------------------------------------
// Notes tab — append-only freeform notes attached to a tenant.
// -----------------------------------------------------------------------------

const NotesTab = ({ tenant, queryKey }: { tenant: TenantDetail; queryKey: readonly unknown[] }) => {
    const queryClient = useQueryClient()
    const confirm = useConfirm()
    const author = useAuthStore((s) => s.user)
    const notes = useMemo(() => readNotes(tenant), [tenant])
    const [draft, setDraft] = useState('')

    const writeNotes = useMutation({
        mutationFn: (next: TenantNote[]) => {
            const settings: TenantSettings = { ...(tenant.settings ?? {}), notes: next }
            return updateTenantById(tenant.id, { settings })
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save notes')
    })

    const addNote = () => {
        const body = draft.trim()
        if (body.length === 0) return
        const newNote: TenantNote = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
            body,
            createdAt: new Date().toISOString(),
            createdBy: author ? { id: author.id, name: fullName(author) || author.email } : undefined
        }
        writeNotes.mutate([newNote, ...notes], {
            onSuccess: () => {
                setDraft('')
                toast.success('Note added')
            }
        })
    }

    const deleteNote = async (noteId: string) => {
        const ok = await confirm({
            title: 'Delete this note?',
            description: 'Once deleted, the note is gone for everyone with access to this tenant.',
            confirmLabel: 'Delete',
            tone: 'danger'
        })
        if (!ok) return
        writeNotes.mutate(
            notes.filter((n) => n.id !== noteId),
            {
                onSuccess: () => toast.success('Note deleted')
            }
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-fg mb-3">Add note</h3>
                <Textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Conversation with admin, billing context, support escalation, anything worth surfacing later."
                />
                <div className="mt-3 flex justify-end">
                    <Button
                        size="sm"
                        leftIcon={<Plus size={12} />}
                        loading={writeNotes.isPending}
                        disabled={draft.trim().length === 0}
                        onClick={addNote}>
                        Add
                    </Button>
                </div>
            </Card>

            <Card>
                <h3 className="text-sm font-semibold text-fg mb-3">
                    {notes.length} note{notes.length === 1 ? '' : 's'}
                </h3>
                <p className="text-xs text-fg-muted">Notes are visible to all super-admins. Newest first.</p>
            </Card>

            {notes.length === 0 ? (
                <div className="lg:col-span-3">
                    <Empty
                        icon={<MessageSquare size={32} />}
                        title="No notes yet"
                        description="Notes show up here as super-admins log conversations or context."
                    />
                </div>
            ) : (
                <div className="lg:col-span-3 space-y-3">
                    {notes.map((n) => (
                        <Card key={n.id}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm text-fg whitespace-pre-wrap">{n.body}</div>
                                    <div className="mt-2 text-xs text-fg-muted inline-flex items-center gap-2 flex-wrap">
                                        <Calendar size={11} /> {new Date(n.createdAt).toLocaleString()}
                                        {n.createdBy && <span>· {n.createdBy.name}</span>}
                                    </div>
                                </div>
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label="Delete note"
                                    onClick={() => deleteNote(n.id)}
                                    className="!text-[var(--color-danger)]">
                                    <Trash2 size={13} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

// -----------------------------------------------------------------------------
// Shared bits
// -----------------------------------------------------------------------------

const BackLink = () => (
    <Link
        to="/app/admin/tenants"
        className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
        <ArrowLeft size={14} /> All tenants
    </Link>
)

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div className="flex items-center justify-between gap-3 border-b last:border-b-0 py-2.5">
        <span className="text-fg-muted text-xs">{label}</span>
        <span className={`text-fg ${mono ? 'font-mono text-xs' : 'text-sm'}`}>{value}</span>
    </div>
)

const StatRow = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-3 border-b last:border-b-0 py-2.5">
        <span className="inline-flex items-center gap-2 text-fg-muted text-xs">
            {icon} {label}
        </span>
        <span className="text-fg font-mono">{value}</span>
    </div>
)

const AdminCard = ({ admin }: { admin: NonNullable<TenantDetail['admin']> }) => (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Row
            label="Name"
            value={`${admin.firstName} ${admin.lastName}`}
        />
        <div className="flex items-center justify-between gap-3 border-b last:border-b-0 py-2.5">
            <span className="text-fg-muted text-xs inline-flex items-center gap-1">
                <Mail size={12} /> Email
            </span>
            <a
                href={`mailto:${admin.email}`}
                className="text-fg hover:text-[var(--color-brand-500)] truncate">
                {admin.email}
            </a>
        </div>
        <div className="flex items-center justify-between gap-3 border-b last:border-b-0 py-2.5">
            <span className="text-fg-muted text-xs inline-flex items-center gap-1">
                <Phone size={12} /> Phone
            </span>
            <span className="text-fg">{admin.phone ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b last:border-b-0 py-2.5">
            <span className="text-fg-muted text-xs inline-flex items-center gap-1">
                <Calendar size={12} /> Last login
            </span>
            <span className="text-fg">{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}</span>
        </div>
    </div>
)

// -----------------------------------------------------------------------------
// Environment tab (§4.1) — per-tenant credentials store.
//
// Stored in `tenant.settings.environment`. SUPER_ADMIN-only — these are secrets.
// Plaintext for now; encryption-at-rest with a KMS key is a follow-up. Fields
// are intentionally collapsed by default and obscured behind a reveal toggle so
// nothing leaks if someone walks past the SA's screen.
// -----------------------------------------------------------------------------

const EnvironmentTab = ({ tenant, queryKey }: { tenant: TenantDetail; queryKey: readonly unknown[] }) => {
    const queryClient = useQueryClient()
    const initial = useMemo(() => readEnvironment(tenant), [tenant])
    const [env, setEnv] = useState<TenantEnvironment>(initial)
    useEffect(() => setEnv(initial), [initial])
    const [reveal, setReveal] = useState(false)

    const dirty = JSON.stringify(env) !== JSON.stringify(initial)

    const saveMutation = useMutation({
        mutationFn: () => {
            const settings: TenantSettings = { ...(tenant.settings ?? {}), environment: env }
            return updateTenantById(tenant.id, { settings })
        },
        onSuccess: () => {
            toast.success('Environment saved')
            void queryClient.invalidateQueries({ queryKey })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save environment')
    })

    const updateSmtp = (patch: Partial<NonNullable<TenantEnvironment['smtp']>>) => setEnv((e) => ({ ...e, smtp: { ...(e.smtp ?? {}), ...patch } }))
    const updateRzp = (patch: Partial<NonNullable<TenantEnvironment['razorpay']>>) =>
        setEnv((e) => ({ ...e, razorpay: { ...(e.razorpay ?? {}), ...patch } }))
    const updateGS = (patch: Partial<NonNullable<TenantEnvironment['googleSheets']>>) =>
        setEnv((e) => ({ ...e, googleSheets: { ...(e.googleSheets ?? {}), ...patch } }))

    const inputType = reveal ? 'text' : 'password'

    return (
        <div className="space-y-4">
            <Card className="!p-4 flex items-start gap-3 bg-[var(--color-warning-soft)]">
                <KeyRound
                    size={18}
                    className="text-[var(--color-warning)] mt-0.5"
                />
                <div className="flex-1 text-xs">
                    <div className="font-semibold text-fg mb-0.5">Sensitive — secrets store</div>
                    <p className="text-fg-soft">
                        Per-tenant credentials. Leaving a section blank falls back to the platform-wide defaults set in environment variables. Stored
                        plaintext today; encryption-at-rest is queued for a follow-up.
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={reveal ? <EyeOff size={12} /> : <Eye size={12} />}
                    onClick={() => setReveal((v) => !v)}>
                    {reveal ? 'Hide' : 'Reveal'} secrets
                </Button>
            </Card>

            <Card>
                <h3 className="text-sm font-semibold text-fg mb-3">SMTP — outgoing email</h3>
                <p className="text-xs text-fg-muted mb-4">
                    When set, this tenant's emails (welcome, invites, billing reminders) are sent through these credentials instead of the platform
                    SMTP. Use a verified sender domain for best deliverability.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        label="Host"
                        value={env.smtp?.host ?? ''}
                        onChange={(e) => updateSmtp({ host: e.target.value })}
                        placeholder="smtp.gmail.com"
                    />
                    <Input
                        label="Port"
                        type="number"
                        value={env.smtp?.port?.toString() ?? ''}
                        onChange={(e) => updateSmtp({ port: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="587"
                    />
                    <Input
                        label="Username"
                        value={env.smtp?.user ?? ''}
                        onChange={(e) => updateSmtp({ user: e.target.value })}
                    />
                    <Input
                        label="Password / app password"
                        type={inputType}
                        value={env.smtp?.password ?? ''}
                        onChange={(e) => updateSmtp({ password: e.target.value })}
                    />
                    <Input
                        label="From address"
                        value={env.smtp?.from ?? ''}
                        onChange={(e) => updateSmtp({ from: e.target.value })}
                        placeholder="hello@yourdomain.com"
                    />
                    <Select
                        label="Connection security"
                        value={env.smtp?.secure ? 'tls' : 'starttls'}
                        onChange={(e) => updateSmtp({ secure: e.target.value === 'tls' })}>
                        <option value="starttls">STARTTLS (port 587)</option>
                        <option value="tls">TLS (port 465)</option>
                    </Select>
                </div>
            </Card>

            <Card>
                <h3 className="text-sm font-semibold text-fg mb-3">Razorpay</h3>
                <p className="text-xs text-fg-muted mb-4">
                    Tenant-specific Razorpay keys. When configured, course payments go straight to this tenant's Razorpay account. Webhook secret must
                    match the one set on the Razorpay dashboard for this account.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        label="Key ID"
                        value={env.razorpay?.keyId ?? ''}
                        onChange={(e) => updateRzp({ keyId: e.target.value })}
                        placeholder="rzp_live_..."
                    />
                    <Input
                        label="Key secret"
                        type={inputType}
                        value={env.razorpay?.keySecret ?? ''}
                        onChange={(e) => updateRzp({ keySecret: e.target.value })}
                    />
                    <Input
                        label="Webhook secret"
                        type={inputType}
                        value={env.razorpay?.webhookSecret ?? ''}
                        onChange={(e) => updateRzp({ webhookSecret: e.target.value })}
                        className="sm:col-span-2"
                    />
                </div>
            </Card>

            <Card>
                <h3 className="text-sm font-semibold text-fg mb-3">Google Sheets — service account</h3>
                <p className="text-xs text-fg-muted mb-4">
                    Paste the full service-account JSON here to use a tenant-owned account for enquiry sync. The Sheet ID itself is set per-tenant on
                    the Integrations page.
                </p>
                <Textarea
                    label="Service account JSON"
                    rows={8}
                    value={env.googleSheets?.serviceAccountJson ?? ''}
                    onChange={(e) => updateGS({ serviceAccountJson: e.target.value })}
                    placeholder='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----..."}'
                    style={reveal ? undefined : ({ WebkitTextSecurity: 'disc' } as unknown as CSSProperties)}
                />
            </Card>

            <div className="flex justify-end">
                <Button
                    size="sm"
                    leftIcon={<Save size={14} />}
                    disabled={!dirty}
                    loading={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}>
                    Save environment
                </Button>
            </div>
        </div>
    )
}
