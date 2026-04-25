import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Clock, Lock, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { cn } from '@shared/helpers/cn'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import {
    PRIORITY_TONE,
    STATUS_LABEL,
    STATUS_TONE,
    addTicketComment,
    getTicket,
    updateTicket,
    type TicketComment,
    type TicketPriority,
    type TicketStatus
} from '../services/ticket.service'

const fmtTime = (iso: string): string => {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const min = Math.round(diff / 60_000)
    if (min < 1) return 'just now'
    if (min < 60) return `${min}m ago`
    const hr = Math.round(min / 60)
    if (hr < 48) return `${hr}h ago`
    return d.toLocaleString()
}

const fmtRemaining = (iso: string): { label: string; breached: boolean; warn: boolean } => {
    const diffMs = new Date(iso).getTime() - Date.now()
    const breached = diffMs < 0
    const abs = Math.abs(diffMs)
    const hr = Math.floor(abs / 3_600_000)
    const min = Math.floor((abs % 3_600_000) / 60_000)
    const label = hr > 0 ? `${hr}h ${min}m` : `${min}m`
    return { label, breached, warn: !breached && diffMs < 60 * 60_000 }
}

const STAFF_ROLES = new Set([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT])

export const TicketDetailPage = () => {
    const { id = '' } = useParams()
    const user = useAuthStore((s) => s.user)
    const queryClient = useQueryClient()

    const [text, setText] = useState('')
    const [internal, setInternal] = useState(false)

    // Re-render once a minute so the SLA timer stays live.
    const [, setTick] = useState(0)
    useEffect(() => {
        const t = window.setInterval(() => setTick((x) => x + 1), 60_000)
        return () => window.clearInterval(t)
    }, [])

    const ticketQuery = useQuery({
        queryKey: ['tickets', id],
        queryFn: () => getTicket(id),
        enabled: id.length > 0,
        staleTime: 15_000
    })

    const updateMutation = useMutation({
        mutationFn: (payload: { status?: TicketStatus; priority?: TicketPriority }) => updateTicket(id, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['tickets', id] })
            void queryClient.invalidateQueries({ queryKey: ['tickets'] })
            void queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    const commentMutation = useMutation({
        mutationFn: () => addTicketComment(id, { body: text.trim(), internal }),
        onSuccess: () => {
            setText('')
            toast.success(internal ? 'Internal note added' : 'Reply sent to requester')
            void queryClient.invalidateQueries({ queryKey: ['tickets', id] })
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not send reply'
            toast.error(msg)
        }
    })

    if (ticketQuery.isLoading) {
        return (
            <>
                <Link
                    to="/app/tickets"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All tickets
                </Link>
                <Card>
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </Card>
            </>
        )
    }

    const ticket = ticketQuery.data
    if (!ticket) {
        return (
            <>
                <Link
                    to="/app/tickets"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All tickets
                </Link>
                <Empty
                    title="Ticket not found"
                    description="It may have been closed or merged."
                />
            </>
        )
    }

    const sla = ticket.slaDueAt ? fmtRemaining(ticket.slaDueAt) : null
    const requesterName = `${ticket.opener.firstName} ${ticket.opener.lastName}`.trim() || ticket.opener.email || 'Unknown'
    const assigneeName = ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`.trim() : 'Unassigned'
    const isStaff = user ? STAFF_ROLES.has(user.role as typeof ROLES.SUPER_ADMIN) : false

    const send = (e: React.FormEvent) => {
        e.preventDefault()
        if (text.trim().length === 0) return
        commentMutation.mutate()
    }

    return (
        <>
            <Link
                to="/app/tickets"
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> All tickets
            </Link>

            <PageHeader
                eyebrow={`Ticket · ${ticket.number}`}
                title={ticket.subject}
                description={`Opened ${fmtTime(ticket.createdAt)} by ${requesterName}`}
                actions={
                    <>
                        <Badge tone={PRIORITY_TONE[ticket.priority]}>{ticket.priority.toLowerCase()}</Badge>
                        <Badge tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
                    </>
                }
            />

            <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                <div className="space-y-4">
                    <Card padded={false}>
                        <div className="p-5 space-y-4">
                            <OriginalDescription
                                description={ticket.description}
                                requester={requesterName}
                                createdAt={ticket.createdAt}
                            />
                            {ticket.comments.map((c) => (
                                <CommentBubble
                                    key={c.id}
                                    comment={c}
                                    currentUserId={user?.id}
                                />
                            ))}
                        </div>

                        <form
                            onSubmit={send}
                            className="border-t p-5 bg-surface-2 rounded-b-lg space-y-3">
                            <Textarea
                                label={internal ? 'Internal note (only agents see this)' : 'Reply to requester'}
                                value={text}
                                rows={4}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={
                                    internal ? 'Context for your teammates — never shown to the customer.' : 'Write a friendly, specific reply.'
                                }
                                required
                            />
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                {isStaff ? (
                                    <label className="flex items-center gap-2 text-xs text-fg-soft select-none">
                                        <input
                                            type="checkbox"
                                            className="accent-[var(--color-brand-500)]"
                                            checked={internal}
                                            onChange={(e) => setInternal(e.target.checked)}
                                        />
                                        Internal note
                                    </label>
                                ) : (
                                    <span />
                                )}
                                <div className="flex items-center gap-2">
                                    {isStaff && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<Check size={12} />}
                                            loading={updateMutation.isPending}
                                            onClick={() => {
                                                updateMutation.mutate({ status: 'RESOLVED' }, { onSuccess: () => toast.success('Marked resolved') })
                                            }}>
                                            Resolve
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        size="sm"
                                        leftIcon={<Send size={12} />}
                                        loading={commentMutation.isPending}
                                        disabled={text.trim().length === 0}>
                                        {internal ? 'Add note' : 'Send reply'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>

                <aside className="space-y-4">
                    {sla && (
                        <Card>
                            <h3 className="text-sm font-semibold text-fg mb-3">SLA</h3>
                            <div className="flex items-center gap-2">
                                {sla.breached ? (
                                    <AlertCircle
                                        size={14}
                                        className="text-[var(--color-danger)]"
                                    />
                                ) : (
                                    <Clock
                                        size={14}
                                        className={sla.warn ? 'text-[var(--color-warn)]' : 'text-fg-muted'}
                                    />
                                )}
                                <span
                                    className={cn(
                                        'font-mono text-sm',
                                        sla.breached ? 'text-[var(--color-danger)]' : sla.warn ? 'text-[var(--color-warn)]' : 'text-fg'
                                    )}>
                                    {sla.breached ? `Breached by ${sla.label}` : `${sla.label} remaining`}
                                </span>
                            </div>
                        </Card>
                    )}

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Details</h3>
                        <div className="space-y-2.5 text-sm">
                            <Row
                                label="Requester"
                                value={requesterName}
                            />
                            <Row
                                label="Assignee"
                                value={assigneeName}
                            />
                            <Row
                                label="Opened"
                                value={new Date(ticket.createdAt).toLocaleString()}
                            />
                            {ticket.resolvedAt && (
                                <Row
                                    label="Resolved"
                                    value={new Date(ticket.resolvedAt).toLocaleString()}
                                />
                            )}
                        </div>
                    </Card>

                    {isStaff && (
                        <Card>
                            <h3 className="text-sm font-semibold text-fg mb-3">Controls</h3>
                            <div className="space-y-3">
                                <Select
                                    label="Status"
                                    value={ticket.status}
                                    onChange={(e) => {
                                        updateMutation.mutate(
                                            { status: e.target.value as TicketStatus },
                                            { onSuccess: () => toast.success('Status updated') }
                                        )
                                    }}
                                    disabled={updateMutation.isPending}>
                                    <option value="OPEN">Open</option>
                                    <option value="IN_PROGRESS">In progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                </Select>
                                <Select
                                    label="Priority"
                                    value={ticket.priority}
                                    onChange={(e) => {
                                        updateMutation.mutate(
                                            { priority: e.target.value as TicketPriority },
                                            { onSuccess: () => toast.success('Priority updated') }
                                        )
                                    }}
                                    disabled={updateMutation.isPending}>
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </Select>
                            </div>
                        </Card>
                    )}
                </aside>
            </div>
        </>
    )
}

const OriginalDescription = ({ description, requester, createdAt }: { description: string; requester: string; createdAt: string }) => (
    <div className="rounded-md border p-4 flex gap-3 bg-surface">
        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold bg-[var(--color-purple)]">
            {requester[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-fg">{requester}</span>
                <span className="text-fg-muted">·</span>
                <span className="text-fg-muted">{fmtTime(createdAt)}</span>
            </div>
            <div className="mt-1.5 text-sm text-fg whitespace-pre-wrap">{description}</div>
        </div>
    </div>
)

const CommentBubble = ({ comment, currentUserId }: { comment: TicketComment; currentUserId?: string }) => {
    const author = comment.author
    const authorName = author ? `${author.firstName} ${author.lastName}`.trim() || author.email || 'Unknown' : 'Unknown'
    const isAuthor = author?.id === currentUserId
    const isAgent = author?.role && STAFF_ROLES.has(author.role as typeof ROLES.SUPER_ADMIN)

    return (
        <div
            className={cn(
                'rounded-md border p-4 flex gap-3',
                comment.internal
                    ? 'bg-[var(--color-warn-soft)] border-[var(--color-warn)]/30'
                    : isAgent
                      ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-100)]'
                      : 'bg-surface'
            )}>
            <div
                className={cn(
                    'w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold',
                    isAgent ? 'bg-[var(--color-brand-500)]' : 'bg-[var(--color-purple)]'
                )}>
                {authorName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-fg">{isAuthor ? 'You' : authorName}</span>
                    <span className="text-fg-muted">·</span>
                    <span className="text-fg-muted">{fmtTime(comment.createdAt)}</span>
                    {comment.internal && (
                        <Badge tone="warn">
                            <Lock size={10} /> Internal
                        </Badge>
                    )}
                </div>
                <div className="mt-1.5 text-sm text-fg whitespace-pre-wrap">{comment.body}</div>
            </div>
        </div>
    )
}

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-fg-muted text-xs">{label}</span>
        <span className="text-fg font-medium text-right truncate">{value}</span>
    </div>
)
