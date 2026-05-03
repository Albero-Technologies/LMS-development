import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CheckCircle2, Clock, Users, GraduationCap, Sparkles, ArrowRight, Briefcase, Award, ChevronRight } from 'lucide-react'
import { findProgram } from '@/constants/programs'
import EnrollModal from '@/components/user/enroll/EnrollModal'

export default function ProgramPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const program = slug ? findProgram(slug) : undefined
    const [enrollOpen, setEnrollOpen] = useState(false)

    if (!program) return <Navigate to="/" replace />

    const Icon = program.icon
    // Best-effort price string from the program's pricing tiers (used as a
    // hint in the modal). The authoritative amount comes from the backend
    // when checkout starts, so a missing value here is harmless.
    const displayPrice = (program as { pricing?: { tiers?: { price?: string }[] } }).pricing?.tiers?.[0]?.price

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* Hero */}
            <section className="relative pt-[140px] pb-16 px-5 md:px-8">
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
                <div
                    className="absolute inset-x-0 top-0 h-[480px] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                        opacity: 0.45,
                        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)'
                    }}
                />

                <div className="max-w-6xl mx-auto relative z-[1] grid lg:grid-cols-[1fr_360px] gap-12 items-start">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div
                            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-6 text-[12px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <Icon size={14} style={{ color: 'var(--brand)' }} />
                            {program.badge}
                        </div>

                        <h1
                            className="font-display text-[40px] md:text-[64px] leading-[0.96] tracking-[-0.02em] mb-5"
                            style={{ color: 'var(--text-primary)' }}>
                            <span className="font-medium">{program.title}</span>
                            <br />
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>{program.highlight}</span>
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
                            <Pill icon={Clock} label={program.duration} />
                            <Pill icon={Users} label={program.mode} />
                            <Pill icon={GraduationCap} label={program.level} />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setEnrollOpen(true)}
                                className="px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all hover:translate-y-[-1px]"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                                }}>
                                Enroll Now <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-6 py-3 rounded-full font-semibold transition-colors"
                                style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line-strong)' }}>
                                See Pricing
                            </button>
                        </div>
                    </motion.div>

                    {/* Counsellor side card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="rounded-2xl p-6"
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

                        <div className="space-y-3">
                            {[
                                { ph: 'Full name', t: 'text' },
                                { ph: 'Email', t: 'email' },
                                { ph: 'Phone (WhatsApp)', t: 'tel' }
                            ].map((f) => (
                                <input
                                    key={f.ph}
                                    type={f.t}
                                    placeholder={f.ph}
                                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-colors"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
                                />
                            ))}
                            <button
                                className="w-full rounded-lg py-2.5 font-semibold text-[14px] transition-all hover:opacity-90"
                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                Request a Callback
                            </button>
                        </div>

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

            {/* Highlights & tools */}
            <section className="px-5 md:px-8 mb-20">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
                    <Card title="Program Highlights" icon={Award}>
                        <ul className="space-y-3">
                            {program.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2
                                        size={18}
                                        className="flex-shrink-0 mt-0.5"
                                        style={{ color: 'var(--brand)' }}
                                    />
                                    <span
                                        className="text-[15px] leading-relaxed"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {h}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title="Tools & Technologies" icon={Sparkles}>
                        <div className="flex flex-wrap gap-2">
                            {program.tools.map((t, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-full text-[13.5px]"
                                    style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--line)' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

            {/* Curriculum */}
            <section className="px-5 md:px-8 mb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2
                            className="font-display text-[32px] md:text-[44px] font-semibold tracking-[-0.02em] mb-3"
                            style={{ color: 'var(--text-primary)' }}>
                            Curriculum
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Industry-validated, practice-first, mentor-reviewed every batch.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {program.modules.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                                className="rounded-2xl p-6"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <div
                                    className="text-[11px] font-bold tracking-[0.16em] uppercase mb-2"
                                    style={{ color: 'var(--brand)' }}>
                                    Module {String(i + 1).padStart(2, '0')}
                                </div>
                                <h3
                                    className="font-display text-[18px] font-semibold mb-3"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {m.title}
                                </h3>
                                <ul className="space-y-1.5">
                                    {m.items.map((x, j) => (
                                        <li
                                            key={j}
                                            className="flex items-start gap-2 text-[14px]"
                                            style={{ color: 'var(--text-secondary)' }}>
                                            <ChevronRight
                                                size={14}
                                                className="flex-shrink-0 mt-1"
                                                style={{ color: 'var(--brand)' }}
                                            />
                                            <span>{x}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Outcomes */}
            <section className="px-5 md:px-8 mb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2
                            className="font-display text-[32px] md:text-[44px] font-semibold tracking-[-0.02em] mb-3"
                            style={{ color: 'var(--text-primary)' }}>
                            Career Outcomes
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Roles our learners land — with realistic salary ranges from market data.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {program.outcomes.map((o, i) => (
                            <div
                                key={i}
                                className="rounded-2xl p-6 relative overflow-hidden"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <Briefcase
                                    size={24}
                                    className="mb-4"
                                    style={{ color: 'var(--brand)' }}
                                />
                                <h3
                                    className="font-display text-[18px] font-semibold mb-1"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {o.role}
                                </h3>
                                {o.salary && (
                                    <div
                                        className="text-[14px] font-semibold"
                                        style={{ color: 'var(--brand)' }}>
                                        {o.salary}
                                    </div>
                                )}
                                {o.companies && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {o.companies.map((c, j) => (
                                            <span
                                                key={j}
                                                className="px-2 py-0.5 rounded-md text-[12px]"
                                                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--line)' }}>
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="px-5 md:px-8 mb-24">
                <div className="max-w-6xl mx-auto">
                    <div
                        className="rounded-3xl p-8 md:p-14 text-center relative overflow-hidden"
                        style={{
                            background: 'var(--brand-soft)',
                            border: '1px solid var(--brand)'
                        }}>
                        <h2
                            className="font-display text-[32px] md:text-[40px] font-semibold tracking-[-0.02em] mb-3"
                            style={{ color: 'var(--text-primary)' }}>
                            Ready to start your <span className="italic" style={{ color: 'var(--brand)' }}>journey?</span>
                        </h2>
                        <p
                            className="mb-7 max-w-xl mx-auto"
                            style={{ color: 'var(--text-secondary)' }}>
                            Talk to a counsellor today. We'll help you pick the right plan, batch, and learning path for your goals.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-7 py-3.5 rounded-full font-semibold inline-flex items-center gap-2 transition-all hover:translate-y-[-1px]"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 12px 32px rgba(13,79,60,0.30)'
                                }}>
                                Book a Free 1:1 Call <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-7 py-3.5 rounded-full font-semibold inline-flex items-center gap-2 transition-all hover:translate-y-[-1px]"
                                style={{
                                    background: 'var(--surface)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--line-strong)'
                                }}>
                                See Pricing &amp; Plans <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <EnrollModal
                open={enrollOpen}
                onClose={() => setEnrollOpen(false)}
                courseSlug={program.slug}
                courseTitle={program.title}
                displayPrice={displayPrice}
            />
        </div>
    )
}

function Pill({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; label: string }) {
    return (
        <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13.5px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
            <Icon size={14} style={{ color: 'var(--brand)' }} />
            {label}
        </div>
    )
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; children: React.ReactNode }) {
    return (
        <div
            className="rounded-2xl p-7"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--card-shadow)'
            }}>
            <div className="flex items-center gap-3 mb-5">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                    <Icon size={18} />
                </div>
                <h2
                    className="font-display text-[20px] font-semibold"
                    style={{ color: 'var(--text-primary)' }}>
                    {title}
                </h2>
            </div>
            {children}
        </div>
    )
}
