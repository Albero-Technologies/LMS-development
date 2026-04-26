import { useEffect } from 'react'
import { useTenantBranding } from '@shared/contexts/useTenantBranding'
import {
    defaultFooter,
    defaultLandingSections,
    defaultNavbar,
    type LandingPage,
    type LandingSection
} from '@features/admin/services/tenant.service'
import { LandingSectionRenderer } from '@features/marketing/components/LandingSection'
import { TenantNavbar } from '@features/marketing/components/TenantNavbar'
import { TenantFooter } from '@features/marketing/components/TenantFooter'

// Per-tenant public landing page (§9.1, §11). Renders the home page from
// `tenant.settings.landing.pages` if present (multi-page mode), falling back
// to the legacy single `sections` array, then to a default layout. Navbar +
// footer are pulled from `landing.{navbar,footer}`; site title + favicon
// come from `landing.site`.
export const TenantLandingPage = () => {
    const { tenant } = useTenantBranding()
    const slugBase = `/t/${tenant.slug}`

    const pages: LandingPage[] = tenant.landing?.pages ?? []
    const homePage = pages.find((p) => p.isHome) ?? pages[0]
    const sections: LandingSection[] = homePage?.sections
        ?? (tenant.landing?.sections && tenant.landing.sections.length > 0
            ? tenant.landing.sections
            : defaultLandingSections(tenant.name))

    const navbar = tenant.landing?.navbar ?? defaultNavbar()
    const footer = tenant.landing?.footer ?? defaultFooter(tenant.name)
    const site = tenant.landing?.site

    // Site identity — push title + favicon into <head> on mount, restore on
    // unmount so navigating away from the tenant page doesn't leak the
    // overrides into other parts of the SPA.
    useEffect(() => {
        const prevTitle = document.title
        const siteTitle = site?.title || homePage?.seo?.title
        if (siteTitle) document.title = siteTitle

        let metaDesc: HTMLMetaElement | null = null
        let prevDesc: string | null = null
        const desc = homePage?.seo?.description
        if (desc) {
            metaDesc = document.querySelector('meta[name="description"]')
            if (!metaDesc) {
                metaDesc = document.createElement('meta')
                metaDesc.setAttribute('name', 'description')
                document.head.appendChild(metaDesc)
            }
            prevDesc = metaDesc.getAttribute('content')
            metaDesc.setAttribute('content', desc)
        }

        let favicon: HTMLLinkElement | null = null
        let prevHref: string | null = null
        if (site?.faviconUrl) {
            favicon = document.querySelector("link[rel='icon']")
            if (!favicon) {
                favicon = document.createElement('link')
                favicon.setAttribute('rel', 'icon')
                document.head.appendChild(favicon)
            }
            prevHref = favicon.getAttribute('href')
            favicon.setAttribute('href', site.faviconUrl)
        }

        // Open Graph image — the social-card preview when the URL is shared on
        // WhatsApp / Slack / Twitter / LinkedIn. Falls back to the home page's
        // per-page ogImageUrl if no site-level default is set.
        const ogImage = site?.ogImageUrl || homePage?.seo?.ogImageUrl
        let ogTag: HTMLMetaElement | null = null
        let prevOg: string | null = null
        let ogTwitter: HTMLMetaElement | null = null
        let prevOgTwitter: string | null = null
        if (ogImage) {
            ogTag = document.querySelector("meta[property='og:image']")
            if (!ogTag) {
                ogTag = document.createElement('meta')
                ogTag.setAttribute('property', 'og:image')
                document.head.appendChild(ogTag)
            }
            prevOg = ogTag.getAttribute('content')
            ogTag.setAttribute('content', ogImage)
            // Mirror to twitter:image so X/Twitter cards pick it up too.
            ogTwitter = document.querySelector("meta[name='twitter:image']")
            if (!ogTwitter) {
                ogTwitter = document.createElement('meta')
                ogTwitter.setAttribute('name', 'twitter:image')
                document.head.appendChild(ogTwitter)
            }
            prevOgTwitter = ogTwitter.getAttribute('content')
            ogTwitter.setAttribute('content', ogImage)
        }

        return () => {
            document.title = prevTitle
            if (metaDesc && prevDesc !== null) metaDesc.setAttribute('content', prevDesc)
            if (favicon && prevHref !== null) favicon.setAttribute('href', prevHref)
            if (ogTag && prevOg !== null) ogTag.setAttribute('content', prevOg)
            if (ogTwitter && prevOgTwitter !== null) ogTwitter.setAttribute('content', prevOgTwitter)
        }
    }, [site?.title, site?.faviconUrl, site?.ogImageUrl, homePage?.seo])

    return (
        <div className="min-h-screen bg-bg text-fg">
            <TenantNavbar
                config={navbar}
                pages={pages}
                tenant={tenant}
                slugBase={slugBase}
            />

            <main>
                {sections.map((s) => (
                    <LandingSectionRenderer
                        key={s.id}
                        section={s}
                        slugBase={slugBase}
                        tenantName={tenant.name}
                        styleClasses={tenant.landing?.styleClasses}
                    />
                ))}
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
