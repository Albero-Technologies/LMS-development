import { Router } from 'express'
import * as ctrl from './tenant.controller'
import { validate } from '../../middleware/validate'
import { createTenantSchema, updateTenantBrandingSchema } from './tenant.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy, requireRole } from '../../middleware/auth'
import { Role } from '@prisma/client'

const router = Router()

// Public lookup by slug (§9.1). No auth — surfaces only brand info so the
// per-tenant landing page can paint correctly before login.
router.get('/by-slug/:slug', asyncHandler(ctrl.getPublicTenant))
// Public CMS read — published items only. Used by the Collection-list section.
router.get('/by-slug/:slug/collections/:collectionSlug', asyncHandler(ctrl.getPublicCollectionItems))
router.get('/by-slug/:slug/collections/:collectionSlug/items/:itemSlug', asyncHandler(ctrl.getPublicCollectionItem))

// Create — reserved for SUPER_ADMIN of the platform.
router.post('/', requireAuth, requireRole(Role.SUPER_ADMIN), validate(createTenantSchema), asyncHandler(ctrl.createTenant))

router.get('/me', requireAuth, requirePolicy('tenant', 'read'), asyncHandler(ctrl.getMyTenant))
router.patch('/me', requireAuth, requirePolicy('tenant', 'write'), validate(updateTenantBrandingSchema), asyncHandler(ctrl.updateMyTenantBranding))

// Tenant ADMIN SaaS billing (§10.2). Tenant admins can see + pay their own
// invoices. SUPER_ADMIN is allowed too so they can preview the page.
router.get('/me/payments', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.getMyTenantPayments))
router.post('/me/payments/:id/pay', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.payTenantPayment))
router.post('/me/payments/:id/verify', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.verifyTenantPayment))

// SUPER_ADMIN cross-tenant routes (§4.1). Mounted after /me so the literal
// "me" isn't shadowed by the /:id pattern.
router.get('/', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.listAllTenants))
router.get('/payments/summary', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.listClientPaymentsSummary))
router.get('/:id', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.getTenantDetail))
router.patch('/:id/status', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.setStatus))
router.post('/:id/reminders', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.sendBillingReminder))
// Tenant SaaS billing (§4.4 + §10.2). Mounted before the catch-all PATCH /:id.
router.get('/:id/payments', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.listTenantPayments))
router.post('/:id/payments', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.createTenantPayment))
router.patch('/:id/payments/:paymentId/status', requireAuth, requireRole(Role.SUPER_ADMIN), asyncHandler(ctrl.setTenantPaymentStatus))
router.patch('/:id', requireAuth, requireRole(Role.SUPER_ADMIN), validate(updateTenantBrandingSchema), asyncHandler(ctrl.updateTenantById))

export default router
