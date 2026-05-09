import { z } from 'zod'

// Admin Demo Mode console — list, edit, and bulk-toggle student enrolments.
// Counsellors get read-only access; only ADMIN + SUPER_ADMIN can write.
//
// Filter dimensions:
//   q             search by student name / email
//   courseId      narrow to one course
//   accessTier    narrow to DEMO or FULL
//   tenantSlug    SUPER_ADMIN cross-tenant scope (silently ignored otherwise)

export const listDemoEnrolmentsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
    q: z.string().trim().max(120).optional(),
    courseId: z.string().uuid().optional(),
    accessTier: z.enum(['DEMO', 'FULL']).optional(),
    tenantSlug: z.string().trim().max(80).optional()
})
export type TListDemoEnrolmentsInput = z.infer<typeof listDemoEnrolmentsSchema>

export const updateDemoEnrolmentSchema = z
    .object({
        accessTier: z.enum(['DEMO', 'FULL']).optional(),
        demoLessonLimit: z.number().int().min(0).max(500).nullable().optional(),
        demoLessonAllowlist: z.array(z.string().uuid()).max(500).optional(),
        demoExpiresAt: z.string().datetime().nullable().optional(),
        // Required when forcing FULL access without a payment — the audit
        // log captures it next to the row.
        manualUpgradeReason: z.string().trim().max(500).optional()
    })
    .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' })
export type TUpdateDemoEnrolmentInput = z.infer<typeof updateDemoEnrolmentSchema>

export const bulkUpdateDemoSchema = z
    .object({
        enrolmentIds: z.array(z.string().uuid()).min(1).max(500),
        accessTier: z.enum(['DEMO', 'FULL']).optional(),
        demoLessonLimit: z.number().int().min(0).max(500).nullable().optional(),
        manualUpgradeReason: z.string().trim().max(500).optional()
    })
    .refine((v) => v.accessTier !== undefined || v.demoLessonLimit !== undefined, {
        message: 'Provide accessTier or demoLessonLimit'
    })
export type TBulkUpdateDemoInput = z.infer<typeof bulkUpdateDemoSchema>

// Send a per-student "your balance is due" email — short-circuits the
// counsellor follow-up cadence when an admin wants to nudge directly.
export const sendPaymentReminderSchema = z.object({
    enrolmentId: z.string().uuid(),
    note: z.string().trim().max(500).optional()
})
export type TSendPaymentReminderInput = z.infer<typeof sendPaymentReminderSchema>
