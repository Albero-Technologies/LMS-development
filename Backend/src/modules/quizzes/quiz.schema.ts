import { z } from 'zod'

export const quizQuestionSchema = z.object({
    prompt: z.string().min(3).max(2000),
    options: z
        .array(z.object({ id: z.string().min(1).max(10), text: z.string().min(1).max(500) }))
        .min(2)
        .max(10),
    correctIds: z.array(z.string().min(1).max(10)).min(1).max(10),
    marks: z.number().int().min(1).max(100).default(1),
    order: z.number().int().min(0).max(1000).default(0)
})

export const createQuizSchema = z.object({
    courseId: z.string().uuid(),
    title: z.string().min(3).max(200),
    description: z.string().max(2000).optional(),
    durationSec: z.number().int().min(60).max(10_800).default(600),
    maxAttempts: z.number().int().min(1).max(10).default(3),
    passPercent: z.number().int().min(1).max(100).default(60),
    questions: z.array(quizQuestionSchema).min(1).max(100)
})

export const updateQuizSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(2000).optional(),
    durationSec: z.number().int().min(60).max(10_800).optional(),
    maxAttempts: z.number().int().min(1).max(10).optional(),
    passPercent: z.number().int().min(1).max(100).optional(),
    isPublished: z.boolean().optional(),
    questions: z.array(quizQuestionSchema).min(1).max(100).optional()
})

export const submitAttemptSchema = z.object({
    answers: z.array(
        z.object({
            questionId: z.string().uuid(),
            selectedIds: z.array(z.string().min(1).max(10)).min(0).max(10)
        })
    )
})

export type TCreateQuizInput = z.infer<typeof createQuizSchema>
export type TUpdateQuizInput = z.infer<typeof updateQuizSchema>
export type TSubmitAttemptInput = z.infer<typeof submitAttemptSchema>
