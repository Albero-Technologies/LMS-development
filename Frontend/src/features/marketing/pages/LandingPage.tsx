// Public landing page — student-facing, mirrors lms.pen frame 70 (LP Hero Landing).
// The voice is "come learn with us", not "run an LMS".
// Every CTA routes either to the enquiry form or the public course catalog.
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Award, Clock, Users, Star, BookOpen, Video, MessageCircle, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'

const FEATURED_COURSES = [
    {
        slug: 'sys-design',
        title: 'System Design Foundations',
        mentor: 'Anuj Verma',
        lessons: 24,
        weeks: 6,
        rating: 4.8,
        price: 4999,
        tag: 'Bestseller',
        tagTone: 'brand' as const
    },
    {
        slug: 'ts-fs',
        title: 'Full-stack TypeScript',
        mentor: 'Priya Iyer',
        lessons: 38,
        weeks: 10,
        rating: 4.9,
        price: 5999,
        tag: 'New cohort',
        tagTone: 'ok' as const
    },
    {
        slug: 'dsa-30',
        title: 'DSA in 30 days',
        mentor: 'Rohan Das',
        lessons: 30,
        weeks: 4,
        rating: 4.7,
        price: 2999,
        tag: 'Most enrolled',
        tagTone: 'purple' as const
    }
]

const WHY = [
    {
        icon: Video,
        title: 'Live cohort classes',
        body: 'Weekly sessions with industry mentors. Ask questions, get reviewed, graduate with a cohort.'
    },
    {
        icon: BookOpen,
        title: 'Structured curriculum',
        body: "Short lessons that build on each other. No 40-hour videos you won't finish."
    },
    {
        icon: Award,
        title: 'Verifiable certificates',
        body: 'Every certificate has a public verification URL employers can check in one click.'
    },
    {
        icon: MessageCircle,
        title: 'Doubt-clearing calls',
        body: 'Stuck? Book a 1:1 with a mentor or drop into the weekly doubt class.'
    }
]

const STATS = [
    { n: '10,000+', k: 'Learners enrolled' },
    { n: '4.8 / 5', k: 'Average rating' },
    { n: '94%', k: 'Course completion' },
    { n: '1:1', k: 'Mentor access' }
]

const STORIES = [
    {
        quote: '"Went from self-taught to working at a product startup in 6 months. The system design cohort was the turning point."',
        by: 'Ishaan Mehra',
        role: 'Backend Engineer · Zinc Health'
    },
    {
        quote: '"The mentors don\'t just teach — they review your code line by line. I\'ve never seen this level of feedback anywhere else."',
        by: 'Sneha Patil',
        role: 'Full-stack Developer · Bolt Financial'
    },
    {
        quote: '"I finished three courses while working full-time. The pace is realistic and the community keeps you honest."',
        by: 'Rohit Gupta',
        role: 'Student · Mumbai'
    }
]

const FAQS = [
    {
        q: 'Do I need prior experience?',
        a: 'Most courses assume basic programming. Each course page lists exact prerequisites and a 10-minute self-check.'
    },
    {
        q: 'Can I pause a course?',
        a: 'Yes — your enrollment stays active for 12 months. Come back whenever life allows.'
    },
    {
        q: 'Will I get a real certificate?',
        a: 'Finish the capstone with ≥ 60% score and we issue a PDF certificate plus a public verification page.'
    },
    {
        q: "What if the course isn't a fit?",
        a: 'Within 7 days of enrolling, ask for a refund — no questions, no forms.'
    }
]

export const LandingPage = () => (
    <div className="relative">
        {/* HERO ------------------------------------------------------------- */}
        <section
            className="relative overflow-hidden"
            style={{
                background: 'linear-gradient(160deg, #F0F4FF 0%, var(--color-surface) 50%, #E8F0FE 100%)'
            }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24 text-center">
                <Badge tone="brand">
                    <Sparkles size={11} /> Trusted by 10,000+ learners
                </Badge>
                <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[44px] font-extrabold tracking-tight text-fg leading-[1.12] max-w-3xl mx-auto">
                    Master new skills with expert-led courses
                </h1>
                <p className="mt-5 text-base sm:text-lg text-fg-soft max-w-2xl mx-auto leading-relaxed">
                    From coding to cloud — learn at your own pace with live classes, hands-on projects, and industry certifications.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <Link to="/enquiry">
                        <Button
                            size="lg"
                            rightIcon={<ArrowRight size={16} />}>
                            Talk to a counsellor
                        </Button>
                    </Link>
                    <Link to="/courses">
                        <Button
                            size="lg"
                            variant="ghost"
                            leftIcon={<Play size={14} />}>
                            Browse courses
                        </Button>
                    </Link>
                </div>

                {/* Stats row */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                    {STATS.map((s) => (
                        <div
                            key={s.k}
                            className="flex flex-col items-center">
                            <div className="font-mono text-2xl sm:text-3xl font-bold text-fg tracking-tight">{s.n}</div>
                            <div className="mt-1 text-xs text-fg-muted">{s.k}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Soft decorative orbs */}
            <div
                aria-hidden
                className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 blur-3xl"
                style={{ background: 'var(--color-brand-100)' }}
            />
            <div
                aria-hidden
                className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-30 blur-3xl"
                style={{ background: 'var(--color-brand-100)' }}
            />
        </section>

        {/* WHY / FEATURES --------------------------------------------------- */}
        <section className="py-20 border-t">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="text-xs uppercase tracking-wider text-fg-muted font-semibold">Why Albero Academy</div>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-fg tracking-tight">Learn the way working engineers actually learn</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {WHY.map((w) => (
                        <Card
                            key={w.title}
                            className="h-full">
                            <div className="w-10 h-10 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center mb-4">
                                <w.icon size={18} />
                            </div>
                            <h3 className="text-base font-semibold text-fg">{w.title}</h3>
                            <p className="mt-1.5 text-sm text-fg-soft leading-relaxed">{w.body}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* FEATURED COURSES ------------------------------------------------- */}
        <section
            id="courses"
            className="py-20 border-t bg-surface-2">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-fg-muted font-semibold">Featured courses</div>
                        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-fg tracking-tight">Pick a path and start this week</h2>
                    </div>
                    <Link to="/courses">
                        <Button
                            variant="ghost"
                            size="sm"
                            rightIcon={<ArrowUpRight size={14} />}>
                            All courses
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURED_COURSES.map((c) => (
                        <Link
                            to={`/courses/${c.slug}/public`}
                            key={c.slug}
                            className="group">
                            <Card className="h-full flex flex-col hover:shadow-lift transition-shadow">
                                <div
                                    className="h-36 rounded-md mb-4 relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-brand-50), var(--color-brand-100))'
                                    }}>
                                    <BookOpen
                                        size={40}
                                        className="absolute right-4 bottom-4 text-[var(--color-brand-500)]/40"
                                    />
                                    <Badge
                                        tone={c.tagTone}
                                        className="absolute top-3 left-3">
                                        {c.tag}
                                    </Badge>
                                </div>
                                <h3 className="text-base font-semibold text-fg group-hover:text-brand transition-colors">{c.title}</h3>
                                <p className="text-xs text-fg-muted mt-1">by {c.mentor}</p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-fg-muted">
                                    <span className="inline-flex items-center gap-1">
                                        <BookOpen size={12} /> {c.lessons} lessons
                                    </span>
                                    <span>·</span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock size={12} /> {c.weeks} wks
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 text-sm">
                                        <Star
                                            size={14}
                                            className="fill-[var(--color-warn)] text-[var(--color-warn)]"
                                        />
                                        <span className="font-semibold text-fg">{c.rating}</span>
                                    </span>
                                    <span className="font-mono font-semibold text-fg">₹{c.price.toLocaleString('en-IN')}</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* TESTIMONIALS ----------------------------------------------------- */}
        <section className="py-20 border-t">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="text-xs uppercase tracking-wider text-fg-muted font-semibold">Student stories</div>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-fg tracking-tight">Stories from 10,000+ learners</h2>
                    <p className="mt-3 text-fg-soft">Real experiences from students who levelled up with Albero Academy.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                    {STORIES.map((t) => (
                        <blockquote
                            key={t.by}
                            className="card p-6 flex flex-col">
                            <div className="flex items-center gap-1 text-[var(--color-warn)] mb-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className="fill-current"
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-fg leading-relaxed">{t.quote}</p>
                            <footer className="mt-5 pt-4 border-t flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[var(--color-brand-500)] text-white flex items-center justify-center text-xs font-semibold">
                                    {t.by[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-fg">{t.by}</div>
                                    <div className="text-xs text-fg-muted">{t.role}</div>
                                </div>
                            </footer>
                        </blockquote>
                    ))}
                </div>
            </div>
        </section>

        {/* FAQ -------------------------------------------------------------- */}
        <section className="py-20 border-t bg-surface-2">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="text-xs uppercase tracking-wider text-fg-muted font-semibold">FAQ</div>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-fg tracking-tight">Questions learners ask before joining</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {FAQS.map((f) => (
                        <Card key={f.q}>
                            <div className="flex items-start gap-2">
                                <CheckCircle2
                                    size={14}
                                    className="mt-0.5 text-[var(--color-brand-500)] shrink-0"
                                />
                                <div>
                                    <h3 className="text-sm font-semibold text-fg">{f.q}</h3>
                                    <p className="mt-1 text-sm text-fg-soft">{f.a}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="mt-8 text-center text-sm text-fg-soft">
                    Have a different question?{' '}
                    <Link
                        to="/enquiry"
                        className="text-brand font-medium hover:underline">
                        Request a callback →
                    </Link>
                </div>
            </div>
        </section>

        {/* CTA -------------------------------------------------------------- */}
        <section className="py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div
                    className="relative rounded-lg overflow-hidden p-10 sm:p-14 text-center text-white"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)'
                    }}>
                    <Users
                        size={34}
                        className="mx-auto mb-4 opacity-80"
                    />
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Not sure where to start?</h2>
                    <p className="mt-3 text-white/85 max-w-xl mx-auto">
                        Leave your number. A counsellor will call you in the next working day to help you pick a path that fits your goals and
                        timeline.
                    </p>
                    <div className="mt-6 flex justify-center gap-3 flex-wrap">
                        <Link to="/enquiry">
                            <Button
                                size="lg"
                                className="!bg-white !text-[var(--color-brand-700)] !border-white hover:!bg-white/90"
                                rightIcon={<ArrowRight size={16} />}>
                                Request a callback
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button
                                size="lg"
                                variant="ghost"
                                className="!text-white !border-white/30 hover:!bg-white/10">
                                I already have an account
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    </div>
)
