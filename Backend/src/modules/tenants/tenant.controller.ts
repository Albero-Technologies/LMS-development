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

// SUPER_ADMIN — cross-tenant listing for the SA panel.
export const listAllTenants = async (req: Request, res: Response): Promise<void> => {
    const rows = await service.listAllTenants()
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

// SUPER_ADMIN — full tenant detail for the SA panel's tenant page.
export const getTenantDetail = async (req: Request, res: Response): Promise<void> => {
    const detail = await service.getTenantDetail(req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, detail)
}

// SUPER_ADMIN — update branding/settings of any tenant (Phase B).
export const updateTenantById = async (req: Request, res: Response): Promise<void> => {
    const tenant = await service.updateBranding(req.params.id, req.body)
    await writeAudit({ action: 'tenant.update', entityType: 'Tenant', entityId: tenant.id, tenantId: tenant.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}

// SUPER_ADMIN — flip status (suspend / reinstate). The accompanying audit log
// is what makes this action accountable.
export const setStatus = async (req: Request, res: Response): Promise<void> => {
    const status = (req.body as { status?: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' }).status
    if (status !== 'ACTIVE' && status !== 'SUSPENDED' && status !== 'TRIAL') {
        httpResponse(req, res, 400, 'Invalid status — must be ACTIVE, SUSPENDED, or TRIAL')
        return
    }
    const tenant = await service.setTenantStatus(req.params.id, status)
    await writeAudit({ action: 'tenant.status_update', entityType: 'Tenant', entityId: tenant.id, metadata: { status } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}
