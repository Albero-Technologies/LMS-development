import { useEffect, useMemo, useState } from 'react'
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
    Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Tabs } from '@shared/components/ui/Tabs'
import { useAuthStore } from '@shared/stores/authStore'
import {
    FEATURE_FLAGS,
    getTenantDetail,
    isFeatureEnabled,
    readContacts,
    readFeatureFlags,
    readNotes,
    setTenantStatus,
    updateTenantById,
    type FeatureFlagKey,
    type FeatureFlags,
    type TenantContacts,
    type TenantDetail,
    type TenantNote,
    type TenantSettings,
    type TenantStatus
} from '../services/tenant.service'

const STATUS_TONE: Record<TenantStatus, 'ok' | 'warn' | 'default'> = {
    ACTIVE: 'ok',
    TRIAL: 'warn',
    SUSPENDED: 'default'
}

type Tab = 'overview' | 'features' | 'contacts' | 'notes'

const TAB_DEFS = [
    { value: 'overview' as const, label: 'Overview' },
    { value: 'features' as const, label: 'Features' },
    { value: 'contacts' as const, label: 'Contacts' },
    { value: 'notes' as const, label: 'Notes' }
]

export const TenantDetailPage = () => {
    const { id = '' } = useParams()
    const [tab, setTab] = useState<Tab>('overview')
    const queryClient = useQueryClient()

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
                                onClick={() => {
                                    if (window.confirm(`Suspend ${tenant.name}? Their users will be locked out until you reinstate.`)) {
                                        statusMutation.mutate('SUSPENDED')
                                    }
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
            <p className="text-xs text-fg-muted mb-3">Environment (per-tenant credentials) and Payments tabs land in a follow-up batch.</p>
            <div className="flex flex-wrap gap-2 text-xs text-fg-soft">
                <span className="px-2 py-1 rounded border border-dashed">Environment (coming)</span>
                <span className="px-2 py-1 rounded border border-dashed">Payments (coming)</span>
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
            createdBy: author ? { id: author.id, name: author.name ?? author.email } : undefined
        }
        writeNotes.mutate([newNote, ...notes], {
            onSuccess: () => {
                setDraft('')
                toast.success('Note added')
            }
        })
    }

    const deleteNote = (noteId: string) => {
        if (!window.confirm('Delete this note?')) return
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
