// Website editor (§11) — Webflow-lite block editor revamp.
//
// What's in:
//   - Drag-and-drop section reorder via @dnd-kit (real grab handle, smooth)
//   - Multi-page support: tabbed page list, add/duplicate/delete/set-home
//   - Per-section design overrides (background, text color, padding, alignment, max-width)
//   - Responsive preview switcher: Desktop / Tablet / Mobile widths
//   - Live preview rendered with the same component the public page uses
//   - Template library + per-section variant + per-field copy editing
//
// Deferred (intentional — needs dedicated work):
//   - Visual canvas with rulers + alignment guides (custom canvas engine)
//   - Custom HTML/CSS/JS injection (security review needed)
//   - Asset/media library (storage backend)
//   - Full CMS / dynamic collections (data model + admin tooling)
//   - Per-element typography (font family, weight, line-height)
//   - Animations / GSAP integration
//
// Persistence: the entire `landing.{pages,sections}` blob is saved on Save.
// Tenants who haven't customised yet see a sensible default page.

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    Save,
    Eye,
    Plus,
    Trash2,
    LayoutTemplate,
    PencilLine,
    X,
    Sparkles,
    LayoutGrid,
    Megaphone,
    Info as InfoIcon,
    GripVertical,
    Monitor,
    Tablet,
    Smartphone,
    File,
    Home,
    Copy as CopyIcon,
    Palette,
    Image as ImageIcon,
    Code,
    Type,
    Database
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Modal } from '@shared/components/ui/Modal'
import { cn } from '@shared/helpers/cn'
import {
    LANDING_TEMPLATES,
    createBlankPage,
    defaultLandingSections,
    getTenantDetail,
    instantiateTemplate,
    listAllTenants,
    newSectionId,
    readLandingContent,
    updateTenantById,
    type LandingPage,
    type LandingPillar,
    type LandingSection,
    type LandingTemplate,
    type SectionStyle,
    type TenantSettings
} from '../services/tenant.service'
import { LandingSectionRenderer } from '@features/marketing/components/LandingSection'
import { MediaPickerModal } from '../components/MediaPickerModal'

const SECTION_ICON: Record<LandingSection['type'], typeof Sparkles> = {
    hero: Sparkles,
    features: LayoutGrid,
    cta: Megaphone,
    callout: InfoIcon,
    image: ImageIcon,
    embed: Code,
    collectionList: Database
}

const SECTION_LABEL: Record<LandingSection['type'], string> = {
    hero: 'Hero',
    features: 'Features',
    cta: 'CTA',
    callout: 'Callout',
    image: 'Image',
    embed: 'Embed',
    collectionList: 'Collection'
}

type DeviceView = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTH: Record<DeviceView, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px'
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

    // Multi-page state. If the tenant has historical `sections` but no
    // `pages`, lift the sections into a default 'Home' page so the editor
    // can present a unified pages list.
    const initialPages = useMemo<LandingPage[]>(() => {
        if (initialContent.pages && initialContent.pages.length > 0) return initialContent.pages
        const sections = initialContent.sections ?? (tenant ? defaultLandingSections(tenant.name) : [])
        return [
            {
                id: 'page-home',
                slug: '/',
                name: 'Home',
                isHome: true,
                sections
            }
        ]
    }, [initialContent.pages, initialContent.sections, tenant])

    const [pages, setPages] = useState<LandingPage[]>(initialPages)
    const [activePageId, setActivePageId] = useState<string>('')
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [device, setDevice] = useState<DeviceView>('desktop')

    // Reset draft state when tenant changes.
    useEffect(() => {
        setPages(initialPages)
        const home = initialPages.find((p) => p.isHome) ?? initialPages[0]
        setActivePageId(home?.id ?? '')
        setSelectedSectionId(home?.sections[0]?.id ?? null)
    }, [initialPages])

    const activePage = pages.find((p) => p.id === activePageId) ?? pages[0]
    const sections = activePage?.sections ?? []
    const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null

    const dirty = useMemo(() => JSON.stringify(pages) !== JSON.stringify(initialPages), [pages, initialPages])

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!tenant) throw new Error('Tenant not loaded')
            const home = pages.find((p) => p.isHome) ?? pages[0]
            const settings: TenantSettings = {
                ...(tenant.settings ?? {}),
                landing: {
                    ...(tenant.settings?.landing as object | undefined ?? {}),
                    pages,
                    // Keep `sections` in sync with the home page so existing
                    // single-page renderers don't break for tenants that haven't
                    // upgraded clients.
                    sections: home?.sections ?? []
                }
            }
            return updateTenantById(tenantId, { settings })
        },
        onSuccess: () => {
            toast.success('Site saved')
            void queryClient.invalidateQueries({ queryKey: ['tenants', tenantId] })
            void queryClient.invalidateQueries({ queryKey: ['public', 'tenant'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    // ---- Mutators (immutable updates against the pages tree) ----------------
    const mutateActivePage = (fn: (p: LandingPage) => LandingPage) =>
        setPages((xs) => xs.map((p) => (p.id === activePageId ? fn(p) : p)))

    const setSections = (next: LandingSection[]) => mutateActivePage((p) => ({ ...p, sections: next }))

    const updateSectionData = (id: string, patch: Partial<LandingSection['data']>) =>
        setSections(sections.map((s) => (s.id === id ? ({ ...s, data: { ...s.data, ...patch } } as LandingSection) : s)))

    const updateSectionVariant = (id: string, variant: string) =>
        setSections(sections.map((s) => (s.id === id ? ({ ...s, variant } as LandingSection) : s)))

    const updateSectionStyle = (id: string, patch: Partial<SectionStyle>) =>
        setSections(
            sections.map((s) => (s.id === id ? ({ ...s, style: { ...(s.style ?? {}), ...patch } } as LandingSection) : s))
        )

    const removeSection = (id: string) => {
        setSections(sections.filter((s) => s.id !== id))
        if (selectedSectionId === id) setSelectedSectionId(null)
    }

    const insertTemplate = (t: LandingTemplate) => {
        const inst = instantiateTemplate(t)
        setSections([...sections, inst])
        setSelectedSectionId(inst.id)
        setPickerOpen(false)
    }

    const duplicateSection = (id: string) => {
        const idx = sections.findIndex((s) => s.id === id)
        if (idx < 0) return
        const dup = { ...sections[idx], id: newSectionId() } as LandingSection
        const next = [...sections]
        next.splice(idx + 1, 0, dup)
        setSections(next)
    }

    // ---- Page-level mutators ------------------------------------------------
    const addPage = (name: string, slug: string) => {
        const page = createBlankPage(name, slug, false)
        setPages([...pages, page])
        setActivePageId(page.id)
        setSelectedSectionId(null)
    }
    const deletePage = (id: string) => {
        const target = pages.find((p) => p.id === id)
        if (!target) return
        if (target.isHome) {
            toast.error('Set another page as home first.')
            return
        }
        if (!window.confirm(`Delete the "${target.name}" page? This can be undone by hitting Cancel before saving.`)) return
        const next = pages.filter((p) => p.id !== id)
        setPages(next)
        if (activePageId === id) setActivePageId(next[0]?.id ?? '')
    }
    const setHome = (id: string) => setPages(pages.map((p) => ({ ...p, isHome: p.id === id })))
    const duplicatePage = (id: string) => {
        const idx = pages.findIndex((p) => p.id === id)
        if (idx < 0) return
        const src = pages[idx]
        const copy: LandingPage = {
            ...src,
            id: `pg_${Math.random().toString(36).slice(2, 10)}`,
            slug: `${src.slug}-copy`,
            name: `${src.name} (copy)`,
            isHome: false,
            sections: src.sections.map((s) => ({ ...s, id: newSectionId() } as LandingSection))
        }
        const next = [...pages]
        next.splice(idx + 1, 0, copy)
        setPages(next)
    }
    const updatePageMeta = (id: string, patch: Partial<LandingPage>) =>
        setPages(pages.map((p) => (p.id === id ? { ...p, ...patch } : p)))

    // ---- DnD ----------------------------------------------------------------
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
    const onDragEnd = (e: DragEndEvent) => {
        const { active, over } = e
        if (!over || active.id === over.id) return
        const fromIdx = sections.findIndex((s) => s.id === active.id)
        const toIdx = sections.findIndex((s) => s.id === over.id)
        if (fromIdx < 0 || toIdx < 0) return
        const next = [...sections]
        const [moved] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, moved)
        setSections(next)
    }

    const tenants = tenantsQuery.data ?? []
    const previewUrl = tenant ? `/t/${tenant.slug}` : '/'

    return (
        <>
            <PageHeader
                eyebrow="Super Admin"
                title="Website editor"
                description="Drag sections to reorder. Switch device views. Multi-page support with per-page SEO."
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
                <>
                    {/* Pages bar */}
                    <PagesBar
                        pages={pages}
                        activePageId={activePageId}
                        onSelect={(id) => {
                            setActivePageId(id)
                            const p = pages.find((x) => x.id === id)
                            setSelectedSectionId(p?.sections[0]?.id ?? null)
                        }}
                        onAdd={(name, slug) => addPage(name, slug)}
                        onDuplicate={duplicatePage}
                        onDelete={deletePage}
                        onSetHome={setHome}
                        onUpdateMeta={updatePageMeta}
                    />

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
                                {sections.length === 0 ? (
                                    <div className="p-4 text-sm text-fg-muted text-center">No sections yet — add one to get started.</div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={onDragEnd}>
                                        <SortableContext
                                            items={sections.map((s) => s.id)}
                                            strategy={verticalListSortingStrategy}>
                                            <ul className="divide-y">
                                                {sections.map((s) => (
                                                    <SortableSectionItem
                                                        key={s.id}
                                                        section={s}
                                                        active={s.id === selectedSectionId}
                                                        onSelect={() => setSelectedSectionId(s.id)}
                                                        onDuplicate={() => duplicateSection(s.id)}
                                                        onRemove={() => removeSection(s.id)}
                                                    />
                                                ))}
                                            </ul>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </Card>

                            {selectedSection && (
                                <SectionEditor
                                    section={selectedSection}
                                    onUpdateData={(patch) => updateSectionData(selectedSection.id, patch)}
                                    onUpdateVariant={(v) => updateSectionVariant(selectedSection.id, v)}
                                    onUpdateStyle={(patch) => updateSectionStyle(selectedSection.id, patch)}
                                />
                            )}
                        </div>

                        {/* Right panel — preview + device toggle */}
                        <Card padded={false}>
                            <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2 text-xs text-fg-muted">
                                <PencilLine size={14} />
                                <span className="font-mono">/t/{tenant.slug}{activePage?.slug !== '/' ? activePage?.slug : ''}</span>
                                <div className="ml-auto inline-flex border border-[var(--color-border)] rounded-md overflow-hidden">
                                    <DeviceToggle
                                        value={device}
                                        onChange={setDevice}
                                    />
                                </div>
                            </div>
                            <div className="bg-surface-2 p-4 overflow-x-auto">
                                <div
                                    className="mx-auto bg-bg border border-[var(--color-border)] rounded-md overflow-hidden transition-[max-width]"
                                    style={{ maxWidth: DEVICE_WIDTH[device] }}>
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
                            </div>
                        </Card>
                    </div>
                </>
            )}

            <TemplatePicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onPick={insertTemplate}
            />
        </>
    )
}

const DeviceToggle = ({ value, onChange }: { value: DeviceView; onChange: (d: DeviceView) => void }) => {
    const opts: { id: DeviceView; Icon: typeof Monitor; label: string }[] = [
        { id: 'desktop', Icon: Monitor, label: 'Desktop' },
        { id: 'tablet', Icon: Tablet, label: 'Tablet' },
        { id: 'mobile', Icon: Smartphone, label: 'Mobile' }
    ]
    return (
        <>
            {opts.map((o) => (
                <button
                    key={o.id}
                    type="button"
                    onClick={() => onChange(o.id)}
                    aria-label={o.label}
                    title={o.label}
                    className={cn(
                        'px-2.5 py-1.5 text-fg-muted hover:bg-surface-hover transition-colors',
                        value === o.id && 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)]'
                    )}>
                    <o.Icon size={14} />
                </button>
            ))}
        </>
    )
}

// ---- Pages bar with add/duplicate/delete + per-page SEO ---------------------

const PagesBar = ({
    pages,
    activePageId,
    onSelect,
    onAdd,
    onDuplicate,
    onDelete,
    onSetHome,
    onUpdateMeta
}: {
    pages: LandingPage[]
    activePageId: string
    onSelect: (id: string) => void
    onAdd: (name: string, slug: string) => void
    onDuplicate: (id: string) => void
    onDelete: (id: string) => void
    onSetHome: (id: string) => void
    onUpdateMeta: (id: string, patch: Partial<LandingPage>) => void
}) => {
    const [newOpen, setNewOpen] = useState(false)
    const [seoFor, setSeoFor] = useState<LandingPage | null>(null)
    return (
        <Card
            className="mb-4"
            padded={false}>
            <div className="flex items-center gap-2 p-3 overflow-x-auto">
                {pages.map((p) => (
                    <PageTab
                        key={p.id}
                        page={p}
                        active={p.id === activePageId}
                        onSelect={() => onSelect(p.id)}
                        onSetHome={() => onSetHome(p.id)}
                        onDuplicate={() => onDuplicate(p.id)}
                        onDelete={() => onDelete(p.id)}
                        onSeo={() => setSeoFor(p)}
                    />
                ))}
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={12} />}
                    onClick={() => setNewOpen(true)}>
                    New page
                </Button>
            </div>

            <NewPageModal
                open={newOpen}
                onClose={() => setNewOpen(false)}
                onCreate={(name, slug) => {
                    onAdd(name, slug)
                    setNewOpen(false)
                }}
            />

            <PageSeoModal
                page={seoFor}
                onClose={() => setSeoFor(null)}
                onSave={(patch) => {
                    if (seoFor) onUpdateMeta(seoFor.id, patch)
                    setSeoFor(null)
                }}
            />
        </Card>
    )
}

const PageTab = ({
    page,
    active,
    onSelect,
    onSetHome,
    onDuplicate,
    onDelete,
    onSeo
}: {
    page: LandingPage
    active: boolean
    onSelect: () => void
    onSetHome: () => void
    onDuplicate: () => void
    onDelete: () => void
    onSeo: () => void
}) => (
    <div
        className={cn(
            'group flex items-center gap-1 rounded-md border pl-3 pr-1 py-1 shrink-0',
            active ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-500)]' : 'bg-surface-2 border-[var(--color-border)]'
        )}>
        <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center gap-2 text-sm">
            {page.isHome ? <Home size={12} /> : <File size={12} />}
            <span className="text-fg font-medium">{page.name}</span>
            <span className="text-[11px] text-fg-muted font-mono">{page.slug}</span>
        </button>
        <div className="flex items-center pl-1 border-l border-[var(--color-border)]">
            {!page.isHome && (
                <button
                    type="button"
                    title="Set as home"
                    onClick={onSetHome}
                    className="p-1 text-fg-muted hover:text-fg">
                    <Home size={11} />
                </button>
            )}
            <button
                type="button"
                title="SEO"
                onClick={onSeo}
                className="p-1 text-fg-muted hover:text-fg">
                <Sparkles size={11} />
            </button>
            <button
                type="button"
                title="Duplicate"
                onClick={onDuplicate}
                className="p-1 text-fg-muted hover:text-fg">
                <CopyIcon size={11} />
            </button>
            <button
                type="button"
                title="Delete"
                onClick={onDelete}
                className="p-1 text-fg-muted hover:text-[var(--color-danger)]">
                <Trash2 size={11} />
            </button>
        </div>
    </div>
)

const NewPageModal = ({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, slug: string) => void }) => {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New page"
            description="Pages can be linked to from the navbar or any block CTA."
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!name || !slug}
                        onClick={() => onCreate(name.trim(), slug.trim())}>
                        Create
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Input
                    label="Page name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="About"
                />
                <Input
                    label="URL path"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="/about"
                    hint="Use a leading slash. Nested paths like /blog/post are supported."
                />
            </div>
        </Modal>
    )
}

const PageSeoModal = ({ page, onClose, onSave }: { page: LandingPage | null; onClose: () => void; onSave: (patch: Partial<LandingPage>) => void }) => {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [og, setOg] = useState('')

    useEffect(() => {
        if (!page) return
        setName(page.name)
        setSlug(page.slug)
        setTitle(page.seo?.title ?? '')
        setDescription(page.seo?.description ?? '')
        setOg(page.seo?.ogImageUrl ?? '')
    }, [page])

    if (!page) return null
    return (
        <Modal
            open={!!page}
            onClose={onClose}
            title="Page settings"
            description={page.slug}
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            onSave({
                                name,
                                slug: slug.startsWith('/') ? slug.toLowerCase() : `/${slug.toLowerCase()}`,
                                seo: { title, description, ogImageUrl: og }
                            })
                        }>
                        Save
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        label="Slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                    />
                </div>
                <Input
                    label="Meta title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    hint={`${title.length} / 60 recommended`}
                />
                <Textarea
                    label="Meta description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    hint={`${description.length} / 160 recommended`}
                />
                <Input
                    label="OG image URL"
                    value={og}
                    onChange={(e) => setOg(e.target.value)}
                    placeholder="https://cdn…/og.png (1200×630)"
                />
            </div>
        </Modal>
    )
}

// ---- Sortable section row (drag handle + select + actions) ------------------

const SortableSectionItem = ({
    section,
    active,
    onSelect,
    onDuplicate,
    onRemove
}: {
    section: LandingSection
    active: boolean
    onSelect: () => void
    onDuplicate: () => void
    onRemove: () => void
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
    const Icon = SECTION_ICON[section.type]
    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(
                'p-3 flex items-center gap-2 transition-colors',
                isDragging && 'opacity-50 bg-surface-2',
                active && !isDragging ? 'bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover'
            )}>
            <button
                type="button"
                aria-label="Drag to reorder"
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-fg-muted hover:text-fg">
                <GripVertical size={14} />
            </button>
            <button
                type="button"
                onClick={onSelect}
                className="flex-1 flex items-center gap-2 text-left min-w-0">
                <span
                    className={cn(
                        'h-7 w-7 rounded-md grid place-items-center shrink-0',
                        active ? 'bg-[var(--color-brand-500)] text-white' : 'bg-surface-2 text-fg-soft'
                    )}>
                    <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-fg block truncate">
                        {SECTION_LABEL[section.type]} · {section.variant}
                    </span>
                    <span className="text-[11px] text-fg-muted truncate">{getSectionPreviewText(section)}</span>
                </span>
            </button>
            <div className="flex shrink-0">
                <button
                    type="button"
                    aria-label="Duplicate"
                    title="Duplicate"
                    onClick={onDuplicate}
                    className="p-1 text-fg-muted hover:text-fg">
                    <CopyIcon size={14} />
                </button>
                <button
                    type="button"
                    aria-label="Remove"
                    title="Remove"
                    onClick={() => {
                        if (window.confirm('Remove this section?')) onRemove()
                    }}
                    className="p-1 text-fg-muted hover:text-[var(--color-danger)]">
                    <Trash2 size={14} />
                </button>
            </div>
        </li>
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
        case 'image':
            return s.data.alt || s.data.caption || 'Image'
        case 'embed':
            return s.data.title || 'HTML embed'
        case 'collectionList':
            return s.data.title || (s.data.collectionSlug ? `/${s.data.collectionSlug}` : 'Collection')
        case 'callout':
            return s.data.title || 'Callout'
    }
}

// ---- Per-section editor: variant + content + style overrides ----------------

const SectionEditor = ({
    section,
    onUpdateData,
    onUpdateVariant,
    onUpdateStyle
}: {
    section: LandingSection
    onUpdateData: (patch: Partial<LandingSection['data']>) => void
    onUpdateVariant: (v: string) => void
    onUpdateStyle: (patch: Partial<SectionStyle>) => void
}) => {
    const [tab, setTab] = useState<'content' | 'design'>('content')
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

            <div className="flex border-b border-[var(--color-border)] mb-3 -mx-5 px-5">
                {(['content', 'design'] as const).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={cn(
                            'px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                            tab === t
                                ? 'border-[var(--color-brand-500)] text-[var(--color-brand-600)]'
                                : 'border-transparent text-fg-muted hover:text-fg'
                        )}>
                        {t === 'content' ? 'Content' : 'Design'}
                    </button>
                ))}
            </div>

            {tab === 'content' && (
                <>
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
                    {section.type === 'image' && (
                        <ImageFields
                            data={section.data}
                            onChange={onUpdateData}
                        />
                    )}
                    {section.type === 'embed' && (
                        <EmbedFields
                            data={section.data}
                            onChange={onUpdateData}
                        />
                    )}
                    {section.type === 'collectionList' && (
                        <CollectionListFields
                            data={section.data}
                            onChange={onUpdateData}
                        />
                    )}
                </>
            )}

            {tab === 'design' && (
                <DesignFields
                    style={section.style}
                    onChange={onUpdateStyle}
                />
            )}
        </Card>
    )
}

const VARIANTS_BY_TYPE: Record<LandingSection['type'], string[]> = {
    hero: ['split', 'centered', 'gradient'],
    features: ['three-up', 'four-up', 'list'],
    cta: ['banner', 'card'],
    callout: ['info', 'success'],
    image: ['contained', 'full'],
    embed: ['iframe'],
    collectionList: ['cards', 'list']
}

// ---- Design tab: per-section style overrides --------------------------------

const DesignFields = ({ style, onChange }: { style: SectionStyle | undefined; onChange: (p: Partial<SectionStyle>) => void }) => (
    <div className="space-y-4">
        <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-fg-soft mb-1.5">
                <Palette size={12} /> Background
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={style?.background ?? '#ffffff'}
                    onChange={(e) => onChange({ background: e.target.value })}
                    className="w-10 h-10 rounded-md border cursor-pointer bg-transparent p-1"
                    aria-label="Background colour"
                />
                <Input
                    value={style?.background ?? ''}
                    onChange={(e) => onChange({ background: e.target.value || undefined })}
                    placeholder="#ffffff or linear-gradient(...)"
                    className="font-mono"
                />
                {style?.background && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onChange({ background: undefined })}>
                        Clear
                    </Button>
                )}
            </div>
        </div>

        <div>
            <label className="block text-xs font-medium text-fg-soft mb-1.5">Text colour</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={style?.textColor ?? '#0c1626'}
                    onChange={(e) => onChange({ textColor: e.target.value })}
                    className="w-10 h-10 rounded-md border cursor-pointer bg-transparent p-1"
                    aria-label="Text colour"
                />
                <Input
                    value={style?.textColor ?? ''}
                    onChange={(e) => onChange({ textColor: e.target.value || undefined })}
                    placeholder="#0c1626"
                    className="font-mono"
                />
                {style?.textColor && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onChange({ textColor: undefined })}>
                        Clear
                    </Button>
                )}
            </div>
        </div>

        <Select
            label="Vertical padding"
            value={style?.paddingY ?? ''}
            onChange={(e) => onChange({ paddingY: (e.target.value || undefined) as SectionStyle['paddingY'] })}>
            <option value="">Default</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra large</option>
        </Select>

        <div className="grid grid-cols-2 gap-3">
            <Select
                label="Alignment"
                value={style?.align ?? ''}
                onChange={(e) => onChange({ align: (e.target.value || undefined) as SectionStyle['align'] })}>
                <option value="">Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
            </Select>
            <Select
                label="Max width"
                value={style?.maxWidth ?? ''}
                onChange={(e) => onChange({ maxWidth: (e.target.value || undefined) as SectionStyle['maxWidth'] })}>
                <option value="">Default</option>
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
                <option value="full">Full bleed</option>
            </Select>
        </div>

        <TypographyEditor
            label="Headings"
            value={style?.headingType}
            onChange={(t) => onChange({ headingType: t })}
        />
        <TypographyEditor
            label="Body text"
            value={style?.bodyType}
            onChange={(t) => onChange({ bodyType: t })}
        />

        <div className="rounded-md border border-[var(--color-border)] p-3">
            <label className="text-xs font-semibold text-fg flex items-center gap-1.5 mb-3">
                <Sparkles size={12} /> Scroll-in animation
            </label>
            <div className="grid grid-cols-3 gap-3">
                <Select
                    label="Effect"
                    value={style?.animation ?? 'none'}
                    onChange={(e) => onChange({ animation: (e.target.value || undefined) as SectionStyle['animation'] })}>
                    <option value="none">None</option>
                    <option value="fadeIn">Fade in</option>
                    <option value="fadeUp">Fade up</option>
                    <option value="fadeDown">Fade down</option>
                    <option value="slideLeft">Slide from right</option>
                    <option value="slideRight">Slide from left</option>
                    <option value="zoomIn">Zoom in</option>
                </Select>
                <Input
                    label="Delay (ms)"
                    type="number"
                    min={0}
                    step={50}
                    value={style?.animationDelay?.toString() ?? ''}
                    onChange={(e) => onChange({ animationDelay: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                    label="Duration (ms)"
                    type="number"
                    min={100}
                    step={50}
                    value={style?.animationDuration?.toString() ?? ''}
                    onChange={(e) => onChange({ animationDuration: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="700"
                />
            </div>
            <p className="text-[11px] text-fg-muted mt-2">
                Triggers on first viewport entry. Skipped automatically for users with reduced-motion preference.
            </p>
        </div>
    </div>
)

// Typography editor block — shared by headings + body. Five tokens (family,
// size, weight, line-height, letter-spacing); each maps to a curated CSS
// value in the renderer, so users get sensible output without typing CSS.
const TypographyEditor = ({
    label,
    value,
    onChange
}: {
    label: string
    value: import('../services/tenant.service').Typography | undefined
    onChange: (t: import('../services/tenant.service').Typography | undefined) => void
}) => {
    const set = (patch: Partial<import('../services/tenant.service').Typography>) => {
        const next = { ...(value ?? {}), ...patch }
        // If every key is empty, clear the whole block to keep the saved JSON tidy.
        const empty = Object.values(next).every((v) => !v)
        onChange(empty ? undefined : next)
    }
    return (
        <div className="rounded-md border border-[var(--color-border)] p-3">
            <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-fg flex items-center gap-1.5">
                    <Type size={12} /> {label}
                </label>
                {value && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onChange(undefined)}>
                        Reset
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Select
                    label="Font family"
                    value={value?.fontFamily ?? ''}
                    onChange={(e) => set({ fontFamily: (e.target.value || undefined) as import('../services/tenant.service').FontFamilyToken })}>
                    <option value="">Default</option>
                    <option value="sans">Sans-serif (system)</option>
                    <option value="inter">Inter</option>
                    <option value="display">Display (Plus Jakarta)</option>
                    <option value="serif">Serif (Georgia)</option>
                    <option value="mono">Monospace</option>
                </Select>
                <Select
                    label="Size"
                    value={value?.fontSize ?? ''}
                    onChange={(e) => set({ fontSize: (e.target.value || undefined) as import('../services/tenant.service').FontSizeToken })}>
                    <option value="">Default</option>
                    <option value="xs">XS · 12</option>
                    <option value="sm">SM · 14</option>
                    <option value="base">Base · 16</option>
                    <option value="lg">LG · 18</option>
                    <option value="xl">XL · 20</option>
                    <option value="2xl">2XL · 24</option>
                    <option value="3xl">3XL · 30</option>
                    <option value="4xl">4XL · 40</option>
                    <option value="5xl">5XL · 56</option>
                </Select>
                <Select
                    label="Weight"
                    value={value?.fontWeight ?? ''}
                    onChange={(e) => set({ fontWeight: (e.target.value || undefined) as import('../services/tenant.service').FontWeightToken })}>
                    <option value="">Default</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                    <option value="extrabold">Extrabold</option>
                </Select>
                <Select
                    label="Line height"
                    value={value?.lineHeight ?? ''}
                    onChange={(e) =>
                        set({
                            lineHeight: (e.target.value || undefined) as import('../services/tenant.service').Typography['lineHeight']
                        })
                    }>
                    <option value="">Default</option>
                    <option value="tight">Tight</option>
                    <option value="snug">Snug</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                    <option value="loose">Loose</option>
                </Select>
                <Select
                    label="Letter spacing"
                    value={value?.letterSpacing ?? ''}
                    onChange={(e) =>
                        set({
                            letterSpacing: (e.target.value || undefined) as import('../services/tenant.service').Typography['letterSpacing']
                        })
                    }>
                    <option value="">Default</option>
                    <option value="tighter">Tighter</option>
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                    <option value="wider">Wider</option>
                </Select>
            </div>
        </div>
    )
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

const ImageFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'image' }>['data']
    onChange: (p: object) => void
}) => {
    const [pickerOpen, setPickerOpen] = useState(false)
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-fg-soft mb-1.5">Image source</label>
                <div className="flex items-center gap-2">
                    <Input
                        value={data.src ?? ''}
                        onChange={(e) => onChange({ src: e.target.value })}
                        placeholder="https:// …"
                        className="flex-1"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<ImageIcon size={12} />}
                        onClick={() => setPickerOpen(true)}>
                        Library
                    </Button>
                </div>
                {data.src && (
                    <div className="mt-2 rounded-md border overflow-hidden">
                        <img
                            src={data.src}
                            alt={data.alt ?? ''}
                            className="w-full h-32 object-cover"
                        />
                    </div>
                )}
            </div>
            <Input
                label="Alt text (a11y)"
                value={data.alt ?? ''}
                onChange={(e) => onChange({ alt: e.target.value })}
                placeholder="Describe the image"
            />
            <Input
                label="Caption (optional)"
                value={data.caption ?? ''}
                onChange={(e) => onChange({ caption: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={!!data.rounded}
                    onChange={(e) => onChange({ rounded: e.target.checked })}
                    className="accent-[var(--color-brand-500)]"
                />
                Rounded corners
            </label>

            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onPick={(url) => {
                    onChange({ src: url })
                    setPickerOpen(false)
                }}
            />
        </div>
    )
}

const EmbedFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'embed' }>['data']
    onChange: (p: object) => void
}) => (
    <div className="space-y-3">
        <Input
            label="Title (a11y label)"
            value={data.title ?? ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Demo video"
        />
        <Textarea
            label="HTML / iframe markup"
            rows={6}
            value={data.html ?? ''}
            onChange={(e) => onChange({ html: e.target.value })}
            placeholder='<iframe src="..." width="100%" height="480"></iframe>'
            hint="Rendered inside a sandboxed iframe — scripts are isolated from the parent page."
        />
        <Input
            label="Iframe height (px)"
            type="number"
            min={120}
            max={2000}
            value={data.height?.toString() ?? '480'}
            onChange={(e) => onChange({ height: Number(e.target.value) || 480 })}
        />
        <div className="rounded-md border bg-surface-2 p-3 text-[11px] text-fg-muted inline-flex items-start gap-2">
            <Type size={12} className="mt-0.5 shrink-0" />
            <span>
                Sandbox flags: <code>allow-scripts allow-same-origin allow-forms allow-presentation</code>. Top-navigation + popups are blocked, so a malicious embed can't redirect this page.
            </span>
        </div>
    </div>
)

const CollectionListFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'collectionList' }>['data']
    onChange: (p: object) => void
}) => {
    // Pull the SA's collections so they can pick by name instead of typing the slug.
    const collectionsQuery = useQuery({
        queryKey: ['cms', 'collections'],
        queryFn: () => import('../services/cms.service').then((m) => m.listCollections()),
        staleTime: 60_000
    })
    const collections = collectionsQuery.data ?? []
    const selected = collections.find((c) => c.slug === data.collectionSlug)
    const fieldKeys = (selected?.fields ?? []).map((f) => ({ key: f.key, label: f.label, type: f.type }))

    return (
        <div className="space-y-3">
            <Select
                label="Collection"
                value={data.collectionSlug ?? ''}
                onChange={(e) => onChange({ collectionSlug: e.target.value || undefined })}>
                <option value="">— pick one —</option>
                {collections.map((c) => (
                    <option
                        key={c.id}
                        value={c.slug}>
                        {c.name} (/{c.slug})
                    </option>
                ))}
            </Select>
            <Input
                label="Section title (optional)"
                value={data.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Latest posts"
            />
            <div className="grid sm:grid-cols-3 gap-3">
                <Select
                    label="Title field"
                    value={data.titleField ?? ''}
                    onChange={(e) => onChange({ titleField: e.target.value || undefined })}
                    disabled={!selected}>
                    <option value="">—</option>
                    {fieldKeys
                        .filter((f) => f.type === 'text' || f.type === 'longtext')
                        .map((f) => (
                            <option
                                key={f.key}
                                value={f.key}>
                                {f.label}
                            </option>
                        ))}
                </Select>
                <Select
                    label="Summary field"
                    value={data.summaryField ?? ''}
                    onChange={(e) => onChange({ summaryField: e.target.value || undefined })}
                    disabled={!selected}>
                    <option value="">—</option>
                    {fieldKeys
                        .filter((f) => f.type === 'text' || f.type === 'longtext' || f.type === 'richtext')
                        .map((f) => (
                            <option
                                key={f.key}
                                value={f.key}>
                                {f.label}
                            </option>
                        ))}
                </Select>
                <Select
                    label="Image field"
                    value={data.imageField ?? ''}
                    onChange={(e) => onChange({ imageField: e.target.value || undefined })}
                    disabled={!selected}>
                    <option value="">—</option>
                    {fieldKeys
                        .filter((f) => f.type === 'image' || f.type === 'text')
                        .map((f) => (
                            <option
                                key={f.key}
                                value={f.key}>
                                {f.label}
                            </option>
                        ))}
                </Select>
            </div>
            <Input
                label="Limit"
                type="number"
                min={1}
                max={48}
                value={data.limit?.toString() ?? '6'}
                onChange={(e) => onChange({ limit: Number(e.target.value) || 6 })}
            />
            {!selected && (
                <p className="text-[11px] text-fg-muted">
                    Need a new content type? Open the <strong>CMS</strong> page to create one.
                </p>
            )}
        </div>
    )
}

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
            description="Add a pre-built section to the page. You can edit copy and design after inserting."
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
