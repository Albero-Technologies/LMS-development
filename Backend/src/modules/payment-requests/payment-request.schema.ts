import { z } from 'zod'

// Counsellor → admin offline-payment workflow.
//
//   create:  counsellor submits a request to record a CASH or EMI payment
//            for one of their students. Optional invoiceId attaches it to
//            an existing DUE invoice; otherwise the admin creates a fresh
//            invoice on approval.
//   list:    counsellor sees their own requests; admin sees the tenant's
//            entire queue with filterable status.
//   review:  admin approves or rejects. On approval the linked invoice
//            (or a new one) flips to PAID with paymentMethod set.

export const createPaymentRequestSchema = z
    .object({
        studentId: z.string().uuid(),
        invoiceId: z.string().uuid().optional(),
        method: z.enum(['EMI', 'CASH']),
        amountMinor: z.number().int().min(1),
        currency: z.string().trim().min(3).max(3).default('INR'),
        note: z.string().trim().max(500).optional(),
        emiTotal: z.number().int().min(2).max(60).optional(),
        emiSequence: z.number().int().min(1).max(60).optional()
    })
    .refine((v) => v.method !== 'EMI' || (v.emiTotal && v.emiSequence && v.emiSequence <= v.emiTotal), {
        message: 'EMI requests need both emiTotal and emiSequence (sequence ≤ total)'
    })

export type TCreatePaymentRequestInput = z.infer<typeof createPaymentRequestSchema>

export const listPaymentRequestsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
    studentId: z.string().uuid().optional(),
    requestedById: z.string().uuid().optional(),
    tenantSlug: z.string().trim().max(80).optional()
})

export type TListPaymentRequestsInput = z.infer<typeof listPaymentRequestsSchema>

export const reviewPaymentRequestSchema = z
    .object({
        decision: z.enum(['APPROVE', 'REJECT']),
        rejectionReason: z.string().trim().max(500).optional(),
        // Optional override of the note saved on the resulting invoice.
        invoiceNote: z.string().trim().max(500).optional()
    })
    .refine((v) => v.decision !== 'REJECT' || (v.rejectionReason && v.rejectionReason.length > 0), {
        message: 'Rejection requires a reason'
    })

export type TReviewPaymentRequestInput = z.infer<typeof reviewPaymentRequestSchema>

export const cancelPaymentRequestSchema = z.object({
    reason: z.string().trim().max(500).optional()
})

export type TCancelPaymentRequestInput = z.infer<typeof cancelPaymentRequestSchema>
