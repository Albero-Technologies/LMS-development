import { Router } from 'express'
import * as ctrl from './demo-mode.controller'
import { bulkUpdateDemoSchema, listDemoEnrolmentsSchema, sendPaymentReminderSchema, updateDemoEnrolmentSchema } from './demo-mode.schema'
import { validate } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'

// Admin Demo Mode console — manage per-student access overrides for the
// registration-fee → full-fee gating model. Read access is open to
// COUNSELLOR + COUNSELLING_MANAGER (so they can audit the funnel); write
// access is gated to ADMIN + SUPER_ADMIN inside the service.
const router = Router()

router.use(requireAuth)

router.get('/enrolments', validate(listDemoEnrolmentsSchema, 'query'), asyncHandler(ctrl.list))
router.patch('/enrolments/:id', validate(updateDemoEnrolmentSchema), asyncHandler(ctrl.update))
router.post('/enrolments/bulk', validate(bulkUpdateDemoSchema), asyncHandler(ctrl.bulk))
router.post('/enrolments/reminder', validate(sendPaymentReminderSchema), asyncHandler(ctrl.reminder))

export default router
