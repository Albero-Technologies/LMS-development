// CMS client. Backed by /api/v1/cms — collections + items CRUD.
// Public read (for the website renderer) hits /tenants/by-slug/:slug/collections/:collectionSlug.
//
// `tenantId` is optional on every function. When omitted, the backend uses
// the JWT's tenantId. SUPER_ADMIN can pass any tenantId to manage another
// tenant's content (the tenant-picker on CmsPage uses this); the backend
// silently ignores the override for non-SA roles.

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

// Build a `params` object that includes tenantId only when it's set; merging
// avoids a `?tenantId=undefined` literal landing in the URL.
const withTenant = (tenantId: string | undefined, extra?: Record<string, string>): Record<string, string> | undefined => {
    const out: Record<string, string> = { ...(extra ?? {}) }
    if (tenantId) out.tenantId = tenantId
    return Object.keys(out).length > 0 ? out : undefined
}

export const listCollections = async (tenantId?: string): Promise<Collection[]> => {
    const { data } = await api.get<Envelope<Collection[]>>('/cms/collections', { params: withTenant(tenantId) })
    return data.data
}

export const getCollection = async (id: string, tenantId?: string): Promise<Collection> => {
    const { data } = await api.get<Envelope<Collection>>(`/cms/collections/${id}`, { params: withTenant(tenantId) })
    return data.data
}

export const createCollection = async (
    payload: { name: string; slug: string; description?: string; fields?: FieldDef[] },
    tenantId?: string
): Promise<Collection> => {
    const { data } = await api.post<Envelope<Collection>>('/cms/collections', payload, { params: withTenant(tenantId) })
    return data.data
}

export const updateCollection = async (
    id: string,
    payload: { name?: string; description?: string; fields?: FieldDef[] },
    tenantId?: string
): Promise<Collection> => {
    const { data } = await api.patch<Envelope<Collection>>(`/cms/collections/${id}`, payload, { params: withTenant(tenantId) })
    return data.data
}

export const deleteCollection = async (id: string, tenantId?: string): Promise<Collection> => {
    const { data } = await api.delete<Envelope<Collection>>(`/cms/collections/${id}`, { params: withTenant(tenantId) })
    return data.data
}

export const listItems = async (
    collectionId: string,
    opts: { publishedOnly?: boolean } = {},
    tenantId?: string
): Promise<CollectionItem[]> => {
    const extra = opts.publishedOnly ? { published: 'true' } : undefined
    const { data } = await api.get<Envelope<CollectionItem[]>>(`/cms/collections/${collectionId}/items`, {
        params: withTenant(tenantId, extra)
    })
    return data.data
}

export const createItem = async (
    collectionId: string,
    payload: { slug: string; data: Record<string, unknown>; published?: boolean },
    tenantId?: string
): Promise<CollectionItem> => {
    const { data } = await api.post<Envelope<CollectionItem>>(`/cms/collections/${collectionId}/items`, payload, {
        params: withTenant(tenantId)
    })
    return data.data
}

export const updateItem = async (
    collectionId: string,
    itemId: string,
    payload: { slug?: string; data?: Record<string, unknown>; published?: boolean },
    tenantId?: string
): Promise<CollectionItem> => {
    const { data } = await api.patch<Envelope<CollectionItem>>(`/cms/collections/${collectionId}/items/${itemId}`, payload, {
        params: withTenant(tenantId)
    })
    return data.data
}

export const deleteItem = async (collectionId: string, itemId: string, tenantId?: string): Promise<CollectionItem> => {
    const { data } = await api.delete<Envelope<CollectionItem>>(`/cms/collections/${collectionId}/items/${itemId}`, {
        params: withTenant(tenantId)
    })
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
