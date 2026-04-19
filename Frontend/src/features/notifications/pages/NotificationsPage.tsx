import { useState } from 'react'
import { Bell, CheckCheck, DollarSign, ClipboardCheck, TicketCheck, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import type { ComponentType } from 'react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Tabs } from '@shared/components/ui/Tabs'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'

type N = {
    id: string
    title: string
    body: string
    when: string
    kind: 'payment' | 'quiz' | 'ticket' | 'signup'
    read: boolean
}

const KIND_ICON: Record<N['kind'], ComponentType<{ size?: number }>> = {
    payment: DollarSign,
    quiz: ClipboardCheck,
    ticket: TicketCheck,
    signup: UserPlus
}

const SEED: N[] = [
    { id: '1', title: 'Payment received', body: 'Ishaan Mehra paid ₹4,999', when: '2m', kind: 'payment', read: false },
    { id: '2', title: 'Quiz published', body: 'DSA Week 5 · live for Batch 2026', when: '1h', kind: 'quiz', read: false },
    { id: '3', title: 'Ticket SLA breach', body: 'T-201 · 2h open', when: '2h', kind: 'ticket', read: false },
    { id: '4', title: 'Counsellor signup', body: 'Sneha Patil filled the onboarding form', when: '5h', kind: 'signup', read: true }
]

type Tab = 'ALL' | 'UNREAD'

export const NotificationsPage = () => {
    const [items, setItems] = useState<N[]>(SEED)
    const [tab, setTab] = useState<Tab>('ALL')

    const visible = tab === 'ALL' ? items : items.filter((i) => !i.read)
    const unreadCount = items.filter((i) => !i.read).length

    const markAll = () => {
        setItems((xs) => xs.map((x) => ({ ...x, read: true })))
        toast.success('All marked read')
    }

    const toggleRead = (id: string) => {
        setItems((xs) => xs.map((x) => (x.id === id ? { ...x, read: !x.read } : x)))
    }

    return (
        <>
            <PageHeader
                eyebrow="Inbox"
                title="Notifications"
                description="Anything that needs your attention — filtered by role, muted where you've opted out."
                actions={
                    unreadCount > 0 ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<CheckCheck size={14} />}
                            onClick={markAll}>
                            Mark all read
                        </Button>
                    ) : null
                }
            />

            <Tabs
                tabs={[
                    { value: 'ALL', label: 'All', count: items.length },
                    { value: 'UNREAD', label: 'Unread', count: unreadCount }
                ]}
                value={tab}
                onChange={setTab}
                className="mb-4"
            />

            {visible.length === 0 ? (
                <Empty
                    icon={<Bell size={36} />}
                    title="You're all caught up"
                    description="New notifications will appear here as they arrive."
                />
            ) : (
                <Card padded={false}>
                    <ul className="divide-y">
                        {visible.map((n) => {
                            const Icon = KIND_ICON[n.kind]
                            return (
                                <li
                                    key={n.id}
                                    className={cn(
                                        'p-5 flex items-start gap-4 cursor-pointer transition-colors',
                                        !n.read && 'bg-[var(--color-brand-50)]'
                                    )}
                                    onClick={() => toggleRead(n.id)}>
                                    <div className="w-9 h-9 rounded-md bg-surface-2 border flex items-center justify-center text-fg-soft shrink-0">
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-fg font-medium">{n.title}</span>
                                            {!n.read && (
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)]"
                                                    aria-label="Unread"
                                                />
                                            )}
                                            <Badge>{n.kind}</Badge>
                                        </div>
                                        <div className="text-sm text-fg-soft mt-0.5">{n.body}</div>
                                    </div>
                                    <div className="text-xs text-fg-muted font-mono">{n.when}</div>
                                </li>
                            )
                        })}
                    </ul>
                </Card>
            )}
        </>
    )
}
