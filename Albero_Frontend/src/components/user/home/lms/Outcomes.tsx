import { motion } from 'motion/react'
import { TrendingUp, Award, Briefcase, Users } from 'lucide-react'
import { useCountUp } from '@/hooks/useInteractive'

type Stat = {
    end: number
    prefix?: string
    suffix?: string
    decimals?: number
    l: string
    sub: string
    Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>
}

const stats: Stat[] = [
    { end: 92, suffix: '%', l: 'Placement Rate', sub: 'Within 6 months of graduation', Icon: Award },
    { end: 12.4, prefix: '₹', suffix: ' LPA', decimals: 1, l: 'Median Offer', sub: 'Across the 2025 cohorts', Icon: TrendingUp },
    { end: 180, suffix: '+', l: 'Hiring Partners', sub: 'Actively recruiting our learners', Icon: Briefcase },
    { end: 12000, suffix: '+', l: 'Alumni Network', sub: 'And growing every cohort', Icon: Users }
]

function StatNumber({ stat }: { stat: Stat }) {
    const ref = useCountUp<HTMLDivElement>({
        end: stat.end,
        prefix: stat.prefix,
        suffix: stat.suffix,
        decimals: stat.decimals ?? 0,
        duration: 1800,
        format: stat.end >= 1000 && (stat.decimals ?? 0) === 0 ? (n) => Math.round(n).toLocaleString('en-IN') : undefined
    })
    return (
        <div
            ref={ref}
            className="font-display text-[32px] md:text-[40px] leading-none font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--text-primary)' }}
        />
    )
}

export default function Outcomes() {
    return (
        <section
            className="relative py-24 px-5 md:px-8 overflow-hidden"
            style={{ background: 'var(--page-bg-soft)', color: 'var(--text-primary)' }}>
            <div className="max-w-[1280px] mx-auto">
                <div className="text-center mb-14">
                    <div
                        className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
                        style={{ color: 'var(--brand)' }}>
                        Outcomes that matter
                    </div>
                    <h2
                        className="font-display text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.02em] font-medium max-w-[820px] mx-auto"
                        style={{ color: 'var(--text-primary)' }}>
                        We measure ourselves on{' '}
                        <span
                            className="italic font-light"
                            style={{ color: 'var(--brand)' }}>
                            offers
                        </span>
                        , not enrollments.
                    </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((s, i) => {
                        const Icon = s.Icon
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className="rounded-2xl p-6 md:p-7"
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--line)',
                                    boxShadow: 'var(--card-shadow)'
                                }}>
                                <Icon
                                    size={20}
                                    style={{ color: 'var(--brand)' }}
                                    className="mb-4"
                                />
                                <StatNumber stat={s} />
                                <div
                                    className="text-[13px] font-semibold mt-3"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {s.l}
                                </div>
                                <div
                                    className="text-[12px] mt-1"
                                    style={{ color: 'var(--text-tertiary)' }}>
                                    {s.sub}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
