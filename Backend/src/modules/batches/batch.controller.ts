import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './batch.service'
import { writeAudit } from '../../util/audit'

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listBatches(req.auth.tenantId, req.query.courseId as string | undefined)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const batch = await service.getBatch(req.auth.tenantId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, batch)
}

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const batch = await service.createBatch(req.auth.tenantId, req.body)
    await writeAudit({ action: 'batch.create', entityType: 'Batch', entityId: batch.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, batch)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const batch = await service.updateBatch(req.auth.tenantId, req.params.id, req.body)
    httpResponse(req, res, 200, responseMessage.SUCCESS, batch)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteBatch(req.auth.tenantId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const assignStudents = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.assignStudents(req.auth.tenantId, req.params.id, req.body)
    await writeAudit({ action: 'batch.assign', entityType: 'Batch', entityId: req.params.id, metadata: result }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const transferStudent = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.transferStudent(req.auth.tenantId, req.params.id, req.body)
    await writeAudit({ action: 'batch.transfer', entityType: 'Batch', entityId: req.params.id, metadata: { ...req.body } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}
