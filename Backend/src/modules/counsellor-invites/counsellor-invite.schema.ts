import { z } from 'zod'

export const createInviteLinkSchema = z.object({
    label: z.string().max(120).optional(),
    courseId: z.string().uuid().optional(),
    maxUses: z.number().int().min(1).max(500).default(1),
    expiresInDays: z.number().int().min(1).max(90).default(14)
})

export const submitOnboardingSchema = z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email(),
    phone: z.string().min(5).max(20).optional(),
    dateOfBirth: z.coerce.date().optional(),
    city: z.string().max(80).optional(),
    state: z.string().max(80).optional(),
    qualification: z.string().max(120).optional(),
    interest: z.string().max(160).optional(),
    notes: z.string().max(2000).optional()
})

export const setTargetSchema = z.object({
    counsellorId: z.string().uuid(),
    periodStart: z.coerce.date(),
    targetSignups: z.number().int().min(0).max(100_000).default(0),
    targetEnrolments: z.number().int().min(0).max(100_000).default(0),
    targetRevenue: z.number().int().min(0).default(0)
})

export type TCreateInviteLinkInput = z.infer<typeof createInviteLinkSchema>
export type TSubmitOnboardingInput = z.infer<typeof submitOnboardingSchema>
export type TSetTargetInput = z.infer<typeof setTargetSchema>
