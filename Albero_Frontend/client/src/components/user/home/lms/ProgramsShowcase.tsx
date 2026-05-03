import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
    BarChart3,
    Database,
    Brain,
    Code2,
    Shield,
    LineChart,
    PieChart,
    Server,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Clock,
    Users,
    GraduationCap,
    TrendingUp
} from 'lucide-react'

type Program = {
    slug: string
    name: string
    tagline: string
    description: string
    duration: string
    mode: string
    level: string
    salary: string
    next: string
    badge?: string
    Icon: React.ComponentType<{ size?: number }>
    accent: string
    skills: string[]
    highlights: string[]
    cert?: 'ibm' | 'microsoft' | 'both'
}

const programs: Program[] = [
    {
        slug: 'business-analytics',
        name: 'Business Analytics',
        tagline: 'For consulting, BI, and strategy roles',
        description: 'Frame business problems, analyse them with SQL and BI tools, and present insights that move the P&L.',
        duration: '6 months',
        mode: 'Live + Mentored',
        level: 'Beginner-friendly',
        salary: '₹6–14 LPA',
        next: '12 May',
        Icon: BarChart3,
        accent: 'oklch(0.795 0.184 86.047)',
        skills: ['Excel', 'SQL', 'Power BI', 'Tableau', 'Storytelling', 'Case Frameworks'],
        highlights: ['8 case-study capstones', 'Consulting frameworks', 'Live BI dashboards', '4 mock interviews'],
        cert: 'microsoft'
    },
    {
        slug: 'data-analytics',
        name: 'Data Analytics',
        tagline: 'The fastest path to a data analyst role',
        description: 'SQL, Python, and statistics layered onto real datasets — built so you ship dashboards employers want.',
        duration: '5 months',
        mode: 'Live + Mentored',
        level: 'Beginner-friendly',
        salary: '₹6–18 LPA',
        next: '19 May',
        badge: 'Most Popular',
        Icon: Database,
        accent: 'oklch(0.623 0.214 259.815)',
        skills: ['SQL', 'Python', 'Statistics', 'Power BI', 'A/B Testing', 'Excel'],
        highlights: ['Real e-commerce datasets', 'Statistical experimentation', 'Capstone with real KPIs', '6 mock interviews'],
        cert: 'microsoft'
    },
    {
        slug: 'data-science-ai',
        name: 'Data Science with ML & GenAI',
        tagline: 'Build the AI products of tomorrow',
        description: 'From classical ML to LLMs, fine-tuning, and MLOps — ship a production-grade GenAI capstone.',
        duration: '9 months',
        mode: 'Live + Capstone',
        level: 'Intermediate',
        salary: '₹12–35 LPA',
        next: '02 Jun',
        badge: 'Flagship',
        Icon: Brain,
        accent: 'oklch(0.627 0.265 303.9)',
        skills: ['Python', 'PyTorch', 'LangChain', 'LLMs', 'MLOps', 'Statistics'],
        highlights: ['Build & deploy LLM apps', 'MLOps with AWS', 'Research-paper guidance', 'Hiring-manager mocks'],
        cert: 'both'
    },
    {
        slug: 'full-stack',
        name: 'Full-Stack Development',
        tagline: 'Ship products end-to-end with confidence',
        description: 'React + Node + MongoDB on AWS, with weekly code reviews and system-design rounds.',
        duration: '7 months',
        mode: 'Live + Code Reviews',
        level: 'Beginner to Pro',
        salary: '₹8–32 LPA',
        next: '26 May',
        Icon: Code2,
        accent: 'oklch(0.696 0.17 162)',
        skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'System Design', 'TypeScript'],
        highlights: ['Production capstones', 'Weekly code reviews', 'System-design prep', 'Open-source PRs']
    },
    {
        slug: 'data-engineering',
        name: 'Data Engineering',
        tagline: 'Build pipelines that power AI',
        description: 'Spark, Airflow, dbt, and warehouses — build and operate the data platform behind every AI team.',
        duration: '7 months',
        mode: 'Live + Capstone',
        level: 'Intermediate',
        salary: '₹10–28 LPA',
        next: '09 Jun',
        Icon: Server,
        accent: 'oklch(0.645 0.246 16.439)',
        skills: ['SQL', 'Python', 'Spark', 'Airflow', 'dbt', 'Snowflake'],
        highlights: ['ETL pipeline capstone', 'Lakehouse architecture', 'Streaming with Kafka', 'Cloud cost ops'],
        cert: 'ibm'
    },
    {
        slug: 'cybersecurity',
        name: 'Cybersecurity',
        tagline: 'Defend the systems that hold the data',
        description: 'Security operations, threat modelling, and red/blue team exercises with real incident playbooks.',
        duration: '6 months',
        mode: 'Live + Lab',
        level: 'Beginner-friendly',
        salary: '₹7–20 LPA',
        next: '16 Jun',
        Icon: Shield,
        accent: 'oklch(0.696 0.17 192)',
        skills: ['Linux', 'Networking', 'SIEM', 'Burp Suite', 'OWASP', 'Pentest'],
        highlights: ['CTF-style capstones', 'Red & blue team labs', 'OWASP Top 10 deep-dives', 'Cloud security']
    },
    {
        slug: 'investment-banking',
        name: 'Investment Banking',
        tagline: 'Financial modelling & valuations',
        description: 'Three-statement modelling, M&A, LBO, and pitchbook craft taught by ex-bulge-bracket bankers.',
        duration: '5 months',
        mode: 'Live + Cohort',
        level: 'Beginner-friendly',
        salary: '₹8–24 LPA',
        next: '23 Jun',
        Icon: LineChart,
        accent: 'oklch(0.55 0.22 280)',
        skills: ['Excel', 'PowerPoint', 'Valuations', 'M&A', 'LBO', 'Pitchbooks'],
        highlights: ['Live deal walk-throughs', 'Modelling speed-runs', 'Pitchbook portfolio', 'Bulge-bracket mocks']
    },
    {
        slug: 'product-analytics',
        name: 'Product Analytics',
        tagline: 'Drive product with data',
        description: 'Funnels, retention, A/B tests, and PM-style thinking — the analytics layer that makes products win.',
        duration: '4 months',
        mode: 'Live + Mentored',
        level: 'Beginner-friendly',
        salary: '₹8–22 LPA',
        next: '30 Jun',
        Icon: PieChart,
        accent: 'oklch(0.7 0.2 30)',
        skills: ['SQL', 'Mixpanel', 'Amplitude', 'A/B Testing', 'Funnels', 'SQL'],
        highlights: ['Funnel & cohort analyses', 'Live A/B test design', 'PM ↔ analyst playbook', 'Capstone with real app'],
        cert: 'microsoft'
    }
]

export default function ProgramsShowcase() {
    const navigate = useNavigate()
    const [active, setActive] = useState(0)
    const [auto, setAuto] = useState(true)

    useEffect(() => {
        if (!auto) return
        const t = window.setInterval(() => setActive((i) => (i + 1) % programs.length), 5000)
        return () => window.clearInterval(t)
    }, [auto])

    const program = programs[active]
    const Icon = program.Icon

    const next = () => {
        setAuto(false)
        setActive((i) => (i + 1) % programs.length)
    }
    const prev = () => {
        setAuto(false)
        setActive((i) => (i - 1 + programs.length) % programs.length)
    }

    return (
        <section
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg-soft)', color: 'var(--text-primary)' }}>
            <div className="max-w-[1320px] mx-auto">
                {/* Heading */}
                <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-end mb-12">
                    <div>
                        <div
                            className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
                            style={{ color: 'var(--brand)' }}>
                            Career-First Programs
                        </div>
                        <h2
                            className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium"
                            style={{ color: 'var(--text-primary)' }}>
                            Eight programs.
                            <br />
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                One outcome — your next role.
                            </span>
                        </h2>
                    </div>
                    <p
                        className="text-[16px] leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}>
                        Each program is co-designed with hiring managers and built around live mentorship,
                        portfolio-grade projects, and a placement-focused career sprint.
                    </p>
                </div>

                {/* Bento layout: left main showcase + right list/carousel.
                    The showcase card is hidden on mobile — too tall to be useful;
                    the right-side carousel becomes the primary mobile view. */}
                <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
                    {/* ── Left: Active program showcase ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={program.name + active}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.4 }}
                            onMouseEnter={() => setAuto(false)}
                            onMouseLeave={() => setAuto(true)}
                            className="relative rounded-3xl p-7 md:p-10 overflow-hidden hidden lg:flex flex-col"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow-hover)',
                                minHeight: 560
                            }}>
                            {/* Accent wash */}
                            <div
                                aria-hidden="true"
                                className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.18]"
                                style={{ background: program.accent, filter: 'blur(60px)' }}
                            />
                            {/* Watermark numeral */}
                            <div
                                className="absolute -top-2 right-6 font-display italic font-light pointer-events-none select-none opacity-[0.06]"
                                style={{ color: program.accent, fontSize: 220, lineHeight: 1 }}>
                                {String(active + 1).padStart(2, '0')}
                            </div>

                            <div className="relative z-[1] flex flex-col flex-1">
                                <div className="flex items-start justify-between mb-7">
                                    <div
                                        className="w-14 h-14 rounded-2xl inline-flex items-center justify-center"
                                        style={{ background: program.accent, color: '#fff' }}>
                                        <Icon size={26} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {program.cert && <CertBadges cert={program.cert} />}
                                        {program.badge && (
                                            <span
                                                className="px-3 py-1.5 rounded-full text-[10.5px] font-bold tracking-[0.16em] uppercase"
                                                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                                {program.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3
                                    className="font-display text-[30px] md:text-[40px] leading-[1.02] font-semibold mb-2"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {program.name}
                                </h3>
                                <p
                                    className="text-[15.5px] mb-2"
                                    style={{ color: 'var(--brand)' }}>
                                    {program.tagline}
                                </p>
                                <p
                                    className="text-[14.5px] leading-relaxed mb-4 max-w-[520px]"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    {program.description}
                                </p>

                                {/* Inline certification call-out */}
                                {program.cert && (
                                    <div
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mb-6 max-w-[520px]"
                                        style={{
                                            background: 'var(--brand-soft)',
                                            border: '1px solid var(--brand)',
                                            color: 'var(--text-primary)'
                                        }}>
                                        <span className="text-[18px]">🎓</span>
                                        <span className="text-[12.5px] font-semibold leading-tight">
                                            {program.cert === 'both'
                                                ? 'Co-certified by IBM SkillsBuild + Microsoft Learn — exam voucher included.'
                                                : program.cert === 'ibm'
                                                  ? 'Earn an IBM SkillsBuild badge — Credly + IBM exam voucher included.'
                                                  : 'Earn a Microsoft Certified credential — Azure credits + 1 free exam attempt.'}
                                        </span>
                                    </div>
                                )}

                                {/* Meta strip */}
                                <div
                                    className="grid grid-cols-3 gap-3 py-4 border-y mb-6"
                                    style={{ borderColor: 'var(--line)' }}>
                                    <Meta icon={Clock} label="Duration" value={program.duration} />
                                    <Meta icon={Users} label="Mode" value={program.mode} />
                                    <Meta icon={GraduationCap} label="Level" value={program.level} />
                                </div>

                                {/* Highlights */}
                                <div className="mb-6">
                                    <div
                                        className="text-[10.5px] tracking-[0.16em] uppercase font-semibold mb-3"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        What you'll do
                                    </div>
                                    <ul className="grid sm:grid-cols-2 gap-2">
                                        {program.highlights.map((h, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
                                                <span
                                                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                    style={{ background: program.accent }}
                                                />
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-1.5 mb-6">
                                    {program.skills.map((s, j) => (
                                        <span
                                            key={j}
                                            className="px-2.5 py-1 rounded-full text-[11.5px]"
                                            style={{
                                                background: 'var(--surface-2)',
                                                color: 'var(--text-secondary)',
                                                border: '1px solid var(--line)'
                                            }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
                                    <div className="flex items-center gap-5">
                                        <div>
                                            <div
                                                className="text-[10px] tracking-[0.16em] uppercase font-semibold"
                                                style={{ color: 'var(--text-tertiary)' }}>
                                                Avg salary
                                            </div>
                                            <div
                                                className="font-display text-[18px] font-semibold"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {program.salary}
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                className="text-[10px] tracking-[0.16em] uppercase font-semibold"
                                                style={{ color: 'var(--text-tertiary)' }}>
                                                Next batch
                                            </div>
                                            <div
                                                className="font-display text-[18px] italic font-medium"
                                                style={{ color: 'var(--brand)' }}>
                                                {program.next}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/programs/${program.slug}`)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-transform hover:translate-y-[-1px]"
                                        style={{
                                            background: 'var(--brand)',
                                            color: 'var(--text-on-inverse)',
                                            boxShadow: '0 6px 14px rgba(13,79,60,0.25)'
                                        }}>
                                        View Program <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* ── Right: Carousel list ── */}
                    <div
                        className="rounded-3xl p-2 md:p-6 flex flex-col"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            boxShadow: 'var(--card-shadow)'
                        }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div
                                    className="text-[10.5px] tracking-[0.18em] uppercase font-semibold"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    All programs
                                </div>
                                <div
                                    className="font-display text-[18px] font-semibold mt-0.5"
                                    style={{ color: 'var(--text-primary)' }}>
                                    Pick a track
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prev}
                                    aria-label="Previous"
                                    className="w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}>
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={next}
                                    aria-label="Next"
                                    className="w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors"
                                    style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 overflow-hidden flex-1">
                            {programs.map((p, i) => {
                                const Ic = p.Icon
                                const isActive = i === active
                                return (
                                    <motion.button
                                        key={p.name + i}
                                        onClick={() => {
                                            // On mobile the showcase card is hidden, so a tap
                                            // jumps straight to the program detail page.
                                            // On lg+ it still toggles the active showcase.
                                            if (window.matchMedia('(max-width: 1023px)').matches) {
                                                navigate(`/programs/${p.slug}`)
                                                return
                                            }
                                            setActive(i)
                                            setAuto(false)
                                        }}
                                        whileHover={{ x: 3 }}
                                        className="w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all relative overflow-hidden"
                                        style={{
                                            background: isActive ? 'var(--brand-soft)' : 'var(--surface-2)',
                                            border: '1px solid',
                                            borderColor: isActive ? 'var(--brand)' : 'var(--line)'
                                        }}>
                                        {isActive && (
                                            <motion.span
                                                layoutId="active-indicator"
                                                aria-hidden="true"
                                                className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                                                style={{ background: 'var(--brand)' }}
                                            />
                                        )}
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: p.accent, color: '#fff' }}>
                                            <Ic size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className="font-display text-[14.5px] font-semibold leading-tight truncate"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {p.name}
                                                </div>
                                                {p.cert && <CertDots cert={p.cert} />}
                                            </div>
                                            <div
                                                className="text-[11px] mt-0.5 truncate"
                                                style={{ color: 'var(--text-tertiary)' }}>
                                                {p.duration} · {p.salary}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <span
                                                className="px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-[0.14em] uppercase"
                                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                                Active
                                            </span>
                                        )}
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Bottom progress bar */}
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10.5px] tracking-[0.16em] uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                                    {String(active + 1).padStart(2, '0')} / {String(programs.length).padStart(2, '0')}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11.5px]" style={{ color: 'var(--brand)' }}>
                                    <TrendingUp size={11} /> Auto-cycling
                                </span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                                <motion.div
                                    key={active}
                                    initial={{ width: '0%' }}
                                    animate={{ width: auto ? '100%' : '0%' }}
                                    transition={{ duration: auto ? 5 : 0, ease: 'linear' }}
                                    style={{ height: '100%', background: 'var(--brand)' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Larger pills for the active program panel
function CertBadges({ cert }: { cert: 'ibm' | 'microsoft' | 'both' }) {
    const showIBM = cert === 'ibm' || cert === 'both'
    const showMS = cert === 'microsoft' || cert === 'both'
    return (
        <div className="flex items-center gap-1.5">
            {showIBM && (
                <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-tight"
                    title="IBM SkillsBuild — co-branded badge"
                    style={{ background: '#fff', border: '1px solid rgba(5,48,173,0.25)', color: '#0530AD' }}>
                    <svg viewBox="0 0 64 28" width={26} height={11} aria-hidden="true">
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
            {showMS && (
                <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-tight"
                    title="Microsoft Certified pathway"
                    style={{ background: '#fff', border: '1px solid rgba(0,120,212,0.25)', color: '#0078D4' }}>
                    <svg viewBox="0 0 24 24" width={11} height={11} aria-hidden="true">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                    </svg>
                    Microsoft Certified
                </span>
            )}
        </div>
    )
}

// Tiny dots for the dense list — same data, smaller surface
function CertDots({ cert }: { cert: 'ibm' | 'microsoft' | 'both' }) {
    const showIBM = cert === 'ibm' || cert === 'both'
    const showMS = cert === 'microsoft' || cert === 'both'
    return (
        <span className="inline-flex items-center gap-0.5 flex-shrink-0">
            {showIBM && (
                <span
                    title="IBM SkillsBuild Badge"
                    aria-label="IBM Certified"
                    className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[7.5px] font-extrabold"
                    style={{ background: '#0530AD', color: '#fff', letterSpacing: 0.5 }}>
                    IBM
                </span>
            )}
            {showMS && (
                <span
                    title="Microsoft Certified"
                    aria-label="Microsoft Certified"
                    className="inline-flex items-center justify-center w-4 h-4 rounded-sm"
                    style={{ background: '#fff', border: '1px solid var(--line-strong)' }}>
                    <svg viewBox="0 0 24 24" width={10} height={10} aria-hidden="true">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                    </svg>
                </span>
            )}
        </span>
    )
}

function Meta({
    icon: Icon,
    label,
    value
}: {
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
    label: string
    value: string
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                <Icon size={11} style={{ color: 'var(--brand)' }} />
                {label}
            </div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {value}
            </div>
        </div>
    )
}
