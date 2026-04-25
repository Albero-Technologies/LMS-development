import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES, type TRole } from '@shared/constants/roles'
import { inviteUser, listUsers, updateUserStatus, type UserRow, type UserStatus } from '../services/user.service'

const TAB_ORDER = ['ALL', 'ADMIN', 'TRAINER', 'STUDENT', 'COUNSELLOR', 'COUNSELLING_MANAGER', 'SUPPORT'] as const
type Tab = (typeof TAB_ORDER)[number]

const TAB_LABEL: Record<Tab, string> = {
    ALL: 'All',
    ADMIN: 'Admin',
    TRAINER: 'Trainer',
    STUDENT: 'Student',
    COUNSELLOR: 'Counsellor',
    COUNSELLING_MANAGER: 'Manager',
    SUPPORT: 'Support'
}

// Each role sees the same data shape but with copy that fits its workflow.
// Deeper relationship-based filters (a trainer's enrolled students, a counsellor's
// leads, a manager's direct reports, a support agent's ticket-relationships) need
// backend joins that aren't implemented yet — they'll arrive alongside §6.
const HEADER_BY_ROLE: Partial<Record<TRole, { eyebrow: string; title: string; description: string }>> = {
    SUPER_ADMIN: {
        eyebrow: 'Super Admin',
        title: 'Users',
        description: 'Every account in the active tenant. Cross-tenant view arrives with multi-tenant routing.'
    },
    ADMIN: {
        eyebrow: 'Tenant',
        title: 'Users',
        description: 'Invite staff and students. Roles control what each user sees and can do.'
    },
    TRAINER: {
        eyebrow: 'Your students',
        title: 'Students',
        description: 'Learners actively enrolled in courses you teach. Add new students by inviting from your course detail page.'
    },
    COUNSELLOR: {
        eyebrow: 'Tenant',
        title: 'Students',
        description: 'Tenant-wide directory. Lead-pipeline view lives at /app/counsellor/pipeline.'
    },
    COUNSELLING_MANAGER: {
        eyebrow: 'Your team',
        title: 'Counsellors',
        description: 'Counsellors reporting to you. Each card links to their pipeline + monthly target.'
    },
    SUPPORT: {
        eyebrow: 'Tenant',
        title: 'Students',
        description: 'Search by email or name to look up a learner before opening a ticket.'
    }
}

const useDebounced = <T,>(value: T, delay = 300): T => {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

const PAGE_SIZE = 25

export const UsersPage = () => {
    const role = useAuthStore((s) => s.user?.role) as TRole | undefined
    const header = role ? HEADER_BY_ROLE[role] : undefined

    const [tab, setTab] = useState<Tab>(role === ROLES.TRAINER || role === ROLES.SUPPORT ? 'STUDENT' : 'ALL')
    const [searchInput, setSearchInput] = useState('')
    const search = useDebounced(searchInput)
    const [page, setPage] = useState(1)
    const [inviteOpen, setInviteOpen] = useState(false)

    const queryClient = useQueryClient()

    // Role-aware scope (§5.3 Phase B): backend auto-filters via the actor's id.
    //   TRAINER             → STUDENTs enrolled in the actor's courses
    //   COUNSELLING_MANAGER → COUNSELLORs reporting to the actor
    // Other roles see the full tenant directory; the tab + search still apply.
    const trainerScope = role === ROLES.TRAINER ? 'me' : undefined
    const managerScope = role === ROLES.COUNSELLING_MANAGER ? 'me' : undefined

    const usersQuery = useQuery({
        queryKey: ['users', { tab, search, page, trainerScope, managerScope }],
        queryFn: () =>
            listUsers({
                page,
                pageSize: PAGE_SIZE,
                // Server-side scopes already pin the role; passing the tab role would over-constrain.
                role: trainerScope || managerScope ? undefined : tab === 'ALL' ? undefined : tab,
                q: search || undefined,
                trainerScope,
                managerScope
            }),
        staleTime: 30_000
    })

    // Reset to page 1 whenever filters change so we don't land on an empty page.
    useEffect(() => {
        setPage(1)
    }, [tab, search])

    const items = usersQuery.data?.items ?? []
    const total = usersQuery.data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const counts = useMemo(() => {
        const c: Record<Tab, number | undefined> = {
            ALL: undefined,
            ADMIN: undefined,
            TRAINER: undefined,
            STUDENT: undefined,
            COUNSELLOR: undefined,
            COUNSELLING_MANAGER: undefined,
            SUPPORT: undefined
        }
        // We only know the count for the currently active tab — counts on the
        // other tabs would require N extra round-trips. Show the active tab's
        // total and leave others blank to avoid lying.
        c[tab] = total
        return c
    }, [tab, total])

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) => updateUserStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    })

    const inviteMutation = useMutation({
        mutationFn: inviteUser,
        onSuccess: (res) => {
            toast.success(`Invite sent to ${res.email}`)
            setInviteOpen(false)
            void queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not send invite'
            toast.error(msg)
        }
    })

    const canInvite = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN || role === ROLES.COUNSELLING_MANAGER

    return (
        <>
            <PageHeader
                eyebrow={header?.eyebrow ?? 'Tenant'}
                title={header?.title ?? 'Users'}
                description={header?.description ?? 'Invite staff and students. Roles control what each user sees and can do.'}
                actions={
                    <>
                        <div className="w-64 hidden sm:block">
                            <Input
                                placeholder="Search users"
                                leftIcon={<Search size={14} />}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                aria-label="Search users"
                            />
                        </div>
                        {canInvite && (
                            <Button
                                size="sm"
                                leftIcon={<UserPlus size={14} />}
                                onClick={() => setInviteOpen(true)}>
                                Invite
                            </Button>
                        )}
                    </>
                }
            />

            <Tabs
                tabs={TAB_ORDER.map((t) => ({ value: t, label: TAB_LABEL[t], count: counts[t] }))}
                value={tab}
                onChange={setTab}
                className="mb-4"
            />

            {usersQuery.isLoading ? (
                <Card padded={false}>
                    <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                </Card>
            ) : usersQuery.isError ? (
                <Empty
                    icon={<Search size={32} />}
                    title="Couldn't load users"
                    description="Please try again."
                />
            ) : items.length === 0 ? (
                <Empty
                    icon={<Search size={32} />}
                    title={search ? 'No matches' : 'No users yet'}
                    description={
                        search
                            ? 'Try a different search term.'
                            : canInvite
                              ? 'Invite teammates to get started.'
                              : 'Users will appear once they are added.'
                    }
                />
            ) : (
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
                                {items.map((u) => (
                                    <UserListRow
                                        key={u.id}
                                        user={u}
                                        canManage={canInvite}
                                        onSetStatus={(status) => statusMutation.mutate({ id: u.id, status })}
                                    />
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

            <InviteModal
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
                actorRole={role}
                onSubmit={(payload) => inviteMutation.mutate(payload)}
                isPending={inviteMutation.isPending}
            />
        </>
    )
}

const UserListRow = ({ user, canManage, onSetStatus }: { user: UserRow; canManage: boolean; onSetStatus: (s: UserStatus) => void }) => {
    const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email
    return (
        <tr className="hover:bg-surface-hover">
            <td className="py-3 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] text-white text-xs flex items-center justify-center font-semibold">
                        {fullName[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="text-fg font-medium">{fullName}</div>
                        <div className="text-xs text-fg-muted">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="py-3 px-5 font-mono text-xs text-fg-soft">{user.role}</td>
            <td className="py-3 px-5">
                <Badge tone={user.status === 'ACTIVE' ? 'ok' : user.status === 'PENDING' ? 'warn' : 'danger'}>{user.status}</Badge>
            </td>
            <td className="py-3 px-5 text-right">
                {canManage && user.status === 'PENDING' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSetStatus('ACTIVE')}>
                        Activate
                    </Button>
                )}
                {canManage && user.status !== 'SUSPENDED' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            if (!window.confirm(`Suspend ${fullName}?`)) return
                            onSetStatus('SUSPENDED')
                        }}
                        className="!text-[var(--color-danger)]">
                        Suspend
                    </Button>
                )}
                {canManage && user.status === 'SUSPENDED' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSetStatus('ACTIVE')}>
                        Reinstate
                    </Button>
                )}
            </td>
        </tr>
    )
}

const ROLE_OPTIONS_BY_ACTOR: Record<TRole, TRole[]> = {
    SUPER_ADMIN: ['ADMIN', 'TRAINER', 'STUDENT', 'COUNSELLING_MANAGER', 'COUNSELLOR', 'SUPPORT'],
    ADMIN: ['ADMIN', 'TRAINER', 'STUDENT', 'COUNSELLING_MANAGER', 'COUNSELLOR', 'SUPPORT'],
    COUNSELLING_MANAGER: ['COUNSELLOR'],
    COUNSELLOR: [],
    TRAINER: [],
    STUDENT: [],
    SUPPORT: []
}

const InviteModal = ({
    open,
    onClose,
    onSubmit,
    actorRole,
    isPending
}: {
    open: boolean
    onClose: () => void
    onSubmit: (p: { email: string; role: TRole; firstName?: string; lastName?: string }) => void
    actorRole: TRole | undefined
    isPending: boolean
}) => {
    const allowedRoles = actorRole ? ROLE_OPTIONS_BY_ACTOR[actorRole] : []
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<TRole>((allowedRoles[0] ?? 'STUDENT') as TRole)

    const reset = () => {
        setFirstName('')
        setLastName('')
        setEmail('')
        setRole((allowedRoles[0] ?? 'STUDENT') as TRole)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            email: email.trim(),
            role,
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined
        })
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
                        loading={isPending}
                        disabled={!email.includes('@') || allowedRoles.length === 0}>
                        Send invite
                    </Button>
                </>
            }>
            <form
                id="invite-u-form"
                onSubmit={submit}
                className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        label="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                        label="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
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
                    onChange={(e) => setRole(e.target.value as TRole)}
                    disabled={allowedRoles.length === 0}>
                    {allowedRoles.length === 0 ? (
                        <option value="">No roles available for your account</option>
                    ) : (
                        allowedRoles.map((r) => (
                            <option
                                key={r}
                                value={r}>
                                {r.charAt(0) + r.slice(1).toLowerCase().replace('_', ' ')}
                            </option>
                        ))
                    )}
                </Select>
            </form>
        </Modal>
    )
}
