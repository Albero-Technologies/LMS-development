// Course detail page — YouTube-style layout: video player on the left, lesson
// list on the right. Loads the real backend course (was previously locked to
// the local Zustand store, which broke when the catalog moved to the backend
// and started returning real UUIDs the store didn't know about).
//
// Lesson progress (mark complete) hits the backend via the existing progress
// endpoint. Trainer/admin/SA still see an "Edit curriculum" button that drops
// into the local-store builder for now — the backend curriculum-edit flow is
// a separate piece of work.
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Play, CheckCircle2, Circle, ArrowLeft, Youtube, Wrench, FileText, LinkIcon, ChevronRight } from 'lucide-react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { cn } from '@shared/helpers/cn'
import { YouTubePlayer } from '../components/YouTubePlayer'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { getCourse, updateLessonProgress, type TLesson, type TSection } from '../services/course.service'
import { listMyEnrollments } from '../services/enrollment.service'

const LESSON_ICON: Record<string, typeof Youtube> = {
    YOUTUBE: Youtube,
    PDF: FileText,
    LINK: LinkIcon
}

export const CourseDetailPage = () => {
    const { id = '' } = useParams()
    const [params] = useSearchParams()
    // SUPER_ADMIN cross-tenant context. Coming from the catalog or builder
    // with `?tenantId=<id>` so the GET resolves against the right tenant.
    // Without it, an SA sitting on the platform tenant would 404 on every
    // course owned by a customer tenant.
    const tenantId = params.get('tenantId') ?? undefined
    const queryClient = useQueryClient()
    const courseQuery = useQuery({
        queryKey: ['courses', id, tenantId ?? 'self'],
        queryFn: () => getCourse(id, tenantId),
        enabled: id.length > 0,
        staleTime: 30_000,
        retry: false
    })
    const course = courseQuery.data

    const user = useAuthStore((s) => s.user)
    const canEdit = user && [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER].includes(user.role as never)
    const isStudent = user?.role === ROLES.STUDENT

    // Pull this student's enrolment so we know whether they own the course +
    // can credit progress against their enrolment record. Skipped for
    // staff (they're previewing, not learning).
    const enrollmentsQuery = useQuery({
        queryKey: ['enrollments', 'mine'],
        queryFn: listMyEnrollments,
        staleTime: 30_000,
        enabled: !!isStudent
    })
    const myEnrollment = useMemo(() => (enrollmentsQuery.data ?? []).find((e) => e.courseId === id) ?? null, [enrollmentsQuery.data, id])

    const sections: TSection[] = course?.sections ?? []
    const flatLessons = useMemo(() => sections.flatMap((sec) => sec.lessons.map((l) => ({ sectionId: sec.id, lessonId: l.id }))), [sections])

    const [activeLesson, setActiveLesson] = useState<{ sectionId: string; lessonId: string } | null>(null)
    // When the course loads, default to the first lesson if nothing is selected.
    useEffect(() => {
        if (!activeLesson && flatLessons.length > 0) setActiveLesson(flatLessons[0])
    }, [activeLesson, flatLessons])

    // Local set of lesson ids the student has completed in this session.
    // Seeds from the enrolment's stored progressPct on first load (we don't
    // have per-lesson completion in the GET payload yet, so the seed is best-
    // effort: fill the *first N* lessons proportional to progressPct so the
    // tick marks line up with the bar). Each successful mark-complete API
    // call adds the real lesson id, so the set converges to truth as the
    // student watches.
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
    useEffect(() => {
        if (!isStudent || !myEnrollment || flatLessons.length === 0) return
        const target = Math.round((myEnrollment.progressPct / 100) * flatLessons.length)
        const seeded = new Set<string>()
        for (let i = 0; i < target; i++) seeded.add(flatLessons[i].lessonId)
        setCompletedIds(seeded)
    }, [isStudent, myEnrollment?.progressPct, flatLessons])

    const current = activeLesson ?? flatLessons[0] ?? null
    const currentLesson: TLesson | null = useMemo(() => {
        if (!course || !current) return null
        const sec = sections.find((s) => s.id === current.sectionId)
        return sec?.lessons.find((l) => l.id === current.lessonId) ?? null
    }, [course, current, sections])

    const totalLessons = flatLessons.length
    const completedLessons = completedIds.size
    const progress = isStudent
        ? // For the student, mirror what the server thinks (so the bar matches
          // the dashboard) but reflect optimistic local marks immediately.
          Math.max(myEnrollment?.progressPct ?? 0, totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100))
        : 0

    const markCompleteMutation = useMutation({
        mutationFn: ({ lessonId, completed }: { lessonId: string; completed: boolean }) => updateLessonProgress(id, lessonId, { completed }),
        onMutate: ({ lessonId, completed }) => {
            // Optimistic — flip the tick immediately so the UI feels instant.
            setCompletedIds((prev) => {
                const next = new Set(prev)
                if (completed) next.add(lessonId)
                else next.delete(lessonId)
                return next
            })
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['enrollments', 'mine'] })
        },
        onError: (err: unknown, vars) => {
            // Roll the optimistic mark back on failure.
            setCompletedIds((prev) => {
                const next = new Set(prev)
                if (vars.completed) next.delete(vars.lessonId)
                else next.add(vars.lessonId)
                return next
            })
            toast.error(err instanceof Error ? err.message : 'Could not save progress')
        }
    })

    const isLessonCompleted = (lessonId: string) => completedIds.has(lessonId)
    const toggleCurrentLessonComplete = () => {
        if (!current || !currentLesson || !isStudent) return
        const want = !isLessonCompleted(current.lessonId)
        markCompleteMutation.mutate({ lessonId: current.lessonId, completed: want })
        if (want) toast.success('Lesson marked complete')
    }

    if (courseQuery.isLoading) {
        return (
            <>
                <Link
                    to="/app/courses"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All courses
                </Link>
                <Skeleton className="h-8 w-1/3 mb-3" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="grid lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <Skeleton className="h-60 w-full" />
                </div>
            </>
        )
    }

    if (!course || courseQuery.isError) {
        return (
            <>
                <Link
                    to="/app/courses"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All courses
                </Link>
                <Empty
                    title="Course not found"
                    description="It may have been deleted, unpublished, or you don't have access."
                    action={
                        <Link to="/app/courses">
                            <Button>Back to catalog</Button>
                        </Link>
                    }
                />
            </>
        )
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
                description={course.description ?? undefined}
                actions={
                    <>
                        {canEdit && (
                            <Link to={`/app/courses/${course.id}/builder${tenantId ? `?tenantId=${tenantId}` : ""}`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Wrench size={14} />}>
                                    Edit curriculum
                                </Button>
                            </Link>
                        )}
                    </>
                }
            />

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card padded={false}>
                        {currentLesson?.type === 'YOUTUBE' && currentLesson.youtubeId ? (
                            <>
                                <YouTubePlayer
                                    videoId={currentLesson.youtubeId}
                                    title={currentLesson.title}
                                    autoplay={false}
                                />
                                <div className="p-5 flex items-start justify-between gap-3 flex-wrap">
                                    <div className="min-w-0">
                                        <div className="text-xs text-fg-muted font-medium">Now playing</div>
                                        <div className="text-base font-semibold text-fg">{currentLesson.title}</div>
                                        {currentLesson.description && <p className="mt-2 text-sm text-fg-soft">{currentLesson.description}</p>}
                                    </div>
                                    {isStudent && current && (
                                        <Button
                                            size="sm"
                                            variant={isLessonCompleted(current.lessonId) ? 'subtle' : 'primary'}
                                            leftIcon={isLessonCompleted(current.lessonId) ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                            loading={markCompleteMutation.isPending}
                                            onClick={toggleCurrentLessonComplete}>
                                            {isLessonCompleted(current.lessonId) ? 'Completed' : 'Mark complete'}
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : currentLesson?.type === 'EXTERNAL_LIVE' && currentLesson.externalUrl ? (
                            <div className="aspect-video bg-surface-2 flex items-center justify-center p-6">
                                <div className="text-center">
                                    <LinkIcon
                                        size={36}
                                        className="mx-auto mb-3 text-fg-muted"
                                    />
                                    <div className="text-sm text-fg mb-3">{currentLesson.title}</div>
                                    <a
                                        href={currentLesson.externalUrl}
                                        target="_blank"
                                        rel="noreferrer">
                                        <Button size="sm">Open external lesson</Button>
                                    </a>
                                </div>
                            </div>
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
                                                to={`/app/courses/${course.id}/builder${tenantId ? `?tenantId=${tenantId}` : ""}`}
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

                        {sections.length === 0 ? (
                            <div className="text-sm text-fg-muted py-6 text-center">The trainer hasn't added any sections yet.</div>
                        ) : (
                            <div className="space-y-5">
                                {sections.map((sec) => (
                                    <div key={sec.id}>
                                        <h3 className="text-xs uppercase tracking-wider text-fg-muted font-medium mb-2">{sec.title}</h3>
                                        {sec.lessons.length === 0 ? (
                                            <div className="text-xs text-fg-muted px-3 py-4 border border-dashed rounded-md">
                                                No lessons in this section yet.
                                            </div>
                                        ) : (
                                            <ul className="border rounded-md overflow-hidden divide-y">
                                                {sec.lessons.map((l) => {
                                                    const Icon = LESSON_ICON[l.type] ?? Play
                                                    const isActive = current?.sectionId === sec.id && current.lessonId === l.id
                                                    const done = isLessonCompleted(l.id)
                                                    return (
                                                        <li
                                                            key={l.id}
                                                            className={cn(
                                                                'flex items-center gap-3 px-3 py-2.5 transition-colors',
                                                                isActive && 'bg-[var(--color-brand-50)]'
                                                            )}>
                                                            {done ? (
                                                                <CheckCircle2
                                                                    size={16}
                                                                    className="text-[var(--color-success)] shrink-0"
                                                                />
                                                            ) : (
                                                                <Circle
                                                                    size={16}
                                                                    className="text-fg-muted shrink-0"
                                                                />
                                                            )}
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
                                                            {l.durationSec > 0 && (
                                                                <span className="text-xs text-fg-muted font-mono">
                                                                    {Math.round(l.durationSec / 60)}m
                                                                </span>
                                                            )}
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
                        <h3 className="text-base font-semibold text-fg mb-3">Meta</h3>
                        <div className="space-y-2.5 text-sm">
                            <Row
                                label="Sections"
                                value={String(sections.length)}
                            />
                            <Row
                                label="Lessons"
                                value={String(totalLessons)}
                            />
                            {course.enrolledCount !== undefined && (
                                <Row
                                    label="Enrolled"
                                    value={`${course.enrolledCount}`}
                                />
                            )}
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

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-fg-muted">{label}</span>
        <span className="font-medium text-fg font-mono">{value}</span>
    </div>
)
