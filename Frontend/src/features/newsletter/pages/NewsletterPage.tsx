import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, Search, Download, Trash2, MailX, MailCheck, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Select } from '@shared/components/ui/Select'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { listAllTenants } from '@features/admin/services/tenant.service'
import {
    listSubscribers,
    updateSubscriberStatus,
    deleteSubscriber,
    subscribersToCsv,
    downloadCsv,
    type NewsletterStatus,
    type NewsletterSubscriber
} from '../services/newsletter.service'

const fmtDate = (iso: string): string =>
    new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

type StatusFilter = NewsletterStatus | 'ALL'

export const NewsletterPage = () => {
    const queryClient = useQueryClient()
    const confirm = useConfirm()
    const role = useAuthStore((s) => s.user?.role)
    const isSuperAdmin = role === ROLES.SUPER_ADMIN

    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [search, setSearch] = useState('')

    // SA tenant picker — same UX as Lead Pipeline / CMS / Courses.
    const tenantsQuery = useQuery({
        queryKey: ['tenants'],
        queryFn: listAllTenants,
        staleTime: 60_000,
        enabled: isSuperAdmin
    })
    const tenants = tenantsQuery.data ?? []
    const [tenantId, setTenantId] = useState<string>(() =>
        isSuperAdmin ? localStorage.getItem('newsletter.tenantId') ?? '' : ''
    )
    useEffect(() => {
        if (!isSuperAdmin) return
        if (!tenantId && tenants.length > 0) setTenantId(tenants[0].id)
    }, [isSuperAdmin, tenantId, tenants])
    useEffect(() => {
        if (isSuperAdmin && tenantId) localStorage.setItem('newsletter.tenantId', tenantId)
    }, [isSuperAdmin, tenantId])

    const effectiveTenantId = isSuperAdmin && tenantId ? tenantId : undefined
    const cacheKey = useMemo(
        () => ['newsletter', effectiveTenantId ?? 'self'] as const,
        [effectiveTenantId]
    )

    const subsQuery = useQuery({
        queryKey: cacheKey,
        queryFn: () => listSubscribers({}, effectiveTenantId),
        staleTime: 30_000,
        enabled: !isSuperAdmin || !!effectiveTenantId
    })

    const allSubs = subsQuery.data ?? []

    // Filter client-side so the search feels instant. Server-side `q` is
    // wired but we don't need to round-trip for tiny lists.
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return allSubs.filter((s) => {
            if (statusFilter !== 'ALL' && s.status !== statusFilter) return false
            if (!q) return true
            return s.email.toLowerCase().includes(q) || (s.name?.toLowerCase().includes(q) ?? false)
        })
    }, [allSubs, statusFilter, search])

    const stats = useMemo(() => {
        const active = allSubs.filter((s) => s.status === 'active').length
        const unsubbed = allSubs.filter((s) => s.status === 'unsubscribed').length
        const last30 = allSubs.filter(
            (s) => Date.now() - new Date(s.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
        ).length
        return { total: allSubs.length, active, unsubbed, last30 }
    }, [allSubs])

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: NewsletterStatus }) =>
            updateSubscriberStatus(id, status, effectiveTenantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['newsletter'] })
            toast.success('Status updated')
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not update status'
            toast.error(msg)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSubscriber(id, effectiveTenantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['newsletter'] })
            toast.success('Subscriber removed')
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not delete'
            toast.error(msg)
        }
    })

    const handleDelete = async (sub: NewsletterSubscriber) => {
        const ok = await confirm({
            title: 'Remove subscriber?',
            message: `${sub.email} will be permanently removed from the list.`,
            confirmLabel: 'Remove',
            tone: 'danger'
        })
        if (ok) deleteMutation.mutate(sub.id)
    }

    const handleExport = () => {
        if (filtered.length === 0) {
            toast.info('Nothing to export')
            return
        }
        const csv = subscribersToCsv(filtered)
        const date = new Date().toISOString().slice(0, 10)
        downloadCsv(`newsletter-subscribers-${date}.csv`, csv)
    }

    return (
        <>
            <PageHeader
                eyebrow="Marketing"
                title="Newsletter subscribers"
                description={
                    isSuperAdmin
                        ? 'Manage every tenant’s subscriber list. Switch tenants from the picker.'
                        : 'Visitors who signed up for your newsletter from the public site.'
                }
                actions={
                    <>
                        {isSuperAdmin && (
                            <div className="w-56 sm:w-64">
                                <Select
                                    aria-label="Choose tenant"
                                    value={tenantId}
                                    onChange={(e) => setTenantId(e.target.value)}
                                    disabled={tenantsQuery.isLoading}>
                                    {tenants.length === 0 && (
                                        <option value="">{tenantsQuery.isLoading ? 'Loading…' : 'No tenants'}</option>
                                    )}
                                    {tenants.map((t) => (
                                        <option
                                            key={t.id}
                                            value={t.id}>
                                            {t.name} (/{t.slug})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Download size={14} />}
                            onClick={handleExport}>
                            Export CSV
                        </Button>
                    </>
                }
            />

            {/* Summary tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <StatTile label="Total" value={stats.total} icon={<Mail size={16} />} accent="brand" />
                <StatTile label="Active" value={stats.active} icon={<MailCheck size={16} />} accent="teal" />
                <StatTile label="Unsubscribed" value={stats.unsubbed} icon={<MailX size={16} />} accent="orange" />
                <StatTile label="Last 30 days" value={stats.last30} icon={<Inbox size={16} />} accent="purple" />
            </div>

            {/* Filter bar */}
            <Card padded={false} className="mb-4">
                <div className="p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="relative flex-1 min-w-0">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by email or name…"
                            className="w-full h-9 pl-9 pr-3 rounded-md border border-[var(--color-border)] bg-surface text-sm outline-none focus:border-[var(--color-brand-400)]"
                        />
                    </div>
                    <div className="inline-flex rounded-md border border-[var(--color-border)] bg-surface-2 p-1 self-stretch sm:self-auto">
                        {(['ALL', 'active', 'unsubscribed'] as StatusFilter[]).map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setStatusFilter(opt)}
                                className={`flex-1 sm:flex-initial rounded px-2.5 py-1 text-xs ${
                                    statusFilter === opt
                                        ? 'bg-surface text-fg shadow-sm'
                                        : 'text-fg-muted hover:text-fg'
                                }`}>
                                {opt === 'ALL' ? 'All' : opt[0].toUpperCase() + opt.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* List / table */}
            {subsQuery.isLoading ? (
                <Card>
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </Card>
            ) : subsQuery.isError ? (
                <Empty
                    icon={<Mail size={32} />}
                    title="Couldn't load subscribers"
                    description="Please try again."
                />
            ) : filtered.length === 0 ? (
                <Empty
                    icon={<Inbox size={32} />}
                    title={allSubs.length === 0 ? 'No subscribers yet' : 'No matches'}
                    description={
                        allSubs.length === 0
                            ? 'Sign-ups from your public newsletter form will appear here.'
                            : 'Try a different search or filter.'
                    }
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <Th>Email</Th>
                                    <Th>Name</Th>
                                    <Th>Status</Th>
                                    <Th>Source</Th>
                                    <Th>Subscribed</Th>
                                    <Th className="text-right pr-4">Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b border-[var(--color-border)] last:border-0 hover:bg-surface-hover">
                                        <td className="px-4 py-3 font-mono text-xs text-fg">{s.email}</td>
                                        <td className="px-4 py-3 text-fg">{s.name ?? <span className="text-fg-muted">—</span>}</td>
                                        <td className="px-4 py-3">
                                            <Badge tone={s.status === 'active' ? 'brand' : 'neutral'}>
                                                {s.status === 'active' ? 'Active' : 'Unsubscribed'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-fg-muted text-xs">{s.source}</td>
                                        <td className="px-4 py-3 text-fg-muted text-xs whitespace-nowrap">{fmtDate(s.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {s.status === 'active' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        leftIcon={<MailX size={13} />}
                                                        onClick={() =>
                                                            statusMutation.mutate({ id: s.id, status: 'unsubscribed' })
                                                        }
                                                        disabled={statusMutation.isPending}>
                                                        Unsub
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        leftIcon={<MailCheck size={13} />}
                                                        onClick={() =>
                                                            statusMutation.mutate({ id: s.id, status: 'active' })
                                                        }
                                                        disabled={statusMutation.isPending}>
                                                        Reactivate
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<Trash2 size={13} />}
                                                    onClick={() => handleDelete(s)}
                                                    disabled={deleteMutation.isPending}
                                                    aria-label="Delete">
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </>
    )
}

const Th = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <th className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-fg-muted ${className}`}>
        {children}
    </th>
)

const StatTile = ({
    label,
    value,
    icon,
    accent
}: {
    label: string
    value: number
    icon: React.ReactNode
    accent: 'brand' | 'teal' | 'orange' | 'purple'
}) => {
    const accentMap = {
        brand: 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]',
        teal: 'bg-[var(--color-teal-soft)] text-[var(--color-teal)]',
        orange: 'bg-[var(--color-orange-soft)] text-[var(--color-orange)]',
        purple: 'bg-[var(--color-purple-soft)] text-[var(--color-purple)]'
    }
    return (
        <div className="card p-3.5 sm:p-5 h-full">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-medium text-fg-muted">{label}</div>
                    <div className="mt-1.5 sm:mt-2 text-[1.4rem] sm:text-[1.75rem] font-bold tracking-tight text-fg font-mono leading-none">
                        {value}
                    </div>
                </div>
                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
