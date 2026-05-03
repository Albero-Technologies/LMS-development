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
import { ArrowLeft, Plus, Youtube, Trash2, Eye, GripVertical, Clock, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Modal } from '@shared/components/ui/Modal'
import { Skeleton } from '@shared/components/ui/Skeleton'
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
    updateSection,
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

    // Track which section is "active" (the one whose lessons fill the middle
    // pane) and which lesson is being previewed. Both default to the first
    // section / first lesson once data arrives.
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
    const [previewLessonId, setPreviewLessonId] = useState<string | null>(null)
    const [lessonModalOpen, setLessonModalOpen] = useState(false)

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

    const handleAddSection = () => {
        const title = window.prompt('Section title', `Module ${sections.length + 1}`)?.trim()
        if (!title) return
        addSectionMutation.mutate(title)
    }

    const handleRenameSection = (sec: TSection) => {
        const title = window.prompt('Rename section', sec.title)?.trim()
        if (!title || title === sec.title) return
        renameSectionMutation.mutate({ sectionId: sec.id, title })
    }

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
                to={`/app/courses/${course.id}`}
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> Back to course
            </Link>
            <PageHeader
                eyebrow="Course Builder"
                title={course.title}
                description="Add sections and YouTube lessons. Students see changes instantly."
                actions={
                    <>
                        <Link to={`/app/courses/${course.id}`}>
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
                                    className={cn(
                                        'group flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer transition-colors',
                                        activeSection?.id === sec.id ? 'bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover'
                                    )}
                                    onClick={() => setActiveSectionId(sec.id)}>
                                    <GripVertical
                                        size={14}
                                        className="text-fg-muted shrink-0 opacity-0 group-hover:opacity-100"
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
                            onClick={() => setLessonModalOpen(true)}>
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
                                description="Paste a YouTube URL and we'll turn it into an embeddable lesson."
                                action={
                                    <Button
                                        leftIcon={<Plus size={14} />}
                                        onClick={() => setLessonModalOpen(true)}>
                                        Add YouTube lesson
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {activeSection.lessons.map((l, i) => (
                                <li
                                    key={l.id}
                                    className={cn(
                                        'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                                        previewLesson?.id === l.id && 'bg-[var(--color-brand-50)]'
                                    )}
                                    onClick={() => setPreviewLessonId(l.id)}>
                                    <span className="font-mono text-xs text-fg-muted w-6 text-center">{i + 1}</span>
                                    {l.type === 'YOUTUBE' && l.youtubeId ? (
                                        <img
                                            src={youtubeThumbUrl(l.youtubeId)}
                                            alt=""
                                            className="w-16 h-10 object-cover rounded border"
                                        />
                                    ) : (
                                        <div className="w-16 h-10 rounded bg-surface-2 border flex items-center justify-center">
                                            <Youtube
                                                size={14}
                                                className="text-fg-muted"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-fg truncate">{l.title}</div>
                                        <div className="text-xs text-fg-muted flex items-center gap-2 mt-0.5">
                                            <Badge tone="brand">
                                                <Youtube size={10} /> {l.type}
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
                            </div>
                        </>
                    ) : (
                        <div className="aspect-video rounded-md bg-surface-2 border flex items-center justify-center text-fg-muted text-sm">
                            Select a lesson to preview
                        </div>
                    )}
                </Card>
            </div>

            {activeSection && (
                <AddYouTubeLessonModal
                    open={lessonModalOpen}
                    onClose={() => setLessonModalOpen(false)}
                    courseId={course.id}
                    section={activeSection}
                    tenantId={tenantId}
                />
            )}
        </>
    )
}

// -----------------------------------------------------------------------------
// Add YouTube lesson modal — live-parses the pasted URL and shows a preview
// thumbnail before the trainer commits. Supports plain video IDs too.
// -----------------------------------------------------------------------------

const AddYouTubeLessonModal = ({
    open,
    onClose,
    courseId,
    section,
    tenantId
}: {
    open: boolean
    onClose: () => void
    courseId: string
    section: TSection
    tenantId?: string
}) => {
    const queryClient = useQueryClient()
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [duration, setDuration] = useState('')
    const [error, setError] = useState<string | null>(null)

    const videoId = useMemo(() => parseYouTubeId(url), [url])

    const reset = () => {
        setTitle('')
        setUrl('')
        setDuration('')
        setError(null)
    }

    const mutation = useMutation({
        mutationFn: () => {
            if (!videoId) throw new Error("That doesn't look like a YouTube URL or video ID.")
            const durationSec = duration ? Math.max(0, Math.round(Number(duration) * 60)) : 0
            return createLesson(
                courseId,
                {
                    sectionId: section.id,
                    title: title.trim(),
                    type: 'YOUTUBE',
                    youtubeId: videoId,
                    durationSec,
                    order: section.lessons.length
                },
                tenantId
            )
        },
        onSuccess: () => {
            toast.success('Lesson added')
            void queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
            reset()
            onClose()
        },
        onError: (e: unknown) => setError(toApiError(e).message || 'Could not add lesson')
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!videoId) return setError("That doesn't look like a YouTube URL or video ID.")
        if (title.trim().length < 2) return setError('Lesson title is required')
        mutation.mutate()
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="Add a YouTube lesson"
            description="Paste any youtube.com or youtu.be URL. We'll embed it with an 11-char ID."
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
                        form="add-yt-form"
                        type="submit"
                        loading={mutation.isPending}
                        disabled={!videoId || title.trim().length < 2}>
                        Add lesson
                    </Button>
                </>
            }>
            <form
                id="add-yt-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Lesson title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. What is system design? · Intro + mindset"
                />
                <Input
                    label="YouTube URL or video ID"
                    required
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value)
                        setError(null)
                    }}
                    placeholder="https://youtu.be/… · https://youtube.com/watch?v=…"
                    error={error ?? undefined}
                    hint="Supports watch URLs, youtu.be short links, /embed/, /shorts/, or a bare 11-char ID."
                />
                <Input
                    label="Duration · minutes (optional)"
                    type="number"
                    min={0}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />

                {videoId && (
                    <div className="rounded-md border p-3 bg-surface-2">
                        <div className="text-xs text-fg-muted mb-2 font-medium flex items-center gap-1.5">
                            <Youtube
                                size={12}
                                className="text-[var(--color-brand-500)]"
                            />{' '}
                            Preview · youtu.be/{videoId}
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
