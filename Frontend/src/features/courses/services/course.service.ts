import { api } from '@shared/libs/api'

export type CoursePublishState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type LessonType = 'YOUTUBE' | 'PDF' | 'LINK'

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
}

export type TSection = {
    id: string
    courseId: string
    title: string
    order: number
    lessons: TLesson[]
}

export type TCourse = {
    id: string
    title: string
    slug: string
    description?: string | null
    price: number // paise (smallest currency unit)
    currency?: string
    gstPercent?: number
    publishState?: CoursePublishState
    isPublished?: boolean
    trainerId?: string | null
    thumbnailUrl?: string | null
    coverUrl?: string | null
    enrolledCount?: number
    tags?: string[]
    // getCourse returns the full curriculum; listCourses omits these fields.
    sections?: TSection[]
    trainer?: { id: string; firstName: string | null; lastName: string | null } | null
}

type Envelope<T> = { success: boolean; data: T; message: string }
type PagedResponse<T> = Envelope<{ items: T[]; total: number; page: number; pageSize: number }>

// `tenantId` is honoured for SUPER_ADMIN only — the backend silently drops it
// for any other role, so it's safe to always pass through.
export const listCourses = async (params?: { q?: string; page?: number; tenantId?: string }): Promise<TCourse[]> => {
    const { data } = await api.get<PagedResponse<TCourse>>('/courses', { params })
    return data.data.items
}

export const getCourse = async (id: string): Promise<TCourse> => {
    const { data } = await api.get<Envelope<TCourse>>(`/courses/${id}`)
    return data.data
}

export const createCourse = async (body: Partial<TCourse>): Promise<TCourse> => {
    const { data } = await api.post<Envelope<TCourse>>('/courses', body)
    return data.data
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

export const updateLessonProgress = async (
    courseId: string,
    lessonId: string,
    input: LessonProgressInput
): Promise<LessonProgressResult> => {
    const { data } = await api.post<Envelope<LessonProgressResult>>(
        `/courses/${courseId}/lessons/${lessonId}/progress`,
        input
    )
    return data.data
}

// Format paise → "Free" / "₹1,499" / "USD 49.00".
export const formatCoursePrice = (paise: number, currency = 'INR'): string => {
    if (!paise) return 'Free'
    if (currency === 'INR') return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    return `${currency} ${(paise / 100).toFixed(2)}`
}
