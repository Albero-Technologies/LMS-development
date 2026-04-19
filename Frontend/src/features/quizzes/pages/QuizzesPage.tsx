import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus, Timer, TrendingUp, Wrench, Play } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'
import { Input } from '@shared/components/ui/Input'
import { useQuizStore } from '../stores/quizStore'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'

export const QuizzesPage = () => {
    const quizzes = useQuizStore((s) => s.quizzes)
    const attempts = useQuizStore((s) => s.attempts)
    const upsertQuiz = useQuizStore((s) => s.upsertQuiz)
    const [newOpen, setNewOpen] = useState(false)

    const user = useAuthStore((s) => s.user)
    const canEdit = user && [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER].includes(user.role as never)

    const avgFor = (quizId: string) => {
        const mine = attempts.filter((a) => a.quizId === quizId)
        if (mine.length === 0) return null
        return Math.round(mine.reduce((n, a) => n + a.scorePercent, 0) / mine.length)
    }

    const [title, setTitle] = useState('')
    const [timeLimit, setTimeLimit] = useState('15')
    const [passPercent, setPassPercent] = useState('60')
    const [maxAttempts, setMaxAttempts] = useState('3')

    const reset = () => {
        setTitle('')
        setTimeLimit('15')
        setPassPercent('60')
        setMaxAttempts('3')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const id = crypto.randomUUID().slice(0, 8)
        upsertQuiz({
            id,
            title: title.trim(),
            timeLimitMin: Number(timeLimit) || 15,
            passPercent: Number(passPercent) || 60,
            maxAttempts: Number(maxAttempts) || 3,
            questions: [],
            createdAt: new Date().toISOString()
        })
        toast.success('Quiz created — add questions.')
        reset()
        setNewOpen(false)
        window.setTimeout(() => window.location.assign(`/app/quizzes/${id}/edit`), 40)
    }

    return (
        <>
            <PageHeader
                eyebrow="Assessments"
                title="Quizzes"
                description="Timed MCQs, auto-graded. Configure attempts, pass threshold, and explanations."
                actions={
                    canEdit ? (
                        <Button
                            size="sm"
                            leftIcon={<Plus size={14} />}
                            onClick={() => setNewOpen(true)}>
                            New quiz
                        </Button>
                    ) : null
                }
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((q) => {
                    const avg = avgFor(q.id)
                    return (
                        <Card
                            key={q.id}
                            className="flex flex-col">
                            <div className="w-10 h-10 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center mb-3">
                                <ClipboardList size={18} />
                            </div>
                            <h3 className="text-base font-semibold text-fg">{q.title}</h3>
                            <div className="mt-2 flex items-center gap-3 text-xs text-fg-muted">
                                <span className="inline-flex items-center gap-1">
                                    <Timer size={12} />
                                    {q.timeLimitMin}m
                                </span>
                                <span>·</span>
                                <span>{q.questions.length} questions</span>
                                <span>·</span>
                                <span>pass {q.passPercent}%</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-fg-muted">Your average</div>
                                    <div className="font-mono text-base font-semibold text-fg">
                                        {avg === null ? '—' : `${avg}%`}
                                    </div>
                                </div>
                                <Badge tone="brand">
                                    <TrendingUp size={10} />
                                    {attempts.filter((a) => a.quizId === q.id).length} attempts
                                </Badge>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Link
                                    to={`/app/quizzes/${q.id}/take`}
                                    className="flex-1">
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        leftIcon={<Play size={12} />}
                                        disabled={q.questions.length === 0}>
                                        Take quiz
                                    </Button>
                                </Link>
                                {canEdit && (
                                    <Link to={`/app/quizzes/${q.id}/edit`}>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label="Edit quiz">
                                            <Wrench size={12} />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>

            <Modal
                open={newOpen}
                onClose={() => {
                    reset()
                    setNewOpen(false)
                }}
                title="New quiz"
                description="We'll open the builder next so you can add questions."
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                reset()
                                setNewOpen(false)
                            }}>
                            Cancel
                        </Button>
                        <Button
                            form="new-quiz-form"
                            type="submit"
                            disabled={title.trim().length < 2}>
                            Create & edit
                        </Button>
                    </>
                }>
                <form
                    id="new-quiz-form"
                    onSubmit={submit}
                    className="space-y-4">
                    <Input
                        label="Title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. DSA Week 6 · Trees"
                    />
                    <div className="grid grid-cols-3 gap-3">
                        <Input
                            label="Time limit (min)"
                            type="number"
                            min={1}
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                        />
                        <Input
                            label="Pass %"
                            type="number"
                            min={1}
                            max={100}
                            value={passPercent}
                            onChange={(e) => setPassPercent(e.target.value)}
                        />
                        <Input
                            label="Max attempts"
                            type="number"
                            min={1}
                            value={maxAttempts}
                            onChange={(e) => setMaxAttempts(e.target.value)}
                        />
                    </div>
                </form>
            </Modal>
        </>
    )
}
