import { Router } from 'express'
import * as ctrl from './quiz.controller'
import { validate } from '../../middleware/validate'
import { createQuizSchema, submitAttemptSchema, updateQuizSchema } from './quiz.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.post('/', requirePolicy('quiz', 'write'), validate(createQuizSchema), asyncHandler(ctrl.create))
router.get('/:id', requirePolicy('quiz', 'read'), asyncHandler(ctrl.get))
router.patch('/:id', requirePolicy('quiz', 'write'), validate(updateQuizSchema), asyncHandler(ctrl.update))
router.delete('/:id', requirePolicy('quiz', 'write'), asyncHandler(ctrl.remove))

// Attempts
router.post('/:id/attempts', requirePolicy('quiz_attempt', 'write'), asyncHandler(ctrl.startAttempt))
router.post('/attempts/:attemptId/submit', requirePolicy('quiz_attempt', 'write'), validate(submitAttemptSchema), asyncHandler(ctrl.submitAttempt))
router.get('/attempts/mine', requirePolicy('quiz_attempt', 'read'), asyncHandler(ctrl.myAttempts))

export default router
