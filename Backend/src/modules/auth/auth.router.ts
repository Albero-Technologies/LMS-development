import { Router } from 'express'
import * as ctrl from './auth.controller'
import { validate } from '../../middleware/validate'
import { acceptInviteSchema, loginSchema, refreshSchema } from './auth.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'

const router = Router()

// NOTE: there is intentionally no public POST /auth/register route.
// Users enter the platform through one of three channels, all handled
// elsewhere:
//   1. Super admin creates a tenant       → POST /tenants (SA only)
//   2. Counsellor converts an enquiry     → POST /onboarding/:token/submit
//   3. Admin invites a teammate           → POST /auth/invites/accept
// The public website shows only the enquiry form (POST /enquiries) — never a
// tenant-creating register form. `registerSchema` and the `register` service
// function still exist for seed scripts and internal use.

router.post('/login', validate(loginSchema), asyncHandler(ctrl.login))
router.post('/refresh', validate(refreshSchema), asyncHandler(ctrl.refresh))
router.post('/logout', asyncHandler(ctrl.logout))
router.post('/invites/accept', validate(acceptInviteSchema), asyncHandler(ctrl.acceptInvite))

router.get('/me', requireAuth, ctrl.me)

export default router
