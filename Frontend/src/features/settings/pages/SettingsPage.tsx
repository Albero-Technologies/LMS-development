import { useState } from 'react'
import { Palette, Monitor, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Tabs } from '@shared/components/ui/Tabs'
import { cn } from '@shared/helpers/cn'
import { useThemeStore } from '@shared/stores/themeStore'

type Tab = 'branding' | 'appearance' | 'plan'

export const SettingsPage = () => {
    const [tab, setTab] = useState<Tab>('branding')
    const theme = useThemeStore((s) => s.theme)
    const setTheme = useThemeStore((s) => s.setTheme)

    const [name, setName] = useState('Ascend Academy')
    const [color, setColor] = useState('#0062FF')
    const [subdomain] = useState('ascend.learnhub.in')

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

            {tab === 'appearance' && (
                <Card>
                    <h2 className="text-sm font-semibold text-fg mb-4">Theme</h2>
                    <div className="grid grid-cols-3 gap-3 max-w-xl">
                        {(
                            [
                                { k: 'light', label: 'Light', Icon: Sun },
                                { k: 'dark', label: 'Dark', Icon: Moon }
                            ] as const
                        ).map((opt) => {
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
                                        active
                                            ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]'
                                            : 'hover:bg-surface-hover'
                                    )}>
                                    <div className="flex items-center gap-2">
                                        <opt.Icon size={14} />
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-fg-muted">
                                        {opt.k === 'light'
                                            ? 'Bright surfaces, high contrast. Great for projector demos.'
                                            : 'Low-glare surfaces. Easier on the eyes for long sessions.'}
                                    </p>
                                </button>
                            )
                        })}
                        <div className="rounded-md border p-4 bg-surface-2">
                            <div className="flex items-center gap-2">
                                <Monitor size={14} />
                                <span className="text-sm font-medium">System</span>
                                <Badge>Coming soon</Badge>
                            </div>
                            <p className="mt-2 text-xs text-fg-muted">Follow your OS preference automatically.</p>
                        </div>
                    </div>
                </Card>
            )}

            {tab === 'plan' && (
                <Card>
                    <h2 className="text-sm font-semibold text-fg mb-4">Plan</h2>
                    <div className="space-y-2.5 text-sm max-w-md">
                        <Row
                            label="Current"
                            value={
                                <Badge tone="brand">GROWTH</Badge>
                            }
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

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-fg-muted">{label}</span>
        <span className="text-fg">{value}</span>
    </div>
)
