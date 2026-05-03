import { Router } from 'express'
import * as ctrl from './newsletter.controller'
import { subscribeSchema, updateStatusSchema } from './newsletter.schema'
import { validate } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

// Public — open to the marketing site (5173). Tenant resolves from
// `tenantSlug` body field, the `X-Tenant-Slug` header, or sub-domain.
router.post('/subscribe', validate(subscribeSchema), asyncHandler(ctrl.subscribePublic))

// Authenticated — admins manage their own list, SA can switch tenants
// via `?tenantId=`.
router.get('/', requireAuth, requirePolicy('newsletter', 'read'), asyncHandler(ctrl.list))
router.patch('/:id/status', requireAuth, requirePolicy('newsletter', 'write'), validate(updateStatusSchema), asyncHandler(ctrl.updateStatus))
router.delete('/:id', requireAuth, requirePolicy('newsletter', 'write'), asyncHandler(ctrl.remove))

export default router
