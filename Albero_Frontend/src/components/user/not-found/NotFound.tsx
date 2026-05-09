import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, Home, BookOpen, Library, Pen, Compass } from 'lucide-react'
import SEO from '../common/SEO'
import { notFoundSEO } from '@/constants/seo'

const trail = [
    { Icon: Library, label: 'Browse Tutorials', href: '/resources/tutorials' },
    { Icon: BookOpen, label: 'Explore Programs', href: '/programs/data-analytics' },
    { Icon: Pen, label: 'Read the Blog', href: '/resources/blogs' },
    { Icon: Compass, label: 'About Albero', href: '/about' }
]

function NotFound() {
    const navigate = useNavigate()

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center px-5 md:px-8"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            <SEO
                title={notFoundSEO.title}
                description={notFoundSEO.description}
                keywords={notFoundSEO.keywords}
                url={notFoundSEO.url}
                canonical={notFoundSEO.canonical}
                image={notFoundSEO.image}
                type={notFoundSEO.type}
            />

            {/* Background washes */}
            <div
                aria-hidden="true"
                className="absolute -top-40 left-[10%] w-[640px] h-[640px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-40 right-[5%] w-[520px] h-[520px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                    maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 30%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 30%, transparent 100%)'
                }}
            />

            <div className="relative z-[1] max-w-[1180px] mx-auto w-full grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
                {/* Left: Headline + actions */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}>
                    <div
                        className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-6 text-[12px] font-semibold tracking-tight"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--accent)' }}
                        />
                        Error 404
                    </div>

                    <h1
                        className="font-display text-[44px] sm:text-[64px] lg:text-[88px] leading-[0.96] tracking-[-0.02em] font-medium mb-6"
                        style={{ color: 'var(--text-primary)' }}>
                        This page took{' '}
                        <span
                            className="italic font-light"
                            style={{ color: 'var(--brand)' }}>
                            an unscheduled break.
                        </span>
                    </h1>

                    <p
                        className="text-[16px] md:text-[18px] leading-relaxed max-w-[540px] mb-8"
                        style={{ color: 'var(--text-secondary)' }}>
                        The link you followed is either out of date, mistyped, or was retired during one of our curriculum overhauls. Pick a path
                        below — we'll get you back to learning.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/"
                            className="px-6 py-3 rounded-full text-[14px] font-semibold inline-flex items-center gap-1.5 transition-transform hover:translate-y-[-1px]"
                            style={{
                                background: 'var(--brand)',
                                color: 'var(--text-on-inverse)',
                                boxShadow: '0 8px 22px rgba(13,79,60,0.30)'
                            }}>
                            <Home size={14} /> Go home
                        </Link>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-full text-[14px] font-semibold transition-colors"
                            style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--line-strong)' }}>
                            ← Back
                        </button>
                    </div>
                </motion.div>

                {/* Right: Big editorial 404 + breadcrumb cards */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="relative">
                    {/* Stroke "404" */}
                    <div
                        aria-hidden="true"
                        className="font-display select-none leading-none italic font-light tracking-[-0.04em] text-center"
                        style={{
                            fontSize: 'clamp(160px, 26vw, 320px)',
                            color: 'transparent',
                            WebkitTextStroke: '1.5px var(--line-strong)'
                        }}>
                        404
                    </div>

                    {/* Helpful links overlay */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        {trail.map((t, i) => {
                            const Icon = t.Icon
                            return (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.06 }}
                                    onClick={() => navigate(t.href)}
                                    className="group flex items-center justify-between gap-3 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                                    style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--line)',
                                        boxShadow: 'var(--card-shadow)'
                                    }}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-10 h-10 rounded-lg inline-flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                            <Icon size={16} />
                                        </div>
                                        <span
                                            className="text-[13.5px] font-semibold truncate"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {t.label}
                                        </span>
                                    </div>
                                    <ArrowUpRight
                                        size={15}
                                        className="flex-shrink-0 transition-transform group-hover:rotate-45"
                                        style={{ color: 'var(--text-tertiary)' }}
                                    />
                                </motion.button>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default NotFound
