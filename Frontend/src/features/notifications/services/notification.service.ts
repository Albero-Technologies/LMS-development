import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ'

export type NotificationItem = {
    id: string
    subject: string | null
    body: string | null
    status: NotificationStatus
    template: string
    readAt: string | null
    createdAt: string
}

export type NotificationListResponse = {
    items: NotificationItem[]
    total: number
    unread: number
    page: number
    pageSize: number
}

export const listNotifications = async (page = 1, pageSize = 50): Promise<NotificationListResponse> => {
    const { data } = await api.get<Envelope<NotificationListResponse>>('/notifications', { params: { page, pageSize } })
    return data.data
}

export const markNotificationRead = async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`)
}
