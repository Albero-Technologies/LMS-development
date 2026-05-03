import { Card } from '@/components/ui/card'
import { Badge } from '../../ui/badge'
import { statsData } from '@/constants/stats'

type Stat = {
    value: string
    label: string
}

const STATS: Stat[] = statsData.stats

export default function Stats() {
    return (
        <section
            id="about"
            className="bg-black px-5 py-12 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
                <Badge
                    variant="outline"
                    className="mb-6 text-white text-xl">
                    {statsData.badgeTitle}
                </Badge>
                <h2 className="text-3xl md:text-4xl text-white font-bold mb-6">{statsData.heading}</h2>
                <p className="text-lg text-white/70 mb-8">{statsData.description}</p>
            </div>
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
                <Card
                    role="list"
                    aria-label="Key product stats"
                    className={[
                        // Always 3 columns, never wrap
                        'grid grid-cols-3',
                        // Equal width and spacing
                        'gap-2 sm:gap-4 md:gap-6',
                        'p-3 sm:p-4 md:p-6',
                        // Vertical dividers between items
                        'divide-x'
                    ].join(' ')}>
                    {STATS.map((s, i) => (
                        <div
                            key={i}
                            role="listitem"
                            className="flex flex-col items-center justify-center px-3 text-center">
                            <div
                                className={[
                                    'text-white font-semibold tracking-tight whitespace-nowrap',
                                    // Fluid font size
                                    'text-[clamp(1.75rem,5vw,2.5rem)] leading-none'
                                ].join(' ')}>
                                {s.value}
                            </div>
                            <p className="text-white/70 mt-2 text-sm sm:text-base">{s.label}</p>
                        </div>
                    ))}
                </Card>
            </div>
        </section>
    )
}
