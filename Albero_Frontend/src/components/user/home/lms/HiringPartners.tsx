import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { Building2, TrendingUp, Users, Briefcase, ArrowUpRight, Zap } from 'lucide-react'

type Partner = { name: string; slug: string; color: string; role: string }

const row1: Partner[] = [
    { name: 'Microsoft', slug: 'microsoft', color: '#0078D4', role: 'Cloud Data Architect' },
    { name: 'Amazon', slug: 'amazon', color: '#FF9900', role: 'Data Engineer' },
    { name: 'Google', slug: 'google', color: '#4285F4', role: 'AI / ML Engineer' },
    { name: 'Adobe', slug: 'adobe', color: '#FF0000', role: 'Analytics Engineer' },
    { name: 'Razorpay', slug: 'razorpay', color: '#2563eb', role: 'Backend Engineer' },
    { name: 'Flipkart', slug: 'flipkart', color: '#2874F0', role: 'Data Scientist' },
    { name: 'Swiggy', slug: 'swiggy', color: '#FC8019', role: 'Product Analyst' },
    { name: 'Walmart', slug: 'walmart', color: '#0071CE', role: 'ML Engineer' },
    { name: 'Deloitte', slug: 'deloitte', color: '#86BC25', role: 'Analytics Consultant' },
    { name: 'PwC', slug: 'pwc', color: '#D04A02', role: 'Data Consultant' },
    { name: 'IBM', slug: 'ibm', color: '#0530AD', role: 'Data Platform Engineer' },
    { name: 'Accenture', slug: 'accenture', color: '#A100FF', role: 'Tech Consultant' },
]

const row2: Partner[] = [
    { name: 'Zomato', slug: 'zomato', color: '#E23744', role: 'ML Engineer' },
    { name: 'Paytm', slug: 'paytm', color: '#00BAF2', role: 'Risk Analyst' },
    { name: 'PhonePe', slug: 'phonepe', color: '#5F259F', role: 'Data Analyst' },
    { name: 'Uber', slug: 'uber', color: '#1a1a1a', role: 'Applied ML' },
    { name: 'Meta', slug: 'meta', color: '#0866FF', role: 'Research Engineer' },
    { name: 'Netflix', slug: 'netflix', color: '#E50914', role: 'Media Tech Lead' },
    { name: 'Salesforce', slug: 'salesforce', color: '#00A1E0', role: 'BI Developer' },
    { name: 'Airbnb', slug: 'airbnb', color: '#FF5A5F', role: 'Data Analyst' },
    { name: 'Spotify', slug: 'spotify', color: '#1DB954', role: 'Insights Analyst' },
    { name: 'Infosys', slug: 'infosys', color: '#007CC3', role: 'Software Engineer' },
    { name: 'TCS', slug: 'tcs', color: '#1B72B8', role: 'Data Scientist' },
    { name: 'Wipro', slug: 'wipro', color: '#5c2d7e', role: 'AI Engineer' },
]

const row3: Partner[] = [
    { name: 'JPMorgan', slug: 'jpmorgan', color: '#005EB8', role: 'Quant Analyst' },
    { name: 'Goldman Sachs', slug: 'goldmansachs', color: '#7399C6', role: 'IB Analyst' },
    { name: 'EY', slug: 'ey', color: '#c8a800', role: 'Business Analyst' },
    { name: 'KPMG', slug: 'kpmg', color: '#00338D', role: 'Risk Analytics' },
    { name: 'Capgemini', slug: 'capgemini', color: '#0070AD', role: 'Data Analyst' },
    { name: 'Tech Mahindra', slug: 'techmahindra', color: '#DD1B21', role: 'DevOps Engineer' },
    { name: 'Genpact', slug: 'genpact', color: '#7B2D8B', role: 'Process Automation' },
    { name: 'Fractal', slug: 'fractal', color: '#F47920', role: 'Decision Scientist' },
    { name: 'GlobalLogic', slug: 'globallogic', color: '#0097D7', role: 'Solutions Architect' },
    { name: 'Autodesk', slug: 'autodesk', color: '#0696D7', role: 'ML Engineer' },
    { name: 'AXA', slug: 'axa', color: '#00008F', role: 'ML Operations' },
    { name: 'AT&T', slug: 'att', color: '#00A8E0', role: 'Platform Engineer' },
]

const row4: Partner[] = [
    { name: 'Sony', slug: 'sony', color: '#1a1a1a', role: 'Media Tech Lead' },
    { name: 'Booking.com', slug: 'bookingcom', color: '#003580', role: 'Data Analyst' },
    { name: 'Turing', slug: 'turing', color: '#c2410c', role: 'Remote AI Engineer' },
    { name: 'IDFC First Bank', slug: 'idfcfirstbank', color: '#E31E24', role: 'Risk Analyst' },
    { name: 'EaseMyTrip', slug: 'easemytrip', color: '#FF6600', role: 'BI Developer' },
    { name: 'HDFC Bank', slug: 'hdfcbank', color: '#004C8F', role: 'Forecasting Analyst' },
    { name: 'Zepto', slug: 'zepto', color: '#9B30FF', role: 'Growth Analyst' },
    { name: 'Saint-Gobain', slug: 'saintgobain', color: '#003D7C', role: 'Data Analyst' },
    { name: 'Uptime AI', slug: 'uptimeai', color: '#16a34a', role: 'Applied ML' },
    { name: 'SpringWorks', slug: 'springworks', color: '#7B2FF7', role: 'Product Engineer' },
    { name: 'Axis Bank', slug: 'axisbank', color: '#800000', role: 'ML Operations' },
    { name: 'Zeta', slug: 'zeta', color: '#e11d48', role: 'Platform Engineer' },
]

const ROWS = [
    { items: row1, duration: 55, reverse: false },
    { items: row2, duration: 68, reverse: true },
    { items: row3, duration: 60, reverse: false },
    { items: row4, duration: 72, reverse: true },
]

const STATS = [
    { value: 180, suffix: '+', label: 'Hiring partners', icon: Building2 },
    { value: 94, suffix: '%', label: 'Placement rate', icon: TrendingUp },
    { value: 4200, suffix: '+', label: 'Learners placed', icon: Users },
    { value: 32, suffix: ' LPA', label: 'Highest package', icon: Briefcase },
]

const TICKER_ITEMS = [
    'Aditya → Google · ML Engineer',
    'Priya → JPMorgan · Quant Analyst',
    'Rahul → Microsoft · Data Architect',
    'Sneha → Netflix · Media Tech Lead',
    'Arjun → Razorpay · Backend Engineer',
    'Kavya → Deloitte · Analytics Consultant',
    'Vikram → Meta · Research Engineer',
    'Divya → Flipkart · Data Scientist',
    'Rohan → Goldman Sachs · IB Analyst',
    'Anjali → Adobe · Analytics Engineer',
]

const CATEGORIES = [
    { label: 'Big Tech', count: '38' },
    { label: 'BFSI', count: '42' },
    { label: 'Consulting', count: '29' },
    { label: 'Product', count: '31' },
    { label: 'Startups', count: '24' },
    { label: 'D2C', count: '11' },
    { label: 'FinTech', count: '18' },
    { label: 'Media', count: '9' },
]

// Animated counter
function Counter({ to, suffix }: { to: number; suffix: string }) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    useEffect(() => {
        if (!inView) return
        let start = 0
        const duration = 1800
        const step = (timestamp: number) => {
            if (!start) start = timestamp
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * to))
            if (progress < 1) requestAnimationFrame(step)
            else setCount(to)
        }
        requestAnimationFrame(step)
    }, [inView, to])

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const LogoTile = memo(function LogoTile({ p }: { p: Partner }) {
    const [hovered, setHovered] = useState(false)
    const onEnter = useCallback(() => setHovered(true), [])
    const onLeave = useCallback(() => setHovered(false), [])

    return (
        <div
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="relative flex-shrink-0 mx-2 cursor-pointer overflow-hidden"
            style={{
                width: 220,
                height: 92,
                borderRadius: 18,
                background: hovered
                    ? `linear-gradient(135deg, ${p.color}18 0%, ${p.color}08 100%)`
                    : 'var(--surface)',
                border: `1px solid ${hovered ? p.color + '60' : 'var(--line)'}`,
                boxShadow: hovered
                    ? `0 8px 32px ${p.color}28, 0 0 0 1px ${p.color}20 inset`
                    : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
                transform: hovered ? 'translateY(-3px) scale(1.015)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
            {/* Shimmer sweep */}
            <span
                aria-hidden
                style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(105deg, transparent 40%, ${p.color}18 50%, transparent 60%)`,
                    backgroundSize: '200% 100%',
                    backgroundPosition: hovered ? '-200% 0' : '200% 0',
                    transition: 'background-position 0.6s ease-out',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                }}
            />
            {/* Top accent bar */}
            <span
                aria-hidden
                style={{
                    position: 'absolute', top: 0, left: 24, right: 24, height: 2,
                    borderRadius: '0 0 4px 4px',
                    background: p.color,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.3s',
                }}
            />
            <div className="relative flex flex-col items-center justify-center h-full gap-1.5 px-5">
                <div className="flex items-center gap-2.5">
                    <img
                        src={`https://cdn.simpleicons.org/${p.slug}/${p.color.replace('#', '')}`}
                        alt={p.name}
                        width={22}
                        height={22}
                        loading="lazy"
                        className="flex-shrink-0"
                        onError={(e) => {
                            const img = e.currentTarget
                            const fb = document.createElement('span')
                            fb.textContent = p.name.charAt(0)
                            fb.setAttribute('style',
                                `display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;font-weight:800;font-size:11px;background:${p.color};color:#fff;flex-shrink:0`)
                            img.replaceWith(fb)
                        }}
                    />
                    <span
                        className="font-display font-semibold whitespace-nowrap"
                        style={{ fontSize: 14, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                        {p.name}
                    </span>
                </div>
                <span
                    className="whitespace-nowrap font-medium"
                    style={{
                        fontSize: 11,
                        color: hovered ? p.color : 'var(--text-tertiary)',
                        transition: 'color 0.25s',
                        letterSpacing: '0.01em',
                    }}>
                    {p.role}
                </span>
            </div>
        </div>
    )
})

const MarqueeRow = memo(function MarqueeRow({
    items, reverse = false, duration = 55,
}: { items: Partner[]; reverse?: boolean; duration?: number }) {
    const doubled = [...items, ...items]
    return (
        <div
            className="relative overflow-hidden"
            style={{
                maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            }}>
            <div
                className="flex py-1"
                style={{
                    animation: `alb-marquee ${duration}s linear infinite`,
                    animationDirection: reverse ? 'reverse' : 'normal',
                    width: 'max-content',
                }}>
                {doubled.map((p, i) => <LogoTile key={`${p.slug}-${i}`} p={p} />)}
            </div>
        </div>
    )
})

export default function HiringPartners() {
    return (
        <section
            className="relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>

            <style>{`
                @keyframes hp-ticker {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                @keyframes hp-pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.45; transform: scale(0.65); }
                }
            `}</style>

            {/* ── Live placement ticker ── */}
            <div
                className="relative overflow-hidden py-2.5 border-b"
                style={{ background: 'var(--brand)', borderColor: 'transparent' }}>
                <div
                    className="flex whitespace-nowrap"
                    style={{ animation: 'hp-ticker 40s linear infinite', width: 'max-content' }}>
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-2.5 mx-8 font-medium"
                            style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.025em' }}>
                            <span style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.65)',
                                display: 'inline-block',
                                animation: `hp-pulse-dot 2s ease-in-out infinite`,
                                animationDelay: `${(i % 5) * 0.35}s`,
                                flexShrink: 0,
                            }} />
                            {item}
                        </span>
                    ))}
                </div>
                <span aria-hidden style={{ position: 'absolute', inset: '0 auto 0 0', width: 64,
                    background: 'linear-gradient(90deg, var(--brand), transparent)', pointerEvents: 'none' }} />
                <span aria-hidden style={{ position: 'absolute', inset: '0 0 0 auto', width: 64,
                    background: 'linear-gradient(-90deg, var(--brand), transparent)', pointerEvents: 'none' }} />
            </div>

            {/* ── Main body ── */}
            <div className="py-20 px-5 md:px-8">
                <div className="max-w-[1280px] mx-auto">

                    {/* ── Header ── */}
                    <div className="grid md:grid-cols-[1fr_360px] gap-12 items-end mb-14">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}>
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <Building2 size={11} /> Hiring partners
                            </div>
                            <h2
                                className="font-display font-medium"
                                style={{
                                    fontSize: 'clamp(36px, 5.5vw, 62px)',
                                    lineHeight: 0.94,
                                    letterSpacing: '-0.025em',
                                    color: 'var(--text-primary)',
                                }}>
                                Where our learners
                                <br />
                                <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                    get hired.
                                </span>
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}>
                            <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                                Active hiring relationships with 180+ teams across product, BFSI,
                                consulting, and big tech. Mentor referrals route directly into
                                hiring-manager inboxes.
                            </p>
                            <a
                                href="#"
                                className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                View all placement stories <ArrowUpRight size={14} />
                            </a>
                        </motion.div>
                    </div>

                    {/* ── Stats rail ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
                        {STATS.map(({ value, suffix, label, icon: Icon }) => (
                            <div
                                key={label}
                                className="relative rounded-2xl p-5 overflow-hidden"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                }}>
                                <span aria-hidden style={{
                                    position: 'absolute', bottom: -20, right: -20,
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: 'var(--brand)', opacity: 0.06,
                                    filter: 'blur(20px)', pointerEvents: 'none',
                                }} />
                                <Icon size={15} style={{ color: 'var(--brand)', marginBottom: 10 }} />
                                <div
                                    className="font-display font-semibold"
                                    style={{ fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                                    <Counter to={value} suffix={suffix} />
                                </div>
                                <div className="mt-1.5 text-[12px] font-medium" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.01em' }}>
                                    {label}
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* ── Marquee rows ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.6 }}
                        className="space-y-3 -mx-5 md:-mx-8">
                        {ROWS.map(({ items, duration, reverse }, idx) => (
                            <MarqueeRow key={idx} items={items} duration={duration} reverse={reverse} />
                        ))}
                    </motion.div>

                    {/* ── Sectors with counts ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                                Sectors we cover
                            </span>
                            <span aria-hidden style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(({ label, count }) => (
                                <div
                                    key={label}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
                                    style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                                    <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {label}
                                    </span>
                                    <span
                                        className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Bottom CTA strip ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl px-6 py-4"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                        <div className="flex items-center gap-3">
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 36, height: 36, borderRadius: 10, background: 'var(--brand-soft)',
                                flexShrink: 0,
                            }}>
                                <Zap size={16} style={{ color: 'var(--brand)' }} />
                            </span>
                            <div>
                                <div className="text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Referrals that actually land
                                </div>
                                <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                                    Mentors with active roles route your profile directly to hiring managers.
                                </div>
                            </div>
                        </div>
                        <a
                            href="#"
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold"
                            style={{
                                background: 'var(--brand)',
                                color: 'var(--text-on-inverse)',
                                boxShadow: '0 4px 12px rgba(13,79,60,0.22)',
                                whiteSpace: 'nowrap',
                            }}>
                            See how it works <ArrowUpRight size={13} />
                        </a>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}