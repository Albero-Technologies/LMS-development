import { CounsellorTaskPriority, CounsellorTaskStatus } from '@prisma/client'
import { z } from 'zod'

// Reports accept either a free-form date range OR a named preset for convenience.
export const reportRangeSchema = z
    .object({
        preset: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional()
    })
    .refine((v) => v.preset || (v.from && v.to), {
        message: 'Either `preset` OR both `from` and `to` are required'
    })

export const assignManagerSchema = z.object({
    counsellorId: z.string().uuid(),
    managerId: z.string().uuid().nullable()
})

export const createTaskSchema = z.object({
    assigneeId: z.string().uuid(),
    title: z.string().min(1).max(160),
    description: z.string().max(2000).optional(),
    priority: z.nativeEnum(CounsellorTaskPriority).default(CounsellorTaskPriority.NORMAL),
    dueAt: z.coerce.date().optional()
})

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(2000).nullable().optional(),
    priority: z.nativeEnum(CounsellorTaskPriority).optional(),
    status: z.nativeEnum(CounsellorTaskStatus).optional(),
    dueAt: z.coerce.date().nullable().optional()
})

export const taskListQuerySchema = z.object({
    status: z.nativeEnum(CounsellorTaskStatus).optional(),
    assigneeId: z.string().uuid().optional()
})

export type TReportRange = z.infer<typeof reportRangeSchema>
export type TAssignManager = z.infer<typeof assignManagerSchema>
export type TCreateTask = z.infer<typeof createTaskSchema>
export type TUpdateTask = z.infer<typeof updateTaskSchema>
export type TTaskListQuery = z.infer<typeof taskListQuerySchema>
