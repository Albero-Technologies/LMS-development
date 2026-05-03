import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Bottom-LEFT floating "back to top" button.
 *  - Animated scroll-progress ring around the icon
 *  - Lenis-aware smooth scroll
 *  - Theme-aware via --btt-* tokens (defined in index.css)
 *  - Slides in only after the user has scrolled past 480 px
 */
export default function BackToTopButton() {
    const [progress, setProgress] = useState(0)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
            setProgress(pct)
            setVisible(scrollTop > 480)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const scrollTop = () => {
        const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis
        if (lenis) lenis.scrollTo(0, { duration: 1.4 })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const ringSize = 52
    const stroke = 2.5
    const radius = (ringSize - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (progress / 100) * circumference

    return (
        <div
            aria-hidden={!visible}
            className="fixed bottom-6 left-6 z-[60] transition-all duration-300"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.92)',
                pointerEvents: visible ? 'auto' : 'none'
            }}>
            <button
                onClick={scrollTop}
                aria-label="Back to top"
                className="group relative inline-flex items-center justify-center w-[52px] h-[52px] rounded-full transition-transform hover:translate-y-[-2px]"
                style={{
                    background: 'var(--btt-bg)',
                    color: 'var(--btt-fg)',
                    border: '1px solid var(--btt-border)',
                    boxShadow: 'var(--btt-shadow)'
                }}>
                {/* Progress ring */}
                <svg
                    className="absolute inset-0 -rotate-90 pointer-events-none"
                    width={ringSize}
                    height={ringSize}
                    viewBox={`0 0 ${ringSize} ${ringSize}`}>
                    <circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--btt-track)"
                        strokeWidth={stroke}
                    />
                    <circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--btt-ring)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: 'stroke-dashoffset 0.18s linear' }}
                    />
                </svg>
                <ArrowUp size={18} className="relative z-[1]" />
            </button>
        </div>
    )
}
