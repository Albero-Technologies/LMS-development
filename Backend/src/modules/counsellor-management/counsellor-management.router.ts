import { Router } from 'express'
import * as ctrl from './counsellor-management.controller'
import { validate } from '../../middleware/validate'
import {
    assignManagerSchema,
    createTaskSchema,
    reportRangeSchema,
    taskListQuerySchema,
    updateTaskSchema
} from './counsellor-management.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

// Counsellor / manager profile card (id, employeeCode, manager)
router.get('/profile/me', requirePolicy('counsellor_report', 'read'), asyncHandler(ctrl.profile))

// ---- Reports ----
// Counsellor's own report
router.get(
    '/reports/me',
    requirePolicy('counsellor_report', 'read'),
    validate(reportRangeSchema, 'query'),
    asyncHandler(ctrl.myReport)
)
// Manager / admin: a single counsellor's report
router.get(
    '/reports/counsellors/:counsellorId',
    requirePolicy('counsellor_report', 'read'),
    validate(reportRangeSchema, 'query'),
    asyncHandler(ctrl.counsellorReport)
)
// Manager team aggregate (admin can pass ?managerId=)
router.get(
    '/reports/team',
    requirePolicy('counsellor_team', 'read'),
    validate(reportRangeSchema, 'query'),
    asyncHandler(ctrl.teamReport)
)

// ---- Team ----
router.get('/team', requirePolicy('counsellor_team', 'read'), asyncHandler(ctrl.team))
router.post(
    '/team/assign',
    requirePolicy('counsellor_team', 'write'),
    validate(assignManagerSchema),
    asyncHandler(ctrl.assignManager)
)

// ---- Tasks ----
router.get(
    '/tasks',
    requirePolicy('counsellor_task', 'read'),
    validate(taskListQuerySchema, 'query'),
    asyncHandler(ctrl.listTasks)
)
router.post(
    '/tasks',
    requirePolicy('counsellor_task', 'write'),
    validate(createTaskSchema),
    asyncHandler(ctrl.createTask)
)
router.patch(
    '/tasks/:id',
    requirePolicy('counsellor_task', 'write'),
    validate(updateTaskSchema),
    asyncHandler(ctrl.updateTask)
)
router.delete('/tasks/:id', requirePolicy('counsellor_task', 'write'), asyncHandler(ctrl.deleteTask))

export default router
