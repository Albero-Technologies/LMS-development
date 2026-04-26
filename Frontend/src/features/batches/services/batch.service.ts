import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type BatchStatus = 'UPCOMING' | 'RUNNING' | 'ENDED' | 'CANCELLED'

export type BatchRow = {
    id: string
    tenantId: string
    courseId: string
    name: string
    code: string
    trainerId: string | null
    startDate: string | null
    endDate: string | null
    capacity: number
    status: BatchStatus
    createdAt: string
    updatedAt: string
    course: { id: string; title: string } | null
    trainer: { id: string; firstName: string | null; lastName: string | null } | null
    _count: { enrollments: number }
}

export type BatchEnrollmentUser = { id: string; firstName: string | null; lastName: string | null; email: string }

export type BatchDetail = Omit<BatchRow, '_count'> & {
    enrollments: Array<{
        id: string
        userId: string
        courseId: string
        status: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'
        progressPct: number
        createdAt: string
        startedAt: string | null
        user: BatchEnrollmentUser
    }>
}

export type CreateBatchInput = {
    courseId: string
    name: string
    code: string
    trainerId?: string
    startDate: string // ISO
    endDate?: string
    capacity?: number
    // SUPER_ADMIN only — backend silently drops it for any other role.
    tenantId?: string
}

export type UpdateBatchInput = Partial<{
    name: string
    trainerId: string | null
    startDate: string
    endDate: string | null
    capacity: number
    status: BatchStatus
}>

export const listBatches = async (params?: { courseId?: string; tenantId?: string }): Promise<BatchRow[]> => {
    const { data } = await api.get<Envelope<BatchRow[]>>('/batches', { params })
    return data.data
}

export const getBatch = async (id: string): Promise<BatchDetail> => {
    const { data } = await api.get<Envelope<BatchDetail>>(`/batches/${id}`)
    return data.data
}

export const createBatch = async (input: CreateBatchInput): Promise<BatchRow> => {
    const { data } = await api.post<Envelope<BatchRow>>('/batches', input)
    return data.data
}

export const updateBatch = async (id: string, input: UpdateBatchInput): Promise<BatchRow> => {
    const { data } = await api.patch<Envelope<BatchRow>>(`/batches/${id}`, input)
    return data.data
}

export const deleteBatch = async (id: string): Promise<void> => {
    await api.delete(`/batches/${id}`)
}

export const assignStudentsToBatch = async (id: string, userIds: string[]): Promise<{ assigned: number }> => {
    const { data } = await api.post<Envelope<{ assigned: number }>>(`/batches/${id}/students`, { userIds })
    return data.data
}

export const transferStudent = async (
    fromBatchId: string,
    input: { userId: string; targetBatchId: string }
): Promise<{ ok: boolean }> => {
    const { data } = await api.post<Envelope<{ ok: boolean }>>(`/batches/${fromBatchId}/transfer`, input)
    return data.data
}

const STATUS_TONE: Record<BatchStatus, 'ok' | 'brand' | 'default' | 'danger'> = {
    UPCOMING: 'brand',
    RUNNING: 'ok',
    ENDED: 'default',
    CANCELLED: 'danger'
}

export const getBatchStatusTone = (s: BatchStatus) => STATUS_TONE[s]

export const fmtBatchDate = (iso: string | null): string => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
