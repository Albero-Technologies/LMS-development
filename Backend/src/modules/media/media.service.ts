// Media library — central per-tenant asset registry. The actual file write
// happens in the upload middleware (multer); this module persists the
// metadata so the website editor can list and re-use uploaded assets.

import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'

export const recordAsset = async (input: {
    tenantId: string
    uploadedById: string
    filename: string
    originalName: string
    mimetype: string
    sizeBytes: number
    url: string
    kind?: string
    altText?: string
}) => {
    return db.client.mediaAsset.create({
        data: {
            tenantId: input.tenantId,
            uploadedById: input.uploadedById,
            filename: input.filename,
            originalName: input.originalName,
            mimetype: input.mimetype,
            sizeBytes: input.sizeBytes,
            url: input.url,
            kind: input.kind ?? 'media',
            altText: input.altText
        }
    })
}

export const listAssets = async (tenantId: string, opts: { kind?: string; mimePrefix?: string } = {}) => {
    return db.client.mediaAsset.findMany({
        where: {
            tenantId,
            kind: opts.kind,
            mimetype: opts.mimePrefix ? { startsWith: opts.mimePrefix } : undefined
        },
        orderBy: { createdAt: 'desc' },
        take: 200
    })
}

export const deleteAsset = async (tenantId: string, id: string) => {
    const asset = await db.client.mediaAsset.findFirst({ where: { id, tenantId } })
    if (!asset) throw AppError.notFound(responseMessage.NOT_FOUND('Media asset'), 'MEDIA_NOT_FOUND')
    await db.client.mediaAsset.delete({ where: { id } })
    return asset
}
