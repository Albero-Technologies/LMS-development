import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type DemoEnrolmentRow = {
    id: string
    tenantId: string
    tenant: { id: string; name: string; slug: string }
    user: { id: string; name: string; email: string; lastLoginAt: string | null }
    course: { id: string; title: string; demoEnabled: boolean; demoLessonDefault: number; demoExpiryDays: number | null }
    accessTier: 'DEMO' | 'FULL'
    status: string
    progressPct: number
    demoLessonLimit: number | null
    demoLessonAllowlist: string[]
    demoExpiresAt: string | null
    manualUpgradeAt: string | null
    manualUpgradeReason: string | null
    paymentStatus: 'PAID' | 'PENDING' | 'NONE'
    pendingAmount: number
    totalPaid: number
    createdAt: string
}

export type ListDemoEnrolmentsResponse = {
    items: DemoEnrolmentRow[]
    total: number
    page: number
    pageSize: number
}

export type ListDemoEnrolmentsQuery = {
    page?: number
    pageSize?: number
    q?: string
    courseId?: string
    accessTier?: 'DEMO' | 'FULL'
    tenantSlug?: string
}

export const listDemoEnrolments = async (params: ListDemoEnrolmentsQuery): Promise<ListDemoEnrolmentsResponse> => {
    const { data } = await api.get<Envelope<ListDemoEnrolmentsResponse>>('/demo-mode/enrolments', { params })
    return data.data
}

export type UpdateDemoEnrolmentInput = {
    accessTier?: 'DEMO' | 'FULL'
    demoLessonLimit?: number | null
    demoLessonAllowlist?: string[]
    demoExpiresAt?: string | null
    manualUpgradeReason?: string
}

export const updateDemoEnrolment = async (id: string, payload: UpdateDemoEnrolmentInput) => {
    const { data } = await api.patch<Envelope<DemoEnrolmentRow>>(`/demo-mode/enrolments/${id}`, payload)
    return data.data
}

export type BulkUpdateDemoInput = {
    enrolmentIds: string[]
    accessTier?: 'DEMO' | 'FULL'
    demoLessonLimit?: number | null
    manualUpgradeReason?: string
}

export const bulkUpdateDemo = async (payload: BulkUpdateDemoInput) => {
    const { data } = await api.post<Envelope<{ ok: string[]; failed: { id: string; reason: string }[]; totalRequested: number }>>(
        '/demo-mode/enrolments/bulk',
        payload
    )
    return data.data
}

export const sendDemoPaymentReminder = async (enrolmentId: string, note?: string) => {
    const { data } = await api.post<Envelope<{ ok: boolean; sentTo: string; pendingAmount: number }>>(
        '/demo-mode/enrolments/reminder',
        { enrolmentId, note }
    )
    return data.data
}
