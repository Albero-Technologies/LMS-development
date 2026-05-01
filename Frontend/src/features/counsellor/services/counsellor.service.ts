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
    const { data } = await api.post<Envelope<CounsellorInviteLink>>(`/counsellor/invites/${id}/revoke`)
    return data.data
}

// Hard-removes the link from the counsellor's list. Existing signups created
// from it stay intact, but the link can no longer be revived.
export const deleteInviteLink = async (id: string): Promise<void> => {
    await api.delete(`/counsellor/invites/${id}`)
}

// Detailed view used by the link-info modal — backend returns the link plus
// every signup it produced and the related counsellor + tenant + course.
export interface InviteLinkSignup {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    status: string
    createdAt: string
    userId: string | null
}

export interface InviteLinkDetail extends CounsellorInviteLink {
    counsellor?: { id: string; firstName: string; lastName: string; email: string } | null
    tenant?: { id: string; name: string; slug: string } | null
    signups?: InviteLinkSignup[]
}

export const getInviteLink = async (id: string): Promise<InviteLinkDetail> => {
    const { data } = await api.get<Envelope<InviteLinkDetail>>(`/counsellor/invites/${id}`)
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
    password: string | null
    loginUrl?: string
}

export const shareStudentCreds = async (signupId: string): Promise<SharedCreds> => {
    const { data } = await api.post<Envelope<SharedCreds>>(`/counsellor/invites/signups/${signupId}/share`)
    return data.data
}

// Issue a fresh password — used when the original was lost or the student
// already signed in (which clears the plaintext-readable copy).
export const regenerateStudentCreds = async (signupId: string): Promise<SharedCreds> => {
    const { data } = await api.post<Envelope<SharedCreds>>(`/counsellor/invites/signups/${signupId}/regenerate`)
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

// Manager / admin uses this to set a counsellor's target for a given month.
// `periodStart` is normalised server-side to the first of the month.
export type SetCounsellorTargetPayload = {
    counsellorId: string
    periodStart: string // ISO date
    targetSignups: number
    targetEnrolments: number
    targetRevenue: number // paise
}

export const setCounsellorTarget = async (payload: SetCounsellorTargetPayload): Promise<void> => {
    await api.post('/counsellor/targets', payload)
}

export const getMyTargetHistory = async (months = 5): Promise<CounsellorMonthBucket[]> => {
    const { data } = await api.get<Envelope<CounsellorMonthBucket[]>>('/counsellor/targets/history', { params: { months } })
    return data.data
}

// ---- Manager dashboard (team rollup) -------------------------------------

export interface ManagerMember {
    id: string
    name: string
    email: string
    employeeCode: string | null
    status: string
    avatarUrl: string | null
    lastLoginAt: string | null
    target: { signups: number; enrolments: number; revenue: number }
    actual: { signups: number; enrolments: number; revenue: number }
    completionPct: number
    revenueRemaining: number
    enrolmentsRemaining: number
    incentive: { tier: string; ratePct: number; payout: number }
}

export interface ManagerProfile {
    id: string
    name: string
    email: string
    employeeCode: string | null
    status: string
    avatarUrl: string | null
    target: { signups: number; enrolments: number; revenue: number }
}

export interface ManagerDashboard {
    period: { start: string; end: string }
    managerId: string
    manager: ManagerProfile | null
    teamSize: number
    teamTotals: {
        targetRevenue: number
        actualRevenue: number
        targetEnrolments: number
        actualEnrolments: number
        signups: number
        incentivePayout: number
        completionPct: number
        revenueRemaining: number
        enrolmentsRemaining: number
    }
    topPerformer: { id: string; name: string; revenue: number; pct: number } | null
    bottomPerformer: { id: string; name: string; revenue: number; pct: number } | null
    members: ManagerMember[]
    monthly: { label: string; start: string; target: number; actual: number; pct: number; remaining: number }[]
    incentiveSlabs: { minPct: number; label: string; rate: number }[]
}

export const getManagerDashboard = async (managerId?: string): Promise<ManagerDashboard> => {
    const { data } = await api.get<Envelope<ManagerDashboard>>('/counsellor/reports/manager-dashboard', {
        params: managerId ? { managerId } : undefined
    })
    return data.data
}
