import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BadgeCheck, Sparkles, ScanLine } from 'lucide-react'

type Credential = {
    issuer: string
    logoUrl: string
    color: string
    title: string
    audience: string
    bullets: string[]
    recipientName: string
    program: string
    mentor: string
    mentorTitle: string
    partner: string
    partnerTitle: string
    certId: string
    accentGradient: string
}

const credentials: Credential[] = [
    {
        issuer: 'IBM',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
        color: '#0530AD',
        title: 'IBM SkillsBuild',
        audience: 'Data Science · AI/ML cohorts',
        bullets: ['Co-issued IBM badge on Credly', 'Free IBM Cloud credits', 'Reviewed against IBM hiring rubric'],
        recipientName: 'Aanya Kapoor',
        program: 'Data Science & AI/ML',
        mentor: 'Heena Arora',
        mentorTitle: 'Lead Mentor · PwC',
        partner: 'IBM SkillsBuild',
        partnerTitle: 'Issuing Partner',
        certId: 'ALB-IBM-AK7421',
        accentGradient: 'linear-gradient(135deg, #0530AD12 0%, #0530AD03 100%)'
    },
    {
        issuer: 'Microsoft',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        color: '#0078D4',
        title: 'Microsoft Learn',
        audience: 'Data Analytics · BI cohorts',
        bullets: ['DA-100 & AI-900 pathway prep', 'Azure credits + Power BI Pro', 'One Microsoft exam voucher'],
        recipientName: 'Rohan Mehta',
        program: 'Data Analytics & Business Intelligence',
        mentor: 'Anand Tripathi',
        mentorTitle: 'Lead Mentor · Google',
        partner: 'Microsoft Learn',
        partnerTitle: 'Issuing Partner',
        certId: 'ALB-MS-RM8832',
        accentGradient: 'linear-gradient(135deg, #0078D412 0%, #0078D403 100%)'
    },
    {
        issuer: 'AWS',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
        color: '#FF9900',
        title: 'AWS Pathway Partner',
        audience: 'Data Engineering · MLOps cohorts',
        bullets: ['Cloud Practitioner exam prep', '$200 AWS capstone credits', 'MLOps capstone walk-through'],
        recipientName: 'Priya Nair',
        program: 'Data Engineering & MLOps',
        mentor: 'Neeraj Bhatt',
        mentorTitle: 'Lead Mentor · Walmart Labs',
        partner: 'Amazon Web Services',
        partnerTitle: 'Issuing Partner',
        certId: 'ALB-AWS-PN6650',
        accentGradient: 'linear-gradient(135deg, #FF990012 0%, #FF990003 100%)'
    },
    {
        issuer: 'Google',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        color: '#4285F4',
        title: 'Google Cloud Track',
        audience: 'Data Engineering cohorts',
        bullets: ['Cloud Skills Boost labs', 'BigQuery + Looker Studio capstone', 'Google Cloud cert alignment'],
        recipientName: 'Kabir Sharma',
        program: 'Data Engineering & Cloud',
        mentor: 'Aanya Sharma',
        mentorTitle: 'Lead Mentor · Microsoft',
        partner: 'Google Cloud',
        partnerTitle: 'Issuing Partner',
        certId: 'ALB-GCP-KS5519',
        accentGradient: 'linear-gradient(135deg, #4285F412 0%, #4285F403 100%)'
    }
]

const stats = [
    { v: '12,000+', l: 'Issued certificates', sub: 'Every one verifiable online' },
    { v: '180+', l: 'Hiring partners', sub: 'Accept our credentials' },
    { v: '4.8 / 5', l: 'Mentor satisfaction', sub: 'Across 2025 cohorts' }
]

function QRGrid({ seed }: { seed: string }) {
    const dots = Array.from({ length: 36 }, (_, i) => {
        const v = (seed.charCodeAt(i % seed.length) * (i + 7) * 13) % 100
        return v > 42
    })
    return (
        <div
            className="w-14 h-14 rounded-md grid grid-cols-6 gap-[2px] p-1"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
            {dots.map((on, k) => (
                <span
                    key={k}
                    className="rounded-[1px]"
                    style={{ background: on ? 'var(--text-primary)' : 'transparent' }}
                />
            ))}
        </div>
    )
}

export default function Certifications() {
    const [activeIdx, setActiveIdx] = useState(0)
    const active = credentials[activeIdx]

    return (
        <section
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <div
                aria-hidden="true"
                className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                aria-hidden="true"
                className="absolute bottom-[-30%] right-[-15%] w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(70px)' }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                {/* Header */}
                <div className="text-center max-w-[760px] mx-auto mb-14">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <BadgeCheck size={12} /> Certifications
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium"
                        style={{ color: 'var(--text-primary)' }}>
                        Credentials hiring managers{' '}
                        <span
                            className="italic font-light"
                            style={{ color: 'var(--brand)' }}>
                            actually trust.
                        </span>
                    </h2>
                    <p
                        className="mt-4 text-[15.5px]"
                        style={{ color: 'var(--text-secondary)' }}>
                        Verifiable, project-backed, and partner-aligned — every certificate has a unique ID employers can verify online.
                    </p>
                </div>

                {/* Two-column: Certificate LEFT | Selector + Stats RIGHT */}
                <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6 items-start">
                    {/* ── LEFT: Live certificate ── */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active.certId + '-glow'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                aria-hidden="true"
                                className="absolute -inset-8 rounded-[48px] pointer-events-none"
                                style={{
                                    background: `radial-gradient(ellipse at 40% 50%, ${active.color}1A 0%, transparent 70%)`,
                                    filter: 'blur(24px)'
                                }}
                            />
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.6 }}
                            className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow-hover)'
                            }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active.certId + '-bar'}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    exit={{ scaleX: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className="absolute top-0 left-0 right-0 h-[3px] origin-left rounded-t-3xl"
                                    style={{ background: active.color }}
                                />
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active.certId}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -14 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
                                    style={{
                                        background: active.accentGradient,
                                        border: `1.5px solid ${active.color}44`,
                                        boxShadow: `inset 0 0 0 6px var(--page-bg-soft)`
                                    }}>
                                    {/* Watermark */}
                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none font-display italic select-none overflow-hidden"
                                        style={{ fontSize: 150, color: active.color, opacity: 0.04, lineHeight: 1 }}>
                                        {active.issuer}
                                    </div>

                                    {/* Top row */}
                                    <div className="relative z-[1] flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="inline-flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width="20"
                                                    height="20"
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
                                            </span>
                                            <div className="leading-tight">
                                                <div
                                                    className="font-display text-[17px] font-semibold"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    Albero Academy
                                                </div>
                                                <div
                                                    className="text-[9.5px] tracking-[0.22em] uppercase font-semibold"
                                                    style={{ color: 'var(--brand)' }}>
                                                    Certificate of Completion
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div
                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-full"
                                                style={{
                                                    background: 'var(--surface)',
                                                    border: `1px solid ${active.color}44`,
                                                    minWidth: 64,
                                                    height: 32
                                                }}>
                                                <img
                                                    src={active.logoUrl}
                                                    alt={active.issuer}
                                                    loading="lazy"
                                                    style={{ maxHeight: 16, width: 'auto', maxWidth: 72, objectFit: 'contain' }}
                                                />
                                            </div>
                                            <span
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9.5px] font-bold tracking-[0.14em] uppercase"
                                                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                                <Sparkles size={9} /> Verified
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="relative z-[1] mb-6">
                                        <div
                                            className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-2"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            This certifies that
                                        </div>
                                        <div
                                            className="font-display text-[34px] md:text-[42px] leading-tight italic"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {active.recipientName}
                                        </div>
                                        <div
                                            className="mt-3 text-[13.5px] max-w-[500px]"
                                            style={{ color: 'var(--text-secondary)' }}>
                                            has successfully completed the{' '}
                                            <span
                                                className="font-semibold"
                                                style={{ color: active.color }}>
                                                {active.program}
                                            </span>{' '}
                                            program with capstone projects reviewed and approved by industry mentors.
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div
                                        className="relative z-[1] grid grid-cols-3 gap-4 pt-4 border-t"
                                        style={{ borderColor: `${active.color}2E` }}>
                                        <div>
                                            <div
                                                className="font-display italic text-[15px]"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {active.mentor}
                                            </div>
                                            <div
                                                className="text-[9.5px] mt-1 tracking-[0.14em] uppercase font-semibold"
                                                style={{ color: 'var(--text-tertiary)' }}>
                                                {active.mentorTitle}
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                className="font-display italic text-[15px]"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {active.partner}
                                            </div>
                                            <div
                                                className="text-[9.5px] mt-1 tracking-[0.14em] uppercase font-semibold"
                                                style={{ color: 'var(--text-tertiary)' }}>
                                                {active.partnerTitle}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className="inline-flex items-center gap-1 mb-1.5 text-[9.5px] font-mono"
                                                style={{ color: 'var(--text-secondary)' }}>
                                                <ScanLine size={10} /> {active.certId}
                                            </div>
                                            <div className="flex justify-end">
                                                <QRGrid seed={active.certId} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* ── RIGHT: Partner selector + stats ── */}
                    <div className="flex flex-col gap-4">
                        {/* Section label */}
                        <div className="flex items-center gap-2.5">
                            <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.18em] uppercase"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <BadgeCheck size={10} /> Certified by
                            </div>
                            <span
                                className="text-[12.5px]"
                                style={{ color: 'var(--text-tertiary)' }}>
                                Click a partner to preview
                            </span>
                        </div>

                        {/* 2×2 partner selector */}
                        <div className="grid grid-cols-2 gap-3">
                            {credentials.map((c, i) => {
                                const isActive = i === activeIdx
                                return (
                                    <motion.button
                                        key={c.issuer}
                                        onClick={() => setActiveIdx(i)}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="relative rounded-2xl p-4 text-left cursor-pointer overflow-hidden"
                                        style={{
                                            background: isActive ? `${c.color}12` : 'var(--surface)',
                                            border: `1.5px solid ${isActive ? c.color : 'var(--line)'}`,
                                            boxShadow: isActive ? `0 0 0 3px ${c.color}1A, var(--card-shadow-hover)` : 'var(--card-shadow)'
                                        }}>
                                        {isActive && (
                                            <motion.span
                                                layoutId="activeDot"
                                                className="absolute top-3 right-3 w-2 h-2 rounded-full"
                                                style={{ background: c.color }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            />
                                        )}

                                        {/* Real company logo */}
                                        <div className="mb-3 h-6 flex items-center">
                                            <img
                                                src={c.logoUrl}
                                                alt={c.issuer}
                                                loading="lazy"
                                                style={{
                                                    maxHeight: 20,
                                                    width: 'auto',
                                                    maxWidth:
                                                        c.issuer === 'Google' ? 60 : c.issuer === 'Microsoft' ? 80 : c.issuer === 'IBM' ? 40 : 44,
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>

                                        <div
                                            className="text-[12px] font-semibold leading-snug mb-1"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {c.title}
                                        </div>
                                        <div
                                            className="text-[10.5px] mb-2.5"
                                            style={{ color: 'var(--brand)' }}>
                                            {c.audience}
                                        </div>
                                        <ul className="space-y-1">
                                            {c.bullets.map((b, j) => (
                                                <li
                                                    key={j}
                                                    className="flex items-start gap-1.5 text-[11px]"
                                                    style={{ color: 'var(--text-secondary)' }}>
                                                    <span
                                                        className="mt-[5px] w-1 h-1 rounded-full flex-shrink-0"
                                                        style={{ background: c.color }}
                                                    />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                        {isActive && (
                                            <div
                                                className="mt-2.5 text-[9.5px] font-bold tracking-[0.14em] uppercase"
                                                style={{ color: c.color }}>
                                                ↑ Previewing
                                            </div>
                                        )}
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Stats — 3 compact horizontal cards */}
                        <div className="grid grid-cols-3 gap-3">
                            {stats.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-30px' }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                    className="rounded-2xl p-4"
                                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                    <div
                                        className="font-display text-[24px] leading-none font-semibold tracking-[-0.02em]"
                                        style={{ color: 'var(--brand)' }}>
                                        {s.v}
                                    </div>
                                    <div
                                        className="text-[11px] font-semibold mt-1.5"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {s.l}
                                    </div>
                                    <div
                                        className="text-[10px] mt-0.5"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        {s.sub}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
