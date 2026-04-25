import { useState, type ReactNode } from 'react'
import { Palette, Monitor, Moon, Sun, User, KeyRound, Save } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Tabs } from '@shared/components/ui/Tabs'
import { cn } from '@shared/helpers/cn'
import { useThemeStore } from '@shared/stores/themeStore'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES, ROLE_LABEL } from '@shared/constants/roles'

// Settings splits by role:
//   - Admin: institute branding + appearance + plan (they own the tenant).
//   - Everyone else: profile + security + appearance.
// The Notifications tab was dummy state with no backend persistence; the
// /app/notifications page is the canonical inbox view.
export const SettingsPage = () => {
    const role = useAuthStore((s) => s.user?.role)
    if (role === ROLES.ADMIN) return <TenantSettings />
    return <PersonalSettings />
}

// ----- Personal settings (all non-Admin roles) -------------------------------

type PersonalTab = 'profile' | 'security' | 'appearance'

const PersonalSettings = () => {
    const user = useAuthStore((s) => s.user)
    const setUser = useAuthStore((s) => s.setUser)
    const [tab, setTab] = useState<PersonalTab>('profile')

    const [first, last] = (user?.name ?? '').split(' ')
    const [firstName, setFirstName] = useState(first ?? '')
    const [lastName, setLastName] = useState(last ?? '')
    const [email, setEmail] = useState(user?.email ?? '')
    const [phone, setPhone] = useState('')

    const saveProfile = () => {
        if (user) setUser({ ...user, name: `${firstName} ${lastName}`.trim(), email })
        toast.success('Profile updated')
    }

    return (
        <>
            <PageHeader
                eyebrow="Account"
                title="Your settings"
                description="Update your profile, secure your account, and manage platform preferences."
            />

            <Tabs
                tabs={[
                    { value: 'profile', label: 'Profile' },
                    { value: 'security', label: 'Security' },
                    { value: 'appearance', label: 'Appearance' }
                ]}
                value={tab}
                onChange={setTab}
                className="mb-6"
            />

            {tab === 'profile' && (
                <div className="grid lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2 space-y-4">
                        <h2 className="text-sm font-semibold text-fg inline-flex items-center gap-2">
                            <User size={14} /> Profile details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98000 00000"
                        />
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={saveProfile}
                                leftIcon={<Save size={14} />}>
                                Save profile
                            </Button>
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-sm font-semibold text-fg mb-3">Signed in as</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-brand-500)] text-white flex items-center justify-center text-base font-semibold">
                                {(user?.name || user?.email || '?')[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="font-medium text-fg truncate">{user?.name || '—'}</div>
                                <div className="text-xs text-fg-muted truncate">{user?.email}</div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-fg-muted">Role</span>
                                <Badge tone={user?.role === ROLES.SUPER_ADMIN ? 'danger' : 'brand'}>{user ? ROLE_LABEL[user.role] : '—'}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-fg-muted">User ID</span>
                                <span className="font-mono text-fg">{user?.id.slice(0, 8) ?? '—'}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'security' && <SecurityPanel />}

            {tab === 'appearance' && <AppearancePanel />}
        </>
    )
}

const SecurityPanel = () => {
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')

    const submit = () => {
        if (!current || !next) return toast.error('Enter your current and new password')
        if (next !== confirm) return toast.error('New passwords do not match')
        if (next.length < 8) return toast.error('Password must be at least 8 characters')
        setCurrent('')
        setNext('')
        setConfirm('')
        toast.success('Password changed')
    }

    return (
        <Card className="space-y-4 max-w-xl">
            <h2 className="text-sm font-semibold text-fg inline-flex items-center gap-2">
                <KeyRound size={14} /> Change password
            </h2>
            <Input
                label="Current password"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
            />
            <Input
                label="New password"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
            />
            <Input
                label="Confirm new password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
            />
            <div className="flex justify-end">
                <Button onClick={submit}>Update password</Button>
            </div>
        </Card>
    )
}

const AppearancePanel = () => {
    const theme = useThemeStore((s) => s.theme)
    const setTheme = useThemeStore((s) => s.setTheme)

    const options = [
        { k: 'light' as const, label: 'Light', Icon: Sun, hint: 'Bright surfaces, high contrast. Great for projector demos.' },
        { k: 'dark' as const, label: 'Dark', Icon: Moon, hint: 'Low-glare surfaces. Easier on the eyes for long sessions.' },
        { k: 'system' as const, label: 'System', Icon: Monitor, hint: 'Follow your OS preference automatically.' }
    ]

    return (
        <Card>
            <h2 className="text-sm font-semibold text-fg mb-4">Theme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                {options.map((opt) => {
                    const active = theme === opt.k
                    return (
                        <button
                            key={opt.k}
                            type="button"
                            onClick={() => {
                                setTheme(opt.k)
                                toast.success(`${opt.label} theme applied`)
                            }}
                            className={cn(
                                'rounded-md border p-4 text-left transition-colors',
                                active ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover'
                            )}>
                            <div className="flex items-center gap-2">
                                <opt.Icon size={14} />
                                <span className="text-sm font-medium">{opt.label}</span>
                            </div>
                            <p className="mt-2 text-xs text-fg-muted">{opt.hint}</p>
                        </button>
                    )
                })}
            </div>
        </Card>
    )
}

// ----- Tenant settings (Admin) -----------------------------------------------

type TenantTab = 'branding' | 'appearance' | 'plan'

const TenantSettings = () => {
    const [tab, setTab] = useState<TenantTab>('branding')
    const [name, setName] = useState('Acme Institute')
    const [color, setColor] = useState('#0062FF')
    const [subdomain] = useState('acme.albero.academy')

    const save = () => toast.success('Settings saved')

    return (
        <>
            <PageHeader
                eyebrow="Tenant"
                title="Settings"
                description="Branding, appearance, and plan for your institute."
            />

            <Tabs
                tabs={[
                    { value: 'branding', label: 'Branding' },
                    { value: 'appearance', label: 'Appearance' },
                    { value: 'plan', label: 'Plan' }
                ]}
                value={tab}
                onChange={setTab}
                className="mb-6"
            />

            {tab === 'branding' && (
                <div className="grid lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2 space-y-4">
                        <h2 className="text-sm font-semibold text-fg">Brand identity</h2>
                        <Input
                            label="Institute name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div>
                            <label className="block text-xs font-medium text-fg-soft mb-1.5">Primary colour</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    aria-label="Primary colour"
                                    className="w-10 h-10 rounded-md border cursor-pointer bg-transparent p-1"
                                />
                                <Input
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                        </div>
                        <Input
                            label="Public sub-domain"
                            value={subdomain}
                            readOnly
                            rightSlot={<Badge tone="ok">Verified</Badge>}
                        />
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={save}
                                leftIcon={<Palette size={14} />}>
                                Save changes
                            </Button>
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-sm font-semibold text-fg mb-3">Preview</h2>
                        <div
                            className="rounded-md p-5 border text-white"
                            style={{ background: color }}>
                            <div className="text-[10px] uppercase tracking-wider opacity-80">Student</div>
                            <div className="text-lg font-semibold mt-1">Welcome to {name}</div>
                            <div className="text-xs opacity-80 mt-1">Pick up where you left off.</div>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'appearance' && <AppearancePanel />}

            {tab === 'plan' && (
                <Card>
                    <h2 className="text-sm font-semibold text-fg mb-4">Plan</h2>
                    <div className="space-y-2.5 text-sm max-w-md">
                        <Row
                            label="Current"
                            value={<Badge tone="brand">GROWTH</Badge>}
                        />
                        <Row
                            label="Seat limit"
                            value={<span className="font-mono">2,000</span>}
                        />
                        <Row
                            label="Renews"
                            value={<span className="font-mono">Aug 14</span>}
                        />
                    </div>
                    <Button
                        variant="ghost"
                        className="mt-4"
                        onClick={() => toast.info('Plan management page coming soon.')}>
                        Change plan
                    </Button>
                </Card>
            )}
        </>
    )
}

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-fg-muted">{label}</span>
        <span className="text-fg">{value}</span>
    </div>
)
