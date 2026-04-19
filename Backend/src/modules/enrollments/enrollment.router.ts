import { Router } from 'express'
import * as ctrl from './enrollment.controller'
import { validate } from '../../middleware/validate'
import { createEnrollmentSchema, verifyPaymentSchema } from './enrollment.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

// Student flow
router.post('/', validate(createEnrollmentSchema), asyncHandler(ctrl.start))
router.post('/verify-payment', validate(verifyPaymentSchema), asyncHandler(ctrl.verifyPayment))
router.get('/mine', asyncHandler(ctrl.mine))

// Admin view
router.get('/', requirePolicy('enrollment', 'read'), asyncHandler(ctrl.adminList))

export default router
