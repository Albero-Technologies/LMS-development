import { useEffect, useRef, useState } from 'react'

// Animates a numeric value from 0 → target once the host element scrolls
// into view. Returns a tuple of [ref, displayValue]. The display value is
// formatted via the host's preferred formatter (toLocaleString by default).
//
// Driven by requestAnimationFrame with an ease-out cubic so the count
// decelerates near the end — feels more "live counter" than a flat ramp.
// Honours prefers-reduced-motion: snaps straight to the target instead of
// animating.
export const useCountUp = <T extends HTMLElement = HTMLDivElement>(
    target: number,
    duration: number = 1800,
    formatter?: (value: number) => string
): [React.RefObject<T | null>, string] => {
    const ref = useRef<T>(null)
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const node = ref.current
        if (!node) return

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduced) {
            setValue(target)
            return
        }

        let raf = 0
        let started = false
        const obs = new IntersectionObserver(
            (entries) => {
                if (started) return
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        started = true
                        obs.disconnect()
                        const startTs = performance.now()
                        const tick = () => {
                            const now = performance.now()
                            const t = Math.min(1, (now - startTs) / duration)
                            // Ease-out cubic — fast start, gentle finish.
                            const eased = 1 - Math.pow(1 - t, 3)
                            setValue(Math.round(target * eased))
                            if (t < 1) raf = requestAnimationFrame(tick)
                        }
                        raf = requestAnimationFrame(tick)
                        break
                    }
                }
            },
            { threshold: 0.4 }
        )
        obs.observe(node)

        return () => {
            obs.disconnect()
            if (raf) cancelAnimationFrame(raf)
        }
    }, [target, duration])

    const display = formatter ? formatter(value) : value.toLocaleString('en-IN')
    return [ref, display]
}
