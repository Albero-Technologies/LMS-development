import { type Request, type Response } from 'express'
import { type EnquiryStage } from '@prisma/client'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './enquiry.service'

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
    const stage = req.query.stage as EnquiryStage | undefined
    const assignedToId = req.query.assignedToId as string | undefined
    const items = await service.listEnquiries(req.auth.tenantId, { stage, assignedToId })
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const updateStage = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const id = req.params.id
    const { stage } = req.body as { stage: EnquiryStage }
    const updated = await service.updateEnquiryStage(req.auth.tenantId, id, stage)
    await writeAudit({ action: 'enquiry.stage_update', entityType: 'Enquiry', entityId: id, metadata: { stage } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, updated)
}

export const reassign = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const id = req.params.id
    const { counsellorId } = req.body as { counsellorId: string }
    const updated = await service.reassignEnquiry(req.auth.tenantId, id, counsellorId)
    await writeAudit({ action: 'enquiry.reassign', entityType: 'Enquiry', entityId: id, metadata: { counsellorId } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, updated)
}
