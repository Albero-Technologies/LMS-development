import { Router } from 'express'
import * as ctrl from './assignment.controller'
import { validate } from '../../middleware/validate'
import {
    createAssignmentSchema,
    gradeSubmissionSchema,
    listAssignmentsQuerySchema,
    submitAssignmentSchema,
    updateAssignmentSchema
} from './assignment.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

// CRUD — gated by 'assignment' policy. Students get filtered listings via the
// service layer (only published assignments for courses they're enrolled in).
router.get('/', requirePolicy('assignment', 'read'), validate(listAssignmentsQuerySchema, 'query'), asyncHandler(ctrl.list))
router.get('/:id', requirePolicy('assignment', 'read'), asyncHandler(ctrl.get))
router.post('/', requirePolicy('assignment', 'write'), validate(createAssignmentSchema), asyncHandler(ctrl.create))
router.patch('/:id', requirePolicy('assignment', 'write'), validate(updateAssignmentSchema), asyncHandler(ctrl.update))
router.delete('/:id', requirePolicy('assignment', 'write'), asyncHandler(ctrl.remove))

// Student submission — separate policy so a STUDENT can submit without being
// granted the broader `assignment.write` (which would let them edit the
// assignment itself).
router.post('/:id/submit', requirePolicy('assignment_submission', 'write'), validate(submitAssignmentSchema), asyncHandler(ctrl.submit))

// Staff grading — `assignment.write` policy (TRAINER, ADMIN, SUPER_ADMIN).
router.post(
    '/submissions/:submissionId/grade',
    requirePolicy('assignment', 'write'),
    validate(gradeSubmissionSchema),
    asyncHandler(ctrl.grade)
)

export default router
