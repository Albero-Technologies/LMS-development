// Assignment detail.
//
// Layout:
//   - Header: title, course, due date, max score, status pill
//   - Body (left): instructions (markdown-ish, currently rendered as
//     pre-wrap text — markdown rendering is a nice-to-have, defer)
//   - Body (right):
//       STUDENT  → submission form (text + file URL) with Save draft / Submit
//       STAFF    → submissions table with grade buttons
//
// Submitting and grading both invalidate the cache so the list view refreshes
// with the new state when you go back.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft,
    ClipboardList,
    Save,
    Send,
    CalendarDays,
    Award,
    AlertCircle,
    User as UserIcon,
    Trash2,
    Eye,
    EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Modal } from '@shared/components/ui/Modal'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import {
    deleteAssignment,
    fmtDate,
    getAssignment,
    gradeSubmission,
    submissionTone,
    submitAssignment,
    updateAssignment,
    type SubmissionRow
} from '../services/assignment.service'

export const AssignmentDetailPage = () => {
    const { id = '' } = useParams()
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const isStaff = user && [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TRAINER].includes(user.role as never)
    const queryClient = useQueryClient()

    const detailQuery = useQuery({
        queryKey: ['assignment', id],
        queryFn: () => getAssignment(id),
        enabled: id.length > 0,
        staleTime: 15_000,
        retry: false
    })

    if (detailQuery.isLoading) {
        return (
            <>
                <Link
                    to="/app/assignments"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All assignments
                </Link>
                <Skeleton className="h-8 w-1/3 mb-3" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="grid lg:grid-cols-3 gap-4">
                    <Skeleton className="lg:col-span-2 h-72" />
                    <Skeleton className="h-72" />
                </div>
            </>
        )
    }

    if (!detailQuery.data || detailQuery.isError) {
        return (
            <>
                <Link
                    to="/app/assignments"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All assignments
                </Link>
                <Empty
                    title="Assignment not found"
                    description="It may have been deleted, unpublished, or you don't have access."
                    action={
                        <Link to="/app/assignments">
                            <Button>Back to list</Button>
                        </Link>
                    }
                />
            </>
        )
    }

    const a = detailQuery.data

    return (
        <>
            <Link
                to="/app/assignments"
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> All assignments
            </Link>

            <PageHeader
                eyebrow={a.course?.title ?? 'Assignment'}
                title={a.title}
                description={a.description ?? undefined}
                actions={
                    <>
                        <span className="inline-flex items-center gap-1.5 text-xs text-fg-soft">
                            <CalendarDays size={12} /> Due {fmtDate(a.dueAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-fg-soft">
                            <Award size={12} /> Max {a.maxScore}
                        </span>
                        {isStaff && (
                            <StaffActions
                                assignmentId={a.id}
                                isPublished={a.isPublished}
                                onDeleted={() => navigate('/app/assignments')}
                            />
                        )}
                    </>
                }
            />

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <h2 className="text-base font-semibold text-fg mb-2">Instructions</h2>
                        {a.instructions ? (
                            <pre className="whitespace-pre-wrap font-sans text-sm text-fg-soft leading-relaxed">{a.instructions}</pre>
                        ) : (
                            <p className="text-sm text-fg-muted">No instructions yet — check back when your trainer adds detail.</p>
                        )}
                    </Card>

                    {isStaff && (
                        <Card padded={false}>
                            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                                <h2 className="text-base font-semibold text-fg">Submissions</h2>
                                <span className="text-xs text-fg-muted">{a.submissions.length} total</span>
                            </div>
                            {a.submissions.length === 0 ? (
                                <div className="px-5 py-12 text-sm text-fg-muted text-center">
                                    No submissions yet. They'll appear here as students submit.
                                </div>
                            ) : (
                                <SubmissionsTable
                                    rows={a.submissions}
                                    maxScore={a.maxScore}
                                    onGraded={() => queryClient.invalidateQueries({ queryKey: ['assignment', id] })}
                                />
                            )}
                        </Card>
                    )}
                </div>

                <aside className="space-y-4">
                    {!isStaff && (
                        <StudentSubmissionPanel
                            assignmentId={a.id}
                            maxScore={a.maxScore}
                            current={a.mySubmission}
                            isPastDue={!!(a.dueAt && new Date(a.dueAt).getTime() < Date.now())}
                            onChanged={() => queryClient.invalidateQueries({ queryKey: ['assignment', id] })}
                        />
                    )}

                    <Card>
                        <h3 className="text-base font-semibold text-fg mb-3">Meta</h3>
                        <dl className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between">
                                <dt className="text-fg-muted">Status</dt>
                                <dd>
                                    <Badge tone={a.isPublished ? 'ok' : 'default'}>{a.isPublished ? 'Published' : 'Draft'}</Badge>
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-fg-muted">Due</dt>
                                <dd className="text-fg font-medium">{fmtDate(a.dueAt)}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-fg-muted">Max score</dt>
                                <dd className="font-mono">{a.maxScore}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-fg-muted">Trainer</dt>
                                <dd className="text-fg font-medium truncate ml-2">
                                    {a.trainer ? [a.trainer.firstName, a.trainer.lastName].filter(Boolean).join(' ').trim() || '—' : '—'}
                                </dd>
                            </div>
                        </dl>
                    </Card>
                </aside>
            </div>
        </>
    )
}

const StaffActions = ({
    assignmentId,
    isPublished,
    onDeleted
}: {
    assignmentId: string
    isPublished: boolean
    onDeleted: () => void
}) => {
    const queryClient = useQueryClient()
    const togglePublish = useMutation({
        mutationFn: () => updateAssignment(assignmentId, { isPublished: !isPublished }),
        onSuccess: () => {
            toast.success(isPublished ? 'Unpublished' : 'Published')
            void queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] })
            void queryClient.invalidateQueries({ queryKey: ['assignments'] })
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not update')
    })

    const remove = useMutation({
        mutationFn: () => deleteAssignment(assignmentId),
        onSuccess: () => {
            toast.success('Assignment deleted')
            void queryClient.invalidateQueries({ queryKey: ['assignments'] })
            onDeleted()
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not delete')
    })

    return (
        <>
            <Button
                size="sm"
                variant="ghost"
                leftIcon={isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                loading={togglePublish.isPending}
                onClick={() => togglePublish.mutate()}>
                {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                leftIcon={<Trash2 size={12} />}
                loading={remove.isPending}
                onClick={() => {
                    if (window.confirm('Delete this assignment? Existing submissions are also removed.')) remove.mutate()
                }}>
                Delete
            </Button>
        </>
    )
}

const StudentSubmissionPanel = ({
    assignmentId,
    maxScore,
    current,
    isPastDue,
    onChanged
}: {
    assignmentId: string
    maxScore: number
    current: SubmissionRow | null
    isPastDue: boolean
    onChanged: () => void
}) => {
    const [textAnswer, setTextAnswer] = useState(current?.textAnswer ?? '')
    const [fileUrl, setFileUrl] = useState(current?.fileUrl ?? '')

    useEffect(() => {
        setTextAnswer(current?.textAnswer ?? '')
        setFileUrl(current?.fileUrl ?? '')
    }, [current?.id])

    const isSealed = current?.status === 'SUBMITTED' || current?.status === 'GRADED'
    const canEdit = !isSealed
    const canSubmit = !isSealed && (textAnswer.trim().length > 0 || fileUrl.trim().length > 0)

    const submitMutation = useMutation({
        mutationFn: (seal: boolean) =>
            submitAssignment(assignmentId, {
                textAnswer: textAnswer.trim() || undefined,
                fileUrl: fileUrl.trim() || undefined,
                seal
            }),
        onSuccess: (_data, seal) => {
            toast.success(seal ? 'Submitted — your trainer will grade it soon.' : 'Draft saved')
            onChanged()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not submit')
    })

    return (
        <Card>
            <h3 className="text-base font-semibold text-fg mb-3 flex items-center justify-between">
                <span>Your submission</span>
                {current && (
                    <Badge tone={submissionTone(current.status)}>
                        {current.status === 'GRADED'
                            ? `Graded · ${current.score ?? 0}/${maxScore}`
                            : current.status === 'RETURNED'
                              ? 'Returned for revision'
                              : current.status === 'SUBMITTED'
                                ? 'Submitted'
                                : 'Draft'}
                    </Badge>
                )}
            </h3>

            {current?.status === 'GRADED' && current.feedback && (
                <div className="mb-3 rounded-md border border-[var(--color-success-200,var(--color-border))] bg-[var(--color-success-50,var(--color-surface-2))] p-3">
                    <div className="text-[11px] font-medium text-fg-soft uppercase tracking-wider mb-1">Feedback</div>
                    <p className="text-sm text-fg-soft whitespace-pre-wrap">{current.feedback}</p>
                </div>
            )}
            {current?.status === 'RETURNED' && current.feedback && (
                <div className="mb-3 rounded-md border border-[var(--color-warning-200,var(--color-border))] bg-[var(--color-warning-50,var(--color-surface-2))] p-3">
                    <div className="text-[11px] font-medium text-fg-soft uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <AlertCircle size={11} />
                        Trainer wants edits
                    </div>
                    <p className="text-sm text-fg-soft whitespace-pre-wrap">{current.feedback}</p>
                </div>
            )}

            <Textarea
                label="Your answer"
                rows={6}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Write your answer here, or paste a link below."
                disabled={!canEdit}
            />
            <div className="mt-3">
                <Input
                    label="File / link URL (optional)"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://github.com/your-repo or a hosted PDF link"
                    disabled={!canEdit}
                />
            </div>

            {isPastDue && !isSealed && (
                <div className="mt-3 text-[11px] text-[var(--color-warning,inherit)] inline-flex items-center gap-1.5">
                    <AlertCircle size={11} /> Past due — submit anyway?
                </div>
            )}

            {canEdit && (
                <div className="mt-4 flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Save size={12} />}
                        loading={submitMutation.isPending && submitMutation.variables === false}
                        onClick={() => submitMutation.mutate(false)}>
                        Save draft
                    </Button>
                    <Button
                        size="sm"
                        leftIcon={<Send size={12} />}
                        disabled={!canSubmit}
                        loading={submitMutation.isPending && submitMutation.variables === true}
                        onClick={() => submitMutation.mutate(true)}>
                        Submit
                    </Button>
                </div>
            )}

            {isSealed && (
                <div className="mt-3 text-[11px] text-fg-muted">
                    Submitted on {fmtDate(current?.submittedAt ?? null)}.
                    {current?.status === 'GRADED' && current.gradedAt && <> Graded on {fmtDate(current.gradedAt)}.</>}
                </div>
            )}
        </Card>
    )
}

const SubmissionsTable = ({ rows, maxScore, onGraded }: { rows: SubmissionRow[]; maxScore: number; onGraded: () => void }) => {
    const [grading, setGrading] = useState<SubmissionRow | null>(null)
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs text-fg-muted bg-surface-2">
                            <th className="py-3 px-5">Student</th>
                            <th className="py-3 px-5">Status</th>
                            <th className="py-3 px-5">Score</th>
                            <th className="py-3 px-5">Submitted</th>
                            <th className="py-3 px-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map((s) => {
                            const fullName = s.user
                                ? [s.user.firstName, s.user.lastName].filter(Boolean).join(' ').trim() || s.user.email
                                : 'Unknown'
                            return (
                                <tr
                                    key={s.id}
                                    className="hover:bg-surface-hover">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-2">
                                            <UserIcon
                                                size={14}
                                                className="text-fg-muted"
                                            />
                                            <div className="min-w-0">
                                                <div className="text-fg font-medium truncate">{fullName}</div>
                                                {s.user?.email && <div className="text-[11px] text-fg-muted truncate">{s.user.email}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5">
                                        <Badge tone={submissionTone(s.status)}>{s.status.toLowerCase()}</Badge>
                                    </td>
                                    <td className="py-3 px-5 font-mono text-xs">
                                        {s.score === null ? '—' : `${s.score}/${maxScore}`}
                                    </td>
                                    <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(s.submittedAt)}</td>
                                    <td className="py-3 px-5 text-right">
                                        {s.status !== 'DRAFT' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setGrading(s)}>
                                                {s.status === 'GRADED' ? 'Review' : 'Grade'}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <GradeSubmissionModal
                submission={grading}
                maxScore={maxScore}
                onClose={() => setGrading(null)}
                onSaved={() => {
                    setGrading(null)
                    onGraded()
                }}
            />
        </>
    )
}

const GradeSubmissionModal = ({
    submission,
    maxScore,
    onClose,
    onSaved
}: {
    submission: SubmissionRow | null
    maxScore: number
    onClose: () => void
    onSaved: () => void
}) => {
    const [score, setScore] = useState('')
    const [feedback, setFeedback] = useState('')
    const [returnForRework, setReturnForRework] = useState(false)

    useEffect(() => {
        if (submission) {
            setScore(submission.score?.toString() ?? '')
            setFeedback(submission.feedback ?? '')
            setReturnForRework(submission.status === 'RETURNED')
        }
    }, [submission?.id])

    const studentName = useMemo(() => {
        if (!submission?.user) return 'this submission'
        return [submission.user.firstName, submission.user.lastName].filter(Boolean).join(' ').trim() || submission.user.email
    }, [submission])

    const mutation = useMutation({
        mutationFn: () =>
            gradeSubmission(submission!.id, {
                score: Number(score) || 0,
                feedback: feedback.trim() || undefined,
                status: returnForRework ? 'RETURNED' : 'GRADED'
            }),
        onSuccess: () => {
            toast.success(returnForRework ? 'Sent back for rework' : 'Graded')
            onSaved()
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not save')
    })

    if (!submission) return null

    return (
        <Modal
            open={!!submission}
            onClose={onClose}
            title={`Grade — ${studentName}`}
            description="Score, feedback, and whether to send the submission back for revision."
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
                        disabled={score === '' || Number(score) > maxScore || Number(score) < 0}
                        onClick={() => mutation.mutate()}>
                        Save
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <div className="rounded-md border border-[var(--color-border)] p-3 bg-surface-2/40">
                    <div className="text-[11px] font-medium text-fg-soft uppercase tracking-wider mb-1">
                        <ClipboardList
                            size={11}
                            className="inline mr-1"
                        />
                        Their answer
                    </div>
                    {submission.textAnswer ? (
                        <pre className="whitespace-pre-wrap font-sans text-sm text-fg-soft max-h-48 overflow-y-auto">{submission.textAnswer}</pre>
                    ) : (
                        <p className="text-sm text-fg-muted italic">No text answer.</p>
                    )}
                    {submission.fileUrl && (
                        <div className="mt-2">
                            <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[var(--color-brand-600)] hover:underline break-all">
                                {submission.fileUrl}
                            </a>
                        </div>
                    )}
                </div>
                <Input
                    label={`Score (out of ${maxScore})`}
                    type="number"
                    min={0}
                    max={maxScore}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                />
                <Textarea
                    label="Feedback (optional)"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What went well, what to improve. Visible to the student."
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        className="accent-[var(--color-brand-500)]"
                        checked={returnForRework}
                        onChange={(e) => setReturnForRework(e.target.checked)}
                    />
                    Return for rework — student can edit and re-submit
                </label>
            </div>
        </Modal>
    )
}
