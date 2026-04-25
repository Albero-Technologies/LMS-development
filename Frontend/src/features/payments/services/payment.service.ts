import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type InvoiceStatus = 'DRAFT' | 'DUE' | 'PAID' | 'FAILED' | 'REFUNDED'

export type Invoice = {
    id: string
    number: string
    amount: number
    currency: string
    gstPercent: number
    gstAmount: number
    totalAmount: number
    status: InvoiceStatus
    dueAt: string | null
    paidAt: string | null
    pdfUrl: string | null
    gateway: 'RAZORPAY' | 'STRIPE' | null
    gatewayOrderId: string | null
    enrollmentId: string | null
    createdAt: string
    enrollment: {
        id: string
        status: string
        course: { id: string; title: string; slug: string; thumbnailUrl: string | null } | null
    } | null
}

export type RazorpayOrder = {
    invoiceId: string
    invoiceNumber: string
    order: {
        id: string
        amount: number
        currency: string
        keyId: string
    }
}

export const listMyPendingInvoices = async (): Promise<Invoice[]> => {
    const { data } = await api.get<Envelope<Invoice[]>>('/payments/pending')
    return data.data
}

export const listMyInvoices = async (): Promise<Invoice[]> => {
    const { data } = await api.get<Envelope<Invoice[]>>('/payments/invoices')
    return data.data
}

export const createPaymentOrder = async (invoiceId: string): Promise<RazorpayOrder> => {
    const { data } = await api.post<Envelope<RazorpayOrder>>(`/payments/${invoiceId}/pay`)
    return data.data
}

// Convenience derived flags. Backend statuses are DRAFT|DUE|PAID|FAILED|REFUNDED.
// "Overdue" is a UI concept = status DUE with dueAt in the past.
export const isOverdue = (inv: Invoice): boolean => inv.status === 'DUE' && inv.dueAt !== null && new Date(inv.dueAt).getTime() < Date.now()

// Admin collections view — every invoice in the tenant. Trainers are
// auto-scoped server-side to their own courses.
export type AdminInvoiceRow = Invoice & {
    user: { id: string; firstName: string; lastName: string; email: string } | null
}

export const listAdminInvoices = async (): Promise<AdminInvoiceRow[]> => {
    const { data } = await api.get<Envelope<AdminInvoiceRow[]>>('/payments/admin/invoices')
    return data.data
}

export const refundInvoice = async (invoiceId: string): Promise<Invoice> => {
    const { data } = await api.post<Envelope<Invoice>>(`/payments/admin/${invoiceId}/refund`)
    return data.data
}
