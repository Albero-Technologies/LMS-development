// CMS client. Backed by /api/v1/cms — collections + items CRUD.
// Public read (for the website renderer) hits /tenants/by-slug/:slug/collections/:collectionSlug.

import { api } from '@shared/libs/api'

type Envelope<T> = { success: boolean; message: string; data: T }

export type FieldType = 'text' | 'longtext' | 'richtext' | 'number' | 'boolean' | 'date' | 'image' | 'select'

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
    text: 'Text (single line)',
    longtext: 'Long text',
    richtext: 'Rich text (HTML)',
    number: 'Number',
    boolean: 'Boolean (toggle)',
    date: 'Date',
    image: 'Image URL',
    select: 'Select (single choice)'
}

export interface FieldDef {
    key: string
    label: string
    type: FieldType
    required?: boolean
    options?: string[]
}

export interface Collection {
    id: string
    tenantId: string
    name: string
    slug: string
    description: string | null
    fields: FieldDef[]
    createdAt: string
    updatedAt: string
    _count?: { items: number }
}

export interface CollectionItem {
    id: string
    tenantId: string
    collectionId: string
    slug: string
    data: Record<string, unknown>
    published: boolean
    publishedAt: string | null
    createdAt: string
    updatedAt: string
}

export const listCollections = async (): Promise<Collection[]> => {
    const { data } = await api.get<Envelope<Collection[]>>('/cms/collections')
    return data.data
}

export const getCollection = async (id: string): Promise<Collection> => {
    const { data } = await api.get<Envelope<Collection>>(`/cms/collections/${id}`)
    return data.data
}

export const createCollection = async (payload: { name: string; slug: string; description?: string; fields?: FieldDef[] }): Promise<Collection> => {
    const { data } = await api.post<Envelope<Collection>>('/cms/collections', payload)
    return data.data
}

export const updateCollection = async (id: string, payload: { name?: string; description?: string; fields?: FieldDef[] }): Promise<Collection> => {
    const { data } = await api.patch<Envelope<Collection>>(`/cms/collections/${id}`, payload)
    return data.data
}

export const deleteCollection = async (id: string): Promise<Collection> => {
    const { data } = await api.delete<Envelope<Collection>>(`/cms/collections/${id}`)
    return data.data
}

export const listItems = async (collectionId: string, opts: { publishedOnly?: boolean } = {}): Promise<CollectionItem[]> => {
    const { data } = await api.get<Envelope<CollectionItem[]>>(`/cms/collections/${collectionId}/items`, {
        params: opts.publishedOnly ? { published: 'true' } : undefined
    })
    return data.data
}

export const createItem = async (
    collectionId: string,
    payload: { slug: string; data: Record<string, unknown>; published?: boolean }
): Promise<CollectionItem> => {
    const { data } = await api.post<Envelope<CollectionItem>>(`/cms/collections/${collectionId}/items`, payload)
    return data.data
}

export const updateItem = async (
    collectionId: string,
    itemId: string,
    payload: { slug?: string; data?: Record<string, unknown>; published?: boolean }
): Promise<CollectionItem> => {
    const { data } = await api.patch<Envelope<CollectionItem>>(`/cms/collections/${collectionId}/items/${itemId}`, payload)
    return data.data
}

export const deleteItem = async (collectionId: string, itemId: string): Promise<CollectionItem> => {
    const { data } = await api.delete<Envelope<CollectionItem>>(`/cms/collections/${collectionId}/items/${itemId}`)
    return data.data
}

// Public read used by the website renderer's Collection-list section.
export interface PublicCollection {
    id: string
    slug: string
    name: string
    fields: FieldDef[]
    items: CollectionItem[]
}

export const getPublicCollection = async (tenantSlug: string, collectionSlug: string): Promise<PublicCollection> => {
    const { data } = await api.get<Envelope<PublicCollection>>(`/tenants/by-slug/${tenantSlug}/collections/${collectionSlug}`)
    return data.data
}
