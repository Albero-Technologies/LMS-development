import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@shared/stores/themeStore'
import { cn } from '@shared/helpers/cn'

type Props = {
    className?: string
}

export const ThemeToggle = ({ className }: Props) => {
    const theme = useThemeStore((s) => s.theme)
    const toggle = useThemeStore((s) => s.toggle)
    const Icon = theme === 'dark' ? Sun : Moon
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn('btn btn-ghost btn-icon', className)}>
            <Icon
                size={15}
                strokeWidth={2}
            />
        </button>
    )
}
