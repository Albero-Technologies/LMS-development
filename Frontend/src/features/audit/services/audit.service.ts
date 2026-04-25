import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type AuditTenantSummary = { id: string; name: string; slug: string }
export type AuditActorSummary = { id: string; email: string; name: string; role: string }

export type AuditLog = {
    id: string
    action: string
    entityType: string | null
    entityId: string | null
    metadata: unknown
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    tenant: AuditTenantSummary | null
    actor: AuditActorSummary | null
}

export type AuditListResponse = {
    items: AuditLog[]
    total: number
    page: number
    pageSize: number
}

export type AuditQuery = {
    page?: number
    pageSize?: number
    tenantId?: string
    userId?: string
    action?: string
    dateFrom?: string
    dateTo?: string
    search?: string
}

export const listAuditLogs = async (query: AuditQuery): Promise<AuditListResponse> => {
    const { data } = await api.get<Envelope<AuditListResponse>>('/audit-logs', { params: query })
    return data.data
}
