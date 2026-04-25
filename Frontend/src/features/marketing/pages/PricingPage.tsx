// Public pricing page — mirrors lms.pen frame 71 (LP Pricing Page).
// Three straightforward tiers. No "per seat" or "enterprise" SaaS language —
// the learner sees prices in INR and decides on a single course.
import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { cn } from '@shared/helpers/cn'

const TIERS = [
    {
        name: 'Single course',
        price: 4999,
        cadence: 'per course',
        tagline: 'Commit to one track at a time.',
        features: [
            'Full access to one course',
            '12-month access to recordings',
            '1:1 mentor reviews during cohort',
            'Verifiable certificate on completion',
            '7-day money-back guarantee'
        ],
        cta: 'Talk to counsellor',
        highlight: false
    },
    {
        name: 'Career track',
        price: 14999,
        cadence: 'for three courses',
        tagline: 'Best for career switchers and promotion prep.',
        features: [
            'Three courses of your choice',
            'Lifetime access to recordings',
            'Dedicated mentor for 6 months',
            'Capstone project + interview prep',
            'Priority support'
        ],
        cta: 'Talk to counsellor',
        highlight: true
    },
    {
        name: 'Teams',
        price: null,
        cadence: 'per seat',
        tagline: 'Up-skill your engineering team together.',
        features: [
            'Everything in Career track',
            'Team dashboard & progress reports',
            'Private cohort option',
            'Invoicing with GST',
            'Dedicated account manager'
        ],
        cta: 'Contact sales',
        highlight: false
    }
]

const FAQS = [
    { q: 'Do I pay upfront?', a: 'Yes, courses are billed one-time. EMI options may be available during checkout.' },
    { q: 'Is GST included?', a: 'Prices shown are before GST. Your invoice will include applicable GST.' },
    { q: "What's the refund window?", a: 'Within 7 days of enrolling, ask for a full refund — no questions.' },
    { q: 'Can I gift a course?', a: "Yes — mention it on the counsellor call and we'll issue a gift invoice." }
]

export const PricingPage = () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge tone="brand">Pricing</Badge>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-fg tracking-tight">Straightforward prices, no surprises</h1>
            <p className="mt-3 text-fg-soft">Pick a single course or a three-course track. Refund within 7 days if it isn't a fit.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
            {TIERS.map((t) => (
                <Card
                    key={t.name}
                    className={cn('relative flex flex-col', t.highlight && '!border-[var(--color-brand-500)] shadow-lift')}>
                    {t.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge
                                tone="brand"
                                className="!bg-[var(--color-brand-500)] !text-white">
                                Most popular
                            </Badge>
                        </div>
                    )}
                    <h3 className="text-base font-semibold text-fg">{t.name}</h3>
                    <p className="text-sm text-fg-soft mt-1">{t.tagline}</p>
                    <div className="mt-4">
                        {t.price != null ? (
                            <>
                                <span className="font-mono text-4xl font-bold text-fg">₹{t.price.toLocaleString('en-IN')}</span>
                                <span className="ml-2 text-xs text-fg-muted">{t.cadence}</span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-fg">Custom</span>
                        )}
                    </div>
                    <ul className="mt-5 space-y-2.5 flex-1">
                        {t.features.map((f) => (
                            <li
                                key={f}
                                className="flex gap-2 text-sm text-fg-soft">
                                <Check
                                    size={14}
                                    className="mt-0.5 text-[var(--color-success)] shrink-0"
                                />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        to="/enquiry"
                        className="mt-6">
                        <Button
                            variant={t.highlight ? 'primary' : 'ghost'}
                            className="w-full"
                            rightIcon={<ArrowRight size={14} />}>
                            {t.cta}
                        </Button>
                    </Link>
                </Card>
            ))}
        </div>

        <div className="mt-16 grid sm:grid-cols-2 gap-4">
            {FAQS.map((f) => (
                <Card key={f.q}>
                    <h3 className="text-sm font-semibold text-fg">{f.q}</h3>
                    <p className="mt-1.5 text-sm text-fg-soft">{f.a}</p>
                </Card>
            ))}
        </div>
    </div>
)
