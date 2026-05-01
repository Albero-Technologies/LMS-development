// Per-tenant navbar — three variants the SA picks from in the editor.
//   simple   → logo left · links centre/right · sign-in
//   centered → logo + links centred (logo above)
//   with-cta → logo · links · CTA button (most marketing-friendly)
//
// Mobile (< md) collapses every variant to a hamburger sheet that drops down
// from the header. Desktop layout is unchanged.
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Award,
    BarChart3,
    BookOpen,
    Brain,
    Briefcase,
    ChevronDown,
    Code,
    Compass,
    Cpu,
    Database,
    Globe,
    GraduationCap,
    Mail,
    Menu,
    MessageCircle,
    Phone,
    Rocket,
    Shield,
    Sparkles,
    Users,
    X
} from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import type { LandingPage, NavIconToken, NavLink, NavbarConfig } from '@features/admin/services/tenant.service'

// Curated icon palette — keeps bundle size predictable (vs dynamic lookup
// across all of lucide-react) and makes the editor a closed-set picker.
const NAV_ICON: Record<NavIconToken, ComponentType<{ size?: number; className?: string }>> = {
    book: BookOpen,
    graduation: GraduationCap,
    chart: BarChart3,
    database: Database,
    sparkles: Sparkles,
    code: Code,
    brain: Brain,
    cpu: Cpu,
    briefcase: Briefcase,
    globe: Globe,
    users: Users,
    message: MessageCircle,
    mail: Mail,
    phone: Phone,
    award: Award,
    rocket: Rocket,
    compass: Compass,
    shield: Shield
}

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
    // When the link has children, render a dropdown trigger instead of a
    // navigable link. The trigger itself doesn't navigate; clicking opens the
    // menu (mobile) or hovering does (desktop).
    if (link.children && link.children.length > 0) {
        return (
            <NavDropdown
                link={link}
                pages={pages}
                slugBase={slugBase}
                onNavigate={onNavigate}
                fullWidth={fullWidth}
            />
        )
    }
    const href = resolveHref(link, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href)
    const target = link.newTab || isExternal ? '_blank' : undefined
    const cls = fullWidth
        ? 'block w-full text-base text-fg hover:text-[var(--color-brand-600)] transition-colors py-2 border-b border-[var(--color-border)]'
        : 'text-sm font-medium text-fg/85 hover:text-[var(--color-brand-600)] transition-colors'
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

// Dropdown trigger + menu. Hover/focus opens it on desktop; tapping toggles
// it on mobile (where hover is unreliable). Closes on outside click and on
// Escape so keyboard + mouse users both have a clean exit.
const NavDropdown = ({
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
    const [open, setOpen] = useState(false)
    const wrapRef = useRef<HTMLDivElement | null>(null)

    // Close on outside click + Escape. Skipped when the menu isn't open.
    useEffect(() => {
        if (!open) return
        const onDown = (e: MouseEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    if (fullWidth) {
        // Mobile / sheet — render the children inline as a nested list under
        // a tap-to-expand header. Avoids hover state on touch devices.
        return (
            <div className="border-b border-[var(--color-border)]">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="w-full flex items-center justify-between text-base text-fg hover:text-[var(--color-brand-600)] transition-colors py-2"
                    aria-expanded={open}>
                    <span>{link.label}</span>
                    <ChevronDown
                        size={16}
                        className={`transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                </button>
                {open && (
                    <ul className="pl-2 pb-3 space-y-1">
                        {link.children!.map((c) => {
                            const Icon = c.icon ? NAV_ICON[c.icon] : null
                            const href = resolveHref(c, pages, slugBase)
                            const isExternal = /^https?:\/\//.test(href)
                            const target = c.newTab || isExternal ? '_blank' : undefined
                            const inner = (
                                <span className="flex items-start gap-3 px-2 py-2 rounded-md hover:bg-surface-hover transition-colors">
                                    {Icon && (
                                        <span className="h-9 w-9 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center shrink-0">
                                            <Icon size={16} />
                                        </span>
                                    )}
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-fg">{c.label}</span>
                                        {c.description && <span className="block text-xs text-fg-muted">{c.description}</span>}
                                    </span>
                                </span>
                            )
                            return (
                                <li key={c.id}>
                                    {isExternal || target === '_blank' ? (
                                        <a
                                            href={href}
                                            target={target}
                                            rel={target === '_blank' ? 'noreferrer' : undefined}
                                            onClick={onNavigate}>
                                            {inner}
                                        </a>
                                    ) : (
                                        <Link
                                            to={href}
                                            onClick={onNavigate}>
                                            {inner}
                                        </Link>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        )
    }

    const isMega = !!link.mega
    const cols = link.columns === 2 ? 2 : 1
    return (
        <div
            ref={wrapRef}
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="inline-flex items-center gap-1 text-sm font-medium text-fg/85 hover:text-[var(--color-brand-600)] transition-colors">
                {link.label}
                <ChevronDown
                    size={14}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                // Outer container starts flush with the trigger bottom and
                // owns the visual gap as `pt-4` — that way mouse travel from
                // trigger → menu stays inside the wrapper and the menu does
                // not close mid-traverse.
                <div
                    className={
                        'absolute top-full z-40 pt-4 ' +
                        (isMega
                            ? `left-1/2 -translate-x-1/2 ${cols === 2 ? 'w-[640px]' : 'w-[380px]'}`
                            : 'left-1/2 -translate-x-1/2 min-w-[240px]')
                    }>
                    <div
                        role="menu"
                        className={
                            'rounded-2xl border border-[var(--color-border)] bg-surface shadow-xl ring-1 ring-black/[0.04] animate-in fade-in slide-in-from-top-1 duration-150 ' +
                            (isMega ? 'p-3' : 'py-2')
                        }>
                        {isMega ? (
                            <div className={cols === 2 ? 'grid grid-cols-2 gap-1' : 'grid grid-cols-1 gap-1'}>
                                {link.children!.map((c) => (
                                    <MegaItem
                                        key={c.id}
                                        link={c}
                                        pages={pages}
                                        slugBase={slugBase}
                                        onNavigate={() => {
                                            setOpen(false)
                                            onNavigate?.()
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            link.children!.map((c) => (
                                <DropdownItem
                                    key={c.id}
                                    link={c}
                                    pages={pages}
                                    slugBase={slugBase}
                                    onNavigate={() => {
                                        setOpen(false)
                                        onNavigate?.()
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// Rich mega-menu item: icon tile + label + description. Used inside an `mega`
// dropdown grid. Clicking navigates like a normal link.
const MegaItem = ({
    link,
    pages,
    slugBase,
    onNavigate
}: {
    link: NavLink
    pages: LandingPage[]
    slugBase: string
    onNavigate?: () => void
}) => {
    const href = resolveHref(link, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href)
    const target = link.newTab || isExternal ? '_blank' : undefined
    const Icon = link.icon ? NAV_ICON[link.icon] : null
    const inner = (
        <>
            <div className="h-10 w-10 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center shrink-0 group-hover:bg-[var(--color-brand-500)] group-hover:text-white transition-colors">
                {Icon ? <Icon size={18} /> : <Sparkles size={18} />}
            </div>
            <div className="min-w-0">
                <div className="text-sm font-semibold text-fg leading-tight">{link.label}</div>
                {link.description && (
                    <div className="text-xs text-fg-muted mt-0.5 leading-snug">{link.description}</div>
                )}
            </div>
        </>
    )
    const cls = 'group flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors'
    if (isExternal || target === '_blank') {
        return (
            <a
                href={href}
                target={target}
                rel={target === '_blank' ? 'noreferrer' : undefined}
                onClick={onNavigate}
                className={cls}
                role="menuitem">
                {inner}
            </a>
        )
    }
    return (
        <Link
            to={href}
            onClick={onNavigate}
            className={cls}
            role="menuitem">
            {inner}
        </Link>
    )
}

const DropdownItem = ({
    link,
    pages,
    slugBase,
    onNavigate
}: {
    link: NavLink
    pages: LandingPage[]
    slugBase: string
    onNavigate?: () => void
}) => {
    const href = resolveHref(link, pages, slugBase)
    const isExternal = /^https?:\/\//.test(href)
    const target = link.newTab || isExternal ? '_blank' : undefined
    const inner = (
        <span className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-fg">{link.label}</span>
        </span>
    )
    const cls = 'block px-4 py-2.5 hover:bg-surface-hover transition-colors'
    if (isExternal || target === '_blank') {
        return (
            <a
                href={href}
                target={target}
                rel={target === '_blank' ? 'noreferrer' : undefined}
                onClick={onNavigate}
                className={cls}
                role="menuitem">
                {inner}
            </a>
        )
    }
    return (
        <Link
            to={href}
            onClick={onNavigate}
            className={cls}
            role="menuitem">
            {inner}
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
                    className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40 bg-surface backdrop-blur border-t border-[var(--color-border)] overflow-y-auto"
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
                        className="md:hidden fixed top-0 right-0 bottom-0 w-[80vw] max-w-sm z-50 bg-surface border-l border-[var(--color-border)] overflow-y-auto shadow-xl animate-in slide-in-from-right duration-200"
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
                    className="md:hidden fixed inset-0 z-40 bg-surface overflow-y-auto"
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
            <header className="border-b border-[var(--color-border)] sticky top-0 z-30 bg-surface/95 backdrop-blur-md backdrop-saturate-150 shadow-sm">
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
        <header className="border-b border-[var(--color-border)] sticky top-0 z-30 bg-surface/95 backdrop-blur-md backdrop-saturate-150 shadow-sm">
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
