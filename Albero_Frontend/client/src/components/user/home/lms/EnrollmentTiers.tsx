import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowUpRight, BarChart3, Database, Brain, Code2, Sparkles } from 'lucide-react'

type Tier = {
    name: string
    tag: string
    price: string
    emi: string
    features: string[]
    recommended?: boolean
}

type Program = {
    slug: string
    name: string
    Icon: React.ComponentType<{ size?: number }>
    duration: string
    accent: string
    tiers: Tier[]
}

const programs: Program[] = [
    {
        slug: 'business-analytics',
        name: 'Business Analytics',
        Icon: BarChart3,
        duration: '6 months',
        accent: 'oklch(0.795 0.184 86.047)',
        tiers: [
            {
                name: 'Self-Paced',
                tag: 'For self-starters',
                price: '₹35,000',
                emi: '₹3,500/mo on EMI',
                features: ['Lifetime program access', 'Recorded sessions + transcripts', 'Async project reviews', 'Community forum access', 'Completion certificate']
            },
            {
                name: 'Mentor-Led',
                tag: 'Most chosen',
                price: '₹65,000',
                emi: '₹6,500/mo on EMI',
                recommended: true,
                features: ['Everything in Self-Paced', 'Live cohort (3–4/week)', 'Weekly 1:1 mentor sessions', 'Resume + LinkedIn rebuild', '4 mock interviews', 'Industry certificate']
            },
            {
                name: 'Career Pro',
                tag: 'Aggressive switchers',
                price: '₹95,000',
                emi: '₹9,500/mo on EMI',
                features: ['Everything in Mentor-Led', 'Dedicated career coach', 'Direct hiring referrals', 'Salary negotiation prep', 'Placement until offer']
            }
        ]
    },
    {
        slug: 'data-analytics',
        name: 'Data Analytics',
        Icon: Database,
        duration: '5 months',
        accent: 'oklch(0.623 0.214 259.815)',
        tiers: [
            {
                name: 'Self-Paced',
                tag: 'For self-starters',
                price: '₹40,000',
                emi: '₹4,000/mo on EMI',
                features: ['Lifetime program access', 'Recorded SQL/Python labs', 'Async project reviews', 'Community forum access', 'Completion certificate']
            },
            {
                name: 'Mentor-Led',
                tag: 'Most chosen',
                price: '₹75,000',
                emi: '₹7,500/mo on EMI',
                recommended: true,
                features: ['Everything in Self-Paced', 'Live cohort (3–4/week)', 'Weekly 1:1 mentor sessions', 'Capstone with real data', '6 mock interviews', 'Industry certificate']
            },
            {
                name: 'Career Pro',
                tag: 'Aggressive switchers',
                price: '₹1,15,000',
                emi: '₹11,500/mo on EMI',
                features: ['Everything in Mentor-Led', 'Dedicated career coach', 'Direct hiring referrals', 'GitHub portfolio audit', 'Placement until offer']
            }
        ]
    },
    {
        slug: 'data-science-ai',
        name: 'Data Science & AI/ML',
        Icon: Brain,
        duration: '9 months',
        accent: 'oklch(0.627 0.265 303.9)',
        tiers: [
            {
                name: 'Self-Paced',
                tag: 'For self-starters',
                price: '₹55,000',
                emi: '₹5,500/mo on EMI',
                features: ['Lifetime program access', 'Recorded ML & GenAI labs', 'Async project reviews', 'Community forum access', 'Completion certificate']
            },
            {
                name: 'Mentor-Led',
                tag: 'Most chosen',
                price: '₹95,000',
                emi: '₹9,500/mo on EMI',
                recommended: true,
                features: ['Everything in Self-Paced', 'Live cohort (3–4/week)', 'Weekly 1:1 with ML mentors', 'Capstone with LLMs/MLOps', '6 mock interviews', 'Industry certificate']
            },
            {
                name: 'Career Pro',
                tag: 'Aggressive switchers',
                price: '₹1,45,000',
                emi: '₹14,500/mo on EMI',
                features: ['Everything in Mentor-Led', 'Dedicated career coach', 'Direct hiring referrals', 'Research-paper guidance', 'Placement until offer']
            }
        ]
    },
    {
        slug: 'full-stack',
        name: 'Full-Stack Development',
        Icon: Code2,
        duration: '7 months',
        accent: 'oklch(0.696 0.17 162)',
        tiers: [
            {
                name: 'Self-Paced',
                tag: 'For self-starters',
                price: '₹45,000',
                emi: '₹4,500/mo on EMI',
                features: ['Lifetime program access', 'Recorded MERN labs', 'Async PR reviews', 'Community forum access', 'Completion certificate']
            },
            {
                name: 'Mentor-Led',
                tag: 'Most chosen',
                price: '₹85,000',
                emi: '₹8,500/mo on EMI',
                recommended: true,
                features: ['Everything in Self-Paced', 'Live cohort (3–4/week)', 'Weekly code reviews', 'Production-grade capstones', '6 mock interviews', 'Industry certificate']
            },
            {
                name: 'Career Pro',
                tag: 'Aggressive switchers',
                price: '₹1,25,000',
                emi: '₹12,500/mo on EMI',
                features: ['Everything in Mentor-Led', 'Dedicated career coach', 'Direct hiring referrals', 'System-design interview prep', 'Placement until offer']
            }
        ]
    }
]

export default function EnrollmentTiers() {
    const navigate = useNavigate()
    const [active, setActive] = useState(0)
    const program = programs[active]

    return (
        <section
            id="pricing"
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Soft brand wash */}
            <div
                aria-hidden="true"
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[420px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse, var(--brand-soft) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }}
            />

            <div className="max-w-[1280px] mx-auto relative z-[1]">
                <div className="text-center max-w-[760px] mx-auto mb-12">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        <Sparkles size={12} /> Course Pricing
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium"
                        style={{ color: 'var(--text-primary)' }}>
                        Pricing for{' '}
                        <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                            every program.
                        </span>
                    </h2>
                    <p
                        className="mt-4 text-[15px]"
                        style={{ color: 'var(--text-secondary)' }}>
                        Transparent pricing per program. No-cost EMI on every plan. ISA available for Career Pro.
                    </p>
                </div>

                {/* Program switcher tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {programs.map((p, i) => {
                        const Icon = p.Icon
                        const isActive = i === active
                        return (
                            <button
                                key={p.slug}
                                onClick={() => setActive(i)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all"
                                style={{
                                    background: isActive ? 'var(--brand)' : 'var(--surface)',
                                    color: isActive ? 'var(--text-on-inverse)' : 'var(--text-primary)',
                                    border: '1px solid',
                                    borderColor: isActive ? 'var(--brand)' : 'var(--line)',
                                    boxShadow: isActive ? '0 8px 18px rgba(13,79,60,0.20)' : 'none'
                                }}>
                                <Icon size={14} />
                                {p.name}
                            </button>
                        )
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={program.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}>
                        {/* Program meta strip */}
                        <div
                            className="flex flex-wrap items-center justify-between gap-4 mb-6 px-5 py-4 rounded-2xl"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                                    style={{ background: program.accent, color: '#fff' }}>
                                    <program.Icon size={20} />
                                </div>
                                <div className="leading-tight">
                                    <div className="font-display text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {program.name}
                                    </div>
                                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                        {program.duration} · Live + Mentored · Beginner-friendly
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/programs/${program.slug}`)}
                                className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-transform hover:translate-x-1"
                                style={{ color: 'var(--brand)' }}>
                                View full curriculum <ArrowUpRight size={14} />
                            </button>
                        </div>

                        {/* Tier cards */}
                        <div className="grid md:grid-cols-3 gap-5">
                            {program.tiers.map((t, i) => (
                                <motion.div
                                    key={t.name}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: i * 0.05 }}
                                    className="relative rounded-3xl p-7 md:p-8 flex flex-col"
                                    style={{
                                        background: t.recommended ? 'var(--brand)' : 'var(--surface)',
                                        color: t.recommended ? 'var(--text-on-inverse)' : 'var(--text-primary)',
                                        border: t.recommended ? '1px solid var(--brand)' : '1px solid var(--line)',
                                        boxShadow: t.recommended ? 'var(--card-shadow-hover)' : 'var(--card-shadow)'
                                    }}>
                                    {t.recommended && (
                                        <span
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.16em] uppercase"
                                            style={{ background: 'var(--accent)', color: '#fff' }}>
                                            Most chosen
                                        </span>
                                    )}

                                    <div
                                        className="text-[11.5px] tracking-[0.18em] uppercase font-semibold mb-1.5"
                                        style={{ color: t.recommended ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>
                                        {t.tag}
                                    </div>
                                    <h3
                                        className="font-display text-[26px] font-semibold mb-5"
                                        style={{ color: t.recommended ? 'var(--text-on-inverse)' : 'var(--text-primary)' }}>
                                        {t.name}
                                    </h3>

                                    <div className="mb-5">
                                        <div
                                            className="font-display text-[40px] leading-none font-semibold tracking-[-0.02em]"
                                            style={{ color: t.recommended ? 'var(--text-on-inverse)' : 'var(--text-primary)' }}>
                                            {t.price}
                                        </div>
                                        <div
                                            className="text-[12px] mt-2"
                                            style={{ color: t.recommended ? 'rgba(255,255,255,0.65)' : 'var(--text-tertiary)' }}>
                                            or {t.emi}
                                        </div>
                                    </div>

                                    <ul className="space-y-2.5 mb-6 flex-1">
                                        {t.features.map((f, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                                                <CheckCircle2
                                                    size={15}
                                                    className="flex-shrink-0 mt-0.5"
                                                    style={{ color: t.recommended ? 'var(--accent)' : 'var(--brand)' }}
                                                />
                                                <span style={{ color: t.recommended ? 'rgba(255,255,255,0.92)' : 'var(--text-secondary)' }}>
                                                    {f}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => navigate('/contact')}
                                        className="w-full rounded-full py-3 text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all hover:translate-y-[-1px]"
                                        style={
                                            t.recommended
                                                ? { background: 'var(--text-on-inverse)', color: 'var(--brand)' }
                                                : { background: 'var(--brand)', color: 'var(--text-on-inverse)' }
                                        }>
                                        Enroll in {t.name} <ArrowUpRight size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <p
                    className="text-center text-[13px] mt-8"
                    style={{ color: 'var(--text-tertiary)' }}>
                    GST extra · Refundable within 7 days · Talk to a counsellor for ISA &amp; scholarship options
                </p>
            </div>
        </section>
    )
}
