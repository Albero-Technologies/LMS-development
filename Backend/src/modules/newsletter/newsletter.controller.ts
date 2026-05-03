import { type Request, type Response } from 'express'
import { Role } from '@prisma/client'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import db from '../../service/db'
import AppError from '../../util/AppError'
import { writeAudit } from '../../util/audit'
import * as service from './newsletter.service'

// SA can target any tenant via `?tenantId=` so the platform account can
// inspect a customer tenant's subscriber list. Mirrors the same helper
// used in cms / courses / enquiry.
const resolveTenantId = async (req: Request): Promise<string> => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED, 'NO_AUTH')
    const override = typeof req.query.tenantId === 'string' ? req.query.tenantId.trim() : ''
    if (override && req.auth.role === Role.SUPER_ADMIN) {
        const exists = await db.client.tenant.findUnique({ where: { id: override }, select: { id: true } })
        if (!exists) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
        return override
    }
    return req.auth.tenantId
}

// ---- PUBLIC ----------------------------------------------------------------

export const subscribePublic = async (req: Request, res: Response): Promise<void> => {
    const { tenantSlug, ...rest } = req.body as { tenantSlug?: string } & Record<string, unknown>
    const headerSlug = req.get('x-tenant-slug') || undefined
    const tenant = await service.resolveTenant(tenantSlug ?? headerSlug, req.get('host') || undefined)

    const result = await service.subscribe(tenant.id, rest as Parameters<typeof service.subscribe>[1])

    await writeAudit(
        {
            action: result.created ? 'newsletter.subscribe' : 'newsletter.resubscribe',
            entityType: 'NewsletterSubscriber',
            entityId: result.id,
            tenantId: tenant.id,
            metadata: { email: result.email }
        },
        req
    )

    httpResponse(req, res, result.created ? 201 : 200, responseMessage.SUCCESS, {
        id: result.id,
        email: result.email
    })
}

// ---- AUTHENTICATED (admin / SA) -------------------------------------------

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const status = req.query.status as 'active' | 'unsubscribed' | undefined
    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    const items = await service.listSubscribers(tenantId, { status, q })
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const { status } = req.body as { status: 'active' | 'unsubscribed' }
    const updated = await service.updateSubscriberStatus(tenantId, req.params.id, status)
    await writeAudit(
        { action: 'newsletter.status_update', entityType: 'NewsletterSubscriber', entityId: req.params.id, tenantId, metadata: { status } },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, updated)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const result = await service.deleteSubscriber(tenantId, req.params.id)
    await writeAudit({ action: 'newsletter.delete', entityType: 'NewsletterSubscriber', entityId: req.params.id, tenantId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
