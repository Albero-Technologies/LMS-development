// Assignments list — role-aware.
//
//   STUDENT: only published assignments for courses they're enrolled in,
//            with their own submission state inline.
//   TRAINER / ADMIN / SUPER_ADMIN: every assignment in the tenant; can author
//            new ones from the New button + drill into each for grading.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Plus, Search, AlertCircle, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Modal } from '@shared/components/ui/Modal'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { createAssignment, fmtDate, listAssignments, submissionTone, type AssignmentRow } from '../services/assignment.service'
import { listCourses } from '@features/courses/services/course.service'

export const AssignmentsPage = () => {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const isStaff = user && [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TRAINER].includes(user.role as never)
    const [q, setQ] = useState('')
    const [courseFilter, setCourseFilter] = useState('')
    const [createOpen, setCreateOpen] = useState(false)

    const assignmentsQuery = useQuery({
        queryKey: ['assignments', courseFilter || 'all'],
        queryFn: () => listAssignments(courseFilter ? { courseId: courseFilter } : undefined),
        staleTime: 30_000
    })
    const coursesQuery = useQuery({
        queryKey: ['courses', 'for-assignments'],
        queryFn: () => listCourses(),
        staleTime: 60_000,
        enabled: !!isStaff
    })

    const rows = assignmentsQuery.data ?? []
    const courses = coursesQuery.data ?? []
    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        if (!needle) return rows
        return rows.filter((r) => r.title.toLowerCase().includes(needle) || r.course?.title.toLowerCase().includes(needle))
    }, [rows, q])

    return (
        <>
            <PageHeader
                eyebrow={isStaff ? 'Assessments' : 'Coursework'}
                title="Assignments"
                description={
                    isStaff
                        ? 'Take-home work for your students — author, set a due date, grade submissions.'
                        : 'Submit and track your assignments. Pending grades update automatically when your trainer reviews them.'
                }
                actions={
                    <>
                        <div className="w-44 hidden sm:block">
                            <Input
                                placeholder="Search"
                                leftIcon={<Search size={14} />}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search assignments"
                            />
                        </div>
                        {isStaff && (
                            <div className="w-52 hidden sm:block">
                                <Select
                                    aria-label="Filter by course"
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}>
                                    <option value="">All courses</option>
                                    {courses.map((c) => (
                                        <option
                                            key={c.id}
                                            value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                        {isStaff && (
                            <Button
                                size="sm"
                                leftIcon={<Plus size={14} />}
                                onClick={() => setCreateOpen(true)}>
                                New assignment
                            </Button>
                        )}
                    </>
                }
            />

            {assignmentsQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <Card key={i}>
                            <Skeleton className="h-5 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </Card>
                    ))}
                </div>
            ) : assignmentsQuery.isError ? (
                <Card>
                    <div className="flex items-center gap-3">
                        <AlertCircle
                            size={18}
                            className="text-[var(--color-danger)]"
                        />
                        <span className="text-sm text-fg-soft">Could not load assignments.</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => assignmentsQuery.refetch()}>
                            Retry
                        </Button>
                    </div>
                </Card>
            ) : filtered.length === 0 ? (
                <Empty
                    icon={<ClipboardList size={36} />}
                    title={q ? 'No matches' : isStaff ? 'No assignments yet' : 'No assignments yet'}
                    description={
                        q
                            ? 'Try a different search.'
                            : isStaff
                              ? 'Create the first assignment to give your students some take-home work.'
                              : "Once your trainer publishes assignments for courses you're enrolled in, they'll show up here."
                    }
                    action={
                        isStaff && !q ? (
                            <Button
                                leftIcon={<Plus size={14} />}
                                onClick={() => setCreateOpen(true)}>
                                New assignment
                            </Button>
                        ) : null
                    }
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((a) => (
                        <AssignmentCard
                            key={a.id}
                            row={a}
                            isStaff={!!isStaff}
                            onOpen={() => navigate(`/app/assignments/${a.id}`)}
                        />
                    ))}
                </div>
            )}

            <CreateAssignmentModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                courses={courses}
            />
        </>
    )
}

const AssignmentCard = ({ row, isStaff, onOpen }: { row: AssignmentRow; isStaff: boolean; onOpen: () => void }) => {
    const dueText = row.dueAt ? fmtDate(row.dueAt) : 'No due date'
    const submission = row.mySubmission
    const overdue = !isStaff && row.dueAt && !submission && new Date(row.dueAt).getTime() < Date.now()

    return (
        <Card className="flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-10 h-10 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center">
                    <ClipboardList size={18} />
                </div>
                {isStaff ? (
                    <Badge tone={row.isPublished ? 'ok' : 'default'}>{row.isPublished ? 'Published' : 'Draft'}</Badge>
                ) : submission ? (
                    <Badge tone={submissionTone(submission.status)}>
                        {submission.status === 'GRADED'
                            ? `Graded · ${submission.score ?? 0}/${row.maxScore}`
                            : submission.status === 'RETURNED'
                              ? 'Returned · revise'
                              : submission.status === 'SUBMITTED'
                                ? 'Submitted'
                                : 'Draft'}
                    </Badge>
                ) : overdue ? (
                    <Badge tone="danger">Overdue</Badge>
                ) : (
                    <Badge tone="warn">Pending</Badge>
                )}
            </div>
            <h3 className="text-base font-semibold text-fg">{row.title}</h3>
            {row.course && <div className="text-xs text-fg-soft truncate mt-0.5">{row.course.title}</div>}
            {row.description && <p className="mt-2 text-xs text-fg-soft line-clamp-2">{row.description}</p>}
            <div className="mt-3 flex items-center justify-between text-[11px] text-fg-muted">
                <span className="inline-flex items-center gap-1">
                    <CalendarDays size={11} />
                    {dueText}
                </span>
                <span>Max {row.maxScore}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-fg-muted">
                <span>
                    {row._count.submissions} submission{row._count.submissions === 1 ? '' : 's'}
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onOpen}>
                    Open
                </Button>
            </div>
        </Card>
    )
}

const CreateAssignmentModal = ({ open, onClose, courses }: { open: boolean; onClose: () => void; courses: { id: string; title: string }[] }) => {
    const queryClient = useQueryClient()
    const [courseId, setCourseId] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [instructions, setInstructions] = useState('')
    const [dueAt, setDueAt] = useState('')
    const [maxScore, setMaxScore] = useState('100')
    const [publishNow, setPublishNow] = useState(false)

    const reset = () => {
        setCourseId('')
        setTitle('')
        setDescription('')
        setInstructions('')
        setDueAt('')
        setMaxScore('100')
        setPublishNow(false)
    }

    const mutation = useMutation({
        mutationFn: () =>
            createAssignment({
                courseId,
                title: title.trim(),
                description: description.trim() || undefined,
                instructions: instructions.trim() || undefined,
                dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
                maxScore: Number(maxScore) || 100,
                isPublished: publishNow
            }),
        onSuccess: () => {
            toast.success(publishNow ? 'Assignment published' : 'Assignment saved as draft')
            void queryClient.invalidateQueries({ queryKey: ['assignments'] })
            reset()
            onClose()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not create')
    })

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New assignment"
            description="Take-home work for one course. Free-form text and/or file submissions; you grade after the due date."
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
                        disabled={!courseId || !title}
                        onClick={() => mutation.mutate()}>
                        {publishNow ? 'Create & publish' : 'Save as draft'}
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Select
                    label="Course"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">Pick a course…</option>
                    {courses.map((c) => (
                        <option
                            key={c.id}
                            value={c.id}>
                            {c.title}
                        </option>
                    ))}
                </Select>
                <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Capstone — build a URL shortener"
                />
                <Textarea
                    label="Short description (shows on the card)"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Textarea
                    label="Instructions (markdown)"
                    rows={6}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={`## Goals\n- ...\n\n## Submission format\n- Hosted URL\n- GitHub repo link`}
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Due date (optional)"
                        type="date"
                        value={dueAt}
                        onChange={(e) => setDueAt(e.target.value)}
                    />
                    <Input
                        label="Max score"
                        type="number"
                        min={1}
                        max={1000}
                        value={maxScore}
                        onChange={(e) => setMaxScore(e.target.value)}
                    />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        className="accent-[var(--color-brand-500)]"
                        checked={publishNow}
                        onChange={(e) => setPublishNow(e.target.checked)}
                    />
                    Publish immediately (students will see it right away)
                </label>
            </div>
        </Modal>
    )
}
