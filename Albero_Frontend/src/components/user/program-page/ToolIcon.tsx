import {
    Activity,
    BarChart3,
    Boxes,
    Cloud,
    Code2,
    Database,
    FileSpreadsheet,
    GitBranch,
    GlobeLock,
    Layers,
    LineChart,
    Network,
    PieChart,
    Server,
    Settings,
    Shield,
    ShieldAlert,
    Sparkles,
    TerminalSquare,
    Zap
} from 'lucide-react'

// Tool icon mapping keyed by lowercase tool name. We render Lucide glyphs
// in a brand-coloured circle instead of pulling logos from a third-party
// CDN — same look, no broken-image squares when a slug doesn't resolve.
//
// When a tool isn't recognised we fall back to a generic Sparkles glyph
// so the pill always renders something rather than the previous greyed-
// out plain text.

interface ToolIconProps {
    name: string
    size?: number
}

// Tone palette per tool category — keeps the strip visually varied
// without needing a per-tool brand colour. All tones are derived from
// the existing Albero palette.
const TOOL_TONES = {
    data: '#0d4f3c', // emerald — SQL / databases / ETL
    viz: '#b86a18', // amber  — Power BI / Tableau / Looker
    spreadsheet: '#107c41', // soft green — Excel / Google Sheets
    python: '#3776ab',
    cloud: '#0891b2',
    web: '#2563eb',
    ml: '#7c3aed',
    security: '#dc2626',
    devops: '#0d9488',
    fallback: '#14785f'
}

interface ToolDef {
    Icon: React.ComponentType<{ size?: number }>
    color: string
}

const TOOL_REGISTRY: Record<string, ToolDef> = {
    excel: { Icon: FileSpreadsheet, color: TOOL_TONES.spreadsheet },
    'google sheets': { Icon: FileSpreadsheet, color: TOOL_TONES.spreadsheet },
    sql: { Icon: Database, color: TOOL_TONES.data },
    mysql: { Icon: Database, color: TOOL_TONES.data },
    postgres: { Icon: Database, color: TOOL_TONES.data },
    mongodb: { Icon: Database, color: TOOL_TONES.data },
    redis: { Icon: Database, color: TOOL_TONES.data },
    snowflake: { Icon: Database, color: TOOL_TONES.cloud },
    'power bi': { Icon: BarChart3, color: TOOL_TONES.viz },
    tableau: { Icon: PieChart, color: TOOL_TONES.viz },
    'looker studio': { Icon: LineChart, color: TOOL_TONES.viz },
    looker: { Icon: LineChart, color: TOOL_TONES.viz },
    mixpanel: { Icon: BarChart3, color: TOOL_TONES.viz },
    amplitude: { Icon: BarChart3, color: TOOL_TONES.viz },
    ga4: { Icon: LineChart, color: TOOL_TONES.viz },
    powerpoint: { Icon: PieChart, color: TOOL_TONES.viz },
    bloomberg: { Icon: LineChart, color: TOOL_TONES.viz },
    capiq: { Icon: LineChart, color: TOOL_TONES.viz },
    factset: { Icon: LineChart, color: TOOL_TONES.viz },
    pitchbook: { Icon: LineChart, color: TOOL_TONES.viz },
    python: { Icon: TerminalSquare, color: TOOL_TONES.python },
    pandas: { Icon: TerminalSquare, color: TOOL_TONES.python },
    'scikit-learn': { Icon: Sparkles, color: TOOL_TONES.ml },
    pytorch: { Icon: Sparkles, color: TOOL_TONES.ml },
    tensorflow: { Icon: Sparkles, color: TOOL_TONES.ml },
    huggingface: { Icon: Sparkles, color: TOOL_TONES.ml },
    'hugging face': { Icon: Sparkles, color: TOOL_TONES.ml },
    openai: { Icon: Sparkles, color: TOOL_TONES.ml },
    langchain: { Icon: Sparkles, color: TOOL_TONES.ml },
    git: { Icon: GitBranch, color: TOOL_TONES.devops },
    docker: { Icon: Boxes, color: TOOL_TONES.devops },
    terraform: { Icon: Boxes, color: TOOL_TONES.devops },
    kubernetes: { Icon: Boxes, color: TOOL_TONES.devops },
    react: { Icon: Code2, color: TOOL_TONES.web },
    'node.js': { Icon: Server, color: TOOL_TONES.web },
    express: { Icon: Server, color: TOOL_TONES.web },
    typescript: { Icon: Code2, color: TOOL_TONES.web },
    javascript: { Icon: Code2, color: TOOL_TONES.web },
    html: { Icon: Code2, color: TOOL_TONES.web },
    css: { Icon: Code2, color: TOOL_TONES.web },
    'html/css': { Icon: Code2, color: TOOL_TONES.web },
    graphql: { Icon: Code2, color: TOOL_TONES.web },
    aws: { Icon: Cloud, color: TOOL_TONES.cloud },
    azure: { Icon: Cloud, color: TOOL_TONES.cloud },
    spark: { Icon: Zap, color: TOOL_TONES.data },
    airflow: { Icon: Activity, color: TOOL_TONES.data },
    dbt: { Icon: Layers, color: TOOL_TONES.data },
    kafka: { Icon: Network, color: TOOL_TONES.data },
    splunk: { Icon: Activity, color: TOOL_TONES.security },
    wazuh: { Icon: ShieldAlert, color: TOOL_TONES.security },
    wireshark: { Icon: Network, color: TOOL_TONES.security },
    'kali linux': { Icon: Shield, color: TOOL_TONES.security },
    'burp suite': { Icon: ShieldAlert, color: TOOL_TONES.security },
    metasploit: { Icon: ShieldAlert, color: TOOL_TONES.security },
    nmap: { Icon: Network, color: TOOL_TONES.security },
    linux: { Icon: TerminalSquare, color: TOOL_TONES.devops },
    networking: { Icon: Network, color: TOOL_TONES.security },
    statistics: { Icon: LineChart, color: TOOL_TONES.viz },
    'system design': { Icon: Settings, color: TOOL_TONES.web },
    owasp: { Icon: GlobeLock, color: TOOL_TONES.security }
}

// Render the icon for a tool name with the matching brand colour.
// Wrapped in a coloured circle so the strip pills look uniform regardless
// of which icon glyph wins.
export const ToolIcon = ({ name, size = 16 }: ToolIconProps) => {
    const def = TOOL_REGISTRY[name.toLowerCase()] ?? { Icon: Sparkles, color: TOOL_TONES.fallback }
    const { Icon, color } = def
    return (
        <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{
                background: `${color}15`,
                color
            }}
            aria-hidden="true">
            <Icon size={size} />
        </div>
    )
}
