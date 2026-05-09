import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
    Menu,
    X,
    ChevronDown,
    BookOpen,
    Brain,
    Code2,
    Pen,
    Library,
    Users,
    FolderOpen,
    Target,
    FileText,
    BarChart3,
    Sparkles,
    LogIn,
    ArrowUpRight,
    Server,
    Shield,
    LineChart,
    PieChart
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { navbarData, type ResourceLink, type ProgramLink } from '@/constants/navbar'
import { dashboardLoginUrl } from '@/config/tenant'

const iconMap = {
    blog: Pen,
    tutorial: Library,
    softskills: Users,
    casestudy: FolderOpen,
    interview: Target,
    cheatsheet: FileText,
    analytics: BarChart3,
    data: BookOpen,
    ai: Brain,
    fullstack: Code2,
    engineering: Server,
    security: Shield,
    finance: LineChart,
    product: PieChart
} as const

type IconKey = keyof typeof iconMap

// ─── Internal SmoothLink — handles hash + route navigation ────────────────────

function useNavigateLink() {
    const navigate = useNavigate()
    const location = useLocation()
    return (href: string) => {
        if (href.startsWith('/')) {
            navigate(href)
            return
        }
        const targetId = href.replace('#', '')
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: targetId } })
        } else {
            const section = document.getElementById(targetId)
            if (section) {
                const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis
                if (lenis) {
                    lenis.scrollTo(section, { offset: -80, duration: 1.2 })
                } else {
                    const y = section.getBoundingClientRect().top + window.pageYOffset - 80
                    window.scrollTo({ top: y, behavior: 'smooth' })
                }
            }
        }
    }
}

// ─── Mega-menu ────────────────────────────────────────────────────────────────

interface MegaMenuProps {
    label: string
    items: (ResourceLink | ProgramLink)[]
    columns?: 1 | 2
    align?: 'left' | 'center' | 'right'
    labelColor?: string
    active?: boolean
    activeColor?: string
}

const MegaMenu = ({ label, items, columns = 2, align = 'center', labelColor, active = false, activeColor }: MegaMenuProps) => {
    const [open, setOpen] = useState(false)
    const closeTimer = useRef<number | null>(null)
    const navigate = useNavigate()

    const cancelClose = () => closeTimer.current && window.clearTimeout(closeTimer.current)
    const scheduleClose = () => {
        cancelClose()
        closeTimer.current = window.setTimeout(() => setOpen(false), 130)
    }

    const handleNav = (href: string) => {
        setOpen(false)
        navigate(href)
    }

    const alignClass = align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'left' ? 'left-0' : 'right-0'

    return (
        <div
            className="relative"
            onMouseEnter={() => {
                cancelClose()
                setOpen(true)
            }}
            onMouseLeave={scheduleClose}>
            <button
                className="relative inline-flex items-center gap-1 text-[14px] font-medium tracking-tight transition-colors"
                style={{
                    color: open || active ? (activeColor ?? 'var(--brand)') : (labelColor ?? 'var(--text-primary)'),
                    fontWeight: active ? 600 : 500
                }}>
                <span>{label}</span>
                <ChevronDown
                    size={13}
                    className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
                {/* Active indicator — small underline that grows from the centre */}
                {active && (
                    <span
                        aria-hidden="true"
                        className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-[2px] rounded-full"
                        style={{ width: 18, background: activeColor ?? 'var(--brand)' }}
                    />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className={`absolute ${alignClass} top-full pt-4 z-50`}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}>
                        <div
                            className="rounded-2xl p-3"
                            style={{
                                width: columns === 2 ? 600 : 320,
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow-hover)'
                            }}>
                            <div className={`grid gap-1 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {items.map((item) => {
                                    const Icon = iconMap[item.iconKey as IconKey]
                                    return (
                                        <button
                                            key={item.href}
                                            onClick={() => handleNav(item.href)}
                                            className="group/item flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200"
                                            style={{ border: '1px solid transparent' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110"
                                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className="text-[13.5px] font-semibold mb-0.5"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {item.label}
                                                </div>
                                                <div
                                                    className="text-[11.5px] leading-snug"
                                                    style={{ color: 'var(--text-tertiary)' }}>
                                                    {item.description}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Wordmark ────────────────────────────────────────────────────────────────

function Wordmark({ titleColor, subColor }: { titleColor?: string; subColor?: string } = {}) {
    return (
        <Link
            to="/"
            className="inline-flex items-center gap-2 group">
            {/* Tree leaf monogram */}
            <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-transform group-hover:rotate-[-6deg] group-hover:scale-105"
                style={{
                    background: 'var(--brand)',
                    color: 'var(--text-on-inverse)'
                }}>
                <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none">
                    <path
                        d="M12 3 C 7 7, 5 12, 12 21 C 19 12, 17 7, 12 3 Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 8 L12 21"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            </span>
            <span className="flex flex-col leading-none">
                <span
                    className="font-display font-semibold text-[20px] tracking-tight"
                    style={{ color: titleColor ?? 'var(--text-primary)' }}>
                    Albero
                </span>
                <span
                    className="text-[10px] tracking-[0.32em] uppercase font-medium mt-0.5"
                    style={{ color: subColor ?? 'var(--text-tertiary)' }}>
                    Academy
                </span>
            </span>
        </Link>
    )
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

// Routes whose hero is dark — navbar must render light text over them until
// the user scrolls, otherwise it's invisible against the dark background.
const DARK_HERO_ROUTES = ['/pricing', '/contact']

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [mobilePanel, setMobilePanel] = useState<null | 'programs' | 'resources'>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const goLink = useNavigateLink()

    const isDarkHero = DARK_HERO_ROUTES.some((p) => location.pathname.startsWith(p))
    // When the hero is dark and the user hasn't scrolled past it, force a
    // light text palette so the nav doesn't disappear.
    const lightOverlay = isDarkHero && !scrolled
    const navTextColor = lightOverlay ? '#f8f6ee' : 'var(--text-primary)'
    const navHover = lightOverlay ? 'rgba(255,255,255,0.10)' : 'var(--surface-2)'
    const navBorder = lightOverlay ? 'rgba(255,255,255,0.14)' : 'var(--line)'

    // Pick the colour of the active-state underline / accent. On a dark hero
    // we use mint so it pops against navy; everywhere else, brand emerald.
    const activeColor = lightOverlay ? '#a7f3d0' : 'var(--brand)'

    // Which top-level nav item is currently active, derived from the route.
    const path = location.pathname
    const isHome = path === '/' || path === ''
    const isPrograms = path.startsWith('/programs')
    const isResources = path.startsWith('/resources')
    const isPricing = path.startsWith('/pricing')
    const isContact = path.startsWith('/contact')

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <>
            <header
                className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? 'var(--page-bg)' : 'transparent',
                    borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
                    backdropFilter: scrolled ? 'saturate(180%) blur(8px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(8px)' : 'none'
                }}>
                {/* ── Utility strip ── */}
                <div
                    className="hidden md:block border-b text-[12px]"
                    style={{ borderColor: 'var(--line-soft)', background: 'var(--page-bg-soft)' }}>
                    <div className="max-w-[1280px] mx-auto px-6 h-9 flex items-center justify-between">
                        <div
                            className="flex items-center gap-2"
                            style={{ color: 'var(--text-tertiary)' }}>
                            <Sparkles
                                size={13}
                                style={{ color: 'var(--accent)' }}
                            />
                            <span>
                                New cohort starts <strong style={{ color: 'var(--text-primary)' }}>12 May 2026</strong> — early-bird seats limited.
                            </span>
                        </div>
                        <div className="flex items-center gap-5">
                            <a
                                href="/about"
                                className="hover:underline"
                                style={{ color: 'var(--text-tertiary)' }}>
                                About
                            </a>
                            <a
                                href="/resources/blogs"
                                className="hover:underline"
                                style={{ color: 'var(--text-tertiary)' }}>
                                Blog
                            </a>
                            <a
                                href="mailto:support@alberoacademy.com"
                                className="hover:underline"
                                style={{ color: 'var(--text-tertiary)' }}>
                                Help
                            </a>
                            <ThemeToggle size="sm" />
                        </div>
                    </div>
                </div>

                {/* ── Main bar ── */}
                <div
                    className="border-b"
                    style={{ borderColor: scrolled ? 'var(--line)' : 'transparent' }}>
                    <div className="max-w-[1280px] mx-auto px-5 md:px-6 h-[68px] flex items-center justify-between gap-6">
                        <Wordmark
                            titleColor={lightOverlay ? '#f8f6ee' : undefined}
                            subColor={lightOverlay ? 'rgba(248,246,238,0.6)' : undefined}
                        />

                        {/* Desktop nav */}
                        <nav className="hidden lg:flex items-center gap-8">
                            <NavItem
                                label="Home"
                                active={isHome}
                                onClick={() => goLink('#home')}
                                color={navTextColor}
                                activeColor={activeColor}
                            />
                            <MegaMenu
                                label="Programs"
                                items={navbarData.programs}
                                columns={2}
                                labelColor={navTextColor}
                                active={isPrograms}
                                activeColor={activeColor}
                            />
                            <MegaMenu
                                label="Resources"
                                items={navbarData.resources}
                                columns={2}
                                labelColor={navTextColor}
                                active={isResources}
                                activeColor={activeColor}
                            />
                            <NavItem
                                label="Pricing"
                                active={isPricing}
                                onClick={() => goLink('/pricing')}
                                color={navTextColor}
                                activeColor={activeColor}
                            />
                            <NavItem
                                label="Contact"
                                active={isContact}
                                onClick={() => goLink('/contact')}
                                color={navTextColor}
                                activeColor={activeColor}
                            />
                        </nav>

                        {/* Right cluster */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="md:hidden">
                                <ThemeToggle size="sm" />
                            </div>

                            <button
                                onClick={() => {
                                    window.location.href = dashboardLoginUrl()
                                }}
                                className="hidden md:inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition-colors"
                                style={{ color: navTextColor }}>
                                <LogIn size={14} /> Sign in
                            </button>

                            <button
                                onClick={() => goLink('/pricing')}
                                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-semibold transition-all hover:translate-y-[-1px]"
                                style={{
                                    background: lightOverlay ? '#a7f3d0' : 'var(--brand)',
                                    color: lightOverlay ? '#04081a' : 'var(--text-on-inverse)',
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 16px rgba(13,79,60,0.30)'
                                }}>
                                Enroll Now <ArrowUpRight size={14} />
                            </button>

                            {/* Mobile menu */}
                            <button
                                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full"
                                style={{ background: navHover, border: `1px solid ${navBorder}`, color: navTextColor }}
                                onClick={() => setIsOpen(true)}>
                                <Menu size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile drawer — portalled to document.body so the parent
            <header>'s backdrop-filter doesn't trap its `position: fixed`
            inside the header's containing block. Without this, the drawer
            renders only inside the header and the page bleeds through. */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                            className="fixed inset-0 z-[100] lg:hidden"
                            // Inline a solid hex fallback in case the CSS var is
                            // overridden by an ancestor in some theme.
                            style={{ background: 'var(--page-bg, #fbfaf6)' }}>
                            <div
                                className="h-[68px] px-5 flex items-center justify-between border-b"
                                style={{ borderColor: 'var(--line)', background: 'var(--page-bg, #fbfaf6)' }}>
                                <Wordmark />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full inline-flex items-center justify-center"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div
                                className="px-5 py-6 overflow-y-auto h-[calc(100vh-68px)]"
                                style={{ background: 'var(--page-bg, #fbfaf6)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className="text-[11px] tracking-[0.2em] uppercase"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        Theme
                                    </span>
                                    <ThemeToggle size="sm" />
                                </div>

                                <MobileLink
                                    label="Home"
                                    active={isHome}
                                    onClick={() => {
                                        setIsOpen(false)
                                        goLink('#home')
                                    }}
                                />

                                <Accordion
                                    label="Programs"
                                    active={isPrograms}
                                    open={mobilePanel === 'programs'}
                                    onToggle={() => setMobilePanel(mobilePanel === 'programs' ? null : 'programs')}>
                                    {navbarData.programs.map((p) => {
                                        const Icon = iconMap[p.iconKey as IconKey]
                                        return (
                                            <button
                                                key={p.href}
                                                onClick={() => {
                                                    setIsOpen(false)
                                                    navigate(p.href)
                                                }}
                                                className="w-full flex items-center gap-3 py-3 text-left">
                                                <div
                                                    className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
                                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                                    <Icon size={16} />
                                                </div>
                                                <span style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                                            </button>
                                        )
                                    })}
                                </Accordion>

                                <Accordion
                                    label="Resources"
                                    active={isResources}
                                    open={mobilePanel === 'resources'}
                                    onToggle={() => setMobilePanel(mobilePanel === 'resources' ? null : 'resources')}>
                                    {navbarData.resources.map((r) => {
                                        const Icon = iconMap[r.iconKey as IconKey]
                                        return (
                                            <button
                                                key={r.href}
                                                onClick={() => {
                                                    setIsOpen(false)
                                                    navigate(r.href)
                                                }}
                                                className="w-full flex items-center gap-3 py-3 text-left">
                                                <div
                                                    className="w-9 h-9 rounded-lg inline-flex items-center justify-center"
                                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                                    <Icon size={16} />
                                                </div>
                                                <span style={{ color: 'var(--text-primary)' }}>{r.label}</span>
                                            </button>
                                        )
                                    })}
                                </Accordion>

                                <MobileLink
                                    label="Pricing"
                                    active={isPricing}
                                    onClick={() => {
                                        setIsOpen(false)
                                        goLink('/pricing')
                                    }}
                                />
                                <MobileLink
                                    label="About"
                                    active={path.startsWith('/about')}
                                    onClick={() => {
                                        setIsOpen(false)
                                        goLink('/about')
                                    }}
                                />
                                <MobileLink
                                    label="Contact"
                                    active={isContact}
                                    onClick={() => {
                                        setIsOpen(false)
                                        goLink('/contact')
                                    }}
                                />

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false)
                                            window.location.href = dashboardLoginUrl()
                                        }}
                                        className="py-3 rounded-full font-semibold"
                                        style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line)' }}>
                                        Sign in
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false)
                                            goLink('/pricing')
                                        }}
                                        className="py-3 rounded-full font-semibold"
                                        style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

function Accordion({
    label,
    open,
    onToggle,
    active = false,
    children
}: {
    label: string
    open: boolean
    onToggle: () => void
    active?: boolean
    children: React.ReactNode
}) {
    return (
        <div
            className="border-b"
            style={{ borderColor: 'var(--line)' }}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-base"
                style={{
                    color: active ? 'var(--brand)' : 'var(--text-primary)',
                    fontWeight: active ? 600 : 500
                }}>
                <span className="inline-flex items-center gap-2">
                    {active && (
                        <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--brand)' }}
                        />
                    )}
                    {label}
                </span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="pb-3 pl-2">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Desktop nav button with active underline indicator ─────────────────────
function NavItem({
    label,
    active,
    onClick,
    color,
    activeColor
}: {
    label: string
    active: boolean
    onClick: () => void
    color: string
    activeColor: string
}) {
    return (
        <button
            onClick={onClick}
            className="relative text-[14px] tracking-tight transition-colors"
            style={{
                color: active ? activeColor : color,
                fontWeight: active ? 600 : 500
            }}>
            {label}
            {active && (
                <span
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-[2px] rounded-full"
                    style={{ width: 18, background: activeColor }}
                />
            )}
        </button>
    )
}

// ─── Mobile drawer link with active dot indicator ───────────────────────────
function MobileLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left py-4 border-b text-base"
            style={{
                borderColor: 'var(--line)',
                color: active ? 'var(--brand)' : 'var(--text-primary)',
                fontWeight: active ? 600 : 500
            }}>
            <span className="inline-flex items-center gap-2">
                {active && (
                    <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--brand)' }}
                    />
                )}
                {label}
            </span>
        </button>
    )
}

export { Navbar }
