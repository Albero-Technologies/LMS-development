import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type AssignmentSubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'RETURNED'

export type AssignmentRow = {
    id: string
    tenantId: string
    courseId: string
    trainerId: string | null
    title: string
    description: string | null
    instructions: string | null
    dueAt: string | null
    maxScore: number
    isPublished: boolean
    createdAt: string
    updatedAt: string
    course: { id: string; title: string; slug: string } | null
    trainer: { id: string; firstName: string | null; lastName: string | null } | null
    _count: { submissions: number }
    // Only populated for STUDENT callers — their own submission, if any.
    mySubmission?: SubmissionRow | null
}

export type SubmissionRow = {
    id: string
    assignmentId: string
    userId: string
    textAnswer: string | null
    fileUrl: string | null
    status: AssignmentSubmissionStatus
    score: number | null
    feedback: string | null
    submittedAt: string | null
    gradedAt: string | null
    createdAt: string
    user?: { id: string; firstName: string | null; lastName: string | null; email: string } | null
}

export type AssignmentDetail = AssignmentRow & {
    mySubmission: SubmissionRow | null
    submissions: SubmissionRow[]
}

export type CreateAssignmentInput = {
    courseId: string
    title: string
    description?: string
    instructions?: string
    dueAt?: string // ISO
    maxScore?: number
    trainerId?: string
    isPublished?: boolean
}

export type UpdateAssignmentInput = Partial<{
    title: string
    description: string | null
    instructions: string | null
    dueAt: string | null
    maxScore: number
    trainerId: string | null
    isPublished: boolean
}>

export type SubmitAssignmentInput = {
    textAnswer?: string
    fileUrl?: string
    seal?: boolean // false = save as DRAFT; true = SUBMITTED (default)
}

export type GradeSubmissionInput = {
    score: number
    feedback?: string
    status?: 'GRADED' | 'RETURNED'
}

export const listAssignments = async (params?: { courseId?: string; status?: 'draft' | 'published' }): Promise<AssignmentRow[]> => {
    const { data } = await api.get<Envelope<AssignmentRow[]>>('/assignments', { params })
    return data.data
}

export const getAssignment = async (id: string): Promise<AssignmentDetail> => {
    const { data } = await api.get<Envelope<AssignmentDetail>>(`/assignments/${id}`)
    return data.data
}

export const createAssignment = async (input: CreateAssignmentInput): Promise<AssignmentRow> => {
    const { data } = await api.post<Envelope<AssignmentRow>>('/assignments', input)
    return data.data
}

export const updateAssignment = async (id: string, input: UpdateAssignmentInput): Promise<AssignmentRow> => {
    const { data } = await api.patch<Envelope<AssignmentRow>>(`/assignments/${id}`, input)
    return data.data
}

export const deleteAssignment = async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`)
}

export const submitAssignment = async (id: string, input: SubmitAssignmentInput): Promise<SubmissionRow> => {
    const { data } = await api.post<Envelope<SubmissionRow>>(`/assignments/${id}/submit`, input)
    return data.data
}

export const gradeSubmission = async (submissionId: string, input: GradeSubmissionInput): Promise<SubmissionRow> => {
    const { data } = await api.post<Envelope<SubmissionRow>>(`/assignments/submissions/${submissionId}/grade`, input)
    return data.data
}

export const fmtDate = (iso: string | null): string => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const submissionTone = (s: AssignmentSubmissionStatus): 'ok' | 'brand' | 'warn' | 'default' => {
    switch (s) {
        case 'GRADED':
            return 'ok'
        case 'SUBMITTED':
            return 'brand'
        case 'RETURNED':
            return 'warn'
        default:
            return 'default'
    }
}
