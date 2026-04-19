import { Router } from 'express'
import * as ctrl from './payment.controller'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

// Student-facing payments tab. POLICY['payment'] grants STUDENT both read and write.
router.get('/pending', requirePolicy('payment', 'read'), asyncHandler(ctrl.pending))
router.get('/invoices', requirePolicy('payment', 'read'), asyncHandler(ctrl.invoices))
router.post('/:invoiceId/pay', requirePolicy('payment', 'write'), asyncHandler(ctrl.pay))

export default router
