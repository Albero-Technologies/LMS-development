import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, Search, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { createTenant, listAllTenants, type CreateTenantPayload, type TenantListRow } from '../services/tenant.service'

const STATUS_TONE: Record<TenantListRow['status'], 'ok' | 'warn' | 'default'> = {
    ACTIVE: 'ok',
    TRIAL: 'warn',
    SUSPENDED: 'default'
}

const PLAN_TONE: Record<TenantListRow['plan'], 'default' | 'brand' | 'warn' | 'ok'> = {
    FREE: 'default',
    STARTER: 'brand',
    GROWTH: 'warn',
    ENTERPRISE: 'ok'
}

const fmtDate = (iso: string): string => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export const TenantsPage = () => {
    const [q, setQ] = useState('')
    const [createOpen, setCreateOpen] = useState(false)

    const queryClient = useQueryClient()
    const tenantsQuery = useQuery({
        queryKey: ['tenants', 'all'],
        queryFn: listAllTenants,
        staleTime: 60_000
    })

    // Memoise so the useMemo below sees a stable reference.
    const tenants = useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data])

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        if (!needle) return tenants
        return tenants.filter((t) => t.name.toLowerCase().includes(needle) || t.slug.toLowerCase().includes(needle))
    }, [tenants, q])

    const createMutation = useMutation({
        mutationFn: createTenant,
        onSuccess: (res) => {
            toast.success(`Tenant ${res.tenant.name} created — admin invite emailed to ${res.admin.email}`)
            void queryClient.invalidateQueries({ queryKey: ['tenants'] })
            setCreateOpen(false)
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not create tenant')
    })

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="Tenants"
                description="Every institute that uses the platform. Click any row to manage its settings, payments, and activity."
                actions={
                    <>
                        <div className="w-56 hidden sm:block">
                            <Input
                                leftIcon={<Search size={14} />}
                                placeholder="Search tenants"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search tenants"
                            />
                        </div>
                        <Button
                            size="sm"
                            leftIcon={<Plus size={14} />}
                            onClick={() => setCreateOpen(true)}>
                            New tenant
                        </Button>
                    </>
                }
            />

            {tenantsQuery.isLoading ? (
                <Card padded={false}>
                    <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </Card>
            ) : tenantsQuery.isError ? (
                <Empty
                    icon={<Building2 size={32} />}
                    title="Couldn't load tenants"
                    description="Try again in a moment."
                />
            ) : filtered.length === 0 ? (
                <Empty
                    icon={<Building2 size={32} />}
                    title={q ? 'No matches' : 'No tenants yet'}
                    description={q ? 'Try another keyword.' : 'Create the first tenant to start onboarding institutes.'}
                    action={
                        !q ? (
                            <Button
                                leftIcon={<Plus size={14} />}
                                onClick={() => setCreateOpen(true)}>
                                New tenant
                            </Button>
                        ) : null
                    }
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">Tenant</th>
                                    <th className="py-3 px-5">Plan</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5">Users</th>
                                    <th className="py-3 px-5">Courses</th>
                                    <th className="py-3 px-5">Created</th>
                                    <th className="py-3 px-5 text-right" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5">
                                            <Link
                                                to={`/app/admin/tenants/${t.id}`}
                                                className="block">
                                                <div className="text-fg font-medium">{t.name}</div>
                                                <div className="text-xs text-fg-muted font-mono">/{t.slug}</div>
                                            </Link>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone={PLAN_TONE[t.plan]}>{t.plan}</Badge>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                                        </td>
                                        <td className="py-3 px-5 font-mono text-xs text-fg-soft">{t.userCount}</td>
                                        <td className="py-3 px-5 font-mono text-xs text-fg-soft">{t.courseCount}</td>
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(t.createdAt)}</td>
                                        <td className="py-3 px-5 text-right">
                                            <Link
                                                to={`/app/admin/tenants/${t.id}`}
                                                className="inline-flex items-center gap-1 text-xs text-[var(--color-brand-500)] hover:underline">
                                                Open <ChevronRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <CreateTenantModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={(payload) => createMutation.mutate(payload)}
                isPending={createMutation.isPending}
            />
        </>
    )
}

const CreateTenantModal = ({
    open,
    onClose,
    onSubmit,
    isPending
}: {
    open: boolean
    onClose: () => void
    onSubmit: (payload: CreateTenantPayload) => void
    isPending: boolean
}) => {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [plan, setPlan] = useState<CreateTenantPayload['plan']>('FREE')
    const [adminEmail, setAdminEmail] = useState('')
    const [adminFirstName, setAdminFirstName] = useState('')
    const [adminLastName, setAdminLastName] = useState('')
    const [adminPassword, setAdminPassword] = useState('')

    const reset = () => {
        setName('')
        setSlug('')
        setPlan('FREE')
        setAdminEmail('')
        setAdminFirstName('')
        setAdminLastName('')
        setAdminPassword('')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            plan,
            adminEmail: adminEmail.trim().toLowerCase(),
            adminFirstName: adminFirstName.trim(),
            adminLastName: adminLastName.trim(),
            adminPassword
        })
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="Create tenant"
            description="Provisions the institute + its first ADMIN user. The admin can log in immediately with the password you set."
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
                        form="new-tenant-form"
                        type="submit"
                        loading={isPending}
                        disabled={
                            name.length < 2 ||
                            !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) ||
                            !adminEmail.includes('@') ||
                            adminFirstName.length < 1 ||
                            adminLastName.length < 1 ||
                            adminPassword.length < 8
                        }>
                        Create
                    </Button>
                </>
            }>
            <form
                id="new-tenant-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Tenant name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ascend Academy"
                />
                <Input
                    label="URL slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="ascend"
                />
                <p className="-mt-3 text-xs text-fg-muted">Lowercase letters, digits, and dashes only.</p>
                <Select
                    label="Plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as CreateTenantPayload['plan'])}>
                    <option value="FREE">Free</option>
                    <option value="STARTER">Starter</option>
                    <option value="GROWTH">Growth</option>
                    <option value="ENTERPRISE">Enterprise</option>
                </Select>
                <div className="border-t pt-4 mt-2">
                    <h3 className="text-sm font-semibold text-fg mb-3">First admin</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                            label="First name"
                            required
                            value={adminFirstName}
                            onChange={(e) => setAdminFirstName(e.target.value)}
                        />
                        <Input
                            label="Last name"
                            required
                            value={adminLastName}
                            onChange={(e) => setAdminLastName(e.target.value)}
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                    />
                    <Input
                        label="Initial password"
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="At least 8 characters with letters + digits"
                    />
                </div>
            </form>
        </Modal>
    )
}
