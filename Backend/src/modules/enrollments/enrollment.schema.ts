import { z } from 'zod'

export const createEnrollmentSchema = z.object({
    courseId: z.string().uuid(),
    batchId: z.string().uuid().optional()
})

export const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().min(5),
    razorpayPaymentId: z.string().min(5),
    razorpaySignature: z.string().min(5)
})

export type TCreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>
export type TVerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
