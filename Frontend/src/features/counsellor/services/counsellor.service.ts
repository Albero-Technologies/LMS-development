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

// ---- My students ---------------------------------------------------------

export interface MyStudent {
    signupId: string
    studentId: string | null
    email: string
    firstName: string
    lastName: string
    phone: string | null
    status: string
    createdAt: string
    lastLoginAt: string | null
    enrollments: { id: string; status: string; progressPct: number; course: { id: string; title: string } | null }[]
    payments: { totalPaid: number; pendingAmount: number; paidCount: number; pendingCount: number }
    invoices: { id: string; number: string; totalAmount: number; status: string; dueAt: string | null; paidAt: string | null }[]
}

export const listMyStudents = async (): Promise<MyStudent[]> => {
    const { data } = await api.get<Envelope<MyStudent[]>>('/counsellor/students')
    return data.data
}

// Fetch the one-time creds for a signup (counsellor-only). Returns the
// initial password for credential sharing.
export interface SharedCreds {
    email: string
    initialPassword: string | null
}

export const shareStudentCreds = async (signupId: string): Promise<SharedCreds> => {
    const { data } = await api.post<Envelope<SharedCreds>>(`/counsellor/invites/signups/${signupId}/share`)
    return data.data
}

// ---- Targets + monthly tracker -------------------------------------------

export type CounsellorTargetSummary = {
    period: { start: string; end: string }
    target: { signups: number; enrolments: number; revenue: number }
    actual: { signups: number; enrolments: number; revenue: number }
    completionRate: { signups: number; enrolments: number; revenue: number }
}

export type CounsellorMonthBucket = {
    period: { start: string; end: string; label: string }
    target: { signups: number; enrolments: number; revenue: number }
    actual: { signups: number; enrolments: number; revenue: number }
    completionRate: { signups: number; enrolments: number; revenue: number }
    signupsRemaining: number
    enrolmentsRemaining: number
    revenueRemaining: number
}

export const getMyTarget = async (): Promise<CounsellorTargetSummary> => {
    const { data } = await api.get<Envelope<CounsellorTargetSummary>>('/counsellor/targets')
    return data.data
}

export const getMyTargetHistory = async (months = 5): Promise<CounsellorMonthBucket[]> => {
    const { data } = await api.get<Envelope<CounsellorMonthBucket[]>>('/counsellor/targets/history', { params: { months } })
    return data.data
}
