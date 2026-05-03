'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { processData } from '@/constants/process'
import { IconArrowRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

// ─── Graphic helpers ──────────────────────────────────────────────────────────

function DotGrid({ color = 'var(--blue-vivid)', opacity = 0.16 }: { color?: string; opacity?: number }) {
    return (
        <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            fill="none"
            className="absolute pointer-events-none">
            <defs>
                <pattern
                    id="proc-dots"
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
                width="180"
                height="180"
                fill="url(#proc-dots)"
            />
        </svg>
    )
}

function CornerBracket({ color = 'var(--blue-vivid)', size = 28 }: { color?: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 28 28"
            fill="none"
            className="pointer-events-none flex-shrink-0">
            <path
                d="M4 24 L4 4 L24 4"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.45"
            />
        </svg>
    )
}

// ─── Step image map ───────────────────────────────────────────────────────────

type StepId = '1' | '2' | '3' | '4' | '5'

const stepImages: Record<StepId, string[]> = {
    '1': [processData.images.step1img1, processData.images.step1img2],
    '2': [processData.images.step2img1, processData.images.step2img2],
    '3': [processData.images.step3img],
    '4': [processData.images.step4img],
    '5': [processData.images.step5img]
}

const stepAccent: Record<StepId, { accent: string; accentBg: string; isBlue: boolean }> = {
    '1': { accent: 'var(--blue-vivid)', accentBg: 'oklch(0.623 0.214 259.815 / 0.10)', isBlue: true },
    '2': { accent: 'var(--amber)', accentBg: 'oklch(0.795 0.184 86.047 / 0.10)', isBlue: false },
    '3': { accent: 'var(--blue-vivid)', accentBg: 'oklch(0.623 0.214 259.815 / 0.10)', isBlue: true },
    '4': { accent: 'var(--amber)', accentBg: 'oklch(0.795 0.184 86.047 / 0.10)', isBlue: false },
    '5': { accent: 'var(--blue-vivid)', accentBg: 'oklch(0.623 0.214 259.815 / 0.10)', isBlue: true }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Process() {
    const { steps, badgeTitle, heading, description } = processData
    const [active, setActive] = useState(0)

    const step = steps[active]
    const id = step.id as StepId
    const imgs = stepImages[id]
    const col = stepAccent[id]
    const total = steps.length

    const prev = () => setActive((i) => (i - 1 + total) % total)
    const next = () => setActive((i) => (i + 1) % total)

    return (
        <section className="relative overflow-hidden bg-transparent text-[var(--white)] py-20 px-5">
            {/* ── Scene orbs ── */}
            <div
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{
                    top: -200,
                    left: '20%',
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle,oklch(0.546 0.245 262.881) 0%,transparent 70%)',
                    opacity: 0.1,
                    filter: 'blur(10px)'
                }}
            />
            <div
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{
                    bottom: -120,
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
                className="absolute rounded-full pointer-events-none"
                style={{
                    top: '50%',
                    left: '-5%',
                    width: 320,
                    height: 320,
                    background: 'radial-gradient(circle,oklch(0.511 0.262 276.966) 0%,transparent 70%)',
                    opacity: 0.08,
                    filter: 'blur(10px)'
                }}
            />

            {/* ── Header ── */}
            <div className="text-center mb-[52px] relative z-[1]">
                <Badge
                    variant="outline"
                    className="mb-5 text-white text-xl">
                    {badgeTitle}
                </Badge>
                <h2
                    className="font-bebas tracking-[0.04em] text-white/95 mb-3.5 mt-4 leading-none"
                    style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
                    {heading}
                </h2>
                <p className="font-barlow text-[16px] text-white/35 max-w-[540px] mx-auto leading-[1.75]">{description}</p>
            </div>

            {/* ── Main row ── */}
            <div className="flex flex-row gap-6 items-stretch flex-wrap max-w-[1152px] mx-auto relative z-[1] max-[860px]:flex-col">
                {/* ── Main card (glass) ── */}
                <div
                    className="flex-[1_1_340px] rounded-[20px] px-8 py-9 relative overflow-hidden flex flex-col min-h-[520px] transition-all duration-300 isolate
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.18] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-[20px] after:pointer-events-none after:opacity-[0.55] after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        border: `1px solid ${col.isBlue ? 'rgba(99,102,241,0.28)' : 'rgba(213,145,0,0.25)'}`,
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    {/* Ghost step number watermark */}
                    <span
                        className="absolute bottom-[-10px] right-5 font-bebas leading-none tracking-[-0.04em] pointer-events-none select-none"
                        style={{ fontSize: 200, color: col.accent, opacity: 0.04 }}>
                        {String(active + 1).padStart(2, '0')}
                    </span>

                    {/* Dot grid — top right */}
                    <div className="absolute top-0 right-0 pointer-events-none">
                        <DotGrid
                            color={col.accent}
                            opacity={0.12}
                        />
                    </div>

                    {/* Glow orb */}
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: -80,
                            left: -60,
                            width: 300,
                            height: 300,
                            background: col.accent,
                            filter: 'blur(100px)',
                            opacity: 0.12
                        }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-5 left-5">
                        <CornerBracket color={col.isBlue ? 'rgba(99,102,241,0.5)' : 'rgba(213,145,0,0.45)'} />
                    </div>
                    <div className="absolute bottom-5 right-5 rotate-180">
                        <CornerBracket color={col.isBlue ? 'rgba(99,102,241,0.5)' : 'rgba(213,145,0,0.45)'} />
                    </div>

                    {/* ── Content ── */}
                    <div className="relative flex-1 flex flex-col z-[2]">
                        {/* Top meta row */}
                        <div className="flex items-center justify-between mb-6">
                            {/* Step pill — glass */}
                            <span
                                className="px-[13px] py-1 rounded-[20px] font-barlow-condensed text-[11px] font-bold tracking-[0.1em] uppercase backdrop-blur-[8px]"
                                style={{
                                    color: col.accent,
                                    background: col.isBlue ? 'rgba(99,102,241,0.14)' : 'rgba(213,145,0,0.14)',
                                    border: `1px solid ${col.isBlue ? 'rgba(99,102,241,0.32)' : 'rgba(213,145,0,0.3)'}`,
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                                }}>
                                {step.name}
                            </span>
                            {/* Index */}
                            <span
                                className="font-bebas text-[15px] tracking-[0.12em] opacity-60"
                                style={{ color: col.accent }}>
                                {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Title */}
                        <h3
                            className="font-bebas tracking-[0.02em] text-white/95 leading-[1.05] mb-3.5"
                            style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>
                            {step.title}
                        </h3>

                        {/* Description */}
                        <p className="font-barlow text-[15px] text-white/[0.38] leading-[1.75] mb-7">{step.description}</p>

                        {/* ── Image(s) ── */}
                        <div
                            className="relative w-full h-[220px] rounded-[14px] overflow-hidden mb-7"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset, 0 12px 32px rgba(0,0,0,0.4)'
                            }}>
                            <img
                                src={imgs[0]}
                                alt={processData.images.alt}
                                className="w-full h-full object-cover block"
                            />
                            {/* Overlay gradient */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: `linear-gradient(to top, ${col.isBlue ? 'rgba(99,102,241,0.25)' : 'rgba(180,120,0,0.2)'} 0%, transparent 60%)`
                                }}
                            />
                            {/* Accent border glow on image */}
                            <div
                                className="absolute inset-0 rounded-[14px] pointer-events-none"
                                style={{
                                    boxShadow: `inset 0 0 0 1px ${col.isBlue ? 'rgba(99,102,241,0.28)' : 'rgba(213,145,0,0.25)'}`
                                }}
                            />
                            {imgs[1] && (
                                <div
                                    className="absolute bottom-[-10px] right-[-10px] w-[52%] rounded-[10px] overflow-hidden backdrop-blur-[4px]"
                                    style={{
                                        aspectRatio: '4/3',
                                        border: '2px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset'
                                    }}>
                                    <img
                                        src={imgs[1]}
                                        alt={processData.images.alt}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-white/[0.07]" />
                            <span
                                className="w-1.5 h-1.5 rounded-full opacity-50"
                                style={{ background: col.accent }}
                            />
                            <div
                                className="h-px w-8 opacity-30"
                                style={{ background: col.accent }}
                            />
                        </div>

                        {/* Inline stats */}
                        <div className="flex gap-7 mb-7">
                            {[
                                { label: 'Phase', value: step.name },
                                {
                                    label: 'Duration',
                                    value:
                                        active === 0
                                            ? '1–2 Days'
                                            : active === 1
                                              ? '3–5 Days'
                                              : active === 2
                                                ? '1–3 Weeks'
                                                : active === 3
                                                  ? '3–5 Days'
                                                  : 'Ongoing'
                                },
                                { label: 'Milestone', value: active === 4 ? 'Go-Live' : 'Approval' }
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="font-barlow-condensed text-[10px] text-white/[0.28] uppercase tracking-[0.1em] mb-1">
                                        {s.label}
                                    </div>
                                    <div className="font-bebas text-[18px] text-white/[0.92] tracking-[0.04em]">{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            className="self-start inline-flex items-center gap-2 px-6 py-[11px] rounded-[10px] font-barlow-condensed text-[14px] font-bold tracking-[0.06em] uppercase cursor-pointer backdrop-blur-[8px] transition-all duration-200 hover:opacity-[0.88] hover:translate-x-[3px]"
                            style={
                                col.isBlue
                                    ? {
                                          background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(99,102,241,0.1))',
                                          border: '1px solid rgba(99,102,241,0.38)',
                                          color: 'oklch(0.707 0.165 254.624)',
                                          boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 20px rgba(99,102,241,0.12)'
                                      }
                                    : {
                                          background: 'linear-gradient(135deg, rgba(213,145,0,0.22), rgba(213,145,0,0.1))',
                                          border: '1px solid rgba(213,145,0,0.35)',
                                          color: 'var(--amber)',
                                          boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                                      }
                            }>
                            {active === total - 1 ? 'Start Your Project' : 'Next Step'}
                            <IconArrowRight size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="flex flex-col gap-1.5 w-[268px] flex-shrink-0 max-[860px]:w-full max-[860px]:flex-row max-[860px]:flex-wrap">
                    <div className="font-barlow-condensed text-[11px] font-semibold tracking-[0.14em] uppercase text-white/25 px-1 mb-2">
                        All Steps
                    </div>

                    {steps.map((s, i) => {
                        const isActive = active === i
                        const c = stepAccent[s.id as StepId]
                        return (
                            <button
                                key={s.id}
                                onClick={() => setActive(i)}
                                onMouseEnter={() => setActive(i)}
                                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-left cursor-pointer w-full transition-all duration-[180ms] max-[860px]:flex-[0_0_auto]"
                                style={{
                                    background: isActive
                                        ? c.isBlue
                                            ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(99,102,241,0.08))'
                                            : 'linear-gradient(135deg,rgba(213,145,0,0.18),rgba(213,145,0,0.07))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${
                                        isActive ? (c.isBlue ? 'rgba(99,102,241,0.38)' : 'rgba(213,145,0,0.35)') : 'rgba(255,255,255,0.06)'
                                    }`,
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    boxShadow: isActive
                                        ? c.isBlue
                                            ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 16px rgba(99,102,241,0.1)'
                                            : '0 1px 0 rgba(255,255,255,0.08) inset'
                                        : '0 1px 0 rgba(255,255,255,0.05) inset'
                                }}>
                                {/* Icon */}
                                <div
                                    className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center font-bebas text-[15px] tracking-[0.06em] transition-all duration-[180ms] backdrop-blur-[8px]"
                                    style={{
                                        background: isActive
                                            ? c.isBlue
                                                ? 'rgba(99,102,241,0.18)'
                                                : 'rgba(213,145,0,0.18)'
                                            : 'rgba(255,255,255,0.06)',
                                        border: `1px solid ${
                                            isActive ? (c.isBlue ? 'rgba(99,102,241,0.35)' : 'rgba(213,145,0,0.32)') : 'rgba(255,255,255,0.08)'
                                        }`,
                                        color: isActive ? (c.isBlue ? 'oklch(0.707 0.165 254.624)' : 'var(--amber)') : 'rgba(255,255,255,0.3)',
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset'
                                    }}>
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div
                                        className="font-barlow text-[13px] font-bold mb-0.5 transition-colors duration-[180ms]"
                                        style={{ color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)' }}>
                                        {s.name}
                                    </div>
                                    <div className="font-barlow text-[11px] text-white/25 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {s.title}
                                    </div>
                                </div>
                                {isActive && (
                                    <div
                                        className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                                        style={{
                                            background: c.accent,
                                            boxShadow: `0 0 6px ${c.accent}`
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}

                    {/* Progress bar */}
                    <div className="mt-4 px-1">
                        <div className="flex justify-between items-center font-barlow-condensed text-[10px] text-white/25 uppercase tracking-[0.1em] mb-2">
                            <span>Progress</span>
                            <span style={{ color: col.accent }}>{Math.round(((active + 1) / total) * 100)}%</span>
                        </div>
                        {/* Track — glass */}
                        <div
                            className="h-1 rounded bg-white/[0.07] overflow-hidden"
                            style={{
                                border: '1px solid rgba(255,255,255,0.06)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
                            }}>
                            <div
                                className="h-full rounded transition-[width] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                                style={{
                                    width: `${((active + 1) / total) * 100}%`,
                                    background: col.isBlue
                                        ? 'linear-gradient(90deg, oklch(0.546 0.245 262.881), oklch(0.707 0.165 254.624))'
                                        : 'linear-gradient(90deg, var(--amber), var(--amber-lt))',
                                    boxShadow: col.isBlue ? '0 0 8px rgba(99,102,241,0.5)' : '0 0 8px rgba(213,145,0,0.4)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Slider controls ── */}
            <div className="flex items-center justify-center gap-3.5 mt-9 relative z-[1]">
                <button
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-[12px] text-white/35 hover:text-white/85 hover:border-indigo-500/40 hover:bg-indigo-500/[0.12]"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                    }}
                    onClick={prev}>
                    <IconChevronLeft size={16} />
                </button>
                <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className="h-1.5 rounded-[3px] border-none p-0 cursor-pointer transition-all duration-300"
                            style={{
                                width: active === i ? 28 : 6,
                                background: active === i ? col.accent : 'rgba(255,255,255,0.12)',
                                boxShadow: active === i ? `0 0 8px ${col.accent}` : 'none'
                            }}
                        />
                    ))}
                </div>
                <button
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-[12px] text-white/35 hover:text-white/85 hover:border-indigo-500/40 hover:bg-indigo-500/[0.12]"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                    }}
                    onClick={next}>
                    <IconChevronRight size={16} />
                </button>
            </div>
        </section>
    )
}
