import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '@shared/components/Brand'
import { ThemeToggle } from '@shared/components/ThemeToggle'

type Props = {
    title: string
    subtitle?: string
    children: ReactNode
    footer?: ReactNode
}

export const AuthShell = ({ title, subtitle, children, footer }: Props) => (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-2">
        {/* Left — brand-rich panel */}
        <aside
            className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, var(--color-brand-900) 0%, var(--color-brand-500) 100%)'
            }}>
            <Link
                to="/"
                aria-label="Albero Academy home">
                <Brand
                    size="md"
                    onDark
                />
            </Link>
            <div className="text-white">
                <div className="text-xs uppercase tracking-wider text-white/70 mb-4 font-medium">Learn. Practice. Certify.</div>
                <p className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight max-w-lg">
                    Live classes.
                    <br />
                    Hands-on practice.
                    <br />
                    <span className="text-white/80">Real outcomes.</span>
                </p>
                <p className="mt-6 text-white/80 max-w-md leading-relaxed">
                    Expert-led courses, mentor-guided batches, timed quizzes and verifiable certificates — all in one learning platform built for
                    Indian students.
                </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/60">
                <span>Live cohorts</span>
                <span className="text-white/30">·</span>
                <span>1:1 mentorship</span>
                <span className="text-white/30">·</span>
                <span>Verified certificates</span>
            </div>
        </aside>

        {/* Right — form */}
        <main className="flex flex-col bg-surface">
            <div className="h-16 px-6 sm:px-10 flex items-center justify-between border-b lg:border-transparent">
                <div className="lg:hidden">
                    <Brand size="sm" />
                </div>
                <div className="ml-auto">
                    <ThemeToggle />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center p-6 sm:p-10">
                <div className="mx-auto w-full max-w-md">
                    <h1 className="text-3xl font-bold tracking-tight text-fg">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-fg-soft">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                    {footer && <div className="mt-6 text-sm text-fg-soft">{footer}</div>}
                </div>
            </div>
        </main>
    </div>
)
