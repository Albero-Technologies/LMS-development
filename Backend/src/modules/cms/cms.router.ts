import { Router } from 'express'
import { Role } from '@prisma/client'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requireRole } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import * as ctrl from './cms.controller'
import { collectionCreateSchema, collectionUpdateSchema, itemCreateSchema, itemUpdateSchema } from './cms.schema'

const router = Router()

router.use(requireAuth)

// Collections — schema-defining authority lives with ADMIN+ only.
router.get('/collections', requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.listCollections))
router.post(
    '/collections',
    requireRole(Role.ADMIN, Role.SUPER_ADMIN),
    validate(collectionCreateSchema),
    asyncHandler(ctrl.createCollection)
)
router.get('/collections/:id', requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.getCollection))
router.patch(
    '/collections/:id',
    requireRole(Role.ADMIN, Role.SUPER_ADMIN),
    validate(collectionUpdateSchema),
    asyncHandler(ctrl.updateCollection)
)
router.delete('/collections/:id', requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.deleteCollection))

// Items — same gate. (TRAINER could be allowed later if a tenant wants
// content contributors who don't manage schemas.)
router.get('/collections/:id/items', requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.listItems))
router.post(
    '/collections/:id/items',
    requireRole(Role.ADMIN, Role.SUPER_ADMIN),
    validate(itemCreateSchema),
    asyncHandler(ctrl.createItem)
)
router.get('/collections/:id/items/:itemId', requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.getItem))
router.patch(
    '/collections/:id/items/:itemId',
    requireRole(Role.ADMIN, Role.SUPER_ADMIN),
    validate(itemUpdateSchema),
    asyncHandler(ctrl.updateItem)
)
router.delete('/collections/:id/items/:itemId', requireRole(Role.ADMIN, Role.SUPER_ADMIN), asyncHandler(ctrl.deleteItem))

export default router
