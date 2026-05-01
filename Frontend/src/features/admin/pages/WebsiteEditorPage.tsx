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
    Database,
    Settings,
    ChevronUp,
    ChevronDown,
    Link2,
    MessageSquare,
    BarChart3,
    ClipboardList,
    Building2
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
    defaultFooter,
    defaultLandingSections,
    defaultNavbar,
    defaultStyleClasses,
    getTenantDetail,
    instantiateTemplate,
    listAllTenants,
    newLinkId,
    newPageId,
    newSectionId,
    PAGE_TEMPLATES,
    instantiatePageTemplate,
    readLandingContent,
    updateTenantById,
    type FooterColumn,
    type FooterConfig,
    type LandingContent,
    type LandingPage,
    type LandingPillar,
    type LandingSection,
    type LandingTemplate,
    type PageTemplate,
    type NavLink,
    type NavbarConfig,
    type SectionStyle,
    type SiteIdentity,
    type StyleClass,
    type TenantSettings,
    type TestimonialItem,
    type StatItem,
    type LogoItem
} from '../services/tenant.service'
import { LandingSectionRenderer } from '@features/marketing/components/LandingSection'
import { MediaPickerModal } from '../components/MediaPickerModal'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'

const SECTION_ICON: Record<LandingSection['type'], typeof Sparkles> = {
    hero: Sparkles,
    features: LayoutGrid,
    cta: Megaphone,
    callout: InfoIcon,
    image: ImageIcon,
    embed: Code,
    collectionList: Database,
    testimonials: MessageSquare,
    stats: BarChart3,
    leadForm: ClipboardList,
    logos: Building2
}

const SECTION_LABEL: Record<LandingSection['type'], string> = {
    hero: 'Hero',
    features: 'Features',
    cta: 'CTA',
    callout: 'Callout',
    image: 'Image',
    embed: 'Embed',
    collectionList: 'Collection',
    testimonials: 'Testimonials',
    stats: 'Stats',
    leadForm: 'Lead form',
    logos: 'Logos'
}

type DeviceView = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTH: Record<DeviceView, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px'
}

export const WebsiteEditorPage = () => {
    const queryClient = useQueryClient()
    const confirm = useConfirm()
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

    // Raw landing JSON — `readLandingContent` strips it down to renderer
    // fields with defaults applied; the editor needs the source-of-truth
    // pages/site/navbar/footer blobs as actually persisted.
    const rawLanding = useMemo<LandingContent>(
        () => (tenant?.settings?.landing as LandingContent | undefined) ?? {},
        [tenant?.settings]
    )

    // Multi-page state. If the tenant has historical `sections` but no
    // `pages`, lift the sections into a default 'Home' page so the editor
    // can present a unified pages list.
    const initialPages = useMemo<LandingPage[]>(() => {
        if (rawLanding.pages && rawLanding.pages.length > 0) return rawLanding.pages
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
    }, [rawLanding.pages, initialContent.sections, tenant])

    const initialSite = useMemo<SiteIdentity>(() => rawLanding.site ?? {}, [rawLanding.site])
    const initialNavbar = useMemo<NavbarConfig>(() => rawLanding.navbar ?? defaultNavbar(), [rawLanding.navbar])
    const initialFooter = useMemo<FooterConfig>(
        () => rawLanding.footer ?? defaultFooter(tenant?.name ?? ''),
        [rawLanding.footer, tenant?.name]
    )
    const initialStyleClasses = useMemo<StyleClass[]>(
        () => rawLanding.styleClasses ?? defaultStyleClasses(),
        [rawLanding.styleClasses]
    )

    const [pages, setPages] = useState<LandingPage[]>(initialPages)
    const [site, setSite] = useState<SiteIdentity>(initialSite)
    const [navbar, setNavbar] = useState<NavbarConfig>(initialNavbar)
    const [footer, setFooter] = useState<FooterConfig>(initialFooter)
    const [styleClasses, setStyleClasses] = useState<StyleClass[]>(initialStyleClasses)
    const [activePageId, setActivePageId] = useState<string>('')
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [siteOpen, setSiteOpen] = useState(false)
    const [device, setDevice] = useState<DeviceView>('desktop')

    // Reset draft state when tenant changes.
    useEffect(() => {
        setPages(initialPages)
        setSite(initialSite)
        setNavbar(initialNavbar)
        setFooter(initialFooter)
        setStyleClasses(initialStyleClasses)
        const home = initialPages.find((p) => p.isHome) ?? initialPages[0]
        setActivePageId(home?.id ?? '')
        setSelectedSectionId(home?.sections[0]?.id ?? null)
    }, [initialPages, initialSite, initialNavbar, initialFooter, initialStyleClasses])

    const activePage = pages.find((p) => p.id === activePageId) ?? pages[0]
    const sections = activePage?.sections ?? []
    const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null

    const dirty = useMemo(
        () =>
            JSON.stringify(pages) !== JSON.stringify(initialPages) ||
            JSON.stringify(site) !== JSON.stringify(initialSite) ||
            JSON.stringify(navbar) !== JSON.stringify(initialNavbar) ||
            JSON.stringify(footer) !== JSON.stringify(initialFooter) ||
            JSON.stringify(styleClasses) !== JSON.stringify(initialStyleClasses),
        [
            pages,
            initialPages,
            site,
            initialSite,
            navbar,
            initialNavbar,
            footer,
            initialFooter,
            styleClasses,
            initialStyleClasses
        ]
    )

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
                    sections: home?.sections ?? [],
                    site,
                    navbar,
                    footer,
                    styleClasses
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
    // Add a new page. If `template` is provided we instantiate it (with fresh
    // ids on every section); otherwise we drop in an empty page using the
    // existing createBlankPage helper. Either way the new page is appended to
    // the page list and made active.
    const addPage = (name: string, slug: string, template?: PageTemplate | null) => {
        const page = template && template.id !== 'blank'
            ? instantiatePageTemplate(template, { name, slug })
            : createBlankPage(name, slug, false)
        setPages([...pages, page])
        setActivePageId(page.id)
        setSelectedSectionId(page.sections[0]?.id ?? null)
    }
    // Import a fully-formed page from another tenant. Every section needs a
    // fresh id so it can coexist with whatever's already on the destination —
    // and isHome is dropped so the import never overwrites the home page.
    const importPage = (source: LandingPage, opts?: { slug?: string; name?: string }) => {
        const cloned: LandingPage = {
            ...source,
            id: newPageId(),
            name: opts?.name ?? source.name,
            slug: opts?.slug ?? source.slug,
            isHome: false,
            sections: source.sections.map((s) => ({ ...s, id: newSectionId() }) as LandingSection)
        }
        setPages([...pages, cloned])
        setActivePageId(cloned.id)
        setSelectedSectionId(null)
    }
    const deletePage = async (id: string) => {
        const target = pages.find((p) => p.id === id)
        if (!target) return
        if (target.isHome) {
            toast.error('Set another page as home first.')
            return
        }
        const ok = await confirm({
            title: `Delete the "${target.name}" page?`,
            description:
                'You can undo by hitting Cancel before clicking Save changes — the deletion is staged locally until you save.',
            confirmLabel: 'Delete',
            tone: 'danger'
        })
        if (!ok) return
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
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Settings size={14} />}
                            disabled={!tenant}
                            onClick={() => setSiteOpen(true)}>
                            Site settings
                        </Button>
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

            {/* Tenant context selector — own row so the page-header actions
                don't have to share horizontal space with a wide select. */}
            <Card
                className="mb-4"
                padded={false}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3">
                    <div className="text-xs font-semibold text-fg-soft uppercase tracking-wide shrink-0 sm:w-32">
                        Editing tenant
                    </div>
                    <div className="flex-1 min-w-0">
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
                    {tenant && (
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-fg-muted font-mono hover:text-[var(--color-brand-600)] hover:underline shrink-0">
                            /t/{tenant.slug}
                        </a>
                    )}
                </div>
            </Card>

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
                        currentTenantId={tenant.id}
                        onSelect={(id) => {
                            setActivePageId(id)
                            const p = pages.find((x) => x.id === id)
                            setSelectedSectionId(p?.sections[0]?.id ?? null)
                        }}
                        onAdd={(name, slug, template) => addPage(name, slug, template)}
                        onImport={importPage}
                        onDuplicate={duplicatePage}
                        onDelete={deletePage}
                        onSetHome={setHome}
                        onUpdateMeta={updatePageMeta}
                    />

                    {/* min-w-0 on both grid items keeps the 1fr/420px tracks
                        from being pushed wider by their content (the preview's
                        max-w-6xl hero, or long section labels in the sidebar). */}
                    <div className="grid lg:grid-cols-[420px_minmax(0,1fr)] gap-4 items-start">
                        {/* Left panel — section list + selected section editor */}
                        <div className="space-y-4 min-w-0">
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
                                    styleClasses={styleClasses}
                                    onUpdateData={(patch) => updateSectionData(selectedSection.id, patch)}
                                    onUpdateVariant={(v) => updateSectionVariant(selectedSection.id, v)}
                                    onUpdateStyle={(patch) => updateSectionStyle(selectedSection.id, patch)}
                                />
                            )}
                        </div>

                        {/* Right panel — preview + device toggle */}
                        <Card
                            padded={false}
                            className="min-w-0 overflow-hidden">
                            <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2 text-xs text-fg-muted">
                                <PencilLine size={14} />
                                <span className="font-mono truncate">/t/{tenant.slug}{activePage?.slug !== '/' ? activePage?.slug : ''}</span>
                                <div className="ml-auto inline-flex border border-[var(--color-border)] rounded-md overflow-hidden shrink-0">
                                    <DeviceToggle
                                        value={device}
                                        onChange={setDevice}
                                    />
                                </div>
                            </div>
                            <div className="bg-surface-2 p-4 overflow-x-auto">
                                <div
                                    className="mx-auto bg-bg border border-[var(--color-border)] rounded-md overflow-hidden transition-[max-width]"
                                    style={{ maxWidth: DEVICE_WIDTH[device], width: '100%' }}>
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
                                                styleClasses={styleClasses}
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

            {tenant && (
                <SiteSettingsModal
                    open={siteOpen}
                    onClose={() => setSiteOpen(false)}
                    pages={pages}
                    site={site}
                    navbar={navbar}
                    footer={footer}
                    styleClasses={styleClasses}
                    tenantSlug={tenant.slug}
                    onChangeSite={setSite}
                    onChangeNavbar={setNavbar}
                    onChangeFooter={setFooter}
                    onChangeStyleClasses={setStyleClasses}
                />
            )}
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
    currentTenantId,
    onSelect,
    onAdd,
    onImport,
    onDuplicate,
    onDelete,
    onSetHome,
    onUpdateMeta
}: {
    pages: LandingPage[]
    activePageId: string
    currentTenantId: string
    onSelect: (id: string) => void
    onAdd: (name: string, slug: string, template: PageTemplate | null) => void
    onImport: (source: LandingPage, opts?: { slug?: string; name?: string }) => void
    onDuplicate: (id: string) => void
    onDelete: (id: string) => void
    onSetHome: (id: string) => void
    onUpdateMeta: (id: string, patch: Partial<LandingPage>) => void
}) => {
    const [newOpen, setNewOpen] = useState(false)
    const [importOpen, setImportOpen] = useState(false)
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
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<CopyIcon size={12} />}
                    onClick={() => setImportOpen(true)}
                    title="Import a page from another tenant">
                    Import
                </Button>
            </div>

            <NewPageModal
                open={newOpen}
                onClose={() => setNewOpen(false)}
                onCreate={(name, slug, template) => {
                    onAdd(name, slug, template)
                    setNewOpen(false)
                }}
            />

            <ImportPageModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                currentTenantId={currentTenantId}
                existingSlugs={pages.map((p) => p.slug)}
                onImport={(page, opts) => {
                    onImport(page, opts)
                    setImportOpen(false)
                    toast.success(`Imported "${opts?.name ?? page.name}"`)
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

// Import a page from another tenant — pulls that tenant's full landing
// content via getTenantDetail (SUPER_ADMIN gated on the backend), shows the
// page list with a section-count summary, and lets the SA tweak the
// destination slug before importing. Section IDs are reissued on the parent
// side so paste-collisions can't happen.
const ImportPageModal = ({
    open,
    onClose,
    currentTenantId,
    existingSlugs,
    onImport
}: {
    open: boolean
    onClose: () => void
    currentTenantId: string
    existingSlugs: string[]
    onImport: (page: LandingPage, opts: { slug: string; name: string }) => void
}) => {
    const tenantsQuery = useQuery({ queryKey: ['tenants'], queryFn: listAllTenants, staleTime: 60_000, enabled: open })
    const allTenants = tenantsQuery.data ?? []
    const sourceTenants = useMemo(() => allTenants.filter((t) => t.id !== currentTenantId), [allTenants, currentTenantId])

    const [sourceTenantId, setSourceTenantId] = useState('')
    useEffect(() => {
        if (open && !sourceTenantId && sourceTenants.length > 0) setSourceTenantId(sourceTenants[0].id)
    }, [open, sourceTenantId, sourceTenants])

    const detailQuery = useQuery({
        queryKey: ['tenants', sourceTenantId, 'detail'],
        queryFn: () => getTenantDetail(sourceTenantId),
        enabled: open && sourceTenantId.length > 0,
        staleTime: 30_000
    })
    const sourceLanding = useMemo(() => readLandingContent(detailQuery.data ?? undefined), [detailQuery.data])
    const sourcePages = sourceLanding.pages ?? []

    const [selectedPageId, setSelectedPageId] = useState('')
    const selected = sourcePages.find((p) => p.id === selectedPageId) ?? null
    useEffect(() => {
        // Reset selection whenever the source tenant changes.
        setSelectedPageId('')
    }, [sourceTenantId])

    const [destName, setDestName] = useState('')
    const [destSlug, setDestSlug] = useState('')
    useEffect(() => {
        if (selected) {
            setDestName(selected.name)
            // Avoid colliding with an existing slug — append a suffix if needed.
            let candidate = selected.slug && selected.slug !== '/' ? selected.slug : `/${selected.name.toLowerCase().replace(/\s+/g, '-')}`
            if (!candidate.startsWith('/')) candidate = `/${candidate}`
            const taken = new Set(existingSlugs)
            if (taken.has(candidate)) {
                let n = 2
                while (taken.has(`${candidate}-${n}`)) n++
                candidate = `${candidate}-${n}`
            }
            setDestSlug(candidate)
        }
    }, [selected, existingSlugs])

    const slugConflict = destSlug && existingSlugs.includes(destSlug)

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Import page from another tenant"
            description="Pick a source tenant, choose a page, tweak the slug, and import. Sections are deep-cloned so the source page is never modified."
            size="lg"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!selected || !destSlug || !destName || !!slugConflict}
                        onClick={() => {
                            if (!selected) return
                            onImport(selected, { slug: destSlug, name: destName })
                        }}>
                        Import page
                    </Button>
                </>
            }>
            <div className="space-y-4">
                <Select
                    label="Source tenant"
                    value={sourceTenantId}
                    onChange={(e) => setSourceTenantId(e.target.value)}>
                    {tenantsQuery.isLoading && <option value="">Loading…</option>}
                    {!tenantsQuery.isLoading && sourceTenants.length === 0 && <option value="">No other tenants available</option>}
                    {sourceTenants.map((t) => (
                        <option
                            key={t.id}
                            value={t.id}>
                            {t.name} (/{t.slug})
                        </option>
                    ))}
                </Select>

                <div>
                    <label className="block text-xs font-medium text-fg-soft mb-1.5">Page to import</label>
                    {detailQuery.isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : sourcePages.length === 0 ? (
                        <div className="text-sm text-fg-muted px-3 py-4 border border-dashed rounded-md text-center">
                            That tenant has no pages to import yet.
                        </div>
                    ) : (
                        <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                            {sourcePages.map((p) => {
                                const sectionCount = p.sections.length
                                const isActive = p.id === selectedPageId
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelectedPageId(p.id)}
                                        className={cn(
                                            'w-full text-left px-3 py-2.5 transition-colors flex items-center justify-between gap-3',
                                            isActive ? 'bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover'
                                        )}>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-fg flex items-center gap-2">
                                                {p.isHome && <Home size={11} />}
                                                {p.name}
                                            </div>
                                            <div className="text-[11px] text-fg-muted font-mono truncate">{p.slug}</div>
                                        </div>
                                        <span className="text-[11px] text-fg-muted shrink-0">
                                            {sectionCount} section{sectionCount === 1 ? '' : 's'}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {selected && (
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Page name (destination)"
                            value={destName}
                            onChange={(e) => setDestName(e.target.value)}
                        />
                        <Input
                            label="Slug (destination)"
                            value={destSlug}
                            onChange={(e) => setDestSlug(e.target.value)}
                            hint={slugConflict ? 'A page with this slug already exists' : undefined}
                        />
                    </div>
                )}
            </div>
        </Modal>
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

const NewPageModal = ({
    open,
    onClose,
    onCreate
}: {
    open: boolean
    onClose: () => void
    onCreate: (name: string, slug: string, template: PageTemplate | null) => void
}) => {
    const [templateId, setTemplateId] = useState<string>('blank')
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [nameTouched, setNameTouched] = useState(false)
    const [slugTouched, setSlugTouched] = useState(false)

    const template = PAGE_TEMPLATES.find((t) => t.id === templateId) ?? PAGE_TEMPLATES[0]

    // Picking a template prefills the name + slug — but only if the user
    // hasn't started typing their own. Editing the template doesn't clobber
    // their input.
    const pickTemplate = (id: string) => {
        setTemplateId(id)
        const t = PAGE_TEMPLATES.find((x) => x.id === id)
        if (!t) return
        if (!nameTouched) setName(t.defaultName)
        if (!slugTouched) setSlug(t.defaultSlug)
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New page"
            description="Pick a template to start with sections pre-filled, or pick Blank for an empty page."
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!name || !slug}
                        onClick={() => {
                            onCreate(name.trim(), slug.trim(), template)
                            setTemplateId('blank')
                            setName('')
                            setSlug('')
                            setNameTouched(false)
                            setSlugTouched(false)
                        }}>
                        Create
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Select
                    label="Start from"
                    value={templateId}
                    onChange={(e) => pickTemplate(e.target.value)}
                    hint={template.description}>
                    {PAGE_TEMPLATES.map((t) => (
                        <option
                            key={t.id}
                            value={t.id}>
                            {t.label}
                        </option>
                    ))}
                </Select>
                <Input
                    label="Page name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        setNameTouched(true)
                    }}
                    placeholder="About"
                />
                <Input
                    label="URL path"
                    value={slug}
                    onChange={(e) => {
                        setSlug(e.target.value)
                        setSlugTouched(true)
                    }}
                    placeholder="/about"
                    hint="Use a leading slash. Nested paths like /blog/post are supported."
                />
                {template.sections.length > 0 && (
                    <div className="rounded-md border border-[var(--color-border)] bg-surface-hover/50 px-3 py-2">
                        <div className="text-[11px] font-medium text-fg-soft mb-1">Sections you'll get</div>
                        <div className="flex flex-wrap gap-1.5">
                            {template.sections.map((s, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] text-fg-soft border border-[var(--color-border)]">
                                    {SECTION_LABEL[s.type]} · {s.variant}
                                </span>
                            ))}
                        </div>
                        <div className="mt-1.5 text-[10px] text-fg-muted">Edit each section after creating.</div>
                    </div>
                )}
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
    const [detailCollection, setDetailCollection] = useState('')

    const collectionsQuery = useQuery({
        queryKey: ['cms', 'collections'],
        queryFn: () => import('../services/cms.service').then((m) => m.listCollections()),
        staleTime: 60_000,
        enabled: !!page
    })
    const collections = collectionsQuery.data ?? []

    useEffect(() => {
        if (!page) return
        setName(page.name)
        setSlug(page.slug)
        setTitle(page.seo?.title ?? '')
        setDescription(page.seo?.description ?? '')
        setOg(page.seo?.ogImageUrl ?? '')
        setDetailCollection(page.detailTemplate?.collectionSlug ?? '')
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
                                seo: { title, description, ogImageUrl: og },
                                detailTemplate: detailCollection ? { collectionSlug: detailCollection } : undefined
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
                <div className="rounded-md border border-[var(--color-border)] p-3 space-y-2 bg-surface-2/40">
                    <div className="text-xs font-semibold text-fg flex items-center gap-1.5">
                        <Database size={12} /> Detail template
                    </div>
                    <Select
                        label="Render items from collection"
                        value={detailCollection}
                        onChange={(e) => setDetailCollection(e.target.value)}
                        hint="Bind this page as the detail template. Items render at /t/<slug>/<collection>/<itemSlug>. Use {{item.fieldKey}} in any text field to substitute values.">
                        <option value="">— not a detail template —</option>
                        {collections.map((c) => (
                            <option
                                key={c.id}
                                value={c.slug}>
                                {c.name} (/{c.slug})
                            </option>
                        ))}
                    </Select>
                    {detailCollection && (
                        <div className="text-[11px] text-fg-muted">
                            Tip: each item in this collection should have a unique <code>slug</code> field — that's what the URL uses.
                        </div>
                    )}
                </div>
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
    const confirm = useConfirm()
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
                    <span className="text-[11px] text-fg-muted block truncate">{getSectionPreviewText(section)}</span>
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
                    onClick={async () => {
                        const ok = await confirm({
                            title: 'Remove this section?',
                            description: 'It is removed from this page only. The change stages locally until you click Save changes.',
                            confirmLabel: 'Remove',
                            tone: 'danger'
                        })
                        if (ok) onRemove()
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
        case 'testimonials':
            return s.data.title || `${s.data.items?.length ?? 0} testimonials`
        case 'stats':
            return s.data.title || `${s.data.items?.length ?? 0} stats`
        case 'leadForm':
            return s.data.title || 'Lead form'
        case 'logos':
            return s.data.title || `${s.data.items?.length ?? 0} logos`
    }
}

// ---- Per-section editor: variant + content + style overrides ----------------

const SectionEditor = ({
    section,
    styleClasses,
    onUpdateData,
    onUpdateVariant,
    onUpdateStyle
}: {
    section: LandingSection
    styleClasses: StyleClass[]
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
                    {section.type === 'testimonials' && (
                        <TestimonialsFields
                            data={section.data}
                            onChange={onUpdateData}
                        />
                    )}
                    {section.type === 'stats' && (
                        <StatsFields
                            data={section.data}
                            onChange={onUpdateData}
                        />
                    )}
                    {section.type === 'leadForm' && (
                        <LeadFormFields
                            data={section.data}
                            onChange={onUpdateData}
                        />
                    )}
                    {section.type === 'logos' && (
                        <LogosFields
                            data={section.data}
                            onChange={onUpdateData}
                        />
                    )}
                </>
            )}

            {tab === 'design' && (
                <DesignFields
                    style={section.style}
                    styleClasses={styleClasses}
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
    collectionList: ['cards', 'list'],
    testimonials: ['cards', 'quotes'],
    stats: ['banner', 'grid'],
    leadForm: ['split', 'inline'],
    logos: ['grid', 'scroll']
}

// ---- Design tab: per-section style overrides --------------------------------

const DesignFields = ({
    style,
    styleClasses,
    onChange
}: {
    style: SectionStyle | undefined
    styleClasses: StyleClass[]
    onChange: (p: Partial<SectionStyle>) => void
}) => (
    <div className="space-y-4">
        <Select
            label="Style class"
            value={style?.styleClassId ?? ''}
            onChange={(e) => onChange({ styleClassId: e.target.value || undefined })}
            hint="Apply a named class. Per-section overrides below win over class defaults.">
            <option value="">— none —</option>
            {styleClasses.map((c) => (
                <option
                    key={c.id}
                    value={c.id}>
                    {c.name}
                </option>
            ))}
        </Select>
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

// ---- Site Settings: identity (favicon + title) + navbar + footer ----------
//
// Edits flow up immediately on every change; persistence happens when the SA
// hits "Save changes" in the page header (same pattern as section edits).

const SiteSettingsModal = ({
    open,
    onClose,
    pages,
    site,
    navbar,
    footer,
    styleClasses,
    tenantSlug,
    onChangeSite,
    onChangeNavbar,
    onChangeFooter,
    onChangeStyleClasses
}: {
    open: boolean
    onClose: () => void
    pages: LandingPage[]
    site: SiteIdentity
    navbar: NavbarConfig
    footer: FooterConfig
    styleClasses: StyleClass[]
    tenantSlug: string
    onChangeSite: (s: SiteIdentity) => void
    onChangeNavbar: (n: NavbarConfig) => void
    onChangeFooter: (f: FooterConfig) => void
    onChangeStyleClasses: (c: StyleClass[]) => void
}) => {
    const [tab, setTab] = useState<'identity' | 'navbar' | 'footer' | 'classes' | 'seo'>('identity')
    const tabs: { id: typeof tab; label: string }[] = [
        { id: 'identity', label: 'Identity' },
        { id: 'navbar', label: 'Navbar' },
        { id: 'footer', label: 'Footer' },
        { id: 'classes', label: 'Style classes' },
        { id: 'seo', label: 'Search engines' }
    ]
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Site settings"
            description="Favicon, page title, and global navbar + footer."
            size="lg"
            footer={
                <Button onClick={onClose}>Done</Button>
            }>
            <div className="flex border-b border-[var(--color-border)] mb-4 -mx-5 px-5">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                            'px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                            tab === t.id
                                ? 'border-[var(--color-brand-500)] text-[var(--color-brand-600)]'
                                : 'border-transparent text-fg-muted hover:text-fg'
                        )}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'identity' && (
                <IdentityFields
                    site={site}
                    onChange={onChangeSite}
                />
            )}
            {tab === 'navbar' && (
                <NavbarFields
                    navbar={navbar}
                    pages={pages}
                    onChange={onChangeNavbar}
                />
            )}
            {tab === 'footer' && (
                <FooterFields
                    footer={footer}
                    pages={pages}
                    onChange={onChangeFooter}
                />
            )}
            {tab === 'classes' && (
                <StyleClassesFields
                    classes={styleClasses}
                    onChange={onChangeStyleClasses}
                />
            )}
            {tab === 'seo' && <SeoFields tenantSlug={tenantSlug} />}
        </Modal>
    )
}

// Auto-generated discoverability artefacts for search engines. The URLs are
// served by the API and pull from landing.pages + published collection items —
// no manual editing here. Tenants copy these into Google Search Console.
const SeoFields = ({ tenantSlug }: { tenantSlug: string }) => {
    const apiBase = (typeof window !== 'undefined' ? window.location.origin : '') + '/api/v1'
    const sitemapUrl = `${apiBase}/sites/${tenantSlug}/sitemap.xml`
    const robotsUrl = `${apiBase}/sites/${tenantSlug}/robots.txt`

    const copy = async (label: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value)
            toast.success(`${label} copied`)
        } catch {
            toast.error('Copy failed — select and copy manually')
        }
    }

    const Row = ({ label, hint, url }: { label: string; hint: string; url: string }) => (
        <div className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-sm font-medium text-fg">{label}</div>
                    <div className="text-xs text-fg-muted mt-0.5">{hint}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<CopyIcon size={12} />}
                        onClick={() => void copy(label, url)}>
                        Copy
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Eye size={12} />}
                        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                        Open
                    </Button>
                </div>
            </div>
            <code className="block text-xs font-mono text-fg-soft break-all bg-surface-hover rounded px-2 py-1.5">{url}</code>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="text-xs text-fg-muted">
                Generated automatically from your pages and published collection items. Submit the sitemap URL to{' '}
                <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[var(--color-brand-600)]">
                    Google Search Console
                </a>{' '}
                to get your tenant site indexed.
            </div>
            <Row
                label="sitemap.xml"
                hint="Lists every published page and collection item so crawlers can find them."
                url={sitemapUrl}
            />
            <Row
                label="robots.txt"
                hint="Tells crawlers what they can index. Honours the per-tenant SEO `robots` directive."
                url={robotsUrl}
            />
            <div className="text-xs text-fg-muted">
                Tip: set a <span className="font-mono">canonicalUrl</span> in the SEO Builder if you've pointed a custom
                domain at your site — the sitemap will switch to absolute URLs on that domain.
            </div>
        </div>
    )
}

// Style class manager. Each class is a small SectionStyle preset (no animation,
// no self-reference). Add / rename / edit / delete; sections reference by id
// from their Design tab.
const StyleClassesFields = ({ classes, onChange }: { classes: StyleClass[]; onChange: (next: StyleClass[]) => void }) => {
    const [editingId, setEditingId] = useState<string | null>(classes[0]?.id ?? null)
    const update = (id: string, patch: Partial<StyleClass>) => onChange(classes.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    const remove = (id: string) => {
        onChange(classes.filter((c) => c.id !== id))
        if (editingId === id) setEditingId(null)
    }
    const add = () => {
        const c: StyleClass = { id: newLinkId(), name: `Class ${classes.length + 1}` }
        onChange([...classes, c])
        setEditingId(c.id)
    }
    const editing = classes.find((c) => c.id === editingId) ?? null

    return (
        <div className="grid grid-cols-[200px_1fr] gap-4 min-h-[400px]">
            <div className="border-r border-[var(--color-border)] pr-3 space-y-1">
                {classes.length === 0 && (
                    <div className="text-xs text-fg-muted text-center py-4">No classes yet.</div>
                )}
                {classes.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditingId(c.id)}
                        className={cn(
                            'w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors',
                            editingId === c.id
                                ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)] font-medium'
                                : 'text-fg-soft hover:bg-surface-hover'
                        )}>
                        {c.name}
                    </button>
                ))}
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={12} />}
                    onClick={add}
                    className="w-full justify-start mt-2">
                    Add class
                </Button>
            </div>
            <div>
                {editing ? (
                    <StyleClassEditor
                        cls={editing}
                        onChange={(patch) => update(editing.id, patch)}
                        onDelete={() => remove(editing.id)}
                    />
                ) : (
                    <div className="text-sm text-fg-muted text-center py-12">
                        Pick a class on the left to edit, or add a new one.
                    </div>
                )}
            </div>
        </div>
    )
}

const StyleClassEditor = ({
    cls,
    onChange,
    onDelete
}: {
    cls: StyleClass
    onChange: (patch: Partial<StyleClass>) => void
    onDelete: () => void
}) => {
    const confirm = useConfirm()
    return (
    <div className="space-y-4">
        <div className="flex items-end gap-2">
            <Input
                label="Class name"
                value={cls.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="flex-1"
            />
            <Button
                size="sm"
                variant="ghost"
                leftIcon={<Trash2 size={14} />}
                onClick={async () => {
                    const ok = await confirm({
                        title: `Delete the "${cls.name}" class?`,
                        description: 'Sections that reference this class will fall back to their default styles. Per-section overrides stay intact.',
                        confirmLabel: 'Delete',
                        tone: 'danger'
                    })
                    if (ok) onDelete()
                }}>
                Delete
            </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs font-medium text-fg-soft mb-1.5">Background</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={cls.background ?? '#ffffff'}
                        onChange={(e) => onChange({ background: e.target.value })}
                        className="w-10 h-10 rounded-md border cursor-pointer bg-transparent p-1"
                        aria-label="Background"
                    />
                    <Input
                        value={cls.background ?? ''}
                        onChange={(e) => onChange({ background: e.target.value || undefined })}
                        placeholder="#ffffff"
                        className="font-mono"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-fg-soft mb-1.5">Text colour</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={cls.textColor ?? '#0c1626'}
                        onChange={(e) => onChange({ textColor: e.target.value })}
                        className="w-10 h-10 rounded-md border cursor-pointer bg-transparent p-1"
                        aria-label="Text colour"
                    />
                    <Input
                        value={cls.textColor ?? ''}
                        onChange={(e) => onChange({ textColor: e.target.value || undefined })}
                        placeholder="#0c1626"
                        className="font-mono"
                    />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
            <Select
                label="Padding"
                value={cls.paddingY ?? ''}
                onChange={(e) => onChange({ paddingY: (e.target.value || undefined) as StyleClass['paddingY'] })}>
                <option value="">Default</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra large</option>
            </Select>
            <Select
                label="Alignment"
                value={cls.align ?? ''}
                onChange={(e) => onChange({ align: (e.target.value || undefined) as StyleClass['align'] })}>
                <option value="">Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
            </Select>
            <Select
                label="Max width"
                value={cls.maxWidth ?? ''}
                onChange={(e) => onChange({ maxWidth: (e.target.value || undefined) as StyleClass['maxWidth'] })}>
                <option value="">Default</option>
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
                <option value="full">Full bleed</option>
            </Select>
        </div>
        <TypographyEditor
            label="Headings"
            value={cls.headingType}
            onChange={(t) => onChange({ headingType: t })}
        />
        <TypographyEditor
            label="Body text"
            value={cls.bodyType}
            onChange={(t) => onChange({ bodyType: t })}
        />
    </div>
    )
}

const IdentityFields = ({ site, onChange }: { site: SiteIdentity; onChange: (s: SiteIdentity) => void }) => {
    const [pickerKind, setPickerKind] = useState<null | 'favicon' | 'og'>(null)
    const set = (patch: Partial<SiteIdentity>) => onChange({ ...site, ...patch })
    return (
        <div className="space-y-4">
            <Input
                label="Page title"
                value={site.title ?? ''}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="e.g. Acme Institute — learn online"
                hint="Shows in the browser tab. Falls back to the home page SEO title if blank."
            />
            <div>
                <label className="block text-xs font-medium text-fg-soft mb-1.5">Favicon URL</label>
                <div className="flex items-center gap-2">
                    <Input
                        value={site.faviconUrl ?? ''}
                        onChange={(e) => set({ faviconUrl: e.target.value })}
                        placeholder="https:// …favicon.png"
                        className="flex-1"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<ImageIcon size={12} />}
                        onClick={() => setPickerKind('favicon')}>
                        Library
                    </Button>
                </div>
                {site.faviconUrl && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-2.5 py-1.5">
                        <img
                            src={site.faviconUrl}
                            alt="favicon preview"
                            className="h-5 w-5 object-contain"
                        />
                        <span className="text-xs text-fg-muted">Preview</span>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-fg-soft mb-1.5">Social share image (Open Graph)</label>
                <div className="flex items-center gap-2">
                    <Input
                        value={site.ogImageUrl ?? ''}
                        onChange={(e) => set({ ogImageUrl: e.target.value })}
                        placeholder="https:// …og-banner.png"
                        className="flex-1"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<ImageIcon size={12} />}
                        onClick={() => setPickerKind('og')}>
                        Library
                    </Button>
                </div>
                <p className="mt-1 text-[11px] text-fg-muted">
                    Shown when your site is linked on WhatsApp, X, LinkedIn, Slack. Recommended 1200×630.
                </p>
                {site.ogImageUrl && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] p-1.5">
                        <img
                            src={site.ogImageUrl}
                            alt="OG preview"
                            className="h-16 w-32 object-cover rounded"
                        />
                        <span className="text-xs text-fg-muted pr-2">Preview</span>
                    </div>
                )}
            </div>

            <MediaPickerModal
                open={pickerKind !== null}
                onClose={() => setPickerKind(null)}
                onPick={(url) => {
                    if (pickerKind === 'favicon') set({ faviconUrl: url })
                    else if (pickerKind === 'og') set({ ogImageUrl: url })
                    setPickerKind(null)
                }}
            />
        </div>
    )
}

const NavbarFields = ({
    navbar,
    pages,
    onChange
}: {
    navbar: NavbarConfig
    pages: LandingPage[]
    onChange: (n: NavbarConfig) => void
}) => {
    const set = (patch: Partial<NavbarConfig>) => onChange({ ...navbar, ...patch })
    return (
        <div className="space-y-4">
            <Select
                label="Layout"
                value={navbar.variant}
                onChange={(e) => set({ variant: e.target.value as NavbarConfig['variant'] })}>
                <option value="simple">Simple — logo left, links right</option>
                <option value="centered">Centered — logo above links</option>
                <option value="with-cta">With CTA — links + brand-coloured CTA button</option>
            </Select>

            <Select
                label="Mobile menu style"
                value={navbar.mobileVariant ?? 'sheet'}
                onChange={(e) => set({ mobileVariant: e.target.value as NavbarConfig['mobileVariant'] })}
                hint="How the hamburger menu opens on phones. Desktop layout is unchanged.">
                <option value="sheet">Sheet — drops down from under the header</option>
                <option value="drawer-right">Drawer — slides in from the right edge</option>
                <option value="fullscreen">Fullscreen — overlay with centred links, big tap targets</option>
            </Select>

            <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={navbar.showLogo !== false}
                        onChange={(e) => set({ showLogo: e.target.checked })}
                        className="accent-[var(--color-brand-500)]"
                    />
                    Show logo
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={navbar.showSignIn !== false}
                        onChange={(e) => set({ showSignIn: e.target.checked })}
                        className="accent-[var(--color-brand-500)]"
                    />
                    Show "Sign in" link
                </label>
            </div>

            {navbar.showSignIn !== false && (
                <Input
                    label="Sign-in label"
                    value={navbar.signInLabel ?? ''}
                    onChange={(e) => set({ signInLabel: e.target.value })}
                    placeholder="Sign in"
                />
            )}

            {navbar.variant === 'with-cta' && (
                <div className="rounded-md border border-[var(--color-border)] p-3 space-y-3">
                    <div className="text-xs font-semibold text-fg">Call-to-action button</div>
                    <Input
                        label="Button label"
                        value={navbar.ctaLabel ?? ''}
                        onChange={(e) => set({ ctaLabel: e.target.value })}
                        placeholder="Apply now"
                    />
                    <LinkTargetPicker
                        pageId={navbar.ctaPageId}
                        url={navbar.ctaUrl}
                        pages={pages}
                        onChange={(t) => set({ ctaPageId: t.pageId, ctaUrl: t.url })}
                    />
                </div>
            )}

            <div>
                <div className="text-xs font-semibold text-fg mb-2">Links</div>
                <LinkListEditor
                    links={navbar.links}
                    pages={pages}
                    onChange={(links) => set({ links })}
                />
            </div>
        </div>
    )
}

const FooterFields = ({
    footer,
    pages,
    onChange
}: {
    footer: FooterConfig
    pages: LandingPage[]
    onChange: (f: FooterConfig) => void
}) => {
    const set = (patch: Partial<FooterConfig>) => onChange({ ...footer, ...patch })
    const setSocial = (patch: Partial<NonNullable<FooterConfig['social']>>) =>
        onChange({ ...footer, social: { ...(footer.social ?? {}), ...patch } })
    return (
        <div className="space-y-4">
            <Select
                label="Layout"
                value={footer.variant}
                onChange={(e) => set({ variant: e.target.value as FooterConfig['variant'] })}>
                <option value="simple">Simple — tagline + single link row</option>
                <option value="columns">Columns — multi-column with grouped links</option>
                <option value="minimal">Minimal — one-line copyright</option>
            </Select>

            <Input
                label="Tagline"
                value={footer.tagline ?? ''}
                onChange={(e) => set({ tagline: e.target.value })}
                placeholder="Mentor-led learning, designed for outcomes."
            />
            <Input
                label="Copyright"
                value={footer.copyright ?? ''}
                onChange={(e) => set({ copyright: e.target.value })}
                placeholder={`© ${new Date().getFullYear()} Your brand. All rights reserved.`}
            />

            <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none mb-2">
                    <input
                        type="checkbox"
                        checked={footer.showSocial !== false}
                        onChange={(e) => set({ showSocial: e.target.checked })}
                        className="accent-[var(--color-brand-500)]"
                    />
                    Show social icons
                </label>
                {footer.showSocial !== false && (
                    <div className="grid grid-cols-2 gap-2 rounded-md border border-[var(--color-border)] p-3">
                        <Input
                            label="GitHub"
                            value={footer.social?.github ?? ''}
                            onChange={(e) => setSocial({ github: e.target.value })}
                            placeholder="https://github.com/…"
                        />
                        <Input
                            label="Twitter / X"
                            value={footer.social?.twitter ?? ''}
                            onChange={(e) => setSocial({ twitter: e.target.value })}
                            placeholder="https://twitter.com/…"
                        />
                        <Input
                            label="LinkedIn"
                            value={footer.social?.linkedin ?? ''}
                            onChange={(e) => setSocial({ linkedin: e.target.value })}
                            placeholder="https://linkedin.com/in/…"
                        />
                        <Input
                            label="Instagram"
                            value={footer.social?.instagram ?? ''}
                            onChange={(e) => setSocial({ instagram: e.target.value })}
                            placeholder="https://instagram.com/…"
                        />
                        <Input
                            label="YouTube"
                            value={footer.social?.youtube ?? ''}
                            onChange={(e) => setSocial({ youtube: e.target.value })}
                            placeholder="https://youtube.com/@…"
                        />
                    </div>
                )}
            </div>

            {footer.variant === 'columns' ? (
                <div>
                    <div className="text-xs font-semibold text-fg mb-2">Columns</div>
                    <FooterColumnsEditor
                        columns={footer.columns ?? []}
                        pages={pages}
                        onChange={(columns) => set({ columns })}
                    />
                </div>
            ) : (
                <div>
                    <div className="text-xs font-semibold text-fg mb-2">Links</div>
                    <LinkListEditor
                        links={footer.links ?? []}
                        pages={pages}
                        onChange={(links) => set({ links })}
                    />
                </div>
            )}
        </div>
    )
}

// Reusable list editor for navbar / footer / column links. Each row has a
// label + target picker (page or external URL) + new-tab toggle + reorder
// arrows + remove. Up/down buttons over drag-handles to keep this modal
// keyboard-friendly without pulling DnD into the modal.
const LinkListEditor = ({
    links,
    pages,
    onChange
}: {
    links: NavLink[]
    pages: LandingPage[]
    onChange: (next: NavLink[]) => void
}) => {
    const update = (i: number, patch: Partial<NavLink>) => onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
    const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i))
    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir
        if (j < 0 || j >= links.length) return
        const next = [...links]
        ;[next[i], next[j]] = [next[j], next[i]]
        onChange(next)
    }
    const add = () => onChange([...links, { id: newLinkId(), label: 'New link', url: '' }])

    return (
        <div className="space-y-2">
            {links.length === 0 && (
                <div className="text-xs text-fg-muted rounded-md border border-dashed border-[var(--color-border)] p-3 text-center">
                    No links yet.
                </div>
            )}
            {links.map((link, i) => (
                <div
                    key={link.id}
                    className="rounded-md border border-[var(--color-border)] p-3 space-y-2 bg-surface-2/40">
                    <div className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                                label="Label"
                                value={link.label}
                                onChange={(e) => update(i, { label: e.target.value })}
                            />
                            <label className="flex items-end pb-1.5 text-sm cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={!!link.newTab}
                                    onChange={(e) => update(i, { newTab: e.target.checked })}
                                    className="accent-[var(--color-brand-500)] mr-2"
                                />
                                Open in new tab
                            </label>
                        </div>
                        <div className="flex flex-col items-center pt-5">
                            <button
                                type="button"
                                aria-label="Move up"
                                onClick={() => move(i, -1)}
                                disabled={i === 0}
                                className="p-1 text-fg-muted hover:text-fg disabled:opacity-30">
                                <ChevronUp size={14} />
                            </button>
                            <button
                                type="button"
                                aria-label="Move down"
                                onClick={() => move(i, 1)}
                                disabled={i === links.length - 1}
                                className="p-1 text-fg-muted hover:text-fg disabled:opacity-30">
                                <ChevronDown size={14} />
                            </button>
                        </div>
                        <button
                            type="button"
                            aria-label="Remove link"
                            onClick={() => remove(i)}
                            className="mt-7 text-fg-muted hover:text-[var(--color-danger)]">
                            <X size={14} />
                        </button>
                    </div>
                    <LinkTargetPicker
                        pageId={link.pageId}
                        url={link.url}
                        pages={pages}
                        onChange={(t) => update(i, { pageId: t.pageId, url: t.url })}
                    />
                </div>
            ))}
            <Button
                size="sm"
                variant="ghost"
                leftIcon={<Plus size={12} />}
                onClick={add}>
                Add link
            </Button>
        </div>
    )
}

// Internal vs external target picker. "Page" mode binds to a LandingPage by
// id (so renames don't break the link). "URL" mode is free-form — relative
// paths render under the tenant slug, absolute URLs pass through untouched.
const LinkTargetPicker = ({
    pageId,
    url,
    pages,
    onChange
}: {
    pageId?: string
    url?: string
    pages: LandingPage[]
    onChange: (t: { pageId?: string; url?: string }) => void
}) => {
    const mode: 'page' | 'url' = pageId ? 'page' : 'url'
    return (
        <div className="grid grid-cols-[120px_1fr] gap-2">
            <Select
                aria-label="Link type"
                value={mode}
                onChange={(e) => {
                    if (e.target.value === 'page') onChange({ pageId: pages[0]?.id, url: undefined })
                    else onChange({ pageId: undefined, url: '' })
                }}>
                <option value="page">Page</option>
                <option value="url">URL</option>
            </Select>
            {mode === 'page' ? (
                <Select
                    aria-label="Target page"
                    value={pageId ?? ''}
                    onChange={(e) => onChange({ pageId: e.target.value || undefined })}>
                    <option value="">— pick a page —</option>
                    {pages.map((p) => (
                        <option
                            key={p.id}
                            value={p.id}>
                            {p.name} ({p.slug})
                        </option>
                    ))}
                </Select>
            ) : (
                <div className="relative">
                    <Link2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" />
                    <Input
                        value={url ?? ''}
                        onChange={(e) => onChange({ url: e.target.value })}
                        placeholder="enquiry, /about, or https://…"
                        className="pl-7 font-mono"
                    />
                </div>
            )}
        </div>
    )
}

const FooterColumnsEditor = ({
    columns,
    pages,
    onChange
}: {
    columns: FooterColumn[]
    pages: LandingPage[]
    onChange: (next: FooterColumn[]) => void
}) => {
    const update = (i: number, patch: Partial<FooterColumn>) =>
        onChange(columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
    const remove = (i: number) => onChange(columns.filter((_, idx) => idx !== i))
    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir
        if (j < 0 || j >= columns.length) return
        const next = [...columns]
        ;[next[i], next[j]] = [next[j], next[i]]
        onChange(next)
    }
    const add = () =>
        onChange([
            ...columns,
            { id: newLinkId(), title: `Column ${columns.length + 1}`, links: [] }
        ])

    return (
        <div className="space-y-3">
            {columns.length === 0 && (
                <div className="text-xs text-fg-muted rounded-md border border-dashed border-[var(--color-border)] p-3 text-center">
                    No columns yet — add one to start grouping footer links.
                </div>
            )}
            {columns.map((col, i) => (
                <div
                    key={col.id}
                    className="rounded-md border border-[var(--color-border)] p-3 space-y-3 bg-surface-2/40">
                    <div className="flex items-start gap-2">
                        <Input
                            label={`Column ${i + 1} title`}
                            value={col.title}
                            onChange={(e) => update(i, { title: e.target.value })}
                            className="flex-1"
                        />
                        <div className="flex flex-col items-center pt-5">
                            <button
                                type="button"
                                aria-label="Move up"
                                onClick={() => move(i, -1)}
                                disabled={i === 0}
                                className="p-1 text-fg-muted hover:text-fg disabled:opacity-30">
                                <ChevronUp size={14} />
                            </button>
                            <button
                                type="button"
                                aria-label="Move down"
                                onClick={() => move(i, 1)}
                                disabled={i === columns.length - 1}
                                className="p-1 text-fg-muted hover:text-fg disabled:opacity-30">
                                <ChevronDown size={14} />
                            </button>
                        </div>
                        <button
                            type="button"
                            aria-label="Remove column"
                            onClick={() => remove(i)}
                            className="mt-7 text-fg-muted hover:text-[var(--color-danger)]">
                            <X size={14} />
                        </button>
                    </div>
                    <LinkListEditor
                        links={col.links}
                        pages={pages}
                        onChange={(links) => update(i, { links })}
                    />
                </div>
            ))}
            <Button
                size="sm"
                variant="ghost"
                leftIcon={<Plus size={12} />}
                onClick={add}>
                Add column
            </Button>
        </div>
    )
}

// ---- Testimonials editor ----------------------------------------------------

const TestimonialsFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'testimonials' }>['data']
    onChange: (p: object) => void
}) => {
    const items = data.items ?? []
    const update = (i: number, patch: Partial<TestimonialItem>) =>
        onChange({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
    const add = () =>
        onChange({
            items: [...items, { name: '', quote: '' } as TestimonialItem]
        })
    const remove = (i: number) => onChange({ items: items.filter((_, idx) => idx !== i) })
    return (
        <div className="space-y-3">
            <Input
                label="Section title"
                value={data.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
            />
            <Textarea
                label="Subtitle"
                rows={2}
                value={data.subtitle ?? ''}
                onChange={(e) => onChange({ subtitle: e.target.value })}
            />
            <div className="space-y-2">
                {items.map((it, i) => (
                    <div
                        key={i}
                        className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
                        <div className="flex items-start gap-2">
                            <Input
                                label={`Name ${i + 1}`}
                                value={it.name}
                                onChange={(e) => update(i, { name: e.target.value })}
                            />
                            <button
                                type="button"
                                aria-label="Remove testimonial"
                                onClick={() => remove(i)}
                                className="mt-7 text-fg-muted hover:text-[var(--color-danger)]">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                            <Input
                                label="Role"
                                value={it.role ?? ''}
                                onChange={(e) => update(i, { role: e.target.value })}
                            />
                            <Input
                                label="Company"
                                value={it.company ?? ''}
                                onChange={(e) => update(i, { company: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Avatar URL"
                            value={it.avatarUrl ?? ''}
                            onChange={(e) => update(i, { avatarUrl: e.target.value })}
                            placeholder="https://…"
                        />
                        <Textarea
                            label="Quote"
                            rows={3}
                            value={it.quote}
                            onChange={(e) => update(i, { quote: e.target.value })}
                        />
                    </div>
                ))}
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={12} />}
                    onClick={add}>
                    Add testimonial
                </Button>
            </div>
        </div>
    )
}

// ---- Stats editor -----------------------------------------------------------

const StatsFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'stats' }>['data']
    onChange: (p: object) => void
}) => {
    const items = data.items ?? []
    const update = (i: number, patch: Partial<StatItem>) =>
        onChange({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
    const add = () => onChange({ items: [...items, { value: '', label: '' } as StatItem] })
    const remove = (i: number) => onChange({ items: items.filter((_, idx) => idx !== i) })
    return (
        <div className="space-y-3">
            <Input
                label="Section title"
                value={data.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
            />
            <Textarea
                label="Subtitle"
                rows={2}
                value={data.subtitle ?? ''}
                onChange={(e) => onChange({ subtitle: e.target.value })}
            />
            <div className="space-y-2">
                {items.map((it, i) => (
                    <div
                        key={i}
                        className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
                        <div className="flex items-start gap-2">
                            <Input
                                label={`Stat ${i + 1} value`}
                                value={it.value}
                                onChange={(e) => update(i, { value: e.target.value })}
                                placeholder="94%"
                            />
                            <button
                                type="button"
                                aria-label="Remove stat"
                                onClick={() => remove(i)}
                                className="mt-7 text-fg-muted hover:text-[var(--color-danger)]">
                                <X size={14} />
                            </button>
                        </div>
                        <Input
                            label="Label"
                            value={it.label}
                            onChange={(e) => update(i, { label: e.target.value })}
                            placeholder="Placement rate"
                        />
                        <Input
                            label="Sublabel (optional)"
                            value={it.sublabel ?? ''}
                            onChange={(e) => update(i, { sublabel: e.target.value })}
                            placeholder="Cohort 2025-Q1"
                        />
                    </div>
                ))}
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={12} />}
                    onClick={add}>
                    Add stat
                </Button>
            </div>
        </div>
    )
}

// ---- Lead form editor -------------------------------------------------------

const LeadFormFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'leadForm' }>['data']
    onChange: (p: object) => void
}) => (
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
            label="Submit button label"
            value={data.submitLabel ?? ''}
            onChange={(e) => onChange({ submitLabel: e.target.value })}
            placeholder="Request a callback"
        />
        <Input
            label="Success message"
            value={data.successMessage ?? ''}
            onChange={(e) => onChange({ successMessage: e.target.value })}
            placeholder="We will be in touch within one working day."
        />
        <Input
            label="Course pre-fill (optional)"
            value={data.coursePrefill ?? ''}
            onChange={(e) => onChange({ coursePrefill: e.target.value })}
            placeholder="Business Analytics Pro"
            hint="Auto-fills the 'Interested in' field. Useful when the form is on a course page."
        />
        <div className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
            <div className="text-xs font-semibold text-fg mb-1">Optional fields</div>
            {(['showQualification', 'showCity', 'showMessage'] as const).map((k) => (
                <label
                    key={k}
                    className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={!!data[k]}
                        onChange={(e) => onChange({ [k]: e.target.checked })}
                        className="accent-[var(--color-brand-500)]"
                    />
                    {k === 'showQualification' && 'Show qualification'}
                    {k === 'showCity' && 'Show city'}
                    {k === 'showMessage' && 'Show message'}
                </label>
            ))}
        </div>
    </div>
)

// ---- Logos editor -----------------------------------------------------------

const LogosFields = ({
    data,
    onChange
}: {
    data: Extract<LandingSection, { type: 'logos' }>['data']
    onChange: (p: object) => void
}) => {
    const items = data.items ?? []
    const update = (i: number, patch: Partial<LogoItem>) =>
        onChange({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
    const add = () => onChange({ items: [...items, { src: '' } as LogoItem] })
    const remove = (i: number) => onChange({ items: items.filter((_, idx) => idx !== i) })
    return (
        <div className="space-y-3">
            <Input
                label="Title"
                value={data.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Our students work at"
            />
            <Input
                label="Subtitle"
                value={data.subtitle ?? ''}
                onChange={(e) => onChange({ subtitle: e.target.value })}
            />
            <div className="space-y-2">
                {items.map((it, i) => (
                    <div
                        key={i}
                        className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
                        <div className="flex items-start gap-2">
                            <Input
                                label={`Logo ${i + 1} URL`}
                                value={it.src}
                                onChange={(e) => update(i, { src: e.target.value })}
                                placeholder="https://… .png or .svg"
                            />
                            <button
                                type="button"
                                aria-label="Remove logo"
                                onClick={() => remove(i)}
                                className="mt-7 text-fg-muted hover:text-[var(--color-danger)]">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                            <Input
                                label="Alt text"
                                value={it.alt ?? ''}
                                onChange={(e) => update(i, { alt: e.target.value })}
                                placeholder="Acme Corp"
                            />
                            <Input
                                label="Link (optional)"
                                value={it.href ?? ''}
                                onChange={(e) => update(i, { href: e.target.value })}
                                placeholder="https://…"
                            />
                        </div>
                        {it.src && (
                            <div className="rounded-md border bg-surface-2 p-2 text-center">
                                <img
                                    src={it.src}
                                    alt={it.alt ?? ''}
                                    className="h-8 w-auto mx-auto object-contain"
                                />
                            </div>
                        )}
                    </div>
                ))}
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={12} />}
                    onClick={add}>
                    Add logo
                </Button>
            </div>
        </div>
    )
}
