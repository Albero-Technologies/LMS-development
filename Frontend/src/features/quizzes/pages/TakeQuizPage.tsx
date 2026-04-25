import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'
import { useQuizStore, gradeQuiz } from '../stores/quizStore'

const fmtMMSS = (sec: number): string => {
    const m = Math.max(0, Math.floor(sec / 60))
    const s = Math.max(0, sec % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const TakeQuizPage = () => {
    const { id = '' } = useParams()
    const quiz = useQuizStore((s) => s.quizzes.find((q) => q.id === id))
    const submitAttempt = useQuizStore((s) => s.submitAttempt)

    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [current, setCurrent] = useState(0)
    const [result, setResult] = useState<{ scorePercent: number; passed: boolean } | null>(null)

    const startedAtRef = useRef<string>(new Date().toISOString())
    const [secondsLeft, setSecondsLeft] = useState((quiz?.timeLimitMin ?? 0) * 60)

    // -------- Timer --------
    useEffect(() => {
        if (!quiz || result) return
        const t = window.setInterval(() => {
            setSecondsLeft((s) => s - 1)
        }, 1000)
        return () => window.clearInterval(t)
    }, [quiz, result])

    const handleSubmit = useMemo(
        () => () => {
            if (!quiz || result) return
            const r = gradeQuiz(quiz, answers)
            submitAttempt({
                quizId: quiz.id,
                answers,
                scorePercent: r.scorePercent,
                passed: r.passed,
                startedAt: startedAtRef.current,
                submittedAt: new Date().toISOString()
            })
            setResult(r)
        },
        [quiz, answers, submitAttempt, result]
    )

    // -------- Auto-submit when timer hits 0 --------
    useEffect(() => {
        if (secondsLeft <= 0 && quiz && !result) handleSubmit()
    }, [secondsLeft, quiz, result, handleSubmit])

    if (!quiz) {
        return (
            <>
                <Link
                    to="/app/quizzes"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> Back to quizzes
                </Link>
                <Empty title="Quiz not found" />
            </>
        )
    }

    if (quiz.questions.length === 0) {
        return (
            <>
                <Link
                    to="/app/quizzes"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> Back to quizzes
                </Link>
                <Empty
                    title="No questions yet"
                    description="The trainer hasn't added questions to this quiz."
                    action={
                        <Link to={`/app/quizzes/${quiz.id}/edit`}>
                            <Button>Open quiz builder</Button>
                        </Link>
                    }
                />
            </>
        )
    }

    const q = quiz.questions[current]
    const selected = answers[q.id]
    const answered = Object.keys(answers).length

    const setAnswer = (i: number) => setAnswers((a) => ({ ...a, [q.id]: i }))

    // -------- Results screen --------
    if (result) {
        return (
            <>
                <Link
                    to="/app/quizzes"
                    className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                    <ArrowLeft size={14} /> Back to quizzes
                </Link>
                <PageHeader
                    eyebrow="Result"
                    title={quiz.title}
                />
                <Card className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-fg-muted font-medium">Score</div>
                        <div className="font-mono text-4xl font-bold text-fg">{result.scorePercent}%</div>
                    </div>
                    <Badge tone={result.passed ? 'ok' : 'danger'}>{result.passed ? 'Passed' : 'Did not pass'}</Badge>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3">Review</h3>
                    <ol className="space-y-3">
                        {quiz.questions.map((qq, i) => {
                            const sel = answers[qq.id]
                            const correct = sel === qq.correctIndex
                            return (
                                <li
                                    key={qq.id}
                                    className="border rounded-md p-3">
                                    <div className="flex items-start gap-2">
                                        {correct ? (
                                            <CheckCircle2
                                                size={14}
                                                className="mt-0.5 text-[var(--color-success)] shrink-0"
                                            />
                                        ) : (
                                            <XCircle
                                                size={14}
                                                className="mt-0.5 text-[var(--color-danger)] shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="text-sm text-fg font-medium">
                                                Q{i + 1}. {qq.text}
                                            </div>
                                            <div className="mt-1 text-xs text-fg-soft">
                                                Your answer: <span className="font-medium">{sel !== undefined ? qq.options[sel] : 'Skipped'}</span>
                                                {!correct && (
                                                    <>
                                                        {' '}
                                                        · Correct:{' '}
                                                        <span className="font-medium text-[var(--color-success)]">{qq.options[qq.correctIndex]}</span>
                                                    </>
                                                )}
                                            </div>
                                            {qq.explanation && <div className="mt-1.5 text-xs text-fg-muted">{qq.explanation}</div>}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                </Card>
            </>
        )
    }

    // -------- Active attempt --------
    return (
        <>
            <Link
                to="/app/quizzes"
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-4">
                <ArrowLeft size={14} /> Back to quizzes
            </Link>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-fg">{quiz.title}</h1>
                    <p className="text-sm text-fg-muted">
                        Question {current + 1} of {quiz.questions.length} · {answered} answered
                    </p>
                </div>
                <div
                    className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-sm font-semibold',
                        secondsLeft < 60 && 'text-[var(--color-danger)] border-[var(--color-danger)]/40'
                    )}>
                    <Clock size={14} />
                    {fmtMMSS(secondsLeft)}
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_220px] gap-4">
                <Card>
                    <div className="text-sm text-fg-muted font-medium mb-2">Question {current + 1}</div>
                    <h2 className="text-lg font-semibold text-fg mb-5 leading-snug">{q.text}</h2>
                    <ul className="space-y-2">
                        {q.options.map((opt, i) => {
                            const active = selected === i
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => setAnswer(i)}
                                        className={cn(
                                            'w-full text-left rounded-md border px-4 py-3 flex items-center gap-3 transition-colors',
                                            active ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover'
                                        )}>
                                        <span
                                            className={cn(
                                                'w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                                                active
                                                    ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-white'
                                                    : 'border-[var(--color-border)] text-transparent'
                                            )}>
                                            <CheckCircle2 size={12} />
                                        </span>
                                        <span className="text-sm text-fg">{opt}</span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="mt-6 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                            disabled={current === 0}>
                            Previous
                        </Button>
                        {current < quiz.questions.length - 1 ? (
                            <Button
                                rightIcon={<ArrowRight size={14} />}
                                onClick={() => setCurrent((c) => Math.min(quiz.questions.length - 1, c + 1))}>
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit}>Submit quiz</Button>
                        )}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold text-fg mb-3">Navigator</h3>
                    <div className="grid grid-cols-5 gap-1.5">
                        {quiz.questions.map((qq, i) => {
                            const answeredHere = answers[qq.id] !== undefined
                            return (
                                <button
                                    key={qq.id}
                                    type="button"
                                    onClick={() => setCurrent(i)}
                                    className={cn(
                                        'h-8 rounded-md text-xs font-mono font-semibold border',
                                        current === i && 'ring-2 ring-[var(--color-brand-500)]',
                                        answeredHere
                                            ? 'bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)]'
                                            : 'bg-surface-2 text-fg-soft hover:bg-surface-hover'
                                    )}
                                    aria-label={`Go to question ${i + 1}`}>
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                    <Button
                        className="w-full mt-4"
                        onClick={handleSubmit}>
                        Submit
                    </Button>
                </Card>
            </div>
        </>
    )
}
