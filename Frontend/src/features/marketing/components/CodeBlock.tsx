// Lightweight in-browser syntax-highlight renderer. Zero deps — we tokenize
// per language with a small regex pass and emit colored spans. Languages
// supported: sql · python · javascript · typescript · bash · plain.
//
// Why not prism-react-renderer / shiki:
//   - prism-react-renderer pulls ~30KB gzipped + a Prism core for every
//     language we care about. Cheat-sheet pages don't need every Prism
//     plugin.
//   - shiki is ~200KB+ for a usable language set and needs WASM init.
//
// What we lose vs. a real highlighter: nuance on edge cases (template
// strings inside JSX, nested SQL CTEs, etc.). Our cheat sheets are
// short and mostly use canonical syntax — the regex pass is good enough.

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { CodeLanguage, CodeSectionData } from '@features/admin/services/tenant.service'

interface Props {
    section: { variant: 'single' | 'tabs'; data: CodeSectionData }
}

export const CodeBlock = ({ section }: Props) => {
    const { title, code = '', language = 'plain', showLineNumbers = true, tabs } = section.data
    const useTabs = section.variant === 'tabs' && tabs && tabs.length > 0

    const [activeTab, setActiveTab] = useState(0)
    const activeCode = useTabs ? tabs[activeTab]?.code ?? '' : code
    const activeLang = useTabs ? tabs[activeTab]?.language ?? language : language

    return (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="rounded-2xl overflow-hidden border border-[#1f2433] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)] bg-[#0d1117]">
                {/* Header — title or tabs + language pill + copy button */}
                <div className="flex items-center justify-between border-b border-[#1f2433] bg-[#0a0e16] px-3 py-2">
                    <div className="flex items-center gap-3">
                        {/* Mac-style traffic-light dots — small touch that reads as "real code editor". */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                        </div>
                        {useTabs ? (
                            <div className="flex items-center gap-1">
                                {tabs.map((t, i) => (
                                    <button
                                        key={`${t.label}-${i}`}
                                        type="button"
                                        onClick={() => setActiveTab(i)}
                                        className={
                                            'px-3 py-1 rounded-md text-xs font-mono transition-colors ' +
                                            (i === activeTab
                                                ? 'bg-[#1f2433] text-[#e6edf3]'
                                                : 'text-[#7d8590] hover:text-[#c9d1d9] hover:bg-[#161b22]')
                                        }>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            title && <span className="text-xs font-mono text-[#c9d1d9]">{title}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#7d8590] font-mono">{activeLang}</span>
                        <CopyButton value={activeCode} />
                    </div>
                </div>

                <Highlighted
                    code={activeCode}
                    language={activeLang}
                    showLineNumbers={showLineNumbers}
                />
            </div>
        </section>
    )
}

// ---- Copy button -----------------------------------------------------------

const CopyButton = ({ value }: { value: string }) => {
    const [copied, setCopied] = useState(false)
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            // best-effort fallback
            const ta = document.createElement('textarea')
            ta.value = value
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        }
    }
    return (
        <button
            type="button"
            onClick={onCopy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-[#c9d1d9] hover:bg-[#1f2433] hover:text-white transition-colors">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
    )
}

// ---- Tokenizer + renderer --------------------------------------------------

const Highlighted = ({ code, language, showLineNumbers }: { code: string; language: CodeLanguage; showLineNumbers: boolean }) => {
    const lines = code.replace(/\r\n/g, '\n').split('\n')
    return (
        <pre className="overflow-x-auto py-4 text-[13px] leading-[1.6] font-mono text-[#e6edf3]">
            {lines.map((line, i) => (
                <div
                    key={i}
                    className="flex items-center px-4 hover:bg-[#161b22] transition-colors">
                    {showLineNumbers && (
                        <span
                            className="select-none text-right text-[11px] text-[#484f58] mr-4 shrink-0"
                            style={{ minWidth: '1.75rem' }}>
                            {i + 1}
                        </span>
                    )}
                    <code className="flex-1 whitespace-pre">{tokenize(line, language)}</code>
                </div>
            ))}
        </pre>
    )
}

// Color tokens — picked to match GitHub's dark theme for readability.
const COLORS = {
    comment: '#8b949e',
    keyword: '#ff7b72',
    string: '#a5d6ff',
    number: '#79c0ff',
    function: '#d2a8ff',
    operator: '#ff7b72',
    builtin: '#79c0ff',
    plain: '#e6edf3'
} as const

const KEYWORDS: Record<CodeLanguage, RegExp | null> = {
    sql: /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|AS|AND|OR|NOT|IN|EXISTS|NULL|IS|BETWEEN|LIKE|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL|RECURSIVE|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|VIEW|EXPLAIN|DISTINCT|COUNT|SUM|AVG|MIN|MAX|COALESCE|ROW_NUMBER|LAG|LEAD|OVER|PARTITION|UNBOUNDED|PRECEDING|FOLLOWING|ROWS|DESC|ASC)\b/gi,
    python: /\b(def|class|return|if|elif|else|for|while|in|is|not|and|or|None|True|False|import|from|as|with|try|except|finally|raise|lambda|yield|async|await|pass|break|continue|global|nonlocal|self)\b/g,
    javascript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|true|false|null|undefined|class|extends|super|this|import|export|from|default|async|await|try|catch|finally|throw|of|in)\b/g,
    typescript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|true|false|null|undefined|class|extends|super|this|import|export|from|default|async|await|try|catch|finally|throw|of|in|interface|type|enum|namespace|public|private|protected|readonly|abstract|implements|keyof|infer|as|satisfies|never|unknown|any|void)\b/g,
    bash: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|export|source|cd|ls|echo|grep|sed|awk|find|cat|chmod|chown|sudo|apt|brew|npm|pnpm|yarn|git)\b/g,
    plain: null
}

// Tokenize a single line. Order matters — strings must come before keywords
// so a keyword inside a string isn't recolored.
const tokenize = (line: string, language: CodeLanguage): React.ReactNode[] => {
    if (line.length === 0) return [' ']

    type Tok = { color: string; text: string }
    const tokens: Tok[] = []
    let cursor = 0

    // 1) Whole-line comment? Color and bail.
    const commentMatch = matchComment(line, language)
    if (commentMatch !== null) {
        tokens.push({ color: COLORS.plain, text: line.slice(0, commentMatch.start) })
        tokens.push({ color: COLORS.comment, text: line.slice(commentMatch.start) })
        return tokens.map((t, i) => (
            <span
                key={i}
                style={{ color: t.color }}>
                {t.text}
            </span>
        ))
    }

    // 2) Walk the line looking for strings + numbers + keywords + functions.
    const patterns: { re: RegExp; color: string }[] = [
        { re: /(['"`])((?:\\.|(?!\1).)*)\1/g, color: COLORS.string }, // strings
        { re: /\b\d+(?:\.\d+)?\b/g, color: COLORS.number }, // numbers
        { re: /\b[a-zA-Z_$][\w$]*(?=\s*\()/g, color: COLORS.function } // function names
    ]
    const kwRe = KEYWORDS[language]
    if (kwRe) patterns.unshift({ re: new RegExp(kwRe.source, kwRe.flags), color: COLORS.keyword })

    type Match = { start: number; end: number; color: string; text: string }
    const matches: Match[] = []
    for (const p of patterns) {
        let m
        const re = new RegExp(p.re.source, p.re.flags)
        while ((m = re.exec(line)) !== null) {
            matches.push({ start: m.index, end: m.index + m[0].length, color: p.color, text: m[0] })
            if (m.index === re.lastIndex) re.lastIndex++ // avoid infinite loop on zero-width match
        }
    }
    matches.sort((a, b) => a.start - b.start || b.end - a.end)

    // De-overlap — first wins.
    const out: Match[] = []
    for (const m of matches) {
        if (out.length === 0 || m.start >= out[out.length - 1].end) out.push(m)
    }

    cursor = 0
    for (const m of out) {
        if (m.start > cursor) tokens.push({ color: COLORS.plain, text: line.slice(cursor, m.start) })
        tokens.push({ color: m.color, text: m.text })
        cursor = m.end
    }
    if (cursor < line.length) tokens.push({ color: COLORS.plain, text: line.slice(cursor) })

    return tokens.map((t, i) => (
        <span
            key={i}
            style={{ color: t.color }}>
            {t.text}
        </span>
    ))
}

// Per-language single-line comment detection. Returns the index where the
// comment starts, or null if the line has no comment.
const matchComment = (line: string, language: CodeLanguage): { start: number } | null => {
    const single = (() => {
        switch (language) {
            case 'sql':
                return '--'
            case 'python':
            case 'bash':
                return '#'
            case 'javascript':
            case 'typescript':
                return '//'
            default:
                return null
        }
    })()
    if (!single) return null
    // Look for the marker outside of any quoted string.
    let inStr: '"' | "'" | '`' | null = null
    for (let i = 0; i < line.length; i++) {
        const c = line[i]
        const prev = line[i - 1]
        if (inStr) {
            if (c === inStr && prev !== '\\') inStr = null
            continue
        }
        if (c === '"' || c === "'" || c === '`') {
            inStr = c
            continue
        }
        if (line.slice(i, i + single.length) === single) return { start: i }
    }
    return null
}
