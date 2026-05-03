import { z } from 'zod'

// Public payload — minimal: just the email + the tenant slug so we know
// which institute the visitor is signing up for.
export const subscribeSchema = z.object({
    tenantSlug: z.string().min(1).max(80).optional(),
    email: z.string().trim().toLowerCase().email(),
    name: z.string().trim().min(1).max(120).optional(),
    source: z.string().trim().max(80).optional(),
    utmSource: z.string().trim().max(80).optional(),
    utmMedium: z.string().trim().max(80).optional(),
    utmCampaign: z.string().trim().max(80).optional()
})

export type TSubscribeInput = z.infer<typeof subscribeSchema>

export const updateStatusSchema = z.object({
    status: z.enum(['active', 'unsubscribed'])
})
