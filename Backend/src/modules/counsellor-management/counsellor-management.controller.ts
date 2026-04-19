import { Request, Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './counsellor-management.service'
import { TReportRange } from './counsellor-management.schema'

const rangeFromQuery = (req: Request): TReportRange => ({
    preset: (req.query.preset as TReportRange['preset']) || undefined,
    from: req.query.from ? new Date(req.query.from as string) : undefined,
    to: req.query.to ? new Date(req.query.to as string) : undefined
})

// ----- profile -----
export const profile = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const me = await service.getMyProfile(req.auth.tenantId, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, me)
}

// ----- team -----
export const team = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listManagedCounsellors(req.auth.tenantId, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const assignManager = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const updated = await service.assignManager(req.auth.tenantId, req.body)
    await writeAudit(
        { action: 'counsellor.assign_manager', entityType: 'User', entityId: updated.id, metadata: { managerId: updated.managerId } },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, updated)
}

// ----- reports -----
export const myReport = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const report = await service.getCounsellorReport(
        req.auth.tenantId,
        req.auth.role,
        req.auth.userId,
        req.auth.userId,
        rangeFromQuery(req)
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, report)
}

export const counsellorReport = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const report = await service.getCounsellorReport(
        req.auth.tenantId,
        req.auth.role,
        req.auth.userId,
        req.params.counsellorId as string,
        rangeFromQuery(req)
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, report)
}

export const teamReport = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const data = await service.getTeamReport(
        req.auth.tenantId,
        req.auth.role,
        req.auth.userId,
        rangeFromQuery(req),
        req.query.managerId as string | undefined
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

// ----- tasks -----
export const createTask = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const task = await service.createTask(req.auth.tenantId, req.auth.role, req.auth.userId, req.body)
    await writeAudit(
        { action: 'counsellor.task.create', entityType: 'CounsellorTask', entityId: task.id },
        req
    )
    httpResponse(req, res, 201, responseMessage.CREATED, task)
}

export const listTasks = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listTasks(req.auth.tenantId, req.auth.role, req.auth.userId, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const task = await service.updateTask(
        req.auth.tenantId,
        req.auth.role,
        req.auth.userId,
        req.params.id as string,
        req.body
    )
    await writeAudit(
        { action: 'counsellor.task.update', entityType: 'CounsellorTask', entityId: task.id, metadata: { status: task.status } },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, task)
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteTask(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id as string)
    await writeAudit({ action: 'counsellor.task.delete', entityType: 'CounsellorTask', entityId: req.params.id as string }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, { id: req.params.id })
}
