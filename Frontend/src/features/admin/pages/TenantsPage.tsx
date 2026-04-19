// Tenant management — Super Admin only. Creates new tenants and shares the
// one-shot credentials to the admin's email. Also exposes suspend / reinstate.
//
// This flow is deliberately internal: nothing about it is exposed on the
// public website. The admin receives creds → logs in → runs their own
// institute. The student never sees "create tenant" CTAs.
import { useState } from 'react'
import { Plus, Copy, Check, RotateCcw, Building2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'
import { Empty } from '@shared/components/ui/Empty'
import {
    useTenantStore,
    PLAN_TONE,
    STATUS_TONE,
    type TPlan,
    type TTenant
} from '../stores/tenantStore'

export const TenantsPage = () => {
    const tenants = useTenantStore((s) => s.tenants)
    const setStatus = useTenantStore((s) => s.setTenantStatus)
    const regen = useTenantStore((s) => s.regenerateCreds)
    const del = useTenantStore((s) => s.deleteTenant)

    const [q, setQ] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [credsFor, setCredsFor] = useState<TTenant | null>(null)

    const filtered = tenants.filter((t) => {
        if (!q) return true
        const n = q.toLowerCase()
        return t.name.toLowerCase().includes(n) || t.slug.includes(n) || t.adminEmail.includes(n)
    })

    return (
        <>
            <PageHeader
                eyebrow="Super Admin · internal"
                title="Tenants"
                description="Create institutes and share credentials with their first admin. This flow never appears on the public website."
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

            {filtered.length === 0 ? (
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
                                    <th className="py-3 px-5">Institute</th>
                                    <th className="py-3 px-5">Admin email</th>
                                    <th className="py-3 px-5">Plan</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5">
                                            <div className="text-fg font-semibold">{t.name}</div>
                                            <div className="text-xs text-fg-muted font-mono">/{t.slug}</div>
                                        </td>
                                        <td className="py-3 px-5 text-fg-soft">{t.adminEmail}</td>
                                        <td className="py-3 px-5">
                                            <Badge tone={PLAN_TONE[t.plan]}>{t.plan}</Badge>
                                        </td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                                        </td>
                                        <td className="py-3 px-5 text-right space-x-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setCredsFor(t)}>
                                                Share creds
                                            </Button>
                                            {t.status === 'SUSPENDED' ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setStatus(t.id, 'ACTIVE')
                                                        toast.success('Tenant reinstated')
                                                    }}>
                                                    Reinstate
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="!text-[var(--color-danger)]"
                                                    onClick={() => {
                                                        if (!window.confirm(`Suspend ${t.name}?`)) return
                                                        setStatus(t.id, 'SUSPENDED')
                                                        toast.success('Tenant suspended')
                                                    }}>
                                                    Suspend
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="!text-[var(--color-danger)]"
                                                onClick={() => {
                                                    if (!window.confirm(`Delete ${t.name}? This cannot be undone.`)) return
                                                    del(t.id)
                                                    toast.success('Tenant deleted')
                                                }}>
                                                Delete
                                            </Button>
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
                onCreated={(t) => {
                    setCreateOpen(false)
                    setCredsFor(t)
                }}
            />
            <CredsModal
                tenant={credsFor}
                onClose={() => setCredsFor(null)}
                onRegenerate={() => {
                    if (!credsFor) return
                    const pw = regen(credsFor.id)
                    setCredsFor({ ...credsFor, initialPassword: pw, credsLastSharedAt: new Date().toISOString() })
                    toast.success('New credentials generated')
                }}
            />
        </>
    )
}

// -----------------------------------------------------------------------------

const CreateTenantModal = ({
    open,
    onClose,
    onCreated
}: {
    open: boolean
    onClose: () => void
    onCreated: (t: TTenant) => void
}) => {
    const create = useTenantStore((s) => s.createTenant)
    const [name, setName] = useState('')
    const [adminEmail, setAdminEmail] = useState('')
    const [plan, setPlan] = useState<TPlan>('STARTER')

    const reset = () => {
        setName('')
        setAdminEmail('')
        setPlan('STARTER')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const t = create({ name, adminEmail, plan })
        toast.success('Tenant created — credentials ready to share')
        reset()
        onCreated(t)
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="Create a new tenant"
            description="We'll generate a one-shot password to hand over to the admin. This flow is internal."
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
                        form="create-tenant-form"
                        type="submit"
                        disabled={name.trim().length < 2 || !adminEmail.includes('@')}>
                        Create tenant
                    </Button>
                </>
            }>
            <form
                id="create-tenant-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Institute name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ascend Academy"
                />
                <Input
                    label="Admin email"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@institute.in"
                    hint="We email the credentials directly to this address."
                />
                <Select
                    label="Plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as TPlan)}>
                    <option value="FREE">Free</option>
                    <option value="STARTER">Starter</option>
                    <option value="GROWTH">Growth</option>
                    <option value="ENTERPRISE">Enterprise</option>
                </Select>
            </form>
        </Modal>
    )
}

// -----------------------------------------------------------------------------

const CredsModal = ({
    tenant,
    onClose,
    onRegenerate
}: {
    tenant: TTenant | null
    onClose: () => void
    onRegenerate: () => void
}) => {
    const [copied, setCopied] = useState<string | null>(null)

    if (!tenant) return null

    const copy = (field: string, value: string) => {
        navigator.clipboard.writeText(value)
        setCopied(field)
        setTimeout(() => setCopied(null), 1400)
    }

    const block = `Tenant: ${tenant.name}
Login URL: ${typeof window !== 'undefined' ? window.location.origin : ''}/login
Email: ${tenant.adminEmail}
Temporary password: ${tenant.initialPassword ?? '—'}

The admin must change the password on first login.`

    return (
        <Modal
            open={!!tenant}
            onClose={onClose}
            title={`Credentials · ${tenant.name}`}
            description="Share this with the admin. Passwords are one-shot — regenerate if you lose the handoff."
            footer={
                <>
                    <Button
                        variant="ghost"
                        leftIcon={<RotateCcw size={14} />}
                        onClick={onRegenerate}>
                        Regenerate
                    </Button>
                    <Button
                        leftIcon={copied === 'block' ? <Check size={14} /> : <Copy size={14} />}
                        onClick={() => copy('block', block)}>
                        {copied === 'block' ? 'Copied' : 'Copy all'}
                    </Button>
                </>
            }>
            <div className="space-y-4">
                <Row
                    label="Login URL"
                    value={
                        typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'
                    }
                    onCopy={(v) => copy('url', v)}
                    copied={copied === 'url'}
                />
                <Row
                    label="Admin email"
                    value={tenant.adminEmail}
                    onCopy={(v) => copy('email', v)}
                    copied={copied === 'email'}
                />
                <Row
                    label="Temporary password"
                    value={tenant.initialPassword ?? '—'}
                    onCopy={(v) => copy('password', v)}
                    copied={copied === 'password'}
                    mono
                />
                <pre className="font-mono text-xs bg-surface-2 border rounded-md p-3 whitespace-pre-wrap text-fg-soft">
                    {block}
                </pre>
                {tenant.credsLastSharedAt && (
                    <div className="text-xs text-fg-muted">
                        Last shared {new Date(tenant.credsLastSharedAt).toLocaleString()}
                    </div>
                )}
            </div>
        </Modal>
    )
}

const Row = ({
    label,
    value,
    onCopy,
    copied,
    mono
}: {
    label: string
    value: string
    onCopy: (v: string) => void
    copied: boolean
    mono?: boolean
}) => (
    <div>
        <label className="block text-xs font-medium text-fg-soft mb-1.5">{label}</label>
        <div className="flex items-center gap-2">
            <div
                className={
                    'flex-1 truncate bg-surface-2 border rounded-md px-3 py-2 text-sm ' + (mono ? 'font-mono' : '')
                }>
                {value}
            </div>
            <Button
                variant="ghost"
                size="icon"
                aria-label="Copy"
                onClick={() => onCopy(value)}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
        </div>
    </div>
)
