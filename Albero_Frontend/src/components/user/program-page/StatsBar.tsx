import { useCountUp } from '@/hooks/useCountUp'

export interface StatsBarItem {
    label: string
    /** Numeric target — used for the count-up. Pass 0 if you only want the suffix label. */
    value: number
    /** Pre/post fix glyph — e.g. "+", "%", "/5". */
    suffix?: string
    prefix?: string
}

interface Props {
    stats: StatsBarItem[]
    /** Pass 'soft' for an off-white bar, 'deep' for the dark-navy hero look. */
    tone?: 'soft' | 'deep' | 'gradient'
}

// Full-width stats bar with animated count-ups. Defaults to the deep
// dark-navy treatment from the Meritshot reference; pass tone="gradient"
// for the ArmorCode-style aurora wash.
export const StatsBar = ({ stats, tone = 'deep' }: Props) => {
    const bg =
        tone === 'soft'
            ? 'var(--section-soft)'
            : tone === 'gradient'
              ? 'var(--gradient-aurora)'
              : 'var(--section-deep)'
    const fg = tone === 'soft' ? 'var(--text-primary)' : '#f5f3ea'
    const sub = tone === 'soft' ? 'var(--text-tertiary)' : 'rgba(245,243,234,0.65)'

    return (
        <section className="px-5 md:px-8 py-12 md:py-14" style={{ background: bg, color: fg }}>
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                {stats.map((s) => (
                    <StatTile key={s.label} stat={s} subColor={sub} />
                ))}
            </div>
        </section>
    )
}

const StatTile = ({ stat, subColor }: { stat: StatsBarItem; subColor: string }) => {
    const [ref, value] = useCountUp<HTMLDivElement>(stat.value, 1800)
    return (
        <div ref={ref} className="text-center md:text-left">
            <div className="font-display text-[36px] md:text-[44px] font-semibold leading-none tracking-[-0.02em]">
                {stat.prefix}
                {stat.value > 0 ? value : ''}
                {stat.suffix}
            </div>
            <div className="mt-2 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: subColor }}>
                {stat.label}
            </div>
        </div>
    )
}
