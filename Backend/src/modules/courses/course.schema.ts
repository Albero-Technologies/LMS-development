import { z } from 'zod'
import { CourseLevel, CoursePublishState, LessonType } from '@prisma/client'

// Resource attachment shape kept loose so admins can paste a Google Drive
// link, a tenant-uploaded PDF, or anything else with a label.
const resourceSchema = z.object({
    url: z.string().url(),
    label: z.string().max(120).optional(),
    type: z.enum(['pdf', 'link', 'file']).optional()
})

export const createCourseSchema = z.object({
    title: z.string().min(3).max(200),
    subtitle: z.string().max(240).optional(),
    slug: z
        .string()
        .min(3)
        .max(120)
        .regex(/^[a-z0-9][a-z0-9-]*$/, 'slug must be lowercase alphanumeric with dashes'),
    description: z.string().max(5000).optional(),
    thumbnailUrl: z.string().url().optional(),
    heroUrl: z.string().url().optional(),
    price: z.number().int().min(0).max(10_000_000),
    currency: z.string().length(3).default('INR'),
    gstPercent: z.number().int().min(0).max(28).default(18),
    trainerId: z.string().uuid().optional(),
    tags: z.array(z.string().max(40)).max(20).optional(),
    level: z.nativeEnum(CourseLevel).optional(),
    language: z.string().min(2).max(40).optional(),
    // Long-form bullet arrays. Capped at 20 items × 240 chars each so the
    // course-detail hero doesn't turn into a wall of text.
    outcomes: z.array(z.string().max(240)).max(20).optional(),
    prerequisites: z.array(z.string().max(240)).max(20).optional(),
    audience: z.array(z.string().max(240)).max(20).optional(),
    // null = "unlimited"; passed through nullable so the UI can clear a cap.
    enrolmentCap: z.number().int().min(0).max(100_000).nullable().optional(),
    // ISO datetime strings — coerced to Date in service. Nullable so the UI
    // can clear an existing window.
    startsAt: z.string().datetime().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
    certificateEnabled: z.boolean().optional(),
    certificateTemplate: z.string().max(80).nullable().optional(),
    // Demo-mode gating — controls registration-fee / DEMO students. Trainers
    // edit these from the Course Settings panel. demoExpiryDays=null means
    // no expiry; otherwise demo lock kicks in N days after enrolment.
    demoEnabled: z.boolean().optional(),
    demoLessonDefault: z.number().int().min(0).max(500).optional(),
    demoExpiryDays: z.number().int().min(0).max(365).nullable().optional()
})

export const updateCourseSchema = createCourseSchema.partial().extend({
    publishState: z.nativeEnum(CoursePublishState).optional()
})

export const listCoursesQuerySchema = z.object({
    publishState: z.nativeEnum(CoursePublishState).optional(),
    trainerId: z.string().uuid().optional(),
    // SUPER_ADMIN cross-tenant scope. Ignored for any other role; lets the SA
    // panel pick a specific tenant from a dropdown instead of always seeing
    // the platform tenant's catalog.
    tenantId: z.string().uuid().optional(),
    q: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
})

export const createSectionSchema = z.object({
    title: z.string().min(1).max(200),
    order: z.number().int().min(0).max(1000).default(0)
})

export const updateSectionSchema = createSectionSchema.partial()

export const createLessonSchema = z.object({
    sectionId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    type: z.nativeEnum(LessonType).default(LessonType.YOUTUBE),
    youtubeId: z.string().max(40).optional(),
    externalUrl: z.string().url().optional(),
    durationSec: z.number().int().min(0).max(36_000).default(0),
    order: z.number().int().min(0).max(1000).default(0),
    // Free-preview lessons render outside the paywall on the public detail page.
    freePreview: z.boolean().optional(),
    // demoAccess gates DEMO-tier enrolments (registration-fee students)
    // inside the dashboard. Distinct from freePreview, which is anonymous
    // marketing-page visibility. A lesson can be one, both, or neither.
    demoAccess: z.boolean().optional(),
    // Up to 10 attached resources per lesson.
    resources: z.array(resourceSchema).max(10).optional()
})

export const updateLessonSchema = createLessonSchema.partial().omit({ sectionId: true })

export const progressUpdateSchema = z.object({
    watchedSec: z.number().int().min(0).max(36_000).optional(),
    completed: z.boolean().optional()
})

export type TCreateCourseInput = z.infer<typeof createCourseSchema>
export type TUpdateCourseInput = z.infer<typeof updateCourseSchema>
export type TListCoursesQuery = z.infer<typeof listCoursesQuerySchema>
export type TCreateSectionInput = z.infer<typeof createSectionSchema>
export type TUpdateSectionInput = z.infer<typeof updateSectionSchema>
export type TCreateLessonInput = z.infer<typeof createLessonSchema>
export type TUpdateLessonInput = z.infer<typeof updateLessonSchema>
export type TProgressUpdateInput = z.infer<typeof progressUpdateSchema>
export type TLessonResource = z.infer<typeof resourceSchema>
