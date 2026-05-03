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

export const listMyLeads = async (filter: LeadListFilter = {}): Promise<Lead[]> => {
    const { data } = await api.get<Envelope<Lead[]>>('/enquiries/me', { params: filter })
    return data.data
}

export const updateLeadStage = async (id: string, stage: LeadStage): Promise<Lead> => {
    const { data } = await api.patch<Envelope<Lead>>(`/enquiries/${id}/stage`, { stage })
    return data.data
}

export const reassignLead = async (id: string, counsellorId: string): Promise<Lead> => {
    const { data } = await api.patch<Envelope<Lead>>(`/enquiries/${id}/reassign`, { counsellorId })
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

export const listAssignableCounsellors = async (): Promise<AssignableUser[]> => {
    const fetchRole = async (role: AssignableUser['role']): Promise<AssignableUser[]> => {
        const { data } = await api.get<Envelope<UsersListEnvelope>>('/users', { params: { role, take: 100 } })
        return data.data.items
    }
    const [counsellors, managers] = await Promise.all([fetchRole('COUNSELLOR'), fetchRole('COUNSELLING_MANAGER')])
    // Show counsellors first (they take most leads), then managers.
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
