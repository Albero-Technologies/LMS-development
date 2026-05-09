import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Clock, Calendar, ChevronRight, Share2, Bookmark } from 'lucide-react'
import { findPost, listPosts, type BlogPost } from '@/constants/blog-content'
import { useCollectionItem } from '@/hooks/useContent'

const DEFAULT_GRADIENT = 'linear-gradient(135deg,#0d4f3c,#34d399)'

export default function BlogPostPage() {
    const { slug = '' } = useParams<{ slug?: string }>()
    const location = useLocation()
    const fallback = findPost(slug)
    const all = listPosts()

    // Pull the matching CMS row. When the post exists in the CMS we render
    // it (admin edits flow through); when it doesn't, we fall back to the
    // hand-curated constants. The CMS body field is plain HTML — wrapped in
    // dangerouslySetInnerHTML below since the only writers are tenant
    // admins, not end users.
    const cmsQuery = useCollectionItem('blog', slug)
    const cmsItem = cmsQuery.data?.item
    const post: BlogPost | null = useMemo(() => {
        if (cmsItem) {
            const data = cmsItem.data as { title?: string; summary?: string; coverImage?: string; body?: string; author?: string; category?: string }
            return {
                slug: cmsItem.slug,
                title: String(data.title ?? cmsItem.slug),
                description: String(data.summary ?? ''),
                category: String(data.category ?? 'Insights'),
                date: cmsItem.publishedAt ? new Date(cmsItem.publishedAt).toLocaleDateString() : '',
                readMin: 5,
                tags: [],
                author: { name: String(data.author ?? 'Albero Editorial'), role: 'Editor' },
                coverGradient: DEFAULT_GRADIENT,
                toc: [],
                // Render backend HTML inside a wrapper that matches the prose
                // styling. The constant version uses tutorial-prose JSX
                // helpers — for CMS posts we lean on a single rich-text
                // wrapper instead.
                content: (
                    <div
                        className="prose-cms"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: String(data.body ?? '') }}
                    />
                )
            }
        }
        return fallback ?? null
    }, [cmsItem, fallback])

    const [activeSection, setActiveSection] = useState<string>('')

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, [location.pathname])

    useEffect(() => {
        if (!post || post.toc.length === 0) return
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id)
                })
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        )
        post.toc.forEach((t) => {
            const el = document.getElementById(t.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [slug, post])

    if (!post)
        return (
            <Navigate
                to="/resources/blogs"
                replace
            />
        )

    const related = all.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3)
    const initials = post.author.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)

    return (
        <div
            className="min-h-screen relative"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* ── Hero with cover ── */}
            <section className="relative pt-[140px] pb-10 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -left-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div className="max-w-[920px] mx-auto relative z-[1]">
                    <nav
                        className="flex items-center gap-2 text-[12.5px] mb-7 flex-wrap"
                        style={{ color: 'var(--text-tertiary)' }}>
                        <Link
                            to="/resources/blogs"
                            className="hover:underline">
                            Blog
                        </Link>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--brand)' }}>{post.category}</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}>
                        <div
                            className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md mb-5"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            {post.category}
                        </div>

                        <h1
                            className="font-display text-[36px] md:text-[52px] lg:text-[60px] font-medium tracking-[-0.02em] leading-[1.02] mb-5"
                            style={{ color: 'var(--text-primary)' }}>
                            {post.title}
                        </h1>
                        <p
                            className="text-[16px] md:text-[18px] leading-relaxed mb-8 max-w-[760px]"
                            style={{ color: 'var(--text-secondary)' }}>
                            {post.description}
                        </p>

                        <div
                            className="flex items-center justify-between flex-wrap gap-4 pb-7 border-b"
                            style={{ borderColor: 'var(--line)' }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full inline-flex items-center justify-center font-semibold text-[12px]"
                                    style={{ background: 'var(--brand)', color: 'var(--text-on-inverse)' }}>
                                    {initials}
                                </div>
                                <div className="leading-tight">
                                    <div
                                        className="text-[13.5px] font-semibold"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {post.author.name}
                                    </div>
                                    <div
                                        className="text-[11.5px]"
                                        style={{ color: 'var(--text-tertiary)' }}>
                                        {post.author.role}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-x-5 gap-y-2 flex-wrap text-[12.5px]"
                                style={{ color: 'var(--text-tertiary)' }}>
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar size={12} /> {post.date}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock size={12} /> {post.readMin} min read
                                </span>
                                <button
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
                                    style={{ border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                                    <Bookmark size={12} /> Save
                                </button>
                                <button
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
                                    style={{ border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                                    <Share2 size={12} /> Share
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Cover banner */}
            <section className="px-5 md:px-8 mb-12">
                <div className="max-w-[920px] mx-auto">
                    <div
                        className="aspect-[16/7] md:aspect-[20/8] rounded-3xl flex items-end justify-end relative overflow-hidden"
                        style={{ background: post.coverGradient, boxShadow: 'var(--card-shadow-hover)' }}>
                        <div
                            className="absolute inset-0 pointer-events-none opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0, transparent 50%)' }}
                        />
                        <span className="relative font-display italic font-light text-[64px] md:text-[120px] tracking-[-0.04em] leading-none text-white/15 px-8 pb-4">
                            {post.category}
                        </span>
                    </div>
                </div>
            </section>

            {/* Body + sidebar */}
            <section className="relative px-5 md:px-8 pb-20">
                <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[920px_1fr] gap-12 justify-center">
                    <article className="min-w-0 max-w-[920px]">{post.content}</article>

                    {post.toc.length > 0 && (
                        <aside className="hidden lg:block min-w-[200px]">
                            <div
                                className="sticky top-32 rounded-xl p-5"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                <div
                                    className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-3"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    Contents
                                </div>
                                <ul className="space-y-1.5">
                                    {post.toc.map((t, i) => (
                                        <li key={i}>
                                            <a
                                                href={`#${t.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    const el = document.getElementById(t.id)
                                                    if (el) {
                                                        const y = el.getBoundingClientRect().top + window.pageYOffset - 100
                                                        window.scrollTo({ top: y, behavior: 'smooth' })
                                                    }
                                                }}
                                                className="block py-1 text-[13px] transition-colors"
                                                style={{
                                                    color: activeSection === t.id ? 'var(--brand)' : 'var(--text-secondary)',
                                                    borderLeft: `2px solid ${activeSection === t.id ? 'var(--brand)' : 'transparent'}`,
                                                    paddingLeft: '0.6rem'
                                                }}>
                                                {t.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    )}
                </div>
            </section>

            {/* Related */}
            {related.length > 0 && (
                <section
                    className="px-5 md:px-8 pb-24"
                    style={{ background: 'var(--page-bg-soft)' }}>
                    <div className="max-w-[1180px] mx-auto pt-16">
                        <div className="flex items-end justify-between mb-8">
                            <h2
                                className="font-display text-[28px] md:text-[36px] font-medium tracking-[-0.02em]"
                                style={{ color: 'var(--text-primary)' }}>
                                Continue reading
                            </h2>
                            <Link
                                to="/resources/blogs"
                                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                All articles <ArrowRight size={13} />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {related.map((p) => (
                                <Link
                                    key={p.slug}
                                    to={`/resources/blogs/${p.slug}`}
                                    className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                    <div
                                        className="aspect-[16/9] flex items-end justify-end relative"
                                        style={{ background: p.coverGradient }}>
                                        <span className="font-display italic text-[34px] text-white/25 pr-3 pb-1 leading-none">{p.category}</span>
                                    </div>
                                    <div className="p-5">
                                        <div
                                            className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2"
                                            style={{ color: 'var(--brand)' }}>
                                            {p.category}
                                        </div>
                                        <h3
                                            className="font-display text-[18px] font-semibold leading-tight mb-2"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {p.title}
                                        </h3>
                                        <div
                                            className="text-[12px]"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            {p.date} · {p.readMin} min read
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Bottom prev/back link */}
                        <div className="mt-12 text-center">
                            <Link
                                to="/resources/blogs"
                                className="inline-flex items-center gap-2 text-[14px] font-semibold"
                                style={{ color: 'var(--brand)' }}>
                                <ArrowLeft size={14} /> Back to all articles
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
