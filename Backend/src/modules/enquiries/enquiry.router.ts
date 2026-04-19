import { Router } from 'express'
import * as ctrl from './enquiry.controller'
import { createEnquirySchema, stageUpdateSchema, reassignSchema } from './enquiry.schema'
import { validate } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

// --------- Public endpoint (no auth) ---------
// Mounted at /api/v1/enquiries in apiRouter. The Host header or the payload
// `tenantSlug` resolves which tenant receives the lead.
router.post('/', validate(createEnquirySchema), asyncHandler(ctrl.createPublic))

// --------- Authenticated endpoints (counsellor / admin) ---------
router.get('/me', requireAuth, requirePolicy('counsellor_invite', 'read'), asyncHandler(ctrl.list))

router.patch(
    '/:id/stage',
    requireAuth,
    requirePolicy('counsellor_invite', 'write'),
    validate(stageUpdateSchema),
    asyncHandler(ctrl.updateStage)
)

router.patch(
    '/:id/reassign',
    requireAuth,
    requirePolicy('counsellor_invite', 'write'),
    validate(reassignSchema),
    asyncHandler(ctrl.reassign)
)

export default router
