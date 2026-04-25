import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, Mail, Phone, Calendar, Users, BookOpen, MessageSquare, TicketCheck, Pause, Play } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { getTenantDetail, setTenantStatus, type TenantDetail, type TenantStatus } from '../services/tenant.service'

const STATUS_TONE: Record<TenantStatus, 'ok' | 'warn' | 'default'> = {
    ACTIVE: 'ok',
    TRIAL: 'warn',
    SUSPENDED: 'default'
}

export const TenantDetailPage = () => {
    const { id = '' } = useParams()
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
                    <h3 className="text-sm font-semibold text-fg mb-1">Other tabs</h3>
                    <p className="text-xs text-fg-muted mb-3">
                        Features, Environment, Payments, Contacts, Notes, and Activity Logs ship in follow-up batches.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-fg-soft">
                        <span className="px-2 py-1 rounded border border-dashed">Features (coming)</span>
                        <span className="px-2 py-1 rounded border border-dashed">Environment (coming)</span>
                        <span className="px-2 py-1 rounded border border-dashed">Payments (coming)</span>
                        <span className="px-2 py-1 rounded border border-dashed">Contacts (coming)</span>
                        <span className="px-2 py-1 rounded border border-dashed">Notes (coming)</span>
                        <Link
                            to="/app/audit-logs"
                            className="px-2 py-1 rounded border hover:bg-surface-hover text-[var(--color-brand-500)]">
                            Activity logs (open)
                        </Link>
                    </div>
                </Card>
            </div>
        </>
    )
}

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
