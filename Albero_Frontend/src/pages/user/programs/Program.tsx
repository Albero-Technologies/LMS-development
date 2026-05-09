import { useState, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CheckCircle2, Clock, Users, GraduationCap, Sparkles, ArrowRight, Tag, Wallet, Award, Briefcase, Compass } from 'lucide-react'
import { findProgram } from '@/constants/programs'
import EnrollModal from '@/components/user/enroll/EnrollModal'
import { useCollectionItem } from '@/hooks/useContent'
import type { PaymentType } from '@/services/purchaseService'
import { ArmorCodeHero } from '@/components/user/program-page/ArmorCodeHero'
import { StatsBar } from '@/components/user/program-page/StatsBar'
import { ScrollingToolStrip } from '@/components/user/program-page/ScrollingToolStrip'
import { CurriculumAccordion, type CurriculumSection } from '@/components/user/program-page/CurriculumAccordion'
import { MentorStrip } from '@/components/user/program-page/MentorStrip'
import { SuccessStories } from '@/components/user/program-page/SuccessStories'
import { AlumniCompanyWall } from '@/components/user/program-page/AlumniCompanyWall'
import {
    AdvantageGrid,
    WhatYoullLearn,
    IndustryProjects,
    CaseStudies,
    Certifications,
    CareerOutcomes,
    FaqAccordion,
    FinalCTABanner,
    StickyProgramNav
} from '@/components/user/program-page/ProgramSections'
import {
    ARMORCODE_NODES_FOR_PROGRAM,
    CASE_STUDIES_FOR_PROGRAM,
    CERTIFICATIONS_FOR_PROGRAM,
    DEFAULT_ADVANTAGE,
    FAQ_FOR_PROGRAM,
    PROJECTS_FOR_PROGRAM,
    SAMPLE_MENTORS,
    SKILLS_FOR_PROGRAM,
    SUCCESS_STORIES,
    ALUMNI_COMPANIES,
    careerOutcomesFromProgram,
    toolsForProgram
} from '@/constants/program-extras'

// "₹65,000" / "₹1,25,000" → 65000 / 125000 (rupees) → paise. Returns 0 when
// unparsable so the modal falls back to the backend's authoritative price.
const parseRupeeStringToPaise = (priceStr: string | undefined): number => {
    if (!priceStr) return 0
    const digits = priceStr.replace(/[^0-9]/g, '')
    if (!digits) return 0
    const rupees = Number(digits)
    if (!Number.isFinite(rupees)) return 0
    return rupees * 100
}

// CMS overlay — backend wins for marketing-copy fields when populated;
// constants supply the rest. Shipped earlier; kept here unchanged.
type ProgramOverlay = {
    title?: string
    subtitle?: string
    badge?: string
    description?: string
    duration?: string
    mode?: string
    level?: string
    enrollDate?: string
    thumbnail?: string
}

// Sticky-nav anchor map. Keep ids stable across renders so the share-link
// (#curriculum) and pricing scroll behaviour both work first time.
const STICKY_NAV = [
    { id: 'overview', label: 'Overview' },
    { id: 'learn', label: 'What you learn' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'mentors', label: 'Mentors' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQs' }
]

export default function ProgramPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const fallback = slug ? findProgram(slug) : undefined
    const [enrollOpen, setEnrollOpen] = useState(false)

    // Recommended-tier default (Mentor-Led on every program). Picks a sensible
    // mid-priced default when no tier is flagged recommended.
    const recommendedIndex = (() => {
        if (!fallback) return 0
        const idx = fallback.fees.findIndex((t) => t.recommended)
        return idx >= 0 ? idx : Math.min(1, fallback.fees.length - 1)
    })()
    const [selectedTierIdx, setSelectedTierIdx] = useState(recommendedIndex)
    const [paymentIntent, setPaymentIntent] = useState<PaymentType>('REGISTRATION')

    const cmsQuery = useCollectionItem('programs', slug)
    const overlay = (cmsQuery.data?.item.data ?? null) as ProgramOverlay | null

    const program = useMemo(() => {
        if (!fallback) return undefined
        if (!overlay) return fallback
        const pick = <K extends keyof ProgramOverlay>(key: K): string | undefined => {
            const v = overlay[key]
            return typeof v === 'string' && v.trim() ? v : undefined
        }
        return {
            ...fallback,
            title: pick('title') ?? fallback.title,
            subtitle: pick('subtitle') ?? fallback.subtitle,
            badge: pick('badge') ?? fallback.badge,
            description: pick('description') ?? fallback.description,
            duration: pick('duration') ?? fallback.duration,
            mode: pick('mode') ?? fallback.mode,
            level: pick('level') ?? fallback.level,
            enrollDate: pick('enrollDate') ?? fallback.enrollDate
        }
    }, [fallback, overlay])

    if (!program) return <Navigate to="/" replace />

    const Icon = program.icon
    const displayPrice = program.fees[0]?.price
    const selectedTier = program.fees[selectedTierIdx] ?? program.fees[0]
    const selectedTierPaise = parseRupeeStringToPaise(selectedTier?.price)

    const openWith = (intent: PaymentType, tierIdx: number) => {
        setPaymentIntent(intent)
        setSelectedTierIdx(tierIdx)
        setEnrollOpen(true)
    }

    // ──────────────────────────────────────────────────────────────────
    // Per-program data assembly — pulls from constants/program-extras
    // with sensible defaults so a fresh slug never shows empty sections.
    // ──────────────────────────────────────────────────────────────────
    const tools = toolsForProgram(program.tools)
    const armorNodes = ARMORCODE_NODES_FOR_PROGRAM(program.slug)
    const skills = SKILLS_FOR_PROGRAM(program.slug, program.tools)
    const projects = PROJECTS_FOR_PROGRAM(program.slug)
    const caseStudies = CASE_STUDIES_FOR_PROGRAM(program.slug)
    const certifications = CERTIFICATIONS_FOR_PROGRAM(program.slug)
    const stories = SUCCESS_STORIES[program.slug] ?? []
    const faqs = FAQ_FOR_PROGRAM(program.slug)
    const curriculumSections: CurriculumSection[] = program.modules.map((m) => ({
        title: m.title,
        lessons: m.items.map((title, i) => ({
            title,
            // Conservative duration estimate — first lesson per module is a
            // free preview so the share-link experience always has something
            // playable on the public side.
            durationMinutes: 12 + ((i * 7) % 30),
            isFreePreview: i === 0
        }))
    }))

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* ──────────────────────────────────────────────────────────
                1. HERO — title + counsellor side card + ArmorCode canvas
            ────────────────────────────────────────────────────────── */}
            <section id="overview" className="relative pt-[140px] pb-16 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute pointer-events-none rounded-full"
                    style={{
                        top: -240,
                        left: '20%',
                        width: 700,
                        height: 700,
                        background: `radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)`,
                        filter: 'blur(40px)'
                    }}
                />
                <div className="max-w-6xl mx-auto relative z-[1] grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div
                            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-6 text-[12px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <Icon size={14} style={{ color: 'var(--brand)' }} />
                            {program.badge}
                        </div>

                        <h1
                            className="font-display leading-[1.0] tracking-[-0.02em] mb-5"
                            style={{ color: 'var(--text-primary)', fontSize: 'clamp(32px, 6.5vw, 64px)' }}>
                            <span className="font-medium">{program.title}</span>
                            <br />
                            <span className="italic font-light alb-gradient-text">{program.highlight}</span>
                        </h1>

                        <p className="text-[17px] font-medium mb-3" style={{ color: 'var(--brand)' }}>
                            {program.subtitle}
                        </p>
                        <p className="text-[15px] leading-relaxed max-w-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
                            {program.description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <Pill icon={Clock} label={program.duration} />
                            <Pill icon={Users} label={program.mode} />
                            <Pill icon={GraduationCap} label={program.level} />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => openWith('REGISTRATION', selectedTierIdx)}
                                className="px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all hover:translate-y-[-1px]"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                                }}>
                                Reserve Slot · ₹5,000 <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => openWith('FULL', selectedTierIdx)}
                                className="px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all hover:translate-y-[-1px]"
                                style={{
                                    background: 'var(--surface)',
                                    color: 'var(--brand)',
                                    border: '1px solid var(--brand)'
                                }}>
                                Pay Full Fee {selectedTier?.price ? `· ${selectedTier.price}` : ''}
                            </button>
                            <a href="#pricing" className="px-6 py-3 rounded-full font-semibold transition-colors" style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line-strong)' }}>
                                See Pricing
                            </a>
                        </div>

                        {/* Animated stack of tool nodes — sits below the hero copy, above
                            the counsellor card on mobile. Anchors the page visually. */}
                        <div className="hidden md:block mt-10">
                            <ArmorCodeHero nodes={armorNodes} hubLabel={program.title.split(' ')[0]} hubGlyph="✦" height={280} />
                        </div>
                    </motion.div>

                    {/* Counsellor side card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="rounded-2xl p-6 lg:sticky lg:top-[100px]"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow-hover)'
                        }}>
                        <div className="flex items-center gap-2 mb-3 text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
                            <Sparkles size={16} /> {program.enrollDate}
                        </div>
                        <h3 className="font-display text-[20px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Talk to a Counsellor
                        </h3>
                        <p className="text-[14px] mb-5" style={{ color: 'var(--text-secondary)' }}>
                            Quick 15-min call — get program details, eligibility, and fee structure.
                        </p>

                        <div className="space-y-3">
                            {[
                                { ph: 'Full name', t: 'text' },
                                { ph: 'Email', t: 'email' },
                                { ph: 'Phone (WhatsApp)', t: 'tel' }
                            ].map((f) => (
                                <input
                                    key={f.ph}
                                    type={f.t}
                                    placeholder={f.ph}
                                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-colors"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                />
                            ))}
                            <button
                                className="w-full rounded-lg py-2.5 font-semibold text-[14px] transition-all hover:opacity-90"
                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                Request a Callback
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--line)' }}>
                            {program.stats.map((s, i) => (
                                <div key={i}>
                                    <div className="font-display text-[22px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                                        {s.v}
                                    </div>
                                    <div className="text-[10px] tracking-[0.16em] uppercase mt-1.5 font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                                        {s.l}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sticky in-page nav under the hero */}
            <StickyProgramNav items={STICKY_NAV} />

            {/* ──────────────────────────────────────────────────────────
                2. STATS BAR — full-width dark navy w/ count-ups
            ────────────────────────────────────────────────────────── */}
            <StatsBar
                tone="deep"
                stats={[
                    { label: 'Students placed', value: 12400, suffix: '+' },
                    { label: 'Placement rate', value: 92, suffix: '%' },
                    { label: 'Avg salary hike', value: 280, suffix: '%' },
                    { label: 'Hiring partners', value: 180, suffix: '+' }
                ]}
            />

            {/* ──────────────────────────────────────────────────────────
                3. THE ADVANTAGE / WHY US
            ────────────────────────────────────────────────────────── */}
            <AdvantageGrid items={DEFAULT_ADVANTAGE.map((a, i) => ({ ...a, icon: [<Briefcase key="b" size={20} />, <Award key="a" size={20} />, <Compass key="c" size={20} />][i] }))} />

            {/* ──────────────────────────────────────────────────────────
                4. WHAT YOU'LL LEARN — tabbed pill grid
            ────────────────────────────────────────────────────────── */}
            <div id="learn">
                <WhatYoullLearn categories={skills} />
            </div>

            {/* ──────────────────────────────────────────────────────────
                5. CURRICULUM — accordion + share + PDF
            ────────────────────────────────────────────────────────── */}
            <CurriculumAccordion
                sections={curriculumSections}
                programSlug={program.slug}
                syllabusPdfUrl={`/syllabi/${program.slug}.pdf`}
            />

            {/* ──────────────────────────────────────────────────────────
                6. TOOL TICKER STRIP
            ────────────────────────────────────────────────────────── */}
            <ScrollingToolStrip
                tools={tools}
                heading={
                    <>
                        {tools.length}+ industry tools, <span className="alb-gradient-text italic font-medium">woven into every lab.</span>
                    </>
                }
            />

            {/* ──────────────────────────────────────────────────────────
                7. INDUSTRY PROJECTS
            ────────────────────────────────────────────────────────── */}
            <IndustryProjects projects={projects} />

            {/* ──────────────────────────────────────────────────────────
                8. CASE STUDIES
            ────────────────────────────────────────────────────────── */}
            <CaseStudies cases={caseStudies} />

            {/* ──────────────────────────────────────────────────────────
                9. MENTORS / INSTRUCTORS
            ────────────────────────────────────────────────────────── */}
            <div id="mentors">
                <MentorStrip
                    mentors={SAMPLE_MENTORS}
                    stats={[
                        { value: '10+', label: 'Mentors' },
                        { value: '50+', label: 'Yrs experience' },
                        { value: 'Top 1%', label: 'Talent pool' }
                    ]}
                />
            </div>

            {/* ──────────────────────────────────────────────────────────
                10. CERTIFICATIONS
            ────────────────────────────────────────────────────────── */}
            <Certifications certifications={certifications} />

            {/* ──────────────────────────────────────────────────────────
                11. CAREER OUTCOMES + SUCCESS STORIES
            ────────────────────────────────────────────────────────── */}
            <CareerOutcomes outcomes={careerOutcomesFromProgram(program.outcomes)} />
            {stories.length > 0 && <SuccessStories stories={stories} />}

            {/* ──────────────────────────────────────────────────────────
                12. ALUMNI AT COMPANIES
            ────────────────────────────────────────────────────────── */}
            <AlumniCompanyWall companies={ALUMNI_COMPANIES} />

            {/* ──────────────────────────────────────────────────────────
                13. PRICING — existing tier picker (kept for parity with
                    the Razorpay flow shipped earlier)
            ────────────────────────────────────────────────────────── */}
            <section id="pricing" className="px-5 md:px-8 py-20 md:py-24 scroll-mt-24" style={{ background: 'var(--surface)' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <div
                            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-4 text-[12px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <Tag size={14} style={{ color: 'var(--brand)' }} />
                            Course Investment
                        </div>
                        <h2
                            className="font-display tracking-[-0.02em] mb-3 font-semibold"
                            style={{ color: 'var(--text-primary)', fontSize: 'clamp(28px, 5vw, 48px)' }}>
                            Choose your <span className="alb-gradient-text italic font-medium">plan.</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Reserve your seat with a small registration fee, or pay the full course fee in one go.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {program.fees.map((tier, i) => {
                            const isSelected = i === selectedTierIdx
                            const recommended = !!tier.recommended
                            return (
                                <button
                                    key={tier.plan}
                                    type="button"
                                    onClick={() => setSelectedTierIdx(i)}
                                    className="text-left rounded-2xl p-6 transition-all relative"
                                    style={{
                                        background: isSelected ? 'var(--brand-soft)' : 'var(--surface)',
                                        border: `1px solid ${isSelected ? 'var(--brand)' : 'var(--line)'}`,
                                        boxShadow: isSelected ? 'var(--card-shadow-hover)' : 'var(--card-shadow-soft)'
                                    }}>
                                    {recommended && (
                                        <div
                                            className="absolute -top-3 left-6 text-[10px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
                                            style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                            Recommended
                                        </div>
                                    )}
                                    <div className="text-[11px] font-bold tracking-[0.16em] uppercase mb-2" style={{ color: 'var(--brand)' }}>
                                        {tier.plan}
                                    </div>
                                    <div className="font-display text-[32px] font-semibold leading-none mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {tier.price}
                                    </div>
                                    {tier.emi && (
                                        <div className="text-[12.5px] font-semibold mb-4" style={{ color: 'var(--text-tertiary)' }}>
                                            or {tier.emi} on EMI · GST extra
                                        </div>
                                    )}
                                    <ul className="space-y-2 mt-4">
                                        {tier.features.map((f, j) => (
                                            <li key={j} className="flex items-start gap-2 text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
                                                <CheckCircle2 size={14} className="flex-shrink-0 mt-1" style={{ color: 'var(--brand)' }} />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div
                                        className="mt-5 inline-flex items-center gap-2 text-[12.5px] font-semibold"
                                        style={{ color: isSelected ? 'var(--brand)' : 'var(--text-tertiary)' }}>
                                        {isSelected ? (
                                            <>
                                                <CheckCircle2 size={14} /> Selected
                                            </>
                                        ) : (
                                            'Tap to select'
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {selectedTier && (
                        <div
                            className="rounded-3xl p-6 md:p-8 grid lg:grid-cols-[1fr_auto] gap-6 items-center"
                            style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow-soft)' }}>
                            <div>
                                <div
                                    className="inline-flex items-center gap-2 py-1 px-2.5 rounded-full mb-3 text-[10.5px] font-bold tracking-[0.16em] uppercase"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <Wallet size={12} />
                                    Reserve your spot
                                </div>
                                <h3 className="font-display text-[22px] md:text-[26px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Lock {selectedTier.plan} for ₹5,000 today
                                </h3>
                                <p className="text-[14px] mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    Pay a flat ₹5,000 registration fee to reserve your seat for the next batch ({program.enrollDate ?? 'upcoming cohort'}).
                                </p>
                                <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                                    Balance of <strong style={{ color: 'var(--text-secondary)' }}>{selectedTier.price}</strong> can be paid before the course starts — or pay the full amount now and skip the follow-up.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 min-w-[260px]">
                                <button
                                    onClick={() => openWith('REGISTRATION', selectedTierIdx)}
                                    className="w-full px-6 py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
                                    style={{
                                        background: 'var(--brand)',
                                        color: 'var(--text-on-inverse)',
                                        boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                                    }}>
                                    <Wallet size={15} /> Reserve seat · ₹5,000
                                </button>
                                <button
                                    onClick={() => openWith('FULL', selectedTierIdx)}
                                    className="w-full px-6 py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
                                    style={{
                                        background: 'var(--surface)',
                                        color: 'var(--brand)',
                                        border: '1px solid var(--brand)'
                                    }}>
                                    Pay full fee · {selectedTier.price}
                                </button>
                                <span className="text-[11.5px] text-center" style={{ color: 'var(--text-tertiary)' }}>
                                    Secure payments via Razorpay · GST applicable at checkout
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ──────────────────────────────────────────────────────────
                14. FAQ
            ────────────────────────────────────────────────────────── */}
            <div id="faq">
                <FaqAccordion items={faqs} />
            </div>

            {/* ──────────────────────────────────────────────────────────
                15. FINAL CTA BANNER
            ────────────────────────────────────────────────────────── */}
            <FinalCTABanner
                heading="Ready to start your"
                accent="journey?"
                description="Talk to a counsellor today. We'll help you pick the right plan, batch, and learning path for your goals."
                primaryLabel="Book a Free 1:1 Call"
                primaryHref="/contact"
                secondaryLabel="See Pricing"
                secondaryHref="#pricing"
                nextBatchDate={program.enrollDate?.replace('Next batch:', '').trim()}
            />

            <EnrollModal
                open={enrollOpen}
                onClose={() => setEnrollOpen(false)}
                courseSlug={program.slug}
                courseTitle={program.title}
                displayPrice={displayPrice}
                defaultPaymentType={paymentIntent}
                tierKey={selectedTier ? selectedTier.plan.toLowerCase().replace(/\s+/g, '-') : undefined}
                tierLabel={selectedTier ? `${selectedTier.plan} · ${selectedTier.price}` : undefined}
                tierPriceMinor={selectedTierPaise || undefined}
            />

            {/* Floating "Talk to us" button — mobile only since the sidebar form
                is already visible on larger screens. */}
            <button
                onClick={() => navigate('/contact')}
                className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
                style={{ background: 'var(--gradient-aurora)', color: '#fff' }}
                aria-label="Talk to a counsellor">
                <Compass size={22} />
            </button>
        </div>
    )
}

function Pill({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; label: string }) {
    return (
        <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13.5px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
            <Icon size={14} style={{ color: 'var(--brand)' }} />
            {label}
        </div>
    )
}
