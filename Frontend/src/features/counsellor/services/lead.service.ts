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

// Public enquiry submission (used by /enquiry page). No auth — backend
// resolves the tenant from `tenantSlug` or the Host header.
export type PublicEnquiryPayload = {
    tenantSlug?: string
    name: string
    email: string
    phone: string
    course: string
    language?: string
    city?: string
    message?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
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
