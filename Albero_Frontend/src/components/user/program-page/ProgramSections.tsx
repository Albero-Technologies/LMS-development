import { useMemo, useState } from 'react'
import { Award, BadgeCheck, ArrowRight, Brain, Cog, Compass, Handshake, Sparkles, Target, Trophy, TrendingUp, Wrench, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionShell, SectionHeading, GradientIcon } from './primitives'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { CompanyMark } from './CompanyMark'
import { resolveCompanyMark } from './company-marks'
import { findCaseStudy } from '@/constants/case-study-content'

// ──────────────────────────────────────────────────────────────────────
// Three-column "Why Us" / Advantage grid
// ──────────────────────────────────────────────────────────────────────

export interface AdvantageItem {
    title: string
    description: string
    icon?: React.ReactNode
}

export const AdvantageGrid = ({
    items,
    heading = (
        <>
            The Albero <span className="alb-gradient-text italic font-medium">advantage.</span>
        </>
    ),
    description = "What you actually get when you sign up — beyond the lecture videos."
}: {
    items: AdvantageItem[]
    heading?: React.ReactNode
    description?: string
}) => {
    if (items.length === 0) return null
    return (
        <SectionShell tone="white" spacing="normal">
            <SectionHeading eyebrow="Why us" title={heading} description={description} />
            <div className="grid md:grid-cols-3 gap-5">
                {items.map((item, i) => (
                    <AdvantageCard key={item.title} item={item} delayMs={i * 80} />
                ))}
            </div>
        </SectionShell>
    )
}

const AdvantageCard = ({ item, delayMs }: { item: AdvantageItem; delayMs: number }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    return (
        <div
            ref={ref}
            className="rounded-2xl p-6 transition-all duration-[600ms] ease-out hover:translate-y-[-4px]"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delayMs}ms`
            }}>
            <GradientIcon size={48}>{item.icon ?? <Sparkles size={20} />}</GradientIcon>
            <h3 className="font-display text-[18px] font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
                {item.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.description}
            </p>
        </div>
    )
}

// ──────────────────────────────────────────────────────────────────────
// What You'll Learn — tabbed pill grid
// ──────────────────────────────────────────────────────────────────────

export interface SkillCategory {
    category: string
    items: string[]
}

// Premium revamp — Outcomes section reads as a curated skill catalogue
// instead of a tabbed pill cloud. Lucide SVG icons replace the previous
// emoji glyphs (which rendered inconsistently across OS/browser fonts).
//
// Per-category meta carries:
//   - The Lucide icon (vector — looks identical on every device)
//   - A brand-aligned tone used for the active tab fill, the icon chip
//     tint, and the skill-card accent. Each category has its own colour
//     so the section reads as a multi-track catalogue at a glance.

interface CategoryMeta {
    Icon: LucideIcon
    color: string
}

const CATEGORY_META: Record<string, CategoryMeta> = {
    Tools:           { Icon: Wrench, color: '#14785f' },     // emerald — anchors the brand
    Concepts:        { Icon: Brain, color: '#7c3aed' },      // violet — "thinking"
    'Soft skills':   { Icon: Handshake, color: '#b86a18' },  // amber — "people"
    Foundations:     { Icon: Compass, color: '#0891b2' },    // cyan — "direction"
    'System design': { Icon: Cog, color: '#dc2626' }         // red — "engineering"
}

const FALLBACK_META: CategoryMeta = { Icon: Sparkles, color: '#14785f' }
const metaFor = (category: string): CategoryMeta => CATEGORY_META[category] ?? FALLBACK_META

export const WhatYoullLearn = ({
    categories,
    heading = (
        <>
            What you'll <span className="alb-gradient-text italic font-medium">actually learn.</span>
        </>
    ),
    description = 'Tools, concepts, and the soft skills that round out the package.'
}: {
    categories: SkillCategory[]
    heading?: React.ReactNode
    description?: string
}) => {
    const [active, setActive] = useState(0)
    if (categories.length === 0) return null
    const current = categories[active]!
    const currentMeta = metaFor(current.category)
    return (
        <section className="relative overflow-hidden py-20 md:py-28 px-5 md:px-8" style={{ background: 'var(--section-soft)' }}>
            {/* Decorative orbs — colour-shifted to track the active tab so
                the section feels reactive instead of static decoration. */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full transition-[background] duration-700"
                style={{
                    top: -120,
                    left: '8%',
                    width: 320,
                    height: 320,
                    background: `radial-gradient(circle, ${currentMeta.color}22 0%, transparent 70%)`,
                    filter: 'blur(60px)'
                }}
            />
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full"
                style={{
                    bottom: -160,
                    right: '4%',
                    width: 380,
                    height: 380,
                    background: 'radial-gradient(circle, rgba(13,79,60,0.10) 0%, transparent 70%)',
                    filter: 'blur(70px)'
                }}
            />

            <div className="relative max-w-5xl mx-auto">
                <SectionHeading eyebrow="Outcomes" title={heading} description={description} />

                {/* Tab row — Lucide icon in a tinted chip, label, count
                    badge. Active tab fills with the category's own colour
                    so each tab feels like its own track, not a shared
                    brand wash. */}
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-10 flex-wrap">
                    {categories.map((c, i) => {
                        const isActive = i === active
                        const meta = metaFor(c.category)
                        const Icon = meta.Icon
                        return (
                            <button
                                key={c.category}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setActive(i)}
                                className="group inline-flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full text-[13.5px] font-semibold transition-all"
                                style={{
                                    background: isActive
                                        ? `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 100%)`
                                        : 'var(--surface)',
                                    color: isActive ? '#fff' : 'var(--text-primary)',
                                    border: `1px solid ${isActive ? 'transparent' : 'var(--hairline)'}`,
                                    boxShadow: isActive
                                        ? `0 8px 22px ${meta.color}40, inset 0 1px 0 rgba(255,255,255,0.18)`
                                        : 'var(--card-shadow-soft)',
                                    transform: isActive ? 'translateY(-1px)' : 'none'
                                }}>
                                <span
                                    aria-hidden="true"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors"
                                    style={{
                                        background: isActive ? 'rgba(255,255,255,0.22)' : `${meta.color}14`,
                                        color: isActive ? '#fff' : meta.color
                                    }}>
                                    <Icon size={14} strokeWidth={2.4} />
                                </span>
                                <span>{c.category}</span>
                                <span
                                    className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold"
                                    style={{
                                        background: isActive ? 'rgba(255,255,255,0.22)' : 'var(--section-soft)',
                                        color: isActive ? '#fff' : 'var(--text-tertiary)'
                                    }}>
                                    {c.items.length}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Skill cards grid — keyed by `current.category` so React
                    remounts on tab change and replays the entrance animation. */}
                <div key={current.category} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {current.items.map((item, i) => (
                        <SkillCard
                            key={`${current.category}-${item}`}
                            label={item}
                            index={i}
                            categoryLabel={current.category}
                            meta={currentMeta}
                        />
                    ))}
                </div>

                <p className="mt-10 text-center text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
                    {current.items.length} {current.category.toLowerCase()} you'll touch — and many more reviewed in 1:1 mentor sessions.
                </p>
            </div>
        </section>
    )
}

const SkillCard = ({
    label,
    index,
    categoryLabel,
    meta
}: {
    label: string
    index: number
    categoryLabel: string
    meta: CategoryMeta
}) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.15)
    const Icon = meta.Icon
    return (
        <div
            ref={ref}
            className="group relative rounded-2xl px-4 py-4 transition-all duration-[500ms] ease-out hover:translate-y-[-3px] overflow-hidden"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transitionDelay: `${Math.min(index * 50, 250)}ms`
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${meta.color}66`
                e.currentTarget.style.boxShadow = `var(--card-shadow-hover), 0 0 0 4px ${meta.color}1a`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow-soft)'
            }}>
            {/* Category-coloured ribbon along the top — solid, always
                visible, anchors the card to its track at a glance. */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}66)` }}
            />
            <div className="flex items-start gap-3">
                {/* Category SVG icon chip — replaces the previous emoji
                    badge so the card reads cleanly across every OS. */}
                <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                    style={{ background: `${meta.color}14`, color: meta.color }}>
                    <Icon size={16} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span
                            className="font-mono text-[10px] font-bold tracking-wide"
                            style={{ color: 'var(--text-tertiary)' }}>
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                            className="text-[9.5px] uppercase tracking-[0.14em] font-bold"
                            style={{ color: meta.color }}>
                            {categoryLabel}
                        </span>
                    </div>
                    <div className="mt-1 text-[14px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {label}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────────────────────────
// Industry Projects — tagged cards
// ──────────────────────────────────────────────────────────────────────

export interface IndustryProject {
    title: string
    tag: string
    description: string
    techStack?: string[]
    /** Tag chip colour — defaults to brand. */
    color?: string
}

export const IndustryProjects = ({
    projects,
    heading = (
        <>
            Industry <span className="alb-gradient-text italic font-medium">projects.</span>
        </>
    ),
    description = 'Capstones built on real datasets — graded on craft, not completion.'
}: {
    projects: IndustryProject[]
    heading?: React.ReactNode
    description?: string
}) => {
    if (projects.length === 0) return null
    return (
        <SectionShell tone="white" spacing="normal">
            <SectionHeading eyebrow="Real-world projects" title={heading} description={description} />
            <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2">
                {projects.map((p, i) => (
                    <ProjectCard key={p.title} project={p} delayMs={i * 80} />
                ))}
            </div>
        </SectionShell>
    )
}

const ProjectCard = ({ project, delayMs }: { project: IndustryProject; delayMs: number }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    const color = project.color ?? '#5b3fd6'
    return (
        <article
            ref={ref}
            className="snap-start shrink-0 w-[80%] sm:w-[60%] md:w-auto rounded-2xl p-5 transition-all duration-[600ms] ease-out hover:translate-y-[-4px]"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delayMs}ms`
            }}>
            <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                style={{ background: `${color}1f`, color }}>
                {project.tag}
            </span>
            <h3 className="font-display text-[17px] font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>
                {project.title}
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {project.description}
            </p>
            {project.techStack && project.techStack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.techStack.map((t) => (
                        <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[11px]"
                            style={{ background: 'var(--section-soft)', color: 'var(--text-tertiary)', border: '1px solid var(--hairline)' }}>
                            {t}
                        </span>
                    ))}
                </div>
            )}
        </article>
    )
}

// ──────────────────────────────────────────────────────────────────────
// Case Studies — 2-column problem / approach / outcome
// ──────────────────────────────────────────────────────────────────────

export interface CaseStudy {
    company: string
    companyLogoUrl?: string
    problem: string
    approach: string
    outcomeMetric: string
    outcomeDetail?: string
}

// Resolve a case-study deep-link from a free-text company name. When the
// company has a published case study in the constants library we link
// directly to its detail page; otherwise we fall back to the hub so the
// CTA is never a dead-end.
const slugForCompany = (company: string): string => company.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const caseStudyHrefFor = (company: string): string => {
    const slug = slugForCompany(company)
    return findCaseStudy(slug) ? `/resources/case-studies/${slug}` : '/resources/case-studies'
}

export const CaseStudies = ({
    cases,
    heading = (
        <>
            Case studies you'll <span className="alb-gradient-text italic font-medium">work on.</span>
        </>
    ),
    description = 'Same problems hiring managers ask about in interviews. We walk every step with you.'
}: {
    cases: CaseStudy[]
    heading?: React.ReactNode
    description?: string
}) => {
    if (cases.length === 0) return null
    return (
        <SectionShell tone="soft" spacing="normal">
            <SectionHeading eyebrow="Case studies" title={heading} description={description} />
            <div className="grid md:grid-cols-2 gap-5">
                {cases.map((c, i) => (
                    <CaseStudyCard key={c.company + i} study={c} delayMs={i * 100} />
                ))}
            </div>
        </SectionShell>
    )
}

const CaseStudyCard = ({ study, delayMs }: { study: CaseStudy; delayMs: number }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    const { color, sector } = resolveCompanyMark(study.company)
    const href = caseStudyHrefFor(study.company)
    return (
        <article
            ref={ref}
            className="group relative rounded-2xl overflow-hidden transition-all duration-[600ms] ease-out hover:translate-y-[-4px]"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delayMs}ms`
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}66`
                e.currentTarget.style.boxShadow = `var(--card-shadow-hover), 0 0 0 4px ${color}1a`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)'
                e.currentTarget.style.boxShadow = 'var(--card-shadow-soft)'
            }}>
            {/* Brand-coloured ribbon — anchors each card to the company. */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
            />

            <div className="p-6 md:p-7">
                <header className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                        {study.companyLogoUrl ? (
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-white"
                                style={{ border: '1px solid var(--hairline)' }}>
                                <img src={study.companyLogoUrl} alt={study.company} className="w-7 h-7 object-contain" loading="lazy" />
                            </div>
                        ) : (
                            <CompanyMark name={study.company} size={48} />
                        )}
                        <div className="min-w-0">
                            <h3 className="font-display text-[18px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                {study.company}
                            </h3>
                            {sector && (
                                <span
                                    className="mt-1 inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[9.5px] font-bold tracking-[0.12em] uppercase"
                                    style={{ color, background: `${color}14` }}>
                                    <span className="inline-block w-1 h-1 rounded-full" style={{ background: color }} />
                                    {sector}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Outcome chip up top — the metric is the headline and
                        deserves to read at-a-glance, not buried at the bottom. */}
                    <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <TrendingUp size={11} /> {study.outcomeMetric}
                    </span>
                </header>

                {/* Problem + Approach as label-on-top rows. Same shape as
                    before, dialled visually so the body reads as a story. */}
                <CaseRow label="Problem" body={study.problem} accent={color} />
                <CaseRow label="Approach" body={study.approach} accent={color} />

                {/* Outcome callout — visual headline, brand-coloured tile. */}
                <div
                    className="mt-5 rounded-xl p-4 flex items-start gap-3"
                    style={{ background: `${color}0d`, border: `1px solid ${color}33` }}>
                    <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${color}1f`, color }}>
                        <Sparkles size={16} />
                    </span>
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-0.5" style={{ color }}>
                            Outcome
                        </div>
                        <div className="font-display text-[20px] md:text-[22px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {study.outcomeMetric}
                        </div>
                        {study.outcomeDetail && (
                            <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {study.outcomeDetail}
                            </p>
                        )}
                    </div>
                </div>

                {/* See more — deep-links to the case-study detail page when
                    one exists; otherwise opens the hub so the CTA never
                    dead-ends. */}
                <Link
                    to={href}
                    className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold w-full transition-all hover:translate-y-[-1px]"
                    style={{
                        background: 'var(--surface-2)',
                        color,
                        border: `1px solid ${color}33`
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${color}14`
                        e.currentTarget.style.borderColor = `${color}66`
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--surface-2)'
                        e.currentTarget.style.borderColor = `${color}33`
                    }}>
                    See full case study <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </article>
    )
}

const CaseRow = ({ label, body, accent }: { label: string; body: string; accent: string }) => (
    <div className="mt-4 first:mt-0">
        <div
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5"
            style={{ color: 'var(--text-tertiary)' }}>
            <span className="inline-block w-1 h-1 rounded-full" style={{ background: accent }} />
            {label}
        </div>
        <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {body}
        </p>
    </div>
)

// ──────────────────────────────────────────────────────────────────────
// Certifications — logo grid
// ──────────────────────────────────────────────────────────────────────

export interface Certification {
    name: string
    description: string
    logoUrl?: string
}

export const Certifications = ({
    certifications,
    heading = (
        <>
            Industry-recognised <span className="alb-gradient-text italic font-medium">certifications.</span>
        </>
    ),
    description = "Stack badges that signal credibility — Microsoft, IBM, NSDC, J.P. Morgan."
}: {
    certifications: Certification[]
    heading?: React.ReactNode
    description?: string
}) => {
    if (certifications.length === 0) return null
    return (
        <SectionShell tone="white" spacing="normal">
            <SectionHeading eyebrow="Certifications" title={heading} description={description} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certifications.map((c, i) => (
                    <CertCard key={c.name} cert={c} delayMs={i * 60} />
                ))}
            </div>
        </SectionShell>
    )
}

const CertCard = ({ cert, delayMs }: { cert: Certification; delayMs: number }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    return (
        <div
            ref={ref}
            className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-[600ms] ease-out hover:translate-y-[-3px]"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delayMs}ms`
            }}>
            <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--section-soft)', border: '1px solid var(--hairline)' }}>
                {cert.logoUrl ? (
                    <img src={cert.logoUrl} alt={cert.name} className="max-w-9 max-h-9 object-contain" loading="lazy" />
                ) : (
                    <BadgeCheck size={18} style={{ color: 'var(--brand)' }} />
                )}
            </div>
            <div className="min-w-0">
                <h3 className="font-display text-[15.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {cert.name}
                </h3>
                <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {cert.description}
                </p>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────────────────────────
// Career Outcomes — role + salary range cards
// ──────────────────────────────────────────────────────────────────────

export interface CareerOutcome {
    role: string
    salary?: string
    companies?: string[]
}

export const CareerOutcomes = ({
    outcomes,
    heading = (
        <>
            Roles you'll be <span className="alb-gradient-text italic font-medium">ready for.</span>
        </>
    ),
    description = 'Realistic salary ranges from market data — not optimistic averages.'
}: {
    outcomes: CareerOutcome[]
    heading?: React.ReactNode
    description?: string
}) => {
    if (outcomes.length === 0) return null
    return (
        <SectionShell tone="soft" spacing="normal">
            <SectionHeading eyebrow="Career outcomes" title={heading} description={description} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {outcomes.map((o, i) => (
                    <OutcomeCard key={o.role} outcome={o} delayMs={i * 80} />
                ))}
            </div>
        </SectionShell>
    )
}

const OutcomeCard = ({ outcome, delayMs }: { outcome: CareerOutcome; delayMs: number }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    return (
        <div
            ref={ref}
            className="rounded-2xl p-6 transition-all duration-[600ms] ease-out hover:translate-y-[-4px]"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delayMs}ms`
            }}>
            <Trophy size={20} style={{ color: 'var(--brand)' }} />
            <h3 className="font-display text-[17px] font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>
                {outcome.role}
            </h3>
            {outcome.salary && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: 'var(--brand)' }}>
                    <Target size={13} /> {outcome.salary}
                </div>
            )}
            {outcome.companies && outcome.companies.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {outcome.companies.map((c) => (
                        <span
                            key={c}
                            className="px-2 py-0.5 rounded-md text-[12px]"
                            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--hairline)' }}>
                            {c}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

// ──────────────────────────────────────────────────────────────────────
// Final CTA banner
// ──────────────────────────────────────────────────────────────────────

interface FinalCTAProps {
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    primaryLabel: string
    primaryHref?: string
    primaryOnClick?: () => void
    secondaryLabel?: string
    secondaryHref?: string
    secondaryOnClick?: () => void
    nextBatchDate?: string
}

export const FinalCTABanner = ({
    heading = "Ready to transform your",
    accent = 'career?',
    description,
    primaryLabel,
    primaryHref,
    primaryOnClick,
    secondaryLabel,
    secondaryHref,
    secondaryOnClick,
    nextBatchDate
}: FinalCTAProps) => {
    return (
        <section className="px-5 md:px-8 py-20 md:py-24" style={{ background: 'var(--gradient-aurora)', color: '#fff' }}>
            <div className="max-w-4xl mx-auto text-center">
                {nextBatchDate && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold mb-6"
                         style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>
                        <Award size={13} /> Next batch starts {nextBatchDate}
                    </div>
                )}
                <h2
                    className="font-display tracking-[-0.02em] leading-[1.05] font-semibold"
                    style={{ fontSize: 'clamp(28px, 5.4vw, 52px)' }}>
                    {heading} <span className="italic font-medium" style={{ color: '#a7f3d0' }}>{accent}</span>
                </h2>
                {description && (
                    <p className="mt-4 text-[15px] md:text-[17px] leading-relaxed text-white/85 max-w-2xl mx-auto">
                        {description}
                    </p>
                )}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <CTAButton
                        label={primaryLabel}
                        href={primaryHref}
                        onClick={primaryOnClick}
                        primary
                    />
                    {secondaryLabel && (
                        <CTAButton
                            label={secondaryLabel}
                            href={secondaryHref}
                            onClick={secondaryOnClick}
                        />
                    )}
                </div>
            </div>
        </section>
    )
}

const CTAButton = ({ label, href, onClick, primary }: { label: string; href?: string; onClick?: () => void; primary?: boolean }) => {
    const className = 'inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[14.5px] transition-all hover:translate-y-[-2px] active:scale-[0.98]'
    const style: React.CSSProperties = primary
        ? { background: '#fff', color: '#0a0f1e', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }
        : { background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
    if (href) {
        return (
            <a href={href} className={className} style={style}>
                {label} <ArrowRight size={15} />
            </a>
        )
    }
    return (
        <button type="button" onClick={onClick} className={className} style={style}>
            {label} <ArrowRight size={15} />
        </button>
    )
}

// ──────────────────────────────────────────────────────────────────────
// FAQ accordion
// ──────────────────────────────────────────────────────────────────────

export interface FaqItem {
    question: string
    answer: string
}

export const FaqAccordion = ({
    items,
    heading = (
        <>
            Frequently asked <span className="alb-gradient-text italic font-medium">questions.</span>
        </>
    ),
    description
}: {
    items: FaqItem[]
    heading?: React.ReactNode
    description?: string
}) => {
    const [openIndex, setOpenIndex] = useState<number>(0)
    if (items.length === 0) return null
    return (
        <SectionShell tone="white" spacing="normal">
            <SectionHeading eyebrow="FAQs" title={heading} description={description} />
            <ul className="space-y-3 max-w-3xl mx-auto">
                {items.map((item, i) => (
                    <FaqRow key={`${item.question}-${i}`} item={item} open={openIndex === i} onToggle={() => setOpenIndex((c) => (c === i ? -1 : i))} />
                ))}
            </ul>
        </SectionShell>
    )
}

const FaqRow = ({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) => {
    return (
        <li
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: open ? 'var(--card-shadow-soft)' : 'none',
                transition: 'box-shadow 0.3s ease'
            }}>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="w-full flex items-start gap-4 px-5 md:px-6 py-4 text-left"
                style={{ minHeight: 56 }}>
                <span className="flex-1 font-display text-[15.5px] md:text-[16.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {item.question}
                </span>
                <span
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform"
                    style={{
                        background: 'var(--brand-soft)',
                        color: 'var(--brand)',
                        transform: open ? 'rotate(45deg)' : 'rotate(0)'
                    }}>
                    <span className="text-[16px] leading-none">+</span>
                </span>
            </button>
            <div className="alb-accordion-body" data-open={open ? 'true' : 'false'}>
                <p className="px-5 md:px-6 pb-5 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {item.answer}
                </p>
            </div>
        </li>
    )
}

// Sticky in-page nav under the hero. Theme-aware via the .alb-sticky-nav
// CSS class (defined in index.css) so the bg + text + hover states adapt
// to dark mode automatically — the previous hardcoded white background
// rendered as light-grey-on-light-grey when the user toggled the theme.
export const StickyProgramNav = ({ items }: { items: { id: string; label: string }[] }) => {
    const labels = useMemo(() => items, [items])
    return (
        <nav className="alb-sticky-nav sticky top-[72px] z-30 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5">
                {labels.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="alb-sticky-nav__link px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-colors">
                        {item.label}
                    </a>
                ))}
            </div>
        </nav>
    )
}
