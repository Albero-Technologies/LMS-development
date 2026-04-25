import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import AppError from '../../util/AppError'
import { writeAudit } from '../../util/audit'
import { publicUrlFor } from '../../middleware/upload'
import * as service from './media.service'

// POST /media/upload — multer wrote the file; we register the metadata so
// it shows up in the library list.
export const upload = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    if (!req.file) throw AppError.badRequest('No file uploaded', 'UPLOAD_MISSING')
    const file = req.file
    const asset = await service.recordAsset({
        tenantId: req.auth.tenantId,
        uploadedById: req.auth.userId,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        sizeBytes: file.size,
        url: publicUrlFor(file.path),
        kind: typeof req.body.kind === 'string' ? req.body.kind : 'media',
        altText: typeof req.body.altText === 'string' ? req.body.altText : undefined
    })
    await writeAudit(
        { action: 'media.upload', entityType: 'MediaAsset', entityId: asset.id, metadata: { size: asset.sizeBytes, mime: asset.mimetype } },
        req
    )
    httpResponse(req, res, 201, responseMessage.CREATED, asset)
}

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const kind = typeof req.query.kind === 'string' ? req.query.kind : undefined
    const mimePrefix = typeof req.query.mime === 'string' ? req.query.mime : undefined
    const items = await service.listAssets(req.auth.tenantId, { kind, mimePrefix })
    httpResponse(req, res, 200, responseMessage.SUCCESS, items)
}

export const remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const asset = await service.deleteAsset(req.auth.tenantId, req.params.id)
    await writeAudit({ action: 'media.delete', entityType: 'MediaAsset', entityId: asset.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, asset)
}
