import { useMemo, useState, type DragEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Phone, Mail, MessageCircle, Calendar, MoreHorizontal, ChevronRight, LayoutGrid, Table2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { cn } from '@shared/helpers/cn'
import {
    listMyLeads,
    listAssignableCounsellors,
    reassignLead,
    STAGE_LABEL,
    STAGE_ORDER,
    STAGE_TONE,
    updateLeadStage,
    type AssignableUser,
    type Lead,
    type LeadStage
} from '../services/lead.service'

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime()
    const min = Math.round(diff / 60_000)
    if (min < 60) return `${min}m ago`
    const hr = Math.round(min / 60)
    if (hr < 48) return `${hr}h ago`
    return `${Math.round(hr / 24)}d ago`
}

const fmtDate = (iso: string): string => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

type ViewMode = 'kanban' | 'table'

export const LeadPipelinePage = () => {
    const queryClient = useQueryClient()
    const [view, setView] = useState<ViewMode>('kanban')
    const [tableStageFilter, setTableStageFilter] = useState<LeadStage | 'ALL'>('ALL')
    const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null)

    const leadsQuery = useQuery({
        queryKey: ['leads'],
        queryFn: () => listMyLeads(),
        staleTime: 30_000
    })

    const stageMutation = useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) => updateLeadStage(id, stage),
        // Optimistically move the card so the kanban feels instant.
        onMutate: async ({ id, stage }) => {
            await queryClient.cancelQueries({ queryKey: ['leads'] })
            const previous = queryClient.getQueryData<Lead[]>(['leads'])
            if (previous) {
                queryClient.setQueryData<Lead[]>(
                    ['leads'],
                    previous.map((l) => (l.id === id ? { ...l, stage } : l))
                )
            }
            return { previous }
        },
        onError: (err: unknown, _vars, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(['leads'], ctx.previous)
            const msg = err instanceof Error ? err.message : 'Could not update stage'
            toast.error(msg)
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
    })

    // Roster of counsellors + counselling managers a lead can be assigned to.
    // Loaded once with the page; React Query caches it for 5 minutes.
    const counsellorsQuery = useQuery({
        queryKey: ['lead-assignees'],
        queryFn: listAssignableCounsellors,
        staleTime: 5 * 60_000
    })
    const counsellors = counsellorsQuery.data ?? []

    const assignMutation = useMutation({
        mutationFn: ({ id, counsellorId }: { id: string; counsellorId: string }) => reassignLead(id, counsellorId),
        // Optimistic — patch the assignedTo in cache so the card label updates instantly.
        onMutate: async ({ id, counsellorId }) => {
            await queryClient.cancelQueries({ queryKey: ['leads'] })
            const previous = queryClient.getQueryData<Lead[]>(['leads'])
            const target = counsellors.find((c) => c.id === counsellorId)
            if (previous && target) {
                queryClient.setQueryData<Lead[]>(
                    ['leads'],
                    previous.map((l) =>
                        l.id === id
                            ? {
                                  ...l,
                                  assignedToId: target.id,
                                  assignedTo: { id: target.id, firstName: target.firstName, lastName: target.lastName }
                              }
                            : l
                    )
                )
            }
            return { previous }
        },
        onSuccess: (lead) => {
            toast.success(`Assigned to ${lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'counsellor'}`)
        },
        onError: (err: unknown, _vars, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(['leads'], ctx.previous)
            const msg = err instanceof Error ? err.message : 'Could not reassign'
            toast.error(msg)
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
    })

    const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data])

    const columns = useMemo(() => {
        const buckets = Object.fromEntries(STAGE_ORDER.map((s) => [s, [] as Lead[]])) as Record<LeadStage, Lead[]>
        for (const lead of leads) buckets[lead.stage].push(lead)
        return buckets
    }, [leads])

    const tableRows = useMemo(() => {
        if (tableStageFilter === 'ALL') return leads
        return leads.filter((l) => l.stage === tableStageFilter)
    }, [leads, tableStageFilter])

    const onDragStart = (e: DragEvent<HTMLElement>, lead: Lead) => {
        e.dataTransfer.setData('text/lead-id', lead.id)
        e.dataTransfer.setData('text/from-stage', lead.stage)
        e.dataTransfer.effectAllowed = 'move'
    }
    const onDragOver = (e: DragEvent<HTMLElement>, stage: LeadStage) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverStage(stage)
    }
    const onDragLeave = () => setDragOverStage(null)
    const onDrop = (e: DragEvent<HTMLElement>, stage: LeadStage) => {
        e.preventDefault()
        setDragOverStage(null)
        const id = e.dataTransfer.getData('text/lead-id')
        const from = e.dataTransfer.getData('text/from-stage') as LeadStage
        if (!id || from === stage) return
        stageMutation.mutate({ id, stage })
    }

    return (
        <>
            <PageHeader
                eyebrow="Admissions"
                title="Lead pipeline"
                description="Drag cards across stages, or switch to the table for filtering and bulk review."
                actions={
                    <div className="inline-flex rounded-md border border-[var(--color-border)] bg-surface-2 p-1">
                        <button
                            type="button"
                            onClick={() => setView('kanban')}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs',
                                view === 'kanban' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
                            )}>
                            <LayoutGrid size={12} /> Kanban
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('table')}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs',
                                view === 'table' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
                            )}>
                            <Table2 size={12} /> Table
                        </button>
                    </div>
                }
            />

            {leadsQuery.isLoading ? (
                <Card>
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </Card>
            ) : leadsQuery.isError ? (
                <Empty
                    icon={<LayoutGrid size={32} />}
                    title="Couldn't load leads"
                    description="Please try again."
                />
            ) : view === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {STAGE_ORDER.map((stage) => {
                        const bucket = columns[stage]
                        const isDragOver = dragOverStage === stage
                        return (
                            <Card
                                key={stage}
                                padded={false}
                                className={cn('flex flex-col min-h-[420px] transition-colors', isDragOver && 'ring-2 ring-[var(--color-brand-500)]')}>
                                <header
                                    className="p-4 border-b flex items-center justify-between"
                                    onDragOver={(e) => onDragOver(e, stage)}
                                    onDragLeave={onDragLeave}
                                    onDrop={(e) => onDrop(e, stage)}>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-fg">{STAGE_LABEL[stage]}</h3>
                                        <Badge tone={STAGE_TONE[stage]}>{bucket.length}</Badge>
                                    </div>
                                </header>

                                <div
                                    className="p-3 space-y-2.5 flex-1 overflow-y-auto"
                                    onDragOver={(e) => onDragOver(e, stage)}
                                    onDragLeave={onDragLeave}
                                    onDrop={(e) => onDrop(e, stage)}>
                                    {bucket.length === 0 && (
                                        <div className="text-xs text-fg-muted px-2 py-6 text-center border border-dashed rounded-md">
                                            Drop leads here
                                        </div>
                                    )}
                                    {bucket.map((lead) => (
                                        <LeadCard
                                            key={lead.id}
                                            lead={lead}
                                            counsellors={counsellors}
                                            onDragStart={(e) => onDragStart(e, lead)}
                                            onMove={(s) => stageMutation.mutate({ id: lead.id, stage: s })}
                                            onAssign={(counsellorId) => assignMutation.mutate({ id: lead.id, counsellorId })}
                                        />
                                    ))}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <LeadTable
                    leads={tableRows}
                    stageFilter={tableStageFilter}
                    onStageFilter={setTableStageFilter}
                    counts={columns}
                    totalLeads={leads.length}
                    counsellors={counsellors}
                    onMove={(id, stage) => stageMutation.mutate({ id, stage })}
                    onAssign={(id, counsellorId) => assignMutation.mutate({ id, counsellorId })}
                />
            )}
        </>
    )
}

const LeadCard = ({
    lead,
    counsellors,
    onDragStart,
    onMove,
    onAssign
}: {
    lead: Lead
    counsellors: AssignableUser[]
    onDragStart: (e: DragEvent<HTMLElement>) => void
    onMove: (s: LeadStage) => void
    onAssign: (counsellorId: string) => void
}) => {
    const [menuOpen, setMenuOpen] = useState(false)
    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="relative rounded-md bg-surface-2 border p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-fg truncate">{lead.name}</div>
                    <div className="text-xs text-fg-soft truncate">
                        {lead.course}
                        {lead.language ? ` · ${lead.language}` : ''}
                    </div>
                </div>
                <div className="relative">
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="More"
                        onClick={() => setMenuOpen((v) => !v)}>
                        <MoreHorizontal size={13} />
                    </Button>
                    {menuOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Close menu"
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-8 z-20 bg-surface border rounded-md shadow-lift text-sm py-1 w-56 max-h-[420px] overflow-y-auto">
                                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-fg-muted font-medium">Move to</div>
                                {STAGE_ORDER.filter((s) => s !== lead.stage).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-hover text-left"
                                        onClick={() => {
                                            onMove(s)
                                            setMenuOpen(false)
                                        }}>
                                        {STAGE_LABEL[s]}
                                        <ChevronRight size={12} />
                                    </button>
                                ))}

                                <div className="my-1 h-px bg-[var(--color-border)]" />
                                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-fg-muted font-medium">Assign to</div>
                                {counsellors.length === 0 ? (
                                    <div className="px-3 py-1.5 text-xs text-fg-muted">No counsellors yet</div>
                                ) : (
                                    counsellors.map((c) => {
                                        const isCurrent = lead.assignedToId === c.id
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                disabled={isCurrent}
                                                className={cn(
                                                    'w-full flex items-center justify-between px-3 py-1.5 text-left',
                                                    isCurrent ? 'text-fg-muted cursor-default' : 'hover:bg-surface-hover'
                                                )}
                                                onClick={() => {
                                                    if (isCurrent) return
                                                    onAssign(c.id)
                                                    setMenuOpen(false)
                                                }}>
                                                <span className="truncate">
                                                    {c.firstName} {c.lastName}
                                                    {c.role === 'COUNSELLING_MANAGER' && (
                                                        <span className="ml-1 text-[10px] uppercase tracking-wider text-fg-muted">Mgr</span>
                                                    )}
                                                </span>
                                                {isCurrent ? <UserCheck size={12} className="text-[var(--color-brand-500)]" /> : <ChevronRight size={12} />}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-fg-muted">
                {lead.source && <span>{lead.source}</span>}
                {lead.source && <span>·</span>}
                <span>{timeAgo(lead.createdAt)}</span>
            </div>

            {lead.assignedTo && (
                <div className="mt-2 text-[11px] text-fg-muted inline-flex items-center gap-1.5">
                    <Calendar size={11} /> {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                </div>
            )}

            <div className="mt-3 flex items-center gap-1.5">
                <a
                    href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                    className="btn btn-ghost btn-sm flex-1"
                    aria-label={`Call ${lead.name}`}
                    onClick={(e) => e.stopPropagation()}>
                    <Phone size={13} />
                </a>
                <a
                    href={`https://wa.me/${lead.phone.replace(/\D+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm flex-1"
                    aria-label={`WhatsApp ${lead.name}`}
                    onClick={(e) => e.stopPropagation()}>
                    <MessageCircle size={13} />
                </a>
                <a
                    href={`mailto:${lead.email}`}
                    className="btn btn-ghost btn-sm flex-1"
                    aria-label={`Email ${lead.name}`}
                    onClick={(e) => e.stopPropagation()}>
                    <Mail size={13} />
                </a>
            </div>
        </div>
    )
}

const LeadTable = ({
    leads,
    stageFilter,
    onStageFilter,
    counts,
    totalLeads,
    counsellors,
    onMove,
    onAssign
}: {
    leads: Lead[]
    stageFilter: LeadStage | 'ALL'
    onStageFilter: (s: LeadStage | 'ALL') => void
    counts: Record<LeadStage, Lead[]>
    totalLeads: number
    counsellors: AssignableUser[]
    onMove: (id: string, stage: LeadStage) => void
    onAssign: (id: string, counsellorId: string) => void
}) => {
    return (
        <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <FilterChip
                    label="All"
                    count={totalLeads}
                    active={stageFilter === 'ALL'}
                    onClick={() => onStageFilter('ALL')}
                />
                {STAGE_ORDER.map((s) => (
                    <FilterChip
                        key={s}
                        label={STAGE_LABEL[s]}
                        count={counts[s].length}
                        active={stageFilter === s}
                        onClick={() => onStageFilter(s)}
                    />
                ))}
            </div>

            {leads.length === 0 ? (
                <Empty
                    icon={<Table2 size={32} />}
                    title="No leads in this stage"
                    description="Drag cards in the kanban or wait for new enquiries to land here."
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">Name</th>
                                    <th className="py-3 px-5">Course</th>
                                    <th className="py-3 px-5">Phone</th>
                                    <th className="py-3 px-5">Stage</th>
                                    <th className="py-3 px-5">Assigned</th>
                                    <th className="py-3 px-5">Created</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leads.map((l) => (
                                    <tr
                                        key={l.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5">
                                            <div className="text-fg font-medium">{l.name}</div>
                                            <div className="text-xs text-fg-muted">{l.email}</div>
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">{l.course}</td>
                                        <td className="py-3 px-5 font-mono text-xs text-fg-soft">{l.phone}</td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STAGE_TONE[l.stage]}>{STAGE_LABEL[l.stage]}</Badge>
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">
                                            {l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : '—'}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(l.createdAt)}</td>
                                        <td className="py-3 px-5 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <AssignMenu
                                                    counsellors={counsellors}
                                                    currentId={l.assignedToId}
                                                    onPick={(cid) => onAssign(l.id, cid)}
                                                />
                                                <StageMenu
                                                    current={l.stage}
                                                    onPick={(s) => onMove(l.id, s)}
                                                />
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

const FilterChip = ({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors',
            active
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                : 'border-[var(--color-border)] text-fg-soft hover:bg-surface-hover'
        )}>
        {label}
        <span className="font-mono text-[11px] text-fg-muted">{count}</span>
    </button>
)

const AssignMenu = ({
    counsellors,
    currentId,
    onPick
}: {
    counsellors: AssignableUser[]
    currentId: string | null
    onPick: (counsellorId: string) => void
}) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="relative inline-block">
            <Button
                size="sm"
                variant="ghost"
                leftIcon={<UserCheck size={12} />}
                onClick={() => setOpen((v) => !v)}>
                Assign
            </Button>
            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-9 z-20 bg-surface border rounded-md shadow-lift text-sm py-1 w-56 max-h-[360px] overflow-y-auto">
                        {counsellors.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-fg-muted">No counsellors yet</div>
                        ) : (
                            counsellors.map((c) => {
                                const isCurrent = currentId === c.id
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        disabled={isCurrent}
                                        className={cn(
                                            'w-full flex items-center justify-between px-3 py-1.5 text-left',
                                            isCurrent ? 'text-fg-muted cursor-default' : 'hover:bg-surface-hover'
                                        )}
                                        onClick={() => {
                                            if (isCurrent) return
                                            onPick(c.id)
                                            setOpen(false)
                                        }}>
                                        <span className="truncate">
                                            {c.firstName} {c.lastName}
                                            {c.role === 'COUNSELLING_MANAGER' && (
                                                <span className="ml-1 text-[10px] uppercase tracking-wider text-fg-muted">Mgr</span>
                                            )}
                                        </span>
                                        {isCurrent && <UserCheck size={12} className="text-[var(--color-brand-500)]" />}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

const StageMenu = ({ current, onPick }: { current: LeadStage; onPick: (s: LeadStage) => void }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="relative inline-block">
            <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpen((v) => !v)}>
                Move
            </Button>
            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-9 z-20 bg-surface border rounded-md shadow-lift text-sm py-1 w-48">
                        {STAGE_ORDER.filter((s) => s !== current).map((s) => (
                            <button
                                key={s}
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-hover text-left"
                                onClick={() => {
                                    onPick(s)
                                    setOpen(false)
                                }}>
                                {STAGE_LABEL[s]}
                                <ChevronRight size={12} />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
