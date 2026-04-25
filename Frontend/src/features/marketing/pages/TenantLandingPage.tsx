import { Link } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { useTenantBranding } from '@shared/contexts/useTenantBranding'
import { defaultLandingSections, type LandingSection } from '@features/admin/services/tenant.service'
import { LandingSectionRenderer } from '@features/marketing/components/LandingSection'

// Per-tenant public landing page (§9.1, §11). Renders ordered sections from
// `tenant.settings.landing.sections`. Tenants who haven't customised yet get
// a sensible default layout.
export const TenantLandingPage = () => {
    const { tenant } = useTenantBranding()
    const slugBase = `/t/${tenant.slug}`

    const sections: LandingSection[] = (tenant.landing?.sections && tenant.landing.sections.length > 0)
        ? tenant.landing.sections
        : defaultLandingSections(tenant.name)

    return (
        <div className="min-h-screen bg-bg text-fg">
            <header className="border-b border-[var(--color-border)] sticky top-0 z-30 bg-bg/85 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
                    <div className="flex items-center gap-3">
                        <Link
                            to={`${slugBase}/courses`}
                            className="text-sm text-fg-soft hover:text-fg hidden sm:inline">
                            Courses
                        </Link>
                        <Link
                            to={`${slugBase}/enquiry`}
                            className="text-sm text-fg-soft hover:text-fg hidden sm:inline">
                            Enquire
                        </Link>
                        <ThemeToggle />
                        <Link to="/login">
                            <Button
                                size="sm"
                                variant="ghost">
                                Sign in
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {sections.map((s) => (
                    <LandingSectionRenderer
                        key={s.id}
                        section={s}
                        slugBase={slugBase}
                        tenantName={tenant.name}
                    />
                ))}
            </main>

            <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-fg-muted">
                © {new Date().getFullYear()} {tenant.name}. Powered by Albero Academy.
            </footer>
        </div>
    )
}
