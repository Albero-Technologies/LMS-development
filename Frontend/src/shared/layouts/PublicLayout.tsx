import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from '@shared/components/Brand'
import { Button } from '@shared/components/ui/Button'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { cn } from '@shared/helpers/cn'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLE_HOME } from '@shared/constants/roles'

// Public nav — mirrors lms.pen `lpNav`. Deliberately short: the public site is
// for prospective STUDENTS, not institute operators.
const NAV = [
    { to: '/courses', label: 'Courses' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'About' }
]

export const PublicLayout = () => {
    const user = useAuthStore((s) => s.user)
    return (
        <div className="min-h-screen bg-surface text-fg">
            <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link
                        to="/"
                        aria-label="LearnHub home">
                        <Brand />
                    </Link>
                    <nav className="hidden md:flex items-center gap-0.5">
                        {NAV.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                className={({ isActive }) =>
                                    cn(
                                        'px-3 py-1.5 text-sm rounded-md transition-colors',
                                        isActive ? 'text-fg bg-surface-hover' : 'text-fg-soft hover:text-fg'
                                    )
                                }>
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-center gap-1.5">
                        <ThemeToggle />
                        {user ? (
                            <Link to={ROLE_HOME[user.role]}>
                                <Button size="sm">Open dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden sm:block">
                                    <Button
                                        size="sm"
                                        variant="ghost">
                                        Log in
                                    </Button>
                                </Link>
                                <Link to="/enquiry">
                                    <Button size="sm">Talk to counsellor</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
            <footer className="mt-24 border-t bg-surface-2">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-4 gap-8 text-sm">
                    <div className="md:col-span-2">
                        <Brand size="sm" />
                        <p className="mt-3 text-fg-soft max-w-sm">
                            Expert-led courses in engineering, design and data. Live cohorts, 1:1 mentorship, and
                            verifiable certificates.
                        </p>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-fg-muted font-semibold mb-3">Learn</div>
                        <ul className="space-y-2 text-fg-soft">
                            <li>
                                <Link
                                    to="/courses"
                                    className="hover:text-fg">
                                    Courses
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/pricing"
                                    className="hover:text-fg">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="hover:text-fg">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-fg-muted font-semibold mb-3">
                            Company
                        </div>
                        <ul className="space-y-2 text-fg-soft">
                            <li>
                                <Link
                                    to="/about"
                                    className="hover:text-fg">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/enquiry"
                                    className="hover:text-fg">
                                    Talk to us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/login"
                                    className="hover:text-fg">
                                    Log in
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-fg-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span>© {new Date().getFullYear()} LearnHub</span>
                        <span>Made in India · support@learnhub.in</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
