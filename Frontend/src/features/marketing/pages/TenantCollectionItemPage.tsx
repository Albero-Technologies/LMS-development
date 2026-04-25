// Per-tenant collection-item detail page (§11). Routed at
// /t/:slug/:collectionSlug/:itemSlug. Looks up a LandingPage that's marked
// as the detail template for that collection, fetches the item, then renders
// the page with `{{item.fieldKey}}` placeholders substituted from item.data.
//
// Falls back to a friendly 404 message if no template is configured or the
// item slug doesn't exist — keeps the public surface non-fatal even when the
// SA forgets to bind a template.
import { useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTenantBranding } from '@shared/contexts/useTenantBranding'
import {
    defaultFooter,
    defaultNavbar,
    type LandingSection
} from '@features/admin/services/tenant.service'
import { getPublicCollection, type CollectionItem } from '@features/admin/services/cms.service'
import { LandingSectionRenderer } from '@features/marketing/components/LandingSection'
import { TenantNavbar } from '@features/marketing/components/TenantNavbar'
import { TenantFooter } from '@features/marketing/components/TenantFooter'

// Replace `{{item.key}}` (or `{{ item.key }}` with whitespace) inside any
// string with the matching item.data[key]. Non-string item values are
// stringified. Missing keys leave the placeholder intact so the SA notices.
const PLACEHOLDER = /\{\{\s*item\.([a-zA-Z0-9_]+)\s*\}\}/g

const substitute = (input: string, item: CollectionItem): string =>
    input.replace(PLACEHOLDER, (_, key: string) => {
        const v = item.data[key]
        if (v === undefined || v === null) return ''
        if (typeof v === 'string') return v
        return String(v)
    })

// Walk the section's data object and substitute placeholders in all string
// fields. Recurses into nested arrays/objects so list-shaped data (e.g.
// features pillars) also picks up substitutions.
const substituteDeep = (value: unknown, item: CollectionItem): unknown => {
    if (typeof value === 'string') return substitute(value, item)
    if (Array.isArray(value)) return value.map((v) => substituteDeep(v, item))
    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(value)) out[k] = substituteDeep(v, item)
        return out
    }
    return value
}

const renderItem = (sections: LandingSection[], item: CollectionItem): LandingSection[] =>
    sections.map((s) => ({ ...s, data: substituteDeep(s.data, item) } as LandingSection))

export const TenantCollectionItemPage = () => {
    const { tenant } = useTenantBranding()
    const params = useParams<{ collectionSlug: string; itemSlug: string }>()
    const collectionSlug = params.collectionSlug ?? ''
    const itemSlug = params.itemSlug ?? ''
    const slugBase = `/t/${tenant.slug}`

    const pages = tenant.landing?.pages ?? []
    const templatePage = pages.find((p) => p.detailTemplate?.collectionSlug === collectionSlug)

    const collectionQuery = useQuery({
        queryKey: ['public', 'collection', tenant.slug, collectionSlug],
        queryFn: () => getPublicCollection(tenant.slug, collectionSlug),
        enabled: !!collectionSlug,
        staleTime: 60_000,
        retry: false
    })

    const item = collectionQuery.data?.items.find((i) => i.slug === itemSlug)

    const renderedSections = useMemo(() => {
        if (!templatePage || !item) return []
        return renderItem(templatePage.sections, item)
    }, [templatePage, item])

    const navbar = tenant.landing?.navbar ?? defaultNavbar()
    const footer = tenant.landing?.footer ?? defaultFooter(tenant.name)

    // Document title: prefer the item's `title` field if present, else the
    // template's SEO title, else fall back to the tenant name.
    useEffect(() => {
        const prevTitle = document.title
        const itemTitle = item?.data?.title
        if (typeof itemTitle === 'string' && itemTitle) {
            document.title = itemTitle
        } else if (templatePage?.seo?.title) {
            document.title = templatePage.seo.title
        }
        return () => {
            document.title = prevTitle
        }
    }, [item, templatePage?.seo?.title])

    const showNotFound = !templatePage || (collectionQuery.isFetched && !item)

    return (
        <div className="min-h-screen bg-bg text-fg">
            <TenantNavbar
                config={navbar}
                pages={pages}
                tenant={tenant}
                slugBase={slugBase}
            />

            <main>
                {showNotFound ? (
                    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
                        <h1 className="text-3xl font-semibold tracking-tight text-fg">Item not found</h1>
                        <p className="text-fg-soft mt-3">
                            {!templatePage
                                ? `No detail template is configured for the "${collectionSlug}" collection.`
                                : `Couldn't find an item with slug "${itemSlug}".`}
                        </p>
                        <Link
                            to={slugBase}
                            className="inline-block mt-6 text-sm text-[var(--color-brand-600)] hover:underline">
                            ← Back to home
                        </Link>
                    </section>
                ) : collectionQuery.isLoading ? (
                    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center text-fg-muted">Loading…</section>
                ) : (
                    renderedSections.map((s) => (
                        <LandingSectionRenderer
                            key={s.id}
                            section={s}
                            slugBase={slugBase}
                            tenantName={tenant.name}
                            styleClasses={tenant.landing?.styleClasses}
                        />
                    ))
                )}
            </main>

            <TenantFooter
                config={footer}
                pages={pages}
                tenant={tenant}
                slugBase={slugBase}
            />
        </div>
    )
}
