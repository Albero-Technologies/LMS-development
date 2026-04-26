import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './assignment.service'
import { writeAudit } from '../../util/audit'

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listAssignments(req.auth.tenantId, req.auth.role, req.auth.userId, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const row = await service.getAssignment(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, row)
}

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const row = await service.createAssignment(req.auth.tenantId, req.auth.userId, req.body)
    await writeAudit({ action: 'assignment.create', entityType: 'Assignment', entityId: row.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, row)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const row = await service.updateAssignment(req.auth.tenantId, req.params.id, req.body)
    await writeAudit({ action: 'assignment.update', entityType: 'Assignment', entityId: row.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, row)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteAssignment(req.auth.tenantId, req.params.id)
    await writeAudit({ action: 'assignment.delete', entityType: 'Assignment', entityId: req.params.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, { id: req.params.id })
}

// Student writes to /:id/submit ; staff grades via /submissions/:submissionId/grade.
export const submit = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const row = await service.submitAssignment(req.auth.tenantId, req.auth.userId, req.params.id, req.body)
    await writeAudit({ action: 'assignment.submit', entityType: 'AssignmentSubmission', entityId: row.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, row)
}

export const grade = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const row = await service.gradeSubmission(req.auth.tenantId, req.auth.userId, req.params.submissionId, req.body)
    await writeAudit(
        {
            action: 'assignment.grade',
            entityType: 'AssignmentSubmission',
            entityId: row.id,
            metadata: { score: row.score }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, row)
}
