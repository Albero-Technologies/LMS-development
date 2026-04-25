import { z } from 'zod'

export const createInviteLinkSchema = z.object({
    label: z.string().max(120).optional(),
    courseId: z.string().uuid().optional(),
    maxUses: z.number().int().min(1).max(500).default(1),
    expiresInDays: z.number().int().min(1).max(90).default(14)
})

// Structured nested blocks. All optional — the only required basics are name,
// email, and phone. Education / professional / gap let the form gather the
// applicant's full background in one shot.
const educationEntrySchema = z.object({
    degree: z.string().max(120).optional(),
    institution: z.string().max(160).optional(),
    yearOfPassing: z.coerce.number().int().min(1950).max(2100).optional(),
    percentage: z.coerce.number().min(0).max(100).optional()
})

const professionalSchema = z.object({
    totalExperienceYears: z.coerce.number().min(0).max(60).optional(),
    role: z.string().max(120).optional(),
    industry: z.string().max(120).optional(),
    ctcLakhs: z.coerce.number().min(0).max(1000).optional(),
    description: z.string().max(2000).optional()
})

const gapSchema = z.object({
    months: z.coerce.number().int().min(0).max(12).optional(),
    years: z.coerce.number().int().min(0).max(30).optional(),
    reason: z.string().max(500).optional()
})

export const submitOnboardingSchema = z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email(),
    phone: z.string().min(5).max(20).optional(),
    dateOfBirth: z.coerce.date().optional(),
    city: z.string().max(80).optional(),
    state: z.string().max(80).optional(),
    address: z.string().max(500).optional(),
    qualification: z.string().max(120).optional(),
    interest: z.string().max(160).optional(),
    notes: z.string().max(2000).optional(),
    education: z
        .object({
            graduation: educationEntrySchema.optional(),
            masters: educationEntrySchema.optional()
        })
        .optional(),
    professional: professionalSchema.optional(),
    gap: gapSchema.optional()
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
