import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import { useTenantBranding } from '@shared/contexts/useTenantBranding'

// Per-tenant public landing page (§9.1). Lives at /t/:slug — the
// TenantBrandingProvider has already resolved the tenant and painted the brand
// color onto CSS vars before this renders. The page intentionally shows the
// tenant's name front-and-centre instead of "Albero Academy", so a tenant's
// students arriving from a shared link don't see a generic platform page.
//
// Sections below are kept simple-by-design: hero, three pillars, enquiry CTA.
// The visual website editor (§11) will eventually let tenants override these
// blocks per-school; until then this is the default layout.

export const TenantLandingPage = () => {
    const { tenant } = useTenantBranding()
    const slugBase = `/t/${tenant.slug}`

    // Pull the SA-edited copy with sensible fallbacks for tenants that haven't
    // been customised yet. Defaults match what the Website Editor pre-fills.
    const landing = tenant.landing ?? {}
    const heroTag = landing.heroTag ?? 'Now enrolling'
    const heroTitle = landing.heroTitle?.trim() || `Learn with ${tenant.name}`
    const heroSubtitle =
        landing.heroSubtitle?.trim() || 'Mentor-led cohorts, hands-on projects, and 1:1 counselling — designed to take you from curious to confident.'
    const primaryCtaLabel = landing.primaryCtaLabel ?? 'Talk to a counsellor'
    const pillars =
        landing.pillars && landing.pillars.length > 0
            ? landing.pillars
            : [
                  { title: 'Live cohorts', description: 'Small batches, real mentors, weekly office hours.' },
                  { title: '1:1 counselling', description: 'Talk to an admissions counsellor before you commit.' },
                  { title: 'Industry projects', description: 'Ship real work — not toy assignments — to your portfolio.' }
              ]
    const ctaTitle = landing.ctaTitle ?? 'Ready to start?'
    const ctaSubtitle = landing.ctaSubtitle ?? `Tell us what you're looking for and a ${tenant.name} counsellor will reach out within a working day.`
    const ctaButtonLabel = landing.ctaButtonLabel ?? 'Start enquiry'

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

            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
                <div>
                    <Badge tone="brand">
                        <Sparkles
                            size={12}
                            className="mr-1"
                        />{' '}
                        {heroTag}
                    </Badge>
                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">{heroTitle}</h1>
                    <p className="mt-4 text-fg-soft max-w-xl">{heroSubtitle}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to={`${slugBase}/enquiry`}>
                            <Button
                                size="lg"
                                rightIcon={<ArrowRight size={16} />}>
                                {primaryCtaLabel}
                            </Button>
                        </Link>
                        <Link to={`${slugBase}/courses`}>
                            <Button
                                size="lg"
                                variant="ghost"
                                leftIcon={<BookOpen size={16} />}>
                                Browse courses
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="!p-6 bg-gradient-to-br from-[var(--color-brand-50)] to-transparent">
                    <div className="aspect-video grid place-items-center rounded-md bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-[var(--color-brand-500)] grid place-items-center text-white">
                                <Sparkles size={22} />
                            </div>
                            <p className="text-sm text-fg-soft">
                                {tenant.name} — your school,
                                <br />
                                your pace, your goals.
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-4">
                {pillars.map((p, i) => (
                    <Pillar
                        key={`${p.title}-${i}`}
                        icon={i === 0 ? <BookOpen size={18} /> : <Sparkles size={18} />}
                        title={p.title}
                        desc={p.description}
                    />
                ))}
            </section>

            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <Card className="!p-8 sm:!p-12 text-center bg-[var(--color-brand-500)] text-white">
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{ctaTitle}</h2>
                    <p className="mt-2 text-white/85 max-w-lg mx-auto">{ctaSubtitle}</p>
                    <div className="mt-6">
                        <Link to={`${slugBase}/enquiry`}>
                            <Button
                                size="lg"
                                className="!bg-white !text-[var(--color-brand-700)] hover:!bg-white/90">
                                {ctaButtonLabel}
                            </Button>
                        </Link>
                    </div>
                </Card>
            </section>

            <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-fg-muted">
                © {new Date().getFullYear()} {tenant.name}. Powered by Albero Academy.
            </footer>
        </div>
    )
}

const Pillar = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <Card className="!p-5">
        <div className="h-9 w-9 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center mb-3">{icon}</div>
        <div className="text-sm font-semibold text-fg">{title}</div>
        <p className="mt-1 text-xs text-fg-soft">{desc}</p>
    </Card>
)
