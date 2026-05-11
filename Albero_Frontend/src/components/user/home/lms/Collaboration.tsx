import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BadgeCheck, Cloud, GraduationCap, Users, Target, ArrowUpRight, Cpu, Database, BarChart3, Brain, Server } from 'lucide-react'

// ─── Brand marks ──────────────────────────────────────────────────────────────

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

// ─── Data ─────────────────────────────────────────────────────────────────────

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
    { v: '40+', l: 'IBM Hiring Partners' },
    { v: '4.9/5', l: 'Mentor Rating' },
    { v: '1', l: 'Exam Voucher Included' }
]

const msStats = [
    { v: '60+', l: 'Microsoft Partners' },
    { v: '4.9/5', l: 'Cert Pass Rate' },
    { v: '$200', l: 'Azure Credits / Learner' }
]

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Collaboration() {
    const navigate = useNavigate()

    return (
        <section
            className="relative overflow-hidden"
            style={{
                background: 'var(--page-bg-soft)',
                color: 'var(--text-primary)',
                padding: '96px 20px 80px'
            }}>
            {/* Ambient glows */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                    top: -160,
                    left: -80,
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(5,48,173,0.07) 0%, transparent 65%)',
                    filter: 'blur(80px)'
                }}
            />
            <div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                    bottom: -160,
                    right: -80,
                    width: 640,
                    height: 640,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,120,212,0.09) 0%, transparent 65%)',
                    filter: 'blur(80px)'
                }}
            />

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* ── Hero headline ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.55 }}
                    style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 64px' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 16px',
                            borderRadius: 100,
                            marginBottom: 24,
                            background: 'var(--brand-soft)',
                            color: 'var(--brand)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase'
                        }}>
                        <Sparkles size={11} /> Strategic Collaborations
                    </div>

                    <h2
                        style={{
                            fontSize: 'clamp(38px, 5.5vw, 64px)',
                            fontWeight: 300,
                            lineHeight: 0.97,
                            letterSpacing: '-0.03em',
                            color: 'var(--text-primary)',
                            marginBottom: 20,
                            fontFamily: 'var(--font-display, inherit)'
                        }}>
                        Built with <span style={{ fontWeight: 800, color: '#0530AD' }}>IBM</span>.{' '}
                        <em style={{ fontStyle: 'italic', fontWeight: 300 }}>Backed by</em>{' '}
                        <span style={{ fontWeight: 800, color: '#0078D4' }}>Microsoft</span>.
                    </h2>

                    <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 32 }}>
                        We don't just teach to a syllabus — we co-design our curriculum with the same teams who hire on it. Every flagship cohort
                        earns a co-branded credential plus cloud credits to prove it on real work.
                    </p>

                    {/* Logo pill */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 22px',
                            borderRadius: 100,
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow)'
                        }}>
                        <span style={{ color: '#0530AD' }}>
                            <IBMMark size={22} />
                        </span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>×</span>
                        <MicrosoftLogo size={20} />
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>×</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand)' }}>
                            <AlberoLogo size={18} />
                            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>Albero</span>
                        </span>
                    </div>
                </motion.div>

                {/* ── Partner cards grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <PartnerPanel
                        accent="#0530AD"
                        accentSoft="rgba(5,48,173,0.07)"
                        accentMid="rgba(5,48,173,0.15)"
                        eyebrow="Partner 01 · Industry-Co-Designed"
                        partner="IBM"
                        partnerLogo={
                            <span style={{ color: '#0530AD' }}>
                                <IBMMark size={26} />
                            </span>
                        }
                        headline="Get IBM-certified."
                        headlineItalic="Without leaving your cohort."
                        why="IBM-certified profiles get short-listed 3× faster. Recruiters at IBM, Cognizant, Deloitte, EY, and 40+ partner firms filter on this badge — it is the fastest signal that you have built and shipped, not just studied."
                        whoBody="Built into our flagship AI/ML, Data Science, and Data Engineering cohorts — auto-included at no extra cost."
                        steps={[
                            'Complete your live cohort + capstone reviewed by an IBM mentor',
                            'Pass the IBM-aligned skills assessment (in-cohort)',
                            'Receive a co-branded IBM SkillsBuild badge + Credly profile + 1 IBM exam voucher'
                        ]}
                        programs={ibmPrograms}
                        stats={ibmStats}
                        ctaLabel="Explore IBM-certified programs"
                        onCta={() => navigate('/programs/data-science-ai')}
                        secondaryLabel="Talk to an advisor"
                        onSecondary={() => navigate('/contact')}
                    />

                    <PartnerPanel
                        accent="#0078D4"
                        accentSoft="rgba(0,120,212,0.07)"
                        accentMid="rgba(0,120,212,0.15)"
                        eyebrow="Partner 02 · Globally-Recognised"
                        partner="Microsoft"
                        partnerLogo={<MicrosoftLogo size={24} />}
                        headline="Earn a Microsoft Certified credential."
                        headlineItalic="Backed by Microsoft Learn."
                        why="Microsoft Certified: Data Analyst Associate (PL-300) is the highest-paying entry-level analytics credential in India. Hiring managers across BFSI, consulting, and product treat it as proof you can ship Power BI dashboards on day one."
                        whoBody="Built into Data Analytics, Business Analytics, and Power BI specialisations. Open to all Mentor-Led and Career-Pro learners."
                        steps={[
                            'Take the Microsoft Learn pathway integrated into your cohort',
                            'Use $200 Azure credits + Power BI Pro licence on your capstone',
                            '1 free Microsoft exam attempt (PL-300 / DA-100 / AI-900) on us'
                        ]}
                        programs={msPrograms}
                        stats={msStats}
                        ctaLabel="Explore Microsoft-certified programs"
                        onCta={() => navigate('/programs/data-analytics')}
                        secondaryLabel="Talk to an advisor"
                        onSecondary={() => navigate('/contact')}
                    />
                </div>

                {/* ── Trust strip ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.45 }}
                    style={{
                        borderRadius: 20,
                        padding: '20px 32px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px 36px',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)'
                    }}>
                    {[
                        { Icon: BadgeCheck, label: 'Co-branded certificates' },
                        { Icon: Cloud, label: 'Free Azure + IBM Cloud credits' },
                        { Icon: GraduationCap, label: 'Exam vouchers included' },
                        { Icon: Users, label: 'IBM + Microsoft mentor circle' },
                        { Icon: Target, label: 'Hiring-team approved syllabus' }
                    ].map(({ Icon, label }) => (
                        <span
                            key={label}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--text-secondary)'
                            }}>
                            <Icon
                                size={14}
                                style={{ color: 'var(--brand)', flexShrink: 0 }}
                            />
                            {label}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// ─── Partner panel ────────────────────────────────────────────────────────────

interface PartnerPanelProps {
    accent: string
    accentSoft: string
    accentMid: string
    eyebrow: string
    partner: string
    partnerLogo: React.ReactNode
    headline: string
    headlineItalic: string
    why: string
    whoBody: string
    steps: string[]
    programs: { Icon: React.ComponentType<{ size?: number }>; name: string; label: string }[]
    stats: { v: string; l: string }[]
    ctaLabel: string
    onCta: () => void
    secondaryLabel: string
    onSecondary: () => void
}

function PartnerPanel({
    accent,
    accentSoft,
    accentMid,
    eyebrow,
    partner,
    partnerLogo,
    headline,
    headlineItalic,
    why,
    whoBody,
    steps,
    programs,
    stats,
    ctaLabel,
    onCta,
    secondaryLabel,
    onSecondary
}: PartnerPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            style={{
                borderRadius: 24,
                overflow: 'hidden',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
            }}>
            {/* ── Gradient header ── */}
            <div
                style={{
                    position: 'relative',
                    padding: '28px 32px 26px',
                    background: `linear-gradient(140deg, ${accent} 0%, ${accent}e0 55%, ${accent}b0 100%)`,
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                {/* Dot texture */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        opacity: 0.13,
                        backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.6) 1.5px, transparent 0)',
                        backgroundSize: '22px 22px'
                    }}
                />
                {/* Shine orb */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: -60,
                        right: -40,
                        width: 260,
                        height: 260,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        pointerEvents: 'none'
                    }}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.7)',
                                paddingTop: 4
                            }}>
                            {eyebrow}
                        </span>
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 12,
                                padding: '8px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                            }}>
                            {partnerLogo}
                        </div>
                    </div>

                    <h3
                        style={{
                            fontSize: 'clamp(24px, 2.8vw, 32px)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                            fontFamily: 'var(--font-display, inherit)',
                            margin: 0
                        }}>
                        {headline}
                        <br />
                        <span style={{ fontStyle: 'italic', fontWeight: 300, opacity: 0.92 }}>{headlineItalic}</span>
                    </h3>
                </div>
            </div>

            {/* ── Scrollable content body ── */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '28px 32px',
                    /* Firefox */
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${accent}30 transparent`,
                    minHeight: 0,
                    maxHeight: 420
                }}>
                {/* WHY */}
                <ContentBlock
                    number="01"
                    label="Why it matters"
                    accent={accent}
                    accentSoft={accentSoft}>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0 }}>{why}</p>
                </ContentBlock>

                {/* WHO + programs */}
                <ContentBlock
                    number="02"
                    label="Who it is for"
                    accent={accent}
                    accentSoft={accentSoft}>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 14 }}>{whoBody}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {programs.map((p) => {
                            const Icon = p.Icon
                            return (
                                <div
                                    key={p.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '11px 14px',
                                        borderRadius: 14,
                                        background: 'var(--surface-2)',
                                        border: '1px solid var(--line)',
                                        transition: 'border-color 0.2s'
                                    }}>
                                    <span
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            flexShrink: 0,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: accentSoft,
                                            color: accent
                                        }}>
                                        <Icon size={16} />
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{p.label}</div>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 9,
                                            fontWeight: 800,
                                            letterSpacing: '0.14em',
                                            textTransform: 'uppercase',
                                            padding: '3px 9px',
                                            borderRadius: 100,
                                            background: accent,
                                            color: '#fff',
                                            flexShrink: 0
                                        }}>
                                        {partner}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </ContentBlock>

                {/* HOW */}
                <ContentBlock
                    number="03"
                    label="How you get certified"
                    accent={accent}
                    accentSoft={accentSoft}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {steps.map((s, i) => (
                            <div
                                key={i}
                                style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <span
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: accentMid,
                                        color: accent,
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        marginTop: 1
                                    }}>
                                    {i + 1}
                                </span>
                                <span style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{s}</span>
                            </div>
                        ))}
                    </div>
                </ContentBlock>

                {/* Stats row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3,1fr)',
                        gap: 8,
                        paddingTop: 20,
                        marginTop: 4,
                        borderTop: '1px solid var(--line)'
                    }}>
                    {stats.map((s) => (
                        <div
                            key={s.l}
                            style={{
                                padding: '14px 12px',
                                borderRadius: 14,
                                background: accentSoft
                            }}>
                            <div
                                style={{
                                    fontSize: 22,
                                    fontWeight: 800,
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1,
                                    color: accent,
                                    fontFamily: 'var(--font-display, inherit)'
                                }}>
                                {s.v}
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    marginTop: 5,
                                    color: 'var(--text-tertiary)',
                                    lineHeight: 1.4
                                }}>
                                {s.l}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Pinned CTA footer ── */}
            <div
                style={{
                    flexShrink: 0,
                    padding: '16px 32px 20px',
                    borderTop: '1px solid var(--line)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    background: 'var(--surface)'
                }}>
                <button
                    onClick={onCta}
                    style={{
                        flex: 1,
                        padding: '13px 20px',
                        borderRadius: 100,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: '#fff',
                        background: accent,
                        boxShadow: `0 6px 20px ${accent}45`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        letterSpacing: '-0.01em'
                    }}
                    onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 28px ${accent}55`
                    }}
                    onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.transform = ''
                        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${accent}45`
                    }}>
                    {ctaLabel} <ArrowUpRight size={14} />
                </button>
                <button
                    onClick={onSecondary}
                    style={{
                        padding: '13px 18px',
                        borderRadius: 100,
                        cursor: 'pointer',
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        background: 'transparent',
                        border: '1px solid var(--line-strong)',
                        transition: 'background 0.15s',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'
                    }}
                    onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}>
                    {secondaryLabel}
                </button>
            </div>
        </motion.div>
    )
}

// ─── Content block ────────────────────────────────────────────────────────────

function ContentBlock({
    number,
    label,
    accent,
    accentSoft,
    children
}: {
    number: string
    label: string
    accent: string
    accentSoft: string
    children: React.ReactNode
}) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: accentSoft,
                        color: accent,
                        fontSize: 9.5,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        fontFamily: 'monospace'
                    }}>
                    {number}
                </span>
                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display, inherit)'
                    }}>
                    {label}
                </span>
            </div>
            <div style={{ paddingLeft: 36 }}>{children}</div>
        </div>
    )
}
