import apiClient from '@/lib/apiClient'
import { TENANT_SLUG } from '@/config/tenant'

// Public newsletter subscribe call. Idempotent — resubscribing the same email
// just reactivates the existing row server-side.
export interface NewsletterSubscribeInput {
    email: string
    name?: string
    source?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
}

export const subscribeToNewsletter = async (data: NewsletterSubscribeInput) => {
    const payload = {
        tenantSlug: TENANT_SLUG,
        email: data.email,
        name: data.name,
        source: data.source ?? 'website',
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign
    }
    const res = await apiClient.post('/newsletter/subscribe', payload)
    return res.data.data as { id: string; email: string }
}
