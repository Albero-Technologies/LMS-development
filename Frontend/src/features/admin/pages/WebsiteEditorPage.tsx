// Website editor (§11). Picks any tenant and edits their landing page copy.
// Fields are persisted in `tenant.settings.landing` and read back by the
// per-tenant public landing page (`/t/:slug`). The right-hand panel is a live
// preview that re-renders as the SA types — saving is just one PATCH.
//
// This is the simple, copy-only iteration. Drag-and-drop section ordering and
// per-section visibility live in a follow-up; today the layout is fixed and
// the SA controls only the content.
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Eye, Globe, Plus, X, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import {
    getTenantDetail,
    listAllTenants,
    readLandingContent,
    updateTenantById,
    type LandingContent,
    type LandingPillar,
    type TenantSettings
} from '../services/tenant.service'

export const WebsiteEditorPage = () => {
    const queryClient = useQueryClient()
    const tenantsQuery = useQuery({ queryKey: ['tenants'], queryFn: listAllTenants, staleTime: 60_000 })
    const [tenantId, setTenantId] = useState<string>('')

    useEffect(() => {
        if (!tenantId && tenantsQuery.data && tenantsQuery.data.length > 0) {
            setTenantId(tenantsQuery.data[0].id)
        }
    }, [tenantId, tenantsQuery.data])

    const detailQuery = useQuery({
        queryKey: ['tenants', tenantId],
        queryFn: () => getTenantDetail(tenantId),
        enabled: tenantId.length > 0,
        staleTime: 60_000
    })

    const initial = useMemo(() => readLandingContent(detailQuery.data), [detailQuery.data])
    const [draft, setDraft] = useState<LandingContent>(initial)
    useEffect(() => setDraft(initial), [initial])

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!detailQuery.data) throw new Error('Tenant not loaded')
            const settings: TenantSettings = { ...(detailQuery.data.settings ?? {}), landing: draft }
            return updateTenantById(tenantId, { settings })
        },
        onSuccess: () => {
            toast.success('Landing page saved')
            void queryClient.invalidateQueries({ queryKey: ['tenants', tenantId] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    const dirty = JSON.stringify(draft) !== JSON.stringify(initial)
    const tenants = tenantsQuery.data ?? []
    const tenant = detailQuery.data
    const previewUrl = tenant ? `/t/${tenant.slug}` : '/'

    const updatePillar = (i: number, patch: Partial<LandingPillar>) => {
        const next = [...(draft.pillars ?? [])]
        next[i] = { ...next[i], ...patch }
        setDraft({ ...draft, pillars: next })
    }
    const addPillar = () => {
        if ((draft.pillars?.length ?? 0) >= 6) return
        setDraft({ ...draft, pillars: [...(draft.pillars ?? []), { title: 'New pillar', description: '' }] })
    }
    const removePillar = (i: number) => {
        const next = (draft.pillars ?? []).filter((_, idx) => idx !== i)
        setDraft({ ...draft, pillars: next })
    }

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="Website editor"
                description="Edit any tenant's public landing page. Changes go live as soon as you save."
                actions={
                    <>
                        <div className="w-64">
                            <Select
                                aria-label="Choose tenant"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}>
                                {tenants.map((t) => (
                                    <option
                                        key={t.id}
                                        value={t.id}>
                                        {t.name} (/{t.slug})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye size={14} />}
                            disabled={!tenant}
                            onClick={() => window.open(previewUrl, '_blank')}>
                            Open live
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Save size={14} />}
                            disabled={!dirty}
                            loading={saveMutation.isPending}
                            onClick={() => saveMutation.mutate()}>
                            Save changes
                        </Button>
                    </>
                }
            />

            {detailQuery.isLoading || !tenant ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : (
                <div className="grid lg:grid-cols-[420px_1fr] gap-4">
                    {/* Edit panel */}
                    <div className="space-y-4">
                        <Card>
                            <h3 className="text-sm font-semibold text-fg mb-3">Hero</h3>
                            <div className="space-y-3">
                                <Input
                                    label="Eyebrow tag"
                                    value={draft.heroTag ?? ''}
                                    onChange={(e) => setDraft({ ...draft, heroTag: e.target.value })}
                                    hint="Small badge above the headline."
                                />
                                <Input
                                    label="Headline"
                                    value={draft.heroTitle ?? ''}
                                    onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
                                    placeholder={`Learn with ${tenant.name}`}
                                />
                                <Textarea
                                    label="Sub-headline"
                                    rows={3}
                                    value={draft.heroSubtitle ?? ''}
                                    onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })}
                                />
                                <Input
                                    label="Primary CTA label"
                                    value={draft.primaryCtaLabel ?? ''}
                                    onChange={(e) => setDraft({ ...draft, primaryCtaLabel: e.target.value })}
                                />
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-fg">Pillars</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={<Plus size={12} />}
                                    onClick={addPillar}
                                    disabled={(draft.pillars?.length ?? 0) >= 6}>
                                    Add
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {(draft.pillars ?? []).map((p, i) => (
                                    <div
                                        key={i}
                                        className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <Input
                                                label={`Pillar ${i + 1} title`}
                                                value={p.title}
                                                onChange={(e) => updatePillar(i, { title: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                aria-label="Remove pillar"
                                                onClick={() => removePillar(i)}
                                                className="mt-7 text-fg-muted hover:text-[var(--color-danger)]">
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <Textarea
                                            label="Description"
                                            rows={2}
                                            value={p.description}
                                            onChange={(e) => updatePillar(i, { description: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-sm font-semibold text-fg mb-3">Closing CTA</h3>
                            <div className="space-y-3">
                                <Input
                                    label="Title"
                                    value={draft.ctaTitle ?? ''}
                                    onChange={(e) => setDraft({ ...draft, ctaTitle: e.target.value })}
                                />
                                <Textarea
                                    label="Sub-title"
                                    rows={2}
                                    value={draft.ctaSubtitle ?? ''}
                                    onChange={(e) => setDraft({ ...draft, ctaSubtitle: e.target.value })}
                                />
                                <Input
                                    label="Button label"
                                    value={draft.ctaButtonLabel ?? ''}
                                    onChange={(e) => setDraft({ ...draft, ctaButtonLabel: e.target.value })}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Live preview */}
                    <Card padded={false}>
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2 text-xs text-fg-muted">
                            <Globe size={14} />
                            <span className="font-mono">/t/{tenant.slug}</span>
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-1 inline-flex items-center gap-1 text-fg-soft hover:text-fg">
                                <ExternalLink size={11} /> open
                            </a>
                            <Badge className="ml-auto">Preview</Badge>
                        </div>

                        <div
                            className="p-8 sm:p-12 text-center border-b border-[var(--color-border)]"
                            style={{
                                background: `linear-gradient(160deg, ${tenant.brandingColor || '#0062ff'}20 0%, transparent 50%)`
                            }}>
                            <Badge tone="brand">{draft.heroTag}</Badge>
                            <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-fg max-w-2xl mx-auto">
                                {draft.heroTitle || `Learn with ${tenant.name}`}
                            </h1>
                            <p className="mt-3 text-sm text-fg-soft max-w-xl mx-auto leading-relaxed">{draft.heroSubtitle}</p>
                            <div className="mt-5 flex justify-center gap-2">
                                <Button size="sm">{draft.primaryCtaLabel}</Button>
                                <Button
                                    size="sm"
                                    variant="ghost">
                                    Browse courses
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 grid sm:grid-cols-3 gap-3">
                            {(draft.pillars ?? []).map((p, i) => (
                                <div
                                    key={i}
                                    className="rounded-md border border-[var(--color-border)] p-4">
                                    <div className="text-sm font-semibold text-fg">{p.title || 'Untitled'}</div>
                                    <p className="mt-1 text-xs text-fg-soft">{p.description || '—'}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 m-6 mt-0 rounded-md text-center text-white bg-[var(--color-brand-500)]">
                            <h2 className="text-xl font-semibold tracking-tight">{draft.ctaTitle}</h2>
                            <p className="mt-2 text-white/85 text-sm max-w-md mx-auto">{draft.ctaSubtitle}</p>
                            <div className="mt-4">
                                <Button
                                    size="sm"
                                    className="!bg-white !text-[var(--color-brand-700)] hover:!bg-white/90">
                                    {draft.ctaButtonLabel}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    )
}
