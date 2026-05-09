import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BadgeCheck, Cloud, GraduationCap, Users, Target, ArrowUpRight, Cpu, Database, BarChart3, Brain, Server } from 'lucide-react'

// ─── Brand marks (kept inline, no external assets) ───────────────────────────

function IBMMark({ size = 32 }: { size?: number }) {
    return (
        <svg
            viewBox="0 0 64 28"
            width={size * (64 / 28)}
            height={size}
            aria-label="IBM"
            role="img">
            {Array.from({ length: 8 }).map((_, i) => (
                <rect
                    key={i}
                    x={i * 8}
                    y="2"
                    width="6"
                    height="3.2"
                    fill="currentColor"
                />
            ))}
            <text
                x="0"
                y="22"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight={800}
                fontSize="14"
                letterSpacing="2"
                fill="currentColor">
                IBM
            </text>
        </svg>
    )
}

function MicrosoftLogo({ size = 28 }: { size?: number }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-label="Microsoft"
            role="img">
            <rect
                x="1"
                y="1"
                width="10"
                height="10"
                fill="#F25022"
            />
            <rect
                x="13"
                y="1"
                width="10"
                height="10"
                fill="#7FBA00"
            />
            <rect
                x="1"
                y="13"
                width="10"
                height="10"
                fill="#00A4EF"
            />
            <rect
                x="13"
                y="13"
                width="10"
                height="10"
                fill="#FFB900"
            />
        </svg>
    )
}

function AlberoLogo({ size = 28 }: { size?: number }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none">
            <path
                d="M12 3 C 7 7, 5 12, 12 21 C 19 12, 17 7, 12 3 Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M12 8 L12 21"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    )
}

// ─── IBM + Microsoft deep-dive data ──────────────────────────────────────────

const ibmPrograms = [
    { Icon: Brain, name: 'Data Science with ML & GenAI', label: 'Flagship' },
    { Icon: Server, name: 'Data Engineering', label: 'Cloud track' },
    { Icon: Cpu, name: 'AI Engineering', label: 'Specialisation' }
]

const msPrograms = [
    { Icon: Database, name: 'Data Analytics', label: 'Most popular' },
    { Icon: BarChart3, name: 'Business Analytics', label: 'BI & strategy' },
    { Icon: Cpu, name: 'Power BI Specialisation', label: 'PL-300 prep' }
]

const ibmStats = [
    { v: '40+', l: 'IBM hiring partners' },
    { v: '4.9 / 5', l: 'IBM mentor rating' },
    { v: '1', l: 'IBM exam voucher' }
]

const msStats = [
    { v: '60+', l: 'Microsoft partners' },
    { v: '4.9 / 5', l: 'Microsoft cert pass rate' },
    { v: '$200', l: 'Azure credits / learner' }
]

// ─────────────────────────────────────────────────────────────────────────────

export default function Collaboration() {
    const navigate = useNavigate()

    return (
        <section
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg-soft)', color: 'var(--text-primary)' }}>
            <div
                aria-hidden="true"
                className="absolute -top-32 -left-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(5,48,173,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,120,212,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                {/* ── Headline ── */}
                <div className="text-center max-w-[820px] mx-auto mb-14">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <Sparkles size={12} /> Strategic Collaborations
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium"
                        style={{ color: 'var(--text-primary)' }}>
                        Built with{' '}
                        <span
                            className="font-semibold"
                            style={{ color: '#0530AD' }}>
                            IBM
                        </span>
                        . <span className="italic font-light">Backed by</span>{' '}
                        <span
                            className="font-semibold"
                            style={{ color: '#0078D4' }}>
                            Microsoft
                        </span>
                        .
                    </h2>
                    <p
                        className="mt-5 text-[16px] md:text-[17px] leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}>
                        We don't just teach to a syllabus — we co-design our curriculum with the same teams who hire on it. Every flagship cohort
                        earns a co-branded credential plus the cloud credits to prove it on real work.
                    </p>

                    {/* Combined logo lockup */}
                    <div
                        className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-full"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                        <span style={{ color: '#0530AD' }}>
                            <IBMMark size={26} />
                        </span>
                        <span style={{ color: 'var(--text-tertiary)' }}>×</span>
                        <MicrosoftLogo size={22} />
                        <span style={{ color: 'var(--text-tertiary)' }}>×</span>
                        <span
                            className="inline-flex items-center gap-2"
                            style={{ color: 'var(--brand)' }}>
                            <AlberoLogo size={22} />
                            <span
                                className="font-display text-[15px] font-semibold tracking-tight"
                                style={{ color: 'var(--text-primary)' }}>
                                Albero
                            </span>
                        </span>
                    </div>
                </div>

                {/* ── Two big partner deep-dives ── */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* ─── IBM PANEL ─── */}
                    <PartnerPanel
                        accent="#0530AD"
                        accentSoft="rgba(5,48,173,0.08)"
                        eyebrow="Partner 01 · Industry-Co-Designed"
                        partner="IBM"
                        partnerLogo={
                            <span style={{ color: '#0530AD' }}>
                                <IBMMark size={28} />
                            </span>
                        }
                        headline="Get IBM-certified."
                        headlineItalic="Without leaving your cohort."
                        why={{
                            title: 'Why it matters',
                            body: 'IBM-certified profiles get short-listed 3× faster. Recruiters at IBM, Cognizant, Deloitte, EY, and 40+ partner firms filter on this badge — it is the fastest signal that you have built and shipped, not just studied.'
                        }}
                        who={{
                            title: 'Who it is for',
                            body: 'Built into our flagship AI/ML, Data Science, and Data Engineering cohorts — auto-included at no extra cost.'
                        }}
                        how={{
                            title: 'How you get certified',
                            steps: [
                                'Complete your live cohort + capstone reviewed by an IBM mentor',
                                'Pass the IBM-aligned skills assessment (in-cohort)',
                                'Receive a co-branded IBM SkillsBuild badge + Credly profile + 1 IBM exam voucher'
                            ]
                        }}
                        programs={ibmPrograms}
                        stats={ibmStats}
                        ctaLabel="Explore IBM-certified programs"
                        onCta={() => navigate('/programs/data-science-ai')}
                        secondaryCta={{ label: 'Talk to an advisor', onClick: () => navigate('/contact') }}
                    />

                    {/* ─── MICROSOFT PANEL ─── */}
                    <PartnerPanel
                        accent="#0078D4"
                        accentSoft="rgba(0,120,212,0.08)"
                        eyebrow="Partner 02 · Globally-Recognised"
                        partner="Microsoft"
                        partnerLogo={<MicrosoftLogo size={26} />}
                        headline="Earn a Microsoft Certified credential."
                        headlineItalic="Backed by Microsoft Learn."
                        why={{
                            title: 'Why it matters',
                            body: 'Microsoft Certified: Data Analyst Associate (PL-300) is the highest-paying entry-level analytics credential in India. Hiring managers across BFSI, consulting, and product treat it as proof you can ship Power BI dashboards on day one.'
                        }}
                        who={{
                            title: 'Who it is for',
                            body: 'Built into Data Analytics, Business Analytics, and Power BI specialisations. Open to all Mentor-Led and Career-Pro learners.'
                        }}
                        how={{
                            title: 'How you get certified',
                            steps: [
                                'Take the Microsoft Learn pathway integrated into your cohort',
                                'Use $200 Azure credits + Power BI Pro licence on your capstone',
                                '1 free Microsoft exam attempt (PL-300 / DA-100 / AI-900) on us'
                            ]
                        }}
                        programs={msPrograms}
                        stats={msStats}
                        ctaLabel="Explore Microsoft-certified programs"
                        onCta={() => navigate('/programs/data-analytics')}
                        secondaryCta={{ label: 'Talk to an advisor', onClick: () => navigate('/contact') }}
                    />
                </div>

                {/* ── Closing trust strip ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.45 }}
                    className="mt-8 rounded-3xl px-6 md:px-10 py-6 md:py-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                    {[
                        { Icon: BadgeCheck, label: 'Co-branded certificates' },
                        { Icon: Cloud, label: 'Free Azure + IBM Cloud credits' },
                        { Icon: GraduationCap, label: 'Exam vouchers included' },
                        { Icon: Users, label: 'IBM + Microsoft mentor circle' },
                        { Icon: Target, label: 'Hiring-team approved syllabus' }
                    ].map(({ Icon, label }) => (
                        <span
                            key={label}
                            className="inline-flex items-center gap-2 text-[13px] font-semibold"
                            style={{ color: 'var(--text-secondary)' }}>
                            <Icon
                                size={15}
                                style={{ color: 'var(--brand)' }}
                            />
                            {label}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// ─── Partner panel (used twice — IBM + Microsoft) ────────────────────────────

interface PartnerPanelProps {
    accent: string
    accentSoft: string
    eyebrow: string
    partner: string
    partnerLogo: React.ReactNode
    headline: string
    headlineItalic: string
    why: { title: string; body: string }
    who: { title: string; body: string }
    how: { title: string; steps: string[] }
    programs: { Icon: React.ComponentType<{ size?: number }>; name: string; label: string }[]
    stats: { v: string; l: string }[]
    ctaLabel: string
    onCta: () => void
    secondaryCta: { label: string; onClick: () => void }
}

function PartnerPanel({
    accent,
    accentSoft,
    eyebrow,
    partner,
    partnerLogo,
    headline,
    headlineItalic,
    why,
    who,
    how,
    programs,
    stats,
    ctaLabel,
    onCta,
    secondaryCta
}: PartnerPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--card-shadow-hover)'
            }}>
            {/* Top color band */}
            <div
                className="relative px-6 md:px-8 pt-6 md:pt-7 pb-5"
                style={{
                    background: `linear-gradient(135deg, ${accent} 0%, ${accent}d0 100%)`,
                    color: '#fff'
                }}>
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.16]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />
                <div className="relative z-[1] flex items-center justify-between mb-4">
                    <span
                        className="text-[10.5px] tracking-[0.18em] uppercase font-bold"
                        style={{ color: 'rgba(255,255,255,0.78)' }}>
                        {eyebrow}
                    </span>
                    <div
                        className="inline-flex items-center px-3 py-1.5 rounded-full"
                        style={{ background: '#fff' }}>
                        {partnerLogo}
                    </div>
                </div>
                <h3
                    className="relative z-[1] font-display text-[28px] md:text-[34px] leading-tight font-semibold"
                    style={{ color: '#fff' }}>
                    {headline}
                    <br />
                    <span className="italic font-light">{headlineItalic}</span>
                </h3>
            </div>

            <div className="p-6 md:p-8">
                {/* WHY */}
                <Block
                    label={why.title}
                    accent={accent}
                    accentSoft={accentSoft}
                    number="01">
                    <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}>
                        {why.body}
                    </p>
                </Block>

                {/* WHO */}
                <Block
                    label={who.title}
                    accent={accent}
                    accentSoft={accentSoft}
                    number="02">
                    <p
                        className="text-[14px] leading-relaxed mb-4"
                        style={{ color: 'var(--text-secondary)' }}>
                        {who.body}
                    </p>
                    <div className="space-y-2">
                        {programs.map((p) => {
                            const Icon = p.Icon
                            return (
                                <div
                                    key={p.name}
                                    className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                                    <span
                                        className="w-9 h-9 rounded-lg inline-flex items-center justify-center flex-shrink-0"
                                        style={{ background: accentSoft, color: accent }}>
                                        <Icon size={16} />
                                    </span>
                                    <div className="flex-1 min-w-0 leading-tight">
                                        <div
                                            className="font-display text-[14px] font-semibold"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {p.name}
                                        </div>
                                        <div
                                            className="text-[11px]"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            {p.label}
                                        </div>
                                    </div>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-[0.14em] uppercase"
                                        style={{ background: accent, color: '#fff' }}>
                                        {partner}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </Block>

                {/* HOW */}
                <Block
                    label={how.title}
                    accent={accent}
                    accentSoft={accentSoft}
                    number="03">
                    <ol className="space-y-2.5">
                        {how.steps.map((s, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-[13.5px]"
                                style={{ color: 'var(--text-secondary)' }}>
                                <span
                                    className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10.5px] font-bold flex-shrink-0 mt-0.5"
                                    style={{ background: accent, color: '#fff' }}>
                                    {i + 1}
                                </span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ol>
                </Block>

                {/* Stats strip */}
                <div
                    className="grid grid-cols-3 gap-3 pt-5 mt-2 border-t"
                    style={{ borderColor: 'var(--line)' }}>
                    {stats.map((s) => (
                        <div key={s.l}>
                            <div
                                className="font-display text-[22px] leading-none font-semibold tracking-[-0.02em]"
                                style={{ color: accent }}>
                                {s.v}
                            </div>
                            <div
                                className="text-[10.5px] tracking-[0.14em] uppercase mt-1.5"
                                style={{ color: 'var(--text-tertiary)' }}>
                                {s.l}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                    <button
                        onClick={onCta}
                        className="px-5 py-3 rounded-full text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px]"
                        style={{
                            background: accent,
                            color: '#fff',
                            boxShadow: `0 8px 18px ${accent}40`
                        }}>
                        {ctaLabel} <ArrowUpRight size={14} />
                    </button>
                    <button
                        onClick={secondaryCta.onClick}
                        className="px-5 py-3 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                        style={{
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--line-strong)'
                        }}>
                        {secondaryCta.label}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function Block({
    label,
    children,
    accent,
    accentSoft,
    number
}: {
    label: string
    children: React.ReactNode
    accent: string
    accentSoft: string
    number: string
}) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-2.5">
                <span
                    className="font-mono text-[10px] tracking-[0.18em] font-bold w-7 h-7 rounded-md inline-flex items-center justify-center"
                    style={{ background: accentSoft, color: accent }}>
                    {number}
                </span>
                <span
                    className="font-display text-[14.5px] font-semibold tracking-tight"
                    style={{ color: 'var(--text-primary)' }}>
                    {label}
                </span>
            </div>
            {children}
        </div>
    )
}
