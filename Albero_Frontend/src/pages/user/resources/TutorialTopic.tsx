import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { findTopic } from '@/constants/tutorial-content'
import SEO from '@/components/user/common/SEO'
import StructuredData, { buildDetailBreadcrumbs } from '@/components/user/common/StructuredData'
import { buildResourceDetailSEO } from '@/constants/seo'

export default function TutorialTopic() {
    const { slug = '' } = useParams<{ slug?: string }>()
    const topic = findTopic(slug)

    if (!topic)
        return (
            <Navigate
                to="/resources/tutorials"
                replace
            />
        )

    const totalMin = topic.chapters.reduce((acc, c) => acc + c.readMin, 0)
    const totalH = Math.floor(totalMin / 60)
    const remMin = totalMin % 60

    const seo = buildResourceDetailSEO({
        section: 'tutorials',
        slug: topic.slug,
        title: `${topic.name} Tutorials`,
        description: `Free, structured ${topic.name} tutorials — ${topic.chapters.length} chapters across ${totalH ? `${totalH}h ` : ''}${remMin}m of guided learning.`,
        keywords: `${topic.name} tutorial, learn ${topic.name}, free ${topic.name} course`
    })
    const breadcrumbs = buildDetailBreadcrumbs([
        { name: 'Resources', url: 'https://www.alberoacademy.com/resources/tutorials' },
        { name: 'Tutorials', url: 'https://www.alberoacademy.com/resources/tutorials' },
        { name: topic.name, url: seo.url }
    ])

    return (
        <div
            className="min-h-screen relative overflow-hidden"
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
            <section className="relative pt-[140px] pb-12 px-5 md:px-8">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -left-20 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(50px)' }}
                />
                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    <Link
                        to="/resources/tutorials"
                        className="inline-flex items-center gap-2 text-[13px] font-semibold mb-7"
                        style={{ color: 'var(--brand)' }}>
                        <ArrowLeft size={14} /> All tutorials
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}>
                        <div
                            className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase px-3 py-1 rounded-md mb-5"
                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            {topic.name} Track
                        </div>
                        <h1
                            className="font-display text-[44px] md:text-[64px] lg:text-[80px] font-medium tracking-[-0.02em] leading-[0.96] mb-5"
                            style={{ color: 'var(--text-primary)' }}>
                            {topic.name}{' '}
                            <span
                                className="italic font-light"
                                style={{ color: 'var(--brand)' }}>
                                tutorials
                            </span>
                        </h1>
                        <p
                            className="text-[16px] md:text-[18px] leading-relaxed max-w-[720px] mb-7"
                            style={{ color: 'var(--text-secondary)' }}>
                            {topic.description}
                        </p>
                        <div
                            className="flex flex-wrap items-center gap-5 text-[13px]"
                            style={{ color: 'var(--text-tertiary)' }}>
                            <span>{topic.chapters.length} chapters</span>
                            <span>·</span>
                            <span>
                                {totalH}h {remMin}m total reading
                            </span>
                            <span>·</span>
                            <span>Beginner to Advanced</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="px-5 md:px-8 pb-24">
                <div className="max-w-[1180px] mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {topic.chapters.map((c, i) => (
                            <motion.div
                                key={c.slug}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}>
                                <Link
                                    to={`/resources/tutorials/${c.slug}`}
                                    className="group block rounded-2xl p-6 h-full transition-all hover:-translate-y-1"
                                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--card-shadow)' }}>
                                    <div
                                        className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-md mb-3"
                                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                        {c.chapter}
                                    </div>
                                    <h3
                                        className="font-display text-[19px] font-semibold mb-2"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {c.title}
                                    </h3>
                                    <p
                                        className="text-[13.5px] leading-relaxed mb-4 line-clamp-3"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        {c.description}
                                    </p>
                                    <div
                                        className="flex items-center justify-between pt-3 border-t"
                                        style={{ borderColor: 'var(--line)' }}>
                                        <span
                                            className="inline-flex items-center gap-1.5 text-[12px]"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            <Clock size={11} /> {c.readMin} min read
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1 text-[12.5px] font-semibold transition-transform group-hover:translate-x-1"
                                            style={{ color: 'var(--brand)' }}>
                                            Start <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
