import { Router } from 'express'
import * as ctrl from './course.controller'
import { validate } from '../../middleware/validate'
import {
    createCourseSchema,
    createLessonSchema,
    createSectionSchema,
    listCoursesQuerySchema,
    progressUpdateSchema,
    updateCourseSchema,
    updateLessonSchema,
    updateSectionSchema
} from './course.schema'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePolicy('course', 'read'), validate(listCoursesQuerySchema, 'query'), asyncHandler(ctrl.list))
router.get('/:id', requirePolicy('course', 'read'), asyncHandler(ctrl.get))

router.post('/', requirePolicy('course', 'write'), validate(createCourseSchema), asyncHandler(ctrl.create))
router.patch('/:id', requirePolicy('course', 'write'), validate(updateCourseSchema), asyncHandler(ctrl.update))
router.delete('/:id', requirePolicy('course', 'write'), asyncHandler(ctrl.remove))

router.post('/:id/sections', requirePolicy('course', 'write'), validate(createSectionSchema), asyncHandler(ctrl.addSection))
router.patch('/:id/sections/:sectionId', requirePolicy('course', 'write'), validate(updateSectionSchema), asyncHandler(ctrl.updateSection))
router.delete('/:id/sections/:sectionId', requirePolicy('course', 'write'), asyncHandler(ctrl.deleteSection))

router.post('/:id/lessons', requirePolicy('lesson', 'write'), validate(createLessonSchema), asyncHandler(ctrl.addLesson))
router.patch('/:id/lessons/:lessonId', requirePolicy('lesson', 'write'), validate(updateLessonSchema), asyncHandler(ctrl.updateLesson))
router.delete('/:id/lessons/:lessonId', requirePolicy('lesson', 'write'), asyncHandler(ctrl.deleteLesson))

router.post('/:id/lessons/:lessonId/progress', validate(progressUpdateSchema), asyncHandler(ctrl.updateProgress))

export default router
