import type { ReactNode } from 'react'

type Props = {
    eyebrow?: string
    title: string
    description?: string
    actions?: ReactNode
}

export const PageHeader = ({ eyebrow, title, description, actions }: Props) => (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
            {eyebrow && (
                <div className="text-xs uppercase tracking-wider text-fg-muted font-medium mb-2">{eyebrow}</div>
            )}
            <h1 className="text-2xl font-bold text-fg tracking-tight">{title}</h1>
            {description && <p className="mt-1.5 text-sm text-fg-soft max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </header>
)
