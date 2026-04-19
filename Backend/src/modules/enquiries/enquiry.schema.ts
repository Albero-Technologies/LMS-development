import { z } from 'zod'

// Public enquiry payload — what a prospective student sends from the website
// landing page. Tenant is resolved from `tenantSlug` in the body OR from the
// Host header's sub-domain, so the form can be embedded on any tenant site
// without extra wiring.
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
    message: z.string().trim().max(1000).optional(),
    utmSource: z.string().trim().max(80).optional(),
    utmMedium: z.string().trim().max(80).optional(),
    utmCampaign: z.string().trim().max(80).optional()
})

export type TCreateEnquiryInput = z.infer<typeof createEnquirySchema>

export const stageUpdateSchema = z.object({
    stage: z.enum(['NEW', 'DEMO_SCHEDULED', 'CONVERTED', 'LOST'])
})

export const reassignSchema = z.object({
    counsellorId: z.string().uuid()
})
