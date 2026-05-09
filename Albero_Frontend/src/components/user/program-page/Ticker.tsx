import type { ReactNode } from 'react'

// Reusable infinite-scroll ticker. Renders the same children list 3× so a
// CSS translate of -33.333% loops seamlessly without a visible reset.
//
// Two directions ('left' / 'right') let callers stack alternating rows for
// visual depth (used by both ScrollingToolStrip and AlumniCompanyWall).
// Pause-on-hover is handled in CSS via .alb-ticker:hover .alb-ticker-track.

export interface TickerItem {
    key: string
    content: ReactNode
}

interface TickerProps {
    items: TickerItem[]
    direction?: 'left' | 'right'
    /** Full-loop duration in seconds — slower = calmer. Default 40s. */
    durationSeconds?: number
    /** Extra wrapper class — usually for vertical spacing between rows. */
    className?: string
}

export const Ticker = ({ items, direction = 'left', durationSeconds = 40, className }: TickerProps) => {
    if (items.length === 0) return null
    const tripled = [...items, ...items, ...items]
    return (
        <div
            className={`alb-ticker overflow-hidden relative ${className ?? ''}`}
            style={{
                // Soft fade-out at both edges so items don't pop in/out abruptly.
                maskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)'
            }}>
            <div
                className="alb-ticker-track"
                data-direction={direction}
                style={{ ['--ticker-duration' as string]: `${durationSeconds}s` }}>
                {tripled.map((item, i) => (
                    // Index suffix on the key because the list is duplicated 3×;
                    // React would otherwise complain about repeated keys.
                    <div
                        key={`${item.key}-${i}`}
                        className="shrink-0">
                        {item.content}
                    </div>
                ))}
            </div>
        </div>
    )
}
