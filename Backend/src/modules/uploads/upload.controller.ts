import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import AppError from '../../util/AppError'
import { publicUrlFor } from '../../middleware/upload'
import { writeAudit } from '../../util/audit'

// Every handler here requires auth (wired in the router), so req.auth is
// guaranteed by the time we arrive. We still narrow defensively.
const requireAuth = (req: Request) => {
    if (!req.auth) throw AppError.unauthorized(responseMessage.UNAUTHORIZED)
    return req.auth
}

const fileToDto = (f: Express.Multer.File) => ({
    filename: f.filename,
    originalName: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
    url: publicUrlFor(f.path)
})

export const uploadSingle = async (req: Request, res: Response): Promise<void> => {
    requireAuth(req)
    if (!req.file) throw AppError.badRequest('No file uploaded', 'UPLOAD_MISSING')
    const dto = fileToDto(req.file)
    await writeAudit(
        { action: 'upload.single', entityType: 'File', entityId: dto.filename, metadata: { kind: req.params.kind, size: dto.size } },
        req
    )
    httpResponse(req, res, 201, responseMessage.CREATED, dto)
}

export const uploadMany = async (req: Request, res: Response): Promise<void> => {
    requireAuth(req)
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (files.length === 0) throw AppError.badRequest('No files uploaded', 'UPLOAD_MISSING')
    const dto = files.map(fileToDto)
    await writeAudit({ action: 'upload.many', entityType: 'File', metadata: { kind: req.params.kind, count: files.length } }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, dto)
}
