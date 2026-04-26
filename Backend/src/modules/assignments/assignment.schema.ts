import { z } from 'zod'
import { AssignmentSubmissionStatus } from '@prisma/client'

export const createAssignmentSchema = z.object({
    courseId: z.string().uuid(),
    title: z.string().min(3).max(200),
    description: z.string().max(2000).optional(),
    instructions: z.string().max(20_000).optional(),
    dueAt: z.coerce.date().optional(),
    maxScore: z.number().int().min(1).max(1000).default(100),
    trainerId: z.string().uuid().optional(),
    isPublished: z.boolean().default(false)
})

export const updateAssignmentSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    instructions: z.string().max(20_000).nullable().optional(),
    dueAt: z.coerce.date().nullable().optional(),
    maxScore: z.number().int().min(1).max(1000).optional(),
    trainerId: z.string().uuid().nullable().optional(),
    isPublished: z.boolean().optional()
})

export const listAssignmentsQuerySchema = z.object({
    courseId: z.string().uuid().optional(),
    status: z.enum(['draft', 'published']).optional()
})

export const submitAssignmentSchema = z.object({
    textAnswer: z.string().max(50_000).optional(),
    fileUrl: z.string().url().max(2048).optional(),
    seal: z.boolean().default(true) // false = save as DRAFT, true = mark SUBMITTED
})

export const gradeSubmissionSchema = z.object({
    score: z.number().int().min(0).max(1000),
    feedback: z.string().max(10_000).optional(),
    // RETURNED lets the student edit + re-submit; GRADED is final.
    status: z
        .enum([AssignmentSubmissionStatus.GRADED, AssignmentSubmissionStatus.RETURNED])
        .default(AssignmentSubmissionStatus.GRADED)
})

export type TCreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type TUpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
export type TListAssignmentsQuery = z.infer<typeof listAssignmentsQuerySchema>
export type TSubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>
export type TGradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>
