'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { pricingData } from '@/constants/pricing'
import type { PricingService, ProductTier } from '@/constants/pricing'
import { Check, ChevronRight } from 'lucide-react'
import { NavLink } from '../common/NavLink'

/*
  FONT SETUP — add to your globals.css or layout:

  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

  CSS variables:
    --font-display:   'Syne', sans-serif;        ← replaces Bebas Neue (bold headings)
    --font-body:      'DM Sans', sans-serif;     ← replaces Barlow (body / UI text)
    --font-mono:      'Space Mono', monospace;   ← replaces Barlow Condensed (labels / caps)
*/

// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab = 'products' | 'services'
type Category = 'All' | 'Development' | 'Design' | 'Marketing' | 'Infrastructure' | 'Support'

const CATEGORIES: Category[] = ['All', 'Development', 'Design', 'Marketing', 'Infrastructure', 'Support']

const CAT_STYLE: Record<string, { accent: string; accentBg: string; border: string }> = {
    Development: { accent: 'var(--blue-vivid)', accentBg: 'oklch(from var(--blue-vivid) l c h / 0.10)', border: 'var(--border-blu)' },
    Design: { accent: 'var(--amber)', accentBg: 'oklch(from var(--amber) l c h / 0.10)', border: 'oklch(from var(--amber) l c h / 0.28)' },
    Marketing: { accent: 'var(--amber-lt)', accentBg: 'oklch(from var(--amber) l c h / 0.08)', border: 'oklch(from var(--amber) l c h / 0.22)' },
    Infrastructure: { accent: 'var(--blue-soft)', accentBg: 'oklch(from var(--blue-vivid) l c h / 0.08)', border: 'var(--border-blu)' },
    Support: { accent: 'var(--grey-light)', accentBg: 'oklch(0.87 0 0 / 0.06)', border: 'oklch(0.87 0 0 / 0.15)' }
}

// ─── Shared font style helpers ────────────────────────────────────────────────

const fontDisplay = { fontFamily: 'var(--font-display, "Syne", sans-serif)' }
const fontBody = { fontFamily: 'var(--font-body, "DM Sans", sans-serif)' }
const fontMono = { fontFamily: 'var(--font-mono, "Space Mono", monospace)' }

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
    const { productSubscriptions } = pricingData
    const [activeId, setActiveId] = useState(productSubscriptions[0].id)
    const product = productSubscriptions.find((p) => p.id === activeId)!

    return (
        <div className="max-w-[1152px] mx-auto">
            {/* Layout: stacks vertically on mobile, side-by-side on md+ */}
            <div className="flex flex-col gap-5 md:flex-row md:gap-5">
                {/* ── Sidebar ── */}
                <div className="flex flex-col gap-1.5 w-full md:w-[220px] md:flex-shrink-0">
                    <div
                        className="text-[10px] font-bold tracking-[.14em] uppercase text-white/35 mb-1.5 px-1"
                        style={fontMono}>
                        Our Products
                    </div>

                    {/* Mobile: horizontal scroll row; desktop: vertical list */}
                    <div className="flex flex-row gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1.5 md:overflow-visible md:pb-0 snap-x snap-mandatory">
                        {productSubscriptions.map((p) => {
                            const isAct = p.id === activeId
                            const PIcon = p.icon
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setActiveId(p.id)}
                                    className="flex items-center gap-2.5 px-3 py-[11px] rounded-xl text-left transition-all duration-[180ms] snap-start flex-shrink-0 w-[180px] md:w-auto"
                                    style={{
                                        border: `1px solid ${isAct ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)'}`,
                                        background: isAct
                                            ? 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.06))'
                                            : 'rgba(255,255,255,0.03)',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                        boxShadow: isAct ? '0 1px 0 rgba(255,255,255,0.08) inset' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isAct) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isAct) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                                        }
                                    }}>
                                    <div
                                        className="w-[34px] h-[34px] rounded-[9px] flex-shrink-0 flex items-center justify-center transition-all duration-[180ms]"
                                        style={{
                                            background: isAct ? p.accentBg : 'rgba(255,255,255,0.06)',
                                            border: `1px solid ${isAct ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                            color: isAct ? p.accent : 'rgba(255,255,255,0.35)'
                                        }}>
                                        <PIcon size={17} />
                                    </div>
                                    <div className="min-w-0">
                                        <div
                                            className="text-[13px] font-bold whitespace-nowrap truncate"
                                            style={{ ...fontBody, color: isAct ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)' }}>
                                            {p.name}
                                        </div>
                                        <div
                                            className="text-[10px] text-white/25 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]"
                                            style={fontMono}>
                                            {p.tagline}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* ── Tiers ── */}
                <div className="flex-1 min-w-0">
                    {/* Product header */}
                    <div className="mb-6 pb-5 border-b border-white/[0.07]">
                        <div className="flex items-center gap-3.5 mb-2">
                            <div
                                className="w-[44px] h-[44px] rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: product.accentBg,
                                    border: '1px solid rgba(99,102,241,0.28)',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset',
                                    color: product.accent
                                }}>
                                <product.icon size={21} />
                            </div>
                            <div>
                                <div
                                    className="text-[26px] sm:text-[30px] text-white/95 leading-none font-extrabold tracking-tight"
                                    style={fontDisplay}>
                                    {product.name}
                                </div>
                                <div
                                    className="text-[10px] font-bold tracking-[.1em] uppercase mt-0.5"
                                    style={{ ...fontMono, color: product.accent }}>
                                    {product.tagline}
                                </div>
                            </div>
                        </div>
                        <p
                            className="text-[14px] text-white/[0.38] leading-[1.65] mt-2"
                            style={fontBody}>
                            {product.description}
                        </p>
                    </div>

                    {/* Tier cards — 1 col mobile → 2 col sm → 4 col lg */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {product.tiers.map((tier: ProductTier, i: number) => {
                            const isHot = !!tier.highlighted
                            return (
                                <div
                                    key={i}
                                    className="rounded-2xl px-[18px] py-[22px] relative overflow-hidden transition-all duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-[3px]
                                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.16] before:to-transparent before:pointer-events-none before:z-10"
                                    style={{
                                        background: isHot
                                            ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(99,102,241,0.08) 50%,rgba(99,102,241,0.04))'
                                            : 'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018) 50%,rgba(99,102,241,0.04))',
                                        backdropFilter: 'blur(20px) saturate(1.4)',
                                        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                                        border: `1px solid ${isHot ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.09)'}`,
                                        boxShadow: isHot
                                            ? '0 0 0 1px rgba(99,102,241,0.12) inset, 0 1px 0 rgba(255,255,255,0.14) inset, 0 20px 48px rgba(0,0,0,0.45), 0 0 36px rgba(99,102,241,0.14)'
                                            : '0 1px 0 rgba(255,255,255,0.1) inset, 0 16px 40px rgba(0,0,0,0.35)'
                                    }}>
                                    {isHot && (
                                        <div
                                            aria-hidden="true"
                                            className="absolute rounded-full pointer-events-none"
                                            style={{
                                                top: -50,
                                                right: -40,
                                                width: 180,
                                                height: 180,
                                                background: 'oklch(0.623 0.214 259.815)',
                                                filter: 'blur(60px)',
                                                opacity: 0.18
                                            }}
                                        />
                                    )}

                                    <div className="relative">
                                        {/* Label row */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span
                                                className="inline-block px-2.5 py-[3px] rounded-[20px] text-[10px] font-bold tracking-[.1em] uppercase backdrop-blur-[8px]"
                                                style={{
                                                    ...fontMono,
                                                    color: isHot ? 'oklch(0.707 0.165 254.624)' : 'rgba(255,255,255,0.38)',
                                                    background: isHot ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${isHot ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`
                                                }}>
                                                {tier.label}
                                            </span>
                                            {isHot && (
                                                <span
                                                    className="inline-block w-1.5 h-1.5 rounded-full"
                                                    style={{
                                                        background: 'oklch(0.623 0.214 259.815)',
                                                        boxShadow: '0 0 8px oklch(0.623 0.214 259.815)'
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* User limit */}
                                        <div
                                            className="text-[11px] font-bold tracking-[.08em] uppercase text-white/[0.28] mb-4"
                                            style={fontMono}>
                                            {tier.limit}
                                        </div>

                                        <div className="h-px bg-white/[0.07] mb-4" />

                                        {/* Features */}
                                        <ul className="list-none p-0 m-0 mb-5 flex flex-col gap-2">
                                            {tier.features.map((f, j) => (
                                                <li
                                                    key={j}
                                                    className="flex items-start gap-2 text-[12px] text-white/60 leading-[1.55]"
                                                    style={fontBody}>
                                                    <div
                                                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-[2px]"
                                                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                                                        <Check
                                                            size={8}
                                                            color="#4ade80"
                                                        />
                                                    </div>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        <NavLink href="#contact">
                                            <button
                                                className="flex items-center justify-center gap-[7px] w-full px-3.5 py-[11px] rounded-[10px] text-[11px] font-bold tracking-[.1em] uppercase cursor-pointer transition-all duration-200 backdrop-blur-[8px]"
                                                style={{
                                                    ...fontMono,
                                                    background: isHot ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.05)',
                                                    border: isHot ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.1)',
                                                    color: isHot ? '#000' : 'rgba(255,255,255,0.55)',
                                                    boxShadow: isHot
                                                        ? '0 1px 0 rgba(255,255,255,0.3) inset, 0 8px 24px rgba(99,102,241,0.2)'
                                                        : '0 1px 0 rgba(255,255,255,0.06) inset'
                                                }}
                                                onMouseEnter={(e) => {
                                                    const b = e.currentTarget
                                                    if (isHot) {
                                                        b.style.background = 'rgba(255,255,255,1)'
                                                    } else {
                                                        b.style.borderColor = 'rgba(99,102,241,0.4)'
                                                        b.style.color = 'rgba(255,255,255,0.9)'
                                                        b.style.background = 'rgba(99,102,241,0.12)'
                                                    }
                                                    b.style.transform = 'translateY(-1px)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    const b = e.currentTarget
                                                    if (isHot) {
                                                        b.style.background = 'rgba(255,255,255,0.95)'
                                                    } else {
                                                        b.style.borderColor = 'rgba(255,255,255,0.1)'
                                                        b.style.color = 'rgba(255,255,255,0.55)'
                                                        b.style.background = 'rgba(255,255,255,0.05)'
                                                    }
                                                    b.style.transform = 'translateY(0)'
                                                }}>
                                                {tier.cta} <ChevronRight size={13} />
                                            </button>
                                        </NavLink>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Pricing() {
    const [mainTab, setMainTab] = useState<MainTab>('products')
    const [activeCat, setActiveCat] = useState<Category>('All')

    const { badgeTitle, heading, description, allServices } = pricingData
    const filtered: PricingService[] = activeCat === 'All' ? allServices : allServices.filter((s) => s.category === activeCat)

    return (
        <section
            id="pricing"
            className="relative overflow-hidden bg-transparent text-[var(--white)] py-16 sm:py-20 px-4 sm:px-5">
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
            <div className="text-center mb-10 sm:mb-11 relative z-[1]">
                <Badge
                    variant="outline"
                    className="mb-4 sm:mb-5 text-white text-xl">
                    {badgeTitle}
                </Badge>

                <h2
                    className="text-white/95 leading-none mb-3 mt-3 font-extrabold tracking-tight"
                    style={{ ...fontDisplay, fontSize: 'clamp(32px, 6vw, 58px)' }}>
                    {heading}
                </h2>

                <p
                    className="text-[15px] sm:text-[16px] text-white/35 max-w-[540px] mx-auto mb-6 sm:mb-7 leading-[1.75] px-2"
                    style={fontBody}>
                    {description}
                </p>

                {/* Controls row — wraps cleanly on small screens */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap px-2">
                    <div
                        className="inline-flex gap-[3px] p-1 rounded-xl border border-white/[0.08] backdrop-blur-[16px]"
                        style={{ background: 'rgba(255,255,255,0.04)', boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset' }}>
                        {(
                            [
                                { key: 'products', label: '📦  Products' },
                                { key: 'services', label: '⚙️  All Services' }
                            ] as { key: MainTab; label: string }[]
                        ).map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setMainTab(t.key)}
                                className="px-3 sm:px-4 py-[7px] rounded-lg border text-[11px] sm:text-[12px] font-bold tracking-[.1em] uppercase cursor-pointer whitespace-nowrap transition-all duration-[180ms]"
                                style={{
                                    ...fontMono,
                                    borderColor: mainTab === t.key ? 'rgba(99,102,241,0.4)' : 'transparent',
                                    background:
                                        mainTab === t.key ? 'linear-gradient(135deg,rgba(99,102,241,0.22),rgba(99,102,241,0.1))' : 'transparent',
                                    color: mainTab === t.key ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                                    boxShadow: mainTab === t.key ? '0 1px 0 rgba(255,255,255,0.1) inset' : 'none'
                                }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ TAB: Products ═══════════════════════════════════════════ */}
            {mainTab === 'products' && (
                <div className="relative z-[1]">
                    <ProductsTab />
                </div>
            )}

            {/* ══ TAB: All Services ════════════════════════════════════════ */}
            {mainTab === 'services' && (
                <div className="relative z-[1]">
                    {/* Category filter — horizontal scroll on mobile */}
                    <div className="flex gap-1.5 justify-start sm:justify-center mb-6 sm:mb-7 overflow-x-auto pb-1 px-1 snap-x snap-mandatory">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCat(cat)}
                                className="px-3 sm:px-3.5 py-1.5 rounded-[20px] text-[10px] sm:text-[11px] font-bold tracking-[.1em] uppercase cursor-pointer transition-all duration-[180ms] backdrop-blur-[12px] flex-shrink-0 snap-start"
                                style={{
                                    ...fontMono,
                                    background:
                                        activeCat === cat
                                            ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(99,102,241,0.09))'
                                            : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${activeCat === cat ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                    color: activeCat === cat ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)',
                                    boxShadow: activeCat === cat ? '0 1px 0 rgba(255,255,255,0.1) inset' : '0 1px 0 rgba(255,255,255,0.06) inset'
                                }}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <p
                        className="text-[11px] font-bold tracking-[.1em] uppercase text-white/20 text-center mb-5 sm:mb-6"
                        style={fontMono}>
                        {filtered.length} service{filtered.length !== 1 ? 's' : ''}
                    </p>

                    {/* Service cards — 1 col mobile → 2 col sm → 3 col lg */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-3.5 sm:grid-cols-2 lg:grid-cols-3 max-w-[1152px] mx-auto">
                        {filtered.map((svc, i) => {
                            const c = CAT_STYLE[svc.category] ?? CAT_STYLE.Support
                            const SvcIcon = svc.icon
                            return (
                                <div
                                    key={i}
                                    className="relative rounded-2xl px-4 sm:px-5 py-5 sm:py-[22px] flex flex-col cursor-default overflow-hidden transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-[3px] hover:scale-[1.006]
                                        before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.18] before:to-transparent before:pointer-events-none before:z-10"
                                    style={{
                                        background:
                                            'linear-gradient(135deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.018) 50%,rgba(99,102,241,0.04) 100%)',
                                        backdropFilter: 'blur(20px) saturate(1.4)',
                                        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        boxShadow:
                                            '0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.1) inset, 0 20px 48px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = c.border
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                                    }}>
                                    {/* Ghost watermark */}
                                    <span
                                        aria-hidden="true"
                                        className="absolute bottom-[-8px] right-3 text-[56px] sm:text-[64px] leading-none pointer-events-none select-none font-extrabold"
                                        style={{ ...fontDisplay, color: c.accent, opacity: 0.06 }}>
                                        {svc.category}
                                    </span>

                                    {/* Category badge */}
                                    <span
                                        className="absolute top-3.5 right-3.5 px-[9px] py-[2px] rounded-[20px] text-[9px] font-bold tracking-[.1em] uppercase backdrop-blur-[8px]"
                                        style={{ ...fontMono, color: c.accent, background: c.accentBg, border: `1px solid ${c.border}` }}>
                                        {svc.category}
                                    </span>

                                    {/* Icon */}
                                    <div
                                        className="w-[40px] h-[40px] sm:w-[42px] sm:h-[42px] rounded-[11px] flex items-center justify-center mb-3 sm:mb-3.5 flex-shrink-0 backdrop-blur-[8px]"
                                        style={{
                                            background: c.accentBg,
                                            border: `1px solid ${c.border}`,
                                            boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset',
                                            color: c.accent
                                        }}>
                                        <SvcIcon size={19} />
                                    </div>

                                    <div
                                        className="text-[18px] sm:text-[20px] text-white/[0.92] leading-[1.15] mb-2 font-extrabold tracking-tight"
                                        style={fontDisplay}>
                                        {svc.name}
                                    </div>
                                    <div
                                        className="text-[13px] text-white/[0.36] leading-[1.65] flex-1"
                                        style={fontBody}>
                                        {svc.description}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer CTA */}
                    <div className="text-center mt-10 sm:mt-12 px-4">
                        <p
                            className="text-[14px] sm:text-[15px] text-white/[0.32] mb-4 sm:mb-5"
                            style={fontBody}>
                            Need a custom quote for your specific requirements?
                        </p>
                        <NavLink href="#contact">
                            <button
                                className="inline-flex items-center gap-[9px] px-6 sm:px-[30px] py-[13px] rounded-[10px] text-[12px] sm:text-[13px] font-bold tracking-[.1em] uppercase text-black cursor-pointer backdrop-blur-[8px] transition-all duration-200"
                                style={{
                                    ...fontMono,
                                    background: 'rgba(255,255,255,0.92)',
                                    border: '1px solid rgba(255,255,255,0.9)',
                                    boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 24px rgba(99,102,241,0.2)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,1)'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,0.5) inset,0 12px 32px rgba(99,102,241,0.28)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.92)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,0.5) inset,0 8px 24px rgba(99,102,241,0.2)'
                                }}>
                                Get a Custom Quote <ChevronRight size={14} />
                            </button>
                        </NavLink>
                    </div>
                </div>
            )}
        </section>
    )
}
