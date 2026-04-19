import { Router } from 'express'
import * as ctrl from './notification.controller'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)
router.get('/', asyncHandler(ctrl.list))
router.post('/:id/read', asyncHandler(ctrl.markRead))

export default router
