import apiClient from '@/lib/apiClient'
import { TENANT_SLUG } from '@/config/tenant'

// Three-step public checkout. tenantSlug is bundled into init from the
// site's compile-time config; verify + cancel only need the purchaseId
// the backend returns from init.

export interface InitPurchaseInput {
    courseSlug: string
    name: string
    email: string
    phone: string
    city?: string
    message?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
}

export interface InitPurchaseResponse {
    purchaseId: string
    orderId: string
    amount: number
    currency: string
    keyId: string
    courseTitle: string
    courseId: string
    prefill: { name: string; email: string; phone: string }
}

export const initPurchase = async (input: InitPurchaseInput): Promise<InitPurchaseResponse> => {
    const res = await apiClient.post('/public/purchase/init', { tenantSlug: TENANT_SLUG, ...input })
    return res.data.data
}

export interface VerifyPurchaseInput {
    purchaseId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}

export interface VerifyPurchaseResponse {
    enrolled: boolean
    alreadyProcessed: boolean
    courseTitle: string
    email: string
    loginUrl: string
    invoiceNumber?: string
}

export const verifyPurchase = async (input: VerifyPurchaseInput): Promise<VerifyPurchaseResponse> => {
    const res = await apiClient.post('/public/purchase/verify', input)
    return res.data.data
}

export interface CancelPurchaseInput {
    purchaseId: string
    reason?: string
}

export interface CancelPurchaseResponse {
    ok: boolean
    message: string
    alreadyConverted?: boolean
    assignedCounsellor?: { id: string; name: string } | null
}

export const cancelPurchase = async (input: CancelPurchaseInput): Promise<CancelPurchaseResponse> => {
    const res = await apiClient.post('/public/purchase/cancel', input)
    return res.data.data
}
