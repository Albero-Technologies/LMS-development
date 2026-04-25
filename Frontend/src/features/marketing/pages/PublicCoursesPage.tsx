// Public course catalog — mirrors lms.pen frame 72 (LP Course Catalog Public).
// Visible to anonymous visitors. Clicking a course routes to the public detail
// page which has the enquire / enrol CTAs.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Clock, BookOpen, Star, ArrowRight } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'

type TPubCourse = {
    slug: string
    title: string
    mentor: string
    category: string
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    lessons: number
    weeks: number
    rating: number
    students: number
    price: number
    tag?: string
    tagTone?: 'brand' | 'ok' | 'purple'
}

const COURSES: TPubCourse[] = [
    {
        slug: 'sys-design',
        title: 'System Design Foundations',
        mentor: 'Anuj Verma',
        category: 'Backend',
        level: 'Intermediate',
        lessons: 24,
        weeks: 6,
        rating: 4.8,
        students: 1482,
        price: 4999,
        tag: 'Bestseller',
        tagTone: 'brand'
    },
    {
        slug: 'ts-fs',
        title: 'Full-stack TypeScript',
        mentor: 'Priya Iyer',
        category: 'Full-stack',
        level: 'Intermediate',
        lessons: 38,
        weeks: 10,
        rating: 4.9,
        students: 2120,
        price: 5999,
        tag: 'New cohort',
        tagTone: 'ok'
    },
    {
        slug: 'dsa-30',
        title: 'DSA in 30 days',
        mentor: 'Rohan Das',
        category: 'Fundamentals',
        level: 'Beginner',
        lessons: 30,
        weeks: 4,
        rating: 4.7,
        students: 4380,
        price: 2999,
        tag: 'Most enrolled',
        tagTone: 'purple'
    },
    {
        slug: 'react-prod',
        title: 'React for Production',
        mentor: 'Nikita Bhalla',
        category: 'Frontend',
        level: 'Advanced',
        lessons: 22,
        weeks: 5,
        rating: 4.8,
        students: 860,
        price: 3999
    },
    {
        slug: 'backend-node',
        title: 'Backend Engineering with Node 20',
        mentor: 'Kunal Shah',
        category: 'Backend',
        level: 'Intermediate',
        lessons: 35,
        weeks: 8,
        rating: 4.7,
        students: 1200,
        price: 4499
    },
    {
        slug: 'data-eng',
        title: 'Data Engineering on Postgres + Kafka',
        mentor: 'Meera Rao',
        category: 'Data',
        level: 'Advanced',
        lessons: 28,
        weeks: 7,
        rating: 4.8,
        students: 540,
        price: 5499
    }
]

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Full-stack', 'Data', 'Fundamentals'] as const
type Cat = (typeof CATEGORIES)[number]

export const PublicCoursesPage = () => {
    const [q, setQ] = useState('')
    const [cat, setCat] = useState<Cat>('All')

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        return COURSES.filter(
            (c) =>
                (cat === 'All' || c.category === cat) &&
                (needle ? c.title.toLowerCase().includes(needle) || c.mentor.toLowerCase().includes(needle) : true)
        )
    }, [q, cat])

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="mb-8 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-fg tracking-tight">Course catalog</h1>
                <p className="mt-3 text-fg-soft">
                    Short lessons, live cohorts, and 1:1 mentor feedback — pick the track that matches your next role.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search courses, mentors"
                        leftIcon={<Search size={14} />}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="Search courses"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className="chip whitespace-nowrap"
                            aria-pressed={cat === c}
                            onClick={() => setCat(c)}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <Empty
                    icon={<BookOpen size={32} />}
                    title="No matches"
                    description="Try a different keyword or category."
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((c) => (
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
                                    {c.tag && (
                                        <Badge
                                            tone={c.tagTone}
                                            className="absolute top-3 left-3">
                                            {c.tag}
                                        </Badge>
                                    )}
                                    <BookOpen
                                        size={42}
                                        className={cn('absolute right-4 bottom-4 text-[var(--color-brand-500)]/40')}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <Badge>{c.category}</Badge>
                                    <Badge>{c.level}</Badge>
                                </div>
                                <h3 className="mt-2 text-base font-semibold text-fg group-hover:text-brand transition-colors">{c.title}</h3>
                                <p className="text-xs text-fg-muted mt-1">by {c.mentor}</p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-fg-muted">
                                    <span className="inline-flex items-center gap-1">
                                        <BookOpen size={12} /> {c.lessons}
                                    </span>
                                    <span>·</span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock size={12} /> {c.weeks}w
                                    </span>
                                    <span>·</span>
                                    <span>{c.students.toLocaleString('en-IN')} students</span>
                                </div>
                                <div className="mt-4 pt-4 border-t flex items-center justify-between">
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
            )}

            <div className="mt-12 rounded-lg bg-surface-2 border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-fg">Not sure which course is right?</h3>
                    <p className="mt-1 text-sm text-fg-soft">A counsellor can help you pick based on your goals.</p>
                </div>
                <Link to="/enquiry">
                    <Button rightIcon={<ArrowRight size={14} />}>Talk to a counsellor</Button>
                </Link>
            </div>
        </div>
    )
}
