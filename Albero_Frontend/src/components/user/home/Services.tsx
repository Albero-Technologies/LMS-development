'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { servicesData, productsData } from '@/constants/services'
import type { Product, ServiceFeature } from '@/constants/services'
import { IconArrowRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'services' | 'products'

const TABS: { key: Tab; label: string }[] = [
    { key: 'products', label: 'Our Products' },
    { key: 'services', label: 'Our Services' }
]

// ─── Dot-grid SVG graphic ─────────────────────────────────────────────────────

function DotGrid({ color = 'var(--blue-vivid)', opacity = 0.18 }: { color?: string; opacity?: number }) {
    return (
        <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            fill="none"
            className="absolute pointer-events-none">
            <defs>
                <pattern
                    id="dots"
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
                fill="url(#dots)"
            />
        </svg>
    )
}

// ─── Corner-bracket graphic ───────────────────────────────────────────────────

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
                opacity="0.5"
            />
        </svg>
    )
}

// ─── Shared slider controls ───────────────────────────────────────────────────

function SliderControls({
    total,
    active,
    onPrev,
    onNext,
    onDot,
    accentColor = 'var(--blue-vivid)'
}: {
    total: number
    active: number
    onPrev: () => void
    onNext: () => void
    onDot: (i: number) => void
    accentColor?: string
}) {
    return (
        <div className="flex items-center justify-center gap-3.5 mt-9">
            <button
                onClick={onPrev}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-[12px] text-white/35 hover:text-white/85 hover:border-indigo-500/40 hover:bg-indigo-500/[0.12]"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset'
                }}>
                <IconChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onDot(i)}
                        className="h-1.5 rounded-[3px] border-none p-0 cursor-pointer transition-all duration-300"
                        style={{
                            width: active === i ? 28 : 6,
                            background: active === i ? accentColor : 'rgba(255,255,255,0.12)',
                            boxShadow: active === i ? `0 0 8px ${accentColor}` : 'none'
                        }}
                    />
                ))}
            </div>
            <button
                onClick={onNext}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-[12px] text-white/35 hover:text-white/85 hover:border-indigo-500/40 hover:bg-indigo-500/[0.12]"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset'
                }}>
                <IconChevronRight size={16} />
            </button>
        </div>
    )
}

// ─── Services Panel ───────────────────────────────────────────────────────────

function ServicesPanel() {
    const items: ServiceFeature[] = servicesData.features
    const [active, setActive] = useState(0)
    const service = items[active]
    const ServiceIcon = service.icon
    const idxLabel = `${String(active + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`

    return (
        <div className="w-full max-w-[1152px] mx-auto">
            <div className="flex flex-row gap-6 items-stretch flex-wrap max-[860px]:flex-col">
                {/* ── Main card ── */}
                <div
                    className="flex-[1_1_340px] rounded-[20px] px-8 py-9 relative overflow-hidden flex flex-col min-h-[480px] transition-all duration-300 isolate
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.18] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-[20px] after:pointer-events-none after:opacity-[0.55] after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    {/* Ghost number watermark */}
                    <span
                        className="absolute bottom-[-20px] right-4 font-bebas leading-none tracking-[-0.04em] pointer-events-none select-none"
                        style={{ fontSize: 180, color: 'oklch(0.623 0.214 259.815)', opacity: 0.04 }}>
                        {String(active + 1).padStart(2, '0')}
                    </span>

                    {/* Dot grid — top right */}
                    <div className="absolute top-0 right-0 pointer-events-none">
                        <DotGrid
                            color="oklch(0.623 0.214 259.815)"
                            opacity={0.12}
                        />
                    </div>

                    {/* Glow orb */}
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: -80,
                            left: -60,
                            width: 280,
                            height: 280,
                            background: 'oklch(0.623 0.214 259.815)',
                            filter: 'blur(90px)',
                            opacity: 0.12
                        }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-5 right-5 rotate-90">
                        <CornerBracket color="rgba(99,102,241,0.5)" />
                    </div>
                    <div className="absolute bottom-5 left-5 rotate-[270deg]">
                        <CornerBracket color="rgba(99,102,241,0.5)" />
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 z-[2]">
                        {/* Index + Icon row */}
                        <div className="flex items-start justify-between mb-7">
                            <div
                                className="w-14 h-14 rounded-[14px] flex items-center justify-center backdrop-blur-[8px]"
                                style={{
                                    background: 'rgba(99,102,241,0.14)',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset',
                                    color: 'oklch(0.707 0.165 254.624)'
                                }}>
                                <ServiceIcon size={26} />
                            </div>
                            <span
                                className="font-bebas text-[15px] tracking-[0.12em] opacity-70"
                                style={{ color: 'oklch(0.623 0.214 259.815)' }}>
                                {idxLabel}
                            </span>
                        </div>

                        {/* Category chip — glass */}
                        <span
                            className="inline-block mb-4 px-3 py-1 rounded-[20px] font-barlow-condensed text-[11px] font-semibold tracking-[0.1em] uppercase backdrop-blur-[8px]"
                            style={{
                                color: 'oklch(0.707 0.165 254.624)',
                                background: 'rgba(99,102,241,0.12)',
                                border: '1px solid rgba(99,102,241,0.28)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset'
                            }}>
                            Development Service
                        </span>

                        <h3
                            className="font-bebas tracking-[0.02em] text-white/95 mb-3.5 leading-[1.05]"
                            style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}>
                            {service.title}
                        </h3>

                        <p className="font-barlow text-[15px] text-white/[0.38] leading-[1.75] mb-8">{service.description}</p>

                        {/* Decorative divider */}
                        <div className="flex items-center gap-3 mb-7">
                            <div className="h-px flex-1 bg-white/[0.07]" />
                            <span
                                className="w-1.5 h-1.5 rounded-full opacity-50"
                                style={{ background: 'oklch(0.623 0.214 259.815)' }}
                            />
                            <div
                                className="h-px w-8 opacity-30"
                                style={{ background: 'oklch(0.623 0.214 259.815)' }}
                            />
                        </div>

                        {/* Quick-stats row */}
                        <div className="flex gap-6">
                            {[
                                { label: 'Delivery', value: '2–4 Weeks' },
                                { label: 'Support', value: '24 / 7' },
                                { label: 'Revisions', value: 'Unlimited' }
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="font-barlow-condensed text-[10px] text-white/[0.28] uppercase tracking-[0.1em] mb-1">
                                        {s.label}
                                    </div>
                                    <div className="font-bebas text-[20px] text-white/[0.92] tracking-[0.04em]">{s.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="relative mt-9 z-[2]">
                        <button
                            className="inline-flex items-center gap-2 px-6 py-[11px] rounded-[10px] font-barlow-condensed text-[14px] font-bold tracking-[0.06em] uppercase cursor-pointer backdrop-blur-[8px] transition-all duration-200 hover:opacity-[0.88] hover:translate-x-[3px]"
                            style={{
                                background: 'linear-gradient(135deg,rgba(99,102,241,0.22),rgba(99,102,241,0.1))',
                                border: '1px solid rgba(99,102,241,0.38)',
                                color: 'oklch(0.707 0.165 254.624)',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 20px rgba(99,102,241,0.12)'
                            }}>
                            Get Started <IconArrowRight size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div
                    className="flex flex-col gap-[5px] w-[268px] flex-shrink-0 overflow-y-auto max-h-[520px] max-[860px]:w-full max-[860px]:flex-row max-[860px]:flex-wrap max-[860px]:max-h-none max-[860px]:overflow-visible"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                    <div className="font-barlow-condensed text-[11px] font-semibold tracking-[0.14em] uppercase text-white/25 px-1 mb-2.5">
                        All Services
                    </div>
                    {items.map((item, i) => {
                        const SIcon = item.icon
                        const isActive = active === i
                        return (
                            <button
                                key={i}
                                onClick={() => setActive(i)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left cursor-pointer w-full transition-all duration-[180ms] max-[860px]:flex-[0_0_auto] hover:bg-white/[0.07] hover:border-white/[0.12]"
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(99,102,241,0.08))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${isActive ? 'rgba(99,102,241,0.38)' : 'rgba(255,255,255,0.06)'}`,
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    boxShadow: isActive
                                        ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 14px rgba(99,102,241,0.1)'
                                        : '0 1px 0 rgba(255,255,255,0.05) inset'
                                }}>
                                <div
                                    className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center backdrop-blur-[8px] transition-all duration-[180ms]"
                                    style={{
                                        background: isActive ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.06)',
                                        border: `1px solid ${isActive ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                                        color: isActive ? 'oklch(0.707 0.165 254.624)' : 'rgba(255,255,255,0.3)'
                                    }}>
                                    <SIcon size={16} />
                                </div>
                                <span
                                    className="font-barlow text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-[180ms]"
                                    style={{ color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)' }}>
                                    {item.title}
                                </span>
                                {isActive && (
                                    <div
                                        className="ml-auto w-[5px] h-[5px] rounded-full flex-shrink-0"
                                        style={{
                                            background: 'oklch(0.623 0.214 259.815)',
                                            boxShadow: '0 0 6px oklch(0.623 0.214 259.815)'
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <SliderControls
                total={items.length}
                active={active}
                onPrev={() => setActive((i) => (i - 1 + items.length) % items.length)}
                onNext={() => setActive((i) => (i + 1) % items.length)}
                onDot={setActive}
                accentColor="oklch(0.623 0.214 259.815)"
            />
        </div>
    )
}

// ─── Products Panel ───────────────────────────────────────────────────────────

function ProductsPanel() {
    const [active, setActive] = useState(0)
    const product: Product = productsData[active]
    const ProductIcon = product.icon
    const isBlue = product.accent.includes('blue') || product.accent.includes('259')

    return (
        <div className="w-full max-w-[1152px] mx-auto">
            <div className="flex flex-row gap-6 items-stretch flex-wrap max-[860px]:flex-col">
                {/* ── Main card ── */}
                <div
                    className="flex-[1_1_340px] rounded-[20px] px-8 py-9 relative overflow-hidden flex flex-col min-h-[480px] transition-all duration-300 isolate
                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.18] before:to-transparent before:pointer-events-none before:z-10
                        after:content-[''] after:absolute after:inset-0 after:rounded-[20px] after:pointer-events-none after:opacity-[0.55] after:z-[1]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(99,102,241,0.04) 100%)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        border: `1px solid ${isBlue ? 'rgba(99,102,241,0.28)' : 'rgba(213,145,0,0.25)'}`,
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                    {/* Ghost product name watermark */}
                    <span
                        className="absolute bottom-[-14px] right-3 font-bebas leading-none tracking-[-0.04em] pointer-events-none select-none max-w-[90%] overflow-hidden"
                        style={{
                            fontSize: 120,
                            color: isBlue ? 'oklch(0.623 0.214 259.815)' : 'var(--amber)',
                            opacity: 0.04
                        }}>
                        {product.name.split(' ')[0]}
                    </span>

                    {/* Dot grid — bottom right */}
                    <div className="absolute bottom-0 right-0 pointer-events-none">
                        <DotGrid
                            color={isBlue ? 'oklch(0.623 0.214 259.815)' : 'var(--amber)'}
                            opacity={0.14}
                        />
                    </div>

                    {/* Glow orb */}
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            top: -80,
                            right: -60,
                            width: 300,
                            height: 300,
                            background: isBlue ? 'oklch(0.623 0.214 259.815)' : 'var(--amber)',
                            filter: 'blur(100px)',
                            opacity: 0.14
                        }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-5 left-5">
                        <CornerBracket color={isBlue ? 'rgba(99,102,241,0.5)' : 'rgba(213,145,0,0.45)'} />
                    </div>
                    <div className="absolute bottom-5 right-5 rotate-180">
                        <CornerBracket color={isBlue ? 'rgba(99,102,241,0.5)' : 'rgba(213,145,0,0.45)'} />
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 z-[2]">
                        {/* Badge + Icon row */}
                        <div className="flex items-start justify-between mb-6">
                            <div
                                className="w-14 h-14 rounded-[14px] flex items-center justify-center backdrop-blur-[8px]"
                                style={{
                                    background: isBlue ? 'rgba(99,102,241,0.14)' : 'rgba(213,145,0,0.14)',
                                    border: `1px solid ${isBlue ? 'rgba(99,102,241,0.32)' : 'rgba(213,145,0,0.3)'}`,
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset',
                                    color: isBlue ? 'oklch(0.707 0.165 254.624)' : 'var(--amber)'
                                }}>
                                <ProductIcon size={26} />
                            </div>
                            <span
                                className="px-3 py-1 rounded-[20px] font-barlow-condensed text-[11px] font-bold tracking-[0.1em] uppercase backdrop-blur-[8px]"
                                style={{
                                    color: isBlue ? 'oklch(0.707 0.165 254.624)' : 'var(--amber)',
                                    background: isBlue ? 'rgba(99,102,241,0.14)' : 'rgba(213,145,0,0.14)',
                                    border: `1px solid ${isBlue ? 'rgba(99,102,241,0.3)' : 'rgba(213,145,0,0.28)'}`,
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                                }}>
                                {product.badge}
                            </span>
                        </div>

                        <h3
                            className="font-bebas tracking-[0.02em] text-white/95 mb-1 leading-[1.05]"
                            style={{ fontSize: 'clamp(30px, 3.8vw, 44px)' }}>
                            {product.name}
                        </h3>
                        <p
                            className="font-barlow-condensed text-[12px] font-semibold tracking-[0.1em] uppercase mb-4"
                            style={{ color: isBlue ? 'oklch(0.707 0.165 254.624)' : 'var(--amber)' }}>
                            {product.tagline}
                        </p>
                        <p className="font-barlow text-[15px] text-white/[0.38] leading-[1.75] mb-[22px]">{product.description}</p>

                        {/* Feature chips — glass */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {product.features.map((f, i) => (
                                <span
                                    key={i}
                                    className="px-[11px] py-1 rounded-[20px] font-barlow text-[12px] text-white/45 backdrop-blur-[8px]"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset'
                                    }}>
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Stats + CTA */}
                    <div className="relative mt-7 z-[2]">
                        <div
                            className="flex gap-7 py-4 mb-5"
                            style={{
                                borderTop: '1px solid rgba(255,255,255,0.07)',
                                borderBottom: '1px solid rgba(255,255,255,0.07)'
                            }}>
                            {product.stats.map((s, i) => (
                                <div key={i}>
                                    <div className="font-barlow-condensed text-[10px] text-white/[0.28] uppercase tracking-[0.1em] mb-1">
                                        {s.label}
                                    </div>
                                    <div className="font-bebas text-[22px] text-white/[0.92] tracking-[0.04em]">{s.value}</div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="inline-flex items-center gap-2 px-6 py-[11px] rounded-[10px] font-barlow-condensed text-[14px] font-bold tracking-[0.06em] uppercase cursor-pointer backdrop-blur-[8px] transition-all duration-200 hover:opacity-[0.88] hover:translate-x-[3px]"
                            style={
                                isBlue
                                    ? {
                                          background: 'linear-gradient(135deg,rgba(99,102,241,0.22),rgba(99,102,241,0.1))',
                                          border: '1px solid rgba(99,102,241,0.38)',
                                          color: 'oklch(0.707 0.165 254.624)',
                                          boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 20px rgba(99,102,241,0.12)'
                                      }
                                    : {
                                          background: 'linear-gradient(135deg,rgba(213,145,0,0.22),rgba(213,145,0,0.1))',
                                          border: '1px solid rgba(213,145,0,0.35)',
                                          color: 'var(--amber)',
                                          boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset'
                                      }
                            }>
                            Learn More <IconArrowRight size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div
                    className="flex flex-col gap-[5px] w-[268px] flex-shrink-0 overflow-y-auto max-h-[520px] max-[860px]:w-full max-[860px]:flex-row max-[860px]:flex-wrap max-[860px]:max-h-none max-[860px]:overflow-visible"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                    <div className="font-barlow-condensed text-[11px] font-semibold tracking-[0.14em] uppercase text-white/25 px-1 mb-2.5">
                        All Products
                    </div>
                    {productsData.map((p, i) => {
                        const TabIcon = p.icon
                        const isActive = active === i
                        const isBlueProd = p.accent.includes('blue') || p.accent.includes('259')
                        return (
                            <button
                                key={p.id}
                                onClick={() => setActive(i)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left cursor-pointer w-full transition-all duration-[180ms] max-[860px]:flex-[0_0_auto] hover:bg-white/[0.07] hover:border-white/[0.12]"
                                style={{
                                    background: isActive
                                        ? isBlueProd
                                            ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(99,102,241,0.08))'
                                            : 'linear-gradient(135deg,rgba(213,145,0,0.18),rgba(213,145,0,0.07))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${
                                        isActive ? (isBlueProd ? 'rgba(99,102,241,0.38)' : 'rgba(213,145,0,0.35)') : 'rgba(255,255,255,0.06)'
                                    }`,
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    boxShadow: isActive
                                        ? isBlueProd
                                            ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 0 14px rgba(99,102,241,0.1)'
                                            : '0 1px 0 rgba(255,255,255,0.08) inset'
                                        : '0 1px 0 rgba(255,255,255,0.05) inset'
                                }}>
                                <div
                                    className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center backdrop-blur-[8px] transition-all duration-[180ms]"
                                    style={{
                                        background: isActive
                                            ? isBlueProd
                                                ? 'rgba(99,102,241,0.18)'
                                                : 'rgba(213,145,0,0.18)'
                                            : 'rgba(255,255,255,0.06)',
                                        border: `1px solid ${
                                            isActive ? (isBlueProd ? 'rgba(99,102,241,0.35)' : 'rgba(213,145,0,0.32)') : 'rgba(255,255,255,0.08)'
                                        }`,
                                        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                                        color: isActive ? (isBlueProd ? 'oklch(0.707 0.165 254.624)' : 'var(--amber)') : 'rgba(255,255,255,0.3)'
                                    }}>
                                    <TabIcon size={16} />
                                </div>
                                <div className="overflow-hidden">
                                    <div
                                        className="font-barlow text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis mb-[1px] transition-colors duration-[180ms]"
                                        style={{ color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)' }}>
                                        {p.name}
                                    </div>
                                    <div className="font-barlow text-[11px] text-white/25 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {p.tagline}
                                    </div>
                                </div>
                                {isActive && (
                                    <div
                                        className="ml-auto w-[5px] h-[5px] rounded-full flex-shrink-0"
                                        style={{
                                            background: isBlueProd ? 'oklch(0.623 0.214 259.815)' : 'var(--amber)',
                                            boxShadow: `0 0 6px ${isBlueProd ? 'oklch(0.623 0.214 259.815)' : 'var(--amber)'}`
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <SliderControls
                total={productsData.length}
                active={active}
                onPrev={() => setActive((i) => (i - 1 + productsData.length) % productsData.length)}
                onNext={() => setActive((i) => (i + 1) % productsData.length)}
                onDot={setActive}
                accentColor={isBlue ? 'oklch(0.623 0.214 259.815)' : 'var(--amber)'}
            />
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Services() {
    const [activeTab, setActiveTab] = useState<Tab>('products')
    const [fading, setFading] = useState(false)

    const switchTo = (tab: Tab) => {
        if (tab === activeTab) return
        setFading(true)
        setTimeout(() => {
            setActiveTab(tab)
            setFading(false)
        }, 240)
    }

    return (
        <section
            id="services"
            className="relative overflow-hidden bg-transparent text-[var(--white)] py-20 px-5">
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
                    top: '45%',
                    left: '-5%',
                    width: 300,
                    height: 300,
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
                    {servicesData.badgeTitle}
                </Badge>
                <h2
                    className="font-bebas tracking-[0.04em] text-white/95 mb-3.5 mt-4 leading-none"
                    style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
                    {servicesData.heading}
                </h2>
                <p className="font-barlow text-[16px] text-white/35 max-w-[540px] mx-auto leading-[1.75]">{servicesData.description}</p>
            </div>

            {/* ── Tab switcher ── */}
            <div className="flex justify-center mb-12 relative z-[1]">
                <div
                    className="flex gap-1 p-1 rounded-[14px] border border-white/[0.08] backdrop-blur-[16px]"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset'
                    }}>
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => switchTo(key)}
                            onMouseEnter={() => switchTo(key)}
                            className="relative overflow-hidden px-[26px] py-2.5 rounded-[10px] border font-barlow-condensed text-[14px] font-bold tracking-[0.06em] uppercase cursor-pointer whitespace-nowrap transition-all duration-200"
                            style={{
                                background: activeTab === key ? 'linear-gradient(135deg,rgba(99,102,241,0.22),rgba(99,102,241,0.1))' : 'transparent',
                                borderColor: activeTab === key ? 'rgba(99,102,241,0.4)' : 'transparent',
                                color: activeTab === key ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                                boxShadow: activeTab === key ? '0 1px 0 rgba(255,255,255,0.1) inset' : 'none'
                            }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div
                className="relative z-[1] transition-all duration-[240ms] ease-[ease]"
                style={{
                    opacity: fading ? 0 : 1,
                    transform: fading ? 'translateY(8px)' : 'translateY(0)'
                }}>
                {activeTab === 'services' && <ServicesPanel />}
                {activeTab === 'products' && <ProductsPanel />}
            </div>

            {/* ── Tab-level nav dots ── */}
            <SliderControls
                total={TABS.length}
                active={TABS.findIndex((t) => t.key === activeTab)}
                onPrev={() => switchTo('products')}
                onNext={() => switchTo('services')}
                onDot={(i) => switchTo(TABS[i].key)}
                accentColor="oklch(0.623 0.214 259.815)"
            />
        </section>
    )
}
