import { Router } from 'express'
import * as ctrl from './batch.controller'
import { validate } from '../../middleware/validate'
import { assignStudentsSchema, createBatchSchema, transferStudentSchema, updateBatchSchema } from './batch.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePolicy('batch', 'read'), asyncHandler(ctrl.list))
router.get('/:id', requirePolicy('batch', 'read'), asyncHandler(ctrl.get))
router.post('/', requirePolicy('batch', 'write'), validate(createBatchSchema), asyncHandler(ctrl.create))
router.patch('/:id', requirePolicy('batch', 'write'), validate(updateBatchSchema), asyncHandler(ctrl.update))
router.delete('/:id', requirePolicy('batch', 'write'), asyncHandler(ctrl.remove))

router.post('/:id/students', requirePolicy('batch', 'write'), validate(assignStudentsSchema), asyncHandler(ctrl.assignStudents))
router.post('/:id/transfer', requirePolicy('batch', 'write'), validate(transferStudentSchema), asyncHandler(ctrl.transferStudent))

export default router
