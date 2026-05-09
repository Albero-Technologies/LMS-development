import { z } from 'zod'

// Sales-perspective student monitoring. Categories are derived from the
// User + Enrollment + Invoice + Enquiry aggregate (see service for the
// resolution priority). The list endpoint is shared across roles —
// SUPER_ADMIN scopes to a tenantSlug (or "__all__"), ADMIN sees their own
// tenant, MANAGER sees their team's students, and COUNSELLOR sees their
// own. Trainer scope drops in via the assigned trainer on the enrolled
// course.

export const STUDENT_CATEGORIES = ['DEMO', 'ACTIVE', 'INACTIVE', 'FEES_PAID', 'FEES_PENDING', 'FOLLOW_UP', 'DEAD'] as const
export type StudentCategory = (typeof STUDENT_CATEGORIES)[number]

export const listStudentsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    q: z.string().trim().max(120).optional(),
    category: z.enum(STUDENT_CATEGORIES).optional(),
    // SA only — silently ignored for other roles. "__all__" returns the
    // platform-wide list across every tenant.
    tenantSlug: z.string().trim().max(80).optional(),
    // Manager / admin can drill into a specific counsellor's bucket.
    counsellorId: z.string().uuid().optional()
})

export type TListStudentsInput = z.infer<typeof listStudentsSchema>

// Team buckets — list of teams (manager + their counsellors) with rollup
// metrics. Used for the "team monitoring" tab. Same role-based scoping as
// the students list (SA can pick a tenant; admins/managers see their org).
export const teamBucketsSchema = z.object({
    tenantSlug: z.string().trim().max(80).optional()
})

export type TTeamBucketsInput = z.infer<typeof teamBucketsSchema>

// Stats timeline — used for the charts tab. Either a preset window
// ("hour" / "week" / "month" / "year") or a custom from-to range.
// `granularity` controls bucket size of the time-series.
export const statsTimelineSchema = z
    .object({
        window: z.enum(['hour', 'day', 'week', 'month', 'year', 'custom']).default('month'),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        tenantSlug: z.string().trim().max(80).optional(),
        counsellorId: z.string().uuid().optional()
    })
    .refine((v) => v.window !== 'custom' || (v.from && v.to), {
        message: 'Custom window requires both `from` and `to`'
    })

export type TStatsTimelineInput = z.infer<typeof statsTimelineSchema>
