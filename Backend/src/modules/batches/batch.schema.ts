import { z } from 'zod'
import { BatchStatus } from '@prisma/client'

export const createBatchSchema = z.object({
    courseId: z.string().uuid(),
    name: z.string().min(2).max(120),
    code: z.string().min(2).max(40),
    trainerId: z.string().uuid().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    capacity: z.number().int().min(1).max(1000).default(50),
    // SUPER_ADMIN cross-tenant scope. Silently ignored for any other role —
    // the service layer falls back to req.auth.tenantId.
    tenantId: z.string().uuid().optional()
})

export const listBatchesQuerySchema = z.object({
    courseId: z.string().uuid().optional(),
    tenantId: z.string().uuid().optional()
})

export const updateBatchSchema = z.object({
    name: z.string().min(2).max(120).optional(),
    trainerId: z.string().uuid().nullable().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullable().optional(),
    capacity: z.number().int().min(1).max(1000).optional(),
    status: z.nativeEnum(BatchStatus).optional()
})

export const assignStudentsSchema = z.object({
    userIds: z.array(z.string().uuid()).min(1).max(500)
})

export const transferStudentSchema = z.object({
    userId: z.string().uuid(),
    targetBatchId: z.string().uuid()
})

export type TCreateBatchInput = z.infer<typeof createBatchSchema>
export type TUpdateBatchInput = z.infer<typeof updateBatchSchema>
export type TListBatchesQuery = z.infer<typeof listBatchesQuerySchema>
export type TAssignStudentsInput = z.infer<typeof assignStudentsSchema>
export type TTransferStudentInput = z.infer<typeof transferStudentSchema>
