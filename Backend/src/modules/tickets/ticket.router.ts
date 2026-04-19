import { Router } from 'express'
import * as ctrl from './ticket.controller'
import { validate } from '../../middleware/validate'
import { addCommentSchema, createTicketSchema, listTicketsQuerySchema, updateTicketSchema } from './ticket.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePolicy('ticket', 'read'), validate(listTicketsQuerySchema, 'query'), asyncHandler(ctrl.list))
router.get('/:id', requirePolicy('ticket', 'read'), asyncHandler(ctrl.get))
router.post('/', requirePolicy('ticket', 'write'), validate(createTicketSchema), asyncHandler(ctrl.create))
router.patch('/:id', requirePolicy('ticket', 'write'), validate(updateTicketSchema), asyncHandler(ctrl.update))
router.post('/:id/comments', requirePolicy('ticket', 'write'), validate(addCommentSchema), asyncHandler(ctrl.addComment))

export default router
