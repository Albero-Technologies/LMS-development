import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
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
    const analytics = tenant.landing?.analytics

    // GA4 + Meta Pixel injection. Idempotent — re-mounting the page does not
    // double-fire the loaders because we identify scripts by data-tenant-analytic.
    useEffect(() => {
        const installed: HTMLElement[] = []
        const gaId = analytics?.googleAnalyticsId
        if (gaId) {
            const loader = document.createElement('script')
            loader.async = true
            loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
            loader.setAttribute('data-tenant-analytic', 'ga4-loader')
            document.head.appendChild(loader)
            installed.push(loader)
            const inline = document.createElement('script')
            inline.setAttribute('data-tenant-analytic', 'ga4-init')
            inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', ${JSON.stringify(gaId)});`
            document.head.appendChild(inline)
            installed.push(inline)
        }
        const pixelId = analytics?.metaPixelId
        if (pixelId) {
            const inline = document.createElement('script')
            inline.setAttribute('data-tenant-analytic', 'meta-pixel')
            inline.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', ${JSON.stringify(pixelId)});fbq('track', 'PageView');`
            document.head.appendChild(inline)
            installed.push(inline)
        }
        return () => {
            installed.forEach((el) => el.parentNode?.removeChild(el))
        }
    }, [analytics?.googleAnalyticsId, analytics?.metaPixelId])

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

            {analytics?.whatsappNumber && (
                <a
                    href={`https://wa.me/${analytics.whatsappNumber.replace(/[^0-9]/g, '')}${analytics.whatsappMessage ? `?text=${encodeURIComponent(analytics.whatsappMessage)}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center h-14 w-14 rounded-full shadow-lg text-white transition-transform hover:scale-110"
                    style={{ background: '#25D366' }}>
                    <MessageCircle
                        size={26}
                        fill="currentColor"
                    />
                </a>
            )}
        </div>
    )
}
