// Public course detail page — visitors land here before they log in. The CTAs
// push to either the enquiry form (unknown buyer) or login (existing learner).
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Clock, Star, Users, CheckCircle2, Award } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'

// Keep the data shape close to the in-app course so we can swap for a real API
// call later without a page-level rewrite.
const DATA: Record<string, {
    title: string
    mentor: string
    category: string
    level: string
    lessons: number
    weeks: number
    price: number
    rating: number
    students: number
    description: string
    outcomes: string[]
    syllabus: string[]
}> = {
    'sys-design': {
        title: 'System Design Foundations',
        mentor: 'Anuj Verma',
        category: 'Backend',
        level: 'Intermediate',
        lessons: 24,
        weeks: 6,
        price: 4999,
        rating: 4.8,
        students: 1482,
        description:
            'Learn how to design systems that scale past 1M MAU. Weekly capstone, 1:1 mentor review, and a public certificate you can put on LinkedIn.',
        outcomes: [
            'Defend storage and consistency choices under real load',
            'Sketch robust APIs with versioning + backward compat',
            'Pick the right cache strategy for OLTP vs analytics',
            'Talk through tradeoffs like a senior engineer in interviews'
        ],
        syllabus: [
            'Week 1 — Fundamentals, latency vs throughput, back-of-envelope',
            'Week 2 — Database internals, replication, consistency models',
            'Week 3 — Caching: CDN, app-level, DB read replicas',
            'Week 4 — Async systems, queues, backpressure, fan-out',
            'Week 5 — Observability, error budgets, SLOs',
            'Week 6 — Capstone: design a Zomato-style platform end-to-end'
        ]
    },
    'ts-fs': {
        title: 'Full-stack TypeScript',
        mentor: 'Priya Iyer',
        category: 'Full-stack',
        level: 'Intermediate',
        lessons: 38,
        weeks: 10,
        price: 5999,
        rating: 4.9,
        students: 2120,
        description:
            'Ship a production app end-to-end with Express, Prisma, Zod, and React 19. Cohort-based with weekly code reviews.',
        outcomes: [
            'Stand up an Express API with Prisma + Zod from scratch',
            'Model auth, RBAC, and tenant isolation the right way',
            'Build a React 19 frontend with TanStack Query + Zustand',
            'Deploy to a free-tier stack: Neon + Upstash + Render + Netlify'
        ],
        syllabus: [
            'Module 1 — TS types vs interfaces; discriminated unions in 90 minutes',
            'Module 2 — Prisma schema design and migrations in practice',
            'Module 3 — Express + Zod + request IDs + structured logs',
            'Module 4 — React 19: server state, UI state, data-driven UIs',
            'Module 5 — Payments, invoices, webhooks (Razorpay)',
            'Module 6 — Tests, observability, and shipping'
        ]
    }
}

const FALLBACK = DATA['sys-design']

export const PublicCourseDetailPage = () => {
    const { slug = '' } = useParams()
    const c = DATA[slug] ?? FALLBACK

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-sm text-fg-soft hover:text-fg mb-6">
                <ArrowLeft size={14} /> All courses
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs">
                            <Badge tone="brand">{c.category}</Badge>
                            <Badge>{c.level}</Badge>
                        </div>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-fg tracking-tight">{c.title}</h1>
                        <p className="mt-1 text-sm text-fg-muted">by {c.mentor}</p>
                        <p className="mt-4 text-fg-soft leading-relaxed">{c.description}</p>

                        <div className="mt-5 flex items-center gap-4 text-sm text-fg-soft flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <Star
                                    size={14}
                                    className="fill-[var(--color-warn)] text-[var(--color-warn)]"
                                />
                                <span className="font-semibold text-fg">{c.rating}</span> rating
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Users size={14} /> {c.students.toLocaleString('en-IN')} students
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={14} /> {c.weeks} weeks · {c.lessons} lessons
                            </span>
                        </div>
                    </div>

                    <Card>
                        <h2 className="text-base font-semibold text-fg mb-3">What you'll learn</h2>
                        <ul className="grid sm:grid-cols-2 gap-2.5">
                            {c.outcomes.map((o) => (
                                <li
                                    key={o}
                                    className="flex gap-2 text-sm text-fg-soft">
                                    <CheckCircle2
                                        size={14}
                                        className="mt-0.5 text-[var(--color-success)] shrink-0"
                                    />
                                    <span>{o}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card>
                        <h2 className="text-base font-semibold text-fg mb-3">Syllabus</h2>
                        <ol className="space-y-3">
                            {c.syllabus.map((s, i) => (
                                <li
                                    key={s}
                                    className="flex gap-3 items-start">
                                    <span className="w-6 h-6 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-fg">{s}</span>
                                </li>
                            ))}
                        </ol>
                    </Card>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24 self-start">
                    <Card>
                        <div className="font-mono text-3xl font-bold text-fg">₹{c.price.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-fg-muted mt-1">One-time · lifetime access + updates</div>
                        <Link
                            to={`/enquiry?course=${encodeURIComponent(c.title)}`}
                            className="block mt-5">
                            <Button
                                className="w-full"
                                size="lg"
                                rightIcon={<ArrowRight size={14} />}>
                                Request a callback
                            </Button>
                        </Link>
                        <Link
                            to="/login"
                            className="block mt-2">
                            <Button
                                className="w-full"
                                variant="ghost"
                                size="lg">
                                I already have an account
                            </Button>
                        </Link>
                        <div className="mt-6 space-y-2.5 text-sm text-fg-soft">
                            <Feature label="Live cohort + recordings" />
                            <Feature label="1:1 mentor reviews" />
                            <Feature label="Capstone project" />
                            <Feature label="Verifiable certificate" />
                            <Feature label="7-day refund window" />
                        </div>
                    </Card>
                    <Card className="flex items-start gap-3">
                        <Award
                            size={18}
                            className="text-[var(--color-brand-500)] shrink-0 mt-0.5"
                        />
                        <div>
                            <h3 className="text-sm font-semibold text-fg">Certificate on completion</h3>
                            <p className="text-xs text-fg-muted mt-1">
                                Finish the capstone with ≥ 60% to receive a PDF certificate + a public verification URL.
                            </p>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    )
}

const Feature = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2">
        <CheckCircle2
            size={13}
            className="text-[var(--color-success)]"
        />
        <span>{label}</span>
    </div>
)
