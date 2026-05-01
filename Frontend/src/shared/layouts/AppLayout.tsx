import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    ClipboardList,
    GraduationCap,
    TicketCheck,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    CalendarCheck,
    CreditCard,
    LineChart,
    Wrench,
    ShieldCheck,
    PanelLeftClose,
    PanelLeftOpen,
    Kanban,
    Activity,
    Eye,
    Briefcase,
    Building2,
    Globe,
    Link2,
    Telescope,
    Database
} from 'lucide-react'
import { Brand } from '@shared/components/Brand'
import { ScrollToTop } from '@shared/components/ScrollToTop'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { NotificationBell } from '@features/notifications/components/NotificationBell'
import { CommandPalette, CommandPaletteTrigger, useCommandPaletteShortcut } from '@shared/components/CommandPalette'
import { ConfirmProvider, useConfirm } from '@shared/components/ui/ConfirmDialog'
import { useRealtimeSync } from '@shared/hooks/useRealtimeSync'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@shared/helpers/cn'
import { useAuthStore, fullName } from '@shared/stores/authStore'
import { ROLES, ROLE_LABEL, type TRole } from '@shared/constants/roles'
import { meRequest } from '@features/auth/services/auth.service'
import { getMyTenant } from '@features/admin/services/tenant.service'

// -----------------------------------------------------------------------------
// Nav config — mirrors lms.pen's per-role sidebars. Each role only sees its own
// set so "Users" etc. never render a dead link for a Student.
// -----------------------------------------------------------------------------

// `end: true` means "highlight only on exact match" — we set it on dashboard
// roots so they don't light up when the user is on a child route (e.g.
// `/app/admin` shouldn't highlight while sitting on `/app/admin/tenants`).
type NavItem = { to: string; label: string; icon: ComponentType<{ size?: number }>; end?: boolean }

const NAV_BY_ROLE: Record<TRole, NavItem[]> = {
    SUPER_ADMIN: [
        { to: '/app/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/admin/tenants', label: 'Tenants', icon: Building2 },
        { to: '/app/admin/website-editor', label: 'Website Editor', icon: Globe },
        { to: '/app/admin/cms', label: 'CMS', icon: Database },
        { to: '/app/admin/utm-builder', label: 'UTM Builder', icon: Link2 },
        { to: '/app/admin/seo-builder', label: 'SEO Builder', icon: Telescope },
        { to: '/app/courses', label: 'Courses', icon: BookOpen },
        { to: '/app/batches', label: 'Batches', icon: CalendarCheck },
        { to: '/app/assignments', label: 'Assignments', icon: ClipboardList },
        { to: '/app/users', label: 'Users', icon: Users },
        { to: '/app/payments', label: 'Client Payments', icon: CreditCard },
        { to: '/app/reports', label: 'Analytics', icon: LineChart },
        { to: '/app/audit-logs', label: 'Activity Logs', icon: Activity }
    ],
    ADMIN: [
        { to: '/app/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/batches', label: 'Batches', icon: CalendarCheck },
        { to: '/app/users', label: 'Users', icon: Users },
        { to: '/app/counsellor/pipeline', label: 'Lead Pipeline', icon: Kanban },
        { to: '/app/counsellor/invites', label: 'Shareable Links', icon: Link2 },
        { to: '/app/courses', label: 'Courses', icon: BookOpen },
        { to: '/app/assignments', label: 'Assignments', icon: ClipboardList },
        { to: '/app/admin/cms', label: 'Content', icon: Database },
        { to: '/app/payments', label: 'Payments', icon: CreditCard },
        { to: '/app/admin/billing', label: 'Subscription', icon: Briefcase },
        { to: '/app/tickets', label: 'Support', icon: TicketCheck },
        { to: '/app/reports', label: 'Reports', icon: LineChart },
        { to: '/app/admin/demo-control', label: 'Demo Mode', icon: Eye },
        { to: '/app/admin/integrations', label: 'Integrations', icon: Link2 }
    ],
    TRAINER: [
        { to: '/app/trainer', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/batches', label: 'Batches', icon: CalendarCheck },
        { to: '/app/courses', label: 'Courses', icon: BookOpen },
        { to: '/app/quizzes', label: 'Quizzes', icon: ClipboardList },
        { to: '/app/assignments', label: 'Assignments', icon: ClipboardList },
        { to: '/app/users', label: 'Students', icon: GraduationCap },
        { to: '/app/payments', label: 'Payments', icon: CreditCard }
    ],
    STUDENT: [
        { to: '/app/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/courses', label: 'Courses', icon: BookOpen },
        { to: '/app/quizzes', label: 'Quizzes', icon: ClipboardList },
        { to: '/app/assignments', label: 'Assignments', icon: ClipboardList },
        { to: '/app/student/batches', label: 'My Batches', icon: CalendarCheck },
        { to: '/app/enrollments', label: 'My Enrollments', icon: GraduationCap },
        { to: '/app/payments', label: 'Fees', icon: CreditCard },
        { to: '/app/tickets', label: 'Support', icon: TicketCheck }
    ],
    COUNSELLOR: [
        { to: '/app/counsellor', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/counsellor/pipeline', label: 'Lead Pipeline', icon: Kanban },
        { to: '/app/counsellor/invites', label: 'Shareable Links', icon: Link2 },
        { to: '/app/counsellor/students', label: 'Students', icon: GraduationCap },
        { to: '/app/tickets', label: 'Support', icon: TicketCheck }
    ],
    COUNSELLING_MANAGER: [
        { to: '/app/counsellor', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/counsellor/pipeline', label: 'Lead Pipeline', icon: Kanban },
        { to: '/app/counsellor/invites', label: 'Shareable Links', icon: Link2 },
        { to: '/app/counsellor/students', label: 'Students', icon: GraduationCap },
        { to: '/app/reports', label: 'Team Reports', icon: LineChart },
        { to: '/app/users', label: 'Team', icon: Users }
    ],
    SUPPORT: [
        { to: '/app/support', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/tickets', label: 'Tickets', icon: TicketCheck },
        { to: '/app/users', label: 'Students', icon: Users },
        { to: '/app/courses', label: 'Courses', icon: BookOpen }
    ]
}

const ROLE_ACCENT: Partial<Record<TRole, { label: string; icon: ComponentType<{ size?: number }>; className: string }>> = {
    SUPER_ADMIN: { label: 'Super Admin', icon: ShieldCheck, className: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' },
    ADMIN: { label: 'Admin', icon: Briefcase, className: 'bg-white/10 text-white' },
    TRAINER: { label: 'Trainer', icon: Wrench, className: 'bg-white/10 text-white' },
    STUDENT: { label: 'Student', icon: GraduationCap, className: 'bg-white/10 text-white' },
    COUNSELLOR: { label: 'Counsellor', icon: Kanban, className: 'bg-white/10 text-white' },
    COUNSELLING_MANAGER: { label: 'Manager', icon: Kanban, className: 'bg-white/10 text-white' },
    SUPPORT: { label: 'Support', icon: TicketCheck, className: 'bg-white/10 text-white' }
}

const BOTTOM: NavItem[] = [
    { to: '/app/notifications', label: 'Notifications', icon: Bell },
    { to: '/app/settings', label: 'Settings', icon: Settings }
]

// -----------------------------------------------------------------------------

// Provides the global confirm-dialog context so any descendant of the layout
// can call `useConfirm()` to show a confirmation modal. Body of the layout
// lives in `AppLayoutBody` so it can `useConfirm` itself (e.g. for logout).
export const AppLayout = () => (
    <ConfirmProvider>
        <AppLayoutBody />
    </ConfirmProvider>
)

const AppLayoutBody = () => {
    const user = useAuthStore((s) => s.user)
    const setUser = useAuthStore((s) => s.setUser)
    const clear = useAuthStore((s) => s.clear)
    const navigate = useNavigate()
    const confirm = useConfirm()
    const [openMobile, setOpenMobile] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [paletteOpen, setPaletteOpen] = useState(false)

    const nav = useMemo<NavItem[]>(() => (user ? (NAV_BY_ROLE[user.role] ?? []) : []), [user])
    const roleAccent = user ? ROLE_ACCENT[user.role] : undefined
    const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN

    // Hydrate the auth store from /auth/me on mount so profile screens always
    // show the latest first/last/phone from the database (the persisted token
    // may pre-date a profile edit from another device or session).
    const userId = user?.id
    useEffect(() => {
        if (!userId) return
        let cancelled = false
        meRequest()
            .then((fresh) => {
                if (!cancelled) setUser(fresh)
            })
            .catch(() => {
                /* 401s are handled by the api interceptor; everything else is best-effort */
            })
        return () => {
            cancelled = true
        }
    }, [userId, setUser])

    // SUPER_ADMIN lives in the platform tenant — they don't get a customer
    // brand color, so skip the fetch entirely. Other roles paint the tenant's
    // brand color across the auth surface (sidebar accent, primary buttons,
    // links) by overriding the --color-brand-* CSS variables.
    const brandingQuery = useQuery({
        queryKey: ['tenant', 'me', 'branding'],
        queryFn: getMyTenant,
        enabled: !!userId && !isSuperAdmin,
        staleTime: 5 * 60_000
    })
    const brandColor = brandingQuery.data?.brandingColor
    useEffect(() => {
        if (!brandColor) return
        const root = document.documentElement
        const original = {
            500: root.style.getPropertyValue('--color-brand-500'),
            600: root.style.getPropertyValue('--color-brand-600'),
            700: root.style.getPropertyValue('--color-brand-700')
        }
        root.style.setProperty('--color-brand-500', brandColor)
        root.style.setProperty('--color-brand-600', brandColor)
        root.style.setProperty('--color-brand-700', brandColor)
        return () => {
            root.style.setProperty('--color-brand-500', original[500])
            root.style.setProperty('--color-brand-600', original[600])
            root.style.setProperty('--color-brand-700', original[700])
        }
    }, [brandColor])

    // Open the socket connection while authenticated and route push events to
    // TanStack Query invalidations.
    useRealtimeSync()

    // Cmd+K (or Ctrl+K) and "/" toggle the global command palette.
    useCommandPaletteShortcut(() => setPaletteOpen((v) => !v))

    const handleLogout = async () => {
        const ok = await confirm({
            title: 'Sign out?',
            description: "You'll need to sign in again to come back. Any unsaved work in this tab will be lost.",
            confirmLabel: 'Sign out',
            tone: 'warning'
        })
        if (!ok) return
        clear()
        navigate('/login', { replace: true })
    }

    const sidebarWidth = collapsed ? 'w-[76px]' : 'w-[240px]'

    return (
        <div className="min-h-screen bg-surface-2 text-fg">
            <ScrollToTop />
            <div className="flex">
                {/* Sidebar */}
                <aside
                    style={{
                        background: isSuperAdmin
                            ? 'linear-gradient(180deg, var(--color-sidebar-sa-top), var(--color-sidebar-sa-bot))'
                            : 'var(--color-sidebar)'
                    }}
                    className={cn(
                        'fixed lg:sticky top-0 z-50 h-screen shrink-0 flex flex-col transition-[width] duration-200',
                        sidebarWidth,
                        'border-r border-[var(--color-sidebar-border)]',
                        openMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    )}>
                    {/* Brand header */}
                    <div className={cn('flex items-center justify-between px-4 h-16', collapsed && 'justify-center px-2')}>
                        <Link
                            to="/"
                            aria-label="Albero Academy home"
                            className="flex items-center min-w-0">
                            {collapsed ? (
                                <Brand
                                    size="md"
                                    onDark
                                    iconOnly
                                />
                            ) : (
                                <Brand
                                    size="md"
                                    onDark
                                />
                            )}
                        </Link>
                        <button
                            onClick={() => setOpenMobile(false)}
                            className="lg:hidden text-white/70 hover:text-white"
                            aria-label="Close menu">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Role chip */}
                    {roleAccent && !collapsed && (
                        <div className="px-4 pb-3">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider',
                                    roleAccent.className
                                )}>
                                <roleAccent.icon size={10} />
                                {roleAccent.label}
                            </span>
                        </div>
                    )}

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-4 space-y-0.5">
                        {nav.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setOpenMobile(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'group flex items-center gap-3 rounded-md text-sm transition-colors h-10',
                                            collapsed ? 'justify-center px-0' : 'px-3',
                                            isActive
                                                ? 'bg-[var(--color-brand-500)] text-white shadow-sm'
                                                : 'text-[var(--color-sidebar-fg)] hover:text-white hover:bg-[var(--color-sidebar-hover)]'
                                        )
                                    }
                                    title={collapsed ? item.label : undefined}>
                                    <Icon size={16} />
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </NavLink>
                            )
                        })}
                    </nav>

                    {/* Bottom utilities */}
                    <div className="px-2 pb-3 space-y-0.5 border-t border-[var(--color-sidebar-border)] pt-3">
                        {BOTTOM.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setOpenMobile(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 rounded-md text-sm h-10 transition-colors',
                                            collapsed ? 'justify-center' : 'px-3',
                                            isActive
                                                ? 'bg-[var(--color-sidebar-hover)] text-white'
                                                : 'text-[var(--color-sidebar-fg)] hover:text-white hover:bg-[var(--color-sidebar-hover)]'
                                        )
                                    }
                                    title={collapsed ? item.label : undefined}>
                                    <Icon size={16} />
                                    {!collapsed && item.label}
                                </NavLink>
                            )
                        })}

                        {/* Collapse toggle — desktop only */}
                        <button
                            type="button"
                            onClick={() => setCollapsed((c) => !c)}
                            className={cn(
                                'hidden lg:flex items-center gap-3 rounded-md text-sm h-10 w-full transition-colors text-[var(--color-sidebar-fg)] hover:text-white hover:bg-[var(--color-sidebar-hover)]',
                                collapsed ? 'justify-center' : 'px-3'
                            )}
                            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                            {!collapsed && <span>Collapse</span>}
                        </button>

                        {/* User card */}
                        {user && !collapsed && (
                            <div className="mt-2 p-2.5 rounded-md flex items-center gap-2.5 bg-[var(--color-sidebar-hover)]">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                    {fullName(user)[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs text-white truncate">{fullName(user)}</div>
                                    <div className="text-[10px] text-[var(--color-sidebar-fg)] truncate">{ROLE_LABEL[user.role]}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="text-[var(--color-sidebar-fg)] hover:text-white"
                                    aria-label="Sign out">
                                    <LogOut size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mobile overlay */}
                {openMobile && (
                    <button
                        type="button"
                        onClick={() => setOpenMobile(false)}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        aria-label="Close menu"
                    />
                )}

                {/* Main */}
                <div className="flex-1 min-w-0">
                    <header className="sticky top-0 z-30 bg-surface border-b">
                        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => setOpenMobile(true)}
                                className="lg:hidden btn btn-ghost btn-icon"
                                aria-label="Open menu">
                                <Menu size={16} />
                            </button>

                            {/* Search — opens the Cmd+K command palette. */}
                            <CommandPaletteTrigger onClick={() => setPaletteOpen(true)} />

                            <div className="flex items-center gap-1.5">
                                <ThemeToggle />
                                <NotificationBell />
                                <div
                                    aria-hidden
                                    className="h-5 w-px bg-[var(--color-border)] mx-1"
                                />
                                {user && (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-surface-hover"
                                        title="Sign out">
                                        <div className="w-7 h-7 rounded-full bg-[var(--color-brand-500)] flex items-center justify-center text-white text-xs font-semibold">
                                            {fullName(user)[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-sm text-fg hidden sm:inline">
                                            {user.firstName || user.email.split('@')[0]}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
            <CommandPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
            />
        </div>
    )
}
