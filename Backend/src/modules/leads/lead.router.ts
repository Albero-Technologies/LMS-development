import { Router } from 'express'
import * as ctrl from './lead.controller'
import { validate } from '../../middleware/validate'
import { createInteractionSchema, createLeadSchema, listLeadsQuerySchema, moveStageSchema, updateLeadSchema } from './lead.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePolicy('lead', 'read'), validate(listLeadsQuerySchema, 'query'), asyncHandler(ctrl.list))
router.get('/:id', requirePolicy('lead', 'read'), asyncHandler(ctrl.get))
router.post('/', requirePolicy('lead', 'write'), validate(createLeadSchema), asyncHandler(ctrl.create))
router.patch('/:id', requirePolicy('lead', 'write'), validate(updateLeadSchema), asyncHandler(ctrl.update))
router.post('/:id/stage', requirePolicy('lead', 'write'), validate(moveStageSchema), asyncHandler(ctrl.moveStage))
router.post('/:id/interactions', requirePolicy('lead', 'write'), validate(createInteractionSchema), asyncHandler(ctrl.addInteraction))

export default router
