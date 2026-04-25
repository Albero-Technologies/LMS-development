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

        return () => {
            document.title = prevTitle
            if (metaDesc && prevDesc !== null) metaDesc.setAttribute('content', prevDesc)
            if (favicon && prevHref !== null) favicon.setAttribute('href', prevHref)
        }
    }, [site?.title, site?.faviconUrl, homePage?.seo])

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
