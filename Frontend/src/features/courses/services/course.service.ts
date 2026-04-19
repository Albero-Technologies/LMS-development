import { api } from '@shared/libs/api'

export type TCourse = {
    id: string
    title: string
    slug: string
    description?: string
    price: number
    isPublished: boolean
    trainerId?: string | null
    coverUrl?: string | null
    enrolledCount?: number
}

type Envelope<T> = { success: boolean; data: T; message: string }
type PagedResponse<T> = Envelope<{ items: T[]; total: number; page: number; pageSize: number }>

export const listCourses = async (params?: { q?: string; page?: number }): Promise<TCourse[]> => {
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
