import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TQuestion = {
    id: string
    text: string
    options: string[]
    correctIndex: number
    points: number
    explanation?: string
}

export type TQuiz = {
    id: string
    title: string
    courseId?: string
    timeLimitMin: number
    passPercent: number
    maxAttempts: number
    questions: TQuestion[]
    createdAt: string
}

export type TAttempt = {
    id: string
    quizId: string
    answers: Record<string, number> // questionId -> selected index
    scorePercent: number
    passed: boolean
    startedAt: string
    submittedAt: string
}

const newId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)

const SEED: TQuiz[] = [
    {
        id: 'q1',
        title: 'DSA Week 5 · Stacks',
        courseId: 'dsa-30',
        timeLimitMin: 20,
        passPercent: 60,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        questions: [
            {
                id: 'q1-1',
                text: 'Which data structure best models function call history?',
                options: ['Queue (FIFO)', 'Stack (LIFO)', 'Max-heap', 'Linked list'],
                correctIndex: 1,
                points: 1,
                explanation: 'Each call pushes a frame; returning pops it — classic stack behaviour.'
            },
            {
                id: 'q1-2',
                text: 'A valid parentheses checker most naturally uses:',
                options: ['Recursion only', 'Hash set', 'Stack', 'Binary tree'],
                correctIndex: 2,
                points: 1
            },
            {
                id: 'q1-3',
                text: 'What is the time complexity of pushing N items onto a dynamic-array-backed stack?',
                options: ['O(log N)', 'O(N log N)', 'O(N) amortised', 'O(N²)'],
                correctIndex: 2,
                points: 2
            }
        ]
    },
    {
        id: 'q2',
        title: 'System Design · Warmup',
        courseId: 'sys-design',
        timeLimitMin: 15,
        passPercent: 65,
        maxAttempts: 2,
        createdAt: new Date().toISOString(),
        questions: [
            {
                id: 'q2-1',
                text: 'A write-heavy service is CPU-bound on serialisation. First move:',
                options: [
                    'Add a read replica',
                    'Introduce protobuf + batching',
                    'Partition the database',
                    'Move to a CDN'
                ],
                correctIndex: 1,
                points: 1
            },
            {
                id: 'q2-2',
                text: 'Consistent hashing primarily solves:',
                options: [
                    'Encryption key rotation',
                    'Uniform data distribution with minimal reshuffling on node changes',
                    'SQL query planning',
                    'TLS session resumption'
                ],
                correctIndex: 1,
                points: 1
            }
        ]
    }
]

type Store = {
    quizzes: TQuiz[]
    attempts: TAttempt[]
    upsertQuiz: (q: TQuiz) => void
    deleteQuiz: (id: string) => void
    addQuestion: (quizId: string, q: Omit<TQuestion, 'id'>) => void
    updateQuestion: (quizId: string, q: TQuestion) => void
    removeQuestion: (quizId: string, questionId: string) => void
    submitAttempt: (attempt: Omit<TAttempt, 'id'>) => TAttempt
}

export const useQuizStore = create<Store>()(
    persist(
        (set) => ({
            quizzes: SEED,
            attempts: [],
            upsertQuiz: (q) =>
                set((s) => {
                    const i = s.quizzes.findIndex((x) => x.id === q.id)
                    if (i === -1) return { quizzes: [q, ...s.quizzes] }
                    const next = s.quizzes.slice()
                    next[i] = q
                    return { quizzes: next }
                }),
            deleteQuiz: (id) => set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) })),
            addQuestion: (quizId, q) =>
                set((s) => ({
                    quizzes: s.quizzes.map((qz) =>
                        qz.id !== quizId ? qz : { ...qz, questions: [...qz.questions, { id: newId(), ...q }] }
                    )
                })),
            updateQuestion: (quizId, q) =>
                set((s) => ({
                    quizzes: s.quizzes.map((qz) =>
                        qz.id !== quizId
                            ? qz
                            : { ...qz, questions: qz.questions.map((x) => (x.id === q.id ? q : x)) }
                    )
                })),
            removeQuestion: (quizId, questionId) =>
                set((s) => ({
                    quizzes: s.quizzes.map((qz) =>
                        qz.id !== quizId
                            ? qz
                            : { ...qz, questions: qz.questions.filter((q) => q.id !== questionId) }
                    )
                })),
            submitAttempt: (att) => {
                const full: TAttempt = { id: newId(), ...att }
                set((s) => ({ attempts: [full, ...s.attempts] }))
                return full
            }
        }),
        {
            name: 'learnhub.quizzes',
            storage: createJSONStorage(() => localStorage),
            version: 1
        }
    )
)

export const gradeQuiz = (quiz: TQuiz, answers: Record<string, number>): { scorePercent: number; passed: boolean } => {
    const total = quiz.questions.reduce((n, q) => n + q.points, 0)
    if (total === 0) return { scorePercent: 0, passed: false }
    const earned = quiz.questions.reduce((n, q) => n + (answers[q.id] === q.correctIndex ? q.points : 0), 0)
    const pct = Math.round((earned / total) * 100)
    return { scorePercent: pct, passed: pct >= quiz.passPercent }
}
