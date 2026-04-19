import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@shared/helpers/cn'

type Tone = 'default' | 'brand' | 'ok' | 'warn' | 'danger' | 'purple'
type Props = HTMLAttributes<HTMLSpanElement> & { tone?: Tone; children: ReactNode }

const TONE: Record<Tone, string> = {
    default: '',
    brand: 'badge-brand',
    ok: 'badge-ok',
    warn: 'badge-warn',
    danger: 'badge-danger',
    purple: 'badge-purple'
}

export const Badge = ({ tone = 'default', className, children, ...rest }: Props) => (
    <span
        className={cn('badge', TONE[tone], className)}
        {...rest}>
        {children}
    </span>
)
