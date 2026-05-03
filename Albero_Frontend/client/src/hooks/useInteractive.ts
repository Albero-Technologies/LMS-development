import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// ─── Magnetic button (GSAP) ──────────────────────────────────────────────────
// Returns a ref. Attach it to a button/anchor; the element will follow the
// cursor with a soft easing while hovered.

interface MagnetOptions {
    /** Max pixel pull. Default 14. */
    strength?: number
    /** GSAP easing. Default 'power3.out'. */
    ease?: string
    /** Disable on touch devices. Default true. */
    touchDisabled?: boolean
}

export function useMagnet<T extends HTMLElement>({ strength = 14, ease = 'power3.out', touchDisabled = true }: MagnetOptions = {}) {
    const ref = useRef<T | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (touchDisabled && window.matchMedia('(pointer: coarse)').matches) return

        const handleMove = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect()
            const x = e.clientX - rect.left - rect.width / 2
            const y = e.clientY - rect.top - rect.height / 2
            const px = (x / (rect.width / 2)) * strength
            const py = (y / (rect.height / 2)) * strength
            gsap.to(el, { x: px, y: py, duration: 0.4, ease })
        }
        const reset = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
        }

        el.addEventListener('pointermove', handleMove)
        el.addEventListener('pointerleave', reset)
        return () => {
            el.removeEventListener('pointermove', handleMove)
            el.removeEventListener('pointerleave', reset)
            gsap.killTweensOf(el)
        }
    }, [strength, ease, touchDisabled])

    return ref
}

// ─── Tilt-on-hover (GSAP) ────────────────────────────────────────────────────
// Adds a 3D-perspective tilt that follows the cursor. Add to any card.

interface TiltOptions {
    /** Max rotation in degrees. Default 6. */
    max?: number
    /** Glare overlay element selector inside the ref (optional). */
    glareSelector?: string
}

export function useTilt<T extends HTMLElement>({ max = 6, glareSelector }: TiltOptions = {}) {
    const ref = useRef<T | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (window.matchMedia('(pointer: coarse)').matches) return

        const glare = glareSelector ? (el.querySelector(glareSelector) as HTMLElement | null) : null
        gsap.set(el, { transformPerspective: 800, transformStyle: 'preserve-3d' })

        const handleMove = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect()
            const px = (e.clientX - rect.left) / rect.width
            const py = (e.clientY - rect.top) / rect.height
            const rx = (0.5 - py) * max * 2
            const ry = (px - 0.5) * max * 2
            gsap.to(el, { rotationX: rx, rotationY: ry, duration: 0.35, ease: 'power2.out' })
            if (glare) {
                glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.18), transparent 50%)`
            }
        }
        const reset = () => {
            gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' })
            if (glare) glare.style.background = 'transparent'
        }

        el.addEventListener('pointermove', handleMove)
        el.addEventListener('pointerleave', reset)
        return () => {
            el.removeEventListener('pointermove', handleMove)
            el.removeEventListener('pointerleave', reset)
            gsap.killTweensOf(el)
        }
    }, [max, glareSelector])

    return ref
}

// ─── Count-up (requestAnimationFrame) ────────────────────────────────────────
// Drives a number from 0 → end when the element scrolls into view. Uses a
// plain rAF loop with an easing function so it can never silently no-op the
// way a CommonJS-wrapped animation library can under Vite's ESM interop.

interface CountUpOptions {
    end: number
    /** ms duration. Default 1600. */
    duration?: number
    /** Number of decimals. Default 0. */
    decimals?: number
    /** Optional formatter (overrides decimals/locale). */
    format?: (n: number) => string
    /** Prefix (e.g. "₹"). */
    prefix?: string
    /** Suffix (e.g. "+", "%", "k+"). */
    suffix?: string
}

// Smooth ease-out — matches anime's "easeOutExpo".
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

export function useCountUp<T extends HTMLElement>({
    end,
    duration = 1600,
    decimals = 0,
    format,
    prefix = '',
    suffix = ''
}: CountUpOptions) {
    const ref = useRef<T | null>(null)
    const started = useRef(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const render = (n: number) => {
            const rounded = decimals === 0 ? Math.round(n) : Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
            const text = format ? format(rounded) : rounded.toFixed(decimals)
            el.textContent = `${prefix}${text}${suffix}`
        }
        // Render initial state so the element shows "0+" / "0%" until the
        // observer fires — gives the span dimensions for the IO to measure.
        render(0)

        let raf = 0
        const start = () => {
            if (started.current) return
            started.current = true
            const startTs = performance.now()
            const tick = (now: number) => {
                const t = Math.min(1, (now - startTs) / duration)
                render(end * easeOutExpo(t))
                if (t < 1) raf = requestAnimationFrame(tick)
            }
            raf = requestAnimationFrame(tick)
        }

        // threshold:0 means "fire as soon as the element enters the viewport
        // by 1 pixel" — robust against tiny inline elements where threshold
        // 0.4 (40% of element area) may never be satisfied.
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        start()
                        io.disconnect()
                    }
                })
            },
            { threshold: 0, rootMargin: '0px 0px -10% 0px' }
        )
        io.observe(el)

        return () => {
            io.disconnect()
            if (raf) cancelAnimationFrame(raf)
        }
    }, [end, duration, decimals, format, prefix, suffix])

    return ref
}

// ─── Split-text reveal (GSAP) ────────────────────────────────────────────────
// Wraps each character in a span and staggers them up on scroll-into-view.
// Returns a ref. The element's existing text content is replaced with spans on
// mount and restored on unmount.

interface SplitRevealOptions {
    /** Per-char delay in seconds. Default 0.025. */
    stagger?: number
    /** Tween duration. Default 0.6. */
    duration?: number
    /** Vertical pixels to start from. Default 18. */
    yFrom?: number
    /** GSAP easing. Default 'power3.out'. */
    ease?: string
}

export function useSplitReveal<T extends HTMLElement>({
    stagger = 0.025,
    duration = 0.6,
    yFrom = 18,
    ease = 'power3.out'
}: SplitRevealOptions = {}) {
    const ref = useRef<T | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const original = el.textContent ?? ''
        // Wrap each character (and preserve word spacing).
        el.textContent = ''
        const fragment = document.createDocumentFragment()
        const charSpans: HTMLSpanElement[] = []
        for (const ch of original) {
            if (ch === ' ') {
                fragment.appendChild(document.createTextNode(' '))
                continue
            }
            const span = document.createElement('span')
            span.textContent = ch
            span.style.display = 'inline-block'
            span.style.willChange = 'transform, opacity'
            fragment.appendChild(span)
            charSpans.push(span)
        }
        el.appendChild(fragment)
        gsap.set(charSpans, { y: yFrom, opacity: 0 })

        let played = false
        const play = () => {
            if (played) return
            played = true
            gsap.to(charSpans, { y: 0, opacity: 1, duration, ease, stagger })
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        play()
                        io.disconnect()
                    }
                })
            },
            { threshold: 0.25 }
        )
        io.observe(el)
        return () => {
            io.disconnect()
            // Restore original text on unmount so React stays consistent.
            el.textContent = original
        }
    }, [stagger, duration, yFrom, ease])

    return ref
}
