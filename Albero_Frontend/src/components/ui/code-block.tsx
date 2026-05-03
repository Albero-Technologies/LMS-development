import { useState, useMemo } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'

interface CodeBlockProps {
    code: string
    language?: 'python' | 'sql' | 'javascript' | 'typescript' | 'bash' | 'output' | 'text'
    title?: string
    showLines?: boolean
}

// ─── Lightweight token-based highlighter (no external lib) ────────────────────
// Designed for short snippets in tutorial pages.

const KEYWORDS: Record<string, string[]> = {
    python: [
        'def','class','return','if','elif','else','for','while','in','not','and','or','None','True','False','import','from','as','with','try','except','finally','raise','pass','break','continue','lambda','yield','global','nonlocal','is','del','async','await','print'
    ],
    sql: [
        'SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','ON','GROUP','BY','ORDER','HAVING','LIMIT','OFFSET','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','DROP','ALTER','AS','AND','OR','NOT','NULL','IS','IN','LIKE','BETWEEN','UNION','ALL','DISTINCT','COUNT','SUM','AVG','MIN','MAX','CASE','WHEN','THEN','END','WITH'
    ],
    javascript: [
        'const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','class','extends','super','new','this','import','from','export','default','async','await','try','catch','finally','throw','typeof','instanceof','of','in','null','undefined','true','false'
    ],
    typescript: [
        'const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','class','extends','super','new','this','import','from','export','default','async','await','try','catch','finally','throw','typeof','instanceof','of','in','null','undefined','true','false','interface','type','enum','as','readonly','public','private','protected','static','implements','keyof','infer','never','unknown','any','number','string','boolean','void'
    ],
    bash: [],
    output: [],
    text: []
}

type Token = { kind: 'kw' | 'str' | 'num' | 'cmt' | 'fn' | 'op' | 'plain'; value: string }

function tokenize(line: string, lang: string): Token[] {
    if (lang === 'output' || lang === 'text' || lang === 'bash') return [{ kind: 'plain', value: line }]

    const kws = new Set(KEYWORDS[lang] || [])
    const tokens: Token[] = []
    let i = 0
    const len = line.length

    while (i < len) {
        const ch = line[i]

        // Comments
        if ((lang === 'python' && ch === '#') || ((lang === 'javascript' || lang === 'typescript') && ch === '/' && line[i + 1] === '/') || (lang === 'sql' && ch === '-' && line[i + 1] === '-')) {
            tokens.push({ kind: 'cmt', value: line.slice(i) })
            return tokens
        }

        // Strings — single, double, backtick
        if (ch === '"' || ch === "'" || ch === '`') {
            const quote = ch
            let j = i + 1
            while (j < len && line[j] !== quote) {
                if (line[j] === '\\') j++
                j++
            }
            tokens.push({ kind: 'str', value: line.slice(i, Math.min(j + 1, len)) })
            i = j + 1
            continue
        }

        // Numbers
        if (/[0-9]/.test(ch)) {
            let j = i
            while (j < len && /[0-9.]/.test(line[j])) j++
            tokens.push({ kind: 'num', value: line.slice(i, j) })
            i = j
            continue
        }

        // Word — keyword / fn / plain
        if (/[A-Za-z_]/.test(ch)) {
            let j = i
            while (j < len && /[A-Za-z0-9_]/.test(line[j])) j++
            const word = line.slice(i, j)
            const compare = lang === 'sql' ? word.toUpperCase() : word
            if (kws.has(compare)) {
                tokens.push({ kind: 'kw', value: word })
            } else if (line[j] === '(') {
                tokens.push({ kind: 'fn', value: word })
            } else {
                tokens.push({ kind: 'plain', value: word })
            }
            i = j
            continue
        }

        // Operators / punctuation
        if (/[+\-*/<>=!&|?:.,;[\](){}]/.test(ch)) {
            tokens.push({ kind: 'op', value: ch })
            i++
            continue
        }

        tokens.push({ kind: 'plain', value: ch })
        i++
    }
    return tokens
}

function tokenColor(kind: Token['kind']): string {
    switch (kind) {
        case 'kw':
            return 'var(--code-kw)'
        case 'str':
            return 'var(--code-str)'
        case 'num':
            return 'var(--code-num)'
        case 'cmt':
            return 'var(--code-cmt)'
        case 'fn':
            return 'var(--code-fn)'
        case 'op':
            return 'var(--code-op)'
        default:
            return 'var(--code-fg)'
    }
}

export default function CodeBlock({ code, language = 'python', title, showLines = true }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    const lines = useMemo(() => code.replace(/\n$/, '').split('\n').map((l) => tokenize(l, language)), [code, language])

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
        } catch {
            /* ignore */
        }
    }

    return (
        <div
            className="rounded-2xl overflow-hidden my-6 group/code"
            style={{
                background: 'var(--code-bg)',
                border: '1px solid var(--code-border)',
                boxShadow: '0 14px 40px rgba(0, 0, 0, 0.45)',
                // ─── Code blocks always render dark regardless of page theme.
                // This matches developer-tool convention (VS Code, GitHub, Stripe docs)
                // and gives token colours a stable, high-contrast background to sit on.
                ['--code-bg' as never]: '#0c1024',
                ['--code-bg-soft' as never]: 'rgba(255,255,255,0.04)',
                ['--code-border' as never]: 'rgba(255, 255, 255, 0.10)',
                ['--code-divider' as never]: 'rgba(255, 255, 255, 0.08)',
                ['--code-fg' as never]: '#e8ecf5', // body text — high contrast on navy
                ['--code-kw' as never]: '#c4b5fd', // purple — keywords
                ['--code-str' as never]: '#86efac', // green — strings
                ['--code-num' as never]: '#fdba74', // orange — numbers
                ['--code-cmt' as never]: '#94a3b8', // slate — comments (was too dim)
                ['--code-fn' as never]: '#7dd3fc', // sky — function calls
                ['--code-op' as never]: '#e2e8f0', // brighter — operators / punctuation
                ['--code-line' as never]: 'rgba(232, 236, 245, 0.30)' // line numbers
            }}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--code-divider)', background: 'var(--code-bg-soft)' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} />
                    </div>
                    <div
                        className="hidden sm:flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(232,236,245,0.92)' }}>
                        <Terminal size={11} />
                        {title || language}
                    </div>
                </div>
                <button
                    onClick={onCopy}
                    aria-label="Copy code"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors"
                    style={{
                        background: copied ? 'rgba(52,211,153,0.20)' : 'rgba(255,255,255,0.08)',
                        color: copied ? '#86efac' : 'rgba(232,236,245,0.95)',
                        border: '1px solid rgba(255,255,255,0.12)'
                    }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            {/* Body */}
            <div
                className="overflow-x-auto py-4 text-[13px] leading-[1.65]"
                style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}>
                <pre className="m-0 px-4">
                    {lines.map((tokens, lineIdx) => (
                        <div key={lineIdx} className="flex">
                            {showLines && (
                                <span
                                    className="inline-block text-right pr-4 select-none flex-shrink-0"
                                    style={{ color: 'var(--code-line)', minWidth: '2.4ch' }}>
                                    {lineIdx + 1}
                                </span>
                            )}
                            <span style={{ color: 'var(--code-fg)' }}>
                                {tokens.length === 0 ? (
                                    <span>{' '}</span>
                                ) : (
                                    tokens.map((t, j) => (
                                        <span key={j} style={{ color: tokenColor(t.kind), fontStyle: t.kind === 'cmt' ? 'italic' : undefined }}>
                                            {t.value}
                                        </span>
                                    ))
                                )}
                            </span>
                        </div>
                    ))}
                </pre>
            </div>
        </div>
    )
}
