import { Sparkles } from 'lucide-react'
import { SectionShell, SectionHeading } from './primitives'
import { Ticker, type TickerItem } from './Ticker'

export interface ToolStripItem {
    name: string
    iconUrl?: string
}

interface Props {
    /** Tools / technologies to render in the strip. */
    tools: ToolStripItem[]
    /** Section heading override — defaults to a count-aware string. */
    heading?: React.ReactNode
    /** Subtitle under the heading. Optional. */
    description?: string
    /** Background tone — set 'soft' to alternate against the surrounding white sections. */
    tone?: 'white' | 'soft'
}

// Two-row scrolling tool ticker. Row 1 scrolls left → right, row 2 scrolls
// right → left for visual depth. Mobile collapses to a single row (CSS
// hides the second row at < md). Per-pill content is intentionally simple
// so the design language matches the rest of the program page.
export const ScrollingToolStrip = ({ tools, heading, description, tone = 'soft' }: Props) => {
    if (tools.length === 0) return null

    const items: TickerItem[] = tools.map((t) => ({
        key: t.name,
        content: <ToolPill tool={t} />
    }))

    // Stagger the rows by splitting the list — odd-indexed tools land in
    // row 2 so the same item doesn't appear directly above itself when the
    // page first paints.
    const row1 = items.filter((_, i) => i % 2 === 0)
    const row2 = items.filter((_, i) => i % 2 === 1)

    return (
        <SectionShell tone={tone} spacing="normal">
            <SectionHeading
                eyebrow="Industry Tools"
                title={heading ?? `${tools.length}+ industry tools,`}
                accent="woven into every lab."
                description={description ?? 'Hands-on labs use the exact stack that hiring teams expect — no toy projects, no outdated frameworks.'}
            />
            <div className="space-y-4">
                <Ticker items={row1.length ? row1 : items} direction="left" durationSeconds={42} />
                {row2.length > 0 && (
                    <div className="hidden md:block">
                        <Ticker items={row2} direction="right" durationSeconds={48} />
                    </div>
                )}
            </div>
        </SectionShell>
    )
}

const ToolPill = ({ tool }: { tool: ToolStripItem }) => (
    <div
        className="inline-flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full"
        style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--card-shadow-soft)',
            color: 'var(--text-primary)'
        }}>
        <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
            style={{
                background: 'var(--section-soft)',
                border: '1px solid var(--hairline)'
            }}>
            {tool.iconUrl ? (
                <img src={tool.iconUrl} alt="" className="w-4 h-4 object-contain" loading="lazy" width={16} height={16} />
            ) : (
                <Sparkles size={12} style={{ color: 'var(--brand)' }} />
            )}
        </div>
        <span className="text-[13.5px] md:text-[14px] font-semibold whitespace-nowrap">{tool.name}</span>
    </div>
)
