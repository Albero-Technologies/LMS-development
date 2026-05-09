import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type EnrollmentStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'
export type EnrollmentAccessTier = 'DEMO' | 'FULL'

export type Enrollment = {
    id: string
    tenantId: string
    userId: string
    courseId: string
    batchId: string | null
    status: EnrollmentStatus
    // Access tier — DEMO when only the registration fee was paid; FULL
    // unlocks every lesson. Defaults to FULL on rows created before the
    // demo-mode migration so legacy single-payment enrolments stay open.
    accessTier: EnrollmentAccessTier
    demoLessonLimit: number | null
    demoExpiresAt: string | null
    progressPct: number
    startedAt: string | null
    completedAt: string | null
    createdAt: string
    course: {
        id: string
        title: string
        slug: string
        thumbnailUrl: string | null
        price?: number
        currency?: string
        gstPercent?: number
    } | null
    batch: { id: string; name: string; code: string; startDate: string | null } | null
    // Computed by the backend so the student-side balance banner has a
    // figure to show even when no DUE invoice was generated yet (e.g.
    // legacy registration-fee enrolments). All values in paise.
    coursePriceMinor?: number
    paidAmountMinor?: number
    pendingAmountMinor?: number
    impliedBalanceMinor?: number
}

export type StartEnrollmentInput = {
    courseId: string
    batchId?: string
}

export type StartEnrollmentResponse = {
    enrollment: { id: string; status: EnrollmentStatus; courseId: string; tenantId: string }
    invoice: { id: string; number: string; totalAmount: number; currency: string; status: string }
    free: boolean
    order: {
        id: string
        amount: number
        currency: string
        keyId: string
    } | null
}

export type VerifyPaymentInput = {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}

export const listMyEnrollments = async (): Promise<Enrollment[]> => {
    const { data } = await api.get<Envelope<Enrollment[]>>('/enrollments/mine')
    return data.data
}

// Admin / counsellor view — returns every enrollment in the caller's tenant.
// Backend gates this behind the 'enrollment' read policy (ADMIN, SA, TRAINER,
// COUNSELLOR per the policy file).
export type AdminEnrollmentRow = Enrollment & {
    user: { id: string; email: string; firstName: string | null; lastName: string | null } | null
}

export const adminListEnrollments = async (params?: {
    courseId?: string
    userId?: string
    status?: EnrollmentStatus
}): Promise<AdminEnrollmentRow[]> => {
    const { data } = await api.get<Envelope<AdminEnrollmentRow[]>>('/enrollments', { params })
    return data.data
}

export const startEnrollment = async (input: StartEnrollmentInput): Promise<StartEnrollmentResponse> => {
    const { data } = await api.post<Envelope<StartEnrollmentResponse>>('/enrollments', input)
    return data.data
}

export const verifyEnrollmentPayment = async (input: VerifyPaymentInput): Promise<{ id: string; status: string }> => {
    const { data } = await api.post<Envelope<{ id: string; status: string }>>('/enrollments/verify-payment', input)
    return data.data
}

export const isPaid = (e: Enrollment): boolean => e.status === 'ACTIVE' || e.status === 'COMPLETED'
export const isPending = (e: Enrollment): boolean => e.status === 'PENDING_PAYMENT'
