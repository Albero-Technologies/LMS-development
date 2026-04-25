import { Router } from 'express'
import * as ctrl from './tenant.controller'
import { validate } from '../../middleware/validate'
import { createTenantSchema, updateTenantBrandingSchema } from './tenant.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy, requireRole } from '../../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

// Create — reserved for SUPER_ADMIN of the platform.
router.post('/', requireAuth, requireRole(Role.SUPER_ADMIN), validate(createTenantSchema), asyncHandler(ctrl.createTenant))

router.get('/me', requireAuth, requirePolicy('tenant', 'read'), asyncHandler(ctrl.getMyTenant))
router.patch('/me', requireAuth, requirePolicy('tenant', 'write'), validate(updateTenantBrandingSchema), asyncHandler(ctrl.updateMyTenantBranding))

// SUPER_ADMIN cross-tenant routes (§4.1). Mounted after /me so the literal
// "me" isn't shadowed by the /:id pattern.
router.get('/', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.listAllTenants))
router.get('/:id', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.getTenantDetail))
router.patch('/:id/status', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.setStatus))

export default router
