import { Router } from 'express'
import * as ctrl from './seo.controller'
import { asyncHandler } from '../../middleware/asyncHandler'

// Per-tenant SEO endpoints. Mounted under /api/v1/sites/:slug — kept off the
// /tenants router so search engines aren't crawling JSON tenant payloads.
const router = Router()

router.get('/:slug/sitemap.xml', asyncHandler(ctrl.getTenantSitemap))
router.get('/:slug/robots.txt', asyncHandler(ctrl.getTenantRobots))

export default router
