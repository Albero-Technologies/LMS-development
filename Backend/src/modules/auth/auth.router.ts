import { Router } from 'express'
import * as ctrl from './auth.controller'
import { validate } from '../../middleware/validate'
import { acceptInviteSchema, changePasswordSchema, loginSchema, refreshSchema, setPasswordWithTokenSchema, updateProfileSchema } from './auth.schema'
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

router.get('/me', requireAuth, asyncHandler(ctrl.me))
router.patch('/me', requireAuth, validate(updateProfileSchema), asyncHandler(ctrl.updateMe))
router.post('/me/password', requireAuth, validate(changePasswordSchema), asyncHandler(ctrl.changeMyPassword))

// Public set-password (one-time-token) endpoints. The student lands here
// from the welcome email's "Set your new password" CTA. The verify route
// is used by the form to render a masked email; the consume route flips
// the password and signs the user in.
router.get('/password/set-token/:token', asyncHandler(ctrl.verifyPasswordResetToken))
router.post('/password/set-with-token', validate(setPasswordWithTokenSchema), asyncHandler(ctrl.setPasswordWithToken))

export default router
