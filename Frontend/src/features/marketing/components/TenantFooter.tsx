// Per-tenant footer — three variants the SA picks from in the editor.
//   simple   → tagline, single-row links, copyright
//   columns  → multi-column (e.g. Product / Company / Resources) + tagline
//   minimal  → one-line copyright + optional links
//
// Link targets resolve via the page list (same `resolveHref` rule as the
// navbar). Social icons render only when their URL is set, regardless of
// variant.
import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react'
import type {
    LandingPage,
    NavLink,
    FooterConfig,
    FooterColumn
} from '@features/admin/services/tenant.service'

interface Props {
    config: FooterConfig
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

const FooterLink = ({ link, pages, slugBase }: { link: NavLink; pages: LandingPage[]; slugBase: string }) => {
    const href = resolveHref(link, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
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

const SocialIcons = ({ social }: { social: FooterConfig['social'] }) => {
    if (!social) return null
    const items: { url?: string; Icon: typeof Github; label: string }[] = [
        { url: social.github, Icon: Github, label: 'GitHub' },
        { url: social.twitter, Icon: Twitter, label: 'Twitter' },
        { url: social.linkedin, Icon: Linkedin, label: 'LinkedIn' },
        { url: social.instagram, Icon: Instagram, label: 'Instagram' },
        { url: social.youtube, Icon: Youtube, label: 'YouTube' }
    ]
    const visible = items.filter((i) => !!i.url)
    if (visible.length === 0) return null
    return (
        <div className="flex items-center gap-3">
            {visible.map((i) => (
                <a
                    key={i.label}
                    href={i.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={i.label}
                    className="text-fg-muted hover:text-fg transition-colors">
                    <i.Icon size={16} />
                </a>
            ))}
        </div>
    )
}

const Brand = ({ tenant, slugBase }: { tenant: Props['tenant']; slugBase: string }) => (
    <Link
        to={slugBase}
        className="flex items-center gap-2 select-none">
        {tenant.brandingLogo ? (
            <img
                src={tenant.brandingLogo}
                alt={tenant.name}
                className="h-6 w-6 rounded-md object-cover"
            />
        ) : (
            <div className="h-6 w-6 rounded-md grid place-items-center bg-[var(--color-brand-500)] text-white font-semibold text-xs">
                {tenant.name.charAt(0).toUpperCase()}
            </div>
        )}
        <span className="font-semibold text-sm tracking-tight">{tenant.name}</span>
    </Link>
)

const Column = ({ column, pages, slugBase }: { column: FooterColumn; pages: LandingPage[]; slugBase: string }) => (
    <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-fg mb-2">{column.title}</div>
        <ul className="space-y-1.5">
            {column.links.map((l) => (
                <li key={l.id}>
                    <FooterLink
                        link={l}
                        pages={pages}
                        slugBase={slugBase}
                    />
                </li>
            ))}
        </ul>
    </div>
)

export const TenantFooter = ({ config, pages, tenant, slugBase }: Props) => {
    const showSocial = config.showSocial !== false

    if (config.variant === 'minimal') {
        return (
            <footer className="border-t border-[var(--color-border)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-fg-muted">{config.copyright || `© ${new Date().getFullYear()} ${tenant.name}`}</div>
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        {(config.links ?? []).map((l) => (
                            <FooterLink
                                key={l.id}
                                link={l}
                                pages={pages}
                                slugBase={slugBase}
                            />
                        ))}
                        {showSocial && <SocialIcons social={config.social} />}
                    </div>
                </div>
            </footer>
        )
    }

    if (config.variant === 'columns') {
        return (
            <footer className="border-t border-[var(--color-border)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                    <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                        <div>
                            <Brand
                                tenant={tenant}
                                slugBase={slugBase}
                            />
                            {config.tagline && <p className="text-sm text-fg-soft mt-3 max-w-sm">{config.tagline}</p>}
                            {showSocial && (
                                <div className="mt-4">
                                    <SocialIcons social={config.social} />
                                </div>
                            )}
                        </div>
                        {(config.columns ?? []).slice(0, 3).map((c) => (
                            <Column
                                key={c.id}
                                column={c}
                                pages={pages}
                                slugBase={slugBase}
                            />
                        ))}
                    </div>
                    <div className="border-t border-[var(--color-border)] mt-8 pt-4 text-xs text-fg-muted">
                        {config.copyright || `© ${new Date().getFullYear()} ${tenant.name}. All rights reserved.`}
                    </div>
                </div>
            </footer>
        )
    }

    // simple
    return (
        <footer className="border-t border-[var(--color-border)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <Brand
                            tenant={tenant}
                            slugBase={slugBase}
                        />
                        {config.tagline && <p className="text-sm text-fg-soft mt-2 max-w-sm">{config.tagline}</p>}
                    </div>
                    <div className="flex flex-col sm:items-end gap-3">
                        <div className="flex items-center gap-5 flex-wrap">
                            {(config.links ?? []).map((l) => (
                                <FooterLink
                                    key={l.id}
                                    link={l}
                                    pages={pages}
                                    slugBase={slugBase}
                                />
                            ))}
                        </div>
                        {showSocial && <SocialIcons social={config.social} />}
                    </div>
                </div>
                <div className="border-t border-[var(--color-border)] mt-6 pt-4 text-xs text-fg-muted">
                    {config.copyright || `© ${new Date().getFullYear()} ${tenant.name}. All rights reserved.`}
                </div>
            </div>
        </footer>
    )
}
