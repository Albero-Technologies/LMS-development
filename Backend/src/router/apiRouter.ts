import { Router } from 'express'
import apiController from '../controller/apiController'
import rateLimit from '../middleware/rateLimit'

import authRouter from '../modules/auth/auth.router'
import tenantRouter from '../modules/tenants/tenant.router'
import userRouter from '../modules/users/user.router'
import courseRouter from '../modules/courses/course.router'
import enrollmentRouter from '../modules/enrollments/enrollment.router'
import quizRouter from '../modules/quizzes/quiz.router'
import batchRouter from '../modules/batches/batch.router'
import ticketRouter from '../modules/tickets/ticket.router'
import notificationRouter from '../modules/notifications/notification.router'
import dashboardRouter from '../modules/dashboards/dashboard.router'
import uploadRouter from '../modules/uploads/upload.router'
import counsellorInviteRouter from '../modules/counsellor-invites/counsellor-invite.router'
import counsellorPublicRouter from '../modules/counsellor-invites/counsellor-public.router'
import counsellorManagementRouter from '../modules/counsellor-management/counsellor-management.router'
import paymentRouter from '../modules/payments/payment.router'
import enquiryRouter from '../modules/enquiries/enquiry.router'
import auditRouter from '../modules/audit/audit.router'
import mediaRouter from '../modules/media/media.router'
import cmsRouter from '../modules/cms/cms.router'
import seoRouter from '../modules/seo/seo.router'
import swaggerRouter from '../docs/swagger'

const router = Router()

router.get('/self', apiController.self)
router.get('/health', rateLimit, apiController.health)
router.get('/metrics', apiController.metrics)

router.use('/auth', authRouter)
router.use('/tenants', tenantRouter)
router.use('/users', userRouter)
router.use('/courses', courseRouter)
router.use('/enrollments', enrollmentRouter)
router.use('/quizzes', quizRouter)
router.use('/batches', batchRouter)
router.use('/counsellor', counsellorInviteRouter)
router.use('/counsellor', counsellorManagementRouter)
router.use('/onboarding', counsellorPublicRouter)
router.use('/payments', paymentRouter)
router.use('/enquiries', enquiryRouter)
router.use('/tickets', ticketRouter)
router.use('/notifications', notificationRouter)
router.use('/dashboard', dashboardRouter)
router.use('/uploads', uploadRouter)
router.use('/media', mediaRouter)
router.use('/cms', cmsRouter)
router.use('/sites', seoRouter)
router.use('/audit-logs', auditRouter)

// Swagger UI + raw OpenAPI JSON at /api/v1/docs and /api/v1/openapi.json
router.use('/', swaggerRouter)

export default router
