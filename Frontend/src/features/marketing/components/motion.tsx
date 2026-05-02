// Framer Motion building blocks used by landing-section renderers. Kept
// separate from LandingSection.tsx so motion code stays opt-in — pages that
// only render server-side static blocks don't pay for the bundle if they
// avoid these wrappers.
//
// Three primitives:
//
//   <MotionStagger>     — Wraps a list, animates children one-after-another
//                          on viewport entry. Honors prefers-reduced-motion.
//   <MotionItem>        — Child of MotionStagger. Each animates fade+rise.
//   <ParallaxLayer>     — Translates Y as the user scrolls past it. Used for
//                          hero images and decorative orbs.
//   <RevealText>        — Word-by-word reveal on viewport entry — works well
//                          for big display headlines.

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'

const STAGGER_VARIANTS = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
} as const

const ITEM_VARIANTS = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } }
} as const

interface StaggerProps {
    children: ReactNode
    className?: string
    /** Defaults to "div". Pass `"ul"` for proper semantics on lists. */
    as?: 'div' | 'ul' | 'ol' | 'section'
}

export const MotionStagger = ({ children, className, as = 'div' }: StaggerProps) => {
    const reduced = useReducedMotion()
    const Component = motion[as] as typeof motion.div
    if (reduced) {
        const Plain = as
        return <Plain className={className}>{children}</Plain>
    }
    return (
        <Component
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={STAGGER_VARIANTS}>
            {children}
        </Component>
    )
}

interface ItemProps {
    children: ReactNode
    className?: string
    as?: 'div' | 'li' | 'article' | 'figure'
}

export const MotionItem = ({ children, className, as = 'div' }: ItemProps) => {
    const reduced = useReducedMotion()
    const Component = motion[as] as typeof motion.div
    if (reduced) {
        const Plain = as
        return <Plain className={className}>{children}</Plain>
    }
    return (
        <Component
            className={className}
            variants={ITEM_VARIANTS}>
            {children}
        </Component>
    )
}

interface ParallaxProps {
    children: ReactNode
    className?: string
    /** How aggressive the parallax. 0 = none, 1 = strong. Default 0.4. */
    strength?: number
}

// Translates Y relative to the user's scroll progress through the layer.
// Used to give hero images and decorative orbs a sense of depth without
// committing to full scroll-linked timeline animation. Disabled under
// reduced-motion.
export const ParallaxLayer = ({ children, className, strength = 0.4 }: ParallaxProps) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const reduced = useReducedMotion()
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })
    // Translate range scales with `strength`; -50…+50 px at strength=1.
    const y = useTransform(scrollYProgress, [0, 1], [-50 * strength, 50 * strength])

    if (reduced) {
        return (
            <div
                ref={ref}
                className={className}>
                {children}
            </div>
        )
    }
    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ y, willChange: 'transform' }}>
            {children}
        </motion.div>
    )
}

interface RevealTextProps {
    text: string
    className?: string
    delay?: number
}

// Word-by-word fade+rise on viewport entry. Falls back to a single static
// span under reduced-motion. Tag is `span` so it can wrap inline inside an
// h1 / h2 alongside other content.
export const RevealText = ({ text, className, delay = 0 }: RevealTextProps) => {
    const reduced = useReducedMotion()
    if (reduced) return <span className={className}>{text}</span>
    const words = text.split(' ')
    return (
        <motion.span
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ staggerChildren: 0.04, delayChildren: delay }}>
            {words.map((w, i) => (
                <motion.span
                    key={`${w}-${i}`}
                    style={{ display: 'inline-block', whiteSpace: 'pre' }}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } }
                    }}>
                    {w}
                    {i < words.length - 1 ? ' ' : ''}
                </motion.span>
            ))}
        </motion.span>
    )
}
