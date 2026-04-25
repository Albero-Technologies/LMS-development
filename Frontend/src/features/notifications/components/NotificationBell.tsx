import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/helpers/cn'
import { listNotifications, markNotificationRead, type NotificationItem } from '../services/notification.service'

const formatRelative = (iso: string): string => {
    const ms = Date.now() - new Date(iso).getTime()
    if (ms < 60_000) return `${Math.max(1, Math.floor(ms / 1000))}s`
    if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`
    if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`
    return `${Math.floor(ms / 86_400_000)}d`
}

// Drawer-on-click bell that lives in the top nav. Polls the notifications
// endpoint while the drawer is closed (cheap) and refetches eagerly when the
// user opens it. WebSocket push will replace the polling in §7.2.
export const NotificationBell = () => {
    const [open, setOpen] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['notifications', 'bell'],
        queryFn: () => listNotifications(1, 10),
        // Refetch every 60s so the unread badge stays roughly fresh without
        // hammering the API. Real-time push will replace this in §7.2.
        refetchInterval: 60_000,
        staleTime: 30_000
    })

    const items = query.data?.items ?? []
    const unread = query.data?.unread ?? 0

    const markRead = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    const markAll = useMutation({
        mutationFn: async () => {
            const targets = items.filter((i) => !i.readAt)
            await Promise.all(targets.map((n) => markNotificationRead(n.id)))
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    // Close on outside click + Esc.
    useEffect(() => {
        if (!open) return
        const onClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('mousedown', onClick)
        window.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('mousedown', onClick)
            window.removeEventListener('keydown', onKey)
        }
    }, [open])

    return (
        <div
            ref={containerRef}
            className="relative">
            <Button
                variant="ghost"
                size="icon"
                aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}>
                <Bell size={15} />
                {unread > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-danger)] text-white text-[10px] font-semibold flex items-center justify-center"
                        aria-hidden>
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </Button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 mt-2 w-[360px] rounded-xl border border-[var(--color-border)] bg-surface shadow-[var(--shadow-lift)] z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="text-sm font-semibold text-fg">Notifications</span>
                        {unread > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<CheckCheck size={12} />}
                                loading={markAll.isPending}
                                onClick={() => markAll.mutate()}>
                                Mark all read
                            </Button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {query.isLoading ? (
                            <div className="px-4 py-8 text-center text-xs text-fg-muted">Loading…</div>
                        ) : items.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-fg-muted">You're all caught up.</div>
                        ) : (
                            <ul className="divide-y">
                                {items.map((n) => (
                                    <NotificationDrawerRow
                                        key={n.id}
                                        item={n}
                                        expanded={expandedId === n.id}
                                        onToggle={() => setExpandedId((id) => (id === n.id ? null : n.id))}
                                        onMarkRead={() => markRead.mutate(n.id)}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="border-t px-4 py-2 text-center">
                        <Link
                            to="/app/notifications"
                            onClick={() => setOpen(false)}
                            className="text-xs text-[var(--color-brand-500)] hover:underline">
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

const NotificationDrawerRow = ({
    item,
    expanded,
    onToggle,
    onMarkRead
}: {
    item: NotificationItem
    expanded: boolean
    onToggle: () => void
    onMarkRead: () => void
}) => {
    const unread = item.readAt === null
    return (
        <li
            className={cn('px-4 py-3 cursor-pointer transition-colors hover:bg-surface-hover', unread && 'bg-[var(--color-brand-50)]')}
            onClick={() => {
                onToggle()
                if (unread) onMarkRead()
            }}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-fg truncate">{item.subject ?? item.template}</span>
                        {unread && (
                            <span
                                className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)] shrink-0"
                                aria-label="Unread"
                            />
                        )}
                    </div>
                    {item.body && (
                        <div className={cn('mt-0.5 text-xs text-fg-soft', expanded ? 'whitespace-pre-wrap' : 'line-clamp-2')}>{item.body}</div>
                    )}
                </div>
                <div
                    className="text-[10px] text-fg-muted font-mono shrink-0"
                    title={new Date(item.createdAt).toLocaleString()}>
                    {formatRelative(item.createdAt)}
                </div>
            </div>
        </li>
    )
}
