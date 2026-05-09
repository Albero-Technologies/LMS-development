import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, Star, TrendingUp } from 'lucide-react'
import { SectionShell, SectionHeading } from './primitives'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export interface SuccessStory {
    id: string
    name: string
    role: string
    company: string
    photoUrl?: string
    salaryBeforeLpa: number
    salaryAfterLpa: number
    growthPct?: number
    testimonial: string
    starRating?: number // 1..5
    placedAt?: string // company chip text — defaults to `company`
}

interface Props {
    stories: SuccessStory[]
    /** Heading override — defaults to the canonical "Real People. Real Salary Jumps." */
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
    tone?: 'white' | 'soft' | 'deep'
}

// Auto-advancing carousel with manual nav. Mobile = horizontal snap-scroll
// (one-and-a-bit cards visible to indicate scrollability). Desktop pages
// 3 cards at a time and auto-advances every 4s, pausing on hover.
export const SuccessStories = ({
    stories,
    heading = (
        <>
            Real People. <span className="alb-gradient-text italic font-medium">Real Salary Jumps.</span>
        </>
    ),
    accent,
    description = 'Real career transformations with measurable salary growth — from entry-level roles to high-paying positions in top companies.',
    tone = 'white'
}: Props) => {
    if (stories.length === 0) return null
    return (
        <SectionShell tone={tone} spacing="normal">
            <SectionHeading
                eyebrow="Proven Career Outcomes"
                title={heading}
                accent={accent}
                description={description}
            />
            <Carousel stories={stories} />
        </SectionShell>
    )
}

const Carousel = ({ stories }: { stories: SuccessStory[] }) => {
    const trackRef = useRef<HTMLDivElement>(null)
    const [page, setPage] = useState(0)
    const [paused, setPaused] = useState(false)

    // 3 at a time on desktop. The counter only drives dot indicators +
    // scrollIntoView jumps — actual layout is CSS-only.
    const pages = Math.max(1, Math.ceil(stories.length / 3))

    useEffect(() => {
        if (paused || pages < 2) return
        const id = setInterval(() => setPage((p) => (p + 1) % pages), 4_000)
        return () => clearInterval(id)
    }, [paused, pages])

    useEffect(() => {
        const track = trackRef.current
        if (!track) return
        const card = track.querySelector('[data-story-card]') as HTMLElement | null
        if (!card) return
        const cardWidth = card.offsetWidth + 20 /* gap */
        track.scrollTo({ left: page * cardWidth * 3, behavior: 'smooth' })
    }, [page])

    // Compact path — fewer than 3 cards reads as a static centred grid.
    // The carousel chrome (arrows + dots) would be misleading when there's
    // nothing to scroll to, and the cards centred under the headline feels
    // more "premium proof" than "leftover from a wider rail".
    if (stories.length <= 2) {
        // We force `compact` on EVERY card here so each one takes its
        // cell's full width (capped at 380px) instead of inheriting the
        // carousel's 60%/33% rail widths — that bug left the photos
        // squashed to a 80px head-band when only 2 stories existed.
        const colsClass = stories.length === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-2'
        return (
            <div className={`grid gap-6 ${colsClass} max-w-[820px] mx-auto place-items-center`}>
                {stories.map((s, i) => (
                    <StoryCard key={s.id} story={s} delayMs={i * 120} compact />
                ))}
            </div>
        )
    }

    return (
        <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {/* Desktop arrow buttons */}
            <button
                type="button"
                aria-label="Previous stories"
                onClick={() => setPage((p) => (p - 1 + pages) % pages)}
                className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-105 hover:translate-x-[-2px]"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    boxShadow: 'var(--card-shadow-soft)',
                    color: 'var(--text-primary)'
                }}>
                <ChevronLeft size={18} />
            </button>
            <button
                type="button"
                aria-label="Next stories"
                onClick={() => setPage((p) => (p + 1) % pages)}
                className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-105 hover:translate-x-[2px]"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    boxShadow: 'var(--card-shadow-soft)',
                    color: 'var(--text-primary)'
                }}>
                <ChevronRight size={18} />
            </button>

            <div
                ref={trackRef}
                className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
                style={{ scrollPaddingLeft: 16 }}>
                {stories.map((s, i) => (
                    <StoryCard key={s.id} story={s} delayMs={(i % 3) * 100} />
                ))}
            </div>

            {pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-1.5">
                    {Array.from({ length: pages }).map((_, p) => (
                        <button
                            key={p}
                            type="button"
                            aria-label={`Go to page ${p + 1}`}
                            onClick={() => setPage(p)}
                            className="h-1.5 rounded-full transition-all"
                            style={{
                                width: p === page ? 28 : 8,
                                background: p === page ? 'var(--brand)' : 'var(--hairline)'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const StoryCard = ({
    story,
    delayMs = 0,
    compact = false
}: {
    story: SuccessStory
    delayMs?: number
    /** Single-card centred layout — caps the width so the lone card
     *  doesn't span the entire section. */
    compact?: boolean
}) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    const initials = story.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    const growth = story.growthPct ?? Math.round(((story.salaryAfterLpa - story.salaryBeforeLpa) / Math.max(1, story.salaryBeforeLpa)) * 100)
    const stars = Math.max(0, Math.min(5, story.starRating ?? 5))

    // Width buckets:
    //   compact  — 1 of 1, capped at 380px so it stays readable
    //   default  — fills its parent grid cell on desktop, snap-scroll width on mobile
    const widthClass = compact
        ? 'w-full max-w-[380px] mx-auto'
        : 'snap-start shrink-0 w-[88%] sm:w-[60%] md:w-[calc((100%-40px)/3)]'

    return (
        <article
            data-story-card
            ref={ref}
            className={`${widthClass} rounded-2xl overflow-hidden flex flex-col transition-all duration-[600ms] ease-out hover:translate-y-[-4px]`}
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: visible ? 'var(--card-shadow-soft)' : 'none',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delayMs}ms`
            }}>
            {/* Photo / initials hero. The initials tile is always rendered
                so a broken external photo (rate-limited Unsplash, dead CMS
                asset, etc.) still leaves a polished gradient + monogram
                instead of a broken-image square. */}
            <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'var(--gradient-aurora)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[64px] font-semibold text-white/95">{initials}</span>
                </div>
                {story.photoUrl && (
                    <img
                        src={story.photoUrl}
                        alt={story.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            // Hide the failed <img> so the initials tile
                            // underneath shows through cleanly.
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                    />
                )}
                {/* Bottom gradient overlay so the badge always reads */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                {/* Salary growth badge — top-left */}
                <div
                    className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold"
                    style={{
                        background: 'rgba(10, 15, 30, 0.92)',
                        color: '#fff',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)'
                    }}>
                    <TrendingUp size={11} /> {growth}% Salary Growth
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col">
                <div>
                    <h3 className="font-display text-[16.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                        {story.name}
                    </h3>
                    <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
                        {story.role} at {story.company}
                    </p>
                </div>

                {/* BEFORE → AFTER */}
                <div
                    className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: 'var(--section-soft)' }}>
                    <div className="text-center">
                        <div className="text-[9.5px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                            Before
                        </div>
                        <div className="font-display text-[18px] font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                            ₹{story.salaryBeforeLpa} LPA
                        </div>
                    </div>
                    <div
                        className="alb-arrow-pop w-7 h-7 rounded-full flex items-center justify-center text-white"
                        data-visible={visible ? 'true' : 'false'}
                        style={{ background: 'var(--gradient-brand)' }}>
                        <ArrowRight size={14} />
                    </div>
                    <div className="text-center">
                        <div className="text-[9.5px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--brand)' }}>
                            After
                        </div>
                        <div className="font-display text-[18px] font-semibold mt-0.5" style={{ color: 'var(--brand)' }}>
                            ₹{story.salaryAfterLpa} LPA
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-[13px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                    “{story.testimonial}”
                </p>

                {/* Footer — stars + placed-at chip */}
                <div className="mt-4 pt-4 flex items-center justify-between gap-2 border-t" style={{ borderColor: 'var(--hairline)' }}>
                    <div className="flex items-center gap-0.5" aria-label={`${stars} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={13} fill={i < stars ? '#f59e0b' : 'transparent'} stroke={i < stars ? '#f59e0b' : 'currentColor'} className={i < stars ? '' : 'text-fg-muted opacity-30'} />
                        ))}
                    </div>
                    <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                        Placed at {story.placedAt ?? story.company}
                    </span>
                </div>
            </div>
        </article>
    )
}
