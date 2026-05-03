import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, GraduationCap, FileText, FlaskConical, Layers, ScrollText } from 'lucide-react'
import { cn } from '@shared/helpers/cn'
import { CmsPage } from './CmsPage'

// Resource hub — one tab per resource collection on the public site. Each
// tab swaps the locked collection slug and CmsPage's auto-select effect
// re-targets the correct rows. The active tab is persisted in the URL
// (?tab=tutorials) so refreshing or sharing a link doesn't drop you back
// to the first tab.
type TabKey = 'blog' | 'tutorials' | 'soft-skills' | 'case-studies' | 'interview-guides' | 'cheatsheets'

interface TabDef {
    key: TabKey
    label: string
    icon: React.ComponentType<{ size?: number }>
    description: string
}

const TABS: TabDef[] = [
    { key: 'blog', label: 'Blogs', icon: FileText, description: 'Long-form articles surfaced on /resources/blogs.' },
    { key: 'tutorials', label: 'Tutorials', icon: BookOpen, description: 'Step-by-step coding walkthroughs at /resources/tutorials.' },
    {
        key: 'soft-skills',
        label: 'Soft Skills',
        icon: GraduationCap,
        description: 'Communication, leadership, and interview-polish sessions at /resources/soft-skills.'
    },
    {
        key: 'case-studies',
        label: 'Case Studies',
        icon: FlaskConical,
        description: 'Real-world business problems broken down end-to-end at /resources/case-studies.'
    },
    {
        key: 'interview-guides',
        label: 'Interview Guides',
        icon: Layers,
        description: 'Company-specific prep for MAANG, IB & product roles at /resources/interview-guides.'
    },
    { key: 'cheatsheets', label: 'CheatSheets', icon: ScrollText, description: 'One-pagers for revising key concepts at /resources/cheatsheet.' }
]

const DEFAULT_TAB: TabKey = 'blog'

export const ResourcesCmsPage = () => {
    const [params, setParams] = useSearchParams()
    const initial = (params.get('tab') as TabKey | null) ?? DEFAULT_TAB
    const [active, setActive] = useState<TabKey>(TABS.some((t) => t.key === initial) ? initial : DEFAULT_TAB)

    // Keep ?tab in the URL in sync with the active tab. We replace (not push)
    // so back-button doesn't get spammed with one entry per click.
    useEffect(() => {
        if (params.get('tab') !== active) {
            const next = new URLSearchParams(params)
            next.set('tab', active)
            setParams(next, { replace: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    const tab = TABS.find((t) => t.key === active) ?? TABS[0]

    return (
        <>
            <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-[var(--color-border)]">
                {TABS.map((t) => {
                    const Icon = t.icon
                    const isActive = t.key === active
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setActive(t.key)}
                            className={cn(
                                'inline-flex items-center gap-2 px-3 py-2 text-sm border-b-2 -mb-px transition-colors',
                                isActive
                                    ? 'border-[var(--color-brand-500)] text-[var(--color-brand-700)] font-semibold'
                                    : 'border-transparent text-fg-soft hover:text-fg'
                            )}>
                            <Icon size={14} />
                            {t.label}
                        </button>
                    )
                })}
            </div>
            <CmsPage
                key={tab.key}
                lockedCollectionSlug={tab.key}
                headerEyebrow="Public site · Resources"
                headerTitle={tab.label}
                headerDescription={tab.description}
            />
        </>
    )
}
