import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

// The shape varies per role — backend returns whichever stats apply. The
// frontend dashboards already know which role they render so they can narrow
// the type at the call site.
export type DashboardResponse = {
    stats: Record<string, number>
    nextActions?: { label: string; link: string }[]
    monitoring?: unknown
    target?: unknown
}

export const getMyDashboard = async (): Promise<DashboardResponse> => {
    const { data } = await api.get<Envelope<DashboardResponse>>('/dashboard/me')
    return data.data
}

// Reports endpoint — per-tenant or platform-wide depending on caller role.
export type ReportsResponse = {
    scope: 'tenant' | 'platform'
    stats: {
        activeLearners: number
        signupsThisWeek: number
        collectedThisWeek: number // paise
        quizAttempts: number
        totalEnrollments: number
        totalStudents: number
    }
    trend: { week: string; revenue: number; count: number }[]
}

export const getReports = async (params?: { tenantSlug?: string }): Promise<ReportsResponse> => {
    const { data } = await api.get<Envelope<ReportsResponse>>('/dashboard/reports', { params })
    return data.data
}
