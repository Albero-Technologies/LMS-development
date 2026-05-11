import ResourceLayout from '@/components/user/resources/ResourceLayout'
import { Library, Code2, BarChart3, Database, FileSpreadsheet, PieChart, Calculator, ChevronRight, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '@/hooks/useContent'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'
import { tutorialsHubSEO } from '@/constants/seo'

const topics = [
    {
        name: 'Python',
        slug: 'python',
        chapters: 14,
        lessons: '50+',
        gradient: 'linear-gradient(135deg,#3b82f6,#facc15)',
        description: 'Master Python from basics to advanced — data types, loops, functions, OOP, and real-world projects.',
        icon: Code2
    },
    {
        name: 'Power BI',
        slug: 'power-bi',
        chapters: 12,
        lessons: '40+',
        gradient: 'linear-gradient(135deg,#facc15,#f97316)',
        description: 'Build interactive dashboards, DAX formulas, data modelling, and business intelligence reports.',
        icon: BarChart3
    },
    {
        name: 'Tableau',
        slug: 'tableau',
        chapters: 10,
        lessons: '35+',
        gradient: 'linear-gradient(135deg,#f97316,#ef4444)',
        description: 'Create stunning data visualisations, calculated fields, and interactive storytelling dashboards.',
        icon: PieChart
    },
    {
        name: 'SQL',
        slug: 'sql',
        chapters: 11,
        lessons: '45+',
        gradient: 'linear-gradient(135deg,#0ea5e9,#3b82f6)',
        description: 'Queries, joins, subqueries, window functions and database design for analytics work.',
        icon: Database
    },
    {
        name: 'Excel',
        slug: 'excel',
        chapters: 13,
        lessons: '50+',
        gradient: 'linear-gradient(135deg,#16a34a,#10b981)',
        description: 'Formulas, pivot tables, Power Query, dashboarding and advanced analytics in Excel.',
        icon: FileSpreadsheet
    },
    {
        name: 'Statistics',
        slug: 'statistics',
        chapters: 9,
        lessons: '30+',
        gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)',
        description: 'Descriptive & inferential statistics, hypothesis testing, regression, and data interpretation.',
        icon: Calculator
    }
]

const featuredChapters = [
    {
        ch: 'Chapter 1',
        slug: 'python/python-fundamentals',
        title: 'Python Fundamentals',
        desc: 'Learn the basics of Python — installation, variables, data types, input/output, comments, and your first programs.',
        read: '11 min',
        tags: ['Python', 'Basics']
    },
    {
        ch: 'Chapter 2',
        slug: 'python/python-operators',
        title: 'Python Operators',
        desc: 'Master arithmetic, comparison, logical, assignment, bitwise, membership, and identity operators with practical examples.',
        read: '14 min',
        tags: ['Python', 'Operators']
    },
    {
        ch: 'Chapter 3',
        slug: 'python/python-data-types',
        title: 'Python Data Types',
        desc: "Deep dive into Python's data types — integers, floats, strings, booleans, None, type conversion, and how they work.",
        read: '29 min',
        tags: ['Python', 'Data Types']
    },
    {
        ch: 'Chapter 4',
        slug: 'python/python-lists',
        title: 'Python Lists',
        desc: 'Master Python lists — creation, indexing, slicing, methods, iteration, comprehensions, nested lists, and more.',
        read: '28 min',
        tags: ['Python', 'Lists']
    },
    {
        ch: 'Chapter 5',
        slug: 'python/python-strings',
        title: 'Python Strings',
        desc: 'Complete guide to Python strings — creation, indexing, slicing, methods, formatting, regex basics and real-world use.',
        read: '24 min',
        tags: ['Python', 'Strings']
    },
    {
        ch: 'Chapter 6',
        slug: 'python/tuples-and-sets',
        title: 'Tuples & Sets',
        desc: 'Understand immutable tuples and unique-element sets — creation, operations, methods, use cases, and when to use which.',
        read: '34 min',
        tags: ['Python', 'Tuples']
    }
]

export default function Tutorials() {
    const navigate = useNavigate()
    const cmsQuery = useCollection('tutorials')

    // Convert CMS tutorial rows into the same shape as `featuredChapters` so
    // newly-published items appear in the grid alongside the static
    // "Python from beginner to advanced" path. We slug-prefix with the
    // CMS topic so the chapter route still resolves
    // (/resources/tutorials/<topic>/<chapter-slug>).
    const cmsChapters = (cmsQuery.data?.items ?? []).map((it, i) => {
        const data = it.data as { title?: string; topic?: string; chapter?: number; description?: string; readMin?: number }
        const topic = String(data.topic ?? 'general')
            .toLowerCase()
            .replace(/\s+/g, '-')
        return {
            ch: `Chapter ${data.chapter ?? i + 1}`,
            slug: `${topic}/${it.slug}`,
            title: String(data.title ?? it.slug),
            desc: String(data.description ?? ''),
            read: data.readMin ? `${data.readMin} min` : '—',
            tags: [String(data.topic ?? 'Tutorial')]
        }
    })
    // CMS rows lead — they're freshly published and likely the most-relevant.
    const allChapters = [...cmsChapters, ...featuredChapters]

    return (
        <>
            <SEO
                title={tutorialsHubSEO.title}
                description={tutorialsHubSEO.description}
                keywords={tutorialsHubSEO.keywords}
                url={tutorialsHubSEO.url}
                canonical={tutorialsHubSEO.canonical}
                image={tutorialsHubSEO.image}
                type={tutorialsHubSEO.type}
            />
            <StructuredData page="tutorials" />
        <ResourceLayout
            eyebrow="Free Tutorials"
            title="Learn by Doing,"
            highlight="Grow with Practice"
            description="Step-by-step tutorials across Python, Power BI, SQL, Excel, Statistics, and Tableau — built to sharpen your skills from beginner to advanced."
            icon={Library}
            stats={[
                { value: '6+', label: 'Topics' },
                { value: '26+', label: 'Chapters' },
                { value: 'Free', label: 'Always' }
            ]}>
            {/* Browse by Topic */}
            <div className="mb-20">
                <div className="text-center mb-10">
                    <h2
                        className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em] mb-3"
                        style={{ color: 'var(--text-primary)' }}>
                        Browse by topic
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Pick a topic and start learning — each tutorial is packed with practical lessons and hands-on examples.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map((t, i) => {
                        const Icon = t.icon
                        return (
                            <motion.button
                                key={t.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                whileHover={{ y: -4 }}
                                onClick={() => navigate(`/resources/tutorials/${t.slug}`)}
                                className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <div
                                    className="h-40 flex items-center justify-center relative overflow-hidden"
                                    style={{ background: t.gradient }}>
                                    <div
                                        className="absolute inset-0 opacity-10"
                                        style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0, transparent 50%)' }}
                                    />
                                    <span className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight drop-shadow">
                                        {t.name}
                                    </span>
                                    <Icon
                                        className="absolute right-5 bottom-5 text-white/30"
                                        size={64}
                                    />
                                </div>
                                <div className="p-6">
                                    <h3
                                        className="font-display text-[19px] font-semibold mb-2"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {t.name} Tutorials
                                    </h3>
                                    <p
                                        className="text-[14px] leading-relaxed mb-5"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {t.description}
                                    </p>
                                    <div
                                        className="flex items-center justify-between pt-4 border-t"
                                        style={{ borderColor: 'var(--line)' }}>
                                        <span
                                            className="px-3 py-1 rounded-full text-[11.5px] font-semibold"
                                            style={{
                                                background: 'var(--surface-2)',
                                                color: 'var(--text-secondary)',
                                                border: '1px solid var(--line)'
                                            }}>
                                            {t.lessons} Lessons
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1 text-[13px] font-semibold transition-transform group-hover:translate-x-1"
                                            style={{ color: 'var(--brand)' }}>
                                            Explore <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* Featured Chapters */}
            <div className="mb-12">
                <div className="text-center mb-10">
                    <div
                        className="inline-block px-4 py-1.5 rounded-full text-[12px] font-semibold tracking-tight mb-4"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        Featured Path · Python
                    </div>
                    <h2
                        className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.02em] mb-3"
                        style={{ color: 'var(--text-primary)' }}>
                        Python from{' '}
                        <span
                            className="italic font-light"
                            style={{ color: 'var(--brand)' }}>
                            beginner to advanced
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>14 chapters · 7h 36m total reading · Beginner to Advanced</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allChapters.map((c, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.04 }}
                            whileHover={{ y: -4 }}
                            onClick={() => navigate(`/resources/tutorials/${c.slug}`)}
                            className="text-left rounded-2xl p-6 transition-all duration-300"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow)'
                            }}>
                            <div
                                className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md mb-3"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                {c.ch}
                            </div>
                            <h3
                                className="font-display text-[19px] font-semibold mb-2"
                                style={{ color: 'var(--text-primary)' }}>
                                {c.title}
                            </h3>
                            <p
                                className="text-[14px] leading-relaxed mb-4 line-clamp-3"
                                style={{ color: 'var(--text-secondary)' }}>
                                {c.desc}
                            </p>
                            <div
                                className="flex items-center justify-between pt-3 border-t text-[12px]"
                                style={{ borderColor: 'var(--line)' }}>
                                <span
                                    className="inline-flex items-center gap-1.5"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    <Clock size={12} /> {c.read} read
                                </span>
                                <div className="flex gap-2">
                                    {c.tags.slice(0, 2).map((t, j) => (
                                        <span
                                            key={j}
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </ResourceLayout>
        </>
    )
}
