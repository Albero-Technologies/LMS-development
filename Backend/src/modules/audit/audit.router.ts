import { Router } from 'express'
import { Role } from '@prisma/client'
import * as ctrl from './audit.controller'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requireRole } from '../../middleware/auth'

const router = Router()

// Audit logs are sensitive — only tenant owners and the platform admin should
// see them. SUPER_ADMIN sees cross-tenant; ADMIN is scoped in the service.
router.use(requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN))

router.get('/', asyncHandler(ctrl.list))

export default router
