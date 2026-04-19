import { Router, Request, Response } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAuth } from '../../middleware/auth'
import { getDashboard } from './dashboard.service'
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

export default router
