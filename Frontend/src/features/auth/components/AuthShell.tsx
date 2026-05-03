import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@shared/components/ThemeToggle'

// Auth shell — left-rail brand panel + right-rail form, deliberately tuned
// to mirror the Albero Academy public marketing site (port 5173). Same
// emerald-on-deep-navy palette, same leaf monogram, same Fraunces-serif
// headline with an italic emerald accent. Fonts ship from index.html via
// Google Fonts; tokens are inlined here so the auth screens read
// "marketing site" rather than "internal dashboard". The rest of the app
// keeps its own design system — only the unauthenticated screens borrow
// the public look so the handoff from /enquiry → /login feels seamless.

type Props = {
    title: string
    titleAccent?: string
    subtitle?: string
    children: ReactNode
    footer?: ReactNode
}

// Brand colours pulled from Albero_Frontend's design tokens:
//   --page-bg dark        → #07091a
//   --brand dark mode     → #34d399
//   --text-on-inverse     → #f8f6ee
const BG_DEEP = '#07091a'
const BG_SOFT = '#0d1027'
const BRAND = '#34d399'
const BRAND_SOFT = 'rgba(52, 211, 153, 0.14)'
const FG_PRIMARY = '#f8f6ee'
const FG_SECONDARY = 'rgba(248, 246, 238, 0.72)'
const FG_TERTIARY = 'rgba(248, 246, 238, 0.45)'

const SERIF = `'Fraunces', 'Times New Roman', serif`

export const AuthShell = ({ title, titleAccent, subtitle, children, footer }: Props) => (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-surface">
        {/* ── Left: brand-rich hero panel ──────────────────────────────── */}
        <aside
            className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden"
            style={{
                background: `radial-gradient(120% 80% at 0% 0%, ${BG_SOFT} 0%, ${BG_DEEP} 60%)`,
                color: FG_PRIMARY
            }}>
            {/* Subtle dot grid — same texture used on the public hero */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
                    backgroundSize: '28px 28px',
                    maskImage: 'radial-gradient(ellipse 90% 70% at 30% 30%, #000 50%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 30% 30%, #000 50%, transparent 100%)'
                }}
            />
            {/* Emerald orb — top-right */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full"
                style={{
                    top: -160,
                    right: -160,
                    width: 520,
                    height: 520,
                    background: `radial-gradient(circle, ${BRAND_SOFT} 0%, transparent 70%)`,
                    filter: 'blur(40px)'
                }}
            />
            {/* Cooler orb — bottom-left */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none rounded-full"
                style={{
                    bottom: -180,
                    left: -120,
                    width: 480,
                    height: 480,
                    background: `radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)`,
                    filter: 'blur(44px)'
                }}
            />

            <div className="relative z-[1]">
                <BrandWordmark />
            </div>

            <div className="relative z-[1]">
                <div
                    className="inline-flex items-center gap-2 mb-6 text-[11px] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: BRAND }}>
                    <span
                        className="inline-block w-10 h-[2px] rounded-full"
                        style={{ background: BRAND }}
                    />
                    Learn. Practice. Certify.
                </div>
                <h2
                    className="leading-[0.96] tracking-[-0.02em] mb-6"
                    style={{ fontFamily: SERIF, fontSize: 'clamp(36px, 4.4vw, 56px)' }}>
                    <span className="font-medium">Live classes.</span>
                    <br />
                    <span className="font-medium">Hands-on practice.</span>
                    <br />
                    <span
                        className="italic font-light"
                        style={{ color: BRAND }}>
                        Real outcomes.
                    </span>
                </h2>
                <p
                    className="text-[15.5px] leading-relaxed max-w-[460px]"
                    style={{ color: FG_SECONDARY }}>
                    Expert-led courses, mentor-guided batches, timed quizzes and verifiable certificates — built for Indian
                    learners.
                </p>
            </div>

            <div
                className="relative z-[1] flex items-center gap-4 text-[13px]"
                style={{ color: FG_TERTIARY }}>
                <span className="inline-flex items-center gap-1.5">
                    <Dot color={BRAND} />
                    Live cohorts
                </span>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1.5">
                    <Dot color={BRAND} />
                    1:1 mentorship
                </span>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1.5">
                    <Dot color={BRAND} />
                    Verified certificates
                </span>
            </div>
        </aside>

        {/* ── Right: form panel ────────────────────────────────────────── */}
        <main className="flex flex-col bg-surface">
            <div className="h-16 px-6 sm:px-10 flex items-center justify-between border-b lg:border-transparent">
                <div className="lg:hidden">
                    <BrandWordmark compact />
                </div>
                <div className="ml-auto">
                    <ThemeToggle />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center p-6 sm:p-10">
                <div className="mx-auto w-full max-w-md">
                    <h1
                        className="leading-[1.05] tracking-[-0.01em] text-fg"
                        style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 3.4vw, 40px)' }}>
                        <span className="font-medium">{title}</span>
                        {titleAccent && (
                            <>
                                {' '}
                                <span
                                    className="italic font-light"
                                    style={{ color: 'var(--color-brand-500)' }}>
                                    {titleAccent}
                                </span>
                            </>
                        )}
                    </h1>
                    {subtitle && <p className="mt-2 text-[15px] text-fg-soft leading-relaxed">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                    {footer && <div className="mt-6 text-sm text-fg-soft">{footer}</div>}
                </div>
            </div>
        </main>
    </div>
)

// Albero leaf-monogram + serif wordmark, mirrors the public site's navbar.
// `compact` is for the mobile-only top bar where the panel collapses away.
function BrandWordmark({ compact = false }: { compact?: boolean }) {
    return (
        <Link
            to="/"
            aria-label="Albero Academy"
            className="inline-flex items-center gap-2.5 select-none"
            style={{ color: compact ? 'var(--color-fg)' : FG_PRIMARY }}>
            <span
                className="inline-flex items-center justify-center rounded-lg shrink-0"
                style={{
                    background: BRAND,
                    color: BG_DEEP,
                    width: compact ? 32 : 38,
                    height: compact ? 32 : 38
                }}>
                <svg
                    viewBox="0 0 24 24"
                    width={compact ? 16 : 18}
                    height={compact ? 16 : 18}
                    fill="none">
                    <path
                        d="M12 3 C 7 7, 5 12, 12 21 C 19 12, 17 7, 12 3 Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 8 L12 21"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            </span>
            <span className="flex flex-col leading-none">
                <span
                    className="font-semibold tracking-tight"
                    style={{ fontFamily: SERIF, fontSize: compact ? 16 : 22 }}>
                    Albero
                </span>
                <span
                    className="text-[10px] tracking-[0.32em] uppercase font-medium mt-1"
                    style={{ color: FG_TERTIARY }}>
                    Academy
                </span>
            </span>
        </Link>
    )
}

function Dot({ color }: { color: string }) {
    return (
        <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 0 3px ${color}1a` }}
        />
    )
}
