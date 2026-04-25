import { Link } from 'react-router-dom'
import { Award, Users, Heart, ArrowRight } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'

const VALUES = [
    {
        icon: Heart,
        title: 'Honest over flashy',
        body: "We tell you when a course isn't a fit. We'd rather lose the sale than waste your time."
    },
    {
        icon: Users,
        title: 'Mentors who ship',
        body: 'Every mentor has shipped production code in the last 24 months. No armchair theorists.'
    },
    {
        icon: Award,
        title: 'Verifiable outcomes',
        body: 'Public certificate URLs, capstone projects, and job-ready skills — not badges.'
    }
]

export const AboutPage = () => (
    <div>
        <section className="py-16 lg:py-24 border-b bg-surface-2">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                <Badge tone="brand">Our story</Badge>
                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-fg tracking-tight">
                    Practical courses. Real mentorship. Lasting careers.
                </h1>
                <p className="mt-4 text-fg-soft max-w-2xl mx-auto leading-relaxed">
                    Albero Academy started because the existing options forced learners to compromise: too slow, too theoretical, or too expensive. We
                    built the platform we wished we had when we started.
                </p>
            </div>
        </section>

        <section className="py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-5">
                {VALUES.map((v) => (
                    <Card
                        key={v.title}
                        className="h-full">
                        <div className="w-10 h-10 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center mb-4">
                            <v.icon size={18} />
                        </div>
                        <h3 className="text-base font-semibold text-fg">{v.title}</h3>
                        <p className="mt-1.5 text-sm text-fg-soft leading-relaxed">{v.body}</p>
                    </Card>
                ))}
            </div>
        </section>

        <section className="py-16 border-t">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">Ready to start your journey?</h2>
                <p className="mt-3 text-fg-soft max-w-xl mx-auto">
                    A counsellor can walk you through the catalog and help you pick a course that fits your goals and timeline.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                    <Link to="/courses">
                        <Button variant="ghost">Browse courses</Button>
                    </Link>
                    <Link to="/enquiry">
                        <Button rightIcon={<ArrowRight size={14} />}>Talk to counsellor</Button>
                    </Link>
                </div>
            </div>
        </section>
    </div>
)
