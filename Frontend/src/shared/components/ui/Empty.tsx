import type { ReactNode } from 'react'

type Props = {
    title: string
    description?: string
    icon?: ReactNode
    action?: ReactNode
}

export const Empty = ({ title, description, icon, action }: Props) => (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
        {icon && <div className="mb-4 text-fg-muted">{icon}</div>}
        <h3 className="text-lg font-semibold text-fg">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-fg-soft max-w-md">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
)
