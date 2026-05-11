import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import ResourceLayout from '@/components/user/resources/ResourceLayout'
import ResourceCard from '@/components/user/resources/ResourceCard'
import SEO from '@/components/user/common/SEO'
import StructuredData from '@/components/user/common/StructuredData'
import { blogsHubSEO } from '@/constants/seo'
import { Pen, BookOpen, Database, Brain, Code2, BarChart3, Briefcase, ArrowUpRight, Clock, Check, Loader2 } from 'lucide-react'
import { useCollection } from '@/hooks/useContent'
import { subscribeToNewsletter } from '@/services/newsletterService'

const ACCENT_CYCLE = ['orange', 'emerald', 'rose', 'amber', 'purple', 'blue'] as const
const ICON_CYCLE = [BookOpen, BarChart3, Brain, Brain, Code2, Briefcase] as const

const featured = {
    slug: 'data-warehousing-101-star-vs-snowflake',
    title: 'Data Warehousing 101: Star Schema vs Snowflake Schema',
    description:
        'Understand the fundamentals of data warehouse design — comparing star schema and snowflake schema with practical examples, use cases, and guidance on choosing the right approach.',
    tags: ['DataWarehousing', 'StarSchema', 'SnowflakeSchema'],
    meta: '5 May 2026 · 11 min read',
    category: 'Data Engineering',
    Icon: Database
}

const posts = [
    {
        slug: 'apache-kafka-real-time-pipelines',
        title: 'Apache Kafka: Building Real-Time Data Streaming Pipelines',
        description:
            'A beginner-friendly guide to Apache Kafka — covering core concepts like topics, partitions, producers, consumers, and how to build your first real-time streaming pipeline.',
        tags: ['ApacheKafka', 'DataEngineering', 'Streaming'],
        meta: '1 May 2026 · 9 min read',
        accent: 'orange' as const,
        icon: BookOpen
    },
    {
        slug: 'mastering-data-visualization',
        title: 'Mastering Data Visualization: Charts, Mistakes & Storytelling',
        description:
            'Master the principles of effective data visualization — learn which chart types to use, common mistakes to avoid, and how to turn raw data into compelling visual narratives.',
        tags: ['DataVisualization', 'DataScience', 'Charts'],
        meta: '8 Apr 2026 · 7 min read',
        accent: 'emerald' as const,
        icon: BarChart3
    },
    {
        slug: 'computer-vision-2026',
        title: 'Computer Vision in 2026: Real-World Applications Transforming Industries',
        description:
            'Explore how computer vision is being used in manufacturing, healthcare, agriculture, retail, and autonomous vehicles — with real case studies and the technology behind them.',
        tags: ['ComputerVision', 'AI', 'DeepLearning'],
        meta: '2 Apr 2026 · 8 min read',
        accent: 'rose' as const,
        icon: Brain
    },
    {
        slug: 'large-language-models-explained',
        title: 'Large Language Models Explained: How AI Understands Text',
        description:
            'A clear, non-technical explanation of how large language models like GPT and Claude work — covering transformers, training, fine-tuning, and real-world applications in 2026.',
        tags: ['LLM', 'AI', 'MachineLearning'],
        meta: '28 Mar 2026 · 8 min read',
        accent: 'amber' as const,
        icon: Brain
    },
    {
        slug: 'git-branching-strategies',
        title: 'Git Branching Strategies That Actually Work for Teams',
        description:
            'A practical comparison of Git Flow, GitHub Flow, and Trunk-Based Development — with real-world examples to help you pick the right strategy for your team and ship faster.',
        tags: ['Git', 'DevOps', 'Engineering'],
        meta: '20 Mar 2026 · 6 min read',
        accent: 'purple' as const,
        icon: Code2
    },
    {
        slug: 'investment-banking-analyst-day',
        title: 'Investment Banking: A Day in the Life of an Analyst',
        description:
            'What does a typical day in IB really look like? Hours, deal flow, pitch books, modeling, mentorship, and the unwritten rules every aspiring analyst should know.',
        tags: ['InvestmentBanking', 'Career', 'Finance'],
        meta: '15 Mar 2026 · 10 min read',
        accent: 'amber' as const,
        icon: Briefcase
    },
    {
        slug: 'cracking-pm-interview',
        title: 'Cracking the Product Manager Interview at MAANG',
        description:
            'A structured framework for PM interview prep — strategy questions, behavioral rounds, technical depth, and the case studies that get candidates hired at top tech firms.',
        tags: ['ProductManagement', 'Interviews', 'Career'],
        meta: '10 Mar 2026 · 12 min read',
        accent: 'blue' as const,
        icon: Briefcase
    }
]

const categories = [
    { name: 'All Articles', count: 15 },
    { name: 'Data Science', count: 3 },
    { name: 'Data Engineering', count: 3 },
    { name: 'Software Development', count: 2 },
    { name: 'AI', count: 3 },
    { name: 'Finance & Investment Banking', count: 4 }
]

export default function Blogs() {
    const navigate = useNavigate()
    const blogQ = useCollection('blog')

    // Newsletter form state. Status drives the UI: idle → loading → success
    // (locks the form + flashes a check) or error (inline message under input).
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [newsletterError, setNewsletterError] = useState<string | null>(null)

    const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const email = newsletterEmail.trim().toLowerCase()
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setNewsletterStatus('error')
            setNewsletterError('Please enter a valid email')
            return
        }
        setNewsletterStatus('loading')
        setNewsletterError(null)
        try {
            await subscribeToNewsletter({ email, source: 'blog-sidebar' })
            setNewsletterStatus('success')
            setNewsletterEmail('')
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err instanceof Error ? err.message : 'Could not subscribe — please try again')
            setNewsletterStatus('error')
            setNewsletterError(msg)
        }
    }

    // When the backend returns posts, prepend them to the static fallback so
    // editor-driven content shows first. Empty backend → falls through to the
    // static array below.
    const remotePosts = (blogQ.data?.items ?? []).map((it, i) => ({
        slug: it.slug,
        title: (it.data.title as string) || it.slug,
        description: (it.data.summary as string) || '',
        tags: [],
        meta: it.publishedAt ? new Date(it.publishedAt).toLocaleDateString() : '',
        accent: ACCENT_CYCLE[i % ACCENT_CYCLE.length],
        icon: ICON_CYCLE[i % ICON_CYCLE.length]
    }))
    const allPosts = [...remotePosts, ...posts]

    return (
        <>
            <SEO
                title={blogsHubSEO.title}
                description={blogsHubSEO.description}
                keywords={blogsHubSEO.keywords}
                url={blogsHubSEO.url}
                canonical={blogsHubSEO.canonical}
                image={blogsHubSEO.image}
                type={blogsHubSEO.type}
            />
            <StructuredData page="blogs" />
            <ResourceLayout
                eyebrow="Free Resources"
                title="Insights, Guides &"
                highlight="Career Intelligence"
                description="Practical tutorials and career guides written by industry experts — from investment banking to AI, data engineering to software development."
                icon={Pen}
                stats={[
                    { value: '15+', label: 'Articles' },
                    { value: '5', label: 'Topics' },
                    { value: 'Free', label: 'Always' }
                ]}>
                <div className="grid lg:grid-cols-[1fr_280px] gap-8 mt-4">
                    <div className="space-y-5">
                        {/* Featured */}
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -3 }}
                            onClick={() => navigate(`/resources/blogs/${featured.slug}`)}
                            className="group relative w-full rounded-3xl p-7 md:p-9 text-left overflow-hidden transition-all"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow)'
                            }}>
                            <div
                                aria-hidden="true"
                                className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
                                style={{ background: 'var(--brand-soft)', filter: 'blur(70px)' }}
                            />
                            <div className="relative z-[1] grid md:grid-cols-[1fr_180px] gap-6 items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.14em] uppercase"
                                            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                            ✦ Featured
                                        </span>
                                        <span
                                            className="text-[12px] font-semibold inline-flex items-center gap-1.5"
                                            style={{ color: 'var(--brand)' }}>
                                            <featured.Icon size={13} />
                                            {featured.category}
                                        </span>
                                        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                                        <span
                                            className="text-[12.5px]"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            Meritshot
                                        </span>
                                    </div>

                                    <h2
                                        className="font-display text-[26px] md:text-[34px] font-semibold leading-tight tracking-[-0.01em] mb-3"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {featured.title}
                                    </h2>
                                    <p
                                        className="text-[15px] leading-relaxed mb-5"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {featured.description}
                                    </p>

                                    <div
                                        className="flex items-center flex-wrap gap-3 text-[12.5px]"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock size={12} /> {featured.meta}
                                        </span>
                                        <span>·</span>
                                        {featured.tags.map((t, i) => (
                                            <span key={i}>#{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    className="hidden md:flex items-center justify-center w-full aspect-square rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg,#0ea5e9,#3b82f6)',
                                        color: '#fff'
                                    }}>
                                    <featured.Icon
                                        size={56}
                                        className="opacity-80"
                                    />
                                </div>
                            </div>

                            <div
                                className="absolute bottom-7 right-7 w-11 h-11 rounded-full inline-flex items-center justify-center transition-transform group-hover:rotate-45"
                                style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                <ArrowUpRight size={18} />
                            </div>
                        </motion.button>

                        {/* Posts grid */}
                        <div className="grid sm:grid-cols-2 gap-5">
                            {allPosts.map((post, i) => (
                                <ResourceCard
                                    key={`${post.slug}-${i}`}
                                    index={i}
                                    {...post}
                                    href={`/resources/blogs/${post.slug}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-5">
                        <div
                            className="rounded-2xl p-5"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                boxShadow: 'var(--card-shadow)'
                            }}>
                            <div
                                className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-4"
                                style={{ color: 'var(--text-tertiary)' }}>
                                Categories
                            </div>
                            <ul className="space-y-1">
                                {categories.map((c, i) => (
                                    <li key={i}>
                                        <button
                                            className="w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors"
                                            style={{ color: 'var(--text-primary)' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                            <span className="text-[14px]">{c.name}</span>
                                            <span
                                                className="text-[11px] px-2 py-0.5 rounded-full"
                                                style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)' }}>
                                                {c.count}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div
                            className="rounded-2xl p-5"
                            style={{
                                background: 'var(--accent-soft)',
                                border: '1px solid var(--accent)'
                            }}>
                            <div
                                className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-2"
                                style={{ color: 'var(--accent)' }}>
                                Newsletter
                            </div>
                            <h4
                                className="font-display text-[18px] font-semibold mb-2"
                                style={{ color: 'var(--text-primary)' }}>
                                Get weekly career insights
                            </h4>
                            <p
                                className="text-[12.5px] mb-4 leading-relaxed"
                                style={{ color: 'var(--text-secondary)' }}>
                                Practitioner-written, ad-free. One email a week.
                            </p>
                            {newsletterStatus === 'success' ? (
                                <div
                                    className="w-full rounded-lg px-3 py-3 text-[13px] inline-flex items-center gap-2 font-semibold"
                                    style={{ background: 'var(--surface)', color: 'var(--brand)', border: '1px solid var(--brand)' }}
                                    role="status">
                                    <Check size={14} /> You're on the list — check your inbox.
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleNewsletterSubmit}
                                    noValidate>
                                    <input
                                        type="email"
                                        required
                                        value={newsletterEmail}
                                        onChange={(e) => {
                                            setNewsletterEmail(e.target.value)
                                            if (newsletterStatus === 'error') {
                                                setNewsletterStatus('idle')
                                                setNewsletterError(null)
                                            }
                                        }}
                                        placeholder="you@example.com"
                                        disabled={newsletterStatus === 'loading'}
                                        aria-invalid={newsletterStatus === 'error'}
                                        className="w-full rounded-lg px-3 py-2 text-[13px] outline-none mb-2 disabled:opacity-60"
                                        style={{
                                            background: 'var(--surface)',
                                            border: `1px solid ${newsletterStatus === 'error' ? '#dc2626' : 'var(--line-strong)'}`,
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                    {newsletterError && (
                                        <div
                                            className="text-[11.5px] mb-2"
                                            style={{ color: '#dc2626' }}>
                                            {newsletterError}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={newsletterStatus === 'loading'}
                                        className="w-full rounded-lg py-2 text-[13px] font-semibold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        style={{ background: 'var(--accent)', color: '#fff' }}>
                                        {newsletterStatus === 'loading' ? (
                                            <>
                                                <Loader2
                                                    size={13}
                                                    className="animate-spin"
                                                />{' '}
                                                Subscribing…
                                            </>
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </aside>
                </div>
            </ResourceLayout>
        </>
    )
}
