import { Router } from 'express'
import * as ctrl from './counsellor-invite.controller'
import { validate } from '../../middleware/validate'
import { createInviteLinkSchema, setTargetSchema } from './counsellor-invite.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

// Counsellor / admin scoped — invite link CRUD
router.get('/invites', requirePolicy('counsellor_invite', 'read'), asyncHandler(ctrl.list))
router.post('/invites', requirePolicy('counsellor_invite', 'write'), validate(createInviteLinkSchema), asyncHandler(ctrl.create))
router.get('/invites/:id', requirePolicy('counsellor_invite', 'read'), asyncHandler(ctrl.get))
router.post('/invites/:id/revoke', requirePolicy('counsellor_invite', 'write'), asyncHandler(ctrl.revoke))
router.delete('/invites/:id', requirePolicy('counsellor_invite', 'write'), asyncHandler(ctrl.remove))
router.post('/invites/signups/:signupId/share', requirePolicy('counsellor_invite', 'write'), asyncHandler(ctrl.shareCreds))
router.post('/invites/signups/:signupId/regenerate', requirePolicy('counsellor_invite', 'write'), asyncHandler(ctrl.regenerateCreds))

// Counsellor desk
router.get('/students', requirePolicy('counsellor_invite', 'read'), asyncHandler(ctrl.myStudents))
router.get('/targets', requirePolicy('counsellor_target', 'read'), asyncHandler(ctrl.myTarget))
router.get('/targets/history', requirePolicy('counsellor_target', 'read'), asyncHandler(ctrl.myTargetHistory))
router.post('/targets', requirePolicy('counsellor_target', 'write'), validate(setTargetSchema), asyncHandler(ctrl.setTarget))

export default router
