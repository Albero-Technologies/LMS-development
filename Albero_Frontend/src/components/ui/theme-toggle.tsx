import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '@/hooks/useTheme'

interface ThemeToggleProps {
    size?: 'sm' | 'md'
    className?: string
}

export function ThemeToggle({ size = 'md', className = '' }: ThemeToggleProps) {
    const { theme, toggle } = useTheme()
    const isDark = theme === 'dark'
    const dim = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
    const icon = size === 'sm' ? 14 : 16

    return (
        <button
            onClick={toggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`relative ${dim} rounded-full inline-flex items-center justify-center transition-all duration-300 ${className}`}
            style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                color: 'var(--text-primary)'
            }}>
            <AnimatePresence
                mode="wait"
                initial={false}>
                <motion.span
                    key={theme}
                    initial={{ y: -8, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 8, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center justify-center">
                    {isDark ? <Sun size={icon} /> : <Moon size={icon} />}
                </motion.span>
            </AnimatePresence>
        </button>
    )
}
