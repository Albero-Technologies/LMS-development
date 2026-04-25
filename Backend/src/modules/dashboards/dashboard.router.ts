import { Router, type Request, type Response } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth, requirePolicy } from '../../middleware/auth'
import { getDashboard, getMonitoringSnapshot, getReports } from './dashboard.service'
import db from '../../service/db'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'

const router = Router()

router.get(
    '/me',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.auth) return
        const data = await getDashboard(req.auth.tenantId, req.auth.role, req.auth.userId)
        httpResponse(req, res, 200, responseMessage.SUCCESS, data)
    })
)

router.get(
    '/reports',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.auth) return
        const tenantSlug = typeof req.query.tenantSlug === 'string' ? req.query.tenantSlug : undefined
        const data = await getReports(req.auth.tenantId, req.auth.role, tenantSlug)
        httpResponse(req, res, 200, responseMessage.SUCCESS, data)
    })
)

// Admin-only monitoring view. Lightweight live snapshot — pair with /metrics for Prometheus.
router.get(
    '/monitoring',
    requireAuth,
    requirePolicy('monitoring', 'read'),
    asyncHandler(async (req: Request, res: Response) => {
        let dbHealthy = false
        try {
            await db.client.$queryRaw`SELECT 1`
            dbHealthy = true
        } catch {
            /* db down — surfaced below */
        }
        httpResponse(req, res, dbHealthy ? 200 : 503, responseMessage.SUCCESS, {
            ...getMonitoringSnapshot(),
            db: dbHealthy ? 'up' : 'down'
        })
    })
)

export default router
