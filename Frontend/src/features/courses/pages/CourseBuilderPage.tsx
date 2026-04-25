import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Youtube, Trash2, Eye, GripVertical, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Modal } from '@shared/components/ui/Modal'
import { cn } from '@shared/helpers/cn'
import { useCourseStore, type TSection } from '../stores/courseStore'
import { YouTubePlayer } from '../components/YouTubePlayer'
import { parseYouTubeId, youtubeThumbUrl } from '../helpers/youtube'

export const CourseBuilderPage = () => {
    const { id = '' } = useParams()
    const course = useCourseStore((s) => s.courses.find((c) => c.id === id))

    const addSection = useCourseStore((s) => s.addSection)
    const renameSection = useCourseStore((s) => s.renameSection)
    const removeSection = useCourseStore((s) => s.removeSection)
    const removeLesson = useCourseStore((s) => s.removeLesson)
    const publish = useCourseStore((s) => s.publishCourse)

    const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
    const [previewLessonId, setPreviewLessonId] = useState<string | null>(null)
    const [lessonModalOpen, setLessonModalOpen] = useState(false)

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
                    description="It may have been deleted."
                />
            </>
        )
    }

    // Stay in sync with store changes.
    const activeSection: TSection | null = (activeSectionId && course.sections.find((s) => s.id === activeSectionId)) || course.sections[0] || null
    const previewLesson = activeSection?.lessons.find((l) => l.id === previewLessonId) ?? activeSection?.lessons[0]

    const handleAddSection = () => {
        const title = window.prompt('Section title', `Module ${course.sections.length + 1}`)?.trim()
        if (!title) return
        addSection(course.id, title)
    }

    const handleRenameSection = (sec: TSection) => {
        const title = window.prompt('Rename section', sec.title)?.trim()
        if (!title || title === sec.title) return
        renameSection(course.id, sec.id, title)
    }

    const handleRemoveSection = (sec: TSection) => {
        if (!window.confirm(`Delete section "${sec.title}" and all its lessons?`)) return
        removeSection(course.id, sec.id)
        if (activeSectionId === sec.id) setActiveSectionId(null)
    }

    const handleRemoveLesson = (sectionId: string, lessonId: string, title: string) => {
        if (!window.confirm(`Delete lesson "${title}"?`)) return
        removeLesson(course.id, sectionId, lessonId)
    }

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
                description="Add sections and YouTube lessons. Drag to reorder (coming soon). Students see changes instantly."
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
                            variant={course.isPublished ? 'subtle' : 'primary'}
                            onClick={() => {
                                publish(course.id, !course.isPublished)
                                toast.success(course.isPublished ? 'Course unpublished' : 'Course published — visible to students')
                            }}>
                            {course.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                    </>
                }
            />

            {/* 3-panel builder — sections | lessons | preview */}
            <div className="grid lg:grid-cols-[280px_1fr_340px] gap-4">
                {/* Sections panel */}
                <Card padded={false}>
                    <div className="p-4 flex items-center justify-between border-b">
                        <h3 className="text-sm font-semibold text-fg">Sections</h3>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Add section"
                            onClick={handleAddSection}>
                            <Plus size={14} />
                        </Button>
                    </div>
                    {course.sections.length === 0 ? (
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
                            {course.sections.map((sec) => (
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
                                        ✎
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
                                    {l.kind === 'youtube' && l.youtubeId ? (
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
                                                <Youtube size={10} /> YouTube
                                            </Badge>
                                            {l.durationMin ? (
                                                <span className="inline-flex items-center gap-1 font-mono">
                                                    <Clock size={10} /> {l.durationMin}m
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-1.5 rounded text-fg-muted hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveLesson(activeSection.id, l.id, l.title)
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
                    {previewLesson?.kind === 'youtube' && previewLesson.youtubeId ? (
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
                    sectionId={activeSection.id}
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
    sectionId
}: {
    open: boolean
    onClose: () => void
    courseId: string
    sectionId: string
}) => {
    const add = useCourseStore((s) => s.addYouTubeLesson)
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [duration, setDuration] = useState('')
    const [error, setError] = useState<string | null>(null)

    const videoId = parseYouTubeId(url)

    const reset = () => {
        setTitle('')
        setUrl('')
        setDuration('')
        setError(null)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const result = add(courseId, sectionId, {
            title: title.trim(),
            urlOrId: url,
            durationMin: duration ? Number(duration) : undefined
        })
        if (!result.ok) {
            setError(result.error)
            return
        }
        toast.success('Lesson added')
        reset()
        onClose()
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
