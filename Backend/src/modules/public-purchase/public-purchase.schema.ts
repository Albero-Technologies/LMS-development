import { z } from 'zod'

// Public course-purchase flow — three-step handshake:
//   1. /init    → backend creates a Razorpay order + a NEW Enquiry as proof
//                 that someone tried to enrol; returns the order details
//   2. /verify  → after Razorpay checkout success, frontend posts the
//                 signed payment so we can verify the HMAC, create User +
//                 Enrollment + Invoice, and email login credentials
//   3. /cancel  → if the user dismisses the checkout sheet, frontend pings
//                 this so we transition the Enquiry to DEMO_SCHEDULED for
//                 counsellor follow-up (no payment, no user account)
//
// Tenant slug is required on /init because the request is unauthenticated;
// /verify and /cancel resolve the tenant from the purchaseId we issued.

// Payment intent — either a small "reserve your slot" registration fee (a
// flat tenant-configured amount) or the full course fee. The frontend lets
// the user pick a tier (Self-Paced / Mentor-Led / Career Pro) for display
// purposes; we accept the chosen tierLabel + tierPrice as advisory metadata
// (recorded on the enquiry/invoice for the counsellor to follow up), but
// the authoritative full-fee amount is always the Course.price on record
// so a tampered client cannot underpay.
export const initPurchaseSchema = z.object({
    tenantSlug: z.string().trim().min(1).max(80),
    courseSlug: z.string().trim().min(1).max(120),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    phone: z
        .string()
        .trim()
        .min(6)
        .max(32)
        .regex(/^[+0-9 ()-]+$/, 'Phone contains invalid characters'),
    city: z.string().trim().max(120).optional(),
    message: z.string().trim().max(1000).optional(),
    utmSource: z.string().trim().max(80).optional(),
    utmMedium: z.string().trim().max(80).optional(),
    utmCampaign: z.string().trim().max(80).optional(),
    paymentType: z.enum(['REGISTRATION', 'FULL']).default('FULL'),
    tierLabel: z.string().trim().max(80).optional(),
    tierPriceMinor: z.number().int().nonnegative().optional()
})

export const verifyPurchaseSchema = z.object({
    purchaseId: z.string().uuid(),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1)
})

export const cancelPurchaseSchema = z.object({
    purchaseId: z.string().uuid(),
    reason: z.string().trim().max(500).optional()
})

export type TInitPurchaseInput = z.infer<typeof initPurchaseSchema>
export type TVerifyPurchaseInput = z.infer<typeof verifyPurchaseSchema>
export type TCancelPurchaseInput = z.infer<typeof cancelPurchaseSchema>
