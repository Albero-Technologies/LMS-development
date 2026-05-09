import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowUpRight,
    PhoneCall,
    Handshake,
    Wallet,
    Trophy,
    Award as AwardIcon,
    BarChart3,
    Database,
    Brain,
    Code2,
    Server,
    Shield,
    LineChart,
    PieChart,
    Clock,
    Briefcase,
    Users,
    CheckCircle2,
    Sparkles
} from 'lucide-react'
import SEO from '@/components/user/common/SEO'

type Program = {
    slug: string
    name: string
    fullName: string
    duration: string
    level: string
    investment: string
    seatBlock: string
    Icon: React.ComponentType<{ size?: number }>
    accent: string
    features: string[]
    cert?: 'ibm' | 'microsoft' | 'both'
}

const programs: Program[] = [
    {
        slug: 'business-analytics',
        name: 'Business Analytics',
        fullName: 'Business Analytics with Strategy',
        duration: '6 Months',
        level: 'Beginner to Advance',
        investment: '₹65,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: BarChart3,
        accent: 'oklch(0.795 0.184 86.047)',
        features: ['100% Placement Assistance', '1:1 Mentorship', '4 mock interviews', 'Microsoft Certified pathway'],
        cert: 'microsoft'
    },
    {
        slug: 'data-analytics',
        name: 'Data Analytics',
        fullName: 'Data Analytics with SQL & Python',
        duration: '5 Months',
        level: 'Beginner to Advance',
        investment: '₹75,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: Database,
        accent: 'oklch(0.623 0.214 259.815)',
        features: ['100% Placement Assistance', '1:1 Mentorship', '6 mock interviews', 'Microsoft PL-300 voucher'],
        cert: 'microsoft'
    },
    {
        slug: 'data-science-ai',
        name: 'Data Science',
        fullName: 'Data Science AI/ML with Agentic AI',
        duration: '9 Months',
        level: 'Beginner to Advance',
        investment: '₹95,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: Brain,
        accent: 'oklch(0.627 0.265 303.9)',
        features: ['100% Placement Assistance', '1:1 Mentorship', 'IBM SkillsBuild + MS AI-900', 'Capstone with LLMs'],
        cert: 'both'
    },
    {
        slug: 'full-stack',
        name: 'Full Stack Development',
        fullName: 'Full Stack Development with Gen AI',
        duration: '7 Months',
        level: 'Beginner to Advance',
        investment: '₹85,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: Code2,
        accent: 'oklch(0.696 0.17 162)',
        features: ['100% Placement Assistance', '1:1 Mentorship', 'Production capstones', 'System-design prep']
    },
    {
        slug: 'data-engineering',
        name: 'Data Engineering',
        fullName: 'Data Engineering with Cloud',
        duration: '7 Months',
        level: 'Intermediate',
        investment: '₹85,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: Server,
        accent: 'oklch(0.645 0.246 16.439)',
        features: ['100% Placement Assistance', '1:1 Mentorship', 'IBM Cloud + Azure credits', 'ETL pipeline capstone'],
        cert: 'ibm'
    },
    {
        slug: 'cybersecurity',
        name: 'Cybersecurity',
        fullName: 'Cybersecurity with SOC & Pentest',
        duration: '6 Months',
        level: 'Beginner to Advance',
        investment: '₹70,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: Shield,
        accent: 'oklch(0.696 0.17 192)',
        features: ['100% Placement Assistance', '1:1 Mentorship', 'CTF-style capstones', 'OWASP deep-dives']
    },
    {
        slug: 'investment-banking',
        name: 'Investment Banking',
        fullName: 'Investment Banking & Valuations',
        duration: '5 Months',
        level: 'Beginner to Advance',
        investment: '₹80,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: LineChart,
        accent: 'oklch(0.55 0.22 280)',
        features: ['100% Placement Assistance', '1:1 Mentorship', 'Live deal walk-throughs', 'Bulge-bracket mocks']
    },
    {
        slug: 'product-analytics',
        name: 'Product Analytics',
        fullName: 'Product Analytics with Mixpanel',
        duration: '4 Months',
        level: 'Beginner to Advance',
        investment: '₹60,000/-',
        seatBlock: 'Reserve Slot with ₹5,000',
        Icon: PieChart,
        accent: 'oklch(0.7 0.2 30)',
        features: ['100% Placement Assistance', '1:1 Mentorship', 'A/B testing capstone', 'Microsoft Certified pathway'],
        cert: 'microsoft'
    }
]

const heroStats = [
    { v: '18,000+', l: 'Learners trained' },
    { v: '95%', l: 'Placement rate' },
    { v: '400+', l: 'Hiring partners' }
]

const trustCards = [
    { v: '400+', l: 'Hiring Partners', Icon: Handshake },
    { v: '100%', l: 'Placement Assistance', Icon: Trophy },
    { v: '1:1', l: 'Mentorship', Icon: Users },
    { v: '5,000+', l: 'Certificates Issued', Icon: AwardIcon }
]

export default function PricingPage() {
    const navigate = useNavigate()

    return (
        <div>
            <SEO
                title="Pricing — Albero Academy"
                description="Honest, upfront pricing for every Albero Academy programme. No hidden fees, 0% EMI for up to 18 months, and a 7-day refund guarantee — backed by end-to-end placement support."
                url="/pricing"
                canonical="/pricing"
            />

            {/* ── HERO — dark transparent pricing ── */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        'radial-gradient(ellipse at 65% 50%, #0d2740 0%, #061026 60%, #04081a 100%)',
                    color: '#f8f6ee'
                }}>
                {/* Grid backdrop */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.10]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse 80% 70% at 30% 50%, #000 30%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 30% 50%, #000 30%, transparent 90%)'
                    }}
                />
                {/* Glow */}
                <div
                    aria-hidden="true"
                    className="absolute -top-40 right-[-15%] w-[700px] h-[700px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)',
                        filter: 'blur(40px)'
                    }}
                />

                <div className="relative max-w-[1280px] mx-auto px-5 md:px-8 pt-[140px] pb-24 md:pb-32 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span
                                className="inline-block w-12 h-[2px] rounded-full"
                                style={{ background: '#34d399' }}
                            />
                            <span
                                className="text-[11px] tracking-[0.28em] uppercase font-semibold"
                                style={{ color: '#34d399' }}>
                                Transparent Pricing
                            </span>
                        </div>

                        <h1
                            className="font-display tracking-[-0.02em] mb-5"
                            style={{ fontSize: 'clamp(40px, 6vw, 76px)', lineHeight: 0.96, color: '#f8f6ee' }}>
                            <span className="font-medium">Invest in skills.</span>
                            <br />
                            <span
                                className="font-medium"
                                style={{
                                    background: 'linear-gradient(90deg, #6ee7b7, #34d399)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    paddingBottom: 6,
                                    borderBottom: '3px solid #34d399',
                                    display: 'inline-block'
                                }}>
                                Get a career.
                            </span>
                        </h1>

                        <p
                            className="text-[16px] md:text-[17px] leading-relaxed max-w-[560px] mb-6"
                            style={{ color: 'rgba(248,246,238,0.78)' }}>
                            Honest, upfront pricing for every Albero Academy programme. No hidden fees, 0% EMI for up to 18 months,
                            and a 7-day refund guarantee — backed by end-to-end placement support.
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-[13.5px]" style={{ color: 'rgba(248,246,238,0.7)' }}>
                            <span className="inline-flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                                0% EMI up to 18 months
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                                7-day refund guarantee
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                                ₹5,000 seat block
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <button
                                onClick={() => {
                                    document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                                className="px-6 py-3.5 rounded-full text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px]"
                                style={{
                                    background: '#a7f3d0',
                                    color: '#04081a',
                                    boxShadow: '0 8px 22px rgba(167,243,208,0.25)'
                                }}>
                                Browse Programmes <ArrowUpRight size={15} />
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-6 py-3.5 rounded-full text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px]"
                                style={{
                                    background: 'transparent',
                                    color: '#f8f6ee',
                                    border: '1px solid rgba(255,255,255,0.18)'
                                }}>
                                <PhoneCall size={14} /> Talk to an Advisor
                            </button>
                        </div>

                        {/* Hero stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-[520px]">
                            {heroStats.map((s) => (
                                <div key={s.l}>
                                    <div
                                        className="font-display text-[28px] md:text-[34px] leading-none font-semibold tracking-[-0.02em]"
                                        style={{ color: '#f8f6ee' }}>
                                        {s.v}
                                    </div>
                                    <div
                                        className="text-[11px] tracking-[0.16em] uppercase mt-2"
                                        style={{ color: 'rgba(248,246,238,0.55)' }}>
                                        {s.l}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Floating chips on the right */}
                    <div className="relative h-[440px] hidden lg:block">
                        {/* Center pulse ring */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full"
                            style={{ border: '1px dashed rgba(255,255,255,0.16)' }}
                        />
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full"
                            style={{ border: '1px dashed rgba(255,255,255,0.10)' }}
                        />
                        <motion.span
                            aria-hidden="true"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                            style={{ background: '#34d399', boxShadow: '0 0 16px #34d399' }}
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />

                        <ChipFloat
                            label="400+ partners"
                            sub="Hiring network"
                            Icon={Handshake}
                            style={{ top: 30, left: 60 }}
                        />
                        <ChipFloat
                            label="0% EMI"
                            sub="Up to 18 months"
                            Icon={Wallet}
                            style={{ top: 180, right: -10 }}
                            highlight
                        />
                        <ChipFloat
                            label="100% placement"
                            sub="Assistance"
                            Icon={Trophy}
                            style={{ bottom: 30, left: 30 }}
                        />
                    </div>
                </div>
            </section>

            {/* ── Trust strip — 4 stat cards ── */}
            <section className="relative -mt-12 md:-mt-16 px-5 md:px-8 pb-12 md:pb-16">
                <div className="max-w-[1280px] mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {trustCards.map(({ v, l, Icon }) => (
                            <motion.div
                                key={l}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.4 }}
                                className="rounded-2xl p-6 md:p-7 text-center"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow-hover)'
                                }}>
                                <div
                                    className="w-11 h-11 mx-auto rounded-xl inline-flex items-center justify-center mb-3"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <Icon size={20} />
                                </div>
                                <div
                                    className="font-display text-[34px] md:text-[40px] leading-none font-semibold tracking-[-0.02em]"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {v}
                                </div>
                                <div
                                    className="text-[12.5px] mt-2"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    {l}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── IBM × Microsoft trust banner ── */}
            <section className="relative px-5 md:px-8 pb-4">
                <div className="max-w-[1280px] mx-auto">
                    <div
                        className="rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow)'
                        }}>
                        <div className="flex items-center gap-4">
                            <span
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10.5px] font-bold tracking-[0.18em] uppercase"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <Sparkles size={11} /> Strategic partner pricing
                            </span>
                            <div className="hidden md:block leading-tight">
                                <div className="font-display text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Every flagship programme includes IBM + Microsoft credentials
                                </div>
                                <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                    Exam vouchers, cloud credits, and co-branded badges — all included in the price.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ background: 'var(--surface-2)', border: '1px solid rgba(5,48,173,0.20)' }}>
                                <span style={{ color: '#0530AD' }}>
                                    <svg viewBox="0 0 64 28" width={32} height={14} aria-label="IBM" role="img">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <rect key={i} x={i * 8} y="2" width="6" height="3.2" fill="currentColor" />
                                        ))}
                                        <text x="0" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight={800} fontSize="14" letterSpacing="2" fill="currentColor">
                                            IBM
                                        </text>
                                    </svg>
                                </span>
                                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>SkillsBuild</span>
                            </span>
                            <span
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ background: 'var(--surface-2)', border: '1px solid rgba(0,120,212,0.20)' }}>
                                <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
                                    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                                    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                                    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                                    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                                </svg>
                                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Microsoft Certified</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Programmes ── */}
            <section
                id="programs"
                className="relative py-16 md:py-24 px-5 md:px-8"
                style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
                <div className="max-w-[1280px] mx-auto">
                    <div className="text-center max-w-[760px] mx-auto mb-14">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            <Sparkles size={12} /> Choose your programme
                        </div>
                        <h2
                            className="font-display text-[40px] md:text-[58px] leading-[0.96] tracking-[-0.02em] font-medium"
                            style={{ color: 'var(--text-primary)' }}>
                            Pick the programme that{' '}
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                fits your goals.
                            </span>
                        </h2>
                        <p
                            className="mt-4 text-[15.5px] leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}>
                            Eight career-grade programmes — built with industry, taught by practitioners, and backed by end-to-end placement support.
                        </p>
                    </div>

                    {/* Program cards grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {programs.map((p, i) => (
                            <ProgramCard
                                key={p.fullName + i}
                                p={p}
                                onView={() => navigate(`/programs/${p.slug}`)}
                                onReserve={() => navigate(`/programs/${p.slug}`)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section
                className="relative py-20 px-5 md:px-8"
                style={{ background: 'var(--page-bg-soft)' }}>
                <div className="max-w-[1080px] mx-auto">
                    <div
                        className="rounded-[24px] p-8 md:p-12 relative overflow-hidden text-center"
                        style={{
                            background: 'var(--brand)',
                            color: 'var(--text-on-inverse)'
                        }}>
                        <div
                            aria-hidden="true"
                            className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.32, filter: 'blur(50px)' }}
                        />
                        <h3
                            className="font-display text-[28px] md:text-[42px] leading-tight tracking-[-0.02em] font-medium relative z-[1]">
                            Not sure which programme fits you?
                        </h3>
                        <p
                            className="mt-3 text-[15.5px] max-w-[560px] mx-auto relative z-[1]"
                            style={{ color: 'rgba(255,255,255,0.78)' }}>
                            A senior counsellor will map your background and goals to the right track —
                            and tell you honestly if Albero isn't right for you.
                        </p>
                        <button
                            onClick={() => navigate('/contact')}
                            className="mt-6 px-6 py-3.5 rounded-full text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-transform hover:translate-y-[-1px] relative z-[1]"
                            style={{
                                background: 'var(--text-on-inverse)',
                                color: 'var(--brand)'
                            }}>
                            <PhoneCall size={14} /> Book a Free Career Call <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

// ── Program card ─────────────────────────────────────────────────────────────

function ProgramCard({
    p,
    onView,
    onReserve
}: {
    p: Program
    onView: () => void
    onReserve: () => void
}) {
    const Icon = p.Icon
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl overflow-hidden flex flex-col"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--card-shadow)'
            }}>
            {/* Top green band */}
            <div
                className="relative px-6 pt-6 pb-12"
                style={{
                    background: `linear-gradient(135deg, var(--brand) 0%, ${p.accent} 200%)`,
                    color: 'var(--text-on-inverse)'
                }}>
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.10]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 14px)'
                    }}
                />
                <div className="relative z-[1] flex items-start justify-between">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.16em] uppercase"
                        style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.92)' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a7f3d0' }} />
                        Program
                    </div>
                    <div
                        className="w-11 h-11 rounded-full inline-flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>
                        <Icon size={18} />
                    </div>
                </div>
                <h3
                    className="relative z-[1] mt-6 font-display text-[26px] leading-tight font-semibold"
                    style={{ color: '#fff' }}>
                    {p.name}
                </h3>

                {/* Certified-by floating chip — pinned to bottom-right of band */}
                {p.cert && (
                    <div className="absolute z-[2] bottom-3 right-3 flex items-center gap-1">
                        {(p.cert === 'ibm' || p.cert === 'both') && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-bold tracking-tight"
                                title="IBM SkillsBuild Badge"
                                style={{ background: '#fff', color: '#0530AD' }}>
                                <svg viewBox="0 0 64 28" width={22} height={9} aria-hidden="true">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <rect key={i} x={i * 8} y="2" width="6" height="3.2" fill="currentColor" />
                                    ))}
                                    <text x="0" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight={800} fontSize="14" letterSpacing="2" fill="currentColor">
                                        IBM
                                    </text>
                                </svg>
                                Certified
                            </span>
                        )}
                        {(p.cert === 'microsoft' || p.cert === 'both') && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-bold tracking-tight"
                                title="Microsoft Certified pathway"
                                style={{ background: '#fff', color: '#0078D4' }}>
                                <svg viewBox="0 0 24 24" width={10} height={10} aria-hidden="true">
                                    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                                    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                                    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                                    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                                </svg>
                                Microsoft
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Level pill — straddles the band */}
            <div className="relative px-6 -mt-4 mb-4 flex justify-center">
                <span
                    className="inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{
                        background: 'var(--surface)',
                        color: 'var(--brand)',
                        border: '1px solid var(--brand-soft)',
                        boxShadow: '0 4px 10px rgba(13,79,60,0.10)'
                    }}>
                    {p.level}
                </span>
            </div>

            {/* Cert callout under the band — explains the credential included */}
            {p.cert && (
                <div className="px-6 mb-4">
                    <div
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                        style={{
                            background: 'var(--brand-soft)',
                            border: '1px solid rgba(13,79,60,0.18)'
                        }}>
                        <span className="text-[16px]">🎓</span>
                        <span className="text-[12px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {p.cert === 'both'
                                ? 'Includes IBM badge + Microsoft exam voucher'
                                : p.cert === 'ibm'
                                  ? 'Includes IBM SkillsBuild badge + exam voucher'
                                  : 'Includes Microsoft Certified pathway + exam voucher'}
                        </span>
                    </div>
                </div>
            )}

            <div className="px-6 pb-6 flex flex-col flex-1">
                <h4
                    className="font-display text-[18px] font-semibold leading-tight mb-4"
                    style={{ color: 'var(--text-primary)' }}>
                    {p.fullName}
                </h4>

                <ul className="space-y-2.5 mb-5">
                    <li className="flex items-center gap-2.5 text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
                        <Clock size={15} style={{ color: 'var(--brand)' }} />
                        Duration: {p.duration}
                    </li>
                    {p.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
                            {j === 0 ? (
                                <Briefcase size={15} style={{ color: 'var(--brand)' }} />
                            ) : j === 1 ? (
                                <Users size={15} style={{ color: 'var(--brand)' }} />
                            ) : (
                                <CheckCircle2 size={15} style={{ color: 'var(--brand)' }} />
                            )}
                            {f}
                        </li>
                    ))}
                </ul>

                {/* Investment box */}
                <div
                    className="rounded-2xl px-5 py-4 mb-4 text-center"
                    style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--line)'
                    }}>
                    <div
                        className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-1"
                        style={{ color: 'var(--text-tertiary)' }}>
                        Course Investment
                    </div>
                    <div
                        className="font-display text-[28px] md:text-[30px] leading-none font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--text-primary)' }}>
                        {p.investment}
                    </div>
                </div>

                <button
                    onClick={onReserve}
                    className="w-full rounded-full py-3 text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 mb-2 transition-transform hover:translate-y-[-1px]"
                    style={{
                        background: '#0a0e1f',
                        color: '#fff'
                    }}>
                    {p.seatBlock}
                </button>
                <button
                    onClick={onView}
                    className="w-full rounded-full py-3 text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                    style={{
                        background: 'transparent',
                        color: 'var(--brand)',
                        border: '1px solid var(--brand-soft)'
                    }}>
                    Explore the program <ArrowUpRight size={13} />
                </button>
            </div>
        </motion.div>
    )
}

// ── Floating chip used on hero ───────────────────────────────────────────────

function ChipFloat({
    label,
    sub,
    Icon,
    style,
    highlight
}: {
    label: string
    sub: string
    Icon: React.ComponentType<{ size?: number }>
    style?: React.CSSProperties
    highlight?: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inline-flex items-center gap-3 px-4 py-3 rounded-full"
            style={{
                background: highlight ? 'rgba(52,211,153,0.10)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${highlight ? 'rgba(52,211,153,0.36)' : 'rgba(255,255,255,0.14)'}`,
                color: '#f8f6ee',
                backdropFilter: 'blur(8px)',
                ...style
            }}>
            <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                style={{
                    background: highlight ? 'rgba(52,211,153,0.20)' : 'rgba(255,255,255,0.10)',
                    color: highlight ? '#34d399' : '#cbd5e1'
                }}>
                <Icon size={16} />
            </span>
            <div className="leading-tight">
                <div className="font-display text-[15px] font-semibold tracking-tight" style={{ color: '#f8f6ee' }}>
                    {label}
                </div>
                <div className="text-[11px]" style={{ color: 'rgba(248,246,238,0.6)' }}>
                    {sub}
                </div>
            </div>
        </motion.div>
    )
}
