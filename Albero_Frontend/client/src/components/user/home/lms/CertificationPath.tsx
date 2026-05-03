import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Sparkles, ScanLine, GraduationCap } from 'lucide-react'

// A short, impactful teaser that lives between Outcomes and Hiring Partners.
// Its job is to plant the IBM × Microsoft USP early on the page — before the
// learner reaches the deep-dive Collaboration block — and answer the three
// questions a buyer would have at a glance: WHY does this matter, WHO is it
// for, and HOW do I get certified.

export default function CertificationPath() {
    const navigate = useNavigate()

    return (
        <section
            className="relative py-16 md:py-20 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Decor */}
            <div
                aria-hidden="true"
                className="absolute -top-24 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(5,48,173,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-24 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,120,212,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    className="rounded-[28px] overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
                        border: '1px solid var(--line)',
                        boxShadow: 'var(--card-shadow-hover)'
                    }}>
                    <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-0">
                        {/* ── Left: pitch ── */}
                        <div
                            className="relative p-6 md:p-10 overflow-hidden min-w-0"
                            style={{
                                background: 'linear-gradient(160deg, #0a1140 0%, #04081f 100%)',
                                color: '#f8f6ee'
                            }}>
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 pointer-events-none opacity-[0.10]"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px'
                                }}
                            />
                            <div
                                aria-hidden="true"
                                className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }}
                            />

                            <div className="relative z-[1]">
                                <div className="inline-flex items-center gap-2 mb-5">
                                    <span className="inline-block w-10 h-[2px] rounded-full" style={{ background: '#34d399' }} />
                                    <span className="text-[10.5px] tracking-[0.28em] uppercase font-bold" style={{ color: '#34d399' }}>
                                        Your shortcut to a job
                                    </span>
                                </div>

                                <h2
                                    className="font-display tracking-[-0.02em]"
                                    style={{
                                        fontSize: 'clamp(24px, 6vw, 40px)',
                                        lineHeight: 1.08,
                                        color: '#f8f6ee',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word'
                                    }}>
                                    Graduate with a credential{' '}
                                    <span className="italic font-light" style={{ color: '#a7f3d0' }}>
                                        recruiters already filter on.
                                    </span>
                                </h2>

                                <p
                                    className="mt-5 text-[14.5px] leading-relaxed max-w-[440px]"
                                    style={{ color: 'rgba(248,246,238,0.75)' }}>
                                    Every flagship cohort earns a co-branded credential from{' '}
                                    <strong style={{ color: '#fff' }}>IBM</strong> and{' '}
                                    <strong style={{ color: '#fff' }}>Microsoft</strong> — the same badges that recruiters at the top 200 hiring teams use as a first-pass filter.
                                </p>

                                {/* Mini logos */}
                                <div className="mt-7 flex flex-wrap items-center gap-3">
                                    {/* IBM tile */}
                                    <div
                                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <span style={{ color: '#7aa1ff' }}>
                                            <svg viewBox="0 0 64 28" width="38" height="18" aria-label="IBM">
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <rect key={i} x={i * 8} y="2" width="6" height="3.2" fill="currentColor" />
                                                ))}
                                                <text x="0" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight={800} fontSize="14" letterSpacing="2" fill="currentColor">
                                                    IBM
                                                </text>
                                            </svg>
                                        </span>
                                        <span className="text-[12px] font-semibold" style={{ color: '#f8f6ee' }}>
                                            SkillsBuild Badge
                                        </span>
                                    </div>
                                    {/* Microsoft tile */}
                                    <div
                                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                                            <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                                            <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                                            <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                                        </svg>
                                        <span className="text-[12px] font-semibold" style={{ color: '#f8f6ee' }}>
                                            Microsoft Certified
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="mt-8 px-5 py-3 rounded-full text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px]"
                                    style={{ background: '#a7f3d0', color: '#04081a' }}>
                                    See programs that include certification <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>

                        {/* ── Right: 3-step path ── */}
                        <div className="p-6 md:p-10 min-w-0">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <Sparkles size={12} /> The certification path
                            </div>
                            <h3
                                className="font-display text-[26px] md:text-[30px] leading-tight tracking-[-0.02em] font-semibold"
                                style={{ color: 'var(--text-primary)' }}>
                                3 steps from joining to getting{' '}
                                <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                    industry-certified.
                                </span>
                            </h3>

                            <ol className="mt-7 space-y-5">
                                <Step
                                    n="01"
                                    title="Train on the same rubric IBM & Microsoft hire on"
                                    body="Your live cohort, capstones, and mock interviews are built against the assessments IBM and Microsoft use internally. No filler — just what hiring teams actually grade you on."
                                    badges={[
                                        { label: 'IBM-aligned syllabus', color: '#0530AD' },
                                        { label: 'Microsoft Learn pathway', color: '#0078D4' }
                                    ]}
                                />
                                <Step
                                    n="02"
                                    title="Pass the in-cohort skills assessment"
                                    body="An IBM or Microsoft mentor reviews your capstone, runs the assessment, and signs off on your project — the same way they'd hire you internally."
                                    badges={[
                                        { label: 'Mentor-signed', color: '#0d4f3c' }
                                    ]}
                                />
                                <Step
                                    n="03"
                                    title="Get certified — for free, on us"
                                    body="Receive your co-branded IBM SkillsBuild badge on Credly, plus 1 free Microsoft exam voucher (PL-300 / DA-100 / AI-900). Your verifiable Albero ID lives on every certificate."
                                    badges={[
                                        { label: 'Free IBM badge', color: '#0530AD' },
                                        { label: '1 free MS exam', color: '#0078D4' }
                                    ]}
                                />
                            </ol>

                            {/* Verifier preview */}
                            <div
                                className="mt-7 flex items-center gap-3 p-4 rounded-2xl"
                                style={{
                                    background: 'var(--surface-2)',
                                    border: '1px dashed var(--line-strong)'
                                }}>
                                <span
                                    className="w-10 h-10 rounded-xl inline-flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <ScanLine size={18} />
                                </span>
                                <div className="leading-tight">
                                    <div className="text-[12px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                        Every cert is verifiable
                                    </div>
                                    <div className="text-[11.5px] mt-0.5 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                                        albero.academy/verify/<span style={{ color: 'var(--brand)' }}>ALB-2025-XXXX</span>
                                    </div>
                                </div>
                                <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: 'var(--brand)' }}>
                                    <GraduationCap size={13} /> Public Credly profile
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

function Step({
    n,
    title,
    body,
    badges
}: {
    n: string
    title: string
    body: string
    badges: { label: string; color: string }[]
}) {
    return (
        <li className="flex items-start gap-4">
            <span
                className="font-mono text-[11px] font-bold tracking-[0.16em] flex-shrink-0 w-9 h-9 rounded-xl inline-flex items-center justify-center"
                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                {n}
            </span>
            <div className="flex-1 min-w-0">
                <h4 className="font-display text-[15.5px] font-semibold leading-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {title}
                </h4>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {body}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {badges.map((b) => (
                        <span
                            key={b.label}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                            style={{ background: 'var(--surface-2)', border: `1px solid ${b.color}33`, color: b.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                            {b.label}
                        </span>
                    ))}
                </div>
            </div>
        </li>
    )
}
