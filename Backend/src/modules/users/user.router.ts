import { Router } from 'express'
import * as ctrl from './user.controller'
import { validate } from '../../middleware/validate'
import { inviteUserSchema, listUsersQuerySchema, updateUserSchema } from './user.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePolicy('user', 'read'), validate(listUsersQuerySchema, 'query'), asyncHandler(ctrl.list))
router.get('/:id', requirePolicy('user', 'read'), asyncHandler(ctrl.get))
router.patch('/:id', requirePolicy('user', 'write'), validate(updateUserSchema), asyncHandler(ctrl.update))
router.delete('/:id', requirePolicy('user', 'write'), asyncHandler(ctrl.remove))

router.post('/invites', requirePolicy('user', 'write'), validate(inviteUserSchema), asyncHandler(ctrl.invite))

export default router
