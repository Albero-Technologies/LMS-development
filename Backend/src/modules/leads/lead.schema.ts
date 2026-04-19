import { z } from 'zod'
import { LeadInteractionType, LeadStage } from '@prisma/client'

export const createLeadSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().optional(),
    phone: z.string().min(5).max(20).optional(),
    source: z.string().max(80).optional(),
    stage: z.nativeEnum(LeadStage).default(LeadStage.NEW),
    assignedToId: z.string().uuid().optional(),
    nextActionAt: z.coerce.date().optional(),
    notes: z.string().max(5000).optional()
})

export const updateLeadSchema = createLeadSchema.partial()

export const moveStageSchema = z.object({
    stage: z.nativeEnum(LeadStage)
})

export const createInteractionSchema = z.object({
    type: z.nativeEnum(LeadInteractionType),
    note: z.string().min(1).max(5000),
    durationSec: z.number().int().min(0).max(14_400).optional()
})

export const listLeadsQuerySchema = z.object({
    stage: z.nativeEnum(LeadStage).optional(),
    assignedToId: z.string().uuid().optional(),
    q: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50)
})

export type TCreateLeadInput = z.infer<typeof createLeadSchema>
export type TUpdateLeadInput = z.infer<typeof updateLeadSchema>
export type TMoveStageInput = z.infer<typeof moveStageSchema>
export type TCreateInteractionInput = z.infer<typeof createInteractionSchema>
export type TListLeadsQuery = z.infer<typeof listLeadsQuerySchema>
