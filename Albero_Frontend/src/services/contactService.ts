import apiClient from '@/lib/apiClient'
import { TENANT_SLUG } from '@/config/tenant'

// Public Contact form submission. Maps the marketing-site form fields onto
// the backend's `Enquiry` schema — the backend auto-assigns to a counsellor
// via least-loaded round-robin and surfaces it in the admin enquiry inbox.
export interface ContactData {
    name: string
    email: string
    phone: string
    message: string
    course?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
}

export const sendContactForm = async (data: ContactData) => {
    const payload = {
        tenantSlug: TENANT_SLUG,
        name: data.name,
        email: data.email,
        phone: data.phone,
        // The backend requires `course` (the prospective program) — fall back
        // to "General enquiry" when the form has no course picker (the
        // marketing-page contact form is generic, not program-specific).
        course: data.course || 'General enquiry',
        message: data.message,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign
    }
    const res = await apiClient.post('/enquiries', payload)
    return res.data.data
}
