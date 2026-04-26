import { api } from '@shared/libs/api'

export type CoursePublishState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

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

// Format paise → "Free" / "₹1,499" / "USD 49.00".
export const formatCoursePrice = (paise: number, currency = 'INR'): string => {
    if (!paise) return 'Free'
    if (currency === 'INR') return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    return `${currency} ${(paise / 100).toFixed(2)}`
}
