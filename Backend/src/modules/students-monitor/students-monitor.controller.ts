import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import AppError from '../../util/AppError'
import * as service from './students-monitor.service'
import type { TListStudentsInput, TTeamBucketsInput, TStatsTimelineInput } from './students-monitor.schema'

const ctxFrom = (req: Request) => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    return { role: req.auth.role, tenantId: req.auth.tenantId, userId: req.auth.userId }
}

// All three handlers read the validated payload from `req.query` — the
// router pairs each route with `validate(schema, 'query')`.
export const listStudents = async (req: Request, res: Response): Promise<void> => {
    const data = await service.listStudents(req.query as unknown as TListStudentsInput, ctxFrom(req))
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const listTeamBuckets = async (req: Request, res: Response): Promise<void> => {
    const data = await service.listTeamBuckets(req.query as unknown as TTeamBucketsInput, ctxFrom(req))
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const getStatsTimeline = async (req: Request, res: Response): Promise<void> => {
    const data = await service.getStatsTimeline(req.query as unknown as TStatsTimelineInput, ctxFrom(req))
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}
