import { api } from '@shared/libs/api'
import type { TRole } from '@shared/constants/roles'

type Envelope<T> = { success: boolean; message: string; data: T }

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type TicketUserRef = {
    id: string
    firstName: string
    lastName: string
    email?: string
    role?: TRole
}

export type TicketComment = {
    id: string
    ticketId: string
    authorId: string
    body: string
    internal: boolean
    createdAt: string
    author?: TicketUserRef
}

export type TicketListItem = {
    id: string
    number: string
    subject: string
    description: string
    priority: TicketPriority
    status: TicketStatus
    slaDueAt: string | null
    resolvedAt: string | null
    createdAt: string
    opener: TicketUserRef
    assignee: TicketUserRef | null
}

export type TicketDetail = TicketListItem & {
    comments: TicketComment[]
}

export type TicketListResponse = {
    items: TicketListItem[]
    total: number
    page: number
    pageSize: number
}

export type TicketListQuery = {
    page?: number
    pageSize?: number
    status?: TicketStatus
    assigneeId?: string
}

export const listTickets = async (query: TicketListQuery): Promise<TicketListResponse> => {
    const { data } = await api.get<Envelope<TicketListResponse>>('/tickets', { params: query })
    return data.data
}

export const getTicket = async (id: string): Promise<TicketDetail> => {
    const { data } = await api.get<Envelope<TicketDetail>>(`/tickets/${id}`)
    return data.data
}

export type CreateTicketPayload = {
    subject: string
    description: string
    priority: TicketPriority
}

export const createTicket = async (payload: CreateTicketPayload): Promise<TicketListItem> => {
    const { data } = await api.post<Envelope<TicketListItem>>('/tickets', payload)
    return data.data
}

export type UpdateTicketPayload = {
    subject?: string
    priority?: TicketPriority
    status?: TicketStatus
    assigneeId?: string | null
}

export const updateTicket = async (id: string, payload: UpdateTicketPayload): Promise<TicketListItem> => {
    const { data } = await api.patch<Envelope<TicketListItem>>(`/tickets/${id}`, payload)
    return data.data
}

export type AddCommentPayload = {
    body: string
    internal?: boolean
}

export const addTicketComment = async (id: string, payload: AddCommentPayload): Promise<TicketComment> => {
    const { data } = await api.post<Envelope<TicketComment>>(`/tickets/${id}/comments`, payload)
    return data.data
}

export const PRIORITY_TONE: Record<TicketPriority, 'danger' | 'warn' | 'default' | 'brand'> = {
    URGENT: 'danger',
    HIGH: 'warn',
    NORMAL: 'brand',
    LOW: 'default'
}

export const STATUS_TONE: Record<TicketStatus, 'brand' | 'warn' | 'ok' | 'default'> = {
    OPEN: 'brand',
    IN_PROGRESS: 'warn',
    RESOLVED: 'ok',
    CLOSED: 'default'
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
}
