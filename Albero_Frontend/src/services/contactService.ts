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

// Short-form lead capture for callback forms (Program counsellor side-card,
// FinalCTA on the home page, curriculum download modal). Same backend endpoint
// as sendContactForm — what differs is the source tag (so admins can filter
// the pipeline by funnel surface) and the optional program slug.
export interface LeadData {
    name: string
    email: string
    phone: string
    /** Program slug or display name. Falls back to "General enquiry". */
    course?: string
    /** Free-text note (optional — curriculum modal uses it; callback forms skip). */
    message?: string
    /**
     * Which surface produced the lead. Stored on the backend as `utmSource`
     * → `source: 'utm:<surface>'` so the admin pipeline can group by funnel.
     */
    surface: 'callback-final-cta' | 'callback-program-card' | 'curriculum-download' | 'home-hero' | 'contact-page'
}

export const sendLeadForm = async (data: LeadData) => {
    const payload = {
        tenantSlug: TENANT_SLUG,
        name: data.name,
        email: data.email,
        phone: data.phone,
        course: data.course || 'General enquiry',
        message: data.message,
        utmSource: data.surface
    }
    const res = await apiClient.post('/enquiries', payload)
    return res.data.data
}
