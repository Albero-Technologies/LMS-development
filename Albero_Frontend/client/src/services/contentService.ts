import apiClient from '@/lib/apiClient'
import { TENANT_SLUG } from '@/config/tenant'

// Public — what the live marketing site fetches. No auth required; the
// backend filters to published items only. Drafts 404 even with a slug.

export interface PublicCollectionItem {
    id: string
    slug: string
    data: Record<string, unknown>
    published: boolean
    publishedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface PublicCollection {
    id: string
    slug: string
    name: string
    fields: { key: string; label: string; type: string; required?: boolean; options?: string[] }[]
    items: PublicCollectionItem[]
}

export interface PublicTenantInfo {
    id: string
    name: string
    slug: string
    brandingLogo: string | null
    brandingColor: string | null
    landing: unknown
}

export const fetchPublicTenant = async (): Promise<PublicTenantInfo> => {
    const res = await apiClient.get(`/tenants/by-slug/${TENANT_SLUG}`)
    return res.data.data
}

export const fetchPublicCollection = async (collectionSlug: string): Promise<PublicCollection> => {
    const res = await apiClient.get(`/tenants/by-slug/${TENANT_SLUG}/collections/${collectionSlug}`)
    return res.data.data
}

export const fetchPublicCollectionItem = async (
    collectionSlug: string,
    itemSlug: string
): Promise<{ collection: { id: string; slug: string; name: string; fields: PublicCollection['fields'] }; item: PublicCollectionItem }> => {
    const res = await apiClient.get(`/tenants/by-slug/${TENANT_SLUG}/collections/${collectionSlug}/items/${itemSlug}`)
    return res.data.data
}
