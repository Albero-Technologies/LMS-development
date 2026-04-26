// CMS admin — collections + items.
//
// Layout:
//   - Left rail: list of collections + "New collection" button
//   - Right pane: selected collection's items table + schema panel
//
// Modals:
//   - New collection (name, slug, optional starter fields)
//   - Schema editor (add/remove typed fields)
//   - New / edit item (typed inputs from the collection schema)
//
// Auth: gated to ADMIN/SA in the router.
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Database, Save, X, FileText, Edit3, Eye, EyeOff, Layers, Settings } from 'lucide-react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Modal } from '@shared/components/ui/Modal'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { fmtDate } from '@shared/libs/pdf'
import { cn } from '@shared/helpers/cn'
import {
    FIELD_TYPE_LABEL,
    createCollection,
    createItem,
    deleteCollection,
    deleteItem,
    listCollections,
    listItems,
    updateCollection,
    updateItem,
    type Collection,
    type CollectionItem,
    type FieldDef,
    type FieldType
} from '../services/cms.service'

export const CmsPage = () => {
    const queryClient = useQueryClient()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [newCollectionOpen, setNewCollectionOpen] = useState(false)
    const [schemaOpen, setSchemaOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<CollectionItem | 'new' | null>(null)

    const collectionsQuery = useQuery({ queryKey: ['cms', 'collections'], queryFn: listCollections, staleTime: 30_000 })
    const collections = collectionsQuery.data ?? []

    // Auto-select first collection on load.
    useEffect(() => {
        if (!selectedId && collections.length > 0) setSelectedId(collections[0].id)
    }, [selectedId, collections])

    const selected = collections.find((c) => c.id === selectedId) ?? null

    const itemsQuery = useQuery({
        queryKey: ['cms', 'items', selectedId],
        queryFn: () => listItems(selectedId!),
        enabled: !!selectedId,
        staleTime: 30_000
    })
    const items = itemsQuery.data ?? []

    const deleteCollectionMutation = useMutation({
        mutationFn: (id: string) => deleteCollection(id),
        onSuccess: (collection) => {
            toast.success(`Deleted "${collection.name}"`)
            void queryClient.invalidateQueries({ queryKey: ['cms', 'collections'] })
            setSelectedId(null)
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not delete')
    })

    return (
        <>
            <PageHeader
                eyebrow="Content"
                title="CMS"
                description="Define content types, then add and publish items. Used by the Collection-list block on your site."
                actions={
                    <Button
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => setNewCollectionOpen(true)}>
                        New collection
                    </Button>
                }
            />

            {collectionsQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : collections.length === 0 ? (
                <Empty
                    icon={<Database size={32} />}
                    title="No collections yet"
                    description="Spin up a content type — Blog, Press, Events, anything. Each item lives in this tenant only."
                    action={
                        <Button
                            leftIcon={<Plus size={14} />}
                            onClick={() => setNewCollectionOpen(true)}>
                            New collection
                        </Button>
                    }
                />
            ) : (
                <div className="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
                    <Card padded={false}>
                        <ul className="divide-y">
                            {collections.map((c) => (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(c.id)}
                                        className={cn(
                                            'w-full text-left p-3 hover:bg-surface-hover transition-colors',
                                            selectedId === c.id && 'bg-[var(--color-brand-50)]'
                                        )}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-fg truncate">{c.name}</span>
                                            <span className="text-[11px] text-fg-muted font-mono">{c._count?.items ?? 0}</span>
                                        </div>
                                        <div className="text-[11px] text-fg-muted font-mono">/{c.slug}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {selected ? (
                        <CollectionPane
                            collection={selected}
                            items={items}
                            itemsLoading={itemsQuery.isLoading}
                            onSchema={() => setSchemaOpen(true)}
                            onNewItem={() => setEditingItem('new')}
                            onEditItem={(it) => setEditingItem(it)}
                            onDeleteCollection={() => {
                                if (window.confirm(`Delete "${selected.name}"? Every item is removed too. This cannot be undone.`)) {
                                    deleteCollectionMutation.mutate(selected.id)
                                }
                            }}
                        />
                    ) : (
                        <Card>
                            <p className="text-sm text-fg-soft">Pick a collection on the left.</p>
                        </Card>
                    )}
                </div>
            )}

            <NewCollectionModal
                open={newCollectionOpen}
                onClose={() => setNewCollectionOpen(false)}
                onCreated={(c) => {
                    setSelectedId(c.id)
                    setNewCollectionOpen(false)
                }}
            />

            {selected && (
                <SchemaEditorModal
                    collection={selected}
                    open={schemaOpen}
                    onClose={() => setSchemaOpen(false)}
                />
            )}

            {selected && editingItem && (
                <ItemEditorModal
                    collection={selected}
                    item={editingItem === 'new' ? null : editingItem}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </>
    )
}

// ---- Collection pane -------------------------------------------------------

const CollectionPane = ({
    collection,
    items,
    itemsLoading,
    onSchema,
    onNewItem,
    onEditItem,
    onDeleteCollection
}: {
    collection: Collection
    items: CollectionItem[]
    itemsLoading: boolean
    onSchema: () => void
    onNewItem: () => void
    onEditItem: (it: CollectionItem) => void
    onDeleteCollection: () => void
}) => {
    const queryClient = useQueryClient()
    const fields = collection.fields ?? []

    const togglePublishMutation = useMutation({
        mutationFn: (it: CollectionItem) => updateItem(collection.id, it.id, { published: !it.published }),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['cms', 'items', collection.id] }),
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not update')
    })
    const deleteItemMutation = useMutation({
        mutationFn: (it: CollectionItem) => deleteItem(collection.id, it.id),
        onSuccess: () => {
            toast.success('Item deleted')
            void queryClient.invalidateQueries({ queryKey: ['cms', 'items', collection.id] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not delete')
    })

    return (
        <div className="space-y-4">
            <Card>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-fg">{collection.name}</h2>
                        <p className="text-xs text-fg-muted font-mono mt-0.5">/{collection.slug}</p>
                        {collection.description && <p className="text-sm text-fg-soft mt-2">{collection.description}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {fields.map((f) => (
                                <Badge
                                    key={f.key}
                                    tone="default">
                                    {f.label} · {f.type}
                                    {f.required ? ' *' : ''}
                                </Badge>
                            ))}
                            {fields.length === 0 && <Badge tone="warn">No fields defined yet</Badge>}
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Settings size={12} />}
                            onClick={onSchema}>
                            Schema
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="!text-[var(--color-danger)]"
                            leftIcon={<Trash2 size={12} />}
                            onClick={onDeleteCollection}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Card>

            <Card padded={false}>
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <h3 className="text-sm font-semibold text-fg inline-flex items-center gap-2">
                        <Layers size={14} /> Items ({items.length})
                    </h3>
                    <Button
                        size="sm"
                        leftIcon={<Plus size={12} />}
                        disabled={fields.length === 0}
                        onClick={onNewItem}>
                        New item
                    </Button>
                </div>
                {itemsLoading ? (
                    <div className="p-5">
                        <Skeleton className="h-5 w-1/3 mb-2" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                ) : items.length === 0 ? (
                    <Empty
                        icon={<FileText size={32} />}
                        title={fields.length === 0 ? 'Define a field first' : 'No items yet'}
                        description={fields.length === 0 ? 'Open Schema to add fields, then come back to create items.' : 'Add the first item — schedule it as draft or publish immediately.'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted bg-surface-2">
                                    <th className="py-3 px-5">Slug</th>
                                    <th className="py-3 px-5">Title / preview</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5">Updated</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((it) => (
                                    <tr
                                        key={it.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5 font-mono text-xs">{it.slug}</td>
                                        <td className="py-3 px-5 text-fg truncate max-w-md">{previewText(it, fields)}</td>
                                        <td className="py-3 px-5">
                                            <Badge tone={it.published ? 'ok' : 'default'}>
                                                {it.published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(it.updatedAt)}</td>
                                        <td className="py-3 px-5 text-right space-x-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                leftIcon={it.published ? <EyeOff size={12} /> : <Eye size={12} />}
                                                onClick={() => togglePublishMutation.mutate(it)}>
                                                {it.published ? 'Unpublish' : 'Publish'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                leftIcon={<Edit3 size={12} />}
                                                onClick={() => onEditItem(it)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="!text-[var(--color-danger)]"
                                                onClick={() => {
                                                    if (window.confirm('Delete this item?')) deleteItemMutation.mutate(it)
                                                }}>
                                                <Trash2 size={12} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

// Pick a sensible preview string for the items table — first text-ish field
// the schema declares, falling back to the slug.
const previewText = (item: CollectionItem, fields: FieldDef[]): string => {
    const textField = fields.find((f) => f.type === 'text' || f.type === 'longtext' || f.type === 'richtext')
    if (textField) {
        const v = item.data[textField.key]
        if (typeof v === 'string' && v.trim()) return v.length > 80 ? v.slice(0, 77) + '…' : v
    }
    return item.slug
}

// ---- New collection modal --------------------------------------------------

const slugify = (s: string): string =>
    s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'collection'

const NewCollectionModal = ({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: Collection) => void }) => {
    const queryClient = useQueryClient()
    const [presetId, setPresetId] = useState<CollectionPresetId>('blank')
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [slugTouched, setSlugTouched] = useState(false)
    const [nameTouched, setNameTouched] = useState(false)

    const preset = COLLECTION_PRESETS[presetId]

    // Picking a preset prefills name/slug — but only if the user hasn't started
    // typing their own. Editing the preset stays non-destructive that way.
    const applyPreset = (id: CollectionPresetId) => {
        setPresetId(id)
        const p = COLLECTION_PRESETS[id]
        if (!nameTouched && p.defaultName) setName(p.defaultName)
        if (!slugTouched && p.defaultSlug) setSlug(p.defaultSlug)
    }

    const mutation = useMutation({
        mutationFn: () =>
            createCollection({
                name: name.trim(),
                slug: slug.trim(),
                description: description.trim() || undefined,
                fields: preset.fields
            }),
        onSuccess: (c) => {
            toast.success('Collection created — add items now')
            void queryClient.invalidateQueries({ queryKey: ['cms', 'collections'] })
            onCreated(c)
            setPresetId('blank')
            setName('')
            setSlug('')
            setDescription('')
            setSlugTouched(false)
            setNameTouched(false)
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not create')
    })

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New collection"
            description="A content type — Blog posts, Events, Press releases. Each tenant can have any number."
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        disabled={!name || !slug}
                        onClick={() => mutation.mutate()}>
                        Create
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Select
                    label="Start from"
                    value={presetId}
                    onChange={(e) => applyPreset(e.target.value as CollectionPresetId)}
                    hint={preset.description}>
                    {(Object.keys(COLLECTION_PRESETS) as CollectionPresetId[]).map((id) => (
                        <option
                            key={id}
                            value={id}>
                            {COLLECTION_PRESETS[id].label}
                        </option>
                    ))}
                </Select>
                <Input
                    label="Name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        setNameTouched(true)
                        if (!slugTouched) setSlug(slugify(e.target.value))
                    }}
                    placeholder="Blog posts"
                />
                <Input
                    label="Slug"
                    value={slug}
                    onChange={(e) => {
                        setSlug(e.target.value)
                        setSlugTouched(true)
                    }}
                    placeholder="blog"
                    hint="URL-safe — lowercase, digits, hyphens. Used in /collections/&lt;slug&gt; routes."
                />
                <Textarea
                    label="Description (optional)"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className="rounded-md border border-[var(--color-border)] bg-surface-hover/50 px-3 py-2">
                    <div className="text-[11px] font-medium text-fg-soft mb-1">Schema preview</div>
                    <div className="flex flex-wrap gap-1.5">
                        {preset.fields.map((f) => (
                            <span
                                key={f.key}
                                className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] text-fg-soft border border-[var(--color-border)]">
                                {f.label}
                                <span className="text-fg-muted text-[10px]">· {FIELD_TYPE_LABEL[f.type] ?? f.type}</span>
                                {f.required && <span className="text-[var(--color-brand-600)] text-[10px]">*</span>}
                            </span>
                        ))}
                    </div>
                    <div className="mt-1.5 text-[10px] text-fg-muted">Edit fields after creating from the schema editor.</div>
                </div>
            </div>
        </Modal>
    )
}

// Curated starter schemas. Picking one in the New-collection modal swaps the
// fields wholesale — tenants can still edit/extend the schema after creation.
type CollectionPresetId = 'blank' | 'blog' | 'events' | 'team' | 'testimonials' | 'faqs' | 'press'

interface CollectionPreset {
    label: string
    description: string
    defaultName?: string
    defaultSlug?: string
    fields: FieldDef[]
}

const COLLECTION_PRESETS: Record<CollectionPresetId, CollectionPreset> = {
    blank: {
        label: 'Blank — title, summary, cover image',
        description: 'A minimal starter. Add your own fields after creating.',
        fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'summary', label: 'Summary', type: 'longtext' },
            { key: 'coverImage', label: 'Cover image', type: 'image' }
        ]
    },
    blog: {
        label: 'Blog posts',
        description: 'Title, body, cover image, author, publish date.',
        defaultName: 'Blog posts',
        defaultSlug: 'blog',
        fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'summary', label: 'Summary', type: 'longtext' },
            { key: 'body', label: 'Body', type: 'richtext' },
            { key: 'coverImage', label: 'Cover image', type: 'image' },
            { key: 'author', label: 'Author', type: 'text' },
            { key: 'publishedAt', label: 'Publish date', type: 'date' }
        ]
    },
    events: {
        label: 'Events',
        description: 'Title, date/time, location, description, registration link.',
        defaultName: 'Events',
        defaultSlug: 'events',
        fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'startsAt', label: 'Starts at', type: 'date', required: true },
            { key: 'location', label: 'Location', type: 'text' },
            { key: 'mode', label: 'Mode', type: 'select', options: ['Online', 'In-person', 'Hybrid'] },
            { key: 'summary', label: 'Summary', type: 'longtext' },
            { key: 'coverImage', label: 'Cover image', type: 'image' },
            { key: 'registerUrl', label: 'Registration URL', type: 'text' }
        ]
    },
    team: {
        label: 'Team members',
        description: 'Name, role, photo, bio, LinkedIn.',
        defaultName: 'Team',
        defaultSlug: 'team',
        fields: [
            { key: 'name', label: 'Name', type: 'text', required: true },
            { key: 'role', label: 'Role', type: 'text', required: true },
            { key: 'photo', label: 'Photo', type: 'image' },
            { key: 'bio', label: 'Bio', type: 'longtext' },
            { key: 'linkedin', label: 'LinkedIn URL', type: 'text' }
        ]
    },
    testimonials: {
        label: 'Testimonials',
        description: 'Quote, student name, cohort, photo, rating.',
        defaultName: 'Testimonials',
        defaultSlug: 'testimonials',
        fields: [
            { key: 'quote', label: 'Quote', type: 'longtext', required: true },
            { key: 'studentName', label: 'Student name', type: 'text', required: true },
            { key: 'cohort', label: 'Cohort / role', type: 'text' },
            { key: 'photo', label: 'Photo', type: 'image' },
            { key: 'rating', label: 'Rating (1-5)', type: 'number' }
        ]
    },
    faqs: {
        label: 'FAQs',
        description: 'Question + answer pairs, optional category.',
        defaultName: 'FAQs',
        defaultSlug: 'faqs',
        fields: [
            { key: 'question', label: 'Question', type: 'text', required: true },
            { key: 'answer', label: 'Answer', type: 'richtext', required: true },
            { key: 'category', label: 'Category', type: 'select', options: ['General', 'Admissions', 'Fees', 'Curriculum', 'Placement'] }
        ]
    },
    press: {
        label: 'Press releases',
        description: 'Title, source publication, date, body, link to original.',
        defaultName: 'Press',
        defaultSlug: 'press',
        fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'source', label: 'Source publication', type: 'text' },
            { key: 'publishedAt', label: 'Publish date', type: 'date' },
            { key: 'summary', label: 'Summary', type: 'longtext' },
            { key: 'externalUrl', label: 'Original article URL', type: 'text' }
        ]
    }
}

// ---- Schema editor modal ---------------------------------------------------

const SchemaEditorModal = ({ collection, open, onClose }: { collection: Collection; open: boolean; onClose: () => void }) => {
    const queryClient = useQueryClient()
    const [fields, setFields] = useState<FieldDef[]>(collection.fields ?? [])

    useEffect(() => {
        setFields(collection.fields ?? [])
    }, [collection.fields, open])

    const mutation = useMutation({
        mutationFn: () => updateCollection(collection.id, { fields }),
        onSuccess: () => {
            toast.success('Schema saved')
            void queryClient.invalidateQueries({ queryKey: ['cms', 'collections'] })
            onClose()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    const update = (i: number, patch: Partial<FieldDef>) => setFields((xs) => xs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
    const add = () =>
        setFields((xs) => [...xs, { key: `field_${xs.length + 1}`, label: `Field ${xs.length + 1}`, type: 'text' }])
    const remove = (i: number) => setFields((xs) => xs.filter((_, idx) => idx !== i))

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Schema"
            description={`Fields available on every item in "${collection.name}".`}
            size="lg"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        leftIcon={<Save size={12} />}
                        onClick={() => mutation.mutate()}>
                        Save
                    </Button>
                </>
            }>
            <div className="space-y-3">
                {fields.map((f, i) => (
                    <div
                        key={i}
                        className="rounded-md border border-[var(--color-border)] p-3">
                        <div className="grid sm:grid-cols-12 gap-3">
                            <Input
                                label="Label"
                                value={f.label}
                                onChange={(e) => update(i, { label: e.target.value })}
                                className="sm:col-span-4"
                            />
                            <Input
                                label="Key"
                                value={f.key}
                                onChange={(e) => update(i, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                                className="sm:col-span-3 font-mono"
                            />
                            <Select
                                label="Type"
                                value={f.type}
                                onChange={(e) => update(i, { type: e.target.value as FieldType })}
                                className="sm:col-span-3">
                                {(Object.keys(FIELD_TYPE_LABEL) as FieldType[]).map((t) => (
                                    <option
                                        key={t}
                                        value={t}>
                                        {FIELD_TYPE_LABEL[t]}
                                    </option>
                                ))}
                            </Select>
                            <div className="sm:col-span-2 flex flex-col justify-end pb-1.5">
                                <label className="text-xs text-fg-soft inline-flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!f.required}
                                        onChange={(e) => update(i, { required: e.target.checked })}
                                        className="accent-[var(--color-brand-500)]"
                                    />
                                    Required
                                </label>
                                <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="mt-1 text-[var(--color-danger)] text-xs inline-flex items-center gap-1 hover:underline">
                                    <X size={11} /> Remove
                                </button>
                            </div>
                        </div>
                        {f.type === 'select' && (
                            <Input
                                label="Options (comma separated)"
                                value={(f.options ?? []).join(', ')}
                                onChange={(e) =>
                                    update(i, {
                                        options: e.target.value
                                            .split(',')
                                            .map((s) => s.trim())
                                            .filter(Boolean)
                                    })
                                }
                                className="mt-2"
                                hint="e.g. Draft, Published, Archived"
                            />
                        )}
                    </div>
                ))}
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Plus size={12} />}
                    onClick={add}>
                    Add field
                </Button>
            </div>
        </Modal>
    )
}

// ---- Item editor modal -----------------------------------------------------

const ItemEditorModal = ({
    collection,
    item,
    onClose
}: {
    collection: Collection
    item: CollectionItem | null
    onClose: () => void
}) => {
    const queryClient = useQueryClient()
    const fields = collection.fields ?? []
    const [slug, setSlug] = useState(item?.slug ?? '')
    const [data, setData] = useState<Record<string, unknown>>(item?.data ?? {})
    const [published, setPublished] = useState(!!item?.published)
    const [slugTouched, setSlugTouched] = useState(!!item)

    const titleField = useMemo(() => fields.find((f) => f.key === 'title') ?? fields.find((f) => f.type === 'text'), [fields])
    const titleValue = (titleField ? (data[titleField.key] as string | undefined) : undefined) ?? ''

    // Auto-derive slug from title until the user edits it.
    useEffect(() => {
        if (slugTouched || !titleValue) return
        setSlug(slugify(titleValue))
    }, [titleValue, slugTouched])

    const setField = (key: string, value: unknown) => setData((d) => ({ ...d, [key]: value }))

    const mutation = useMutation({
        mutationFn: () => {
            if (item) return updateItem(collection.id, item.id, { slug, data, published })
            return createItem(collection.id, { slug, data, published })
        },
        onSuccess: () => {
            toast.success(item ? 'Item updated' : 'Item created')
            void queryClient.invalidateQueries({ queryKey: ['cms', 'items', collection.id] })
            onClose()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not save')
    })

    return (
        <Modal
            open
            onClose={onClose}
            title={item ? 'Edit item' : 'New item'}
            description={collection.name}
            size="lg"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setPublished((p) => !p)
                        }}>
                        {published ? 'Mark draft' : 'Mark published'}
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        disabled={!slug}
                        onClick={() => mutation.mutate()}>
                        Save
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Input
                    label="Slug"
                    value={slug}
                    onChange={(e) => {
                        setSlug(e.target.value)
                        setSlugTouched(true)
                    }}
                    className="font-mono"
                />
                {fields.map((f) => (
                    <ItemFieldEditor
                        key={f.key}
                        field={f}
                        value={data[f.key]}
                        onChange={(v) => setField(f.key, v)}
                    />
                ))}
                <div className="flex items-center justify-between text-xs text-fg-muted pt-2">
                    <span>Status: <Badge tone={published ? 'ok' : 'default'}>{published ? 'Published' : 'Draft'}</Badge></span>
                    {item && <span>Updated {fmtDate(item.updatedAt)}</span>}
                </div>
            </div>
        </Modal>
    )
}

const ItemFieldEditor = ({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) => {
    const label = field.label + (field.required ? ' *' : '')
    switch (field.type) {
        case 'longtext':
        case 'richtext':
            return (
                <Textarea
                    label={label}
                    rows={field.type === 'richtext' ? 6 : 4}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.type === 'richtext' ? '<p>Markup allowed — sanitised on render.</p>' : ''}
                />
            )
        case 'number':
            return (
                <Input
                    label={label}
                    type="number"
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
                />
            )
        case 'boolean':
            return (
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="accent-[var(--color-brand-500)]"
                    />
                    {label}
                </label>
            )
        case 'date':
            return (
                <Input
                    label={label}
                    type="date"
                    value={value ? String(value).slice(0, 10) : ''}
                    onChange={(e) => onChange(e.target.value || null)}
                />
            )
        case 'image':
            return (
                <div>
                    <Input
                        label={label}
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https:// …"
                    />
                    {!!value && (
                        <div className="mt-2 rounded-md border overflow-hidden">
                            <img
                                src={String(value)}
                                alt={field.label}
                                className="w-full h-32 object-cover"
                            />
                        </div>
                    )}
                </div>
            )
        case 'select':
            return (
                <Select
                    label={label}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value || null)}>
                    <option value="">—</option>
                    {(field.options ?? []).map((o) => (
                        <option
                            key={o}
                            value={o}>
                            {o}
                        </option>
                    ))}
                </Select>
            )
        default:
            return (
                <Input
                    label={label}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            )
    }
}
