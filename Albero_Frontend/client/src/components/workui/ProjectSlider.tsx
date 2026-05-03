import { useState, useRef, useEffect } from 'react'

interface Props {
    id: string
    total: number
    children: React.ReactNode
}

export default function ProjectSlider({ id, total, children }: Props) {
    const [current, setCurrent] = useState(0)
    const trackRef = useRef<HTMLDivElement>(null)
    const sliderRef = useRef<HTMLDivElement>(null)
    const touchStartX = useRef(0)

    const goTo = (idx: number) => {
        setCurrent(idx)
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(-${idx * 100}%)`
        }
        // Re-trigger reveal animations
        setTimeout(() => {
            if (trackRef.current) {
                const slides = trackRef.current.querySelectorAll('.project-slide')
                const activeSlide = slides[idx]
                if (activeSlide) {
                    const revealEls = activeSlide.querySelectorAll('.reveal,.reveal-left,.reveal-right')
                    revealEls.forEach((el) => {
                        el.classList.remove('visible')
                        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')))
                    })
                }
            }
        }, 0)
    }

    useEffect(() => {
        // Trigger first slide on scroll reveal
        const slider = sliderRef.current
        if (!slider) return
        const sectionReveal = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (trackRef.current) {
                            const firstSlide = trackRef.current.querySelector('.project-slide')
                            if (firstSlide) {
                                firstSlide.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach((el) => {
                                    el.classList.add('visible')
                                })
                            }
                        }
                        sectionReveal.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 }
        )
        sectionReveal.observe(slider)
        return () => sectionReveal.disconnect()
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight' && current < total - 1) goTo(current + 1)
        if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1)
    }

    return (
        <div
            className="project-slider"
            ref={sliderRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}>
            {/* Nav */}
            <div className="slider-nav reveal">
                <div className="slider-dots">
                    {Array.from({ length: total }).map((_, i) => (
                        <button
                            key={i}
                            className={`slider-dot${i === current ? ' active' : ''}`}
                            aria-label={`Go to slide ${i + 1}`}
                            onClick={() => goTo(i)}
                        />
                    ))}
                </div>
                <div className="slider-controls">
                    <span className="slider-counter">
                        <span>{current + 1}</span> / <span>{total}</span>
                    </span>
                    <button
                        className="slider-btn"
                        id={`prev-${id}`}
                        aria-label="Previous"
                        disabled={current === 0}
                        onClick={() => {
                            if (current > 0) goTo(current - 1)
                        }}>
                        ←
                    </button>
                    <button
                        className="slider-btn"
                        id={`next-${id}`}
                        aria-label="Next"
                        disabled={current === total - 1}
                        onClick={() => {
                            if (current < total - 1) goTo(current + 1)
                        }}>
                        →
                    </button>
                </div>
            </div>

            {/* Track */}
            <div
                ref={trackRef}
                className="project-slides"
                onTouchStart={(e) => {
                    touchStartX.current = e.touches[0].clientX
                }}
                onTouchEnd={(e) => {
                    const diff = touchStartX.current - e.changedTouches[0].clientX
                    if (Math.abs(diff) > 50) {
                        if (diff > 0 && current < total - 1) goTo(current + 1)
                        if (diff < 0 && current > 0) goTo(current - 1)
                    }
                }}>
                {children}
            </div>
        </div>
    )
}
