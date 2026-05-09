import { api } from '@shared/libs/api'

export type CoursePublishState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type LessonType = 'YOUTUBE' | 'EXTERNAL_LIVE' | 'TEXT'

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS'

// Resource attachment on a lesson — Drive link, PDF URL, etc. Free-form by
// design so admins can paste anything.
export type TLessonResource = {
    url: string
    label?: string
    type?: 'pdf' | 'link' | 'file'
}

export type TLesson = {
    id: string
    sectionId: string
    title: string
    description?: string | null
    type: LessonType
    youtubeId?: string | null
    externalUrl?: string | null
    durationSec: number
    order: number
    freePreview?: boolean
    demoAccess?: boolean
    resources?: TLessonResource[] | null
    // Set by the backend when the viewer is a STUDENT and the enrolment
    // is on DEMO tier. Trainer / admin / SA responses leave this undefined
    // so they always see the full curriculum + media URLs.
    locked?: boolean
    lockReason?: 'expired' | 'demo_disabled' | 'beyond_limit' | 'not_enrolled' | null
}

export type TSection = {
    id: string
    courseId: string
    title: string
    order: number
    demoSection?: boolean
    lessons: TLesson[]
}

// Course detail response now includes a per-viewer demo summary when the
// caller is a student. Optional for trainer / admin / SA.
export type TDemoAccessSummary = {
    tier: 'DEMO' | 'FULL'
    lessonsTotal: number
    lessonsUnlocked: number
    demoExpired: boolean
    demoExpiresAt: string | null
}

export type TCourse = {
    id: string
    title: string
    subtitle?: string | null
    slug: string
    description?: string | null
    price: number // paise (smallest currency unit)
    currency?: string
    gstPercent?: number
    publishState?: CoursePublishState
    isPublished?: boolean
    trainerId?: string | null
    thumbnailUrl?: string | null
    heroUrl?: string | null
    coverUrl?: string | null
    enrolledCount?: number
    tags?: string[]
    level?: CourseLevel
    language?: string
    outcomes?: string[]
    prerequisites?: string[]
    audience?: string[]
    enrolmentCap?: number | null
    startsAt?: string | null
    endsAt?: string | null
    certificateEnabled?: boolean
    certificateTemplate?: string | null
    // getCourse returns the full curriculum; listCourses omits these fields.
    sections?: TSection[]
    trainer?: { id: string; firstName: string | null; lastName: string | null } | null
    // Demo settings (visible to trainer / admin); copy mirrored on the
    // student response so the dashboard can show "Demo: 1/47 lessons".
    demoEnabled?: boolean
    demoLessonDefault?: number
    demoExpiryDays?: number | null
    demoAccess?: TDemoAccessSummary
}

type Envelope<T> = { success: boolean; data: T; message: string }
type PagedResponse<T> = Envelope<{ items: T[]; total: number; page: number; pageSize: number }>

// `tenantId` is honoured for SUPER_ADMIN only — the backend silently drops it
// for any other role, so it's safe to always pass through. Threading it on
// every mutation lets the SA edit a course owned by ANY tenant from the
// cross-tenant catalog view.
const tenantParam = (tenantId: string | undefined): Record<string, string> | undefined => (tenantId ? { tenantId } : undefined)

export const listCourses = async (params?: { q?: string; page?: number; tenantId?: string }): Promise<TCourse[]> => {
    const { data } = await api.get<PagedResponse<TCourse>>('/courses', { params })
    return data.data.items
}

export const getCourse = async (id: string, tenantId?: string): Promise<TCourse> => {
    const { data } = await api.get<Envelope<TCourse>>(`/courses/${id}`, { params: tenantParam(tenantId) })
    return data.data
}

export const createCourse = async (body: Partial<TCourse>, tenantId?: string): Promise<TCourse> => {
    const { data } = await api.post<Envelope<TCourse>>('/courses', body, { params: tenantParam(tenantId) })
    return data.data
}

export const updateCourse = async (id: string, body: Partial<TCourse>, tenantId?: string): Promise<TCourse> => {
    const { data } = await api.patch<Envelope<TCourse>>(`/courses/${id}`, body, { params: tenantParam(tenantId) })
    return data.data
}

export const deleteCourse = async (id: string, tenantId?: string): Promise<void> => {
    await api.delete(`/courses/${id}`, { params: tenantParam(tenantId) })
}

// ---- Sections / lessons (curriculum builder) -----------------------------

export type CreateSectionPayload = { title: string; order?: number }
export type UpdateSectionPayload = { title?: string; order?: number }
export type CreateLessonPayload = {
    sectionId: string
    title: string
    type?: LessonType
    youtubeId?: string
    externalUrl?: string
    description?: string
    durationSec?: number
    order?: number
}
export type UpdateLessonPayload = Omit<Partial<CreateLessonPayload>, 'sectionId'>

export const createSection = async (courseId: string, body: CreateSectionPayload, tenantId?: string): Promise<TSection> => {
    const { data } = await api.post<Envelope<TSection>>(`/courses/${courseId}/sections`, body, { params: tenantParam(tenantId) })
    return data.data
}

export const updateSection = async (courseId: string, sectionId: string, body: UpdateSectionPayload, tenantId?: string): Promise<TSection> => {
    const { data } = await api.patch<Envelope<TSection>>(`/courses/${courseId}/sections/${sectionId}`, body, { params: tenantParam(tenantId) })
    return data.data
}

export const deleteSection = async (courseId: string, sectionId: string, tenantId?: string): Promise<void> => {
    await api.delete(`/courses/${courseId}/sections/${sectionId}`, { params: tenantParam(tenantId) })
}

export const createLesson = async (courseId: string, body: CreateLessonPayload, tenantId?: string): Promise<TLesson> => {
    const { data } = await api.post<Envelope<TLesson>>(`/courses/${courseId}/lessons`, body, { params: tenantParam(tenantId) })
    return data.data
}

export const updateLesson = async (courseId: string, lessonId: string, body: UpdateLessonPayload, tenantId?: string): Promise<TLesson> => {
    const { data } = await api.patch<Envelope<TLesson>>(`/courses/${courseId}/lessons/${lessonId}`, body, { params: tenantParam(tenantId) })
    return data.data
}

export const deleteLesson = async (courseId: string, lessonId: string, tenantId?: string): Promise<void> => {
    await api.delete(`/courses/${courseId}/lessons/${lessonId}`, { params: tenantParam(tenantId) })
}

// Per-lesson progress mark — "I watched/read this lesson". Backend persists
// the mark + recomputes course-level progressPct on the enrolment so the
// student's "% complete" stays in sync. Idempotent: re-marking is a no-op
// server-side.
export type LessonProgressInput = { watchedSec?: number; completed?: boolean }

export type LessonProgressResult = {
    progress: { lessonId: string; enrollmentId: string; watchedSec: number; completed: boolean; completedAt: string | null }
    enrollmentProgressPct: number
}

export const updateLessonProgress = async (courseId: string, lessonId: string, input: LessonProgressInput): Promise<LessonProgressResult> => {
    const { data } = await api.post<Envelope<LessonProgressResult>>(`/courses/${courseId}/lessons/${lessonId}/progress`, input)
    return data.data
}

// Format paise → "Free" / "₹1,499" / "USD 49.00".
export const formatCoursePrice = (paise: number, currency = 'INR'): string => {
    if (!paise) return 'Free'
    if (currency === 'INR') return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    return `${currency} ${(paise / 100).toFixed(2)}`
}
