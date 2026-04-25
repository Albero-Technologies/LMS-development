// Per-tenant navbar — three variants the SA picks from in the editor.
//   simple   → logo left · links centre/right · sign-in
//   centered → logo + links centred (logo above)
//   with-cta → logo · links · CTA button (most marketing-friendly)
//
// Link targets resolve via the page list: a NavLink with `pageId` becomes
// /t/<slug><page.slug>; with `url` becomes the literal URL (relative paths
// resolve under /t/<slug>/).
import { Link } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import type { LandingPage, NavLink, NavbarConfig } from '@features/admin/services/tenant.service'

interface Props {
    config: NavbarConfig
    pages: LandingPage[]
    tenant: { name: string; slug: string; brandingLogo: string | null }
    slugBase: string
}

const resolveHref = (link: { pageId?: string; url?: string }, pages: LandingPage[], slugBase: string): string => {
    if (link.pageId) {
        const page = pages.find((p) => p.id === link.pageId)
        if (!page) return slugBase || '/'
        return page.slug === '/' ? slugBase : `${slugBase}${page.slug}`
    }
    if (!link.url) return slugBase || '#'
    if (/^https?:\/\//.test(link.url) || link.url.startsWith('mailto:') || link.url.startsWith('tel:')) return link.url
    return `${slugBase}/${link.url.replace(/^\//, '')}`
}

const Brand = ({ tenant, slugBase }: { tenant: Props['tenant']; slugBase: string }) => (
    <Link
        to={slugBase}
        className="flex items-center gap-2.5 select-none">
        {tenant.brandingLogo ? (
            <img
                src={tenant.brandingLogo}
                alt={tenant.name}
                className="h-7 w-7 rounded-md object-cover"
            />
        ) : (
            <div className="h-7 w-7 rounded-md grid place-items-center bg-[var(--color-brand-500)] text-white font-semibold text-sm">
                {tenant.name.charAt(0).toUpperCase()}
            </div>
        )}
        <span className="font-semibold text-[15px] tracking-tight">{tenant.name}</span>
    </Link>
)

const NavLinkItem = ({ link, pages, slugBase }: { link: NavLink; pages: LandingPage[]; slugBase: string }) => {
    const href = resolveHref(link, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href)
    const target = link.newTab || isExternal ? '_blank' : undefined
    if (isExternal || target === '_blank') {
        return (
            <a
                href={href}
                target={target}
                rel={target === '_blank' ? 'noreferrer' : undefined}
                className="text-sm text-fg-soft hover:text-fg transition-colors">
                {link.label}
            </a>
        )
    }
    return (
        <Link
            to={href}
            className="text-sm text-fg-soft hover:text-fg transition-colors">
            {link.label}
        </Link>
    )
}

const SignInButton = ({ label }: { label: string }) => (
    <Link to="/login">
        <Button
            size="sm"
            variant="ghost">
            {label}
        </Button>
    </Link>
)

const CtaButton = ({ config, pages, slugBase }: { config: NavbarConfig; pages: LandingPage[]; slugBase: string }) => {
    if (!config.ctaLabel) return null
    const href = resolveHref({ pageId: config.ctaPageId, url: config.ctaUrl }, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href)
    if (isExternal) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer">
                <Button size="sm">{config.ctaLabel}</Button>
            </a>
        )
    }
    return (
        <Link to={href}>
            <Button size="sm">{config.ctaLabel}</Button>
        </Link>
    )
}

export const TenantNavbar = ({ config, pages, tenant, slugBase }: Props) => {
    const showLogo = config.showLogo !== false
    const showSignIn = config.showSignIn !== false

    if (config.variant === 'centered') {
        return (
            <header className="border-b border-[var(--color-border)] sticky top-0 z-30 bg-bg/85 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col items-center gap-2">
                    {showLogo && (
                        <Brand
                            tenant={tenant}
                            slugBase={slugBase}
                        />
                    )}
                    <div className="flex items-center gap-5 flex-wrap justify-center">
                        {config.links.map((l) => (
                            <NavLinkItem
                                key={l.id}
                                link={l}
                                pages={pages}
                                slugBase={slugBase}
                            />
                        ))}
                        <ThemeToggle />
                        {showSignIn && <SignInButton label={config.signInLabel ?? 'Sign in'} />}
                        <CtaButton
                            config={config}
                            pages={pages}
                            slugBase={slugBase}
                        />
                    </div>
                </div>
            </header>
        )
    }

    // simple + with-cta share the row layout
    return (
        <header className="border-b border-[var(--color-border)] sticky top-0 z-30 bg-bg/85 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
                {showLogo ? (
                    <Brand
                        tenant={tenant}
                        slugBase={slugBase}
                    />
                ) : (
                    <span />
                )}
                <div className="flex items-center gap-5 flex-wrap justify-end">
                    {config.links.map((l) => (
                        <NavLinkItem
                            key={l.id}
                            link={l}
                            pages={pages}
                            slugBase={slugBase}
                        />
                    ))}
                    <ThemeToggle />
                    {showSignIn && <SignInButton label={config.signInLabel ?? 'Sign in'} />}
                    {config.variant === 'with-cta' && (
                        <CtaButton
                            config={config}
                            pages={pages}
                            slugBase={slugBase}
                        />
                    )}
                </div>
            </div>
        </header>
    )
}
