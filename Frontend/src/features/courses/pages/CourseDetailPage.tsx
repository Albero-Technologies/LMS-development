import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    Play,
    CheckCircle2,
    Circle,
    ArrowLeft,
    Youtube,
    Wrench,
    FileText,
    LinkIcon,
    ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'
import { useCourseStore } from '../stores/courseStore'
import { YouTubePlayer } from '../components/YouTubePlayer'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'

const LESSON_ICON = {
    youtube: Youtube,
    pdf: FileText,
    link: LinkIcon
} as const

export const CourseDetailPage = () => {
    const { id = '' } = useParams()
    const course = useCourseStore((s) => s.courses.find((c) => c.id === id))
    const markComplete = useCourseStore((s) => s.markLessonComplete)

    const user = useAuthStore((s) => s.user)
    const canEdit = user && [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER].includes(user.role as never)

    const flatLessons = useMemo(() => {
        if (!course) return [] as { sectionId: string; lessonId: string }[]
        return course.sections.flatMap((sec) => sec.lessons.map((l) => ({ sectionId: sec.id, lessonId: l.id })))
    }, [course])

    const [activeLesson, setActiveLesson] = useState<{ sectionId: string; lessonId: string } | null>(null)

    // Default to the first lesson available.
    const current = activeLesson ?? flatLessons[0] ?? null
    const currentLesson = useMemo(() => {
        if (!course || !current) return null
        const sec = course.sections.find((s) => s.id === current.sectionId)
        return sec?.lessons.find((l) => l.id === current.lessonId) ?? null
    }, [course, current])

    const totalLessons = flatLessons.length
    const completedLessons = course?.sections.reduce((n, s) => n + s.lessons.filter((l) => l.completed).length, 0) ?? 0
    const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)

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
                    description="It may have been deleted or you don't have access."
                    action={
                        <Link to="/app/courses">
                            <Button>Back to catalog</Button>
                        </Link>
                    }
                />
            </>
        )
    }

    const toggleComplete = () => {
        if (!current || !currentLesson) return
        markComplete(course.id, current.sectionId, current.lessonId, !currentLesson.completed)
        if (!currentLesson.completed) toast.success('Lesson marked complete')
    }

    return (
        <>
            <Link
                to="/app/courses"
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> All courses
            </Link>
            <PageHeader
                eyebrow={`Course · ${course.slug}`}
                title={course.title}
                description={course.description}
                actions={
                    <>
                        {canEdit && (
                            <Link to={`/app/courses/${course.id}/builder`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Wrench size={14} />}>
                                    Edit curriculum
                                </Button>
                            </Link>
                        )}
                        <Button
                            size="sm"
                            onClick={() => toast.success(`Enrolled — ₹${course.price.toLocaleString('en-IN')} charged (demo).`)}>
                            Enroll · ₹{course.price.toLocaleString('en-IN')}
                        </Button>
                    </>
                }
            />

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card padded={false}>
                        {currentLesson?.kind === 'youtube' && currentLesson.youtubeId ? (
                            <>
                                <YouTubePlayer
                                    videoId={currentLesson.youtubeId}
                                    title={currentLesson.title}
                                    autoplay={false}
                                />
                                <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
                                    <div>
                                        <div className="text-xs text-fg-muted font-medium">Now playing</div>
                                        <div className="text-base font-semibold text-fg">{currentLesson.title}</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={currentLesson.completed ? 'subtle' : 'primary'}
                                        leftIcon={
                                            currentLesson.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />
                                        }
                                        onClick={toggleComplete}>
                                        {currentLesson.completed ? 'Completed' : 'Mark complete'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="aspect-video bg-surface-2 flex items-center justify-center">
                                <div className="text-center px-6">
                                    <div className="mx-auto w-14 h-14 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center mb-4">
                                        <Play
                                            size={22}
                                            className="ml-1"
                                        />
                                    </div>
                                    <div className="text-sm text-fg-soft">
                                        No lessons yet.{' '}
                                        {canEdit ? (
                                            <Link
                                                to={`/app/courses/${course.id}/builder`}
                                                className="text-brand hover:underline">
                                                Open the builder
                                            </Link>
                                        ) : (
                                            'Check back when your trainer publishes content.'
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-fg">Curriculum</h2>
                            <span className="text-xs text-fg-muted font-mono">
                                {completedLessons}/{totalLessons} lessons
                            </span>
                        </div>

                        {course.sections.length === 0 ? (
                            <div className="text-sm text-fg-muted py-6 text-center">
                                The trainer hasn't added any sections yet.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {course.sections.map((sec) => (
                                    <div key={sec.id}>
                                        <h3 className="text-xs uppercase tracking-wider text-fg-muted font-medium mb-2">
                                            {sec.title}
                                        </h3>
                                        {sec.lessons.length === 0 ? (
                                            <div className="text-xs text-fg-muted px-3 py-4 border border-dashed rounded-md">
                                                No lessons in this section yet.
                                            </div>
                                        ) : (
                                            <ul className="border rounded-md overflow-hidden divide-y">
                                                {sec.lessons.map((l) => {
                                                    const Icon = LESSON_ICON[l.kind] ?? Play
                                                    const isActive =
                                                        current?.sectionId === sec.id && current.lessonId === l.id
                                                    return (
                                                        <li
                                                            key={l.id}
                                                            className={cn(
                                                                'flex items-center gap-3 px-3 py-2.5 transition-colors',
                                                                isActive && 'bg-[var(--color-brand-50)]'
                                                            )}>
                                                            <LessonTick completed={!!l.completed} />
                                                            <Icon
                                                                size={14}
                                                                className="text-fg-muted shrink-0"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setActiveLesson({
                                                                        sectionId: sec.id,
                                                                        lessonId: l.id
                                                                    })
                                                                }
                                                                className={cn(
                                                                    'flex-1 text-left text-sm truncate transition-colors',
                                                                    isActive
                                                                        ? 'text-[var(--color-brand-700)] font-medium'
                                                                        : 'text-fg hover:text-brand'
                                                                )}>
                                                                {l.title}
                                                            </button>
                                                            {l.durationMin ? (
                                                                <span className="text-xs text-fg-muted font-mono">
                                                                    {l.durationMin}m
                                                                </span>
                                                            ) : null}
                                                            <ChevronRight
                                                                size={14}
                                                                className="text-fg-muted"
                                                            />
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <aside className="space-y-4">
                    <Card>
                        <h3 className="text-base font-semibold text-fg mb-3">Your progress</h3>
                        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-[var(--color-brand-500)] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-fg-muted">{progress}% complete</span>
                            <span className="text-fg-muted font-mono">
                                {completedLessons}/{totalLessons}
                            </span>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-base font-semibold text-fg mb-3">What you'll learn</h3>
                        <ul className="space-y-2 text-sm text-fg-soft">
                            <Bullet>Ship production systems that scale past 1M MAU.</Bullet>
                            <Bullet>Pick the right storage for a given query.</Bullet>
                            <Bullet>Defend choices under load and outages.</Bullet>
                        </ul>
                    </Card>

                    <Card>
                        <h3 className="text-base font-semibold text-fg mb-3">Meta</h3>
                        <div className="space-y-2.5 text-sm">
                            <Row
                                label="Sections"
                                value={String(course.sections.length)}
                            />
                            <Row
                                label="Lessons"
                                value={String(totalLessons)}
                            />
                            <Row
                                label="Enrolled"
                                value={`${course.enrolledCount}`}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-fg-muted">Certificate</span>
                                <Badge tone="brand">Verified URL</Badge>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </>
    )
}

const LessonTick = ({ completed }: { completed: boolean }) =>
    completed ? (
        <CheckCircle2
            size={16}
            className="text-[var(--color-success)] shrink-0"
        />
    ) : (
        <Circle
            size={16}
            className="text-fg-muted shrink-0"
        />
    )

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-fg-muted">{label}</span>
        <span className="font-medium text-fg font-mono">{value}</span>
    </div>
)

const Bullet = ({ children }: { children: ReactNode }) => (
    <li className="flex gap-2">
        <CheckCircle2
            size={14}
            className="mt-0.5 text-[var(--color-success)] shrink-0"
        />
        <span>{children}</span>
    </li>
)
