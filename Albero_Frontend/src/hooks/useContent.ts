import { useQuery } from '@tanstack/react-query'
import {
    fetchPublicTenant,
    fetchPublicCollection,
    fetchPublicCollectionItem,
    type PublicCollection,
    type PublicCollectionItem,
    type PublicTenantInfo
} from '@/services/contentService'

// Public-site data hooks. The marketing pages call these and fall back to
// hard-coded constants (or render a loading state) until the backend
// responds. Drafts never reach the public site — the backend filters them.

export const useTenantInfo = () =>
    useQuery<PublicTenantInfo>({
        queryKey: ['public', 'tenant'],
        queryFn: fetchPublicTenant,
        staleTime: 5 * 60_000
    })

export const useCollection = (slug: string, opts: { enabled?: boolean } = {}) =>
    useQuery<PublicCollection>({
        queryKey: ['public', 'collection', slug],
        queryFn: () => fetchPublicCollection(slug),
        staleTime: 60_000,
        enabled: opts.enabled !== false
    })

export const useCollectionItem = (collectionSlug: string, itemSlug: string | undefined) =>
    useQuery<{ collection: { id: string; slug: string; name: string }; item: PublicCollectionItem }>({
        queryKey: ['public', 'collection', collectionSlug, 'item', itemSlug],
        queryFn: () => fetchPublicCollectionItem(collectionSlug, itemSlug as string),
        enabled: !!itemSlug,
        staleTime: 60_000
    })
