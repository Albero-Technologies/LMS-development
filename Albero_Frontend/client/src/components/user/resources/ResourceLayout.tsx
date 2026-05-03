import { motion } from 'motion/react'
import type { ReactNode, ComponentType, CSSProperties } from 'react'

interface ResourceLayoutProps {
    eyebrow: string
    title: string
    highlight?: string
    description: string
    icon: ComponentType<{ size?: number; className?: string; style?: CSSProperties }>
    stats?: { value: string; label: string }[]
    children: ReactNode
}

export default function ResourceLayout({
    eyebrow,
    title,
    highlight,
    description,
    icon: Icon,
    stats,
    children
}: ResourceLayoutProps) {
    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>
            {/* ── Hero ── */}
            <section className="relative pt-[140px] pb-14 px-5 md:px-8">
                {/* Soft brand wash */}
                <div
                    aria-hidden="true"
                    className="absolute pointer-events-none rounded-full"
                    style={{
                        top: -180,
                        left: '12%',
                        width: 540,
                        height: 540,
                        background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)',
                        filter: 'blur(40px)'
                    }}
                />
                <div
                    aria-hidden="true"
                    className="absolute pointer-events-none rounded-full"
                    style={{
                        top: 80,
                        right: '4%',
                        width: 380,
                        height: 380,
                        background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
                        filter: 'blur(40px)'
                    }}
                />

                {/* Editorial dot grid */}
                <div
                    className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                        opacity: 0.5,
                        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)'
                    }}
                />

                <div className="max-w-[1180px] mx-auto relative z-[1]">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center">
                        {/* Eyebrow chip */}
                        <div
                            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full mb-7 text-[12px] font-semibold tracking-tight"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-secondary)' }}>
                            <Icon size={13} style={{ color: 'var(--brand)' }} />
                            {eyebrow}
                        </div>

                        <h1
                            className="font-display text-[40px] md:text-[64px] lg:text-[80px] leading-[0.96] tracking-[-0.02em] mb-5"
                            style={{ color: 'var(--text-primary)' }}>
                            <span className="font-medium">{title}</span>
                            {highlight && (
                                <>
                                    <br />
                                    <span className="italic font-light" style={{ color: 'var(--brand)' }}>
                                        {highlight}
                                    </span>
                                </>
                            )}
                        </h1>

                        <p
                            className="text-[16px] md:text-[18px] max-w-[640px] mx-auto leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}>
                            {description}
                        </p>

                        {/* Stats */}
                        {stats && stats.length > 0 && (
                            <div
                                className="flex flex-wrap justify-center gap-x-12 gap-y-6 mt-10 pt-8 border-t max-w-2xl mx-auto"
                                style={{ borderColor: 'var(--line)' }}>
                                {stats.map((s, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                                        className="text-center">
                                        <div
                                            className="font-display text-[28px] md:text-[34px] leading-none font-semibold"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {s.value}
                                        </div>
                                        <div
                                            className="text-[11px] mt-2 tracking-[0.18em] uppercase font-semibold"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            {s.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* ── Body ── */}
            <section className="relative px-5 md:px-8 pb-24">
                <div className="max-w-[1180px] mx-auto relative z-[1]">{children}</div>
            </section>
        </div>
    )
}
