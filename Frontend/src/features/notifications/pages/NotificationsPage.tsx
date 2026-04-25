import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, DollarSign, ClipboardCheck, TicketCheck, UserPlus, Mail } from 'lucide-react'
import { toast } from 'sonner'
import type { ComponentType } from 'react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Tabs } from '@shared/components/ui/Tabs'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { cn } from '@shared/helpers/cn'
import { listNotifications, markNotificationRead, type NotificationItem } from '../services/notification.service'

// Map a backend template name to an icon. Falls back to a generic mail icon.
const TEMPLATE_ICON: Record<string, ComponentType<{ size?: number }>> = {
    payment: DollarSign,
    enrollment: ClipboardCheck,
    ticket_update: TicketCheck,
    counsellor_signup_received: UserPlus,
    manager_signup_received: UserPlus,
    counsellor_task_assigned: ClipboardCheck,
    counsellor_task_completed: ClipboardCheck,
    welcome: Mail,
    invite: Mail
}

const formatRelative = (iso: string): string => {
    const ms = Date.now() - new Date(iso).getTime()
    if (ms < 60_000) return `${Math.max(1, Math.floor(ms / 1000))}s`
    if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`
    if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`
    return `${Math.floor(ms / 86_400_000)}d`
}

type Tab = 'ALL' | 'UNREAD'

export const NotificationsPage = () => {
    const [tab, setTab] = useState<Tab>('ALL')
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['notifications'],
        queryFn: () => listNotifications(1, 50),
        staleTime: 15_000
    })

    // Memoise items so the useMemo below sees a stable reference.
    const items = useMemo(() => query.data?.items ?? [], [query.data?.items])
    const unreadCount = query.data?.unread ?? 0
    const visible = useMemo(() => (tab === 'ALL' ? items : items.filter((i) => !i.readAt)), [items, tab])

    const markRead = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    const markAll = useMutation({
        mutationFn: async () => {
            // Backend exposes mark-one-read; fan out concurrently for the unread set.
            const targets = items.filter((i) => !i.readAt)
            await Promise.all(targets.map((n) => markNotificationRead(n.id)))
        },
        onSuccess: () => {
            toast.success('All marked read')
            void queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

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
                            loading={markAll.isPending}
                            onClick={() => markAll.mutate()}>
                            Mark all read
                        </Button>
                    ) : null
                }
            />

            <Tabs
                tabs={[
                    { value: 'ALL', label: 'All', count: query.data?.total ?? 0 },
                    { value: 'UNREAD', label: 'Unread', count: unreadCount }
                ]}
                value={tab}
                onChange={setTab}
                className="mb-4"
            />

            {query.isLoading ? (
                <Card padded={false}>
                    <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                </Card>
            ) : query.isError ? (
                <Empty
                    icon={<Bell size={36} />}
                    title="Couldn't load notifications"
                    description="Try again in a moment."
                />
            ) : visible.length === 0 ? (
                <Empty
                    icon={<Bell size={36} />}
                    title="You're all caught up"
                    description="New notifications will appear here as they arrive."
                />
            ) : (
                <Card padded={false}>
                    <ul className="divide-y">
                        {visible.map((n) => (
                            <NotificationRow
                                key={n.id}
                                item={n}
                                onClick={() => {
                                    if (!n.readAt) markRead.mutate(n.id)
                                }}
                            />
                        ))}
                    </ul>
                </Card>
            )}
        </>
    )
}

const NotificationRow = ({ item, onClick }: { item: NotificationItem; onClick: () => void }) => {
    const Icon = TEMPLATE_ICON[item.template] ?? Mail
    const unread = item.readAt === null
    return (
        <li
            className={cn('p-5 flex items-start gap-4 cursor-pointer transition-colors', unread && 'bg-[var(--color-brand-50)]')}
            onClick={onClick}>
            <div className="w-9 h-9 rounded-md bg-surface-2 border flex items-center justify-center text-fg-soft shrink-0">
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-fg font-medium">{item.subject ?? item.template}</span>
                    {unread && (
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)]"
                            aria-label="Unread"
                        />
                    )}
                    <Badge>{item.template}</Badge>
                </div>
                {item.body && <div className="text-sm text-fg-soft mt-0.5 whitespace-pre-wrap">{item.body}</div>}
            </div>
            <div
                className="text-xs text-fg-muted font-mono"
                title={new Date(item.createdAt).toLocaleString()}>
                {formatRelative(item.createdAt)}
            </div>
        </li>
    )
}
