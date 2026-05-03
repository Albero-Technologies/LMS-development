import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Compass, Target, Users, BookOpen, Award, ArrowUpRight, Quote } from 'lucide-react'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'

const ThreeShowcase = lazy(() => import('@/components/common/ThreeShowcase'))

const values = [
    {
        Icon: Compass,
        title: 'Mentor-led, never automated',
        body: 'Every learner is matched with a working practitioner. No bots, no AI tutors — real humans who have shipped what they teach.'
    },
    {
        Icon: Target,
        title: 'Built around outcomes',
        body: 'We measure success in offers, not enrollments. Curriculum is reviewed every quarter against the roles our partners are hiring for.'
    },
    {
        Icon: Users,
        title: 'Community over credentials',
        body: 'A 12,000-strong alumni network across 40+ companies. Most of our learners get their first interview through this network.'
    },
    {
        Icon: BookOpen,
        title: 'Practice over theory',
        body: 'Eight to twelve real projects per program. Reviewed weekly. Yours to keep on GitHub. The portfolio is the resume.'
    }
]

const founders = [
    { name: 'Aditi Rao', role: 'Co-founder & CEO', bio: 'Ex-McKinsey, IIT Bombay. Led analytics for retail brands across India before starting Albero.', initials: 'AR', tint: 'oklch(0.623 0.214 259.815)' },
    { name: 'Karan Bhatt', role: 'Co-founder & CTO', bio: 'Ex-Microsoft, BITS Pilani. Built data platforms used by millions across edtech and SaaS.', initials: 'KB', tint: 'oklch(0.696 0.17 162)' },
    { name: 'Meera Chand', role: 'Head of Curriculum', bio: 'Ex-Coursera, IIM Ahmedabad. Designed flagship analytics curricula taken by 200,000+ learners.', initials: 'MC', tint: 'oklch(0.795 0.184 86.047)' }
]

const milestones = [
    { y: '2024', t: 'Founded in Noida', d: 'Five practitioners, one belief: career-first learning needs to come back.' },
    { y: '2024 Q4', t: 'First 100 learners', d: 'Ran two cohorts. 87% reported a salary jump within 9 months.' },
    { y: '2025', t: 'Industry partnerships', d: 'Onboarded 180+ hiring partners across product, BFSI, and consulting.' },
    { y: '2026', t: 'Pan-India scale', d: '12,000+ alumni. 4 flagship tracks. Mentor network across 40+ companies.' }
]

export default function AboutPage() {
    const navigate = useNavigate()
    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <SEO
                title="About Albero Academy — Career-first learning, mentor-led"
                description="Albero Academy is a career-focused learning platform helping India's professionals master analytics, AI, and engineering through live mentorship and hiring-partner referrals."
                keywords="albero academy, about, mentors, founders, story, lms"
                url="https://www.alberoacademy.com/about"
                canonical="https://www.alberoacademy.com/about"
                image="/favicon/albero%20logo.png"
                type="website"
            />
            <StructuredData page="about" />

            {/* ── Hero ── */}
            <section className="relative pt-[160px] pb-20 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-40 -right-32 w-[640px] h-[640px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div
                    className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                        opacity: 0.45,
                        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)'
                    }}
                />

                <div className="relative max-w-[1180px] mx-auto z-[1]">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-[860px]">
                        <div
                            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-7 text-[12px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <Sparkles size={13} style={{ color: 'var(--brand)' }} />
                            Who we are
                        </div>

                        <h1
                            className="font-display text-[44px] sm:text-[60px] lg:text-[88px] leading-[0.96] tracking-[-0.02em] mb-7"
                            style={{ color: 'var(--text-primary)' }}>
                            <span className="font-medium">A school built by</span>
                            <br />
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                practitioners, for practitioners.
                            </span>
                        </h1>

                        <p
                            className="text-[17px] md:text-[19px] leading-[1.6] max-w-[680px]"
                            style={{ color: 'var(--text-secondary)' }}>
                            Albero Academy started with a simple frustration: India had no shortage of online courses, but every learner we knew was
                            struggling to translate them into real careers. We built Albero to close that gap — with live mentorship, real projects,
                            and a hiring network that opens doors before you graduate.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-6 py-3 rounded-full text-[14px] font-semibold inline-flex items-center gap-1.5"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                                }}>
                                Explore programs <ArrowUpRight size={14} />
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-6 py-3 rounded-full text-[14px] font-semibold"
                                style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line-strong)' }}>
                                Talk to a counsellor
                            </button>
                        </div>

                        {/* Mast stats */}
                        <div
                            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-[700px] pt-8 border-t"
                            style={{ borderColor: 'var(--line)' }}>
                            {[
                                { v: '12,000+', l: 'Learners trained' },
                                { v: '180+', l: 'Hiring partners' },
                                { v: '92%', l: 'Placement rate' },
                                { v: '4.8/5', l: 'Cohort rating' }
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.07 }}>
                                    <div className="font-display text-[28px] leading-none font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {s.v}
                                    </div>
                                    <div className="text-[11px] tracking-[0.16em] uppercase mt-2" style={{ color: 'var(--text-tertiary)' }}>
                                        {s.l}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Mission quote block ── */}
            <section className="px-5 md:px-8 py-20" style={{ background: 'var(--page-bg-soft)' }}>
                <div className="max-w-[1080px] mx-auto">
                    <div
                        className="rounded-3xl p-8 md:p-14 relative overflow-hidden"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                        <Quote
                            size={64}
                            style={{ color: 'var(--brand-soft)' }}
                            className="absolute top-6 right-6 opacity-50"
                        />
                        <div className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4" style={{ color: 'var(--brand)' }}>
                            Our mission
                        </div>
                        <p
                            className="font-display text-[26px] md:text-[42px] leading-[1.18] tracking-[-0.01em] font-medium max-w-[800px]"
                            style={{ color: 'var(--text-primary)' }}>
                            "Make a high-leverage tech career{' '}
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                actually accessible
                            </span>{' '}
                            — to anyone willing to put in the work, regardless of where they start."
                        </p>
                        <div className="mt-7 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                            — The Albero founding team, 2024
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3D / Three.js editorial block ── */}
            <section className="relative px-5 md:px-8 py-20 overflow-hidden">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
                />
                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
                        {/* 3D canvas */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.6 }}
                            className="relative rounded-[28px] overflow-hidden w-full max-w-full"
                            style={{
                                background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow-hover)',
                                aspectRatio: '5 / 4',
                                minHeight: 280,
                                maxHeight: 'min(60vh, 480px)'
                            }}>
                            <div className="absolute inset-0">
                                <Suspense
                                    fallback={
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div
                                                className="w-10 h-10 rounded-full border-2 animate-spin"
                                                style={{ borderColor: 'var(--brand-soft)', borderTopColor: 'var(--brand)' }}
                                            />
                                        </div>
                                    }>
                                    <ThreeShowcase variant="particles" />
                                </Suspense>
                            </div>
                            <div
                                className="absolute bottom-4 left-4 right-4 px-4 py-3 rounded-2xl flex items-center justify-between"
                                style={{
                                    background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid var(--line)'
                                }}>
                                <div className="leading-tight">
                                    <div className="text-[10.5px] tracking-[0.16em] uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                        Constellation
                                    </div>
                                    <div className="font-display text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        12,000+ alumni — and counting.
                                    </div>
                                </div>
                                <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-tight"
                                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                    <Sparkles size={11} /> Live
                                </span>
                            </div>
                        </motion.div>

                        {/* Copy */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5 }}>
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                <Sparkles size={12} /> Network effect
                            </div>
                            <h2
                                className="font-display tracking-[-0.02em]"
                                style={{
                                    color: 'var(--text-primary)',
                                    fontSize: 'clamp(32px, 4.4vw, 52px)',
                                    lineHeight: 1.04
                                }}>
                                A network that{' '}
                                <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                    works for you.
                                </span>
                            </h2>
                            <p
                                className="mt-5 text-[15.5px] leading-relaxed max-w-[520px]"
                                style={{ color: 'var(--text-secondary)' }}>
                                Each point in the cloud is an alum, a mentor, a hiring partner. Your cohort isn't just the
                                people on your call — it's everyone who has ever shipped through Albero. Hover the canvas to pause it.
                            </p>
                            <div className="mt-7 grid grid-cols-3 gap-4 max-w-[460px]">
                                {[
                                    { v: '12k+', l: 'Alumni' },
                                    { v: '180+', l: 'Hiring teams' },
                                    { v: '3×', l: 'Faster shortlist' }
                                ].map((s) => (
                                    <div key={s.l}>
                                        <div className="font-display text-[26px] leading-none font-semibold" style={{ color: 'var(--brand)' }}>
                                            {s.v}
                                        </div>
                                        <div className="text-[10.5px] tracking-[0.16em] uppercase mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                                            {s.l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Values grid ── */}
            <section className="px-5 md:px-8 py-24">
                <div className="max-w-[1180px] mx-auto">
                    <div className="text-center max-w-[760px] mx-auto mb-14">
                        <div className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4" style={{ color: 'var(--brand)' }}>
                            What we believe
                        </div>
                        <h2 className="font-display text-[40px] md:text-[58px] leading-[0.96] tracking-[-0.02em] font-medium" style={{ color: 'var(--text-primary)' }}>
                            Four things we{' '}
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                refuse
                            </span>{' '}
                            to compromise on.
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                        {values.map((v, i) => {
                            const Icon = v.Icon
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 14 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: i * 0.06 }}
                                    className="rounded-3xl p-7 md:p-8"
                                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                    <div
                                        className="w-12 h-12 rounded-xl inline-flex items-center justify-center mb-5"
                                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                        <Icon size={20} />
                                    </div>
                                    <h3
                                        className="font-display text-[22px] md:text-[24px] font-semibold mb-2.5 leading-tight"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {v.title}
                                    </h3>
                                    <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {v.body}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── Founders ── */}
            <section className="px-5 md:px-8 py-24" style={{ background: 'var(--page-bg-soft)' }}>
                <div className="max-w-[1180px] mx-auto">
                    <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-end mb-12">
                        <div>
                            <div className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4" style={{ color: 'var(--brand)' }}>
                                Founding team
                            </div>
                            <h2
                                className="font-display text-[40px] md:text-[54px] leading-[0.96] tracking-[-0.02em] font-medium"
                                style={{ color: 'var(--text-primary)' }}>
                                Built by people who've{' '}
                                <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                    done the work.
                                </span>
                            </h2>
                        </div>
                        <p className="text-[16px] leading-relaxed max-w-[520px] md:justify-self-end" style={{ color: 'var(--text-secondary)' }}>
                            Three operators across consulting, big-tech, and edtech. We've been the analyst, the engineer, and the curriculum
                            designer. We're building the school we wished we had.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {founders.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className="rounded-3xl p-7 md:p-8"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-semibold text-[20px] mb-6"
                                    style={{ background: f.tint, color: '#fff' }}>
                                    {f.initials}
                                </div>
                                <h3 className="font-display text-[22px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {f.name}
                                </h3>
                                <div className="text-[12.5px] mb-3" style={{ color: 'var(--brand)' }}>
                                    {f.role}
                                </div>
                                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {f.bio}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Timeline ── */}
            <section className="px-5 md:px-8 py-24">
                <div className="max-w-[920px] mx-auto">
                    <div className="text-center mb-14">
                        <div className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4" style={{ color: 'var(--brand)' }}>
                            Our story so far
                        </div>
                        <h2
                            className="font-display text-[40px] md:text-[54px] leading-[0.96] tracking-[-0.02em] font-medium"
                            style={{ color: 'var(--text-primary)' }}>
                            From{' '}
                            <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                a small Noida room
                            </span>{' '}
                            to a national network.
                        </h2>
                    </div>

                    <div className="relative">
                        <div
                            aria-hidden="true"
                            className="absolute left-[6px] top-2 bottom-2 w-px"
                            style={{ background: 'var(--line-strong)' }}
                        />
                        <div className="space-y-8">
                            {milestones.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: i * 0.06 }}
                                    className="grid grid-cols-[24px_1fr] gap-5">
                                    <div className="pt-1.5">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ background: 'var(--brand)', boxShadow: '0 0 0 4px var(--page-bg)' }}
                                        />
                                    </div>
                                    <div className="pl-5 pb-2 border-l" style={{ borderColor: 'var(--line)' }}>
                                        <div
                                            className="font-mono text-[12px] font-semibold tracking-[0.16em]"
                                            style={{ color: 'var(--brand)' }}>
                                            {m.y}
                                        </div>
                                        <h3
                                            className="font-display text-[22px] font-semibold mt-1.5 mb-1"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {m.t}
                                        </h3>
                                        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            {m.d}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="px-5 md:px-8 pb-24">
                <div className="max-w-[1180px] mx-auto">
                    <div
                        className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
                        style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand)' }}>
                        <Award
                            size={36}
                            className="mx-auto mb-5"
                            style={{ color: 'var(--brand)' }}
                        />
                        <h2
                            className="font-display text-[32px] md:text-[44px] font-semibold tracking-[-0.02em] mb-3"
                            style={{ color: 'var(--text-primary)' }}>
                            Ready to build a career{' '}
                            <span className="italic" style={{ color: 'var(--brand)' }}>
                                worth waking up for?
                            </span>
                        </h2>
                        <p className="mb-7 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            Pick a program, talk to a counsellor, or download our brochure — whichever helps you decide.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-6 py-3 rounded-full text-[14px] font-semibold inline-flex items-center gap-1.5"
                                style={{
                                    background: 'var(--brand)',
                                    color: 'var(--text-on-inverse)',
                                    boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                                }}>
                                Explore programs <ArrowUpRight size={14} />
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-6 py-3 rounded-full text-[14px] font-semibold"
                                style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--line-strong)' }}>
                                Talk to a counsellor
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
