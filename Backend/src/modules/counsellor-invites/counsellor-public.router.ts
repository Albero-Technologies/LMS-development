import { Router } from 'express'
import * as ctrl from './counsellor-invite.controller'
import { validate } from '../../middleware/validate'
import { submitOnboardingSchema } from './counsellor-invite.schema'
import { asyncHandler } from '../../middleware/asyncHandler'

// Public — no auth. The token in the URL is the credential.
const router = Router()

router.get('/:token', asyncHandler(ctrl.publicResolve))
router.post('/:token/submit', validate(submitOnboardingSchema), asyncHandler(ctrl.publicSubmit))

export default router
