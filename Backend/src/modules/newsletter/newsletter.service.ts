import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import logger from '../../util/logger'
import { appendRow } from '../enquiries/google-sheets.client'
import { resolveTenant } from '../enquiries/enquiry.service'
import type { TSubscribeInput } from './newsletter.schema'

// Re-export the shared tenant resolver so callers can stay in this module.
export { resolveTenant }

// Idempotent subscribe: same email + tenant updates source/status instead of
// failing on the unique constraint. Returns whether the row was newly created
// so the controller can answer 201 vs 200.
export const subscribe = async (
    tenantId: string,
    input: Omit<TSubscribeInput, 'tenantSlug'>
): Promise<{ id: string; created: boolean; email: string }> => {
    const existing = await db.client.newsletterSubscriber.findUnique({
        where: { tenantId_email: { tenantId, email: input.email } }
    })

    if (existing) {
        const updated = await db.client.newsletterSubscriber.update({
            where: { id: existing.id },
            data: {
                // Re-subscribing reactivates a previously-unsubscribed row.
                status: 'active',
                name: input.name ?? existing.name,
                source: input.source ?? existing.source,
                utmSource: input.utmSource ?? existing.utmSource,
                utmMedium: input.utmMedium ?? existing.utmMedium,
                utmCampaign: input.utmCampaign ?? existing.utmCampaign
            }
        })
        void pushSubscriberToSheet(tenantId, updated).catch((err: unknown) => {
            logger.error('NEWSLETTER_SHEETS_PUSH_FAILED', { meta: { id: updated.id, err: (err as Error).message } })
        })
        return { id: updated.id, created: false, email: updated.email }
    }

    const created = await db.client.newsletterSubscriber.create({
        data: {
            tenantId,
            email: input.email,
            name: input.name,
            source: input.source ?? 'website',
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign
        }
    })

    void pushSubscriberToSheet(tenantId, created).catch((err: unknown) => {
        logger.error('NEWSLETTER_SHEETS_PUSH_FAILED', { meta: { id: created.id, err: (err as Error).message } })
    })

    return { id: created.id, created: true, email: created.email }
}

// Push to the same per-tenant Google Sheet that captures enquiries — formType
// 'newsletter' tags the row so admins can filter the sheet by funnel.
type SubscriberLike = Awaited<ReturnType<typeof db.client.newsletterSubscriber.create>>

export const pushSubscriberToSheet = async (tenantId: string, sub: SubscriberLike): Promise<void> => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId } })
    const settings = tenant?.settings as {
        googleSheetId?: string
        googleSheetRange?: string
        environment?: { googleSheets?: { serviceAccountJson?: string } }
    } | null
    const sheetId = settings?.googleSheetId
    if (!sheetId) return

    await appendRow({
        sheetId,
        range: settings?.googleSheetRange ?? 'Sheet1!A1',
        serviceAccountJson: settings?.environment?.googleSheets?.serviceAccountJson,
        values: [
            new Date().toISOString(),
            'newsletter',
            sub.name ?? '',
            sub.email,
            '', // phone (none)
            '', // course (none)
            '', // city
            '', // language
            '', // message
            sub.source ?? '',
            sub.utmSource ?? '',
            sub.utmMedium ?? '',
            sub.utmCampaign ?? '',
            sub.status,
            '', // assignedToId
            sub.id
        ]
    })
}

export const listSubscribers = async (
    tenantId: string,
    filter: { status?: 'active' | 'unsubscribed'; q?: string }
) => {
    const trimmed = filter.q?.trim()
    return db.client.newsletterSubscriber.findMany({
        where: {
            tenantId,
            ...(filter.status ? { status: filter.status } : {}),
            ...(trimmed
                ? {
                      OR: [
                          { email: { contains: trimmed, mode: 'insensitive' } },
                          { name: { contains: trimmed, mode: 'insensitive' } }
                      ]
                  }
                : {})
        },
        orderBy: { createdAt: 'desc' }
    })
}

export const updateSubscriberStatus = async (
    tenantId: string,
    id: string,
    status: 'active' | 'unsubscribed'
) => {
    const sub = await db.client.newsletterSubscriber.findFirst({ where: { id, tenantId } })
    if (!sub) throw AppError.notFound(responseMessage.NOT_FOUND('Subscriber'), 'NEWSLETTER_NOT_FOUND')
    return db.client.newsletterSubscriber.update({ where: { id }, data: { status } })
}

export const deleteSubscriber = async (tenantId: string, id: string) => {
    const sub = await db.client.newsletterSubscriber.findFirst({ where: { id, tenantId } })
    if (!sub) throw AppError.notFound(responseMessage.NOT_FOUND('Subscriber'), 'NEWSLETTER_NOT_FOUND')
    await db.client.newsletterSubscriber.delete({ where: { id } })
    return { id }
}
