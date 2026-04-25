import { z } from 'zod'

// Public enquiry payload — what a prospective student sends from the website
// landing page. Tenant is resolved from `tenantSlug` in the body OR from the
// Host header's sub-domain, so the form can be embedded on any tenant site
// without extra wiring.
//
// The structured education / professional / gap blocks mirror the onboarding
// form so we capture the same applicant context up-front. Everything beyond
// the basics is optional.
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

export const createEnquirySchema = z.object({
    tenantSlug: z.string().min(1).max(80).optional(),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    phone: z
        .string()
        .trim()
        .min(6)
        .max(32)
        .regex(/^[+0-9 ()-]+$/, 'Phone contains invalid characters'),
    course: z.string().trim().min(2).max(200),
    language: z.string().trim().max(40).optional(),
    city: z.string().trim().max(120).optional(),
    address: z.string().trim().max(500).optional(),
    qualification: z.string().trim().max(160).optional(),
    message: z.string().trim().max(1000).optional(),
    utmSource: z.string().trim().max(80).optional(),
    utmMedium: z.string().trim().max(80).optional(),
    utmCampaign: z.string().trim().max(80).optional(),
    education: z
        .object({
            graduation: educationEntrySchema.optional(),
            masters: educationEntrySchema.optional()
        })
        .optional(),
    professional: professionalSchema.optional(),
    gap: gapSchema.optional()
})

export type TCreateEnquiryInput = z.infer<typeof createEnquirySchema>

export const stageUpdateSchema = z.object({
    stage: z.enum(['NEW', 'DEMO_SCHEDULED', 'CONVERTED', 'LOST'])
})

export const reassignSchema = z.object({
    counsellorId: z.string().uuid()
})
