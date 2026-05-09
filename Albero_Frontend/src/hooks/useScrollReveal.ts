import { useEffect, useRef, useState } from 'react'

// Cheap IntersectionObserver-based fade-up. Returns a ref to attach to the
// outer wrapper plus a boolean that flips once when the element enters the
// viewport. We disconnect on first hit so the animation never replays on
// re-scroll, which keeps the page calm and predictable.
//
// Honours `prefers-reduced-motion` — when set, we skip the wait and report
// "in-view" immediately so screen readers + accessibility users don't get a
// hidden translate-up state stuck on the page.
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(threshold: number = 0.15): [React.RefObject<T | null>, boolean] => {
    const ref = useRef<T>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduced) {
            setVisible(true)
            return
        }

        const node = ref.current
        if (!node) return

        const obs = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setVisible(true)
                        obs.disconnect()
                        break
                    }
                }
            },
            { threshold }
        )
        obs.observe(node)
        return () => obs.disconnect()
    }, [threshold])

    return [ref, visible]
}

// Tiny utility to compose the reveal class. Call with the boolean returned
// by useScrollReveal: `<div ref={ref} className={revealClass(visible)}>`.
// Keeps every section using the same animation contract.
export const revealClass = (visible: boolean, delayMs?: number): string => {
    const base = 'transition-all duration-[600ms] ease-out will-change-transform'
    const state = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    return delayMs ? `${base} ${state}` : `${base} ${state}`
        + (delayMs ? ` [transition-delay:${delayMs}ms]` : '')
}
