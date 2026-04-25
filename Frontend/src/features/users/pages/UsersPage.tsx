import { useMemo, useState } from 'react'
import { UserPlus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Modal } from '@shared/components/ui/Modal'
import { Tabs } from '@shared/components/ui/Tabs'

type U = { id: string; name: string; email: string; role: string; status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' }

const SEED: U[] = [
    { id: 'u1', name: 'Ananya Rao', email: 'ananya@ascend.in', role: 'ADMIN', status: 'ACTIVE' },
    { id: 'u2', name: 'Rohan Kulkarni', email: 'rohan@deepstack.io', role: 'TRAINER', status: 'ACTIVE' },
    { id: 'u3', name: 'Priya Shetty', email: 'priya@kintsu.com', role: 'COUNSELLOR', status: 'ACTIVE' },
    { id: 'u4', name: 'Ishaan Mehra', email: 'ishaan@student.in', role: 'STUDENT', status: 'PENDING' },
    { id: 'u5', name: 'Vikram Singh', email: 'vikram@learnhub.in', role: 'SUPPORT', status: 'ACTIVE' }
]

const TABS = ['ALL', 'ADMIN', 'TRAINER', 'STUDENT', 'COUNSELLOR', 'SUPPORT'] as const
type Tab = (typeof TABS)[number]

export const UsersPage = () => {
    const [users, setUsers] = useState<U[]>(SEED)
    const [tab, setTab] = useState<Tab>('ALL')
    const [q, setQ] = useState('')
    const [open, setOpen] = useState(false)

    const counts = useMemo(() => {
        const c: Record<string, number> = { ALL: users.length }
        for (const u of users) c[u.role] = (c[u.role] ?? 0) + 1
        return c
    }, [users])

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        return users
            .filter((u) => tab === 'ALL' || u.role === tab)
            .filter((u) => (needle ? u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle) : true))
    }, [users, tab, q])

    return (
        <>
            <PageHeader
                eyebrow="Tenant"
                title="Users"
                description="Invite staff and students. Roles control what each user sees and can do."
                actions={
                    <>
                        <div className="w-64 hidden sm:block">
                            <Input
                                placeholder="Search users"
                                leftIcon={<Search size={14} />}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search users"
                            />
                        </div>
                        <Button
                            size="sm"
                            leftIcon={<UserPlus size={14} />}
                            onClick={() => setOpen(true)}>
                            Invite
                        </Button>
                    </>
                }
            />

            <Tabs
                tabs={TABS.map((t) => ({ value: t, label: t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase(), count: counts[t] ?? 0 }))}
                value={tab}
                onChange={setTab}
                className="mb-4"
            />

            <Card padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                <th className="py-3 px-5">User</th>
                                <th className="py-3 px-5">Role</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map((u) => (
                                <tr
                                    key={u.id}
                                    className="hover:bg-surface-hover">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] text-white text-xs flex items-center justify-center font-semibold">
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-fg font-medium">{u.name}</div>
                                                <div className="text-xs text-fg-muted">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 font-mono text-xs text-fg-soft">{u.role}</td>
                                    <td className="py-3 px-5">
                                        <Badge tone={u.status === 'ACTIVE' ? 'ok' : u.status === 'PENDING' ? 'warn' : 'danger'}>{u.status}</Badge>
                                    </td>
                                    <td className="py-3 px-5 text-right">
                                        {u.status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, status: 'ACTIVE' } : x)))
                                                    toast.success(`${u.name} activated`)
                                                }}>
                                                Activate
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toast.success(`Password reset link sent to ${u.email}`)}>
                                            Reset pw
                                        </Button>
                                        {u.status !== 'SUSPENDED' ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (!window.confirm(`Suspend ${u.name}?`)) return
                                                    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, status: 'SUSPENDED' } : x)))
                                                    toast.success('User suspended')
                                                }}
                                                className="!text-[var(--color-danger)]">
                                                Suspend
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, status: 'ACTIVE' } : x)))
                                                    toast.success('User reinstated')
                                                }}>
                                                Reinstate
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <InviteModal
                open={open}
                onClose={() => setOpen(false)}
                onCreate={(u) => {
                    setUsers((us) => [u, ...us])
                    toast.success(`Invite sent to ${u.email}`)
                    setOpen(false)
                }}
            />
        </>
    )
}

const InviteModal = ({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (u: U) => void }) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('STUDENT')

    const reset = () => {
        setName('')
        setEmail('')
        setRole('STUDENT')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        onCreate({
            id: crypto.randomUUID().slice(0, 8),
            name: name.trim(),
            email: email.trim(),
            role,
            status: 'PENDING'
        })
        reset()
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="Invite a user"
            description="They'll get an email with a one-time accept link."
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
                        form="invite-u-form"
                        type="submit"
                        disabled={name.trim().length < 2 || !email.includes('@')}>
                        Send invite
                    </Button>
                </>
            }>
            <form
                id="invite-u-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Input
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Select
                    label="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}>
                    <option value="ADMIN">Admin</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="STUDENT">Student</option>
                    <option value="COUNSELLING_MANAGER">Counselling Manager</option>
                    <option value="COUNSELLOR">Counsellor</option>
                    <option value="SUPPORT">Support</option>
                </Select>
            </form>
        </Modal>
    )
}
