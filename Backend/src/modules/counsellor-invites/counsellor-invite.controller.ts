import { Request, Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './counsellor-invite.service'

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const link = await service.createInviteLink(req.auth.tenantId, req.auth.userId, req.body)
    await writeAudit(
        { action: 'counsellor.invite_link.create', entityType: 'CounsellorInviteLink', entityId: link.id },
        req
    )
    httpResponse(req, res, 201, responseMessage.CREATED, link)
}

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const items = await service.listInviteLinks(req.auth.tenantId, req.auth.role, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const link = await service.getInviteLink(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id as string)
    httpResponse(req, res, 200, responseMessage.SUCCESS, link)
}

export const revoke = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const link = await service.revokeInviteLink(
        req.auth.tenantId,
        req.auth.role,
        req.auth.userId,
        req.params.id as string
    )
    await writeAudit(
        { action: 'counsellor.invite_link.revoke', entityType: 'CounsellorInviteLink', entityId: link.id },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, link)
}

export const shareCreds = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const creds = await service.shareCredentials(
        req.auth.tenantId,
        req.auth.role,
        req.auth.userId,
        req.params.signupId as string
    )
    await writeAudit(
        { action: 'counsellor.signup.share_creds', entityType: 'StudentSignup', entityId: req.params.signupId as string },
        req
    )
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

export const setTarget = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const target = await service.setCounsellorTarget(
        req.auth.tenantId,
        req.auth.role,
        req.auth.userId,
        req.body
    )
    await writeAudit(
        { action: 'counsellor.target.set', entityType: 'CounsellorTarget', entityId: target.id },
        req
    )
    httpResponse(req, res, 201, responseMessage.CREATED, target)
}

// ----- public (no auth) -----

export const publicResolve = async (req: Request, res: Response): Promise<void> => {
    const data = await service.resolveInviteLink(req.params.token as string)
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const publicSubmit = async (req: Request, res: Response): Promise<void> => {
    const result = await service.submitOnboarding(req.params.token as string, req.body)
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}
