import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import type { ComponentType } from 'react'

export type ResourceAccent = 'brand' | 'accent' | 'neutral' | 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'orange'

export interface ResourceCardData {
    badge?: string
    title: string
    description: string
    tags?: string[]
    meta?: string
    accent?: ResourceAccent
    href?: string
    icon?: ComponentType<{ size?: number; className?: string }>
}

const accentMap: Record<ResourceAccent, { c: string; soft: string; border: string }> = {
    brand: { c: 'var(--brand)', soft: 'var(--brand-soft)', border: 'var(--line-strong)' },
    accent: { c: 'var(--accent)', soft: 'var(--accent-soft)', border: 'var(--line-strong)' },
    neutral: { c: 'var(--text-primary)', soft: 'var(--surface-2)', border: 'var(--line-strong)' },
    // legacy palette names — themed via brand/accent so they look cohesive in both modes
    blue: { c: 'var(--brand)', soft: 'var(--brand-soft)', border: 'var(--line-strong)' },
    emerald: { c: 'var(--brand)', soft: 'var(--brand-soft)', border: 'var(--line-strong)' },
    amber: { c: 'var(--accent)', soft: 'var(--accent-soft)', border: 'var(--line-strong)' },
    orange: { c: 'var(--accent)', soft: 'var(--accent-soft)', border: 'var(--line-strong)' },
    purple: { c: 'var(--accent)', soft: 'var(--accent-soft)', border: 'var(--line-strong)' },
    rose: { c: 'var(--accent)', soft: 'var(--accent-soft)', border: 'var(--line-strong)' }
}

export default function ResourceCard({
    badge,
    title,
    description,
    tags,
    meta,
    accent = 'brand',
    href,
    icon: Icon,
    index = 0
}: ResourceCardData & { index?: number }) {
    const a = accentMap[accent] ?? accentMap.brand
    const isExternal = href ? href.startsWith('http') : false

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3) }}>
            <a
                href={href || '#'}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                    if (!href) e.preventDefault()
                }}
                className="group relative block h-full rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    boxShadow: 'var(--card-shadow)'
                }}>
                {/* Soft hover wash */}
                <div
                    aria-hidden="true"
                    className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: a.soft, filter: 'blur(50px)' }}
                />

                <div className="relative z-[1]">
                    <div className="flex items-start justify-between mb-5">
                        {Icon ? (
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center"
                                style={{ background: a.soft, color: a.c }}>
                                <Icon size={20} />
                            </div>
                        ) : (
                            <div />
                        )}
                        {badge && (
                            <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase"
                                style={{ background: a.soft, color: a.c }}>
                                {badge}
                            </span>
                        )}
                    </div>

                    <h3
                        className="font-display text-[20px] leading-snug font-semibold mb-2.5 transition-colors"
                        style={{ color: 'var(--text-primary)' }}>
                        {title}
                    </h3>
                    <p
                        className="text-[14px] leading-relaxed mb-5 line-clamp-3"
                        style={{ color: 'var(--text-secondary)' }}>
                        {description}
                    </p>

                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {tags.map((t, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-0.5 rounded-full text-[11px]"
                                    style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)', border: '1px solid var(--line)' }}>
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}

                    <div
                        className="flex items-center justify-between pt-4 border-t"
                        style={{ borderColor: 'var(--line)' }}>
                        <span
                            className="text-[11px] tracking-[0.16em] uppercase font-semibold"
                            style={{ color: 'var(--text-tertiary)' }}>
                            {meta || 'Read more'}
                        </span>
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45"
                            style={{ background: a.soft, color: a.c }}>
                            <ArrowUpRight size={14} />
                        </div>
                    </div>
                </div>
            </a>
        </motion.div>
    )
}
