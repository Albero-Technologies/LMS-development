import { z } from 'zod'
import { TicketPriority, TicketStatus } from '@prisma/client'

export const createTicketSchema = z.object({
    subject: z.string().min(3).max(200),
    description: z.string().min(1).max(10_000),
    priority: z.nativeEnum(TicketPriority).default(TicketPriority.NORMAL)
})

export const updateTicketSchema = z.object({
    subject: z.string().min(3).max(200).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    assigneeId: z.string().uuid().nullable().optional()
})

export const addCommentSchema = z.object({
    body: z.string().min(1).max(10_000),
    internal: z.boolean().default(false)
})

export const listTicketsQuerySchema = z.object({
    status: z.nativeEnum(TicketStatus).optional(),
    assigneeId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
})

export type TCreateTicketInput = z.infer<typeof createTicketSchema>
export type TUpdateTicketInput = z.infer<typeof updateTicketSchema>
export type TAddCommentInput = z.infer<typeof addCommentSchema>
export type TListTicketsQuery = z.infer<typeof listTicketsQuerySchema>
