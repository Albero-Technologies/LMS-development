import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Check, Save, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input, Textarea } from '@shared/components/ui/Input'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'
import { useQuizStore, type TQuestion } from '../stores/quizStore'

export const QuizBuilderPage = () => {
    const { id = '' } = useParams()
    const quiz = useQuizStore((s) => s.quizzes.find((q) => q.id === id))
    const upsertQuiz = useQuizStore((s) => s.upsertQuiz)
    const addQuestion = useQuizStore((s) => s.addQuestion)
    const updateQuestion = useQuizStore((s) => s.updateQuestion)
    const removeQuestion = useQuizStore((s) => s.removeQuestion)

    const [activeId, setActiveId] = useState<string | null>(quiz?.questions[0]?.id ?? null)
    const active = useMemo(() => quiz?.questions.find((q) => q.id === activeId) ?? null, [quiz, activeId])

    if (!quiz) {
        return (
            <>
                <Link
                    to="/app/quizzes"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> All quizzes
                </Link>
                <Empty title="Quiz not found" />
            </>
        )
    }

    const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0)

    const createQuestion = () => {
        addQuestion(quiz.id, {
            text: 'New question',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            points: 1
        })
        // The new question is prepended with a fresh id inside the store — grab
        // it on next render via useMemo; autoselection handled below.
    }

    // When the question list length changes and nothing is selected, pick the last one.
    if (!activeId && quiz.questions.length > 0) {
        setActiveId(quiz.questions[quiz.questions.length - 1].id)
    }

    const saveMeta = (patch: Partial<typeof quiz>) => upsertQuiz({ ...quiz, ...patch })

    return (
        <>
            <Link
                to="/app/quizzes"
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> All quizzes
            </Link>
            <PageHeader
                eyebrow="Quiz Builder"
                title={quiz.title}
                description={`${quiz.questions.length} questions · ${totalPoints} points · ${quiz.timeLimitMin} min`}
                actions={
                    <>
                        <Link to={`/app/quizzes/${quiz.id}/take`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Eye size={14} />}>
                                Preview
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            leftIcon={<Save size={14} />}
                            onClick={() => toast.success('Saved')}>
                            Save
                        </Button>
                    </>
                }
            />

            <div className="grid lg:grid-cols-[1fr_260px] gap-4">
                <div className="space-y-4">
                    {/* Quiz settings */}
                    <Card>
                        <h3 className="text-sm font-semibold text-fg mb-4">Settings</h3>
                        <div className="grid sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                                <Input
                                    label="Title"
                                    value={quiz.title}
                                    onChange={(e) => saveMeta({ title: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Time limit (min)"
                                type="number"
                                min={1}
                                value={quiz.timeLimitMin}
                                onChange={(e) => saveMeta({ timeLimitMin: Number(e.target.value) })}
                            />
                            <Input
                                label="Pass %"
                                type="number"
                                min={1}
                                max={100}
                                value={quiz.passPercent}
                                onChange={(e) => saveMeta({ passPercent: Number(e.target.value) })}
                            />
                        </div>
                    </Card>

                    {/* Active question editor */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-fg">{active ? 'Question' : 'No question selected'}</h3>
                            <Button
                                size="sm"
                                leftIcon={<Plus size={14} />}
                                onClick={createQuestion}>
                                Add question
                            </Button>
                        </div>

                        {active ? (
                            <QuestionEditor
                                key={active.id}
                                question={active}
                                onChange={(q) => updateQuestion(quiz.id, q)}
                                onDelete={() => {
                                    if (!window.confirm('Delete this question?')) return
                                    removeQuestion(quiz.id, active.id)
                                    setActiveId(quiz.questions.find((q) => q.id !== active.id)?.id ?? null)
                                }}
                            />
                        ) : (
                            <Empty
                                title="Start with one question"
                                description="Click Add question to author your first MCQ."
                                action={
                                    <Button
                                        leftIcon={<Plus size={14} />}
                                        onClick={createQuestion}>
                                        Add question
                                    </Button>
                                }
                            />
                        )}
                    </Card>
                </div>

                {/* Navigator */}
                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3">Questions</h3>
                    <div className="grid grid-cols-5 gap-1.5 mb-4">
                        {quiz.questions.map((q, i) => (
                            <button
                                key={q.id}
                                type="button"
                                className={cn(
                                    'h-8 rounded-md text-xs font-mono font-semibold border transition-colors',
                                    activeId === q.id
                                        ? 'bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)]'
                                        : 'bg-surface-2 text-fg-soft hover:bg-surface-hover'
                                )}
                                onClick={() => setActiveId(q.id)}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <div className="border-t pt-3 space-y-2 text-sm">
                        <Row
                            label="Total"
                            value={`${quiz.questions.length}`}
                        />
                        <Row
                            label="Points"
                            value={`${totalPoints}`}
                        />
                        <Row
                            label="Time limit"
                            value={`${quiz.timeLimitMin}m`}
                        />
                        <Row
                            label="Pass mark"
                            value={`${quiz.passPercent}%`}
                        />
                    </div>
                </Card>
            </div>
        </>
    )
}

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-fg-muted">{label}</span>
        <span className="text-fg font-mono font-semibold">{value}</span>
    </div>
)

const QuestionEditor = ({ question, onChange, onDelete }: { question: TQuestion; onChange: (q: TQuestion) => void; onDelete: () => void }) => {
    const updateOption = (i: number, text: string) => {
        const next = question.options.slice()
        next[i] = text
        onChange({ ...question, options: next })
    }
    const addOption = () => {
        if (question.options.length >= 6) return
        onChange({ ...question, options: [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`] })
    }
    const removeOption = (i: number) => {
        if (question.options.length <= 2) return
        const next = question.options.filter((_, j) => j !== i)
        const correct = question.correctIndex === i ? 0 : question.correctIndex > i ? question.correctIndex - 1 : question.correctIndex
        onChange({ ...question, options: next, correctIndex: correct })
    }

    return (
        <div className="space-y-4">
            <Textarea
                label="Question text"
                value={question.text}
                rows={2}
                onChange={(e) => onChange({ ...question, text: e.target.value })}
            />
            <div>
                <label className="block text-xs font-medium text-fg-soft mb-1.5">Options · click the tick to mark correct</label>
                <ul className="space-y-2">
                    {question.options.map((opt, i) => {
                        const correct = i === question.correctIndex
                        return (
                            <li
                                key={i}
                                className={cn(
                                    'flex items-center gap-2 rounded-md border px-2.5 py-1.5',
                                    correct && 'bg-[var(--color-success-soft)] border-[var(--color-success)]/40'
                                )}>
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...question, correctIndex: i })}
                                    aria-label={`Mark option ${i + 1} correct`}
                                    className={cn(
                                        'w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                                        correct
                                            ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
                                            : 'border-[var(--color-border)] text-transparent'
                                    )}>
                                    <Check size={12} />
                                </button>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent text-sm focus:outline-none text-fg"
                                    value={opt}
                                    onChange={(e) => updateOption(i, e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOption(i)}
                                    className="text-fg-muted hover:text-[var(--color-danger)] p-1"
                                    aria-label="Remove option"
                                    disabled={question.options.length <= 2}>
                                    <Trash2 size={12} />
                                </button>
                            </li>
                        )
                    })}
                </ul>
                {question.options.length < 6 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 text-xs text-brand font-medium hover:underline inline-flex items-center gap-1">
                        <Plus size={12} /> Add option
                    </button>
                )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
                <Input
                    label="Points"
                    type="number"
                    min={0}
                    value={question.points}
                    onChange={(e) => onChange({ ...question, points: Number(e.target.value) || 0 })}
                />
                <Input
                    label="Explanation (optional)"
                    value={question.explanation ?? ''}
                    onChange={(e) => onChange({ ...question, explanation: e.target.value })}
                    placeholder="Shown after submission to help learners."
                />
            </div>
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 size={12} />}
                    onClick={onDelete}
                    className="!text-[var(--color-danger)]">
                    Delete question
                </Button>
            </div>
        </div>
    )
}
