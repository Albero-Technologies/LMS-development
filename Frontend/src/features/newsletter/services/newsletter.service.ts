import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type NewsletterStatus = 'active' | 'unsubscribed'

export type NewsletterSubscriber = {
    id: string
    tenantId: string
    email: string
    name: string | null
    source: string
    status: NewsletterStatus
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    createdAt: string
    updatedAt: string
}

// `tenantId` is honoured for SUPER_ADMIN only — backend drops it for other
// roles and uses the JWT tenant.
export const listSubscribers = async (
    filter: { status?: NewsletterStatus; q?: string } = {},
    tenantId?: string
): Promise<NewsletterSubscriber[]> => {
    const params: Record<string, string | undefined> = {}
    if (filter.status) params.status = filter.status
    if (filter.q) params.q = filter.q
    if (tenantId) params.tenantId = tenantId
    const { data } = await api.get<Envelope<NewsletterSubscriber[]>>('/newsletter', { params })
    return data.data
}

export const updateSubscriberStatus = async (
    id: string,
    status: NewsletterStatus,
    tenantId?: string
): Promise<NewsletterSubscriber> => {
    const { data } = await api.patch<Envelope<NewsletterSubscriber>>(
        `/newsletter/${id}/status`,
        { status },
        { params: tenantId ? { tenantId } : undefined }
    )
    return data.data
}

export const deleteSubscriber = async (id: string, tenantId?: string): Promise<{ id: string }> => {
    const { data } = await api.delete<Envelope<{ id: string }>>(`/newsletter/${id}`, {
        params: tenantId ? { tenantId } : undefined
    })
    return data.data
}

// Local CSV export — done client-side so admins can grab the list without
// burdening the backend with a dedicated download route.
export const subscribersToCsv = (rows: NewsletterSubscriber[]): string => {
    const header = ['Email', 'Name', 'Status', 'Source', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Subscribed at']
    const escape = (val: string | null | undefined): string => {
        const s = String(val ?? '')
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = rows.map((r) =>
        [r.email, r.name, r.status, r.source, r.utmSource, r.utmMedium, r.utmCampaign, r.createdAt].map(escape).join(',')
    )
    return [header.join(','), ...lines].join('\n')
}

export const downloadCsv = (filename: string, csv: string): void => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
