import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Sparkles, MessageCircle, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import type { LandingSection as Section } from '@features/admin/services/tenant.service'

// Renders a single block of the per-tenant landing page (§11). Used by:
//  - TenantLandingPage (public, links resolve under /t/:slug/...)
//  - WebsiteEditorPage live-preview pane (links go to "#" so previews don't navigate)
//
// `slugBase` is prefixed on relative CTA links (so a CTA stored as "enquiry"
// becomes "/t/<slug>/enquiry"). Pass empty string to disable resolution.

interface Props {
    section: Section
    slugBase: string
    tenantName: string
}

const resolveLink = (slugBase: string, link: string | undefined): string => {
    if (!link) return slugBase || '#'
    if (/^https?:\/\//.test(link)) return link
    return `${slugBase}/${link.replace(/^\//, '')}`
}

export const LandingSectionRenderer = ({ section, slugBase, tenantName }: Props) => {
    switch (section.type) {
        case 'hero':
            return (
                <HeroBlock
                    section={section}
                    slugBase={slugBase}
                    tenantName={tenantName}
                />
            )
        case 'features':
            return <FeaturesBlock section={section} />
        case 'cta':
            return (
                <CtaBlock
                    section={section}
                    slugBase={slugBase}
                />
            )
        case 'callout':
            return <CalloutBlock section={section} />
        default:
            return null
    }
}

// ---- Hero variants ----------------------------------------------------------

const HeroBlock = ({
    section,
    slugBase,
    tenantName
}: {
    section: Extract<Section, { type: 'hero' }>
    slugBase: string
    tenantName: string
}) => {
    const { eyebrow, title, subtitle, primaryCtaLabel, primaryCtaLink } = section.data
    const ctaHref = resolveLink(slugBase, primaryCtaLink)

    if (section.variant === 'centered') {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
                {eyebrow && <Badge tone="brand">{eyebrow}</Badge>}
                <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight max-w-3xl mx-auto">{title || `Learn with ${tenantName}`}</h1>
                {subtitle && <p className="mt-4 text-fg-soft max-w-xl mx-auto">{subtitle}</p>}
                {primaryCtaLabel && (
                    <div className="mt-6">
                        <Link to={ctaHref}>
                            <Button
                                size="lg"
                                rightIcon={<ArrowRight size={16} />}>
                                {primaryCtaLabel}
                            </Button>
                        </Link>
                    </div>
                )}
            </section>
        )
    }

    if (section.variant === 'gradient') {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-12">
                <div
                    className="rounded-xl p-8 sm:p-12 text-white text-center"
                    style={{ background: 'linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%)' }}>
                    {eyebrow && <Badge className="!bg-white/15 !text-white !border-white/25">{eyebrow}</Badge>}
                    <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">{title || `Learn with ${tenantName}`}</h1>
                    {subtitle && <p className="mt-4 text-white/85 max-w-xl mx-auto">{subtitle}</p>}
                    {primaryCtaLabel && (
                        <div className="mt-6">
                            <Link to={ctaHref}>
                                <Button
                                    size="lg"
                                    className="!bg-white !text-[var(--color-brand-700)] hover:!bg-white/90">
                                    {primaryCtaLabel}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        )
    }

    // split (default)
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-10 items-center">
            <div>
                {eyebrow && (
                    <Badge tone="brand">
                        <Sparkles
                            size={12}
                            className="mr-1"
                        />{' '}
                        {eyebrow}
                    </Badge>
                )}
                <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">{title || `Learn with ${tenantName}`}</h1>
                {subtitle && <p className="mt-4 text-fg-soft max-w-xl">{subtitle}</p>}
                {primaryCtaLabel && (
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to={ctaHref}>
                            <Button
                                size="lg"
                                rightIcon={<ArrowRight size={16} />}>
                                {primaryCtaLabel}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
            <Card className="!p-6 bg-gradient-to-br from-[var(--color-brand-50)] to-transparent">
                <div className="aspect-video grid place-items-center rounded-md bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20">
                    <div className="text-center">
                        <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-[var(--color-brand-500)] grid place-items-center text-white">
                            <Sparkles size={22} />
                        </div>
                        <p className="text-sm text-fg-soft">{tenantName}</p>
                    </div>
                </div>
            </Card>
        </section>
    )
}

// ---- Features variants ------------------------------------------------------

const FeaturesBlock = ({ section }: { section: Extract<Section, { type: 'features' }> }) => {
    const { title, pillars = [] } = section.data
    if (section.variant === 'list') {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {title && <h2 className="text-2xl font-semibold tracking-tight mb-5 text-center">{title}</h2>}
                <ul className="space-y-3">
                    {pillars.map((p, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-3 rounded-md border p-4">
                            <CheckCircle2
                                size={18}
                                className="text-[var(--color-success)] mt-0.5"
                            />
                            <div>
                                <div className="text-sm font-semibold text-fg">{p.title}</div>
                                <p className="text-xs text-fg-soft">{p.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        )
    }
    const cols = section.variant === 'four-up' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            {title && <h2 className="text-2xl font-semibold tracking-tight mb-6 text-center">{title}</h2>}
            <div className={`grid ${cols} gap-4`}>
                {pillars.map((p, i) => (
                    <Card
                        key={i}
                        className="!p-5">
                        <div className="h-9 w-9 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center mb-3">
                            {i % 2 === 0 ? <BookOpen size={18} /> : <MessageCircle size={18} />}
                        </div>
                        <div className="text-sm font-semibold text-fg">{p.title}</div>
                        <p className="mt-1 text-xs text-fg-soft">{p.description}</p>
                    </Card>
                ))}
            </div>
        </section>
    )
}

// ---- CTA variants -----------------------------------------------------------

const CtaBlock = ({ section, slugBase }: { section: Extract<Section, { type: 'cta' }>; slugBase: string }) => {
    const { title, subtitle, buttonLabel, buttonLink } = section.data
    const href = resolveLink(slugBase, buttonLink)
    if (section.variant === 'card') {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                <Card className="!p-8 text-center">
                    {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
                    {subtitle && <p className="mt-2 text-fg-soft max-w-md mx-auto">{subtitle}</p>}
                    {buttonLabel && (
                        <div className="mt-5">
                            <Link to={href}>
                                <Button size="lg">{buttonLabel}</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </section>
        )
    }
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <Card className="!p-8 sm:!p-12 text-center bg-[var(--color-brand-500)] text-white">
                {title && <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>}
                {subtitle && <p className="mt-2 text-white/85 max-w-lg mx-auto">{subtitle}</p>}
                {buttonLabel && (
                    <div className="mt-6">
                        <Link to={href}>
                            <Button
                                size="lg"
                                className="!bg-white !text-[var(--color-brand-700)] hover:!bg-white/90">
                                {buttonLabel}
                            </Button>
                        </Link>
                    </div>
                )}
            </Card>
        </section>
    )
}

// ---- Callout variants -------------------------------------------------------

const CalloutBlock = ({ section }: { section: Extract<Section, { type: 'callout' }> }) => {
    const { title, body } = section.data
    const isSuccess = section.variant === 'success'
    return (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <div
                className={
                    'flex items-start gap-3 rounded-md border p-4 ' +
                    (isSuccess ? 'bg-[var(--color-success-soft)] border-[var(--color-success)]/30' : 'bg-[var(--color-brand-50)] border-[var(--color-brand-100)]')
                }>
                <div
                    className={
                        'h-9 w-9 rounded-md grid place-items-center shrink-0 ' +
                        (isSuccess ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-brand-500)] text-white')
                    }>
                    {isSuccess ? <CheckCircle2 size={18} /> : <Info size={18} />}
                </div>
                <div>
                    {title && <div className="text-sm font-semibold text-fg">{title}</div>}
                    {body && <p className="text-xs text-fg-soft mt-0.5">{body}</p>}
                </div>
            </div>
        </section>
    )
}
