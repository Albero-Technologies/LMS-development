import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TicketCheck, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Modal } from '@shared/components/ui/Modal'
import { Tabs } from '@shared/components/ui/Tabs'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { listAllTenants } from '@features/admin/services/tenant.service'
import { PRIORITY_TONE, STATUS_LABEL, STATUS_TONE, createTicket, listTickets, type TicketPriority } from '../services/ticket.service'

const TAB_ORDER = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ALL'] as const
type Tab = (typeof TAB_ORDER)[number]

const TAB_LABELS: Record<Tab, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    ALL: 'All'
}

const PAGE_SIZE = 25

export const TicketsPage = () => {
    const [tab, setTab] = useState<Tab>('OPEN')
    const [searchInput, setSearchInput] = useState('')
    const [page, setPage] = useState(1)
    const [newOpen, setNewOpen] = useState(false)

    const queryClient = useQueryClient()
    const role = useAuthStore((s) => s.user?.role)
    const isSuperAdmin = role === ROLES.SUPER_ADMIN

    // SA tenant picker — same UX as Lead Pipeline / Shareable Links. The
    // picked tenant is persisted in localStorage so refresh keeps the SA
    // on the right tenant.
    const tenantsQuery = useQuery({
        queryKey: ['tenants'],
        queryFn: listAllTenants,
        staleTime: 60_000,
        enabled: isSuperAdmin
    })
    const tenants = tenantsQuery.data ?? []
    const [tenantId, setTenantId] = useState<string>(() => (isSuperAdmin ? localStorage.getItem('tickets.tenantId') ?? '' : ''))
    useEffect(() => {
        if (!isSuperAdmin) return
        if (!tenantId && tenants.length > 0) setTenantId(tenants[0].id)
    }, [isSuperAdmin, tenantId, tenants])
    useEffect(() => {
        if (isSuperAdmin && tenantId) localStorage.setItem('tickets.tenantId', tenantId)
    }, [isSuperAdmin, tenantId])
    const effectiveTenantId = isSuperAdmin && tenantId ? tenantId : undefined

    const ticketsQuery = useQuery({
        queryKey: ['tickets', { tab, page, tenant: effectiveTenantId ?? 'self' }],
        queryFn: () =>
            listTickets(
                {
                    page,
                    pageSize: PAGE_SIZE,
                    status: tab === 'ALL' ? undefined : tab
                },
                effectiveTenantId
            ),
        staleTime: 30_000,
        enabled: !isSuperAdmin || !!effectiveTenantId
    })

    useEffect(() => {
        setPage(1)
    }, [tab])

    // Memoise so the useMemo below sees a stable reference.
    const items = useMemo(() => ticketsQuery.data?.items ?? [], [ticketsQuery.data?.items])
    const total = ticketsQuery.data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    // Client-side text filter on the current page (cheap; backend doesn't yet
    // support a text search on tickets).
    const filtered = useMemo(() => {
        const needle = searchInput.trim().toLowerCase()
        if (!needle) return items
        return items.filter((t) => {
            const requesterName = `${t.opener.firstName} ${t.opener.lastName}`.toLowerCase()
            return (
                t.subject.toLowerCase().includes(needle) ||
                t.number.toLowerCase().includes(needle) ||
                requesterName.includes(needle) ||
                (t.opener.email ?? '').toLowerCase().includes(needle)
            )
        })
    }, [items, searchInput])

    // Counts per tab — only show the active tab's count to avoid extra round-trips.
    const counts = useMemo(() => {
        const c: Record<Tab, number | undefined> = {
            OPEN: undefined,
            IN_PROGRESS: undefined,
            RESOLVED: undefined,
            CLOSED: undefined,
            ALL: undefined
        }
        c[tab] = total
        return c
    }, [tab, total])

    const createMutation = useMutation({
        mutationFn: (payload: Parameters<typeof createTicket>[0]) => createTicket(payload, effectiveTenantId),
        onSuccess: (t) => {
            toast.success(`Ticket ${t.number} created`)
            setNewOpen(false)
            void queryClient.invalidateQueries({ queryKey: ['tickets'] })
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not create ticket'
            toast.error(msg)
        }
    })

    return (
        <>
            <PageHeader
                eyebrow="Support"
                title="Tickets"
                description="Internal comments, SLA timers, auto-assign — all in one queue."
                actions={
                    <>
                        {isSuperAdmin && (
                            <div className="w-64">
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
                        <div className="w-64 hidden sm:block">
                            <Input
                                placeholder="Search id, subject, requester"
                                leftIcon={<Search size={14} />}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                aria-label="Search tickets"
                            />
                        </div>
                        <Button
                            size="sm"
                            leftIcon={<Plus size={14} />}
                            disabled={isSuperAdmin && !effectiveTenantId}
                            onClick={() => setNewOpen(true)}>
                            New ticket
                        </Button>
                    </>
                }
            />

            <Tabs
                tabs={TAB_ORDER.map((value) => ({ value, label: TAB_LABELS[value], count: counts[value] }))}
                value={tab}
                onChange={setTab}
                className="mb-4"
            />

            {ticketsQuery.isLoading ? (
                <Card padded={false}>
                    <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                </Card>
            ) : ticketsQuery.isError ? (
                <Empty
                    icon={<TicketCheck size={36} />}
                    title="Couldn't load tickets"
                    description="Please try again."
                />
            ) : filtered.length === 0 ? (
                <Empty
                    icon={<TicketCheck size={36} />}
                    title="Nothing here"
                    description={searchInput ? 'No ticket matches your search.' : 'Clean slate — new tickets will appear here.'}
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">Number</th>
                                    <th className="py-3 px-5">Subject</th>
                                    <th className="py-3 px-5">Requester</th>
                                    <th className="py-3 px-5">Priority</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5 text-right">SLA</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5 font-mono text-xs text-fg-muted">{t.number}</td>
                                        <td className="py-3 px-5">
                                            <Link
                                                to={`/app/tickets/${t.id}`}
                                                className="text-fg font-medium hover:text-brand">
                                                {t.subject}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">
                                            {`${t.opener.firstName} ${t.opener.lastName}`.trim() || t.opener.email || '—'}
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority.toLowerCase()}</Badge>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                                        </td>
                                        <td className="py-3 px-5 text-right">
                                            <SlaPill dueAt={t.slaDueAt} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-fg-muted">
                            <span>
                                Page {page} of {totalPages} · {total} total
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="rounded border px-2 py-1 disabled:opacity-50 hover:bg-surface-hover">
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="rounded border px-2 py-1 disabled:opacity-50 hover:bg-surface-hover">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <NewTicketModal
                open={newOpen}
                onClose={() => setNewOpen(false)}
                onCreate={(payload) => createMutation.mutate(payload)}
                isPending={createMutation.isPending}
            />
        </>
    )
}

const SlaPill = ({ dueAt }: { dueAt: string | null }) => {
    if (!dueAt) return <span className="text-xs text-fg-muted">—</span>
    const diffMin = Math.round((new Date(dueAt).getTime() - Date.now()) / 60_000)
    const breached = diffMin < 0
    const abs = Math.abs(diffMin)
    const label = abs < 60 ? `${abs}m` : `${Math.round(abs / 60)}h`
    return (
        <span
            className={
                'inline-flex items-center gap-1 text-xs font-mono ' +
                (breached ? 'text-[var(--color-danger)]' : diffMin < 60 ? 'text-[var(--color-warn)]' : 'text-fg-muted')
            }>
            {breached ? `−${label}` : label}
        </span>
    )
}

const NewTicketModal = ({
    open,
    onClose,
    onCreate,
    isPending
}: {
    open: boolean
    onClose: () => void
    onCreate: (payload: { subject: string; description: string; priority: TicketPriority }) => void
    isPending: boolean
}) => {
    const [subject, setSubject] = useState('')
    const [priority, setPriority] = useState<TicketPriority>('NORMAL')
    const [description, setDescription] = useState('')

    const reset = () => {
        setSubject('')
        setPriority('NORMAL')
        setDescription('')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        onCreate({ subject: subject.trim(), description: description.trim(), priority })
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="New ticket"
            description="Open a ticket on behalf of yourself or a learner."
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
                        form="new-ticket-form"
                        type="submit"
                        loading={isPending}
                        disabled={subject.trim().length < 3 || description.trim().length < 5}>
                        Create ticket
                    </Button>
                </>
            }>
            <form
                id="new-ticket-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                <Select
                    label="Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}>
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </Select>
                <Textarea
                    label="Description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </form>
        </Modal>
    )
}

// Re-export status tone constants for the ticket-store-using legacy modules.
// New code should import from `@features/tickets/services/ticket.service`.
export type { TicketPriority }
