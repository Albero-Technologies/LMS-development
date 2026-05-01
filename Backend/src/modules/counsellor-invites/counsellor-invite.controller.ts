import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './counsellor-invite.service'

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const link = await service.createInviteLink(req.auth.tenantId, req.auth.userId, req.body)
    await writeAudit({ action: 'counsellor.invite_link.create', entityType: 'CounsellorInviteLink', entityId: link.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, link)
}

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const items = await service.listInviteLinks(req.auth.tenantId, req.auth.role, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const link = await service.getInviteLink(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, link)
}

export const revoke = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const link = await service.revokeInviteLink(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id)
    await writeAudit({ action: 'counsellor.invite_link.revoke', entityType: 'CounsellorInviteLink', entityId: link.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, link)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    await service.deleteInviteLink(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id)
    await writeAudit({ action: 'counsellor.invite_link.delete', entityType: 'CounsellorInviteLink', entityId: req.params.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS)
}

export const shareCreds = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const creds = await service.shareCredentials(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.signupId)
    await writeAudit({ action: 'counsellor.signup.share_creds', entityType: 'StudentSignup', entityId: req.params.signupId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, creds)
}

export const regenerateCreds = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const creds = await service.regenerateCredentials(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.signupId)
    await writeAudit({ action: 'counsellor.signup.regenerate_creds', entityType: 'StudentSignup', entityId: req.params.signupId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, creds)
}

export const myStudents = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyStudents(req.auth.tenantId, req.auth.role, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const myTarget = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const period = req.query.period ? new Date(req.query.period as string) : undefined
    const data = await service.getCounsellorTarget(req.auth.tenantId, req.auth.userId, period)
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

// Multi-month tracker — last 6 months (current + 5 prior). Drives the
// counsellor dashboard's calendar/grid view.
export const myTargetHistory = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const monthsParam = typeof req.query.months === 'string' ? Number(req.query.months) : NaN
    const monthsBack = Number.isFinite(monthsParam) ? Math.max(0, Math.min(11, Math.trunc(monthsParam))) : 5
    const data = await service.getCounsellorMonthlyHistory(req.auth.tenantId, req.auth.userId, monthsBack)
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const setTarget = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const target = await service.setCounsellorTarget(req.auth.tenantId, req.auth.role, req.auth.userId, req.body)
    await writeAudit({ action: 'counsellor.target.set', entityType: 'CounsellorTarget', entityId: target.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, target)
}

// ----- public (no auth) -----

export const publicResolve = async (req: Request, res: Response): Promise<void> => {
    const data = await service.resolveInviteLink(req.params.token)
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const publicSubmit = async (req: Request, res: Response): Promise<void> => {
    const result = await service.submitOnboarding(req.params.token, req.body)
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}
