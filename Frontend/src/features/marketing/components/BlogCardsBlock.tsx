// Premium blog-card grid. Two variants:
//   - featured: first card spans 2 cols on desktop with a larger image area;
//     remaining cards in a 2-up sub-grid beside / below it
//   - grid: equal-weight 3-up grid with image, category chip, title, summary
//
// Each card uses the same accent palette as the bento section so resource
// hubs feel coherent across pages.

import { Link } from 'react-router-dom'
import { ArrowUpRight, Calendar, Clock } from 'lucide-react'
import type { BlogCardsSectionData, BlogCard } from '@features/admin/services/tenant.service'
import { MotionStagger, MotionItem } from './motion'

interface Props {
    section: { variant: 'featured' | 'grid'; data: BlogCardsSectionData }
    slugBase: string
}

const ACCENT_BG: Record<NonNullable<BlogCard['accent']>, string> = {
    brand: 'from-[var(--color-brand-500)] to-[var(--color-brand-700)]',
    purple: 'from-[var(--color-purple)] to-[#5b3df5]',
    teal: 'from-[var(--color-teal)] to-[#0e7490]',
    orange: 'from-[var(--color-orange)] to-[#c2410c]',
    pink: 'from-[var(--color-pink)] to-[#9d174d]'
}

const resolveLink = (slugBase: string, href: string | undefined): string => {
    if (!href) return slugBase || '#'
    if (/^https?:\/\//.test(href)) return href
    return `${slugBase}/${href.replace(/^\//, '')}`
}

export const BlogCardsBlock = ({ section, slugBase }: Props) => {
    const { eyebrow, title, subtitle, items = [] } = section.data
    if (items.length === 0) return null
    const isFeatured = section.variant === 'featured'

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {(eyebrow || title || subtitle) && (
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                            {eyebrow}
                        </span>
                    )}
                    {title && <h2 className="font-display mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h2>}
                    {subtitle && <p className="mt-3 text-fg-soft leading-relaxed text-base sm:text-lg">{subtitle}</p>}
                </div>
            )}

            {isFeatured && items.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-5">
                    <FeaturedCard
                        item={items[0]}
                        slugBase={slugBase}
                    />
                    <MotionStagger className="grid sm:grid-cols-2 lg:grid-cols-1 gap-5">
                        {items.slice(1, 5).map((it, i) => (
                            <MotionItem
                                key={i}
                                className="contents">
                                <BlogCardCompact
                                    item={it}
                                    slugBase={slugBase}
                                />
                            </MotionItem>
                        ))}
                    </MotionStagger>
                    {items.length > 5 && (
                        <MotionStagger className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-3">
                            {items.slice(5).map((it, i) => (
                                <MotionItem
                                    key={i}
                                    className="contents">
                                    <BlogCardStandard
                                        item={it}
                                        slugBase={slugBase}
                                    />
                                </MotionItem>
                            ))}
                        </MotionStagger>
                    )}
                </div>
            ) : (
                <MotionStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((it, i) => (
                        <MotionItem
                            key={i}
                            className="contents">
                            <BlogCardStandard
                                item={it}
                                slugBase={slugBase}
                            />
                        </MotionItem>
                    ))}
                </MotionStagger>
            )}
        </section>
    )
}

// ---- Featured (large) card ------------------------------------------------

const FeaturedCard = ({ item, slugBase }: { item: BlogCard; slugBase: string }) => {
    const accent = item.accent ?? 'brand'
    const href = resolveLink(slugBase, item.href)
    return (
        <article className="lg:col-span-2 group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-surface flex flex-col transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.18)]">
            <div className={`relative aspect-[16/9] bg-gradient-to-br ${ACCENT_BG[accent]} overflow-hidden`}>
                {item.imageUrl && (
                    <img
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                )}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '20px 20px' }}
                />
                {item.category && (
                    <span className="absolute top-5 left-5 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-fg shadow-sm">
                        {item.category}
                    </span>
                )}
            </div>
            <div className="p-7 flex-1 flex flex-col">
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-fg leading-tight">{item.title}</h3>
                {item.description && <p className="mt-3 text-fg-soft leading-relaxed line-clamp-3">{item.description}</p>}
                <CardMeta
                    item={item}
                    className="mt-5"
                />
                <Link
                    to={href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors w-fit">
                    Read article <ArrowUpRight size={14} />
                </Link>
            </div>
        </article>
    )
}

// ---- Compact card (used in featured-variant sidebar) ----------------------

const BlogCardCompact = ({ item, slugBase }: { item: BlogCard; slugBase: string }) => {
    const accent = item.accent ?? 'brand'
    const href = resolveLink(slugBase, item.href)
    return (
        <Link
            to={href}
            className="group flex gap-4 rounded-2xl border border-[var(--color-border)] bg-surface p-4 transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-md">
            <div className={`shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br ${ACCENT_BG[accent]} grid place-items-center text-white font-bold text-xl`}>
                {item.title.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
                {item.category && <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-brand-700)]">{item.category}</span>}
                <h4 className="font-display text-sm font-bold text-fg leading-snug line-clamp-2 mt-0.5 group-hover:text-[var(--color-brand-700)] transition-colors">{item.title}</h4>
                <CardMeta
                    item={item}
                    className="mt-1.5 text-[11px]"
                />
            </div>
        </Link>
    )
}

// ---- Standard (medium) card -----------------------------------------------

const BlogCardStandard = ({ item, slugBase }: { item: BlogCard; slugBase: string }) => {
    const accent = item.accent ?? 'brand'
    const href = resolveLink(slugBase, item.href)
    return (
        <Link
            to={href}
            className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-surface flex flex-col transition-all hover:border-[var(--color-brand-500)]/40 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
            <div className={`relative aspect-[16/10] bg-gradient-to-br ${ACCENT_BG[accent]} overflow-hidden`}>
                {item.imageUrl && (
                    <img
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                )}
                {item.category && (
                    <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-fg shadow-sm">
                        {item.category}
                    </span>
                )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-lg font-bold tracking-tight text-fg leading-snug line-clamp-2 group-hover:text-[var(--color-brand-700)] transition-colors">{item.title}</h3>
                {item.description && <p className="mt-2 text-sm text-fg-soft leading-relaxed line-clamp-3 flex-1">{item.description}</p>}
                <CardMeta
                    item={item}
                    className="mt-4 text-[11px]"
                />
            </div>
        </Link>
    )
}

const CardMeta = ({ item, className }: { item: BlogCard; className?: string }) => {
    if (!item.date && !item.readTime) return null
    return (
        <div className={`flex items-center gap-3 text-fg-muted ${className ?? ''}`}>
            {item.date && (
                <span className="inline-flex items-center gap-1">
                    <Calendar size={11} /> {item.date}
                </span>
            )}
            {item.readTime && (
                <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {item.readTime}
                </span>
            )}
        </div>
    )
}
