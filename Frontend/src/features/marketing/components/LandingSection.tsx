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

    return (
        <div
            ref={ref}
            className={`anim-${animation} ${visible ? 'anim-in' : 'anim-pending'}`}
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

// ---- Collection list block --------------------------------------------------
//
// Pulls published items from a CMS collection (per-tenant) and renders them
// in either a card grid or a vertical list. Field mapping (title/summary/
// image) is configurable per section so the same renderer works for blog
// posts, press releases, events, etc.
const CollectionListBlock = ({
    section,
    slugBase
}: {
    section: Extract<Section, { type: 'collectionList' }>
    slugBase: string
}) => {
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
                            <blockquote className="mt-3 text-lg sm:text-xl leading-relaxed text-fg italic">
                                &ldquo;{t.quote}&rdquo;
                            </blockquote>
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
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            {title && <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">{title}</h2>}
            {subtitle && <p className="mt-2 text-fg-soft text-center max-w-xl mx-auto">{subtitle}</p>}
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((t, i) => (
                    <Card
                        key={i}
                        className="!p-5 flex flex-col">
                        <Quote
                            size={20}
                            className="text-[var(--color-brand-500)] opacity-70"
                        />
                        <p className="mt-3 text-sm text-fg leading-relaxed flex-1">{t.quote}</p>
                        <div className="mt-5 inline-flex items-center gap-3">
                            {t.avatarUrl ? (
                                <img
                                    src={t.avatarUrl}
                                    alt=""
                                    loading="lazy"
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] grid place-items-center text-sm font-semibold">
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
                        </div>
                    </Card>
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
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <div
                    className="rounded-xl p-8 sm:p-12 text-white"
                    style={{ background: 'linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%)' }}>
                    {title && <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">{title}</h2>}
                    {subtitle && <p className="mt-3 text-white/85 text-center max-w-2xl mx-auto">{subtitle}</p>}
                    <div className={`mt-8 grid gap-6 ${items.length === 2 ? 'sm:grid-cols-2' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                        {items.map((s, i) => (
                            <div
                                key={i}
                                className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold tracking-tight">{s.value}</div>
                                <div className="mt-1 text-sm font-medium">{s.label}</div>
                                {s.sublabel && <div className="mt-1 text-xs text-white/75">{s.sublabel}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            {title && <h2 className="text-2xl font-semibold tracking-tight text-center">{title}</h2>}
            {subtitle && <p className="mt-2 text-fg-soft text-center max-w-xl mx-auto">{subtitle}</p>}
            <div className={`mt-8 grid gap-4 ${items.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                {items.map((s, i) => (
                    <Card
                        key={i}
                        className="!p-5 text-center">
                        <div className="text-3xl font-bold tracking-tight text-[var(--color-brand-600)]">{s.value}</div>
                        <div className="mt-1 text-sm font-semibold text-fg">{s.label}</div>
                        {s.sublabel && <div className="mt-1 text-xs text-fg-muted">{s.sublabel}</div>}
                    </Card>
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

const LogosBlock = ({ section }: { section: Extract<Section, { type: 'logos' }> }) => {
    const { title, subtitle, items = [] } = section.data
    if (items.length === 0) return null

    if (section.variant === 'scroll') {
        const doubled = [...items, ...items]
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
                            <img
                                key={i}
                                src={logo.src}
                                alt={logo.alt ?? ''}
                                loading="lazy"
                                className="h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                            />
                        ))}
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: '@keyframes logo-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }' }} />
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            {title && <h2 className="text-sm font-semibold tracking-wide uppercase text-fg-muted text-center">{title}</h2>}
            {subtitle && <p className="mt-1 text-fg-soft text-center">{subtitle}</p>}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-6 items-center">
                {items.map((logo, i) => {
                    const img = (
                        <img
                            src={logo.src}
                            alt={logo.alt ?? ''}
                            loading="lazy"
                            className="h-10 w-auto max-w-[140px] object-contain mx-auto opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                        />
                    )
                    return logo.href ? (
                        <a
                            key={i}
                            href={logo.href}
                            target="_blank"
                            rel="noopener noreferrer">
                            {img}
                        </a>
                    ) : (
                        <div key={i}>{img}</div>
                    )
                })}
            </div>
        </section>
    )
}
