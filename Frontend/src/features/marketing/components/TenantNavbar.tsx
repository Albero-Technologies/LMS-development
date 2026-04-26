// Per-tenant navbar — three variants the SA picks from in the editor.
//   simple   → logo left · links centre/right · sign-in
//   centered → logo + links centred (logo above)
//   with-cta → logo · links · CTA button (most marketing-friendly)
//
// Mobile (< md) collapses every variant to a hamburger sheet that drops down
// from the header. Desktop layout is unchanged.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
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

const NavLinkItem = ({
    link,
    pages,
    slugBase,
    onNavigate,
    fullWidth
}: {
    link: NavLink
    pages: LandingPage[]
    slugBase: string
    onNavigate?: () => void
    fullWidth?: boolean
}) => {
    const href = resolveHref(link, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href)
    const target = link.newTab || isExternal ? '_blank' : undefined
    const cls = fullWidth
        ? 'block w-full text-base text-fg-soft hover:text-fg transition-colors py-2 border-b border-[var(--color-border)]'
        : 'text-sm text-fg-soft hover:text-fg transition-colors'
    if (isExternal || target === '_blank') {
        return (
            <a
                href={href}
                target={target}
                rel={target === '_blank' ? 'noreferrer' : undefined}
                onClick={onNavigate}
                className={cls}>
                {link.label}
            </a>
        )
    }
    return (
        <Link
            to={href}
            onClick={onNavigate}
            className={cls}>
            {link.label}
        </Link>
    )
}

const SignInButton = ({ label, fullWidth }: { label: string; fullWidth?: boolean }) => (
    <Link
        to="/login"
        className={fullWidth ? 'block w-full' : ''}>
        <Button
            size="sm"
            variant="ghost"
            className={fullWidth ? 'w-full justify-start' : ''}>
            {label}
        </Button>
    </Link>
)

const CtaButton = ({
    config,
    pages,
    slugBase,
    fullWidth
}: {
    config: NavbarConfig
    pages: LandingPage[]
    slugBase: string
    fullWidth?: boolean
}) => {
    if (!config.ctaLabel) return null
    const href = resolveHref({ pageId: config.ctaPageId, url: config.ctaUrl }, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href)
    const inner = (
        <Button
            size="sm"
            className={fullWidth ? 'w-full' : ''}>
            {config.ctaLabel}
        </Button>
    )
    if (isExternal) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={fullWidth ? 'block w-full' : ''}>
                {inner}
            </a>
        )
    }
    return (
        <Link
            to={href}
            className={fullWidth ? 'block w-full' : ''}>
            {inner}
        </Link>
    )
}

// Hamburger toggle — shown only below md. The variant ('sheet' | 'drawer-right'
// | 'fullscreen') decides how the menu opens; the contents are identical so
// each tenant only changes a CSS-level concern, not their info architecture.
// Auto-closes on route change so links don't leave the menu open behind them.
const MobileMenu = ({
    config,
    pages,
    slugBase
}: {
    config: NavbarConfig
    pages: LandingPage[]
    slugBase: string
}) => {
    const variant: NavbarConfig['mobileVariant'] = config.mobileVariant ?? 'sheet'
    const [open, setOpen] = useState(false)
    const location = useLocation()
    useEffect(() => {
        setOpen(false)
    }, [location.pathname])
    // Lock body scroll while the menu is open so content behind doesn't scroll under it.
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])
    const showSignIn = config.showSignIn !== false

    const linksContent = (
        <>
            {config.links.map((l) => (
                <NavLinkItem
                    key={l.id}
                    link={l}
                    pages={pages}
                    slugBase={slugBase}
                    onNavigate={() => setOpen(false)}
                    fullWidth
                />
            ))}
            <div className="flex items-center justify-between pt-3 mt-2">
                <span className="text-xs text-fg-muted">Theme</span>
                <ThemeToggle />
            </div>
            {(showSignIn || config.variant === 'with-cta') && (
                <div className="flex flex-col gap-2 mt-3">
                    {showSignIn && <SignInButton label={config.signInLabel ?? 'Sign in'} fullWidth />}
                    {config.variant === 'with-cta' && (
                        <CtaButton
                            config={config}
                            pages={pages}
                            slugBase={slugBase}
                            fullWidth
                        />
                    )}
                </div>
            )}
        </>
    )

    return (
        <>
            <button
                type="button"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="md:hidden p-2 -mr-2 text-fg-muted hover:text-fg transition-colors">
                {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {open && variant === 'sheet' && (
                <div
                    className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40 bg-bg/95 backdrop-blur border-t border-[var(--color-border)] overflow-y-auto"
                    role="dialog"
                    aria-modal="true">
                    <div className="px-4 py-4 flex flex-col gap-1">{linksContent}</div>
                </div>
            )}

            {open && variant === 'drawer-right' && (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setOpen(false)}
                        className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />
                    <div
                        className="md:hidden fixed top-0 right-0 bottom-0 w-[80vw] max-w-sm z-50 bg-bg border-l border-[var(--color-border)] overflow-y-auto shadow-xl animate-in slide-in-from-right duration-200"
                        role="dialog"
                        aria-modal="true">
                        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
                            <span className="text-sm font-semibold">Menu</span>
                            <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setOpen(false)}
                                className="p-2 -mr-2 text-fg-muted hover:text-fg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-4 py-4 flex flex-col gap-1">{linksContent}</div>
                    </div>
                </>
            )}

            {open && variant === 'fullscreen' && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-bg overflow-y-auto"
                    role="dialog"
                    aria-modal="true">
                    <div className="flex items-center justify-end px-4 h-14">
                        <button
                            type="button"
                            aria-label="Close menu"
                            onClick={() => setOpen(false)}
                            className="p-2 -mr-2 text-fg-muted hover:text-fg">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="px-6 py-8 flex flex-col gap-2 max-w-sm mx-auto text-center">
                        {config.links.map((l) => (
                            <NavLinkItem
                                key={l.id}
                                link={l}
                                pages={pages}
                                slugBase={slugBase}
                                onNavigate={() => setOpen(false)}
                                fullWidth
                            />
                        ))}
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <span className="text-xs text-fg-muted">Theme</span>
                            <ThemeToggle />
                        </div>
                        {(showSignIn || config.variant === 'with-cta') && (
                            <div className="flex flex-col gap-2 mt-4">
                                {showSignIn && <SignInButton label={config.signInLabel ?? 'Sign in'} fullWidth />}
                                {config.variant === 'with-cta' && (
                                    <CtaButton
                                        config={config}
                                        pages={pages}
                                        slugBase={slugBase}
                                        fullWidth
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export const TenantNavbar = ({ config, pages, tenant, slugBase }: Props) => {
    const showLogo = config.showLogo !== false
    const showSignIn = config.showSignIn !== false

    if (config.variant === 'centered') {
        return (
            <header className="border-b border-[var(--color-border)] sticky top-0 z-30 bg-bg/85 backdrop-blur">
                {/* Mobile row — brand + hamburger; sheet is rendered inside MobileMenu. */}
                <div className="md:hidden h-14 px-4 flex items-center justify-between">
                    {showLogo ? <Brand tenant={tenant} slugBase={slugBase} /> : <span />}
                    <MobileMenu
                        config={config}
                        pages={pages}
                        slugBase={slugBase}
                    />
                </div>
                {/* Desktop layout — original centered stack. */}
                <div className="hidden md:flex max-w-6xl mx-auto px-6 py-3 flex-col items-center gap-2">
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
                {/* Desktop links — hidden under md, replaced by hamburger. */}
                <div className="hidden md:flex items-center gap-5 flex-wrap justify-end">
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
                <MobileMenu
                    config={config}
                    pages={pages}
                    slugBase={slugBase}
                />
            </div>
        </header>
    )
}
