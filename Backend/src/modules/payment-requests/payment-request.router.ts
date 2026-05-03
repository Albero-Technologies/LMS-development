import { Router } from 'express'
import * as ctrl from './payment-request.controller'
import {
    cancelPaymentRequestSchema,
    createPaymentRequestSchema,
    listPaymentRequestsSchema,
    reviewPaymentRequestSchema
} from './payment-request.schema'
import { validate } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'

// Counsellor-driven offline payment workflow. All routes require auth;
// authorisation is enforced inside the service per-role:
//   - POST   /              counsellor / manager / admin / SA submits
//   - GET    /              counsellor sees own; manager team's; admin tenant's
//   - POST   /:id/review    admin / SA approves or rejects
//   - POST   /:id/cancel    requester (or admin) cancels a pending request

const router = Router()

router.use(requireAuth)

router.post('/', validate(createPaymentRequestSchema), asyncHandler(ctrl.create))
router.get('/', validate(listPaymentRequestsSchema, 'query'), asyncHandler(ctrl.list))
router.post('/:id/review', validate(reviewPaymentRequestSchema), asyncHandler(ctrl.review))
router.post('/:id/cancel', validate(cancelPaymentRequestSchema), asyncHandler(ctrl.cancel))

export default router
