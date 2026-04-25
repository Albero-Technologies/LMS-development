import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type CounsellorInviteStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED'

export type CounsellorInviteLink = {
    id: string
    tenantId: string
    counsellorId: string
    token: string
    label: string | null
    courseId: string | null
    maxUses: number
    usesCount: number
    status: CounsellorInviteStatus
    expiresAt: string
    lastUsedAt: string | null
    createdAt: string
    course?: { id: string; title: string; slug: string } | null
    _count?: { signups: number }
}

export type CreateInviteLinkPayload = {
    label?: string
    courseId?: string
    maxUses?: number
    expiresInDays?: number
}

export const listInviteLinks = async (): Promise<CounsellorInviteLink[]> => {
    const { data } = await api.get<Envelope<CounsellorInviteLink[]>>('/counsellor/invites')
    return data.data
}

export const createInviteLink = async (payload: CreateInviteLinkPayload): Promise<CounsellorInviteLink> => {
    const { data } = await api.post<Envelope<CounsellorInviteLink>>('/counsellor/invites', payload)
    return data.data
}

export const revokeInviteLink = async (id: string): Promise<CounsellorInviteLink> => {
    const { data } = await api.delete<Envelope<CounsellorInviteLink>>(`/counsellor/invites/${id}`)
    return data.data
}

// Construct the public URL the prospect opens. The OnboardingPage at
// /onboarding/:token consumes it. window.location.origin works here because
// counsellors are always in the dashboard SPA when they call this.
export const buildInviteUrl = (token: string): string => {
    if (typeof window === 'undefined') return `/onboarding/${token}`
    return `${window.location.origin}/onboarding/${token}`
}
