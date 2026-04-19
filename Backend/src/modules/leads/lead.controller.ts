import { Request, Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './lead.service'
import { writeAudit } from '../../util/audit'

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.listLeads(req.auth.tenantId, req.auth.role, req.auth.userId, req.query as never)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

export const get = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const lead = await service.getLead(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id as string)
    httpResponse(req, res, 200, responseMessage.SUCCESS, lead)
}

export const create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const lead = await service.createLead(req.auth.tenantId, req.auth.userId, req.body)
    await writeAudit({ action: 'lead.create', entityType: 'Lead', entityId: lead.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, lead)
}

export const update = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const lead = await service.updateLead(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id as string, req.body)
    httpResponse(req, res, 200, responseMessage.SUCCESS, lead)
}

export const moveStage = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const lead = await service.moveStage(req.auth.tenantId, req.auth.role, req.auth.userId, req.params.id as string, req.body)
    await writeAudit({ action: 'lead.move_stage', entityType: 'Lead', entityId: lead.id, metadata: { stage: lead.stage } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, lead)
}

export const addInteraction = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const row = await service.addInteraction(req.auth.tenantId, req.auth.userId, req.params.id as string, req.body)
    httpResponse(req, res, 201, responseMessage.CREATED, row)
}
