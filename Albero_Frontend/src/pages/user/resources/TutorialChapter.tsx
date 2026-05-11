import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Clock, ChevronRight, BookOpen } from 'lucide-react'
import { findChapter, findTopic } from '@/constants/tutorial-content'
import SEO from '@/components/user/common/SEO'
import StructuredData, { buildDetailBreadcrumbs } from '@/components/user/common/StructuredData'
import { buildTutorialChapterSEO } from '@/constants/seo'

export default function TutorialChapter() {
    const { topic = '', chapter: chapterParam = '' } = useParams<{ topic?: string; chapter?: string }>()
    const location = useLocation()
    const fullSlug = `${topic}/${chapterParam}`
    const chapter = findChapter(fullSlug)
    const [activeSection, setActiveSection] = useState<string>('')

    // Scroll-spy
    useEffect(() => {
        if (!chapter) return
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id)
                })
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        )
        chapter.toc.forEach((t) => {
            const el = document.getElementById(t.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [fullSlug, chapter])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, [location.pathname])

    if (!chapter) {
        // Show a 'coming soon' rather than 404 for valid topic chapters not yet written
        const topicSlug = fullSlug.split('/')[0]
        const topic = findTopic(topicSlug)
        if (topic) {
            return (
                <div
                    className="min-h-screen pt-[160px] pb-24 px-5 md:px-8"
                    style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
                    <div className="max-w-[760px] mx-auto text-center">
                        <Link
                            to={`/resources/tutorials/${topic.slug}`}
                            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-6"
                            style={{ color: 'var(--brand)' }}>
                            <ArrowLeft size={14} /> Back to {topic.name} tutorials
                        </Link>
                        <h1
                            className="font-display text-[40px] md:text-[56px] font-medium tracking-[-0.02em] leading-[0.98] mb-4"
                            style={{ color: 'var(--text-primary)' }}>
                            This chapter is <span className="italic font-light" style={{ color: 'var(--brand)' }}>coming soon.</span>
                        </h1>
                        <p className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>
                            We're publishing new chapters every week. In the meantime, start with the fundamentals.
                        </p>
                    </div>
                </div>
            )
        }
        return <Navigate to="/resources/tutorials" replace />
    }

    const seo = buildTutorialChapterSEO({
        topic,
        chapter: chapterParam,
        title: chapter.title,
        description: chapter.description ?? chapter.title,
        keywords: `${topic} tutorial, ${chapter.title}, learn ${topic}`
    })
    const topicName = findTopic(topic)?.name ?? topic
    const breadcrumbs = buildDetailBreadcrumbs([
        { name: 'Resources', url: 'https://www.alberoacademy.com/resources/tutorials' },
        { name: 'Tutorials', url: 'https://www.alberoacademy.com/resources/tutorials' },
        { name: topicName, url: `https://www.alberoacademy.com/resources/tutorials/${topic}` },
        { name: chapter.title, url: seo.url }
    ])

    return (
        // NOTE: avoid `overflow-hidden` on this root — it breaks the sticky
        // TOC `position: sticky; top: 8rem` on the right rail. Decorative
        // orbs in the hero are confined with their own clipping below.
        <div
            className="min-h-screen relative"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <SEO
                title={seo.title}
                description={seo.description}
                keywords={seo.keywords}
                url={seo.url}
                canonical={seo.canonical}
                image={seo.image}
                type={seo.type}
            />
            <StructuredData breadcrumbOverride={breadcrumbs} />
            {/* Hero */}
            <section className="relative pt-[140px] pb-10 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    {/* Breadcrumb */}
                    <nav
                        className="flex items-center gap-2 text-[12.5px] mb-7 flex-wrap"
                        style={{ color: 'var(--text-tertiary)' }}>
                        <Link to="/resources/tutorials" className="hover:underline">
                            Tutorials
                        </Link>
                        <ChevronRight size={12} />
                        <Link to={`/resources/tutorials/${chapter.topicSlug}`} className="hover:underline">
                            {chapter.topic}
                        </Link>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--text-primary)' }}>{chapter.chapter}</span>
                    </nav>

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div
                            className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase px-3 py-1 rounded-md mb-5"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            {chapter.chapter} · {chapter.topic}
                        </div>

                        <h1
                            className="font-display text-[36px] md:text-[56px] lg:text-[64px] font-medium tracking-[-0.02em] leading-[0.98] mb-5 max-w-[820px]"
                            style={{ color: 'var(--text-primary)' }}>
                            {chapter.title}
                        </h1>
                        <p className="text-[16px] md:text-[18px] leading-relaxed max-w-[720px] mb-7" style={{ color: 'var(--text-secondary)' }}>
                            {chapter.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={13} /> {chapter.readMin} min read
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1.5">
                                <BookOpen size={13} /> Beginner friendly
                            </span>
                            <span>·</span>
                            <div className="inline-flex flex-wrap gap-1.5">
                                {chapter.tags.map((t, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-md text-[11px]"
                                        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--line)' }}>
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Body + sidebar */}
            <section className="relative px-5 md:px-8 pb-24">
                <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1fr_240px] gap-12">
                    {/* Article */}
                    <article className="min-w-0">{chapter.content}</article>

                    {/* TOC */}
                    <aside className="hidden lg:block">
                        <div
                            className="sticky top-32 rounded-xl p-5"
                            style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                            <div
                                className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-3"
                                style={{ color: 'var(--text-tertiary)' }}>
                                On this page
                            </div>
                            <ul className="space-y-1.5">
                                {chapter.toc.map((t, i) => (
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
                </div>
            </section>

            {/* Prev / Next */}
            <section className="px-5 md:px-8 pb-24">
                <div className="max-w-[1180px] mx-auto">
                    <div
                        className="rounded-2xl p-2 flex flex-col sm:flex-row gap-2"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                        {chapter.prev ? (
                            <Link
                                to={`/resources/tutorials/${chapter.prev.slug}`}
                                className="flex-1 group rounded-xl p-5 transition-colors"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                                <div
                                    className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase font-semibold mb-2"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    <ArrowLeft size={12} /> Previous
                                </div>
                                <div className="font-display text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {chapter.prev.title}
                                </div>
                            </Link>
                        ) : (
                            <div className="flex-1" />
                        )}

                        {chapter.next && (
                            <Link
                                to={`/resources/tutorials/${chapter.next.slug}`}
                                className="flex-1 group rounded-xl p-5 transition-colors text-right"
                                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                                <div
                                    className="flex items-center gap-2 justify-end text-[11px] tracking-[0.18em] uppercase font-semibold mb-2"
                                    style={{ color: 'var(--brand)' }}>
                                    Next <ArrowRight size={12} />
                                </div>
                                <div
                                    className="font-display text-[18px] font-semibold"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {chapter.next.title}
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
