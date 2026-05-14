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
// 4 cards at a time and auto-advances every 4s, pausing on hover.
export const SuccessStories = ({
    stories,
    heading = (
        <>
            Real Learners. <span className="alb-gradient-text italic font-medium">Real Career Transformations.</span>
        </>
    ),
    accent,
    description = 'From fresh graduates to working professionals, our learners have cracked high-paying roles at top companies with structured mentorship, real projects, and placement-driven training.',
    tone = 'white'
}: Props) => {
    if (stories.length === 0) return null
    return (
        <SectionShell
            tone={tone}
            spacing="normal">
            <SectionHeading
                eyebrow="Success Stories"
                title={heading}
                accent={accent}
                description={description}
            />
            <Carousel stories={stories} />
        </SectionShell>
    )
}

const CARDS_PER_PAGE = 4

const Carousel = ({ stories }: { stories: SuccessStory[] }) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [page, setPage] = useState(0)
    const [paused, setPaused] = useState(false)

    const pages = Math.max(1, Math.ceil(stories.length / CARDS_PER_PAGE))

    useEffect(() => {
        if (paused || pages < 2) return
        const id = setInterval(() => setPage((p) => (p + 1) % pages), 4_000)
        return () => clearInterval(id)
    }, [paused, pages])

    // Compact path — fewer than 3 cards reads as a static centred grid.
    if (stories.length <= 2) {
        const colsClass = stories.length === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-2'
        return (
            <div className={`grid gap-6 ${colsClass} max-w-[820px] mx-auto place-items-center`}>
                {stories.map((s, i) => (
                    <StoryCard
                        key={s.id}
                        story={s}
                        delayMs={i * 120}
                        compact
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}>
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

            {/* 
                Outer wrapper: clips overflow so only 4 cards are visible at once on desktop.
                On mobile: allow horizontal scroll with snap for native swipe feel.
            */}
            <div
                ref={wrapperRef}
                className="overflow-hidden">
                {/*
                    Inner track: a flex row that translates by -page * 100% to slide pages.
                    Each "page group" is exactly 100% of the wrapper width (4 cards).
                    On mobile we switch to snap-scroll instead of CSS translate.
                */}
                <div
                    className="hidden md:flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${page * 100}%)` }}>
                    {stories.map((s, i) => (
                        <div
                            key={s.id}
                            style={{ width: 'calc(25% - 15px)', flexShrink: 0, marginRight: i < stories.length - 1 ? 20 : 0 }}>
                            <StoryCard
                                story={s}
                                delayMs={(i % CARDS_PER_PAGE) * 100}
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile: native snap scroll, show ~1.1 cards to hint scrollability */}
                <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-hide">
                    {stories.map((s, i) => (
                        <div
                            key={s.id}
                            className="snap-start flex-shrink-0"
                            style={{ width: '88vw', maxWidth: 340 }}>
                            <StoryCard
                                story={s}
                                delayMs={(i % CARDS_PER_PAGE) * 100}
                            />
                        </div>
                    ))}
                </div>
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

const StoryCard = ({ story, delayMs = 0, compact = false }: { story: SuccessStory; delayMs?: number; compact?: boolean }) => {
    const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)
    const initials = story.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    const growth = story.growthPct ?? Math.round(((story.salaryAfterLpa - story.salaryBeforeLpa) / Math.max(1, story.salaryBeforeLpa)) * 100)
    const stars = Math.max(0, Math.min(5, story.starRating ?? 5))

    const widthStyle: React.CSSProperties = compact ? { width: '100%', maxWidth: 380 } : { width: '100%' } // width is controlled by the parent wrapper div in the carousel

    return (
        <article
            data-story-card
            ref={ref}
            className="snap-start rounded-2xl overflow-hidden flex flex-col transition-all duration-[600ms] ease-out hover:translate-y-[-4px]"
            style={{
                ...widthStyle,
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: visible ? 'var(--card-shadow-soft)' : 'none',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${delayMs}ms`
            }}>
            {/* Photo / initials hero */}
            <div
                className="relative aspect-[4/3] overflow-hidden"
                style={{ background: 'var(--gradient-aurora)' }}>
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
                    <h3
                        className="font-display text-[16.5px] font-semibold leading-tight"
                        style={{ color: 'var(--text-primary)' }}>
                        {story.name}
                    </h3>
                    <p
                        className="mt-0.5 text-[12.5px]"
                        style={{ color: 'var(--text-tertiary)' }}>
                        {story.role} at {story.company}
                    </p>
                </div>

                {/* BEFORE → AFTER */}
                <div
                    className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: 'var(--section-soft)' }}>
                    <div className="text-center">
                        <div
                            className="text-[9.5px] font-bold tracking-[0.18em] uppercase"
                            style={{ color: 'var(--text-tertiary)' }}>
                            Before
                        </div>
                        <div
                            className="font-display text-[18px] font-semibold mt-0.5"
                            style={{ color: 'var(--text-primary)' }}>
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
                        <div
                            className="text-[9.5px] font-bold tracking-[0.18em] uppercase"
                            style={{ color: 'var(--brand)' }}>
                            After
                        </div>
                        <div
                            className="font-display text-[18px] font-semibold mt-0.5"
                            style={{ color: 'var(--brand)' }}>
                            ₹{story.salaryAfterLpa} LPA
                        </div>
                    </div>
                </div>

                <p
                    className="mt-4 text-[13px] leading-relaxed line-clamp-3"
                    style={{ color: 'var(--text-secondary)' }}>
                    "{story.testimonial}"
                </p>

                {/* Footer — stars + placed-at chip */}
                <div
                    className="mt-4 pt-4 flex items-center justify-between gap-2 border-t"
                    style={{ borderColor: 'var(--hairline)' }}>
                    <div
                        className="flex items-center gap-0.5"
                        aria-label={`${stars} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={13}
                                fill={i < stars ? '#f59e0b' : 'transparent'}
                                stroke={i < stars ? '#f59e0b' : 'currentColor'}
                                className={i < stars ? '' : 'text-fg-muted opacity-30'}
                            />
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
