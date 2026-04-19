import { useMemo, useState } from 'react'
import { Search, Activity } from 'lucide-react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'

type Log = {
    id: string
    action: string
    entity: string
    actor: string
    tenant: string
    ip: string
    at: string
}

const SEED: Log[] = [
    { id: 'a1', action: 'auth.login', entity: 'User', actor: 'priya@ascend.in', tenant: 'Ascend Academy', ip: '::1', at: '2m' },
    { id: 'a2', action: 'course.publish', entity: 'Course · DSA', actor: 'rohan@ascend.in', tenant: 'Ascend Academy', ip: '203.0.113.12', at: '10m' },
    { id: 'a3', action: 'invoice.refund', entity: 'INV-2403-099', actor: 'priya@ascend.in', tenant: 'Ascend Academy', ip: '203.0.113.12', at: '1h' },
    { id: 'a4', action: 'tenant.create', entity: 'Kintsu', actor: 'super@learnhub.in', tenant: 'LearnHub', ip: '198.51.100.9', at: '3h' }
]

export const AuditLogsPage = () => {
    const [q, setQ] = useState('')
    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        if (!needle) return SEED
        return SEED.filter(
            (l) =>
                l.action.toLowerCase().includes(needle) ||
                l.entity.toLowerCase().includes(needle) ||
                l.actor.toLowerCase().includes(needle) ||
                l.tenant.toLowerCase().includes(needle)
        )
    }, [q])

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="Activity logs"
                description="Every authenticated mutation is recorded — who, what, when, from where."
                actions={
                    <div className="w-72">
                        <Input
                            placeholder="Search action, entity, actor"
                            leftIcon={<Search size={14} />}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            aria-label="Search audit logs"
                        />
                    </div>
                }
            />
            {filtered.length === 0 ? (
                <Empty
                    icon={<Activity size={32} />}
                    title="No matches"
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
                                    <th className="py-3 px-5">Tenant</th>
                                    <th className="py-3 px-5">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((l) => (
                                    <tr
                                        key={l.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5 text-xs text-fg-muted font-mono">{l.at} ago</td>
                                        <td className="py-3 px-5">
                                            <Badge tone="brand">{l.action}</Badge>
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">{l.entity}</td>
                                        <td className="py-3 px-5 text-fg">{l.actor}</td>
                                        <td className="py-3 px-5 text-fg-soft">{l.tenant}</td>
                                        <td className="py-3 px-5 text-xs font-mono text-fg-muted">{l.ip}</td>
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
