// Public blog list — mirrors lms.pen frame 73 (LP Blog).
import { Link } from 'react-router-dom'
import { Clock, User, ArrowUpRight } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'

type Post = {
    slug: string
    title: string
    summary: string
    author: string
    readingMin: number
    tag: string
    date: string
}

const POSTS: Post[] = [
    {
        slug: 'how-to-pick-your-first-course',
        title: 'How to pick your first course without overthinking it',
        summary:
            'A short, honest guide to picking the track that\'ll actually stick — based on goals, time available, and current level.',
        author: 'Priya Iyer',
        readingMin: 6,
        tag: 'Guidance',
        date: 'Apr 12, 2026'
    },
    {
        slug: 'cohort-vs-self-paced',
        title: 'Cohort vs self-paced: which one finishes the course?',
        summary:
            'Data from 10,000+ learners: completion rates, 1:1 mentorship impact, and when self-paced actually wins.',
        author: 'Anuj Verma',
        readingMin: 9,
        tag: 'Insights',
        date: 'Apr 08, 2026'
    },
    {
        slug: 'interview-prep-roadmap',
        title: 'A 6-week backend interview prep roadmap',
        summary:
            'Week-by-week plan: DSA warm-ups, system design frames, behavioural rehearsal, and mock rounds.',
        author: 'Rohan Das',
        readingMin: 12,
        tag: 'Careers',
        date: 'Apr 02, 2026'
    },
    {
        slug: 'system-design-templates',
        title: 'Three system design templates I use in every interview',
        summary:
            'Ledger, feed, and notification — the three templates that cover 70% of system design rounds.',
        author: 'Anuj Verma',
        readingMin: 14,
        tag: 'Engineering',
        date: 'Mar 28, 2026'
    }
]

export const BlogPage = () => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <header className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-fg tracking-tight">LearnHub Blog</h1>
            <p className="mt-3 text-fg-soft">Insights, tutorials, and stories from our learners and instructors.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-5">
            {POSTS.map((p) => (
                <Link
                    key={p.slug}
                    to={`/blog/${p.slug}`}
                    className="group">
                    <Card className="h-full flex flex-col hover:shadow-lift transition-shadow">
                        <div
                            className="h-40 rounded-md mb-4"
                            style={{
                                background:
                                    'linear-gradient(135deg, var(--color-brand-50), var(--color-brand-100))'
                            }}
                        />
                        <div className="flex items-center gap-2 text-xs mb-2">
                            <Badge tone="brand">{p.tag}</Badge>
                            <span className="text-fg-muted">·</span>
                            <span className="text-fg-muted">{p.date}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-fg group-hover:text-brand transition-colors">
                            {p.title}
                        </h2>
                        <p className="mt-2 text-sm text-fg-soft leading-relaxed line-clamp-3">{p.summary}</p>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-fg-muted">
                            <span className="inline-flex items-center gap-1.5">
                                <User size={12} />
                                {p.author}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={12} />
                                {p.readingMin} min read
                                <ArrowUpRight
                                    size={12}
                                    className="group-hover:text-brand transition-colors"
                                />
                            </span>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
)

export const BlogArticlePage = () => (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Link
            to="/blog"
            className="text-sm text-fg-soft hover:text-fg">
            ← All posts
        </Link>
        <header className="mt-6 border-b pb-6">
            <Badge tone="brand">Insights</Badge>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-fg tracking-tight leading-tight">
                How to pick your first course without overthinking it
            </h1>
            <div className="mt-4 flex items-center gap-3 text-xs text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                    <User size={12} /> Priya Iyer
                </span>
                <span>·</span>
                <span>Apr 12, 2026</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} /> 6 min read
                </span>
            </div>
        </header>
        <div className="mt-8 prose prose-sm max-w-none text-fg-soft leading-relaxed space-y-4">
            <p>
                The hardest part isn't the course — it's picking one. Most learners spend three days reading syllabus
                tables and finish with exactly the same unfinished list they started with. Here is the shortest honest
                version of what actually works.
            </p>
            <h2 className="text-xl font-semibold text-fg mt-6">Pick by job, not by topic</h2>
            <p>
                "I want to learn system design" is a topic. "I want to interview at a product startup in six months"
                is a job. Courses designed around jobs are shorter, denser, and less tempted to scope-creep.
            </p>
            <h2 className="text-xl font-semibold text-fg mt-6">The 3 × 3 test</h2>
            <p>
                Can you describe three projects the course will help you ship, and three interview questions it will
                help you nail? If either list has fewer than three items, the course is probably wrong for you.
            </p>
            <p>
                Still unsure? Book a 15-minute call with a counsellor. We\'ll listen, not sell.
            </p>
        </div>
    </article>
)
