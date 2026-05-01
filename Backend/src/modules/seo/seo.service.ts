import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import config from '../../config/config'
import { PLATFORM_TENANT_SLUG } from '../tenants/tenant.service'

// Per-tenant sitemap.xml + robots.txt. Pulls pages from
// tenant.settings.landing.pages[] and CMS Collection items where a page is
// marked as the detail template for that collection. Both endpoints are
// public — no auth, no rate limiting beyond the global IP limiter.

interface LandingPageEntry {
    id?: string
    slug?: string
    isHome?: boolean
    detailTemplate?: { collectionSlug?: string }
}

interface LandingContent {
    pages?: LandingPageEntry[]
}

interface SeoSettings {
    canonicalUrl?: string
    robots?: string
}

const escapeXml = (s: string): string =>
    s.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<':
                return '&lt;'
            case '>':
                return '&gt;'
            case '&':
                return '&amp;'
            case "'":
                return '&apos;'
            case '"':
                return '&quot;'
            default:
                return c
        }
    })

// Strip trailing slash from a base URL so we can join paths without doubling
// up. Path itself should always start with "/".
const trimBase = (url: string): string => url.replace(/\/+$/, '')

// Page slug → URL path under /t/:tenantSlug. The home page can be marked
// either by isHome=true or by slug="/"; everything else uses the literal slug
// as a path component (relative or absolute).
const pageSlugToPath = (tenantSlug: string, page: LandingPageEntry): string => {
    if (page.isHome || page.slug === '/' || page.slug === '' || !page.slug) {
        return `/t/${tenantSlug}`
    }
    const trimmed = page.slug.startsWith('/') ? page.slug.slice(1) : page.slug
    return `/t/${tenantSlug}/${trimmed}`
}

const buildAbsoluteUrl = (base: string, path: string): string => `${trimBase(base)}${path}`

interface UrlEntry {
    loc: string
    lastmod?: string
    changefreq?: 'daily' | 'weekly' | 'monthly'
    priority?: string
}

const renderSitemap = (entries: UrlEntry[]): string => {
    const urls = entries
        .map((e) => {
            const parts = [`    <loc>${escapeXml(e.loc)}</loc>`]
            if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`)
            if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`)
            if (e.priority) parts.push(`    <priority>${e.priority}</priority>`)
            return `  <url>\n${parts.join('\n')}\n  </url>`
        })
        .join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

const formatLastmod = (d: Date | null | undefined): string | undefined => {
    if (!d) return undefined
    return d.toISOString().slice(0, 10)
}

// Resolve the public-facing base URL for a tenant. If the tenant has set a
// canonical URL in their SEO config we honour it; otherwise we fall back to
// the platform-wide PUBLIC_SITE_URL with the tenant slug appended via /t/<slug>.
const resolveTenantBase = (canonicalUrl: string | undefined): { base: string; usesCanonical: boolean } => {
    if (canonicalUrl && /^https?:\/\//i.test(canonicalUrl)) {
        return { base: trimBase(canonicalUrl), usesCanonical: true }
    }
    return { base: trimBase(config.PUBLIC_SITE_URL), usesCanonical: false }
}

interface TenantSitemapData {
    sitemap: string
    contentType: 'application/xml; charset=utf-8'
}

export const buildTenantSitemap = async (tenantSlug: string): Promise<TenantSitemapData> => {
    if (tenantSlug === PLATFORM_TENANT_SLUG) {
        throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    }

    const tenant = await db.client.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true, slug: true, status: true, updatedAt: true, settings: true }
    })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    if (tenant.status === 'SUSPENDED') {
        throw AppError.forbidden('Tenant is suspended', 'TENANT_SUSPENDED')
    }

    const settings = (tenant.settings as { landing?: LandingContent; seo?: SeoSettings } | null) ?? {}
    const pages = settings.landing?.pages
    const landingPages = Array.isArray(pages) ? pages : []
    const seo = settings.seo ?? {}
    const { base } = resolveTenantBase(seo.canonicalUrl)

    // When a tenant supplies a canonical URL, that URL already represents
    // the root of THEIR site, so we strip the platform's /t/<slug> prefix.
    const pathForCanonical = (path: string) => (seo.canonicalUrl ? path.replace(`/t/${tenantSlug}`, '') || '/' : path)

    const lastmod = formatLastmod(tenant.updatedAt)
    const entries: UrlEntry[] = []

    // 1. Static pages from landing.pages[]. Home gets priority 1.0. Pages
    // marked as collection detail templates are skipped here — they have no
    // standalone URL, only their items are crawlable (added in step 2).
    for (const page of landingPages) {
        const isHome = page.isHome || page.slug === '/' || page.slug === '' || !page.slug
        if (page.detailTemplate?.collectionSlug && !isHome) continue
        const path = pathForCanonical(pageSlugToPath(tenantSlug, page))
        entries.push({
            loc: buildAbsoluteUrl(base, path),
            lastmod,
            changefreq: isHome ? 'weekly' : 'monthly',
            priority: isHome ? '1.0' : '0.8'
        })
    }

    // 2. Collection items — only collections that have a detail-template page
    // are crawlable, since visiting /t/<slug>/<collection>/<item> with no
    // template would 404.
    const collectionsWithTemplate = landingPages
        .map((p) => p.detailTemplate?.collectionSlug)
        .filter((s): s is string => typeof s === 'string' && s.length > 0)

    if (collectionsWithTemplate.length > 0) {
        const collections = await db.client.collection.findMany({
            where: { tenantId: tenant.id, slug: { in: collectionsWithTemplate } },
            include: {
                items: {
                    where: { published: true },
                    select: { slug: true, publishedAt: true, updatedAt: true }
                }
            }
        })
        for (const collection of collections) {
            for (const item of collection.items) {
                const path = pathForCanonical(`/t/${tenantSlug}/${collection.slug}/${item.slug}`)
                entries.push({
                    loc: buildAbsoluteUrl(base, path),
                    lastmod: formatLastmod(item.publishedAt ?? item.updatedAt),
                    changefreq: 'monthly',
                    priority: '0.6'
                })
            }
        }
    }

    return { sitemap: renderSitemap(entries), contentType: 'application/xml; charset=utf-8' }
}

interface TenantRobotsData {
    robots: string
    contentType: 'text/plain; charset=utf-8'
}

export const buildTenantRobots = async (tenantSlug: string): Promise<TenantRobotsData> => {
    if (tenantSlug === PLATFORM_TENANT_SLUG) {
        throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    }

    const tenant = await db.client.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { slug: true, status: true, settings: true }
    })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')

    const settings = (tenant.settings as { seo?: SeoSettings } | null) ?? {}
    const robotsDirective = (settings.seo?.robots ?? 'index, follow').toLowerCase()
    const allowAll = !robotsDirective.includes('noindex')

    // Sitemap is reachable on the API host, regardless of where the public site
    // is served — bots don't care.
    const sitemapUrl = `${trimBase(config.SERVER_URL)}/api/v1/sites/${tenantSlug}/sitemap.xml`

    const lines = ['User-agent: *', allowAll ? 'Disallow:' : 'Disallow: /', '', `Sitemap: ${sitemapUrl}`, '']

    return { robots: lines.join('\n'), contentType: 'text/plain; charset=utf-8' }
}
