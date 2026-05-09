import type { ReactNode } from 'react'

// ─── Reusable prose primitives for tutorial pages ────────────────────────────

export function H2({ id, children }: { id?: string; children: ReactNode }) {
    return (
        <h2
            id={id}
            className="font-display text-[26px] md:text-[32px] font-semibold tracking-[-0.01em] mt-12 mb-4 scroll-mt-32"
            style={{ color: 'var(--text-primary)' }}>
            {children}
        </h2>
    )
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
    return (
        <h3
            id={id}
            className="font-display text-[20px] md:text-[22px] font-semibold mt-8 mb-3 scroll-mt-32"
            style={{ color: 'var(--text-primary)' }}>
            {children}
        </h3>
    )
}

export function P({ children }: { children: ReactNode }) {
    return (
        <p
            className="text-[15.5px] md:text-[16px] leading-[1.75] mb-4"
            style={{ color: 'var(--text-secondary)' }}>
            {children}
        </p>
    )
}

export function UL({ children }: { children: ReactNode }) {
    return <ul className="space-y-2 mb-5 pl-1">{children}</ul>
}

export function LI({ children }: { children: ReactNode }) {
    return (
        <li
            className="flex items-start gap-3 text-[15.5px] leading-[1.65]"
            style={{ color: 'var(--text-secondary)' }}>
            <span
                className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--brand)' }}
            />
            <span>{children}</span>
        </li>
    )
}

export function Code({ children }: { children: ReactNode }) {
    return (
        <code
            className="px-1.5 py-0.5 rounded-md text-[0.92em]"
            style={{
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--line)',
                fontFamily: 'var(--font-mono, monospace)'
            }}>
            {children}
        </code>
    )
}

export function Strong({ children }: { children: ReactNode }) {
    return (
        <strong
            className="font-semibold"
            style={{ color: 'var(--text-primary)' }}>
            {children}
        </strong>
    )
}

type CalloutKind = 'tip' | 'note' | 'warning' | 'info'
const calloutMap: Record<CalloutKind, { color: string; soft: string; label: string; emoji: string }> = {
    tip: { color: 'var(--brand)', soft: 'var(--brand-soft)', label: 'Tip', emoji: '✦' },
    note: { color: 'var(--text-tertiary)', soft: 'var(--surface-2)', label: 'Note', emoji: '✎' },
    warning: { color: 'var(--accent)', soft: 'var(--accent-soft)', label: 'Watch out', emoji: '!' },
    info: { color: 'var(--brand)', soft: 'var(--brand-soft)', label: 'Did you know?', emoji: 'i' }
}

export function Callout({ kind = 'tip', children }: { kind?: CalloutKind; children: ReactNode }) {
    const c = calloutMap[kind]
    return (
        <div
            className="rounded-xl p-5 my-6 grid grid-cols-[28px_1fr] gap-3"
            style={{
                background: c.soft,
                borderLeft: `3px solid ${c.color}`
            }}>
            <span
                className="font-display text-[18px] font-semibold leading-none mt-0.5"
                style={{ color: c.color }}>
                {c.emoji}
            </span>
            <div>
                <div
                    className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-1"
                    style={{ color: c.color }}>
                    {c.label}
                </div>
                <div
                    className="text-[14.5px] leading-[1.65]"
                    style={{ color: 'var(--text-primary)' }}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
    return (
        <div
            className="my-6 rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--line)' }}>
            <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                    <thead>
                        <tr style={{ background: 'var(--brand-soft)' }}>
                            {headers.map((h, i) => (
                                <th
                                    key={i}
                                    className="text-left px-4 py-3 font-semibold"
                                    style={{ color: 'var(--brand)' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr
                                key={ri}
                                style={{ borderTop: '1px solid var(--line)', background: ri % 2 ? 'var(--surface-2)' : 'transparent' }}>
                                {row.map((cell, ci) => (
                                    <td
                                        key={ci}
                                        className="px-4 py-3 align-top"
                                        style={{
                                            color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            fontWeight: ci === 0 ? 500 : 400,
                                            fontFamily: ci === 0 ? 'var(--font-mono, monospace)' : 'inherit',
                                            fontSize: ci === 0 ? '13px' : '14px'
                                        }}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function Takeaways({ items }: { items: string[] }) {
    return (
        <div
            className="rounded-2xl p-6 md:p-7 my-8"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
            <div
                className="text-[11px] tracking-[0.18em] uppercase font-semibold mb-3"
                style={{ color: 'var(--brand)' }}>
                Key takeaways
            </div>
            <ul className="space-y-2.5">
                {items.map((it, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-3 text-[15px] leading-[1.65]"
                        style={{ color: 'var(--text-primary)' }}>
                        <span
                            className="font-display font-semibold mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--brand)' }}>
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{it}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
