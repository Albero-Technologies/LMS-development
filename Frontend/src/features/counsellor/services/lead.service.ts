import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type LeadStage = 'NEW' | 'DEMO_SCHEDULED' | 'CONVERTED' | 'LOST'

export type Lead = {
    id: string
    tenantId: string
    name: string
    email: string
    phone: string
    course: string
    language: string | null
    city: string | null
    message: string | null
    stage: LeadStage
    source: string | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    assignedToId: string | null
    assignedTo: { id: string; firstName: string; lastName: string } | null
    createdAt: string
    updatedAt: string
}

export type LeadListFilter = {
    stage?: LeadStage
    assignedToId?: string
}

// `tenantId` is honoured for SUPER_ADMIN only (backend silently drops it
// for other roles). Lets SA monitor or curate any tenant's lead funnel
// from the cross-tenant Lead Pipeline view.
export const listMyLeads = async (filter: LeadListFilter = {}, tenantId?: string): Promise<Lead[]> => {
    const params: Record<string, string | undefined> = { ...filter }
    if (tenantId) params.tenantId = tenantId
    const { data } = await api.get<Envelope<Lead[]>>('/enquiries/me', { params })
    return data.data
}

export const updateLeadStage = async (id: string, stage: LeadStage, tenantId?: string): Promise<Lead> => {
    const { data } = await api.patch<Envelope<Lead>>(`/enquiries/${id}/stage`, { stage }, {
        params: tenantId ? { tenantId } : undefined
    })
    return data.data
}

export const reassignLead = async (id: string, counsellorId: string, tenantId?: string): Promise<Lead> => {
    const { data } = await api.patch<Envelope<Lead>>(`/enquiries/${id}/reassign`, { counsellorId }, {
        params: tenantId ? { tenantId } : undefined
    })
    return data.data
}

// Roster the "Assign to" picker draws from. Pulls counsellors AND counselling
// managers from the tenant via /users — admins routinely hand high-value
// leads to managers, so we surface both. Two parallel calls keep the
// payloads small (no need for an OR-role server query).
export type AssignableUser = {
    id: string
    firstName: string
    lastName: string
    email: string
    role: 'COUNSELLOR' | 'COUNSELLING_MANAGER'
}

interface UsersListEnvelope {
    items: AssignableUser[]
    total: number
}

export const listAssignableCounsellors = async (tenantId?: string): Promise<AssignableUser[]> => {
    // `/users` accepts `tenantSlug` for SA cross-tenant scoping. We don't have
    // the slug here — but the SA's `?tenantId=` on the LeadPipeline page
    // resolves to a slug via the tenants list cache. For now, when tenantId
    // is provided we drop it (SA's own /users defaults to platform tenant
    // which is empty). Users-list scoping for SA → counsellors is a TODO;
    // until then, the tenant's counsellors don't surface for SA. Leads can
    // still be moved by stage; full reassign UX needs the Tenants→Detail
    // page for now.
    const fetchRole = async (role: AssignableUser['role']): Promise<AssignableUser[]> => {
        const { data } = await api.get<Envelope<UsersListEnvelope>>('/users', {
            params: { role, take: 100, ...(tenantId ? { tenantId } : {}) }
        })
        return data.data.items
    }
    const [counsellors, managers] = await Promise.all([fetchRole('COUNSELLOR'), fetchRole('COUNSELLING_MANAGER')])
    return [...counsellors, ...managers]
}

// Public enquiry submission (used by /enquiry page). No auth — backend
// resolves the tenant from `tenantSlug` or the Host header. Mirrors the
// onboarding payload so the same applicant context is captured up-front.
export type EducationEntry = {
    degree?: string
    institution?: string
    yearOfPassing?: number
    percentage?: number
}

export type PublicEnquiryPayload = {
    tenantSlug?: string
    name: string
    email: string
    phone: string
    course: string
    language?: string
    city?: string
    address?: string
    qualification?: string
    message?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    education?: { graduation?: EducationEntry; masters?: EducationEntry }
    professional?: {
        totalExperienceYears?: number
        role?: string
        industry?: string
        ctcLakhs?: number
        description?: string
    }
    gap?: { months?: number; years?: number; reason?: string }
}

export type PublicEnquiryResponse = {
    id: string
    assignedCounsellor: { id: string; name: string } | null
}

export const submitPublicEnquiry = async (payload: PublicEnquiryPayload): Promise<PublicEnquiryResponse> => {
    const { data } = await api.post<Envelope<PublicEnquiryResponse>>('/enquiries', payload)
    return data.data
}

export const STAGE_LABEL: Record<LeadStage, string> = {
    NEW: 'New leads',
    DEMO_SCHEDULED: 'Demo scheduled',
    CONVERTED: 'Converted',
    LOST: 'Lost'
}

export const STAGE_ORDER: readonly LeadStage[] = ['NEW', 'DEMO_SCHEDULED', 'CONVERTED', 'LOST']

export const STAGE_TONE: Record<LeadStage, 'brand' | 'warn' | 'ok' | 'danger'> = {
    NEW: 'brand',
    DEMO_SCHEDULED: 'warn',
    CONVERTED: 'ok',
    LOST: 'danger'
}
