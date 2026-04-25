import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getMyTenant, readDemoConfig, writeDemoConfig, type DemoModeConfig } from '../services/tenant.service'

const HIDEABLE_SECTIONS = [
    { key: 'reports', label: 'Reports & analytics' },
    { key: 'live-classes', label: 'Live class links' },
    { key: 'downloads', label: 'Downloadable resources' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'community', label: 'Community / forum' }
] as const

// The "Demo Mode" UI lets admins control what unpaid (demo) learners see.
// Persists into the tenant.settings.demoMode JSON via PATCH /tenants/me.
// The student dashboard will consume this config in §6.3 Phase B.
export const DemoControlPage = () => {
    const queryClient = useQueryClient()
    const tenantQuery = useQuery({
        queryKey: ['tenant', 'me'],
        queryFn: getMyTenant,
        staleTime: 60_000
    })

    const [config, setConfig] = useState<DemoModeConfig | null>(null)

    // Sync local form state when the tenant data loads or refreshes.
    useEffect(() => {
        if (tenantQuery.data) setConfig(readDemoConfig(tenantQuery.data))
    }, [tenantQuery.data])

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!tenantQuery.data || !config) throw new Error('Tenant not loaded yet')
            return writeDemoConfig(tenantQuery.data, config)
        },
        onSuccess: () => {
            toast.success('Demo Mode settings saved')
            void queryClient.invalidateQueries({ queryKey: ['tenant', 'me'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save settings')
    })

    const toggleSection = (key: string) => {
        if (!config) return
        const hiddenSections = config.hiddenSections ?? []
        const next = hiddenSections.includes(key) ? hiddenSections.filter((k) => k !== key) : [...hiddenSections, key]
        setConfig({ ...config, hiddenSections: next })
    }

    return (
        <>
            <PageHeader
                eyebrow="Tenant settings"
                title="Demo Mode"
                description="Control what unpaid learners see. Once a student pays, Demo Mode is automatically lifted for them."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Save size={14} />}
                        loading={saveMutation.isPending}
                        disabled={!config}
                        onClick={() => saveMutation.mutate()}>
                        Save
                    </Button>
                }
            />

            {tenantQuery.isLoading || !config ? (
                <Card>
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </Card>
            ) : tenantQuery.isError ? (
                <Card>
                    <p className="text-sm text-fg-soft">Couldn't load tenant settings. Try again in a moment.</p>
                </Card>
            ) : (
                <div className="grid lg:grid-cols-2 gap-4">
                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-1">Mode</h3>
                        <p className="text-xs text-fg-muted mb-4">
                            When enabled, students who haven't completed a payment see only the demo content + the upgrade CTA.
                        </p>
                        <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
                            <span className="text-sm text-fg">Enable Demo Mode</span>
                            <Toggle
                                checked={config.enabled}
                                onChange={(v) => setConfig({ ...config, enabled: v })}
                            />
                        </label>
                        <Input
                            label="Demo expiry date (optional)"
                            type="date"
                            value={config.expiryDate ? config.expiryDate.slice(0, 10) : ''}
                            onChange={(e) => setConfig({ ...config, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        />
                        <p className="mt-1 text-xs text-fg-muted">After this date, demo accounts are blocked from logging in until they upgrade.</p>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-1">Upgrade CTA banner</h3>
                        <p className="text-xs text-fg-muted mb-4">Displayed at the top of every page for users in Demo Mode.</p>
                        <Input
                            label="Banner text"
                            value={config.ctaBannerText ?? ''}
                            onChange={(e) => setConfig({ ...config, ctaBannerText: e.target.value })}
                            placeholder="You're in Demo Mode — upgrade to unlock all courses."
                        />
                        <div className="grid sm:grid-cols-2 gap-3 mt-3">
                            <Input
                                label="Button text"
                                value={config.ctaButtonText ?? ''}
                                onChange={(e) => setConfig({ ...config, ctaButtonText: e.target.value })}
                                placeholder="Upgrade now"
                            />
                            <Input
                                label="Button URL"
                                value={config.ctaButtonUrl ?? ''}
                                onChange={(e) => setConfig({ ...config, ctaButtonUrl: e.target.value })}
                                placeholder="/app/payments"
                            />
                        </div>
                    </Card>

                    <Card className="lg:col-span-2">
                        <h3 className="text-sm font-semibold text-fg mb-1">Hidden sections</h3>
                        <p className="text-xs text-fg-muted mb-4">
                            Hide specific dashboard sections from demo users. They become visible the moment a payment lands.
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-2">
                            {HIDEABLE_SECTIONS.map((s) => {
                                const hidden = (config.hiddenSections ?? []).includes(s.key)
                                return (
                                    <li key={s.key}>
                                        <button
                                            type="button"
                                            onClick={() => toggleSection(s.key)}
                                            className={
                                                'w-full flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors hover:bg-surface-hover ' +
                                                (hidden
                                                    ? 'border-[var(--color-warn)]/40 bg-[var(--color-warn-soft)]'
                                                    : 'border-[var(--color-border)]')
                                            }>
                                            <span className="text-sm text-fg">{s.label}</span>
                                            {hidden ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-[var(--color-warn)]">
                                                    <EyeOff size={12} /> Hidden
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
                                                    <Eye size={12} /> Visible
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </Card>
                </div>
            )}
        </>
    )
}

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] ' +
            (checked ? 'bg-[var(--color-brand-500)]' : 'bg-[var(--color-border)]')
        }>
        <span
            aria-hidden
            className={
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ' +
                (checked ? 'translate-x-5' : 'translate-x-0')
            }
        />
    </button>
)
