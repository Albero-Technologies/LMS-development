import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type PaymentMethod = 'ONLINE' | 'EMI' | 'CASH'
export type PaymentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface PaymentRequestRow {
    id: string
    tenantId: string
    invoiceId: string | null
    method: PaymentMethod
    amountMinor: number
    amountDisplay: string
    currency: string
    note: string | null
    emiTotal: number | null
    emiSequence: number | null
    status: PaymentRequestStatus
    rejectionReason: string | null
    createdAt: string
    reviewedAt: string | null
    requestedBy: { id: string; name: string; email: string }
    student: { id: string; name: string; email: string }
    reviewer: { id: string; name: string; email: string } | null
    invoice: { id: string; number: string; totalAmount: number; status: string } | null
    tenant?: { id: string; name: string; slug: string }
}

export interface ListPaymentRequestsResponse {
    items: PaymentRequestRow[]
    total: number
    page: number
    pageSize: number
}

export interface ListPaymentRequestsQuery {
    page?: number
    pageSize?: number
    status?: PaymentRequestStatus
    studentId?: string
    requestedById?: string
    tenantSlug?: string
}

export const listPaymentRequests = async (query: ListPaymentRequestsQuery): Promise<ListPaymentRequestsResponse> => {
    const { data } = await api.get<Envelope<ListPaymentRequestsResponse>>('/payment-requests', { params: query })
    return data.data
}

export interface CreatePaymentRequestInput {
    studentId: string
    invoiceId?: string
    method: 'EMI' | 'CASH'
    amountMinor: number
    currency?: string
    note?: string
    emiTotal?: number
    emiSequence?: number
}

export const createPaymentRequest = async (input: CreatePaymentRequestInput): Promise<PaymentRequestRow> => {
    const { data } = await api.post<Envelope<PaymentRequestRow>>('/payment-requests', input)
    return data.data
}

export interface ReviewPaymentRequestInput {
    decision: 'APPROVE' | 'REJECT'
    rejectionReason?: string
    invoiceNote?: string
}

export const reviewPaymentRequest = async (id: string, input: ReviewPaymentRequestInput) => {
    const { data } = await api.post<Envelope<{ request: PaymentRequestRow; invoice: unknown }>>(`/payment-requests/${id}/review`, input)
    return data.data
}

export const cancelPaymentRequest = async (id: string, reason?: string) => {
    const { data } = await api.post<Envelope<PaymentRequestRow>>(`/payment-requests/${id}/cancel`, { reason })
    return data.data
}
