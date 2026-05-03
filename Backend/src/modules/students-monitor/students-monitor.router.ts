import { Router } from 'express'
import * as ctrl from './students-monitor.controller'
import { listStudentsSchema, statsTimelineSchema, teamBucketsSchema } from './students-monitor.schema'
import { validate } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'

// Sales-perspective monitoring surface — students table, team buckets,
// stats timeline. Authorised inside the service per role; this router
// just gates on auth.
const router = Router()

router.use(requireAuth)

router.get('/students', validate(listStudentsSchema, 'query'), asyncHandler(ctrl.listStudents))
router.get('/team-buckets', validate(teamBucketsSchema, 'query'), asyncHandler(ctrl.listTeamBuckets))
router.get('/stats', validate(statsTimelineSchema, 'query'), asyncHandler(ctrl.getStatsTimeline))

export default router
