// Media library client. Backed by /api/v1/media — uploads to disk via the
// existing multer middleware, persists metadata to the MediaAsset table so
// the website editor's image picker can list every uploaded asset for the
// active tenant.

import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export interface MediaAsset {
    id: string
    tenantId: string
    uploadedById: string | null
    filename: string
    originalName: string
    mimetype: string
    sizeBytes: number
    url: string
    kind: string
    altText: string | null
    createdAt: string
}

export const listMedia = async (params: { kind?: string; mime?: string } = {}): Promise<MediaAsset[]> => {
    const { data } = await api.get<Envelope<MediaAsset[]>>('/media', { params })
    return data.data
}

export const uploadMedia = async (file: File, opts: { kind?: string; altText?: string } = {}): Promise<MediaAsset> => {
    const form = new FormData()
    form.append('file', file)
    if (opts.kind) form.append('kind', opts.kind)
    if (opts.altText) form.append('altText', opts.altText)
    const { data } = await api.post<Envelope<MediaAsset>>('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.data
}

export const deleteMedia = async (id: string): Promise<MediaAsset> => {
    const { data } = await api.delete<Envelope<MediaAsset>>(`/media/${id}`)
    return data.data
}
