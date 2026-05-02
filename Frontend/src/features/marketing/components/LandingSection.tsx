import { useContext, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Sparkles, MessageCircle, CheckCircle2, Info, ImageIcon, Database, Quote } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Input, Textarea } from '@shared/components/ui/Input'
import type { LandingContent, LandingSection as Section, SectionStyle, Typography } from '@features/admin/services/tenant.service'
import { resolveSectionStyle } from '@features/admin/services/tenant.service'
import { getPublicCollection } from '@features/admin/services/cms.service'
import { TenantBrandingCtx } from '@shared/contexts/TenantBrandingContext'
import { api } from '@shared/libs/api'

// Pull the tenant slug from `slugBase` (e.g. "/t/albero-academy" → "albero-academy").
// Fallback for when blocks render outside <TenantBrandingProvider> — the SA's
// website-editor preview pane is the canonical case. Returns empty string if
// the prefix doesn't match the expected /t/<slug> shape.
const slugFromBase = (slugBase: string): string => {
    const m = /^\/t\/([^/]+)/.exec(slugBase)
    return m ? m[1] : ''
}

// Map abstract style tokens onto Tailwind utility class names. Editors expose
// the tokens (sm/md/lg, narrow/wide, …) so non-technical users get sensible
// values instead of raw CSS strings.
const PADDING_CLASS: Record<NonNullable<SectionStyle['paddingY']>, string> = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24'
}

const MAX_WIDTH_CLASS: Record<NonNullable<SectionStyle['maxWidth']>, string> = {
    narrow: 'max-w-3xl',
    normal: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'max-w-none'
}

const ALIGN_CLASS: Record<NonNullable<SectionStyle['align']>, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
}

// Typography token → CSS map. Keep these tight + sensible — letting users
// type any font-family CSS string would silently break when the font isn't
// installed. The 5 tokens cover 99% of marketing-page typography needs.
const FONT_FAMILY: Record<NonNullable<Typography['fontFamily']>, string> = {
    inter: '"Inter", system-ui, sans-serif',
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace',
    display: '"Plus Jakarta Sans", "Inter", sans-serif'
}

const FONT_SIZE: Record<NonNullable<Typography['fontSize']>, string> = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.5rem',
    '5xl': '3.5rem'
}

const FONT_WEIGHT: Record<NonNullable<Typography['fontWeight']>, number> = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
}

const LINE_HEIGHT: Record<NonNullable<Typography['lineHeight']>, number> = {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.65,
    loose: 1.85
}

const LETTER_SPACING: Record<NonNullable<Typography['letterSpacing']>, string> = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em'
}

const typographyToCss = (t: Typography | undefined): React.CSSProperties => {
    if (!t) return {}
    const out: React.CSSProperties = {}
    if (t.fontFamily) out.fontFamily = FONT_FAMILY[t.fontFamily]
    if (t.fontSize) out.fontSize = FONT_SIZE[t.fontSize]
    if (t.fontWeight) out.fontWeight = FONT_WEIGHT[t.fontWeight]
    if (t.lineHeight) out.lineHeight = LINE_HEIGHT[t.lineHeight]
    if (t.letterSpacing) out.letterSpacing = LETTER_SPACING[t.letterSpacing]
    return out
}

// Slugify a section id for use as a CSS scope class.
const scopeClass = (id: string): string => `s-${id.replace(/[^a-z0-9_-]/gi, '').slice(0, 32)}`

// Wraps section markup in an IntersectionObserver-driven container that adds
// `.anim-in` once the element enters the viewport. CSS keyframes (defined in
// shared/assets/styles/index.css) run from the wrapper class.
//
// Honours `prefers-reduced-motion` — users with that preference skip the
// pre-animation hidden state entirely so content is fully visible at first
// paint, no transform applied.
const AnimatedWrapper = ({
    animation,
    delay,
    duration,
    children
}: {
    animation: NonNullable<SectionStyle['animation']>
    delay?: number
    duration?: number
    children: React.ReactNode
}) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const reducedMotion =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const [visible, setVisible] = useState(reducedMotion)

    useEffect(() => {
        if (visible) return
        const node = ref.current
        if (!node || typeof IntersectionObserver === 'undefined') {
            setVisible(true)
            return
        }
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setVisible(true)
                        observer.disconnect()
                    }
                }
            },
            { threshold: 0.15 }
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [visible])

    if (animation === 'none') return <>{children}</>

    const cssVars: CSSProperties & Record<string, string> = {
        '--anim-dur': `${duration ?? 700}ms`,
        '--anim-delay': `${delay ?? 0}ms`
    } as CSSProperties & Record<string, string>

    // Map the camelCase animation tokens (frozen API contract; persisted in
    // tenant landing JSON) to the kebab-case CSS class names used by the
    // stylesheet. Keep the two in sync — the stylelint kebab-case rule blocks
    // mixed casing so the CSS side cannot drift back to camelCase.
    const animationClass: Record<NonNullable<SectionStyle['animation']>, string> = {
        none: '',
        fadeIn: 'anim-fade-in',
        fadeUp: 'anim-fade-up',
        fadeDown: 'anim-fade-down',
        slideLeft: 'anim-slide-left',
        slideRight: 'anim-slide-right',
        zoomIn: 'anim-zoom-in'
    }
    const animClass = animationClass[animation]

    return (
        <div
            ref={ref}
            className={`${animClass} ${visible ? 'anim-in' : 'anim-pending'}`}
            style={cssVars}>
            {children}
        </div>
    )
}

// Wrap the section's intrinsic markup in a styled container if any overrides
// are set. When `style` is empty, returns the children untouched so default
// rendering (and unique per-variant layouts) keep working.
//
// Typography is applied via a scoped `<style>` block: heading rules cascade
// onto h1/h2/h3 inside the section; body rules onto everything else. Using
// inline style on the wrapper would let CSS specificity win in unexpected
// places, so we emit explicit selectors keyed off a per-section class.
const Styled = ({ id, style, children }: { id: string; style?: SectionStyle; children: React.ReactNode }) => {
    const hasLayout = !!(style?.background || style?.textColor || style?.paddingY || style?.align || style?.maxWidth)
    const hasType = !!(style?.headingType || style?.bodyType)
    const hasAnim = !!(style?.animation && style.animation !== 'none')

    // Compose the layout/typography wrappers first; the animation wrapper
    // goes on the outside so the in/out classes apply to the entire styled
    // section rather than just the inner content container.
    let inner: React.ReactNode = children
    if (hasLayout || hasType) {
        const padding = style?.paddingY ? PADDING_CLASS[style.paddingY] : ''
        const align = style?.align ? ALIGN_CLASS[style.align] : ''
        const maxw = style?.maxWidth ? MAX_WIDTH_CLASS[style.maxWidth] : ''
        const cls = scopeClass(id)
        const headingCss = style?.headingType ? cssBlock(`.${cls} h1, .${cls} h2, .${cls} h3`, typographyToCss(style.headingType)) : ''
        const bodyCss = style?.bodyType
            ? cssBlock(`.${cls} p, .${cls} li, .${cls} span:not([class*='font-mono'])`, typographyToCss(style.bodyType))
            : ''
        inner = (
            <>
                {(headingCss || bodyCss) && <style dangerouslySetInnerHTML={{ __html: headingCss + bodyCss }} />}
                <div
                    className={`${cls} ${padding}`}
                    style={{
                        background: style?.background,
                        color: style?.textColor
                    }}>
                    {hasLayout ? <div className={`${maxw || 'max-w-6xl'} mx-auto px-4 sm:px-6 ${align}`}>{children}</div> : children}
                </div>
            </>
        )
    }

    if (hasAnim) {
        return (
            <AnimatedWrapper
                animation={style!.animation!}
                delay={style?.animationDelay}
                duration={style?.animationDuration}>
                {inner}
            </AnimatedWrapper>
        )
    }
    return <>{inner}</>
}

// Render a CSS rule block: selector { prop: value; ... }. Skips empty bodies.
const cssBlock = (selector: string, props: React.CSSProperties): string => {
    const entries = Object.entries(props).filter(([, v]) => v !== undefined && v !== '')
    if (entries.length === 0) return ''
    const body = entries.map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${String(v)};`).join('')
    return `${selector}{${body}}`
}

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
    // Optional reusable style classes (landing.styleClasses) — passed in by
    // the page wrapper so the renderer can resolve `style.styleClassId`
    // references without coupling to the branding context.
    styleClasses?: LandingContent['styleClasses']
}

const resolveLink = (slugBase: string, link: string | undefined): string => {
    if (!link) return slugBase || '#'
    if (/^https?:\/\//.test(link)) return link
    return `${slugBase}/${link.replace(/^\//, '')}`
}

export const LandingSectionRenderer = ({ section, slugBase, tenantName, styleClasses }: Props) => {
    const resolvedStyle = resolveSectionStyle(section.style, styleClasses)
    const inner = (() => {
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
            case 'prose':
                return <ProseBlock section={section} />
            case 'bento':
                return <BentoBlock section={section} />
            case 'pricing':
                return (
                    <PricingBlock
                        section={section}
                        slugBase={slugBase}
                    />
                )
            case 'marquee':
                return <MarqueeBlock section={section} />
            case 'process':
                return <ProcessBlock section={section} />
            case 'faq':
                return <FaqBlock section={section} />
            case 'image':
                return <ImageBlock section={section} />
            case 'embed':
                return <EmbedBlock section={section} />
            case 'collectionList':
                return (
                    <CollectionListBlock
                        section={section}
                        slugBase={slugBase}
                    />
                )
            case 'testimonials':
                return <TestimonialsBlock section={section} />
            case 'stats':
                return <StatsBlock section={section} />
            case 'leadForm':
                return (
                    <LeadFormBlock
                        section={section}
                        slugBase={slugBase}
                        tenantName={tenantName}
                    />
                )
            case 'logos':
                return <LogosBlock section={section} />
            default:
                return null
        }
    })()
    return (
        <Styled
            id={section.id}
            style={resolvedStyle}>
            {inner}
        </Styled>
    )
}

// ---- Hero variants ----------------------------------------------------------

const HeroBlock = ({ section, slugBase, tenantName }: { section: Extract<Section, { type: 'hero' }>; slugBase: string; tenantName: string }) => {
    const { eyebrow, title, subtitle, primaryCtaLabel, primaryCtaLink, imageUrl, imageAlt } = section.data
    const ctaHref = resolveLink(slugBase, primaryCtaLink)

    if (section.variant === 'centered') {
        // Centered hero — soft mesh gradient backdrop, gradient-painted title,
        // and a slim trust line below the CTA. The mesh sits behind the content
        // so it doesn't fight with the section's parent style overrides.
        return (
            <section className="relative overflow-hidden">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                        background:
                            'radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--color-brand-500) 18%, transparent) 0%, transparent 70%), radial-gradient(40% 35% at 80% 30%, color-mix(in srgb, var(--color-brand-300) 22%, transparent) 0%, transparent 70%)'
                    }}
                />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            <Sparkles size={12} /> {eyebrow}
                        </span>
                    )}
                    <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-4xl mx-auto bg-gradient-to-br from-fg via-fg to-[var(--color-brand-700)] bg-clip-text text-transparent">
                        {title || `Learn with ${tenantName}`}
                    </h1>
                    {subtitle && <p className="mt-6 text-lg text-fg-soft max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
                    {primaryCtaLabel && (
                        <div className="mt-8">
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
            </section>
        )
    }

    if (section.variant === 'gradient') {
        // Brand-gradient banner — radial dot pattern overlay gives a subtle
        // tactile texture without competing with the title.
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-12">
                <div
                    className="relative overflow-hidden rounded-2xl p-10 sm:p-16 text-white text-center"
                    style={{
                        background:
                            'radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--color-brand-300) 30%, var(--color-brand-700)) 0%, var(--color-brand-700) 50%, var(--color-brand-900) 100%)'
                    }}>
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-25"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <div className="relative">
                        {eyebrow && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium text-white border border-white/20">
                                <Sparkles size={12} /> {eyebrow}
                            </span>
                        )}
                        <h1 className="mt-5 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">{title || `Learn with ${tenantName}`}</h1>
                        {subtitle && <p className="mt-5 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
                        {primaryCtaLabel && (
                            <div className="mt-8">
                                <Link to={ctaHref}>
                                    <Button
                                        size="lg"
                                        className="!bg-white !text-[var(--color-brand-700)] hover:!bg-white/90 shadow-lg">
                                        {primaryCtaLabel}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        )
    }

    // split (default) — premium two-column layout with mesh gradient
    // backdrop, ringed image card, and a richer CTA cluster.
    return (
        <section className="relative overflow-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                    background:
                        'radial-gradient(45% 40% at 10% 10%, color-mix(in srgb, var(--color-brand-500) 18%, transparent) 0%, transparent 70%), radial-gradient(35% 30% at 90% 80%, color-mix(in srgb, var(--color-brand-300) 22%, transparent) 0%, transparent 70%)'
                }}
            />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
                <div>
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            <Sparkles size={12} /> {eyebrow}
                        </span>
                    )}
                    <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] bg-gradient-to-br from-fg via-fg to-[var(--color-brand-700)] bg-clip-text text-transparent">
                        {title || `Learn with ${tenantName}`}
                    </h1>
                    {subtitle && <p className="mt-6 text-lg text-fg-soft max-w-xl leading-relaxed">{subtitle}</p>}
                    {primaryCtaLabel && (
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link to={ctaHref}>
                                <Button
                                    size="lg"
                                    rightIcon={<ArrowRight size={16} />}>
                                    {primaryCtaLabel}
                                </Button>
                            </Link>
                            <span className="text-xs text-fg-muted">No credit card · 1:1 counsellor call</span>
                        </div>
                    )}
                </div>
                <div className="relative">
                    {/* Decorative ring + glow behind the image card. */}
                    <div
                        aria-hidden
                        className="absolute -inset-4 rounded-3xl blur-2xl opacity-40"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-300))' }}
                    />
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-[var(--color-border)] bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={imageAlt ?? title ?? tenantName}
                                loading="eager"
                                className="w-full aspect-[4/3] object-cover block"
                            />
                        ) : (
                            <div className="aspect-[4/3] grid place-items-center bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)]">
                                <div className="text-center">
                                    <div className="mx-auto mb-3 h-16 w-16 rounded-2xl bg-[var(--color-brand-500)] grid place-items-center text-white shadow-lg">
                                        <Sparkles size={26} />
                                    </div>
                                    <p className="text-sm text-fg-soft">{tenantName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

// ---- Features variants ------------------------------------------------------

// Feature-card icon palette — cycles through accent colors so a four-up grid
// reads as 4 distinct things rather than 4 identical cards.
const FEATURE_ICON_TINTS = [
    { bg: 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)]', Icon: Sparkles },
    { bg: 'bg-[var(--color-purple-soft)] text-[var(--color-purple)]', Icon: BookOpen },
    { bg: 'bg-[var(--color-teal-soft)] text-[var(--color-teal)]', Icon: MessageCircle },
    { bg: 'bg-[var(--color-orange-soft)] text-[var(--color-orange)]', Icon: CheckCircle2 }
]

const FeaturesBlock = ({ section }: { section: Extract<Section, { type: 'features' }> }) => {
    const { title, pillars = [] } = section.data
    if (section.variant === 'list') {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
                {title && <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">{title}</h2>}
                <ul className="space-y-3">
                    {pillars.map((p, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-surface p-5 transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-md">
                            <div className="h-8 w-8 rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)] grid place-items-center shrink-0">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <div className="text-base font-semibold text-fg">{p.title}</div>
                                <p className="text-sm text-fg-soft mt-1 leading-relaxed">{p.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        )
    }
    const cols = section.variant === 'four-up' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {title && <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10 text-center max-w-3xl mx-auto">{title}</h2>}
            <div className={`grid ${cols} gap-5`}>
                {pillars.map((p, i) => {
                    const tint = FEATURE_ICON_TINTS[i % FEATURE_ICON_TINTS.length]
                    const Icon = tint.Icon
                    return (
                        <div
                            key={i}
                            className="group relative rounded-2xl border border-[var(--color-border)] bg-surface p-6 transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
                            <div className={`h-11 w-11 rounded-xl grid place-items-center mb-4 ${tint.bg}`}>
                                <Icon size={20} />
                            </div>
                            <div className="text-base font-semibold text-fg leading-snug">{p.title}</div>
                            <p className="mt-2 text-sm text-fg-soft leading-relaxed whitespace-pre-line">{p.description}</p>
                        </div>
                    )
                })}
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
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
                <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-surface to-[var(--color-brand-50)] p-10 text-center">
                    {title && <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>}
                    {subtitle && <p className="mt-3 text-fg-soft max-w-md mx-auto leading-relaxed">{subtitle}</p>}
                    {buttonLabel && (
                        <div className="mt-7">
                            <Link to={href}>
                                <Button
                                    size="lg"
                                    rightIcon={<ArrowRight size={16} />}>
                                    {buttonLabel}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        )
    }
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div
                className="relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center text-white"
                style={{
                    background:
                        'radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--color-brand-300) 25%, var(--color-brand-700)) 0%, var(--color-brand-700) 50%, var(--color-brand-900) 100%)'
                }}>
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />
                <div className="relative">
                    {title && <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">{title}</h2>}
                    {subtitle && <p className="mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
                    {buttonLabel && (
                        <div className="mt-8">
                            <Link to={href}>
                                <Button
                                    size="lg"
                                    className="!bg-white !text-[var(--color-brand-700)] hover:!bg-white/90 shadow-lg">
                                    {buttonLabel}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

// ---- Callout variants -------------------------------------------------------

// ---- Collection list block --------------------------------------------------
//
// Pulls published items from a CMS collection (per-tenant) and renders them
// in either a card grid or a vertical list. Field mapping (title/summary/
// image) is configurable per section so the same renderer works for blog
// posts, press releases, events, etc.
const CollectionListBlock = ({ section, slugBase }: { section: Extract<Section, { type: 'collectionList' }>; slugBase: string }) => {
    // Optional context — null in the SA editor preview. Fall back to the
    // slug parsed out of slugBase so the editor preview can still fetch.
    const ctx = useContext(TenantBrandingCtx)
    const tenantSlug = ctx?.tenant.slug ?? slugFromBase(slugBase)
    const slug = section.data.collectionSlug
    const query = useQuery({
        queryKey: ['public', 'collection', tenantSlug, slug],
        queryFn: () => getPublicCollection(tenantSlug, slug!),
        enabled: !!slug && tenantSlug.length > 0,
        staleTime: 60_000,
        retry: false
    })

    if (!slug) {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="rounded-md border border-dashed border-[var(--color-border)] bg-surface-2 p-6 text-center text-fg-muted">
                    <Database
                        size={32}
                        className="mx-auto mb-2 opacity-50"
                    />
                    <p className="text-sm">Pick a collection in the editor.</p>
                </div>
            </section>
        )
    }

    if (query.isError || !query.data) {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="rounded-md border bg-surface-2 p-6 text-center text-fg-muted">
                    <p className="text-sm">Couldn't load collection &quot;{slug}&quot;.</p>
                </div>
            </section>
        )
    }

    const items = (query.data.items ?? []).slice(0, section.data.limit ?? 6)
    const titleField = section.data.titleField ?? 'title'
    const summaryField = section.data.summaryField ?? 'summary'
    const imageField = section.data.imageField ?? 'coverImage'

    if (items.length === 0) {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                {section.data.title && <h2 className="text-2xl font-semibold tracking-tight mb-4 text-center">{section.data.title}</h2>}
                <p className="text-sm text-fg-muted text-center">Nothing published yet.</p>
            </section>
        )
    }

    if (section.variant === 'accordion') {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {section.data.title && <h2 className="text-2xl font-semibold tracking-tight mb-5 text-center">{section.data.title}</h2>}
                <div className="rounded-2xl border border-[var(--color-border)] bg-surface divide-y divide-[var(--color-border)] overflow-hidden">
                    {items.map((it) => (
                        <AccordionRow
                            key={it.id}
                            question={stringify(it.data[titleField]) || 'Untitled'}
                            answer={summaryField ? stringify(it.data[summaryField]) : ''}
                        />
                    ))}
                </div>
            </section>
        )
    }

    if (section.variant === 'list') {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {section.data.title && <h2 className="text-2xl font-semibold tracking-tight mb-5">{section.data.title}</h2>}
                <ul className="space-y-3">
                    {items.map((it) => (
                        <li
                            key={it.id}
                            className="rounded-md border border-[var(--color-border)] p-4">
                            <div className="text-sm font-semibold text-fg">{stringify(it.data[titleField])}</div>
                            {summaryField && !!it.data[summaryField] && (
                                <p className="text-xs text-fg-soft mt-1 line-clamp-3">{stringify(it.data[summaryField])}</p>
                            )}
                            {it.publishedAt && (
                                <div className="mt-2 text-[11px] text-fg-muted font-mono">
                                    {new Date(it.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            {section.data.title && <h2 className="text-2xl font-semibold tracking-tight mb-6 text-center">{section.data.title}</h2>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((it) => {
                    const img = imageField ? stringify(it.data[imageField]) : ''
                    return (
                        <Card
                            key={it.id}
                            className="!p-0 overflow-hidden">
                            {img && (
                                <img
                                    src={img}
                                    alt={stringify(it.data[titleField])}
                                    loading="lazy"
                                    className="w-full h-40 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <div className="text-sm font-semibold text-fg">{stringify(it.data[titleField])}</div>
                                {summaryField && !!it.data[summaryField] && (
                                    <p className="text-xs text-fg-soft mt-1 line-clamp-3">{stringify(it.data[summaryField])}</p>
                                )}
                                {it.publishedAt && (
                                    <div className="mt-2 text-[11px] text-fg-muted font-mono">
                                        {new Date(it.publishedAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>
        </section>
    )
}

const stringify = (v: unknown): string => {
    if (v === null || v === undefined) return ''
    if (typeof v === 'string') return v
    return String(v)
}

// One row in the FAQ accordion. Local open state — clicking the header
// toggles the answer. Native <details>/<summary> would handle this without
// JS, but the manual implementation lets us animate the chevron and style
// the open state cleanly.
const AccordionRow = ({ question, answer }: { question: string; answer: string }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className={open ? 'bg-surface-hover/40' : ''}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-surface-hover/50 transition-colors">
                <span className="text-sm sm:text-base font-semibold text-fg">{question}</span>
                <span
                    className={
                        'shrink-0 grid place-items-center h-7 w-7 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] transition-transform ' +
                        (open ? 'rotate-180' : '')
                    }>
                    <ArrowRight
                        size={14}
                        className="rotate-90"
                    />
                </span>
            </button>
            {open && answer && <div className="px-5 pb-5 -mt-1 text-sm text-fg-soft leading-relaxed">{answer}</div>}
        </div>
    )
}

// ---- Image block ------------------------------------------------------------

const ImageBlock = ({ section }: { section: Extract<Section, { type: 'image' }> }) => {
    const { src, alt, caption, rounded } = section.data
    if (!src) {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="aspect-video grid place-items-center rounded-md border border-dashed border-[var(--color-border)] bg-surface-2 text-fg-muted">
                    <div className="text-center">
                        <ImageIcon
                            size={32}
                            className="mx-auto mb-2 opacity-50"
                        />
                        <p className="text-sm">No image set yet</p>
                    </div>
                </div>
            </section>
        )
    }
    if (section.variant === 'full') {
        return (
            <section className="py-0">
                <img
                    src={src}
                    alt={alt ?? ''}
                    loading="lazy"
                    className="w-full h-auto block"
                />
                {caption && <p className="mt-2 text-xs text-fg-muted text-center">{caption}</p>}
            </section>
        )
    }
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <img
                src={src}
                alt={alt ?? ''}
                loading="lazy"
                className={`w-full h-auto block ${rounded ? 'rounded-xl' : ''}`}
            />
            {caption && <p className="mt-2 text-xs text-fg-muted text-center">{caption}</p>}
        </section>
    )
}

// ---- Embed block ------------------------------------------------------------
//
// Custom HTML / iframe embed. Rendered inside a sandboxed iframe with srcdoc
// so injected scripts can't access the parent window — even if a tenant SA
// pastes hostile HTML, it's contained. Sandbox flags allow scripts (needed
// for YouTube, Calendly, etc.) and same-origin to forms but NOT
// allow-top-navigation or allow-popups, so a malicious embed can't redirect
// the parent page or open new windows.
const EmbedBlock = ({ section }: { section: Extract<Section, { type: 'embed' }> }) => {
    const { html, height, title } = section.data
    if (!html) {
        return (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                <div className="rounded-md border border-dashed border-[var(--color-border)] bg-surface-2 p-6 text-center text-fg-muted">
                    <p className="text-sm">No embed set — paste HTML in the editor.</p>
                </div>
            </section>
        )
    }
    const docHtml = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;font-family:system-ui,sans-serif}img,iframe,video{max-width:100%;display:block}</style></head><body>${html}</body></html>`
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <iframe
                srcDoc={docHtml}
                title={title || 'Embed'}
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                className="w-full rounded-md border border-[var(--color-border)] bg-surface"
                style={{ height: `${height ?? 480}px` }}
            />
        </section>
    )
}

const CalloutBlock = ({ section }: { section: Extract<Section, { type: 'callout' }> }) => {
    const { title, body } = section.data
    const isSuccess = section.variant === 'success'
    return (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <div
                className={
                    'flex items-start gap-3 rounded-md border p-4 ' +
                    (isSuccess
                        ? 'bg-[var(--color-success-soft)] border-[var(--color-success)]/30'
                        : 'bg-[var(--color-brand-50)] border-[var(--color-brand-100)]')
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

// ---- Prose block ------------------------------------------------------------
//
// Long-form text — primarily used for policy / legal pages. `body` is rendered
// with `whitespace-pre-line` so newline-separated paragraphs in the source
// JSON paint as separate paragraphs without a full markdown stack. Variant
// `narrow` is the legal-document column (~600px); `wide` extends to the
// standard reading column for less-dense content.

const ProseBlock = ({ section }: { section: Extract<Section, { type: 'prose' }> }) => {
    const { eyebrow, title, body } = section.data
    const containerClass = section.variant === 'wide' ? 'max-w-4xl' : 'max-w-3xl'
    return (
        <section className={`${containerClass} mx-auto px-4 sm:px-6 py-10`}>
            {eyebrow && <div className="text-xs uppercase tracking-wider text-[var(--color-brand-600)] font-medium mb-2">{eyebrow}</div>}
            {title && <h2 className="text-2xl font-semibold tracking-tight text-fg mb-4">{title}</h2>}
            {body && <div className="text-sm text-fg-soft leading-relaxed whitespace-pre-line">{body}</div>}
        </section>
    )
}

// ---- Bento block ------------------------------------------------------------
//
// Asymmetric tile grid — five tiles where some can be `wide` (span 2 cols).
// Each tile has its own accent tint so the section reads as 5 distinct
// "products" or capabilities without all looking identical. Modeled on
// Linear / Vercel / Supabase marketing pages.

const BENTO_ACCENT_BG: Record<NonNullable<Extract<Section, { type: 'bento' }>['data']['tiles']>[number]['accent'] & string, string> = {
    brand: 'bg-gradient-to-br from-[var(--color-brand-50)] to-surface',
    purple: 'bg-gradient-to-br from-[var(--color-purple-soft)] to-surface',
    teal: 'bg-gradient-to-br from-[var(--color-teal-soft)] to-surface',
    orange: 'bg-gradient-to-br from-[var(--color-orange-soft)] to-surface',
    pink: 'bg-gradient-to-br from-[var(--color-pink-soft)] to-surface'
}

const BENTO_ACCENT_DOT: Record<keyof typeof BENTO_ACCENT_BG, string> = {
    brand: 'bg-[var(--color-brand-500)]',
    purple: 'bg-[var(--color-purple)]',
    teal: 'bg-[var(--color-teal)]',
    orange: 'bg-[var(--color-orange)]',
    pink: 'bg-[var(--color-pink)]'
}

const BentoBlock = ({ section }: { section: Extract<Section, { type: 'bento' }> }) => {
    const { eyebrow, title, subtitle, tiles = [] } = section.data
    if (tiles.length === 0) return null

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {(eyebrow || title || subtitle) && (
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            {eyebrow}
                        </span>
                    )}
                    {title && <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>}
                    {subtitle && <p className="mt-3 text-fg-soft leading-relaxed">{subtitle}</p>}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(220px,auto)]">
                {tiles.map((t, i) => {
                    const accent = (t.accent ?? 'brand') as keyof typeof BENTO_ACCENT_BG
                    return (
                        <div
                            key={i}
                            className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] p-6 transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-lg ${BENTO_ACCENT_BG[accent]} ${t.wide ? 'lg:col-span-2' : ''}`}>
                            <div className="flex items-center gap-2">
                                <span className={`inline-block h-2 w-2 rounded-full ${BENTO_ACCENT_DOT[accent]}`} />
                                {t.eyebrow && <span className="text-[11px] uppercase tracking-wider font-semibold text-fg-soft">{t.eyebrow}</span>}
                            </div>
                            <div className="mt-3 text-lg sm:text-xl font-bold text-fg leading-snug">{t.title}</div>
                            {t.body && <p className="mt-2 text-sm text-fg-soft leading-relaxed">{t.body}</p>}
                            {t.imageUrl && (
                                <img
                                    src={t.imageUrl}
                                    alt=""
                                    loading="lazy"
                                    className="mt-4 w-full rounded-lg object-cover aspect-video"
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

// ---- Pricing block ----------------------------------------------------------
//
// Three- or four-tier pricing grid. The `highlighted` tier gets a brand-tinted
// frame and a slight lift so the recommended option is obvious. Variant=table
// renders the same data as a comparison row instead — useful for plans with
// many feature deltas.

const PricingBlock = ({ section, slugBase }: { section: Extract<Section, { type: 'pricing' }>; slugBase: string }) => {
    const { eyebrow, title, subtitle, tiers = [] } = section.data
    if (tiers.length === 0) return null

    const cols = tiers.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
    const isTable = section.variant === 'table'

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {(eyebrow || title || subtitle) && (
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            {eyebrow}
                        </span>
                    )}
                    {title && <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>}
                    {subtitle && <p className="mt-3 text-fg-soft leading-relaxed">{subtitle}</p>}
                </div>
            )}

            {isTable ? (
                <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                        <thead className="bg-surface-2">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-fg-soft">Plan</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-fg-soft">Price</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-fg-soft">Includes</th>
                                <th className="px-5 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {tiers.map((t, i) => (
                                <tr
                                    key={i}
                                    className={t.highlighted ? 'bg-[var(--color-brand-50)]' : ''}>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-fg">{t.name}</div>
                                        {t.blurb && <div className="text-xs text-fg-muted mt-0.5">{t.blurb}</div>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-mono font-semibold text-fg">{t.price}</div>
                                        {t.period && <div className="text-[11px] text-fg-muted">{t.period}</div>}
                                    </td>
                                    <td className="px-5 py-4 text-fg-soft">
                                        <ul className="space-y-1">
                                            {(t.features ?? []).slice(0, 4).map((f, j) => (
                                                <li
                                                    key={j}
                                                    className="flex gap-2 items-start">
                                                    <CheckCircle2
                                                        size={12}
                                                        className="text-[var(--color-success)] mt-1 shrink-0"
                                                    />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {t.ctaLabel && (
                                            <Link to={resolveLink(slugBase, t.ctaLink)}>
                                                <Button
                                                    size="sm"
                                                    variant={t.highlighted ? 'primary' : 'ghost'}>
                                                    {t.ctaLabel}
                                                </Button>
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={`grid gap-5 sm:grid-cols-2 ${cols}`}>
                    {tiers.map((t, i) => {
                        const isHighlight = t.highlighted
                        return (
                            <div
                                key={i}
                                className={`relative rounded-2xl p-7 flex flex-col transition-all ${
                                    isHighlight
                                        ? 'border-2 border-[var(--color-brand-500)] bg-gradient-to-br from-[var(--color-brand-50)] to-surface shadow-[0_18px_40px_-12px_rgba(0,98,255,0.25)] -translate-y-1'
                                        : 'border border-[var(--color-border)] bg-surface hover:border-[var(--color-brand-500)]/40 hover:shadow-md'
                                }`}>
                                {(t.badge || isHighlight) && (
                                    <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-500)] text-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow">
                                        {t.badge ?? 'Most popular'}
                                    </span>
                                )}
                                <div className="text-sm font-semibold text-fg-soft uppercase tracking-wider">{t.name}</div>
                                {t.blurb && <p className="mt-1 text-xs text-fg-muted">{t.blurb}</p>}
                                <div className="mt-5 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight text-fg">{t.price}</span>
                                    {t.period && <span className="text-sm text-fg-muted">/ {t.period}</span>}
                                </div>
                                <ul className="mt-6 space-y-2.5 flex-1">
                                    {(t.features ?? []).map((f, j) => (
                                        <li
                                            key={j}
                                            className="flex gap-2 items-start text-sm text-fg-soft">
                                            <CheckCircle2
                                                size={14}
                                                className={`mt-0.5 shrink-0 ${isHighlight ? 'text-[var(--color-brand-600)]' : 'text-[var(--color-success)]'}`}
                                            />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                {t.ctaLabel && (
                                    <Link
                                        to={resolveLink(slugBase, t.ctaLink)}
                                        className="mt-7">
                                        <Button
                                            size="lg"
                                            className="w-full"
                                            variant={isHighlight ? 'primary' : 'ghost'}>
                                            {t.ctaLabel}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

// ---- Marquee block ----------------------------------------------------------
//
// Infinite-scrolling row of chips. We render the items twice in the same
// track so the loop is seamless; the keyframe in index.css translates
// -50% over `speed`-driven duration. Mask gradients on the edges fade the
// content in/out instead of cutting off mid-chip.

const MarqueeBlock = ({ section }: { section: Extract<Section, { type: 'marquee' }> }) => {
    const { eyebrow, title, items = [], speed = 'normal' } = section.data
    if (items.length === 0) return null
    const isBanner = section.variant === 'banner'

    return (
        <section className="py-16">
            {(eyebrow || title) && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8 text-center">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            {eyebrow}
                        </span>
                    )}
                    {title && <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>}
                </div>
            )}
            <div
                className="relative overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
                    WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)'
                }}>
                <div
                    className="marquee-track flex w-max gap-4"
                    data-speed={speed}>
                    {[...items, ...items].map((it, i) => (
                        <span
                            key={`${it}-${i}`}
                            className={
                                isBanner
                                    ? 'whitespace-nowrap rounded-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-6 py-2 text-sm font-semibold text-white shadow'
                                    : 'whitespace-nowrap rounded-full border border-[var(--color-border)] bg-surface px-5 py-2 text-sm font-medium text-fg-soft hover:text-fg hover:border-[var(--color-brand-500)]/40 transition-colors'
                            }>
                            {it}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ---- Process block ----------------------------------------------------------
//
// Numbered steps with connecting line — desktop renders as a 4-column grid
// with a horizontal connector under the number badges; mobile collapses to a
// vertical list with a left-side connector. Each step has an outsized number
// glyph that doubles as the icon.

const ProcessBlock = ({ section }: { section: Extract<Section, { type: 'process' }> }) => {
    const { eyebrow, title, subtitle, steps = [] } = section.data
    if (steps.length === 0) return null
    const isHorizontal = section.variant === 'horizontal'

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {(eyebrow || title || subtitle) && (
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            {eyebrow}
                        </span>
                    )}
                    {title && <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>}
                    {subtitle && <p className="mt-3 text-fg-soft leading-relaxed">{subtitle}</p>}
                </div>
            )}
            {isHorizontal ? (
                <div className="relative">
                    {/* Horizontal connector — sits behind the number badges. */}
                    <div
                        aria-hidden
                        className="hidden md:block absolute top-7 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-[var(--color-brand-500)]/30 to-transparent"
                    />
                    <div className="relative grid gap-8 md:grid-cols-4">
                        {steps.slice(0, 4).map((s, i) => (
                            <div
                                key={i}
                                className="text-center">
                                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] grid place-items-center text-white shadow-[0_8px_20px_-8px_rgba(0,98,255,0.5)] text-lg font-bold">
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                {s.badge && <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">{s.badge}</div>}
                                <div className="mt-2 text-base font-semibold text-fg leading-snug">{s.title}</div>
                                {s.body && <p className="mt-2 text-sm text-fg-soft leading-relaxed">{s.body}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="relative max-w-2xl mx-auto">
                    {/* Vertical connector. */}
                    <div
                        aria-hidden
                        className="absolute left-7 top-7 bottom-7 w-px bg-gradient-to-b from-[var(--color-brand-500)]/40 to-[var(--color-brand-500)]/10"
                    />
                    <ol className="relative space-y-8">
                        {steps.map((s, i) => (
                            <li
                                key={i}
                                className="flex gap-5 items-start">
                                <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] grid place-items-center text-white shadow-[0_8px_20px_-8px_rgba(0,98,255,0.5)] text-lg font-bold">
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div className="pt-1">
                                    {s.badge && <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">{s.badge}</div>}
                                    <div className="mt-1 text-lg font-semibold text-fg leading-snug">{s.title}</div>
                                    {s.body && <p className="mt-2 text-sm text-fg-soft leading-relaxed">{s.body}</p>}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </section>
    )
}

// ---- FAQ block --------------------------------------------------------------
//
// Native <details> accordion — keyboard accessible by default, no JS state
// to coordinate, and `group-open:` keyframes the chevron without any extra
// machinery. Variant `two-column` keeps the same data but lays it out in a
// 2-column grid for shorter answers.

const FaqBlock = ({ section }: { section: Extract<Section, { type: 'faq' }> }) => {
    const { eyebrow, title, subtitle, items = [] } = section.data
    if (items.length === 0) return null
    const isTwoColumn = section.variant === 'two-column'

    return (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
            {(eyebrow || title || subtitle) && (
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            {eyebrow}
                        </span>
                    )}
                    {title && <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>}
                    {subtitle && <p className="mt-3 text-fg-soft leading-relaxed">{subtitle}</p>}
                </div>
            )}
            <div className={isTwoColumn ? 'grid md:grid-cols-2 gap-3' : 'space-y-3 max-w-3xl mx-auto'}>
                {items.map((q, i) => (
                    <details
                        key={i}
                        className="group rounded-xl border border-[var(--color-border)] bg-surface px-5 py-4 transition-colors open:border-[var(--color-brand-500)]/40 open:bg-[var(--color-brand-50)]/30">
                        <summary className="flex cursor-pointer items-center justify-between gap-4 list-none text-base font-semibold text-fg [&::-webkit-details-marker]:hidden">
                            <span>{q.question}</span>
                            <span className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-fg-soft transition-transform group-open:rotate-45 group-open:border-[var(--color-brand-500)]/40 group-open:text-[var(--color-brand-600)]">
                                <span aria-hidden>+</span>
                            </span>
                        </summary>
                        <p className="mt-3 text-sm text-fg-soft leading-relaxed whitespace-pre-line">{q.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    )
}

// ---- Testimonials block -----------------------------------------------------

const TestimonialsBlock = ({ section }: { section: Extract<Section, { type: 'testimonials' }> }) => {
    const { title, subtitle, items = [] } = section.data
    if (items.length === 0) return null

    if (section.variant === 'quotes') {
        return (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
                {title && <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>}
                {subtitle && <p className="mt-2 text-fg-soft max-w-xl mx-auto">{subtitle}</p>}
                <div className="mt-8 space-y-8">
                    {items.map((t, i) => (
                        <figure key={i}>
                            <Quote
                                size={28}
                                className="mx-auto text-[var(--color-brand-500)] opacity-60"
                            />
                            <blockquote className="mt-3 text-lg sm:text-xl leading-relaxed text-fg italic">&ldquo;{t.quote}&rdquo;</blockquote>
                            <figcaption className="mt-4 inline-flex items-center gap-3">
                                {t.avatarUrl && (
                                    <img
                                        src={t.avatarUrl}
                                        alt=""
                                        loading="lazy"
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                )}
                                <span className="text-sm text-fg-soft">
                                    <span className="font-semibold text-fg">{t.name}</span>
                                    {t.role && <span> · {t.role}</span>}
                                    {t.company && <span> @ {t.company}</span>}
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {title && <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center max-w-3xl mx-auto">{title}</h2>}
            {subtitle && <p className="mt-4 text-fg-soft text-center max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((t, i) => (
                    <figure
                        key={i}
                        className="group relative rounded-2xl border border-[var(--color-border)] bg-surface p-7 flex flex-col transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
                        <div className="text-5xl leading-none text-[var(--color-brand-500)]/30 font-serif select-none">&ldquo;</div>
                        <blockquote className="-mt-2 text-sm text-fg leading-relaxed flex-1">{t.quote}</blockquote>
                        <figcaption className="mt-6 pt-5 border-t border-[var(--color-border)] inline-flex items-center gap-3">
                            {t.avatarUrl ? (
                                <img
                                    src={t.avatarUrl}
                                    alt=""
                                    loading="lazy"
                                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--color-brand-50)]"
                                />
                            ) : (
                                <div className="h-11 w-11 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center text-base font-semibold ring-2 ring-[var(--color-brand-100)]">
                                    {t.name.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-semibold text-fg">{t.name}</div>
                                <div className="text-xs text-fg-muted">
                                    {t.role}
                                    {t.role && t.company && ' · '}
                                    {t.company}
                                </div>
                            </div>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    )
}

// ---- Stats block ------------------------------------------------------------

const StatsBlock = ({ section }: { section: Extract<Section, { type: 'stats' }> }) => {
    const { title, subtitle, items = [] } = section.data
    if (items.length === 0) return null

    if (section.variant === 'banner') {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
                <div
                    className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-white"
                    style={{
                        background:
                            'radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--color-brand-300) 25%, var(--color-brand-700)) 0%, var(--color-brand-700) 50%, var(--color-brand-900) 100%)'
                    }}>
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-15"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <div className="relative">
                        {title && <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center max-w-3xl mx-auto">{title}</h2>}
                        {subtitle && <p className="mt-4 text-white/90 text-center max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
                        <div
                            className={`mt-12 grid gap-8 ${items.length === 2 ? 'sm:grid-cols-2' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                            {items.map((s, i) => (
                                <div
                                    key={i}
                                    className="text-center">
                                    <div className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                                        {s.value}
                                    </div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/95">{s.label}</div>
                                    {s.sublabel && <div className="mt-1 text-xs text-white/70">{s.sublabel}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            {title && <h2 className="text-3xl font-bold tracking-tight text-center max-w-3xl mx-auto">{title}</h2>}
            {subtitle && <p className="mt-3 text-fg-soft text-center max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
            <div className={`mt-10 grid gap-5 ${items.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                {items.map((s, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-[var(--color-border)] bg-surface p-6 text-center transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-md">
                        <div className="text-4xl font-bold tracking-tight bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] bg-clip-text text-transparent">
                            {s.value}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-fg uppercase tracking-wider">{s.label}</div>
                        {s.sublabel && <div className="mt-1 text-xs text-fg-muted">{s.sublabel}</div>}
                    </div>
                ))}
            </div>
        </section>
    )
}

// ---- Lead form block --------------------------------------------------------
//
// Inline lead-capture form. Posts to /api/v1/enquiries via the configured api
// instance — the same endpoint the public `/enquiry` page uses. Tenant slug
// is auto-resolved from the host header on the backend, so no client-side
// tenantSlug is required when the form is rendered on a /t/<slug>/... route.

const LeadFormBlock = ({
    section,
    slugBase,
    tenantName
}: {
    section: Extract<Section, { type: 'leadForm' }>
    slugBase: string
    tenantName: string
}) => {
    // Optional context — null in the SA editor preview pane (no provider).
    const ctx = useContext(TenantBrandingCtx)
    const tenantSlug = ctx?.tenant.slug ?? slugFromBase(slugBase)
    const {
        eyebrow,
        title,
        subtitle,
        submitLabel = 'Send',
        successMessage = 'Thanks — we will be in touch shortly.',
        coursePrefill,
        showQualification,
        showCity,
        showMessage
    } = section.data

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [course, setCourse] = useState(coursePrefill ?? '')
    const [city, setCity] = useState('')
    const [qualification, setQualification] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!name.trim() || !email.includes('@') || phone.length < 7) {
            setError('Please fill in name, a valid email, and phone.')
            return
        }
        setError(null)
        setSubmitting(true)
        try {
            await api.post('/enquiries', {
                tenantSlug,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                course: course.trim() || coursePrefill || 'General enquiry',
                city: city.trim() || undefined,
                qualification: qualification.trim() || undefined,
                message: message.trim() || undefined,
                source: 'website-inline-form'
            })
            setSubmitted(true)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not send — please try again.'
            setError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const FormBody = (
        <form
            onSubmit={submit}
            className="space-y-3">
            {submitted ? (
                <div className="rounded-md border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] p-4 text-center">
                    <CheckCircle2
                        size={28}
                        className="mx-auto text-[var(--color-success)] mb-2"
                    />
                    <p className="text-sm font-semibold text-fg">{successMessage}</p>
                </div>
            ) : (
                <>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                            label="Full name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Priya Sharma"
                        />
                        <Input
                            label="Phone"
                            required
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98XXX XXXXX"
                        />
                    </div>
                    <Input
                        label="Email"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                    <Input
                        label="Interested in"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder={coursePrefill || `What program from ${tenantName} are you considering?`}
                    />
                    {showCity && (
                        <Input
                            label="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Bengaluru"
                        />
                    )}
                    {showQualification && (
                        <Input
                            label="Qualification"
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            placeholder="B.Tech, M.Sc, MBA…"
                        />
                    )}
                    {showMessage && (
                        <Textarea
                            label="Message"
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Anything specific you'd like us to address on the call?"
                        />
                    )}
                    {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                    <Button
                        type="submit"
                        size="lg"
                        loading={submitting}
                        className="w-full">
                        {submitLabel}
                    </Button>
                    <p className="text-[11px] text-fg-muted text-center">
                        By submitting, you agree to be contacted by {tenantName} about programs and scholarships.
                    </p>
                </>
            )}
        </form>
    )

    if (section.variant === 'split') {
        return (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        {eyebrow && <Badge tone="brand">{eyebrow}</Badge>}
                        {title && <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>}
                        {subtitle && <p className="mt-3 text-fg-soft max-w-md">{subtitle}</p>}
                        <ul className="mt-6 space-y-2 text-sm text-fg-soft">
                            <li className="flex items-start gap-2">
                                <CheckCircle2
                                    size={16}
                                    className="text-[var(--color-success)] mt-0.5 shrink-0"
                                />
                                Free 20-minute counselling call
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2
                                    size={16}
                                    className="text-[var(--color-success)] mt-0.5 shrink-0"
                                />
                                Personalised program recommendation
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2
                                    size={16}
                                    className="text-[var(--color-success)] mt-0.5 shrink-0"
                                />
                                Scholarship eligibility check
                            </li>
                        </ul>
                    </div>
                    <Card className="!p-6">{FormBody}</Card>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
            <Card className="!p-6 sm:!p-8">
                {eyebrow && (
                    <div className="text-center">
                        <Badge tone="brand">{eyebrow}</Badge>
                    </div>
                )}
                {title && <h2 className="mt-3 text-2xl font-semibold tracking-tight text-center">{title}</h2>}
                {subtitle && <p className="mt-2 text-fg-soft text-center">{subtitle}</p>}
                <div className="mt-6">{FormBody}</div>
            </Card>
        </section>
    )
}

// ---- Logos block ------------------------------------------------------------

// Renders one logo as either inline SVG (when `logo.svg` is set) or an
// <img> for a URL. The wrapper class is shared so both modes get the same
// hover treatment (opacity + grayscale lift). Inline SVG is rendered via
// `dangerouslySetInnerHTML` since SA-authored markup is trusted; we strip
// `<script>` tags as a minimum-effort safety net.
const sanitizeSvg = (raw: string): string => raw.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

const LogoMark = ({ logo, size }: { logo: { src?: string; svg?: string; alt?: string }; size: 'sm' | 'md' }) => {
    const cls =
        (size === 'sm' ? 'h-8 ' : 'h-10 max-w-[140px] mx-auto ') +
        'w-auto object-contain opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 [&>svg]:h-full [&>svg]:w-auto'
    if (logo.svg) {
        return (
            <span
                role="img"
                aria-label={logo.alt ?? ''}
                className={cls + ' inline-flex items-center'}
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(logo.svg) }}
            />
        )
    }
    if (!logo.src) return null
    return (
        <img
            src={logo.src}
            alt={logo.alt ?? ''}
            loading="lazy"
            className={cls}
        />
    )
}

const LogosBlock = ({ section }: { section: Extract<Section, { type: 'logos' }> }) => {
    const { title, subtitle, items = [] } = section.data
    const renderable = items.filter((l) => l.svg || l.src)
    if (renderable.length === 0) return null

    if (section.variant === 'scroll') {
        const doubled = [...renderable, ...renderable]
        return (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {title && <h2 className="text-sm font-semibold tracking-wide uppercase text-fg-muted text-center">{title}</h2>}
                {subtitle && <p className="mt-1 text-fg-soft text-center">{subtitle}</p>}
                <div
                    className="mt-6 overflow-hidden"
                    style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                    <div
                        className="flex gap-12 items-center"
                        style={{ animation: 'logo-marquee 30s linear infinite', width: 'max-content' }}>
                        {doubled.map((logo, i) => (
                            <LogoMark
                                key={i}
                                logo={logo}
                                size="sm"
                            />
                        ))}
                    </div>
                </div>
                <style
                    dangerouslySetInnerHTML={{
                        __html: '@keyframes logo-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }'
                    }}
                />
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            {title && <h2 className="text-sm font-semibold tracking-wide uppercase text-fg-muted text-center">{title}</h2>}
            {subtitle && <p className="mt-1 text-fg-soft text-center">{subtitle}</p>}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-6 items-center">
                {renderable.map((logo, i) => {
                    const mark = (
                        <LogoMark
                            logo={logo}
                            size="md"
                        />
                    )
                    return logo.href ? (
                        <a
                            key={i}
                            href={logo.href}
                            target="_blank"
                            rel="noopener noreferrer">
                            {mark}
                        </a>
                    ) : (
                        <div key={i}>{mark}</div>
                    )
                })}
            </div>
        </section>
    )
}
