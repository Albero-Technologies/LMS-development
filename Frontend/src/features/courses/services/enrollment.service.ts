import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type EnrollmentStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'

export type Enrollment = {
    id: string
    tenantId: string
    userId: string
    courseId: string
    batchId: string | null
    status: EnrollmentStatus
    progressPct: number
    startedAt: string | null
    completedAt: string | null
    createdAt: string
    course: {
        id: string
        title: string
        slug: string
        thumbnailUrl: string | null
    } | null
    batch: { id: string; name: string; code: string; startDate: string | null } | null
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
