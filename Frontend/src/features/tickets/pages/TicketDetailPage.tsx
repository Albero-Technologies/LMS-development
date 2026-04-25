import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Clock, Lock, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'
import { useTicketStore, PRIORITY_TONE, STATUS_TONE, type TPriority, type TStatus, type TMessage } from '../stores/ticketStore'
import { useAuthStore } from '@shared/stores/authStore'

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

export const TicketDetailPage = () => {
    const { id = '' } = useParams()
    const ticket = useTicketStore((s) => s.tickets.find((t) => t.id === id))
    const addMessage = useTicketStore((s) => s.addMessage)
    const updateStatus = useTicketStore((s) => s.updateStatus)
    const updatePriority = useTicketStore((s) => s.updatePriority)

    const user = useAuthStore((s) => s.user)

    const [text, setText] = useState('')
    const [internal, setInternal] = useState(false)

    // Re-render once a minute so the SLA timer stays live.
    const [, setTick] = useState(0)
    useEffect(() => {
        const t = window.setInterval(() => setTick((x) => x + 1), 60_000)
        return () => window.clearInterval(t)
    }, [])

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

    const sla = fmtRemaining(ticket.slaDueAt)

    const send = (e: React.FormEvent) => {
        e.preventDefault()
        if (text.trim().length === 0) return
        addMessage(ticket.id, {
            author: user?.name ?? 'Support',
            role: 'agent',
            text: text.trim(),
            internal
        })
        setText('')
        toast.success(internal ? 'Internal note added' : 'Reply sent to requester')
    }

    return (
        <>
            <Link
                to="/app/tickets"
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> All tickets
            </Link>

            <PageHeader
                eyebrow={`Ticket · ${ticket.id}`}
                title={ticket.subject}
                description={`Opened ${fmtTime(ticket.createdAt)} by ${ticket.requester}`}
                actions={
                    <>
                        <Badge tone={PRIORITY_TONE[ticket.priority]}>{ticket.priority.toLowerCase()}</Badge>
                        <Badge tone={STATUS_TONE[ticket.status]}>{ticket.status.toLowerCase()}</Badge>
                        <Badge>{ticket.category}</Badge>
                    </>
                }
            />

            <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                {/* Main thread */}
                <div className="space-y-4">
                    <Card padded={false}>
                        <div className="p-5 space-y-4">
                            {ticket.messages.map((m) => (
                                <Message
                                    key={m.id}
                                    message={m}
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
                                    internal
                                        ? 'Context for your teammates — never shown to the customer.'
                                        : 'Write a friendly, specific reply. Markdown will be supported later.'
                                }
                                required
                            />
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <label className="flex items-center gap-2 text-xs text-fg-soft select-none">
                                    <input
                                        type="checkbox"
                                        className="accent-[var(--color-brand-500)]"
                                        checked={internal}
                                        onChange={(e) => setInternal(e.target.checked)}
                                    />
                                    Internal note
                                </label>
                                <div className="flex items-center gap-2">
                                    {ticket.status !== 'RESOLVED' && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<Check size={12} />}
                                            onClick={() => {
                                                updateStatus(ticket.id, 'RESOLVED')
                                                toast.success('Marked resolved')
                                            }}>
                                            Resolve
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        size="sm"
                                        leftIcon={<Send size={12} />}
                                        disabled={text.trim().length === 0}>
                                        {internal ? 'Add note' : 'Send reply'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
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

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Details</h3>
                        <div className="space-y-2.5 text-sm">
                            <Row
                                label="Requester"
                                value={ticket.requester}
                            />
                            <Row
                                label="Assignee"
                                value={ticket.assignee ?? 'Unassigned'}
                            />
                            <Row
                                label="Opened"
                                value={new Date(ticket.createdAt).toLocaleString()}
                            />
                            <Row
                                label="Category"
                                value={ticket.category}
                            />
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-3">Controls</h3>
                        <div className="space-y-3">
                            <Select
                                label="Status"
                                value={ticket.status}
                                onChange={(e) => {
                                    updateStatus(ticket.id, e.target.value as TStatus)
                                    toast.success('Status updated')
                                }}>
                                <option value="OPEN">Open</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </Select>
                            <Select
                                label="Priority"
                                value={ticket.priority}
                                onChange={(e) => {
                                    updatePriority(ticket.id, e.target.value as TPriority)
                                    toast.success('Priority + SLA updated')
                                }}>
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </Select>
                        </div>
                    </Card>
                </aside>
            </div>
        </>
    )
}

const Message = ({ message }: { message: TMessage }) => {
    if (message.role === 'system') {
        return (
            <div className="text-xs text-fg-muted text-center py-1 italic">
                {message.text} · {fmtTime(message.at)}
            </div>
        )
    }

    const isAgent = message.role === 'agent'

    return (
        <div
            className={cn(
                'rounded-md border p-4 flex gap-3',
                message.internal
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
                {message.author[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-fg">{message.author}</span>
                    <span className="text-fg-muted">·</span>
                    <span className="text-fg-muted">{fmtTime(message.at)}</span>
                    {message.internal && (
                        <Badge tone="warn">
                            <Lock size={10} /> Internal
                        </Badge>
                    )}
                </div>
                <div className="mt-1.5 text-sm text-fg whitespace-pre-wrap">{message.text}</div>
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
