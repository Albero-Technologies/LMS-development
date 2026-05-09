// Backend-wired curriculum builder. Replaces the previous Zustand-only
// implementation that broke whenever a course was created via the real
// /courses POST (the local store never knew about that ID, so editing was
// impossible).
//
// Now: GET /courses/:id hydrates the page; POST/PATCH/DELETE on sections and
// lessons mutate the server, then we invalidate the course query so the
// sidebar/preview re-render with fresh data.
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    Plus,
    Youtube,
    Trash2,
    Eye,
    GripVertical,
    Clock,
    Pencil,
    ImageIcon,
    Tag as TagIcon,
    X as CloseIcon,
    Link as LinkIcon,
    FileText,
    DollarSign,
    Save,
    Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Modal } from '@shared/components/ui/Modal'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Tabs } from '@shared/components/ui/Tabs'
import { cn } from '@shared/helpers/cn'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'
import { toApiError } from '@shared/libs/api'
import { YouTubePlayer } from '../components/YouTubePlayer'
import { parseYouTubeId, youtubeThumbUrl } from '../helpers/youtube'
import {
    createLesson,
    createSection,
    deleteLesson,
    deleteSection,
    getCourse,
    updateCourse,
    updateLesson,
    updateSection,
    type LessonType,
    type TLesson,
    type TLessonResource,
    type TSection
} from '../services/course.service'

export const CourseBuilderPage = () => {
    const { id = '' } = useParams()
    const [params] = useSearchParams()
    const queryClient = useQueryClient()
    const confirm = useConfirm()

    // SUPER_ADMIN cross-tenant context. When the SA opens this page from the
    // cross-tenant catalog, the deep link carries `?tenantId=<id>` so every
    // GET/PATCH/DELETE on the curriculum lands on the right tenant. Other
    // roles open without the param and the backend uses their JWT tenant.
    const tenantId = params.get('tenantId') ?? undefined

    const courseQuery = useQuery({
        queryKey: ['courses', id, tenantId ?? 'self'],
        queryFn: () => getCourse(id, tenantId),
        enabled: id.length > 0,
        staleTime: 30_000,
        retry: false
    })
    const course = courseQuery.data
    const sections: TSection[] = course?.sections ?? []

    // Top-level tabs — Curriculum (the existing 3-pane builder) vs Settings
    // (course-level metadata: thumbnail, branding, pricing, tags). Settings
    // are also editable from the course-detail page; keeping them next to
    // the curriculum is a usability win — the builder is where trainers
    // spend most of their time.
    type Tab = 'curriculum' | 'settings'
    const [tab, setTab] = useState<Tab>('curriculum')

    // Track which section is "active" (the one whose lessons fill the middle
    // pane) and which lesson is being previewed. Both default to the first
    // section / first lesson once data arrives.
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
    const [previewLessonId, setPreviewLessonId] = useState<string | null>(null)
    // Lesson modal handles both create and edit. `null` means closed; 'new'
    // opens in create mode; passing a TLesson opens in edit mode.
    const [lessonEditor, setLessonEditor] = useState<TLesson | 'new' | null>(null)

    // Section editor modal — replaces the native window.prompt that looked
    // out-of-place against the rest of the dashboard chrome. Shape mirrors
    // the lesson editor: 'new' for create, a TSection ref for rename, null
    // to close.
    const [sectionEditor, setSectionEditor] = useState<TSection | 'new' | null>(null)

    useEffect(() => {
        if (sections.length === 0) {
            setActiveSectionId(null)
            return
        }
        // Keep current selection if it still exists, otherwise jump to first.
        if (!sections.some((s) => s.id === activeSectionId)) setActiveSectionId(sections[0].id)
    }, [sections, activeSectionId])

    const activeSection = sections.find((s) => s.id === activeSectionId) ?? null
    const previewLesson = activeSection?.lessons.find((l) => l.id === previewLessonId) ?? activeSection?.lessons[0] ?? null

    // ---- Drag-and-drop reorder (sections + lessons) --------------------
    // Native HTML5 drag-drop — no extra dep. We track the `dragging` id
    // (whichever row started the drag) and `dragOver` (the row currently
    // hovered) so the source row can dim and the target shows a top
    // accent line.
    const [dragSection, setDragSection] = useState<{ id: string; over: string | null } | null>(null)
    const [dragLesson, setDragLesson] = useState<{ id: string; over: string | null } | null>(null)

    // Helper — given an array, move `fromIdx` to `toIdx` (returning a new array).
    // Used by both the section + lesson drag handlers.
    const moveItem = <T,>(arr: T[], fromIdx: number, toIdx: number): T[] => {
        if (fromIdx === toIdx) return arr
        const next = arr.slice()
        const [item] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, item)
        return next
    }

    const handleSectionDrop = (targetId: string) => {
        if (!dragSection || dragSection.id === targetId) return setDragSection(null)
        const fromIdx = sections.findIndex((s) => s.id === dragSection.id)
        const toIdx = sections.findIndex((s) => s.id === targetId)
        if (fromIdx === -1 || toIdx === -1) return setDragSection(null)
        const next = moveItem(sections, fromIdx, toIdx)
        // Optimistic invalidation comes from the chained PATCHes; we don't
        // mutate the cache directly here because each updateSection invalidates
        // on its own and the final state converges.
        Promise.all(
            next.map((sec, i) =>
                sec.order === i ? null : reorderSectionMutation.mutateAsync({ sectionId: sec.id, order: i })
            )
        ).finally(() => {
            invalidate()
            setDragSection(null)
        })
    }

    const handleLessonDrop = (targetId: string) => {
        if (!activeSection || !dragLesson || dragLesson.id === targetId) return setDragLesson(null)
        const ls = activeSection.lessons
        const fromIdx = ls.findIndex((l) => l.id === dragLesson.id)
        const toIdx = ls.findIndex((l) => l.id === targetId)
        if (fromIdx === -1 || toIdx === -1) return setDragLesson(null)
        const next = moveItem(ls, fromIdx, toIdx)
        Promise.all(
            next.map((l, i) => (l.order === i ? null : reorderLessonMutation.mutateAsync({ lessonId: l.id, order: i })))
        ).finally(() => {
            invalidate()
            setDragLesson(null)
        })
    }

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['courses', id] })

    // ---- Mutations -----------------------------------------------------

    const addSectionMutation = useMutation({
        mutationFn: (title: string) => createSection(id, { title, order: sections.length }, tenantId),
        onSuccess: (sec) => {
            invalidate()
            setActiveSectionId(sec.id)
        },
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not add section')
    })

    const renameSectionMutation = useMutation({
        mutationFn: ({ sectionId, title }: { sectionId: string; title: string }) => updateSection(id, sectionId, { title }, tenantId),
        onSuccess: () => invalidate(),
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not rename')
    })

    // Re-numbering mutations — `updateSection`/`updateLesson` accept an
    // `order` field. After a drag, we walk the new array and PATCH each
    // entry whose order changed. The list is short (typically <30) so the
    // chatty endpoint is fine; React Query invalidates after the last call.
    const reorderSectionMutation = useMutation({
        mutationFn: ({ sectionId, order }: { sectionId: string; order: number }) =>
            updateSection(id, sectionId, { order }, tenantId),
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not reorder section')
    })
    const reorderLessonMutation = useMutation({
        mutationFn: ({ lessonId, order }: { lessonId: string; order: number }) =>
            updateLesson(id, lessonId, { order }, tenantId),
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not reorder lesson')
    })

    const deleteSectionMutation = useMutation({
        mutationFn: (sectionId: string) => deleteSection(id, sectionId, tenantId),
        onSuccess: () => invalidate(),
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not delete section')
    })

    const deleteLessonMutation = useMutation({
        mutationFn: (lessonId: string) => deleteLesson(id, lessonId, tenantId),
        onSuccess: () => invalidate(),
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not delete lesson')
    })

    const publishMutation = useMutation({
        mutationFn: (publish: boolean) => updateCourse(id, { publishState: publish ? 'PUBLISHED' : 'DRAFT' }, tenantId),
        onSuccess: (next) => {
            invalidate()
            toast.success(next.publishState === 'PUBLISHED' ? 'Course published — visible to students' : 'Course unpublished')
        },
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not update publish state')
    })

    // ---- Handlers ------------------------------------------------------

    const handleAddSection = () => setSectionEditor('new')
    const handleRenameSection = (sec: TSection) => setSectionEditor(sec)

    const handleRemoveSection = async (sec: TSection) => {
        const ok = await confirm({
            title: `Delete section "${sec.title}"?`,
            description: 'Every lesson inside this section is also removed. Student progress on those lessons is preserved on the enrolment record.',
            confirmLabel: 'Delete',
            tone: 'danger'
        })
        if (!ok) return
        deleteSectionMutation.mutate(sec.id, {
            onSuccess: () => {
                if (activeSectionId === sec.id) setActiveSectionId(null)
            }
        })
    }

    const handleRemoveLesson = async (lessonId: string, title: string) => {
        const ok = await confirm({
            title: `Delete lesson "${title}"?`,
            description: 'Students lose access to this lesson immediately. Past progress on it stays in the analytics.',
            confirmLabel: 'Delete',
            tone: 'danger'
        })
        if (!ok) return
        deleteLessonMutation.mutate(lessonId)
    }

    // ---- Render --------------------------------------------------------

    if (courseQuery.isLoading) {
        return (
            <>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-16 w-full mb-6" />
                <div className="grid lg:grid-cols-[280px_1fr_340px] gap-4">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </>
        )
    }

    if (!course) {
        return (
            <>
                <Link
                    to="/app/courses"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All courses
                </Link>
                <Empty
                    title="Course not found"
                    description="It may have been deleted, or you don't have access."
                />
            </>
        )
    }

    const isPublished = course.publishState === 'PUBLISHED'

    return (
        <>
            <Link
                to={`/app/courses/${course.id}${tenantId ? `?tenantId=${tenantId}` : ""}`}
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> Back to course
            </Link>
            <PageHeader
                eyebrow="Course Builder"
                title={course.title}
                description="Author the curriculum or tweak course-level settings. Students see changes instantly."
                actions={
                    <>
                        <Link to={`/app/courses/${course.id}${tenantId ? `?tenantId=${tenantId}` : ""}`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Eye size={14} />}>
                                Preview
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant={isPublished ? 'subtle' : 'primary'}
                            loading={publishMutation.isPending}
                            onClick={() => publishMutation.mutate(!isPublished)}>
                            {isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                    </>
                }
            />

            <Tabs
                className="mb-5"
                value={tab}
                onChange={setTab}
                tabs={[
                    { value: 'curriculum', label: 'Curriculum', count: sections.length },
                    { value: 'settings', label: 'Settings' }
                ]}
            />

            {tab === 'settings' ? (
                <CourseSettingsPanel
                    course={course}
                    tenantId={tenantId}
                />
            ) : (
            <div className="grid lg:grid-cols-[280px_1fr_340px] gap-4">
                {/* Sections panel */}
                <Card padded={false}>
                    <div className="p-4 flex items-center justify-between border-b">
                        <h3 className="text-sm font-semibold text-fg">Sections</h3>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Add section"
                            loading={addSectionMutation.isPending}
                            onClick={handleAddSection}>
                            <Plus size={14} />
                        </Button>
                    </div>
                    {sections.length === 0 ? (
                        <div className="p-4 text-center">
                            <div className="text-sm text-fg-muted">No sections yet.</div>
                            <Button
                                size="sm"
                                className="mt-3"
                                leftIcon={<Plus size={14} />}
                                onClick={handleAddSection}>
                                Add first section
                            </Button>
                        </div>
                    ) : (
                        <ul className="p-2 space-y-1 max-h-[560px] overflow-y-auto">
                            {sections.map((sec) => (
                                <li
                                    key={sec.id}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'move'
                                        setDragSection({ id: sec.id, over: null })
                                    }}
                                    onDragOver={(e) => {
                                        if (!dragSection || dragSection.id === sec.id) return
                                        e.preventDefault()
                                        e.dataTransfer.dropEffect = 'move'
                                        if (dragSection.over !== sec.id) setDragSection({ ...dragSection, over: sec.id })
                                    }}
                                    onDragLeave={() => {
                                        if (dragSection?.over === sec.id) setDragSection({ ...dragSection, over: null })
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        handleSectionDrop(sec.id)
                                    }}
                                    onDragEnd={() => setDragSection(null)}
                                    className={cn(
                                        'group relative flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer transition-colors',
                                        activeSection?.id === sec.id ? 'bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover',
                                        dragSection?.id === sec.id && 'opacity-40',
                                        dragSection?.over === sec.id && 'ring-2 ring-[var(--color-brand-500)]'
                                    )}
                                    onClick={() => setActiveSectionId(sec.id)}>
                                    <GripVertical
                                        size={14}
                                        className="text-fg-muted shrink-0 cursor-grab active:cursor-grabbing"
                                        aria-label="Drag to reorder"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-fg truncate">{sec.title}</div>
                                        <div className="text-[11px] text-fg-muted">
                                            {sec.lessons.length} lesson{sec.lessons.length === 1 ? '' : 's'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-1 rounded text-fg-muted hover:text-fg opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRenameSection(sec)
                                        }}
                                        aria-label="Rename section">
                                        <Pencil size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        className="p-1 rounded text-fg-muted hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveSection(sec)
                                        }}
                                        aria-label="Delete section">
                                        <Trash2 size={13} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                {/* Lessons panel */}
                <Card padded={false}>
                    <div className="p-4 flex items-center justify-between border-b">
                        <div>
                            <h3 className="text-sm font-semibold text-fg">{activeSection ? activeSection.title : 'Lessons'}</h3>
                            {activeSection && (
                                <p className="text-xs text-fg-muted mt-0.5">
                                    {activeSection.lessons.length} item
                                    {activeSection.lessons.length === 1 ? '' : 's'}
                                </p>
                            )}
                        </div>
                        <Button
                            size="sm"
                            leftIcon={<Plus size={14} />}
                            disabled={!activeSection}
                            onClick={() => setLessonEditor('new')}>
                            Add lesson
                        </Button>
                    </div>

                    {!activeSection ? (
                        <div className="p-10">
                            <Empty
                                title="Select or create a section"
                                description="Sections group lessons into modules."
                                action={
                                    <Button
                                        leftIcon={<Plus size={14} />}
                                        onClick={handleAddSection}>
                                        New section
                                    </Button>
                                }
                            />
                        </div>
                    ) : activeSection.lessons.length === 0 ? (
                        <div className="p-10">
                            <Empty
                                icon={<Youtube size={34} />}
                                title="No lessons here yet"
                                description="Add a YouTube video, an external live link (Zoom / Meet), or a text-only reading lesson."
                                action={
                                    <Button
                                        leftIcon={<Plus size={14} />}
                                        onClick={() => setLessonEditor('new')}>
                                        Add lesson
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {activeSection.lessons.map((l, i) => (
                                <li
                                    key={l.id}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'move'
                                        setDragLesson({ id: l.id, over: null })
                                    }}
                                    onDragOver={(e) => {
                                        if (!dragLesson || dragLesson.id === l.id) return
                                        e.preventDefault()
                                        e.dataTransfer.dropEffect = 'move'
                                        if (dragLesson.over !== l.id) setDragLesson({ ...dragLesson, over: l.id })
                                    }}
                                    onDragLeave={() => {
                                        if (dragLesson?.over === l.id) setDragLesson({ ...dragLesson, over: null })
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        handleLessonDrop(l.id)
                                    }}
                                    onDragEnd={() => setDragLesson(null)}
                                    className={cn(
                                        'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                                        previewLesson?.id === l.id && 'bg-[var(--color-brand-50)]',
                                        dragLesson?.id === l.id && 'opacity-40',
                                        dragLesson?.over === l.id && 'ring-2 ring-[var(--color-brand-500)] ring-inset'
                                    )}
                                    onClick={() => setPreviewLessonId(l.id)}>
                                    <GripVertical
                                        size={12}
                                        className="text-fg-muted shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                                        aria-label="Drag to reorder"
                                    />
                                    <span className="font-mono text-xs text-fg-muted w-6 text-center">{i + 1}</span>
                                    {l.type === 'YOUTUBE' && l.youtubeId ? (
                                        <img
                                            src={youtubeThumbUrl(l.youtubeId)}
                                            alt=""
                                            className="w-16 h-10 object-cover rounded border"
                                        />
                                    ) : (
                                        <div className="w-16 h-10 rounded bg-surface-2 border flex items-center justify-center">
                                            <LessonTypeIcon type={l.type} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-fg truncate">{l.title}</div>
                                        <div className="text-xs text-fg-muted flex items-center gap-2 mt-0.5">
                                            <Badge tone={l.type === 'YOUTUBE' ? 'brand' : l.type === 'EXTERNAL_LIVE' ? 'warn' : 'default'}>
                                                <LessonTypeIcon type={l.type} small />
                                                {LESSON_TYPE_LABEL[l.type]}
                                            </Badge>
                                            {l.durationSec ? (
                                                <span className="inline-flex items-center gap-1 font-mono">
                                                    <Clock size={10} /> {Math.round(l.durationSec / 60)}m
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-1.5 rounded text-fg-muted hover:text-fg opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setLessonEditor(l)
                                        }}
                                        aria-label="Edit lesson">
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        className="p-1.5 rounded text-fg-muted hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveLesson(l.id, l.title)
                                        }}
                                        aria-label="Delete lesson">
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                {/* Preview panel */}
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3">Preview</h3>
                    {previewLesson?.type === 'YOUTUBE' && previewLesson.youtubeId ? (
                        <>
                            <YouTubePlayer
                                videoId={previewLesson.youtubeId}
                                title={previewLesson.title}
                            />
                            <div className="mt-3">
                                <div className="text-sm font-medium text-fg">{previewLesson.title}</div>
                                <div className="text-xs text-fg-muted font-mono mt-1">youtu.be/{previewLesson.youtubeId}</div>
                                {previewLesson.description && (
                                    <p className="mt-2 text-sm text-fg-soft whitespace-pre-wrap">{previewLesson.description}</p>
                                )}
                            </div>
                        </>
                    ) : previewLesson?.type === 'EXTERNAL_LIVE' && previewLesson.externalUrl ? (
                        <>
                            <div className="aspect-video rounded-md bg-[var(--color-brand-50)] border flex flex-col items-center justify-center gap-2 p-4">
                                <LinkIcon
                                    size={28}
                                    className="text-[var(--color-brand-500)]"
                                />
                                <div className="text-center">
                                    <div className="text-sm font-medium text-fg">External live session</div>
                                    <div className="text-xs text-fg-muted">Opens in a new tab when students click "Join"</div>
                                </div>
                                <a
                                    href={previewLesson.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 text-xs text-brand hover:underline truncate max-w-full px-4">
                                    {previewLesson.externalUrl}
                                </a>
                            </div>
                            <div className="mt-3">
                                <div className="text-sm font-medium text-fg">{previewLesson.title}</div>
                                {previewLesson.description && (
                                    <p className="mt-2 text-sm text-fg-soft whitespace-pre-wrap">{previewLesson.description}</p>
                                )}
                            </div>
                        </>
                    ) : previewLesson?.type === 'TEXT' ? (
                        <>
                            <div className="aspect-video rounded-md bg-surface-2 border flex items-center justify-center">
                                <FileText
                                    size={32}
                                    className="text-fg-muted"
                                />
                            </div>
                            <div className="mt-3">
                                <div className="text-sm font-medium text-fg">{previewLesson.title}</div>
                                {previewLesson.description ? (
                                    <p className="mt-2 text-sm text-fg-soft whitespace-pre-wrap">{previewLesson.description}</p>
                                ) : (
                                    <p className="mt-2 text-xs text-fg-muted italic">
                                        No reading content yet — add it via Edit lesson.
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="aspect-video rounded-md bg-surface-2 border flex items-center justify-center text-fg-muted text-sm">
                            Select a lesson to preview
                        </div>
                    )}
                </Card>
            </div>

            )}

            {activeSection && lessonEditor !== null && (
                <LessonEditorModal
                    open={lessonEditor !== null}
                    mode={lessonEditor === 'new' ? 'create' : 'edit'}
                    lesson={lessonEditor === 'new' ? null : lessonEditor}
                    onClose={() => setLessonEditor(null)}
                    courseId={course.id}
                    section={activeSection}
                    tenantId={tenantId}
                />
            )}

            {sectionEditor !== null && (
                <SectionEditorModal
                    open={sectionEditor !== null}
                    mode={sectionEditor === 'new' ? 'create' : 'rename'}
                    initialTitle={sectionEditor === 'new' ? `Module ${sections.length + 1}` : sectionEditor.title}
                    isPending={addSectionMutation.isPending || renameSectionMutation.isPending}
                    onClose={() => setSectionEditor(null)}
                    onSubmit={(title) => {
                        if (sectionEditor === 'new') {
                            addSectionMutation.mutate(title, { onSuccess: () => setSectionEditor(null) })
                        } else {
                            renameSectionMutation.mutate(
                                { sectionId: sectionEditor.id, title },
                                { onSuccess: () => setSectionEditor(null) }
                            )
                        }
                    }}
                />
            )}
        </>
    )
}

// -----------------------------------------------------------------------------
// Section editor modal — premium replacement for `window.prompt`. Used for
// both creating new sections and renaming existing ones; the only diff is
// the modal title + initial value.
// -----------------------------------------------------------------------------

const SectionEditorModal = ({
    open,
    mode,
    initialTitle,
    isPending,
    onClose,
    onSubmit
}: {
    open: boolean
    mode: 'create' | 'rename'
    initialTitle: string
    isPending: boolean
    onClose: () => void
    onSubmit: (title: string) => void
}) => {
    const [title, setTitle] = useState(initialTitle)
    useEffect(() => {
        if (open) setTitle(initialTitle)
    }, [open, initialTitle])

    const trimmed = title.trim()
    const valid = trimmed.length >= 1 && trimmed.length <= 200
    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!valid) return
        onSubmit(trimmed)
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === 'create' ? 'Add a new section' : 'Rename section'}
            description={
                mode === 'create'
                    ? 'Sections group lessons into a module — students see them as collapsible chapters.'
                    : 'Rename the chapter visible to students.'
            }
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        form="section-form"
                        type="submit"
                        loading={isPending}
                        disabled={!valid}>
                        {mode === 'create' ? 'Add section' : 'Save'}
                    </Button>
                </>
            }>
            <form
                id="section-form"
                onSubmit={submit}>
                <Input
                    label="Section title"
                    autoFocus
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Module 1 · Foundations"
                    hint="Up to 200 characters."
                />
            </form>
        </Modal>
    )
}

// -----------------------------------------------------------------------------
// Lesson type metadata — kept tiny so the curriculum row + the modal both
// pull from the same source of truth.
// -----------------------------------------------------------------------------

const LESSON_TYPE_LABEL: Record<LessonType, string> = {
    YOUTUBE: 'YouTube',
    EXTERNAL_LIVE: 'Live link',
    TEXT: 'Reading'
}

const LESSON_TYPE_DESCRIPTION: Record<LessonType, string> = {
    YOUTUBE: 'Embed a YouTube video. Players + completion tracking work out of the box.',
    EXTERNAL_LIVE: 'Link to a Zoom / Meet / external live session — opens in a new tab for students.',
    TEXT: 'Plain reading lesson. Add a description below; students mark it complete on their own.'
}

const LessonTypeIcon = ({ type, small = false }: { type: LessonType; small?: boolean }) => {
    const size = small ? 10 : 14
    if (type === 'YOUTUBE') return <Youtube size={size} className="text-[var(--color-brand-500)]" />
    if (type === 'EXTERNAL_LIVE') return <LinkIcon size={size} className="text-fg-muted" />
    return <FileText size={size} className="text-fg-muted" />
}

// -----------------------------------------------------------------------------
// Lesson editor modal — handles all three Phase-1 lesson types (YOUTUBE,
// EXTERNAL_LIVE, TEXT) and switches between create vs edit based on the
// `mode` prop. Backend service `createLesson` / `updateLesson` accept the
// same shape, so the form body is shared.
// -----------------------------------------------------------------------------

interface LessonEditorProps {
    open: boolean
    mode: 'create' | 'edit'
    /** Existing lesson when editing; null when creating. */
    lesson: TLesson | null
    onClose: () => void
    courseId: string
    section: TSection
    tenantId?: string
}

const LessonEditorModal = ({ open, mode, lesson, onClose, courseId, section, tenantId }: LessonEditorProps) => {
    const queryClient = useQueryClient()
    const [type, setType] = useState<LessonType>(lesson?.type ?? 'YOUTUBE')
    const [title, setTitle] = useState(lesson?.title ?? '')
    const [description, setDescription] = useState(lesson?.description ?? '')
    const [url, setUrl] = useState(
        lesson?.type === 'YOUTUBE' && lesson.youtubeId ? `https://youtu.be/${lesson.youtubeId}` : (lesson?.externalUrl ?? '')
    )
    const [duration, setDuration] = useState(lesson?.durationSec ? String(Math.round(lesson.durationSec / 60)) : '')
    const [freePreview, setFreePreview] = useState<boolean>(!!lesson?.freePreview)
    const [demoAccess, setDemoAccess] = useState<boolean>(!!lesson?.demoAccess)
    const [resources, setResources] = useState<TLessonResource[]>(lesson?.resources ?? [])
    const [error, setError] = useState<string | null>(null)

    // Reset every time the modal opens with a different lesson — otherwise
    // editing one lesson then opening another shows the previous values
    // briefly.
    useEffect(() => {
        if (!open) return
        setType(lesson?.type ?? 'YOUTUBE')
        setTitle(lesson?.title ?? '')
        setDescription(lesson?.description ?? '')
        setUrl(
            lesson?.type === 'YOUTUBE' && lesson.youtubeId
                ? `https://youtu.be/${lesson.youtubeId}`
                : (lesson?.externalUrl ?? '')
        )
        setDuration(lesson?.durationSec ? String(Math.round(lesson.durationSec / 60)) : '')
        setFreePreview(!!lesson?.freePreview)
        setDemoAccess(!!lesson?.demoAccess)
        setResources(lesson?.resources ?? [])
        setError(null)
    }, [open, lesson])

    const videoId = useMemo(() => (type === 'YOUTUBE' ? parseYouTubeId(url) : null), [type, url])

    const validate = (): { ok: true } | { ok: false; message: string } => {
        if (title.trim().length < 2) return { ok: false, message: 'Lesson title is required.' }
        if (type === 'YOUTUBE' && !videoId) return { ok: false, message: "That doesn't look like a YouTube URL or video ID." }
        if (type === 'EXTERNAL_LIVE') {
            const trimmed = url.trim()
            if (!trimmed) return { ok: false, message: 'Add the live-session URL students should join.' }
            try {
                new URL(trimmed)
            } catch {
                return { ok: false, message: 'Live-session URL must be a valid http(s) link.' }
            }
        }
        return { ok: true }
    }

    const buildPayload = () => {
        const durationSec = duration ? Math.max(0, Math.round(Number(duration) * 60)) : 0
        return {
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            youtubeId: type === 'YOUTUBE' ? (videoId ?? undefined) : undefined,
            externalUrl: type === 'EXTERNAL_LIVE' ? url.trim() : undefined,
            durationSec,
            freePreview,
            demoAccess,
            // Drop resources with no URL — empty rows from a half-typed entry.
            resources: resources.filter((r) => r.url.trim().length > 0)
        }
    }

    const mutation = useMutation({
        mutationFn: () => {
            const payload = buildPayload()
            if (mode === 'edit' && lesson) {
                return updateLesson(courseId, lesson.id, payload, tenantId)
            }
            return createLesson(
                courseId,
                {
                    sectionId: section.id,
                    ...payload,
                    order: section.lessons.length
                },
                tenantId
            )
        },
        onSuccess: () => {
            toast.success(mode === 'edit' ? 'Lesson updated' : 'Lesson added')
            void queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
            onClose()
        },
        onError: (e: unknown) => setError(toApiError(e).message || 'Could not save lesson')
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const v = validate()
        if (!v.ok) return setError(v.message)
        setError(null)
        mutation.mutate()
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit lesson' : 'Add a lesson'}
            description={LESSON_TYPE_DESCRIPTION[type]}
            size="lg"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        form="lesson-form"
                        type="submit"
                        loading={mutation.isPending}>
                        {mode === 'edit' ? 'Save changes' : 'Add lesson'}
                    </Button>
                </>
            }>
            <form
                id="lesson-form"
                onSubmit={submit}
                className="space-y-4">
                {/* Type picker — three pill buttons, locked once a lesson is
                    saved so the type can't accidentally flip and orphan the
                    youtubeId / externalUrl fields. */}
                <div>
                    <label className="block text-xs font-medium text-fg-soft mb-1.5">Lesson type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['YOUTUBE', 'EXTERNAL_LIVE', 'TEXT'] as LessonType[]).map((t) => {
                            const active = type === t
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={cn(
                                        'rounded-md border p-3 text-left transition-colors',
                                        active
                                            ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]'
                                            : 'border-[var(--color-border)] hover:bg-surface-hover'
                                    )}>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-fg">
                                        <LessonTypeIcon type={t} />
                                        {LESSON_TYPE_LABEL[t]}
                                    </div>
                                    <div className="text-[11px] text-fg-muted mt-0.5">
                                        {t === 'YOUTUBE' && 'Embedded video'}
                                        {t === 'EXTERNAL_LIVE' && 'Zoom / Meet'}
                                        {t === 'TEXT' && 'Reading lesson'}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <Input
                    label="Lesson title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. What is system design? · Intro + mindset"
                />

                {type === 'YOUTUBE' && (
                    <Input
                        label="YouTube URL or video ID"
                        required
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value)
                            setError(null)
                        }}
                        placeholder="https://youtu.be/… · https://youtube.com/watch?v=…"
                        error={error && !videoId ? error : undefined}
                        hint="Supports watch URLs, youtu.be short links, /embed/, /shorts/, or a bare 11-char ID."
                    />
                )}

                {type === 'EXTERNAL_LIVE' && (
                    <Input
                        label="Live-session URL"
                        required
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value)
                            setError(null)
                        }}
                        placeholder="https://meet.google.com/abc-defg-hij"
                        error={error && !url.trim() ? error : undefined}
                        hint="Students click a Join button that opens this URL in a new tab."
                    />
                )}

                <Textarea
                    label={type === 'TEXT' ? 'Reading body' : 'Description (optional)'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={type === 'TEXT' ? 8 : 3}
                    placeholder={
                        type === 'TEXT'
                            ? 'Write the reading content. Markdown-style line breaks are preserved.'
                            : 'Optional notes shown beneath the player.'
                    }
                />

                <Input
                    label="Duration · minutes (optional)"
                    type="number"
                    min={0}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    hint="Used in the curriculum and student progress tracker."
                />

                {/* Free preview — surfaces this lesson outside the paywall on
                    the public course page so prospects can sample one or two
                    videos before paying. Toggle is per-lesson; sections stay
                    inside the paywall regardless. */}
                <label className="flex items-start gap-3 rounded-md border border-[var(--color-border)] p-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={freePreview}
                        onChange={(e) => setFreePreview(e.target.checked)}
                        className="mt-0.5 accent-[var(--color-brand-500)]"
                    />
                    <span>
                        <span className="text-sm font-medium text-fg block">Free preview</span>
                        <span className="text-xs text-fg-muted block mt-0.5">
                            Anyone can watch this lesson on the public course detail page, without enrolling. Use it as a sample
                            for one or two lessons per course.
                        </span>
                    </span>
                </label>

                {/* Demo access — distinct from free preview. Free preview is
                    for anonymous traffic on the marketing site; demo access
                    gates DEMO-tier enrolments (registration-fee students)
                    inside the dashboard. A lesson can be one, both, or
                    neither. */}
                <label className="flex items-start gap-3 rounded-md border border-[var(--color-border)] p-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={demoAccess}
                        onChange={(e) => setDemoAccess(e.target.checked)}
                        className="mt-0.5 accent-[var(--color-warn,#f59e0b)]"
                    />
                    <span>
                        <span className="text-sm font-medium text-fg block">Available in demo</span>
                        <span className="text-xs text-fg-muted block mt-0.5">
                            DEMO-tier students (paid registration only) can open this lesson, on top of the course's default
                            demo lesson count.
                        </span>
                    </span>
                </label>

                {/* Resources — light-weight attachment list (URL + label).
                    Resources usually live on Drive / S3, so we capture the
                    public URL here rather than implementing in-platform
                    file upload. */}
                <div>
                    <label className="block text-xs font-medium text-fg-soft mb-2">Resources (optional)</label>
                    {resources.length > 0 && (
                        <ul className="space-y-2 mb-2">
                            {resources.map((r, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-2">
                                    <Input
                                        value={r.label ?? ''}
                                        onChange={(e) =>
                                            setResources((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))
                                        }
                                        placeholder="Label (e.g. Cheatsheet PDF)"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={r.url}
                                        onChange={(e) =>
                                            setResources((prev) => prev.map((x, idx) => (idx === i ? { ...x, url: e.target.value } : x)))
                                        }
                                        placeholder="https://…"
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setResources((prev) => prev.filter((_, idx) => idx !== i))}
                                        aria-label="Remove resource"
                                        className="p-1.5 rounded text-fg-muted hover:text-[var(--color-danger)]">
                                        <CloseIcon size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Plus size={12} />}
                        disabled={resources.length >= 10}
                        onClick={() => setResources((prev) => [...prev, { url: '', label: '', type: 'link' }])}>
                        Add resource
                    </Button>
                </div>

                {error && type !== 'YOUTUBE' && type !== 'EXTERNAL_LIVE' && (
                    <p className="text-sm text-[var(--color-danger)]">{error}</p>
                )}

                {type === 'YOUTUBE' && videoId && (
                    <div className="rounded-md border p-3 bg-surface-2">
                        <div className="text-xs text-fg-muted mb-2 font-medium flex items-center gap-1.5">
                            <Youtube size={12} className="text-[var(--color-brand-500)]" /> Preview · youtu.be/{videoId}
                        </div>
                        <YouTubePlayer
                            videoId={videoId}
                            title={title || 'Preview'}
                        />
                    </div>
                )}
            </form>
        </Modal>
    )
}

// -----------------------------------------------------------------------------
// Course settings panel — every course-level field the backend supports
// (title, slug, description, thumbnailUrl, price/currency/GST, tags). All
// edits go through one PATCH on Save; we keep optimistic invalidation so
// the cards on /app/courses re-render without a manual refresh.
// -----------------------------------------------------------------------------

// Form state mirrors the editable fields. Strings for numeric inputs (so
// users can clear them mid-edit); "" → 0 on save. Date fields are stored
// as `YYYY-MM-DD` (the value an HTML5 date input emits) and converted to
// ISO at save time so the backend can shove them into Prisma DateTime.
interface CourseFormState {
    title: string
    subtitle: string
    slug: string
    description: string
    thumbnailUrl: string
    heroUrl: string
    priceRupees: string
    currency: string
    gstPercent: string
    tags: string[]
    level: import('../services/course.service').CourseLevel
    language: string
    outcomes: string[]
    prerequisites: string[]
    audience: string[]
    enrolmentCap: string
    startsAt: string
    endsAt: string
    certificateEnabled: boolean
    certificateTemplate: string
    // Demo gating — controls what registration-fee students can access.
    demoEnabled: boolean
    demoLessonDefault: string
    demoExpiryDays: string
}

const dateToInput = (iso: string | null | undefined): string => {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
}

const fromCourse = (c: NonNullable<ReturnType<typeof getCourse> extends Promise<infer R> ? R : never>): CourseFormState => ({
    title: c.title,
    subtitle: c.subtitle ?? '',
    slug: c.slug,
    description: c.description ?? '',
    thumbnailUrl: c.thumbnailUrl ?? '',
    heroUrl: c.heroUrl ?? '',
    priceRupees: String(Math.round((c.price ?? 0) / 100)),
    currency: c.currency ?? 'INR',
    gstPercent: String(c.gstPercent ?? 18),
    tags: c.tags ?? [],
    level: c.level ?? 'ALL_LEVELS',
    language: c.language ?? 'en',
    outcomes: c.outcomes ?? [],
    prerequisites: c.prerequisites ?? [],
    audience: c.audience ?? [],
    enrolmentCap: c.enrolmentCap == null ? '' : String(c.enrolmentCap),
    startsAt: dateToInput(c.startsAt),
    endsAt: dateToInput(c.endsAt),
    certificateEnabled: !!c.certificateEnabled,
    certificateTemplate: c.certificateTemplate ?? '',
    demoEnabled: c.demoEnabled !== false,
    demoLessonDefault: String(c.demoLessonDefault ?? 3),
    demoExpiryDays: c.demoExpiryDays == null ? '' : String(c.demoExpiryDays)
})

const CourseSettingsPanel = ({
    course,
    tenantId
}: {
    course: NonNullable<ReturnType<typeof getCourse> extends Promise<infer R> ? R : never>
    tenantId?: string
}) => {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<CourseFormState>(() => fromCourse(course))
    const [tagDraft, setTagDraft] = useState('')

    // Re-sync the form whenever the upstream course query refreshes (e.g.
    // after a successful save it invalidates → useQuery returns new data).
    useEffect(() => {
        setForm(fromCourse(course))
    }, [course])

    const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(fromCourse(course)), [form, course])

    const saveMutation = useMutation({
        mutationFn: () => {
            const priceMinor = Math.max(0, Math.round(Number(form.priceRupees || 0) * 100))
            const gst = Math.max(0, Math.min(28, Math.round(Number(form.gstPercent || 0))))
            // Convert YYYY-MM-DD → full ISO at midnight UTC (the only
            // representation Prisma DateTime accepts via REST). Empty
            // string clears the field.
            const toIsoOrNull = (v: string): string | null => (v ? new Date(`${v}T00:00:00.000Z`).toISOString() : null)
            const cap = form.enrolmentCap.trim() === '' ? null : Math.max(0, Math.round(Number(form.enrolmentCap)))
            return updateCourse(
                course.id,
                {
                    title: form.title.trim(),
                    subtitle: form.subtitle.trim() || undefined,
                    slug: form.slug.trim(),
                    description: form.description.trim() || undefined,
                    thumbnailUrl: form.thumbnailUrl.trim() || undefined,
                    heroUrl: form.heroUrl.trim() || undefined,
                    price: priceMinor,
                    currency: form.currency.trim().toUpperCase() || 'INR',
                    gstPercent: gst,
                    tags: form.tags,
                    level: form.level,
                    language: form.language.trim() || 'en',
                    outcomes: form.outcomes,
                    prerequisites: form.prerequisites,
                    audience: form.audience,
                    enrolmentCap: cap,
                    startsAt: toIsoOrNull(form.startsAt),
                    endsAt: toIsoOrNull(form.endsAt),
                    certificateEnabled: form.certificateEnabled,
                    certificateTemplate: form.certificateTemplate.trim() || null,
                    demoEnabled: form.demoEnabled,
                    demoLessonDefault: Math.max(0, Math.min(500, Math.round(Number(form.demoLessonDefault) || 0))),
                    demoExpiryDays:
                        form.demoExpiryDays.trim() === '' ? null : Math.max(0, Math.min(365, Math.round(Number(form.demoExpiryDays))))
                },
                tenantId
            )
        },
        onSuccess: () => {
            toast.success('Course settings saved')
            void queryClient.invalidateQueries({ queryKey: ['courses', course.id] })
            void queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (e: unknown) => toast.error(toApiError(e).message || 'Could not save')
    })

    const addTag = () => {
        const next = tagDraft.trim()
        if (!next) return
        if (form.tags.includes(next)) {
            setTagDraft('')
            return
        }
        setForm((f) => ({ ...f, tags: [...f.tags, next] }))
        setTagDraft('')
    }
    const removeTag = (t: string) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))

    return (
        <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
            <div className="space-y-4">
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Branding</h3>
                    <p className="text-xs text-fg-muted mb-4">
                        Catalog card thumbnail + larger hero on the course detail page. Title, subtitle and slug all flow into
                        the public route /programs/&lt;slug&gt;.
                    </p>

                    <div className="grid sm:grid-cols-[180px_1fr] gap-4">
                        <ThumbnailPreview url={form.thumbnailUrl} />
                        <div className="space-y-3">
                            <Input
                                label="Thumbnail URL"
                                value={form.thumbnailUrl}
                                onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                                placeholder="https://images.unsplash.com/…"
                                hint="Wide aspect ratios (16:9 / 5:4) read best on the catalog cards."
                                leftIcon={<ImageIcon size={14} />}
                            />
                            <Input
                                label="Title"
                                required
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            />
                            <Input
                                label="Subtitle (one-liner)"
                                value={form.subtitle}
                                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                                placeholder="Turn business problems into data-driven decisions"
                                hint="Shown under the title on the catalog and detail hero."
                            />
                            <Input
                                label="Slug"
                                required
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
                                    }))
                                }
                                hint="Lowercase letters, digits, dashes. Used in the public URL."
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-[180px_1fr] gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                        <ThumbnailPreview url={form.heroUrl} />
                        <div className="space-y-3">
                            <Input
                                label="Hero image URL (optional)"
                                value={form.heroUrl}
                                onChange={(e) => setForm((f) => ({ ...f, heroUrl: e.target.value }))}
                                placeholder="https://…"
                                hint="Wide banner shown on the course detail page. Leave blank to reuse the thumbnail."
                                leftIcon={<ImageIcon size={14} />}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    label="Level"
                                    value={form.level}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            level: e.target.value as CourseFormState['level']
                                        }))
                                    }>
                                    <option value="ALL_LEVELS">All levels</option>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </Select>
                                <Input
                                    label="Language"
                                    value={form.language}
                                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                                    placeholder="en"
                                    hint="ISO-639-1 code (en, hi, …)."
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">About this course</h3>
                    <p className="text-xs text-fg-muted mb-4">Long-form description shown on the course page + the public catalog.</p>
                    <Textarea
                        label="Description"
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        rows={6}
                        placeholder="Who the course is for, what students will build, what they'll know by the end."
                        hint="Up to 5,000 characters. Plain text — no HTML."
                    />
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Pricing</h3>
                    <p className="text-xs text-fg-muted mb-4">
                        Stored server-side in the smallest currency unit. GST is charged on top of the listed price at checkout.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <Input
                            label="Price"
                            type="number"
                            min={0}
                            value={form.priceRupees}
                            onChange={(e) => setForm((f) => ({ ...f, priceRupees: e.target.value }))}
                            leftIcon={<DollarSign size={14} />}
                            hint="Set 0 for a free course."
                        />
                        <Select
                            label="Currency"
                            value={form.currency}
                            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                            <option value="INR">INR · ₹</option>
                            <option value="USD">USD · $</option>
                            <option value="EUR">EUR · €</option>
                            <option value="GBP">GBP · £</option>
                        </Select>
                        <Input
                            label="GST %"
                            type="number"
                            min={0}
                            max={28}
                            value={form.gstPercent}
                            onChange={(e) => setForm((f) => ({ ...f, gstPercent: e.target.value }))}
                            hint="0–28. India default is 18."
                        />
                    </div>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Tags</h3>
                    <p className="text-xs text-fg-muted mb-4">Surface in search and filter chips on the catalog.</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {form.tags.length === 0 && <span className="text-xs text-fg-muted italic">No tags yet</span>}
                        {form.tags.map((t) => (
                            <span
                                key={t}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] px-2.5 py-1 text-xs font-medium">
                                <TagIcon size={11} /> {t}
                                <button
                                    type="button"
                                    onClick={() => removeTag(t)}
                                    aria-label={`Remove tag ${t}`}
                                    className="hover:text-fg">
                                    <CloseIcon size={11} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={tagDraft}
                            onChange={(e) => setTagDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault()
                                    addTag()
                                }
                            }}
                            placeholder="Type a tag and press Enter"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={addTag}
                            disabled={!tagDraft.trim()}>
                            Add
                        </Button>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">What students will learn / get</h3>
                    <p className="text-xs text-fg-muted mb-4">
                        Bullet lists rendered on the course detail hero. Keep entries to one-liners.
                    </p>
                    <div className="space-y-5">
                        <BulletListEditor
                            label="Learning outcomes"
                            placeholder="e.g. Build dashboards in Power BI from scratch"
                            items={form.outcomes}
                            onChange={(next) => setForm((f) => ({ ...f, outcomes: next }))}
                        />
                        <BulletListEditor
                            label="Prerequisites"
                            placeholder="e.g. Basic SQL knowledge"
                            items={form.prerequisites}
                            onChange={(next) => setForm((f) => ({ ...f, prerequisites: next }))}
                        />
                        <BulletListEditor
                            label="Target audience"
                            placeholder="e.g. Working analysts moving into data science"
                            items={form.audience}
                            onChange={(next) => setForm((f) => ({ ...f, audience: next }))}
                        />
                    </div>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Enrolment window</h3>
                    <p className="text-xs text-fg-muted mb-4">
                        Set a cohort start/end and an optional cap. The public Razorpay checkout refuses purchases outside the
                        window or once the cap is reached.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <Input
                            label="Max students (optional)"
                            type="number"
                            min={0}
                            value={form.enrolmentCap}
                            onChange={(e) => setForm((f) => ({ ...f, enrolmentCap: e.target.value }))}
                            placeholder="Leave blank for unlimited"
                        />
                        <Input
                            label="Starts on"
                            type="date"
                            value={form.startsAt}
                            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                        />
                        <Input
                            label="Ends on"
                            type="date"
                            value={form.endsAt}
                            onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                        />
                    </div>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Certificate</h3>
                    <p className="text-xs text-fg-muted mb-4">
                        Issue a verifiable certificate when a student hits 100% lesson completion. Template selection is reserved
                        for a future template registry — for now the platform default ships.
                    </p>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.certificateEnabled}
                            onChange={(e) => setForm((f) => ({ ...f, certificateEnabled: e.target.checked }))}
                            className="accent-[var(--color-brand-500)]"
                        />
                        <span className="text-sm text-fg">Issue a certificate on completion</span>
                    </label>
                    {form.certificateEnabled && (
                        <Input
                            className="mt-3"
                            label="Template (optional)"
                            value={form.certificateTemplate}
                            onChange={(e) => setForm((f) => ({ ...f, certificateTemplate: e.target.value }))}
                            placeholder="default"
                            hint="Free-form key. Leave blank to use the platform default."
                        />
                    )}
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Demo access</h3>
                    <p className="text-xs text-fg-muted mb-4">
                        Controls what registration-fee students can open before they pay the full course fee. Per-lesson and
                        per-section demo toggles below override this default.
                    </p>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.demoEnabled}
                            onChange={(e) => setForm((f) => ({ ...f, demoEnabled: e.target.checked }))}
                            className="accent-[var(--color-brand-500)]"
                        />
                        <span className="text-sm text-fg">Allow DEMO students to preview lessons</span>
                    </label>
                    {form.demoEnabled && (
                        <div className="grid sm:grid-cols-2 gap-3 mt-4">
                            <Input
                                type="number"
                                min={0}
                                label="Default demo lesson count"
                                value={form.demoLessonDefault}
                                onChange={(e) => setForm((f) => ({ ...f, demoLessonDefault: e.target.value }))}
                                hint="How many lessons unlock by default. Trainer-marked demo lessons unlock on top of this."
                            />
                            <Input
                                type="number"
                                min={0}
                                label="Demo expiry (days, optional)"
                                value={form.demoExpiryDays}
                                onChange={(e) => setForm((f) => ({ ...f, demoExpiryDays: e.target.value }))}
                                placeholder="No expiry"
                                hint="Demo locks N days after enrolment. Leave blank to keep demo open until full payment."
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Right rail: status + save + meta */}
            <div className="space-y-4 lg:sticky lg:top-4">
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Status</h3>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-fg-soft">Publish state</span>
                        <Badge tone={course.publishState === 'PUBLISHED' ? 'ok' : 'default'}>
                            {course.publishState ?? 'DRAFT'}
                        </Badge>
                    </div>
                    <p className="text-[11px] text-fg-muted mt-3">
                        Use the Publish button in the header to flip between draft and live. Drafts are hidden from the public
                        catalog and the student dashboard.
                    </p>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Trainer</h3>
                    <p className="text-xs text-fg-muted mt-2">
                        {course.trainer
                            ? `${course.trainer.firstName ?? ''} ${course.trainer.lastName ?? ''}`.trim() || '—'
                            : 'Not assigned'}
                    </p>
                    <p className="text-[11px] text-fg-muted mt-3">
                        Trainer assignment is managed from the Users page — invite a TRAINER, then attach them to the course.
                    </p>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-1">Meta</h3>
                    <ul className="text-xs text-fg-soft space-y-1.5 mt-2">
                        <li className="flex items-center justify-between">
                            <span className="text-fg-muted">Course ID</span>
                            <span className="font-mono text-[11px] truncate max-w-[160px]">{course.id}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-fg-muted">Enrolments</span>
                            <span className="font-mono">{course.enrolledCount ?? 0}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-fg-muted inline-flex items-center gap-1">
                                <Calendar size={11} /> Slug
                            </span>
                            <span className="font-mono text-[11px] truncate max-w-[160px]">/{course.slug}</span>
                        </li>
                    </ul>
                </Card>

                <Button
                    className="w-full"
                    leftIcon={<Save size={14} />}
                    disabled={!dirty}
                    loading={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}>
                    {dirty ? 'Save changes' : 'Saved'}
                </Button>
            </div>
        </div>
    )
}

// Bullet-list editor used for outcomes / prerequisites / audience. Each
// entry sits in its own input so the order is obvious and removal is one
// click. New entries are added via the "Add" row which keeps the existing
// Enter-to-add affordance for keyboard users.
const BulletListEditor = ({
    label,
    items,
    onChange,
    placeholder
}: {
    label: string
    items: string[]
    onChange: (next: string[]) => void
    placeholder?: string
}) => {
    const [draft, setDraft] = useState('')
    const add = () => {
        const next = draft.trim()
        if (!next) return
        onChange([...items, next])
        setDraft('')
    }
    const updateAt = (i: number, value: string) => onChange(items.map((it, idx) => (idx === i ? value : it)))
    const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i))
    return (
        <div>
            <label className="block text-xs font-medium text-fg-soft mb-2">{label}</label>
            {items.length > 0 && (
                <ul className="space-y-2 mb-2">
                    {items.map((it, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-2">
                            <span className="text-xs text-fg-muted w-5 text-right font-mono">{i + 1}.</span>
                            <input
                                value={it}
                                onChange={(e) => updateAt(i, e.target.value)}
                                className="flex-1 rounded-md border border-[var(--color-border)] bg-surface px-2.5 py-1.5 text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(i)}
                                className="p-1.5 rounded text-fg-muted hover:text-[var(--color-danger)]"
                                aria-label="Remove item">
                                <CloseIcon size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex items-center gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            add()
                        }
                    }}
                    placeholder={placeholder ?? 'Type and press Enter'}
                    className="flex-1 rounded-md border border-[var(--color-border)] bg-surface px-2.5 py-1.5 text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)]"
                />
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={add}
                    disabled={!draft.trim()}>
                    Add
                </Button>
            </div>
        </div>
    )
}

// Thumbnail preview — handles broken/empty URLs gracefully so trainers can
// see WHY their thumbnail isn't showing on the catalog (404 vs missing).
const ThumbnailPreview = ({ url }: { url: string }) => {
    const [ok, setOk] = useState(true)
    useEffect(() => setOk(true), [url])
    return (
        <div className="aspect-video w-full rounded-md border bg-surface-2 overflow-hidden flex items-center justify-center">
            {url && ok ? (
                <img
                    src={url}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={() => setOk(false)}
                />
            ) : (
                <div className="text-center px-3">
                    <ImageIcon
                        size={26}
                        className="text-fg-muted mx-auto mb-1"
                    />
                    <p className="text-[11px] text-fg-muted">{url ? 'Image failed to load' : 'No thumbnail set'}</p>
                </div>
            )}
        </div>
    )
}
