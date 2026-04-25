import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Activity } from 'lucide-react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { listAuditLogs } from '../services/audit.service'

const PAGE_SIZE = 50

const useDebounced = <T,>(value: T, delay = 300): T => {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

const formatRelative = (iso: string): string => {
    const ms = Date.now() - new Date(iso).getTime()
    if (ms < 60_000) return `${Math.max(1, Math.floor(ms / 1000))}s`
    if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`
    if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`
    return `${Math.floor(ms / 86_400_000)}d`
}

export const AuditLogsPage = () => {
    const role = useAuthStore((s) => s.user?.role)
    const isSuperAdmin = role === ROLES.SUPER_ADMIN

    const [searchInput, setSearchInput] = useState('')
    const search = useDebounced(searchInput)
    const [page, setPage] = useState(1)

    const query = useQuery({
        queryKey: ['audit-logs', { page, search }],
        queryFn: () => listAuditLogs({ page, pageSize: PAGE_SIZE, search: search || undefined }),
        staleTime: 30_000
    })

    const items = query.data?.items ?? []
    const total = query.data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    // Reset page when the search changes so we don't end up on a now-empty page.
    const lastSearch = useMemo(() => search, [search])
    useEffect(() => {
        setPage(1)
    }, [lastSearch])

    return (
        <>
            <PageHeader
                eyebrow={isSuperAdmin ? 'Super Admin' : 'Tenant'}
                title="Activity logs"
                description={
                    isSuperAdmin
                        ? 'Every authenticated mutation across all tenants — who, what, when, from where.'
                        : 'Every authenticated mutation in your tenant — who, what, when, from where.'
                }
                actions={
                    <div className="w-72">
                        <Input
                            placeholder="Search action, entity, id"
                            leftIcon={<Search size={14} />}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            aria-label="Search audit logs"
                        />
                    </div>
                }
            />

            {query.isLoading ? (
                <Card padded={false}>
                    <div className="p-5 space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </Card>
            ) : query.isError ? (
                <Empty
                    icon={<Activity size={32} />}
                    title="Couldn't load activity"
                    description="Try refreshing in a moment."
                />
            ) : items.length === 0 ? (
                <Empty
                    icon={<Activity size={32} />}
                    title={search ? 'No matches' : 'No activity yet'}
                    description={search ? 'Try a different search term.' : 'Mutations will appear here as users act in the platform.'}
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">When</th>
                                    <th className="py-3 px-5">Action</th>
                                    <th className="py-3 px-5">Entity</th>
                                    <th className="py-3 px-5">Actor</th>
                                    {isSuperAdmin && <th className="py-3 px-5">Tenant</th>}
                                    <th className="py-3 px-5">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((l) => (
                                    <tr
                                        key={l.id}
                                        className="hover:bg-surface-hover">
                                        <td
                                            className="py-3 px-5 text-xs text-fg-muted font-mono"
                                            title={new Date(l.createdAt).toLocaleString()}>
                                            {formatRelative(l.createdAt)} ago
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone="brand">{l.action}</Badge>
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">
                                            {l.entityType ? `${l.entityType}${l.entityId ? ` · ${l.entityId.slice(0, 8)}` : ''}` : '—'}
                                        </td>
                                        <td className="py-3 px-5 text-fg">{l.actor ? `${l.actor.name} (${l.actor.email})` : '—'}</td>
                                        {isSuperAdmin && <td className="py-3 px-5 text-fg-soft">{l.tenant?.name ?? '—'}</td>}
                                        <td className="py-3 px-5 text-xs font-mono text-fg-muted">{l.ipAddress ?? '—'}</td>
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
        </>
    )
}
