import { Router } from 'express'
import * as ctrl from './public-purchase.controller'
import { initPurchaseSchema, verifyPurchaseSchema, cancelPurchaseSchema } from './public-purchase.schema'
import { validate } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/asyncHandler'

// Three-step public checkout: init → verify (or cancel). All routes are
// unauthenticated; the tenant is resolved via the slug on init and via the
// purchaseId thereafter.
const router = Router()

router.post('/init', validate(initPurchaseSchema), asyncHandler(ctrl.init))
router.post('/verify', validate(verifyPurchaseSchema), asyncHandler(ctrl.verify))
router.post('/cancel', validate(cancelPurchaseSchema), asyncHandler(ctrl.cancel))

export default router
