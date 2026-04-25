import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { useTicketStore, PRIORITY_TONE, STATUS_TONE, type TPriority } from '../stores/ticketStore'

const TAB_ORDER = ['OPEN', 'ASSIGNED', 'RESOLVED', 'CLOSED', 'ALL'] as const
type Tab = (typeof TAB_ORDER)[number]

const TAB_LABELS: Record<Tab, string> = {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    ALL: 'All'
}

export const TicketsPage = () => {
    const tickets = useTicketStore((s) => s.tickets)
    const addTicket = useTicketStore((s) => s.addTicket)
    const [tab, setTab] = useState<Tab>('OPEN')
    const [q, setQ] = useState('')
    const [newOpen, setNewOpen] = useState(false)

    const counts = useMemo(() => {
        const c: Record<Tab, number> = { OPEN: 0, ASSIGNED: 0, RESOLVED: 0, CLOSED: 0, ALL: tickets.length }
        for (const t of tickets) c[t.status]++
        return c
    }, [tickets])

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        return tickets
            .filter((t) => tab === 'ALL' || t.status === tab)
            .filter((t) =>
                needle
                    ? t.subject.toLowerCase().includes(needle) || t.requester.toLowerCase().includes(needle) || t.id.toLowerCase().includes(needle)
                    : true
            )
    }, [tickets, tab, q])

    return (
        <>
            <PageHeader
                eyebrow="Support"
                title="Tickets"
                description="Internal comments, SLA timers, auto-assign — all in one queue."
                actions={
                    <>
                        <div className="w-64 hidden sm:block">
                            <Input
                                placeholder="Search id, subject, requester"
                                leftIcon={<Search size={14} />}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search tickets"
                            />
                        </div>
                        <Button
                            size="sm"
                            leftIcon={<Plus size={14} />}
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

            {filtered.length === 0 ? (
                <Empty
                    icon={<TicketCheck size={36} />}
                    title="Nothing here"
                    description={q ? 'No ticket matches your search.' : 'Clean slate — new tickets will appear here.'}
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">ID</th>
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
                                        <td className="py-3 px-5 font-mono text-xs text-fg-muted">{t.id}</td>
                                        <td className="py-3 px-5">
                                            <Link
                                                to={`/app/tickets/${t.id}`}
                                                className="text-fg font-medium hover:text-brand">
                                                {t.subject}
                                            </Link>
                                            <div className="text-xs text-fg-muted mt-0.5">{t.category}</div>
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">{t.requester}</td>
                                        <td className="py-3 px-5">
                                            <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority.toLowerCase()}</Badge>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STATUS_TONE[t.status]}>{t.status.toLowerCase()}</Badge>
                                        </td>
                                        <td className="py-3 px-5 text-right">
                                            <SlaPill dueAt={t.slaDueAt} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <NewTicketModal
                open={newOpen}
                onClose={() => setNewOpen(false)}
                onCreate={(data) => {
                    const t = addTicket(data)
                    toast.success(`Ticket ${t.id} created`)
                    setNewOpen(false)
                }}
            />
        </>
    )
}

const SlaPill = ({ dueAt }: { dueAt: string }) => {
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
            {breached ? `−${label}` : `${label}`}
        </span>
    )
}

const NewTicketModal = ({
    open,
    onClose,
    onCreate
}: {
    open: boolean
    onClose: () => void
    onCreate: (d: { subject: string; requester: string; assignee?: string; priority: TPriority; category: string; messageText: string }) => void
}) => {
    const [subject, setSubject] = useState('')
    const [requester, setRequester] = useState('')
    const [priority, setPriority] = useState<TPriority>('NORMAL')
    const [category, setCategory] = useState('Access')
    const [message, setMessage] = useState('')

    const reset = () => {
        setSubject('')
        setRequester('')
        setPriority('NORMAL')
        setCategory('Access')
        setMessage('')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        onCreate({ subject, requester, priority, category, messageText: message })
        reset()
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="New ticket"
            description="Log an issue on behalf of a student."
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
                        disabled={subject.trim().length < 3 || requester.trim().length < 2 || message.trim().length < 5}>
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
                <Input
                    label="Requester"
                    required
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                    <Select
                        label="Priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TPriority)}>
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </Select>
                    <Select
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}>
                        <option>Access</option>
                        <option>Payments</option>
                        <option>Billing</option>
                        <option>Quizzes</option>
                        <option>Content</option>
                        <option>Other</option>
                    </Select>
                </div>
                <Textarea
                    label="Initial message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </form>
        </Modal>
    )
}
