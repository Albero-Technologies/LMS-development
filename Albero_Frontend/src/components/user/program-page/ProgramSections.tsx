import { useMemo, useState } from 'react'
import { Award, BadgeCheck, ArrowRight, Briefcase, Sparkles, Target, Trophy } from 'lucide-react'
import { SectionShell, SectionHeading, GradientIcon } from './primitives'
import { useScrollReveal } from '@/hooks/useScrollReveal'

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
// instead of a tabbed pill cloud. Pieces:
//   - Eyebrow chip with pulsing brand dot (matches the Industry Tools chip)
//   - Tabs are larger card-style buttons with a count badge per category
//   - Active tab gets a brand-gradient fill + glow
//   - Skills render as glass cards (icon + label + numbered chip) in a
//     responsive grid — replaces the old text-only pill cloud
//   - Soft tinted background + brand gradient orbs for depth
const SKILL_TAB_ICONS: Record<string, string> = {
    Tools: '🛠',
    Concepts: '🧠',
    'Soft skills': '🤝',
    Foundations: '🎯',
    'System design': '⚙️'
}

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
    const current = categories[active]
    return (
        <section className="relative overflow-hidden py-20 md:py-28 px-5 md:px-8" style={{ background: 'var(--section-soft)' }}>
            {/* Two soft brand-tinted orbs for depth — pure decoration. */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full"
                style={{
                    top: -120,
                    left: '8%',
                    width: 320,
                    height: 320,
                    background: 'radial-gradient(circle, rgba(13,79,60,0.12) 0%, transparent 70%)',
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
                    background: 'radial-gradient(circle, rgba(184,106,24,0.1) 0%, transparent 70%)',
                    filter: 'blur(70px)'
                }}
            />

            <div className="relative max-w-5xl mx-auto">
                <SectionHeading eyebrow="Outcomes" title={heading} description={description} />

                {/* Premium tab pill row — bigger, with icons + per-tab counts. */}
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-10 flex-wrap">
                    {categories.map((c, i) => {
                        const isActive = i === active
                        return (
                            <button
                                key={c.category}
                                type="button"
                                onClick={() => setActive(i)}
                                className="group inline-flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full text-[13.5px] font-semibold transition-all"
                                style={{
                                    background: isActive ? 'var(--gradient-aurora)' : 'var(--surface)',
                                    color: isActive ? '#fff' : 'var(--text-primary)',
                                    border: `1px solid ${isActive ? 'transparent' : 'var(--hairline)'}`,
                                    boxShadow: isActive ? 'var(--glow-brand)' : 'var(--card-shadow-soft)',
                                    transform: isActive ? 'translateY(-1px)' : 'none'
                                }}>
                                <span aria-hidden="true" className="text-base leading-none">
                                    {SKILL_TAB_ICONS[c.category] ?? '✦'}
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
                        <SkillCard key={`${current.category}-${item}`} label={item} index={i} categoryLabel={current.category} />
                    ))}
                </div>

                {/* Footer caption — gives the section a clean close + a tiny
                    callout that the catalogue is curated, not exhaustive. */}
                <p className="mt-10 text-center text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
                    {current.items.length} {current.category.toLowerCase()} you'll touch — and many more reviewed in 1:1 mentor sessions.
                </p>
            </div>
        </section>
    )
}

const SkillCard = ({ label, index, categoryLabel }: { label: string; index: number; categoryLabel: string }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.15)
    return (
        <div
            ref={ref}
            className="group relative rounded-2xl px-4 py-4 transition-all duration-[500ms] ease-out hover:translate-y-[-3px]"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--card-shadow-soft)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transitionDelay: `${Math.min(index * 50, 250)}ms`
            }}>
            {/* Subtle gradient ribbon along the top — appears on hover for
                a tactile "card lights up" effect. */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--gradient-aurora)' }}
            />
            <div className="flex items-start gap-3">
                <span
                    className="inline-flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded-lg text-[10.5px] font-bold tracking-wide font-mono shrink-0"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {label}
                    </div>
                    <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.14em] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                        {categoryLabel}
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
    return (
        <article
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
            <header className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--section-soft)', border: '1px solid var(--hairline)' }}>
                    {study.companyLogoUrl ? (
                        <img src={study.companyLogoUrl} alt={study.company} className="max-w-7 max-h-7 object-contain" loading="lazy" />
                    ) : (
                        <Briefcase size={16} style={{ color: 'var(--brand)' }} />
                    )}
                </div>
                <span className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {study.company}
                </span>
            </header>
            <CaseRow label="Problem" body={study.problem} />
            <CaseRow label="Approach" body={study.approach} />
            <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--hairline)' }}>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--brand)' }}>
                    Outcome
                </div>
                <div className="font-display text-[22px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                    {study.outcomeMetric}
                </div>
                {study.outcomeDetail && (
                    <p className="mt-1.5 text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
                        {study.outcomeDetail}
                    </p>
                )}
            </div>
        </article>
    )
}

const CaseRow = ({ label, body }: { label: string; body: string }) => (
    <div className="mt-3 first:mt-0">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--text-tertiary)' }}>
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
