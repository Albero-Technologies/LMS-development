import { EnrollmentStatus, type Prisma, QuizAttemptStatus, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { type TCreateQuizInput, type TSubmitAttemptInput, type TUpdateQuizInput } from './quiz.schema'

const assertTrainerOwnsCourse = async (tenantId: string, courseId: string, actor: { id: string; role: Role }) => {
    const course = await db.client.course.findFirst({ where: { id: courseId, tenantId } })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'))
    if (actor.role === Role.TRAINER && course.trainerId !== actor.id) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_COURSE_OWNER')
    }
}

export const createQuiz = async (tenantId: string, input: TCreateQuizInput, actor: { id: string; role: Role }) => {
    await assertTrainerOwnsCourse(tenantId, input.courseId, actor)

    return db.client.$transaction(async (tx) => {
        const quiz = await tx.quiz.create({
            data: {
                tenantId,
                courseId: input.courseId,
                title: input.title,
                description: input.description,
                durationSec: input.durationSec,
                maxAttempts: input.maxAttempts,
                passPercent: input.passPercent
            }
        })

        await tx.quizQuestion.createMany({
            data: input.questions.map((q) => ({
                quizId: quiz.id,
                prompt: q.prompt,
                options: q.options as unknown as Prisma.InputJsonValue,
                correctIds: q.correctIds,
                marks: q.marks,
                order: q.order
            }))
        })

        return quiz
    })
}

export const updateQuiz = async (tenantId: string, quizId: string, input: TUpdateQuizInput, actor: { id: string; role: Role }) => {
    const quiz = await db.client.quiz.findFirst({ where: { id: quizId, tenantId } })
    if (!quiz) throw AppError.notFound(responseMessage.NOT_FOUND('Quiz'))
    await assertTrainerOwnsCourse(tenantId, quiz.courseId, actor)

    return db.client.$transaction(async (tx) => {
        const updated = await tx.quiz.update({
            where: { id: quizId },
            data: {
                title: input.title,
                description: input.description,
                durationSec: input.durationSec,
                maxAttempts: input.maxAttempts,
                passPercent: input.passPercent,
                isPublished: input.isPublished
            }
        })
        if (input.questions) {
            await tx.quizQuestion.deleteMany({ where: { quizId } })
            await tx.quizQuestion.createMany({
                data: input.questions.map((q) => ({
                    quizId,
                    prompt: q.prompt,
                    options: q.options as unknown as Prisma.InputJsonValue,
                    correctIds: q.correctIds,
                    marks: q.marks,
                    order: q.order
                }))
            })
        }
        return updated
    })
}

export const deleteQuiz = async (tenantId: string, quizId: string, actor: { id: string; role: Role }) => {
    const quiz = await db.client.quiz.findFirst({ where: { id: quizId, tenantId } })
    if (!quiz) throw AppError.notFound(responseMessage.NOT_FOUND('Quiz'))
    await assertTrainerOwnsCourse(tenantId, quiz.courseId, actor)
    await db.client.quiz.update({ where: { id: quizId }, data: { deletedAt: new Date() } })
}

// Student-facing read — strips correct answers.
export const getQuizForStudent = async (tenantId: string, userId: string, quizId: string) => {
    const quiz = await db.client.quiz.findFirst({
        where: { id: quizId, tenantId, isPublished: true },
        include: { questions: { orderBy: { order: 'asc' } } }
    })
    if (!quiz) throw AppError.notFound(responseMessage.NOT_FOUND('Quiz'))

    const enrolled = await db.client.enrollment.findFirst({
        where: { tenantId, userId, courseId: quiz.courseId, status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] } }
    })
    if (!enrolled) throw AppError.forbidden(responseMessage.ENROLLMENT_REQUIRED, 'NO_ENROLLMENT')

    return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        durationSec: quiz.durationSec,
        passPercent: quiz.passPercent,
        maxAttempts: quiz.maxAttempts,
        questions: quiz.questions.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options,
            marks: q.marks
        }))
    }
}

// Trainer/Admin read — includes correct answers.
export const getQuizFull = async (tenantId: string, quizId: string) => {
    const quiz = await db.client.quiz.findFirst({
        where: { id: quizId, tenantId },
        include: { questions: { orderBy: { order: 'asc' } } }
    })
    if (!quiz) throw AppError.notFound(responseMessage.NOT_FOUND('Quiz'))
    return quiz
}

export const startAttempt = async (tenantId: string, userId: string, quizId: string) => {
    const quiz = await db.client.quiz.findFirst({ where: { id: quizId, tenantId, isPublished: true } })
    if (!quiz) throw AppError.notFound(responseMessage.NOT_FOUND('Quiz'))

    const enrolled = await db.client.enrollment.findFirst({
        where: {
            tenantId,
            userId,
            courseId: quiz.courseId,
            status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] }
        }
    })
    if (!enrolled) throw AppError.forbidden(responseMessage.ENROLLMENT_REQUIRED, 'NO_ENROLLMENT')

    const attemptCount = await db.client.quizAttempt.count({ where: { tenantId, quizId, userId } })
    if (attemptCount >= quiz.maxAttempts) {
        throw AppError.forbidden(responseMessage.QUIZ_ATTEMPTS_EXCEEDED, 'ATTEMPTS_EXCEEDED')
    }

    const attempt = await db.client.quizAttempt.create({
        data: {
            tenantId,
            quizId,
            userId,
            status: QuizAttemptStatus.IN_PROGRESS,
            expiresAt: new Date(Date.now() + quiz.durationSec * 1000),
            maxScore: 0
        }
    })

    return { attemptId: attempt.id, expiresAt: attempt.expiresAt }
}

export const submitAttempt = async (tenantId: string, userId: string, attemptId: string, input: TSubmitAttemptInput) => {
    const attempt = await db.client.quizAttempt.findFirst({
        where: { id: attemptId, tenantId, userId }
    })
    if (!attempt) throw AppError.notFound(responseMessage.NOT_FOUND('Attempt'))
    if (attempt.status !== QuizAttemptStatus.IN_PROGRESS) {
        throw AppError.badRequest('Attempt already submitted', 'ATTEMPT_SUBMITTED')
    }
    if (attempt.expiresAt < new Date()) {
        await db.client.quizAttempt.update({
            where: { id: attemptId },
            data: { status: QuizAttemptStatus.EXPIRED, submittedAt: new Date() }
        })
        throw AppError.badRequest(responseMessage.QUIZ_ATTEMPT_EXPIRED, 'ATTEMPT_EXPIRED')
    }

    const questions = await db.client.quizQuestion.findMany({ where: { quizId: attempt.quizId } })
    const byId = new Map(questions.map((q) => [q.id, q]))

    let score = 0
    let maxScore = 0
    for (const q of questions) maxScore += q.marks

    for (const answer of input.answers) {
        const q = byId.get(answer.questionId)
        if (!q) continue
        const correct = new Set(q.correctIds)
        const selected = new Set(answer.selectedIds)
        const allCorrectPresent = [...correct].every((c) => selected.has(c))
        const noIncorrectPresent = [...selected].every((s) => correct.has(s))
        if (allCorrectPresent && noIncorrectPresent) score += q.marks
    }

    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    const quiz = await db.client.quiz.findUnique({ where: { id: attempt.quizId } })
    const passed = percent >= (quiz?.passPercent ?? 60)

    const updated = await db.client.quizAttempt.update({
        where: { id: attemptId },
        data: {
            answers: input.answers as unknown as Prisma.InputJsonValue,
            score,
            maxScore,
            percent,
            passed,
            status: QuizAttemptStatus.SUBMITTED,
            submittedAt: new Date()
        }
    })

    return {
        id: updated.id,
        score: updated.score,
        maxScore: updated.maxScore,
        percent: updated.percent,
        passed: updated.passed,
        submittedAt: updated.submittedAt
    }
}

export const listMyAttempts = async (tenantId: string, userId: string, quizId?: string) => {
    return db.client.quizAttempt.findMany({
        where: { tenantId, userId, ...(quizId ? { quizId } : {}) },
        orderBy: { startedAt: 'desc' },
        select: {
            id: true,
            quizId: true,
            score: true,
            maxScore: true,
            percent: true,
            passed: true,
            status: true,
            startedAt: true,
            submittedAt: true
        }
    })
}
