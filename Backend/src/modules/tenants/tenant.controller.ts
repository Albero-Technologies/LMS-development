import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './tenant.service'
import { writeAudit } from '../../util/audit'

// Tenant creation is typically performed by a SUPER_ADMIN or via a signed onboarding flow.
// Phase 1 leaves the route open behind SUPER_ADMIN auth; see router.
export const createTenant = async (req: Request, res: Response): Promise<void> => {
    const result = await service.createTenant(req.body)
    await writeAudit({ action: 'tenant.create', entityType: 'Tenant', entityId: result.tenant.id, tenantId: result.tenant.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}

export const getMyTenant = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenant = await service.getTenant(req.auth.tenantId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}

export const updateMyTenantBranding = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenant = await service.updateBranding(req.auth.tenantId, req.body)
    await writeAudit({ action: 'tenant.branding_update', entityType: 'Tenant', entityId: tenant.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}
