import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Lenis-powered smooth scroll provider.
 * Mount once at the top of the tree. It registers RAF and disposes on unmount.
 *
 * - Disables on touch devices (native momentum is better there)
 * - Respects prefers-reduced-motion
 * - Hooks into anchor-link navigation so existing scroll-to-id still works
 */
export default function SmoothScroll() {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        const isTouch = window.matchMedia('(pointer: coarse)').matches
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (isTouch || reducedMotion) return

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            lerp: 0.1
        })
        lenisRef.current = lenis

        let rafId = 0
        const raf = (time: number) => {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        // expose for SPA scrollTo helpers (e.g., the navbar #anchor handler)
        ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
            delete (window as unknown as { __lenis?: Lenis }).__lenis
            lenisRef.current = null
        }
    }, [])

    return null
}
