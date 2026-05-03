import { type Request, type Response } from 'express'
import { type EnquiryStage, Role } from '@prisma/client'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import db from '../../service/db'
import AppError from '../../util/AppError'
import { writeAudit } from '../../util/audit'
import * as service from './enquiry.service'

// SUPER_ADMIN can target any tenant via `?tenantId=<uuid>` so the platform
// account can monitor a customer tenant's lead funnel from the cross-tenant
// Lead Pipeline view. Other roles silently ignore the override and stay on
// their JWT tenant. Mirrors the same pattern used in cms / courses.
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

// -------- PUBLIC endpoint (no auth) -------------------------------------
// Tenant resolves from body.tenantSlug OR the Host header sub-domain.
export const createPublic = async (req: Request, res: Response): Promise<void> => {
    const { tenantSlug, ...rest } = req.body as { tenantSlug?: string } & Record<string, unknown>
    const tenant = await service.resolveTenant(tenantSlug, req.get('host') || undefined)

    const enquiry = await service.createEnquiry(tenant.id, rest as Parameters<typeof service.createEnquiry>[1])

    // Public audit — no userId because the enquirer is anonymous.
    await writeAudit(
        {
            action: 'enquiry.create',
            entityType: 'Enquiry',
            entityId: enquiry.id,
            tenantId: tenant.id,
            metadata: { source: enquiry.source, utmSource: enquiry.utmSource }
        },
        req
    )

    httpResponse(req, res, 201, responseMessage.CREATED, {
        id: enquiry.id,
        assignedCounsellor: enquiry.assignedTo
            ? { id: enquiry.assignedTo.id, name: `${enquiry.assignedTo.firstName} ${enquiry.assignedTo.lastName}` }
            : null
    })
}

// -------- AUTHENTICATED endpoints (admin / counsellor) ------------------

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const stage = req.query.stage as EnquiryStage | undefined
    const assignedToId = req.query.assignedToId as string | undefined
    const items = await service.listEnquiries(tenantId, { stage, assignedToId })
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const updateStage = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const id = req.params.id
    const { stage } = req.body as { stage: EnquiryStage }
    const { enquiry, previousStage } = await service.updateEnquiryStage(tenantId, id, stage)
    await writeAudit(
        {
            action: 'enquiry.stage_update',
            entityType: 'Enquiry',
            entityId: id,
            tenantId,
            metadata: { from: previousStage, to: stage }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, enquiry)
}

export const reassign = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenantId = await resolveTenantId(req)
    const id = req.params.id
    const { counsellorId } = req.body as { counsellorId: string }
    const updated = await service.reassignEnquiry(tenantId, id, counsellorId)
    await writeAudit({ action: 'enquiry.reassign', entityType: 'Enquiry', entityId: id, tenantId, metadata: { counsellorId } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, updated)
}
