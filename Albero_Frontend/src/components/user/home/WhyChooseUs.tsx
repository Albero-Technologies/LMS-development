'use client'

import { Badge } from '@/components/ui/badge'
import { Check, X, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { whyChooseUsData } from '@/constants/whychooseus'
import { NavLink } from '../common/NavLink'

// ─── Shared decorations ───────────────────────────────────────────────────────

function DotGrid({ id, color, opacity }: { id: string; color: string; opacity: number }) {
    return (
        <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
            style={{ display: 'block' }}>
            <defs>
                <pattern
                    id={id}
                    x="0"
                    y="0"
                    width="18"
                    height="18"
                    patternUnits="userSpaceOnUse">
                    <circle
                        cx="1.5"
                        cy="1.5"
                        r="1.5"
                        fill={color}
                        fillOpacity={opacity}
                    />
                </pattern>
            </defs>
            <rect
                width="200"
                height="200"
                fill={`url(#${id})`}
            />
        </svg>
    )
}

function Bracket({ color, rotate = 0 }: { color: string; rotate?: number }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ transform: `rotate(${rotate}deg)`, display: 'block' }}>
            <path
                d="M3 21 L3 3 L21 3"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
            />
        </svg>
    )
}

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WhyChooseUs() {
    const { badgeTitle, title, subtitle, col1Name, col2Name, col3Name, mobileTitleText, features, cardTitle, cardSubtitle, ctaLabel } =
        whyChooseUsData

    return (
        <section
            className="relative overflow-hidden py-20 px-5"
            style={{ background: 'transparent', color: 'var(--white)' }}>
            {/* ── Scene orbs ── */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full opacity-10"
                style={{
                    top: -200,
                    left: '20%',
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle,oklch(0.546 0.245 262.881) 0%,transparent 70%)',
                    filter: 'blur(10px)'
                }}
            />
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full"
                style={{
                    bottom: -150,
                    right: '10%',
                    width: 500,
                    height: 500,
                    background: 'radial-gradient(circle,oklch(0.623 0.214 259.815) 0%,transparent 70%)',
                    opacity: 0.07,
                    filter: 'blur(10px)'
                }}
            />
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full"
                style={{
                    top: '40%',
                    left: '-5%',
                    width: 320,
                    height: 320,
                    background: 'radial-gradient(circle,oklch(0.511 0.262 276.966) 0%,transparent 70%)',
                    opacity: 0.08,
                    filter: 'blur(10px)'
                }}
            />

            {/* ── BG dot grids ── */}
            <div
                aria-hidden="true"
                className="absolute top-0 left-0 pointer-events-none">
                <DotGrid
                    id="wcu-dg-tl"
                    color="oklch(0.623 0.214 259.815)"
                    opacity={0.1}
                />
            </div>
            <div
                aria-hidden="true"
                className="absolute bottom-0 right-0 pointer-events-none">
                <DotGrid
                    id="wcu-dg-br"
                    color="var(--amber)"
                    opacity={0.09}
                />
            </div>

            {/* Corner brackets */}
            <div
                aria-hidden="true"
                className="absolute top-7 left-5 pointer-events-none">
                <Bracket color="rgba(99,102,241,0.45)" />
            </div>
            <div
                aria-hidden="true"
                className="absolute top-7 right-5 pointer-events-none">
                <Bracket
                    color="rgba(99,102,241,0.45)"
                    rotate={90}
                />
            </div>
            <div
                aria-hidden="true"
                className="absolute bottom-7 left-5 pointer-events-none">
                <Bracket
                    color="rgba(213,145,0,0.4)"
                    rotate={270}
                />
            </div>
            <div
                aria-hidden="true"
                className="absolute bottom-7 right-5 pointer-events-none">
                <Bracket
                    color="rgba(213,145,0,0.4)"
                    rotate={180}
                />
            </div>

            {/* ── Header ── */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.55 }}
                viewport={{ once: true }}
                className="text-center mb-[52px] relative z-[1]">
                <Badge
                    variant="outline"
                    className="mb-5 text-white text-xl">
                    {badgeTitle}
                </Badge>
                <h2
                    className="tracking-[.04em] leading-none mb-[14px] mt-4"
                    style={{
                        fontFamily: 'var(--font-bebas)',
                        fontSize: 'clamp(36px,5vw,60px)',
                        color: 'rgba(255,255,255,0.95)'
                    }}>
                    {title}
                </h2>
                <p
                    className="text-base leading-[1.75] max-w-[520px] mx-auto"
                    style={{
                        fontFamily: 'var(--font-barlow)',
                        color: 'rgba(255,255,255,0.35)'
                    }}>
                    {subtitle}
                </p>
            </motion.div>

            {/* ── Content ── */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.65, delay: 0.15 }}
                viewport={{ once: true }}
                className="relative z-[1]">
                {/* ══ DESKTOP table ══ */}
                <div
                    className="hidden sm:block rounded-[20px] overflow-hidden max-w-[900px] mx-auto relative isolate"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.28)'
                    }}>
                    {/* top shimmer */}
                    <div
                        className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none z-10"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18) 40%,rgba(255,255,255,0.18) 60%,transparent)' }}
                    />
                    {/* noise grain */}
                    <div
                        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-50 z-[1]"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
                            backgroundSize: '200px 200px'
                        }}
                    />

                    {/* Table header */}
                    <div
                        className="grid grid-cols-3 relative z-[2]"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderBottom: '1px solid rgba(255,255,255,0.07)'
                        }}>
                        {/* Col 1 */}
                        <div
                            className="flex items-center gap-2 pl-6 py-[18px] px-5"
                            style={{
                                fontFamily: 'var(--font-barlow-condensed)',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: '.1em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.3)'
                            }}>
                            {col1Name}
                        </div>
                        {/* Col 2 — Us */}
                        <div
                            className="flex items-center justify-center gap-2 py-[18px] px-5 relative"
                            style={{
                                fontFamily: 'var(--font-barlow-condensed)',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: '.1em',
                                textTransform: 'uppercase',
                                color: 'oklch(0.707 0.165 254.624)',
                                background: 'rgba(99,102,241,0.1)',
                                borderLeft: '1px solid rgba(99,102,241,0.2)',
                                borderRight: '1px solid rgba(99,102,241,0.2)',
                                boxShadow: '0 1px 0 rgba(99,102,241,0.08) inset'
                            }}>
                            <span
                                className="inline-block flex-shrink-0 rounded-full w-1.5 h-1.5"
                                style={{
                                    background: 'oklch(0.623 0.214 259.815)',
                                    boxShadow: '0 0 8px oklch(0.623 0.214 259.815)'
                                }}
                            />
                            {col2Name}
                        </div>
                        {/* Col 3 — Others */}
                        <div
                            className="flex items-center justify-center gap-2 py-[18px] px-5"
                            style={{
                                fontFamily: 'var(--font-barlow-condensed)',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: '.1em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.3)'
                            }}>
                            {col3Name}
                        </div>
                    </div>

                    {/* Table rows */}
                    <div>
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                className="grid grid-cols-3 relative z-[2] last:border-b-0 transition-colors duration-[180ms] hover:bg-[rgba(99,102,241,0.05)]"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                transition={{ duration: 0.4, delay: i * 0.06 }}
                                viewport={{ once: true }}>
                                {/* Feature name */}
                                <div className="flex items-center pl-6 py-4 px-5">
                                    {/* Icon box */}
                                    <div
                                        className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
                                        style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.09)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                                            color: 'rgba(255,255,255,0.3)'
                                        }}>
                                        {feature.icon && <feature.icon size={16} />}
                                    </div>
                                    <span
                                        className="text-sm font-semibold"
                                        style={{ fontFamily: 'var(--font-barlow)', color: 'rgba(255,255,255,0.65)' }}>
                                        {feature.name}
                                    </span>
                                </div>
                                {/* Us */}
                                <div
                                    className="flex items-center justify-center py-4 px-5"
                                    style={{
                                        background: 'rgba(99,102,241,0.05)',
                                        borderLeft: '1px solid rgba(99,102,241,0.15)',
                                        borderRight: '1px solid rgba(99,102,241,0.15)'
                                    }}>
                                    {feature.us ? (
                                        <div
                                            className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                            style={{
                                                background: 'rgba(34,197,94,0.12)',
                                                border: '1px solid rgba(34,197,94,0.28)',
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 0 10px rgba(34,197,94,0.1)'
                                            }}>
                                            <Check
                                                size={14}
                                                color="#4ade80"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                            style={{
                                                background: 'rgba(239,68,68,0.08)',
                                                border: '1px solid rgba(239,68,68,0.18)',
                                                backdropFilter: 'blur(8px)'
                                            }}>
                                            <X
                                                size={14}
                                                color="rgba(239,68,68,0.8)"
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* Others */}
                                <div className="flex items-center justify-center py-4 px-5">
                                    {feature.others ? (
                                        <div
                                            className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                            style={{
                                                background: 'rgba(34,197,94,0.12)',
                                                border: '1px solid rgba(34,197,94,0.28)',
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 0 10px rgba(34,197,94,0.1)'
                                            }}>
                                            <Check
                                                size={14}
                                                color="#4ade80"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                            style={{
                                                background: 'rgba(239,68,68,0.08)',
                                                border: '1px solid rgba(239,68,68,0.18)',
                                                backdropFilter: 'blur(8px)'
                                            }}>
                                            <X
                                                size={14}
                                                color="rgba(239,68,68,0.8)"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ══ MOBILE cards ══ */}
                <div className="block sm:hidden max-w-[520px] mx-auto">
                    {/* comparison label */}
                    <div className="text-center mb-5">
                        <span
                            className="inline-flex items-center gap-2 py-[7px] px-[18px] rounded-full"
                            style={{
                                background: 'rgba(99,102,241,0.12)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset',
                                fontFamily: 'var(--font-barlow-condensed)',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '.1em',
                                textTransform: 'uppercase',
                                color: 'oklch(0.707 0.165 254.624)'
                            }}>
                            <span
                                className="inline-block w-1.5 h-1.5 rounded-full"
                                style={{ background: 'oklch(0.623 0.214 259.815)' }}
                            />
                            {mobileTitleText}
                        </span>
                    </div>

                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            className="rounded-2xl overflow-hidden mb-[10px]"
                            style={{
                                background: 'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018) 50%,rgba(99,102,241,0.04))',
                                backdropFilter: 'blur(20px) saturate(1.4)',
                                WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 16px 40px rgba(0,0,0,0.35)'
                            }}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            transition={{ duration: 0.4, delay: i * 0.07 }}
                            viewport={{ once: true }}>
                            {/* Card head */}
                            <div
                                className="flex items-center gap-3 py-[14px] px-4"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    borderBottom: '1px solid rgba(255,255,255,0.07)'
                                }}>
                                <div
                                    className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                                        color: 'rgba(255,255,255,0.3)'
                                    }}>
                                    {feature.icon && <feature.icon size={16} />}
                                </div>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ fontFamily: 'var(--font-barlow)', color: 'rgba(255,255,255,0.65)' }}>
                                    {feature.name}
                                </span>
                            </div>
                            {/* Us row */}
                            <div
                                className="flex items-center justify-between py-[13px] px-4"
                                style={{
                                    background: 'rgba(99,102,241,0.06)',
                                    borderTop: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-barlow-condensed)',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: '.09em',
                                        textTransform: 'uppercase',
                                        color: 'oklch(0.707 0.165 254.624)'
                                    }}>
                                    {col2Name}
                                </span>
                                {feature.us ? (
                                    <div
                                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'rgba(34,197,94,0.12)',
                                            border: '1px solid rgba(34,197,94,0.28)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 0 10px rgba(34,197,94,0.1)'
                                        }}>
                                        <Check
                                            size={13}
                                            color="#4ade80"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.18)',
                                            backdropFilter: 'blur(8px)'
                                        }}>
                                        <X
                                            size={13}
                                            color="rgba(239,68,68,0.8)"
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Others row */}
                            <div
                                className="flex items-center justify-between py-[13px] px-4"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-barlow-condensed)',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: '.09em',
                                        textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.28)'
                                    }}>
                                    {col3Name}
                                </span>
                                {feature.others ? (
                                    <div
                                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'rgba(34,197,94,0.12)',
                                            border: '1px solid rgba(34,197,94,0.28)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 0 10px rgba(34,197,94,0.1)'
                                        }}>
                                        <Check
                                            size={13}
                                            color="#4ade80"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.18)',
                                            backdropFilter: 'blur(8px)'
                                        }}>
                                        <X
                                            size={13}
                                            color="rgba(239,68,68,0.8)"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ══ CTA card ══ */}
                <motion.div
                    className="max-w-[600px] mx-auto mt-12 text-center relative overflow-hidden rounded-[20px] sm:p-10 p-7 isolate"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(255,255,255,0.03) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        border: '1px solid rgba(99,102,241,0.28)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.14) inset, 0 24px 64px rgba(0,0,0,0.45), 0 0 40px rgba(99,102,241,0.12)'
                    }}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}>
                    {/* top shimmer */}
                    <div
                        className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none z-10"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2) 40%,rgba(255,255,255,0.2) 60%,transparent)' }}
                    />
                    {/* noise grain */}
                    <div
                        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-50 z-[1]"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='nc'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23nc)' opacity='0.04'/%3E%3C/svg%3E\")",
                            backgroundSize: '200px 200px'
                        }}
                    />
                    {/* card glow */}
                    <div
                        aria-hidden="true"
                        className="absolute pointer-events-none rounded-full -translate-x-1/2"
                        style={{
                            top: -60,
                            left: '50%',
                            width: 300,
                            height: 200,
                            background: 'oklch(0.546 0.245 262.881)',
                            filter: 'blur(80px)',
                            opacity: 0.18
                        }}
                    />
                    {/* card dot grid */}
                    <div
                        aria-hidden="true"
                        className="absolute bottom-0 right-0 pointer-events-none opacity-60">
                        <DotGrid
                            id="wcu-cta-dots"
                            color="oklch(0.623 0.214 259.815)"
                            opacity={0.14}
                        />
                    </div>
                    {/* card corner brackets */}
                    <div
                        aria-hidden="true"
                        className="absolute top-[14px] left-[14px] pointer-events-none">
                        <Bracket color="rgba(99,102,241,0.45)" />
                    </div>
                    <div
                        aria-hidden="true"
                        className="absolute bottom-[14px] right-[14px] pointer-events-none">
                        <Bracket
                            color="rgba(213,145,0,0.4)"
                            rotate={180}
                        />
                    </div>

                    <div className="relative z-[2]">
                        <h3
                            className="tracking-[.04em] leading-[1.1] mb-3"
                            style={{
                                fontFamily: 'var(--font-bebas)',
                                fontSize: 'clamp(24px,3.5vw,34px)',
                                color: 'rgba(255,255,255,0.95)'
                            }}>
                            {cardTitle}
                        </h3>
                        <p
                            className="text-[15px] leading-[1.7] max-w-[440px] mx-auto mb-7"
                            style={{
                                fontFamily: 'var(--font-barlow)',
                                color: 'rgba(255,255,255,0.38)'
                            }}>
                            {cardSubtitle}
                        </p>
                        <NavLink href="#contact">
                            <button
                                className="inline-flex items-center gap-[9px] py-[13px] px-7 rounded-[10px] text-[13px] font-bold tracking-[.09em] uppercase text-black whitespace-nowrap no-underline cursor-pointer transition-[background,transform,box-shadow] duration-200 hover:-translate-y-0.5"
                                style={{
                                    fontFamily: 'var(--font-barlow-condensed)',
                                    background: 'rgba(255,255,255,0.92)',
                                    border: '1px solid rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 24px rgba(99,102,241,0.2)'
                                }}>
                                {ctaLabel}
                                <ChevronRight size={15} />
                            </button>
                        </NavLink>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}
