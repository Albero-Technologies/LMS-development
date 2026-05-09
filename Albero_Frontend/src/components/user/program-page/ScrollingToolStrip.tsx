import { SectionShell, SectionHeading } from './primitives'
import { Ticker, type TickerItem } from './Ticker'
import { ToolIcon } from './ToolIcon'

export interface ToolStripItem {
    name: string
    /** Optional override icon URL — when omitted, the ToolIcon registry
     *  picks a brand-coloured Lucide glyph for the tool name. Avoids
     *  the broken-image fallback when a third-party CDN slug 404s. */
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
// hides the second row at < md). Pill design is intentionally calm — the
// strip is meant to add texture, not steal focus from the section above.
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
        className="inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full transition-all hover:translate-y-[-2px] hover:shadow-md"
        style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--card-shadow-soft)',
            color: 'var(--text-primary)'
        }}>
        {tool.iconUrl ? (
            // Backwards-compat for callers that pass a CMS-uploaded asset.
            <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}>
                <img src={tool.iconUrl} alt="" className="w-4 h-4 object-contain" loading="lazy" width={16} height={16} />
            </div>
        ) : (
            <ToolIcon name={tool.name} />
        )}
        <span className="text-[13.5px] md:text-[14px] font-semibold whitespace-nowrap">{tool.name}</span>
    </div>
)
