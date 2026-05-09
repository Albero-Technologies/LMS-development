import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { SectionShell, SectionHeading } from './primitives'

export interface ExplorerProgram {
    slug: string
    title: string
    duration: string
    badge: string
    bullets: string[]
    techTags: string[]
    priceLabel?: string
    /** Optional cert image rendered next to duration. */
    certBadgeUrl?: string
}

interface Props {
    programs: ExplorerProgram[]
    heading?: React.ReactNode
    accent?: React.ReactNode
    description?: string
}

// Interactive program selector for the homepage. Left rail = clickable
// program list; right panel = animated detail. Mobile collapses to an
// accordion (button toggles the same list inline). Keyboard navigation
// supported via roving arrow keys.
export const ProgramExplorer = ({
    programs,
    heading = (
        <>
            Pick the program <span className="alb-gradient-text italic font-medium">made for you.</span>
        </>
    ),
    accent,
    description = 'Click through every track to see duration, what you build, and where alumni land.'
}: Props) => {
    const [active, setActive] = useState(0)
    const current = programs[active]

    // Cycle programs with arrow keys when focus is on the list.
    useEffect(() => {
        const node = document.getElementById('program-explorer-list')
        if (!node) return
        const onKey = (e: KeyboardEvent) => {
            if (!document.activeElement || !node.contains(document.activeElement)) return
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => (a + 1) % programs.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => (a - 1 + programs.length) % programs.length)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [programs.length])

    if (programs.length === 0) return null

    return (
        <SectionShell tone="white" spacing="normal">
            <SectionHeading eyebrow="Our programs" title={heading} accent={accent} description={description} />
            <div className="grid lg:grid-cols-[280px_1fr] gap-5">
                <ul
                    id="program-explorer-list"
                    role="tablist"
                    aria-label="Programs"
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', boxShadow: 'var(--card-shadow-soft)' }}>
                    {programs.map((p, i) => (
                        <li key={p.slug}>
                            <button
                                role="tab"
                                aria-selected={i === active}
                                tabIndex={i === active ? 0 : -1}
                                onClick={() => setActive(i)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                                style={{
                                    background: i === active ? 'var(--brand-soft)' : 'transparent',
                                    borderLeft: i === active ? '3px solid var(--brand)' : '3px solid transparent',
                                    color: i === active ? 'var(--brand)' : 'var(--text-primary)'
                                }}>
                                <div className="flex-1 min-w-0">
                                    <div className="font-display text-[14.5px] font-semibold leading-tight">{p.title}</div>
                                    <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                        {p.duration} · {p.badge}
                                    </div>
                                </div>
                                <ArrowRight size={14} className="shrink-0 opacity-60" />
                            </button>
                        </li>
                    ))}
                </ul>
                <div
                    role="tabpanel"
                    key={current.slug}
                    className="rounded-2xl p-6 md:p-8 transition-opacity duration-300"
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        boxShadow: 'var(--card-shadow-soft)'
                    }}>
                    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                        <div>
                            <span
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider mb-3"
                                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                {current.badge}
                            </span>
                            <h3 className="font-display text-[24px] md:text-[28px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                {current.title}
                            </h3>
                            <p className="mt-1.5 text-[13.5px]" style={{ color: 'var(--text-tertiary)' }}>
                                {current.duration}
                            </p>
                        </div>
                        {current.certBadgeUrl && (
                            <img src={current.certBadgeUrl} alt="" className="h-9 object-contain" loading="lazy" />
                        )}
                    </div>

                    <ul className="mt-4 space-y-2">
                        {current.bullets.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                                <CheckCircle2 size={15} style={{ color: 'var(--brand)' }} className="mt-0.5 shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5 flex flex-wrap gap-1.5">
                        {current.techTags.map((t) => (
                            <span
                                key={t}
                                className="px-2.5 py-1 rounded-md text-[11.5px]"
                                style={{ background: 'var(--section-soft)', color: 'var(--text-secondary)', border: '1px solid var(--hairline)' }}>
                                {t}
                            </span>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 flex flex-wrap items-center justify-between gap-3 border-t" style={{ borderColor: 'var(--hairline)' }}>
                        {current.priceLabel && (
                            <div>
                                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
                                    Investment
                                </div>
                                <div className="font-display text-[20px] font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                                    {current.priceLabel}
                                </div>
                            </div>
                        )}
                        <a
                            href={`/programs/${current.slug}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[13.5px] transition-transform hover:translate-y-[-1px]"
                            style={{
                                background: 'var(--brand)',
                                color: 'var(--text-on-inverse)',
                                boxShadow: '0 6px 18px rgba(13,79,60,0.28)'
                            }}>
                            Explore program <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </SectionShell>
    )
}
