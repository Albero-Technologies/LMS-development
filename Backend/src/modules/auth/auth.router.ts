import { Router } from 'express'
import * as ctrl from './auth.controller'
import { validate } from '../../middleware/validate'
import { acceptInviteSchema, loginSchema, refreshSchema, registerSchema } from './auth.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'

const router = Router()

router.post('/register', validate(registerSchema), asyncHandler(ctrl.register))
router.post('/login', validate(loginSchema), asyncHandler(ctrl.login))
router.post('/refresh', validate(refreshSchema), asyncHandler(ctrl.refresh))
router.post('/logout', asyncHandler(ctrl.logout))
router.post('/invites/accept', validate(acceptInviteSchema), asyncHandler(ctrl.acceptInvite))

router.get('/me', requireAuth, ctrl.me)

router.get('/google', ctrl.googleStart)
router.get('/google/callback', asyncHandler(ctrl.googleCallback))

export default router
