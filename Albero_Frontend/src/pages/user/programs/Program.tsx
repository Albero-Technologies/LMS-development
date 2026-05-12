import { useState, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Clock, Users, GraduationCap, Sparkles, ArrowRight, Award, Briefcase, Compass } from 'lucide-react'
import { findProgram } from '@/constants/programs'
import SEO from '@/components/user/common/SEO'
import StructuredData, { buildDetailBreadcrumbs } from '@/components/user/common/StructuredData'
import { buildProgramSEO } from '@/constants/seo'
import EnrollModal from '@/components/user/enroll/EnrollModal'
import { sendLeadForm } from '@/services/contactService'
import { showError, showSuccess } from '@/lib/toast'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useCollectionItem } from '@/hooks/useContent'
import type { PaymentType } from '@/services/purchaseService'
import { TechMeshSection } from '@/components/user/program-page/TechMeshSection'
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
    { id: 'faq', label: 'FAQs' }
]

export default function ProgramPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const fallback = slug ? findProgram(slug) : undefined
    const [enrollOpen, setEnrollOpen] = useState(false)
    const [callbackForm, setCallbackForm] = useState({ name: '', email: '', phone: '' })
    const [callbackLoading, setCallbackLoading] = useState(false)
    const [callbackSent, setCallbackSent] = useState(false)

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

    if (!program)
        return (
            <Navigate
                to="/"
                replace
            />
        )

    const Icon = program.icon
    const displayPrice = program.fees[0]?.price
    const selectedTier = program.fees[selectedTierIdx] ?? program.fees[0]
    const selectedTierPaise = parseRupeeStringToPaise(selectedTier?.price)

    const openWith = (intent: PaymentType, tierIdx: number) => {
        setPaymentIntent(intent)
        setSelectedTierIdx(tierIdx)
        setEnrollOpen(true)
    }

    const submitCallback = async (e: React.FormEvent) => {
        e.preventDefault()
        if (callbackLoading) return
        if (!callbackForm.name.trim() || !callbackForm.email.trim() || !callbackForm.phone.trim()) {
            showError('Please fill in all the fields.')
            return
        }
        setCallbackLoading(true)
        try {
            await sendLeadForm({
                name: callbackForm.name.trim(),
                email: callbackForm.email.trim(),
                phone: callbackForm.phone.trim(),
                course: `${program.title} ${program.highlight}`.trim(),
                surface: 'callback-program-card'
            })
            setCallbackSent(true)
            showSuccess('Callback request received — a counsellor will reach out shortly.')
        } catch (err) {
            const message =
                typeof err === 'object' && err !== null && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined
            showError(message || 'Could not submit your request — please try again.')
        } finally {
            setCallbackLoading(false)
        }
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

    const seo = buildProgramSEO(program.slug, `${program.title} ${program.highlight}`.trim(), program.description)
    const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: `${program.title} ${program.highlight}`.trim(),
        description: program.description,
        provider: {
            '@type': 'Organization',
            name: 'Albero Academy',
            sameAs: 'https://www.alberoacademy.com'
        },
        url: seo.url,
        image: seo.image,
        educationalLevel: program.level,
        timeRequired: program.duration,
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: program.mode,
            startDate: program.enrollDate,
            inLanguage: 'en-IN'
        },
        offers: program.fees.map((f) => ({
            '@type': 'Offer',
            name: f.plan,
            price: f.price.replace(/[^0-9]/g, ''),
            priceCurrency: 'INR',
            category: f.plan,
            availability: 'https://schema.org/InStock'
        }))
    }
    const programBreadcrumbs = buildDetailBreadcrumbs([
        { name: 'Programs', url: 'https://www.alberoacademy.com/#programs' },
        { name: `${program.title} ${program.highlight}`.trim(), url: seo.url }
    ])

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <SEO
                title={seo.title}
                description={seo.description}
                keywords={seo.keywords}
                url={seo.url}
                canonical={seo.canonical}
                image={seo.image}
                type={seo.type}
            />
            <StructuredData
                breadcrumbOverride={programBreadcrumbs}
                extra={[courseSchema]}
            />
            {/* ──────────────────────────────────────────────────────────
                1. HERO — title + counsellor side card + ArmorCode canvas
            ────────────────────────────────────────────────────────── */}
            <section
                id="overview"
                className="relative pt-[140px] pb-16 px-5 md:px-8">
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}>
                        <div
                            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-6 text-[12px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <Icon
                                size={14}
                                style={{ color: 'var(--brand)' }}
                            />
                            {program.badge}
                        </div>

                        <h1
                            className="font-display leading-[1.0] tracking-[-0.02em] mb-5"
                            style={{ color: 'var(--text-primary)', fontSize: 'clamp(32px, 6.5vw, 64px)' }}>
                            <span className="font-medium">{program.title}</span>
                            <br />
                            <span className="italic font-light alb-gradient-text">{program.highlight}</span>
                        </h1>

                        <p
                            className="text-[17px] font-medium mb-3"
                            style={{ color: 'var(--brand)' }}>
                            {program.subtitle}
                        </p>
                        <p
                            className="text-[15px] leading-relaxed max-w-xl mb-8"
                            style={{ color: 'var(--text-secondary)' }}>
                            {program.description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <Pill
                                icon={Clock}
                                label={program.duration}
                            />
                            <Pill
                                icon={Users}
                                label={program.mode}
                            />
                            <Pill
                                icon={GraduationCap}
                                label={program.level}
                            />
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
                            <a
                                href="/pricing"
                                className="px-6 py-3 rounded-full font-semibold transition-colors"
                                style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line-strong)' }}>
                                See Pricing
                            </a>
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
                        <div
                            className="flex items-center gap-2 mb-3 text-[13px] font-semibold"
                            style={{ color: 'var(--accent)' }}>
                            <Sparkles size={16} /> {program.enrollDate}
                        </div>
                        <h3
                            className="font-display text-[20px] font-semibold mb-1"
                            style={{ color: 'var(--text-primary)' }}>
                            Talk to a Counsellor
                        </h3>
                        <p
                            className="text-[14px] mb-5"
                            style={{ color: 'var(--text-secondary)' }}>
                            Quick 15-min call — get program details, eligibility, and fee structure.
                        </p>

                        {callbackSent ? (
                            <div
                                className="rounded-xl p-4 flex items-start gap-3"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)', border: '1px solid var(--brand)' }}>
                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />
                                <div className="text-[13px] leading-relaxed">
                                    <div className="font-semibold mb-0.5">Request received.</div>A counsellor will WhatsApp you within 30 minutes
                                    between 10 AM – 9 PM IST.
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={submitCallback}
                                className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    value={callbackForm.name}
                                    onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                                    placeholder="Full name"
                                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-colors"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                />
                                <input
                                    type="email"
                                    required
                                    value={callbackForm.email}
                                    onChange={(e) => setCallbackForm({ ...callbackForm, email: e.target.value })}
                                    placeholder="Email"
                                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-colors"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                />
                                <input
                                    type="tel"
                                    required
                                    value={callbackForm.phone}
                                    onChange={(e) => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                                    placeholder="Phone (WhatsApp)"
                                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-colors"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                />
                                <button
                                    type="submit"
                                    disabled={callbackLoading}
                                    className="w-full rounded-lg py-2.5 font-semibold text-[14px] transition-all hover:opacity-90 inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                    {callbackLoading ? (
                                        <>
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                            Sending…
                                        </>
                                    ) : (
                                        'Request a Callback'
                                    )}
                                </button>
                            </form>
                        )}

                        <div
                            className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t"
                            style={{ borderColor: 'var(--line)' }}>
                            {program.stats.map((s, i) => (
                                <div key={i}>
                                    <div
                                        className="font-display text-[22px] font-semibold leading-none"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {s.v}
                                    </div>
                                    <div
                                        className="text-[10px] tracking-[0.16em] uppercase mt-1.5 font-semibold"
                                        style={{ color: 'var(--text-tertiary)' }}>
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
                    { label: 'Students Successfully Placed', value: 2500, suffix: '+' },
                    { label: 'Placement Rate', value: 98, suffix: '%' },
                    { label: 'Average Salary Growth', value: 280, suffix: '%' },
                    { label: 'Hiring partners', value: 500, suffix: '+' }
                ]}
            />

            {/* ──────────────────────────────────────────────────────────
                3. THE ADVANTAGE / WHY US
            ────────────────────────────────────────────────────────── */}
            <AdvantageGrid
                items={DEFAULT_ADVANTAGE.map((a, i) => ({
                    ...a,
                    icon: [
                        <Briefcase
                            key="b"
                            size={20}
                        />,
                        <Award
                            key="a"
                            size={20}
                        />,
                        <Compass
                            key="c"
                            size={20}
                        />
                    ][i]
                }))}
            />

            {/* ──────────────────────────────────────────────────────────
                4. WHAT YOU'LL LEARN — tabbed pill grid
            ────────────────────────────────────────────────────────── */}
            <div id="learn">
                <WhatYoullLearn categories={skills} />
            </div>

            {/* ──────────────────────────────────────────────────────────
                4b. TECH MESH — animated stack overview, full standalone
                    section. Replaces the small embedded canvas that used
                    to live inside the hero block.
            ────────────────────────────────────────────────────────── */}
            <TechMeshSection
                nodes={armorNodes}
                hubLabel={program.title.split(' ')[0]}
                hubGlyph="✦"
            />

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
                tone="deep"
                heading={`${tools.length}+ industry tools,`}
                accent="woven into every lab."
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
                13. FAQ — pricing tiers now live on the dedicated /pricing
                    page; the hero CTAs (Reserve Slot / Pay Full Fee) and
                    the FinalCTABanner still drive enrollment from here.
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
                secondaryHref="/pricing"
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

function Pill({
    icon: Icon,
    label
}: {
    icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
    label: string
}) {
    return (
        <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13.5px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
            <Icon
                size={14}
                style={{ color: 'var(--brand)' }}
            />
            {label}
        </div>
    )
}
