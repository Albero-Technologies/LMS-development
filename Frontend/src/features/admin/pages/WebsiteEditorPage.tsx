// Website editor (§11). WordPress-lite block editor:
//  - Left panel: ordered list of sections + add-section template picker
//  - Right panel: live preview rendered by the same component used by the
//    public landing page, so what you see is what you ship
//  - Each section has its own inline form (variant picker + per-field copy)
//  - Reorder via up/down buttons; full HTML5 drag-and-drop is a follow-up
//
// Persistence: the entire `landing.sections` array gets saved on Save Changes.
// Tenants who haven't customised yet see the default layout pre-populated.

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Save,
    Eye,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    LayoutTemplate,
    PencilLine,
    X,
    Sparkles,
    LayoutGrid,
    Megaphone,
    Info as InfoIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Modal } from '@shared/components/ui/Modal'
import {
    LANDING_TEMPLATES,
    defaultLandingSections,
    getTenantDetail,
    instantiateTemplate,
    listAllTenants,
    readLandingContent,
    updateTenantById,
    type LandingPillar,
    type LandingSection,
    type LandingTemplate,
    type TenantSettings
} from '../services/tenant.service'
import { LandingSectionRenderer } from '@features/marketing/components/LandingSection'

const SECTION_ICON: Record<LandingSection['type'], typeof Sparkles> = {
    hero: Sparkles,
    features: LayoutGrid,
    cta: Megaphone,
    callout: InfoIcon
}

const SECTION_LABEL: Record<LandingSection['type'], string> = {
    hero: 'Hero',
    features: 'Features',
    cta: 'CTA',
    callout: 'Callout'
}

export const WebsiteEditorPage = () => {
    const queryClient = useQueryClient()
    const tenantsQuery = useQuery({ queryKey: ['tenants'], queryFn: listAllTenants, staleTime: 60_000 })
    const [tenantId, setTenantId] = useState('')

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

    const tenant = detailQuery.data
    const initialContent = useMemo(() => readLandingContent(tenant), [tenant])

    const [sections, setSections] = useState<LandingSection[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [pickerOpen, setPickerOpen] = useState(false)

    // Reset draft whenever the loaded tenant changes.
    useEffect(() => {
        if (!tenant) return
        const next = initialContent.sections ?? defaultLandingSections(tenant.name)
        setSections(next)
        setSelectedId(next[0]?.id ?? null)
    }, [tenant, initialContent.sections])

    const dirty = useMemo(
        () => JSON.stringify(sections) !== JSON.stringify(initialContent.sections ?? (tenant ? defaultLandingSections(tenant.name) : [])),
        [sections, initialContent.sections, tenant]
    )

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!tenant) throw new Error('Tenant not loaded')
            const settings: TenantSettings = {
                ...(tenant.settings ?? {}),
                landing: { ...(tenant.settings?.landing as object | undefined ?? {}), sections }
            }
            return updateTenantById(tenantId, { settings })
        },
        onSuccess: () => {
            toast.success('Landing page saved')
            void queryClient.invalidateQueries({ queryKey: ['tenants', tenantId] })
            void queryClient.invalidateQueries({ queryKey: ['public', 'tenant'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    const updateSection = (id: string, patch: Partial<LandingSection['data']>) => {
        setSections((xs) => xs.map((s) => (s.id === id ? ({ ...s, data: { ...s.data, ...patch } } as LandingSection) : s)))
    }
    const updateVariant = (id: string, variant: string) => {
        setSections((xs) => xs.map((s) => (s.id === id ? ({ ...s, variant } as LandingSection) : s)))
    }
    const moveSection = (id: string, dir: -1 | 1) => {
        setSections((xs) => {
            const idx = xs.findIndex((s) => s.id === id)
            if (idx < 0) return xs
            const next = [...xs]
            const swap = idx + dir
            if (swap < 0 || swap >= next.length) return xs
            ;[next[idx], next[swap]] = [next[swap], next[idx]]
            return next
        })
    }
    const removeSection = (id: string) => {
        setSections((xs) => xs.filter((s) => s.id !== id))
        if (selectedId === id) setSelectedId(null)
    }
    const insertTemplate = (t: LandingTemplate) => {
        const inst = instantiateTemplate(t)
        setSections((xs) => [...xs, inst])
        setSelectedId(inst.id)
        setPickerOpen(false)
    }

    const tenants = tenantsQuery.data ?? []
    const selectedSection = sections.find((s) => s.id === selectedId) ?? null
    const previewUrl = tenant ? `/t/${tenant.slug}` : '/'

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="Website editor"
                description="Drag-friendly block editor. Pick from the template library, drop blocks onto the page, edit copy in place."
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
                            disabled={!dirty || !tenant}
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
                <div className="grid lg:grid-cols-[420px_1fr] gap-4 items-start">
                    {/* Left panel — section list + selected section editor */}
                    <div className="space-y-4">
                        <Card padded={false}>
                            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                                <h3 className="text-sm font-semibold text-fg">Sections</h3>
                                <Button
                                    size="sm"
                                    leftIcon={<Plus size={12} />}
                                    onClick={() => setPickerOpen(true)}>
                                    Add
                                </Button>
                            </div>
                            <ul className="divide-y">
                                {sections.length === 0 && (
                                    <li className="p-4 text-sm text-fg-muted text-center">No sections yet — add one to get started.</li>
                                )}
                                {sections.map((s, i) => {
                                    const Icon = SECTION_ICON[s.type]
                                    const active = s.id === selectedId
                                    return (
                                        <li
                                            key={s.id}
                                            className={
                                                'p-3 flex items-center gap-2 transition-colors ' +
                                                (active ? 'bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover')
                                            }>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedId(s.id)}
                                                className="flex-1 flex items-center gap-2 text-left min-w-0">
                                                <span
                                                    className={
                                                        'h-7 w-7 rounded-md grid place-items-center shrink-0 ' +
                                                        (active ? 'bg-[var(--color-brand-500)] text-white' : 'bg-surface-2 text-fg-soft')
                                                    }>
                                                    <Icon size={14} />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="text-sm font-medium text-fg block truncate">
                                                        {SECTION_LABEL[s.type]} · {s.variant}
                                                    </span>
                                                    <span className="text-[11px] text-fg-muted truncate">{getSectionPreviewText(s)}</span>
                                                </span>
                                            </button>
                                            <div className="flex shrink-0">
                                                <button
                                                    type="button"
                                                    aria-label="Move up"
                                                    disabled={i === 0}
                                                    onClick={() => moveSection(s.id, -1)}
                                                    className="p-1 text-fg-muted hover:text-fg disabled:opacity-30">
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label="Move down"
                                                    disabled={i === sections.length - 1}
                                                    onClick={() => moveSection(s.id, 1)}
                                                    className="p-1 text-fg-muted hover:text-fg disabled:opacity-30">
                                                    <ChevronDown size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label="Remove section"
                                                    onClick={() => {
                                                        if (window.confirm('Remove this section?')) removeSection(s.id)
                                                    }}
                                                    className="p-1 text-fg-muted hover:text-[var(--color-danger)]">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </Card>

                        {selectedSection && (
                            <SectionEditor
                                section={selectedSection}
                                onUpdateData={(patch) => updateSection(selectedSection.id, patch)}
                                onUpdateVariant={(v) => updateVariant(selectedSection.id, v)}
                            />
                        )}
                    </div>

                    {/* Right panel — live preview rendered with the same component the public site uses */}
                    <Card padded={false}>
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2 text-xs text-fg-muted">
                            <PencilLine size={14} />
                            <span className="font-mono">/t/{tenant.slug}</span>
                            <span className="ml-auto inline-flex items-center gap-1 text-fg-soft">
                                <Eye size={11} /> Live preview
                            </span>
                        </div>
                        <div className="bg-bg overflow-hidden">
                            {sections.length === 0 ? (
                                <div className="grid place-items-center h-96 text-fg-muted">
                                    <div className="text-center">
                                        <LayoutTemplate
                                            size={36}
                                            className="mx-auto mb-3 opacity-40"
                                        />
                                        <div className="text-sm">Empty page — pick a template to begin.</div>
                                    </div>
                                </div>
                            ) : (
                                sections.map((s) => (
                                    <LandingSectionRenderer
                                        key={s.id}
                                        section={s}
                                        slugBase={`/t/${tenant.slug}`}
                                        tenantName={tenant.name}
                                    />
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            )}

            <TemplatePicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onPick={insertTemplate}
            />
        </>
    )
}

const getSectionPreviewText = (s: LandingSection): string => {
    switch (s.type) {
        case 'hero':
            return s.data.title || 'Untitled hero'
        case 'features':
            return s.data.title || `${s.data.pillars?.length ?? 0} features`
        case 'cta':
            return s.data.title || 'CTA'
        case 'callout':
            return s.data.title || 'Callout'
    }
}

// ---- Per-section editor — variant picker + form fields ----------------------

const SectionEditor = ({
    section,
    onUpdateData,
    onUpdateVariant
}: {
    section: LandingSection
    onUpdateData: (patch: Partial<LandingSection['data']>) => void
    onUpdateVariant: (v: string) => void
}) => {
    const variantOptions = VARIANTS_BY_TYPE[section.type]
    return (
        <Card>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-fg">Edit {SECTION_LABEL[section.type]}</h3>
                <Select
                    aria-label="Variant"
                    value={section.variant}
                    onChange={(e) => onUpdateVariant(e.target.value)}
                    className="!w-32">
                    {variantOptions.map((v) => (
                        <option
                            key={v}
                            value={v}>
                            {v}
                        </option>
                    ))}
                </Select>
            </div>

            {section.type === 'hero' && (
                <HeroFields
                    data={section.data}
                    onChange={onUpdateData}
                />
            )}
            {section.type === 'features' && (
                <FeaturesFields
                    data={section.data}
                    onChange={onUpdateData}
                />
            )}
            {section.type === 'cta' && (
                <CtaFields
                    data={section.data}
                    onChange={onUpdateData}
                />
            )}
            {section.type === 'callout' && (
                <CalloutFields
                    data={section.data}
                    onChange={onUpdateData}
                />
            )}
        </Card>
    )
}

const VARIANTS_BY_TYPE: Record<LandingSection['type'], string[]> = {
    hero: ['split', 'centered', 'gradient'],
    features: ['three-up', 'four-up', 'list'],
    cta: ['banner', 'card'],
    callout: ['info', 'success']
}

const HeroFields = ({ data, onChange }: { data: Extract<LandingSection, { type: 'hero' }>['data']; onChange: (p: object) => void }) => (
    <div className="space-y-3">
        <Input
            label="Eyebrow"
            value={data.eyebrow ?? ''}
            onChange={(e) => onChange({ eyebrow: e.target.value })}
        />
        <Input
            label="Title"
            value={data.title ?? ''}
            onChange={(e) => onChange({ title: e.target.value })}
        />
        <Textarea
            label="Subtitle"
            rows={2}
            value={data.subtitle ?? ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
        />
        <Input
            label="Primary CTA label"
            value={data.primaryCtaLabel ?? ''}
            onChange={(e) => onChange({ primaryCtaLabel: e.target.value })}
        />
        <Input
            label="Primary CTA link (path or URL)"
            value={data.primaryCtaLink ?? ''}
            onChange={(e) => onChange({ primaryCtaLink: e.target.value })}
            hint="Use a relative path like 'enquiry' to stay inside this tenant."
        />
    </div>
)

const FeaturesFields = ({ data, onChange }: { data: Extract<LandingSection, { type: 'features' }>['data']; onChange: (p: object) => void }) => {
    const pillars = data.pillars ?? []
    const update = (i: number, patch: Partial<LandingPillar>) => {
        const next = pillars.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
        onChange({ pillars: next })
    }
    const add = () => onChange({ pillars: [...pillars, { title: 'New feature', description: '' }] })
    const remove = (i: number) => onChange({ pillars: pillars.filter((_, idx) => idx !== i) })

    return (
        <div className="space-y-3">
            <Input
                label="Section title"
                value={data.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
            />
            <div className="space-y-2">
                {pillars.map((p, i) => (
                    <div
                        key={i}
                        className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
                        <div className="flex items-start gap-2">
                            <Input
                                label={`Feature ${i + 1}`}
                                value={p.title}
                                onChange={(e) => update(i, { title: e.target.value })}
                            />
                            <button
                                type="button"
                                aria-label="Remove feature"
                                onClick={() => remove(i)}
                                className="mt-7 text-fg-muted hover:text-[var(--color-danger)]">
                                <X size={14} />
                            </button>
                        </div>
                        <Textarea
                            label="Description"
                            rows={2}
                            value={p.description}
                            onChange={(e) => update(i, { description: e.target.value })}
                        />
                    </div>
                ))}
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={12} />}
                    onClick={add}>
                    Add feature
                </Button>
            </div>
        </div>
    )
}

const CtaFields = ({ data, onChange }: { data: Extract<LandingSection, { type: 'cta' }>['data']; onChange: (p: object) => void }) => (
    <div className="space-y-3">
        <Input
            label="Title"
            value={data.title ?? ''}
            onChange={(e) => onChange({ title: e.target.value })}
        />
        <Textarea
            label="Subtitle"
            rows={2}
            value={data.subtitle ?? ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
        />
        <Input
            label="Button label"
            value={data.buttonLabel ?? ''}
            onChange={(e) => onChange({ buttonLabel: e.target.value })}
        />
        <Input
            label="Button link"
            value={data.buttonLink ?? ''}
            onChange={(e) => onChange({ buttonLink: e.target.value })}
            hint="Path or URL."
        />
    </div>
)

const CalloutFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'callout' }>['data']
    onChange: (p: object) => void
}) => (
    <div className="space-y-3">
        <Input
            label="Title"
            value={data.title ?? ''}
            onChange={(e) => onChange({ title: e.target.value })}
        />
        <Textarea
            label="Body"
            rows={3}
            value={data.body ?? ''}
            onChange={(e) => onChange({ body: e.target.value })}
        />
    </div>
)

// ---- Template picker — modal with grouped templates ------------------------

const TemplatePicker = ({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (t: LandingTemplate) => void }) => {
    const grouped = useMemo(() => {
        const m = new Map<LandingSection['type'], LandingTemplate[]>()
        for (const t of LANDING_TEMPLATES) {
            const list = m.get(t.section.type) ?? []
            list.push(t)
            m.set(t.section.type, list)
        }
        return Array.from(m.entries())
    }, [])

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Pick a template"
            description="Add a pre-built section to the page. You can edit copy after inserting."
            size="lg">
            <div className="space-y-5">
                {grouped.map(([type, templates]) => (
                    <div key={type}>
                        <h4 className="text-xs font-semibold uppercase text-fg-muted tracking-wider mb-2">{SECTION_LABEL[type]}</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {templates.map((t, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => onPick(t)}
                                    className="rounded-md border border-[var(--color-border)] p-4 text-left hover:bg-surface-hover hover:border-[var(--color-brand-500)] transition-colors">
                                    <div className="text-sm font-semibold text-fg">{t.label}</div>
                                    <div className="text-xs text-fg-soft mt-1 line-clamp-2">{t.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    )
}
