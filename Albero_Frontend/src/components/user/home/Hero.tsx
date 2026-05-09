import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Star, Play, BarChart3, Brain, Code2, Database, Download, PhoneCall } from 'lucide-react'
import { useMagnet } from '@/hooks/useInteractive'
import { CurriculumDownloadModal } from './CurriculumDownloadModal'

interface HeroProps {
    eyebrow?: string
    title: string
    subtitle: string
    ctaLabel?: string
}

const programs = [
    { Icon: BarChart3, label: 'Business Analytics', meta: '6 months · Live' },
    { Icon: Database, label: 'Data Analytics', meta: '5 months · Live' },
    { Icon: Brain, label: 'AI / ML & GenAI', meta: '9 months · Flagship' },
    { Icon: Code2, label: 'Full-Stack Dev', meta: '7 months · MERN' }
]

const partners = [
    'Microsoft',
    'Amazon',
    'Razorpay',
    'Flipkart',
    'Adobe',
    'Swiggy',
    'Walmart',
    'Deloitte',
    'EY',
    'PhonePe',
    'Google',
    'PwC',
    'CRED',
    'Meesho',
    'Zerodha',
    'Paytm',
    'Zomato',
    'Infosys',
    'TCS',
    'Wipro',
    'Accenture',
    'IBM'
]

const stats = [
    { v: '12k+', l: 'Learners' },
    { v: '92%', l: 'Placed' },
    { v: '180+', l: 'Partners' },
    { v: '4.8/5', l: 'Rating' }
]

export function Hero({ subtitle }: HeroProps) {
    const navigate = useNavigate()
    const primaryCtaRef = useMagnet<HTMLButtonElement>({ strength: 12 })
    const secondaryCtaRef = useMagnet<HTMLButtonElement>({ strength: 8 })
    const [curriculumOpen, setCurriculumOpen] = useState(false)

    return (
        <section
            id="home"
            className="relative overflow-hidden flex flex-col lg:h-screen"
            style={{
                background: 'var(--page-bg)',
                color: 'var(--text-primary)',
                minHeight: '100svh'
            }}>
            {/* ── Background decor ── */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-[0.45]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 50%, transparent 90%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 50%, transparent 90%)'
                }}
            />
            <div
                aria-hidden="true"
                className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)',
                    filter: 'blur(40px)'
                }}
            />
            <div
                aria-hidden="true"
                className="absolute top-[55%] -left-40 w-[460px] h-[460px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
                    filter: 'blur(50px)'
                }}
            />

            <div
                className="relative max-w-[1280px] mx-auto w-full px-5 md:px-6 flex flex-col flex-1"
                style={{
                    paddingTop: 'clamp(96px, 11vh, 116px)',
                    paddingBottom: 'clamp(16px, 2.5vh, 28px)'
                }}>
                {/* Two-column hero — fills the available height */}
                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-center flex-1 min-h-0">
                    {/* ── Left ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col">
                        {/* Eyebrow */}
                        <div
                            className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <span
                                className="inline-block w-1.5 h-1.5 rounded-full"
                                style={{ background: 'var(--brand)' }}
                            />
                            India’s career-first learning platform
                            <span style={{ color: 'var(--text-tertiary)' }}>· est. 2024</span>
                        </div>

                        {/* Headline — tight 2-line lockup */}
                        <h1
                            className="font-display tracking-[-0.02em] mb-3"
                            style={{
                                color: 'var(--text-primary)',
                                fontSize: 'clamp(34px, 4.6vw, 58px)',
                                lineHeight: 1.0
                            }}>
                            <span className="font-medium">Become a</span>{' '}
                            <span
                                className="italic font-light"
                                style={{ color: 'var(--brand)' }}>
                                job-ready
                            </span>
                            <br />
                            <span className="font-medium">data pro in 6 months.</span>
                        </h1>

                        <p
                            className="leading-[1.5] max-w-[520px] mb-5"
                            style={{
                                color: 'var(--text-secondary)',
                                fontSize: 'clamp(13.5px, 1vw, 15.5px)'
                            }}>
                            {subtitle ||
                                'Live mentorship, real industry projects, and placement support — built around the four roles hiring managers actually pay for.'}
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <button
                                ref={primaryCtaRef}
                                onClick={() => navigate('/contact')}
                                className="px-5 py-2.5 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-2"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 6px 16px rgba(13,79,60,0.30)'
                                }}>
                                <PhoneCall size={13} /> Book Free Career Call
                            </button>
                            <button
                                ref={secondaryCtaRef}
                                onClick={() => setCurriculumOpen(true)}
                                className="px-5 py-2.5 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-2"
                                style={{
                                    background: 'var(--surface)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--line-strong)'
                                }}>
                                <Download size={13} /> Download Curriculum
                            </button>
                        </div>

                        <div
                            className="flex items-center gap-3 text-[12px] mb-5"
                            style={{ color: 'var(--text-tertiary)' }}>
                            <button
                                onClick={() => navigate('/resources/tutorials')}
                                className="inline-flex items-center gap-2 transition-colors"
                                style={{ color: 'var(--text-primary)' }}>
                                <span
                                    className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                    <Play
                                        size={9}
                                        className="ml-0.5"
                                    />
                                </span>
                                Watch 60-sec demo
                            </button>
                            <span>·</span>
                            <span>No credit card needed</span>
                        </div>

                        {/* Stats — compact horizontal */}
                        <div
                            className="grid grid-cols-4 gap-4 max-w-[480px] pt-4 border-t mt-auto"
                            style={{ borderColor: 'var(--line)' }}>
                            {stats.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}>
                                    <div
                                        className="font-display text-[20px] leading-none font-semibold"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {s.v}
                                    </div>
                                    <div
                                        className="text-[9.5px] tracking-[0.16em] uppercase mt-1"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        {s.l}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Right card ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="relative">
                        {/* Floating "rated" tag — top-left of card */}
                        <div
                            className="absolute -top-3 left-5 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 text-[10px] font-semibold z-[2]"
                            style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 8px 18px rgba(184,106,24,0.30)' }}>
                            <Star
                                size={10}
                                fill="currentColor"
                            />
                            Rated 4.8/5
                        </div>

                        {/* Co-certified by IBM + Microsoft — top-right of card. Hidden on
                            very narrow phones where it would overlap the rating pill. */}
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.4 }}
                            className="hidden sm:inline-flex absolute -top-3 right-3 px-3 py-1.5 rounded-full items-center gap-2 text-[10px] font-semibold z-[2]"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--brand-soft)',
                                color: 'var(--text-secondary)',
                                boxShadow: '0 8px 18px rgba(13,79,60,0.16)'
                            }}>
                            <span style={{ color: 'var(--brand)' }}>Certified by</span>
                            <span
                                className="inline-flex items-center"
                                style={{ color: '#0530AD' }}>
                                <svg
                                    viewBox="0 0 64 28"
                                    width={28}
                                    height={12}
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
                            </span>
                            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                            <span className="inline-flex items-center gap-1">
                                <svg
                                    viewBox="0 0 24 24"
                                    width={11}
                                    height={11}
                                    aria-hidden="true">
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
                                <span style={{ color: 'var(--text-primary)' }}>Microsoft</span>
                            </span>
                        </motion.div>

                        <div
                            className="rounded-3xl overflow-hidden"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow-hover)'
                            }}>
                            {/* Card header */}
                            <div
                                className="px-5 py-2.5 flex items-center justify-between border-b"
                                style={{ borderColor: 'var(--line)', background: 'var(--surface-2)' }}>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#ef4444' }}
                                    />
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#f59e0b' }}
                                    />
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#10b981' }}
                                    />
                                </div>
                                <span
                                    className="font-mono text-[10.5px] tracking-tight"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    albero.academy/programs
                                </span>
                                <span style={{ width: 32 }} />
                            </div>

                            {/* Card body */}
                            <div className="p-4">
                                <div
                                    className="text-[10px] tracking-[0.18em] uppercase mb-2.5 font-semibold"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    4 Career Tracks · Live + Mentor-led
                                </div>
                                <div className="space-y-1.5">
                                    {programs.map((p, i) => {
                                        const Icon = p.Icon
                                        const slug = ['business-analytics', 'data-analytics', 'data-science-ai', 'full-stack'][i]
                                        return (
                                            <motion.button
                                                key={p.label}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + i * 0.05 }}
                                                onClick={() => navigate(`/programs/${slug}`)}
                                                whileHover={{ x: 4 }}
                                                className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group"
                                                style={{
                                                    background: 'var(--surface-2)',
                                                    border: '1px solid var(--line)'
                                                }}>
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        className="font-display text-[14px] font-semibold leading-tight"
                                                        style={{ color: 'var(--text-primary)' }}>
                                                        {p.label}
                                                    </div>
                                                    <div
                                                        className="text-[10.5px] mt-0.5"
                                                        style={{ color: 'var(--text-tertiary)' }}>
                                                        {p.meta}
                                                    </div>
                                                </div>
                                                <ArrowUpRight
                                                    size={14}
                                                    className="transition-transform group-hover:rotate-45"
                                                    style={{ color: 'var(--text-tertiary)' }}
                                                />
                                            </motion.button>
                                        )
                                    })}
                                </div>

                                {/* Mini scoreboard — single row */}
                                <div
                                    className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t"
                                    style={{ borderColor: 'var(--line)' }}>
                                    <Mini
                                        value="₹12L"
                                        label="Avg salary"
                                    />
                                    <Mini
                                        value="180+"
                                        label="Partners"
                                    />
                                    <Mini
                                        value="9 mo"
                                        label="Avg duration"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Partner ticker — pinned at bottom of hero ── */}
                <div className="mt-4 flex-shrink-0">
                    <div
                        className="text-[9.5px] tracking-[0.22em] uppercase font-semibold text-center mb-2"
                        style={{ color: 'var(--text-tertiary)' }}>
                        Our learners now build at
                    </div>
                    <div
                        className="relative overflow-hidden"
                        style={{
                            maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)'
                        }}>
                        <div
                            className="flex gap-9 whitespace-nowrap"
                            style={{ animation: 'alb-marquee 55s linear infinite', width: 'max-content' }}>
                            {[...partners, ...partners].map((p, i) => (
                                <span
                                    key={i}
                                    className="font-display text-[18px] md:text-[20px] tracking-tight italic"
                                    style={{ color: 'var(--text-tertiary)', opacity: 0.65 }}>
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <CurriculumDownloadModal
                open={curriculumOpen}
                onClose={() => setCurriculumOpen(false)}
            />
        </section>
    )
}

function Mini({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <div
                className="font-display text-[16px] leading-none font-semibold"
                style={{ color: 'var(--text-primary)' }}>
                {value}
            </div>
            <div
                className="text-[9px] tracking-[0.16em] uppercase mt-1"
                style={{ color: 'var(--text-tertiary)' }}>
                {label}
            </div>
        </div>
    )
}
