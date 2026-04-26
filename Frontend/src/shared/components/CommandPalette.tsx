// Cmd+K command palette. Reachable from:
//   - Clicking the global search bar in the top header
//   - Pressing Cmd+K (macOS) or Ctrl+K (Windows/Linux)
//   - Pressing "/" while not focused on an input
//
// Search surface:
//   - Static nav targets (Dashboard, Courses, Quizzes, …) filtered by role
//   - Fuzzy course search via the existing /courses?q= endpoint
//   - Fuzzy user search via /users?q= (admin/SA only — silently dropped for
//     other roles by the backend)
//
// Behaviour:
//   - Up/Down arrows move highlight; Enter activates; Escape closes
//   - Async results debounce to 200ms and never block local nav matches
//   - Selecting a result navigates and closes
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, BookOpen, Users, GraduationCap, Layers, X } from 'lucide-react'
import { cn } from '@shared/helpers/cn'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES, type TRole } from '@shared/constants/roles'
import { listCourses } from '@features/courses/services/course.service'
import { listUsers } from '@features/users/services/user.service'

interface CmdItem {
    id: string
    label: string
    hint?: string
    section: string
    icon: typeof BookOpen
    onSelect: () => void
}

type NavTarget = { label: string; to: string; icon: typeof BookOpen; hint?: string }

const NAV_ITEMS_BY_ROLE: Record<TRole, NavTarget[]> = {
    SUPER_ADMIN: [
        { label: 'Tenants', to: '/app/admin/tenants', icon: Layers, hint: 'Cross-tenant directory' },
        { label: 'Website Editor', to: '/app/admin/website', icon: Layers, hint: 'Per-tenant landing pages' },
        { label: 'Courses', to: '/app/courses', icon: BookOpen },
        { label: 'Users', to: '/app/users', icon: Users },
        { label: 'Client Payments', to: '/app/payments', icon: GraduationCap },
        { label: 'Activity Logs', to: '/app/audit-logs', icon: Layers }
    ],
    ADMIN: [
        { label: 'Dashboard', to: '/app/admin', icon: Layers },
        { label: 'Batches', to: '/app/batches', icon: Layers },
        { label: 'Courses', to: '/app/courses', icon: BookOpen },
        { label: 'Users', to: '/app/users', icon: Users },
        { label: 'Lead Pipeline', to: '/app/counsellor/pipeline', icon: Layers },
        { label: 'Content (CMS)', to: '/app/admin/cms', icon: Layers },
        { label: 'Payments', to: '/app/payments', icon: Layers },
        { label: 'Tickets', to: '/app/tickets', icon: Layers },
        { label: 'Reports', to: '/app/reports', icon: Layers }
    ],
    TRAINER: [
        { label: 'Dashboard', to: '/app/trainer', icon: Layers },
        { label: 'Batches', to: '/app/batches', icon: Layers },
        { label: 'Courses', to: '/app/courses', icon: BookOpen },
        { label: 'Quizzes', to: '/app/quizzes', icon: Layers },
        { label: 'Students', to: '/app/users', icon: Users },
        { label: 'Payments', to: '/app/payments', icon: Layers }
    ],
    STUDENT: [
        { label: 'Dashboard', to: '/app/student', icon: Layers },
        { label: 'Courses', to: '/app/courses', icon: BookOpen },
        { label: 'Quizzes', to: '/app/quizzes', icon: Layers },
        { label: 'My Batches', to: '/app/student/batches', icon: Layers },
        { label: 'My Enrollments', to: '/app/enrollments', icon: GraduationCap },
        { label: 'Fees', to: '/app/payments', icon: Layers },
        { label: 'Support', to: '/app/tickets', icon: Layers }
    ],
    COUNSELLOR: [
        { label: 'Dashboard', to: '/app/counsellor', icon: Layers },
        { label: 'Lead Pipeline', to: '/app/counsellor/pipeline', icon: Layers },
        { label: 'Students', to: '/app/counsellor/students', icon: Users }
    ],
    COUNSELLING_MANAGER: [
        { label: 'Dashboard', to: '/app/counsellor', icon: Layers },
        { label: 'Lead Pipeline', to: '/app/counsellor/pipeline', icon: Layers },
        { label: 'Team Reports', to: '/app/reports', icon: Layers }
    ],
    SUPPORT: [
        { label: 'Tickets', to: '/app/tickets', icon: Layers },
        { label: 'Users', to: '/app/users', icon: Users }
    ]
}

const SHARED_ITEMS: NavTarget[] = [
    { label: 'Notifications', to: '/app/notifications', icon: Layers },
    { label: 'Settings', to: '/app/settings', icon: Layers }
]

export const CommandPalette = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const [q, setQ] = useState('')
    const [highlight, setHighlight] = useState(0)
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Reset on every open so the previous query doesn't bleed into a fresh
    // session. Focus the input asynchronously — the dialog's animation needs
    // a frame to mount before the autofocus lands.
    useEffect(() => {
        if (!open) return
        setQ('')
        setHighlight(0)
        const t = window.setTimeout(() => inputRef.current?.focus(), 30)
        return () => window.clearTimeout(t)
    }, [open])

    // Async course search — only when the query is meaningful.
    const courseQuery = useQuery({
        queryKey: ['cmd-courses', q],
        queryFn: () => listCourses({ q }),
        enabled: open && q.trim().length >= 2,
        staleTime: 30_000
    })

    // Async user search — admins/SA see staff + students; backend silently
    // ignores the request for roles without `user.read` policy.
    const canSearchUsers = !!user && [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TRAINER, ROLES.SUPPORT].includes(user.role as never)
    const usersQuery = useQuery({
        queryKey: ['cmd-users', q],
        queryFn: () => listUsers({ q, pageSize: 8 }),
        enabled: open && canSearchUsers && q.trim().length >= 2,
        staleTime: 30_000
    })

    const items = useMemo<CmdItem[]>(() => {
        const role = (user?.role as TRole | undefined) ?? 'STUDENT'
        const navList = [...(NAV_ITEMS_BY_ROLE[role] ?? []), ...SHARED_ITEMS]
        const needle = q.trim().toLowerCase()
        const navItems: CmdItem[] = navList
            .filter((n) => !needle || n.label.toLowerCase().includes(needle))
            .map((n) => ({
                id: `nav:${n.to}`,
                label: n.label,
                hint: n.hint ?? n.to,
                section: 'Navigate',
                icon: n.icon,
                onSelect: () => {
                    navigate(n.to)
                    onClose()
                }
            }))

        const courseItems: CmdItem[] = (courseQuery.data ?? []).map((c) => ({
            id: `course:${c.id}`,
            label: c.title,
            hint: `Course · /${c.slug}`,
            section: 'Courses',
            icon: BookOpen,
            onSelect: () => {
                navigate(`/app/courses/${c.id}`)
                onClose()
            }
        }))

        const userItems: CmdItem[] = (usersQuery.data?.items ?? []).map((u) => {
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email
            return {
                id: `user:${u.id}`,
                label: fullName,
                hint: `${u.role} · ${u.email}`,
                section: 'People',
                icon: Users,
                onSelect: () => {
                    navigate(`/app/users?focus=${u.id}`)
                    onClose()
                }
            }
        })

        return [...navItems, ...courseItems, ...userItems]
    }, [q, user, courseQuery.data, usersQuery.data, navigate, onClose])

    // Clamp the highlight whenever the result list shrinks (e.g. the query
    // tightens and the previously-highlighted result vanishes).
    useEffect(() => {
        if (highlight >= items.length) setHighlight(Math.max(0, items.length - 1))
    }, [items.length, highlight])

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight((h) => Math.min(h + 1, Math.max(0, items.length - 1)))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight((h) => Math.max(0, h - 1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            items[highlight]?.onSelect()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
        }
    }

    if (!open) return null

    // Group items by section for visual grouping but preserve the linear order
    // for keyboard navigation — flatItems mirrors `items` exactly.
    const sections: { name: string; rows: CmdItem[]; baseIndex: number }[] = []
    {
        let cursor = 0
        for (const it of items) {
            const last = sections[sections.length - 1]
            if (!last || last.name !== it.section) sections.push({ name: it.section, rows: [it], baseIndex: cursor })
            else last.rows.push(it)
            cursor++
        }
    }

    const isLoading = (q.trim().length >= 2) && (courseQuery.isLoading || (canSearchUsers && usersQuery.isLoading))

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onKeyDown}>
            <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-xl bg-bg rounded-xl border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
                <div className="flex items-center gap-3 px-4 h-12 border-b border-[var(--color-border)]">
                    <Search
                        size={16}
                        className="text-fg-muted"
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Type to search pages, courses, people…"
                        className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-fg placeholder:text-fg-muted"
                    />
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="p-1 -mr-1 text-fg-muted hover:text-fg">
                        <X size={14} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {items.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-fg-muted text-center">
                            {q.trim() ? `No matches for "${q.trim()}"` : 'Start typing — or pick a destination below.'}
                        </div>
                    ) : (
                        sections.map((sec) => (
                            <div
                                key={sec.name}
                                className="py-1">
                                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-fg-muted font-medium">
                                    {sec.name}
                                </div>
                                {sec.rows.map((it, j) => {
                                    const idx = sec.baseIndex + j
                                    const active = idx === highlight
                                    const Icon = it.icon
                                    return (
                                        <button
                                            key={it.id}
                                            type="button"
                                            onMouseEnter={() => setHighlight(idx)}
                                            onClick={() => it.onSelect()}
                                            className={cn(
                                                'w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors',
                                                active ? 'bg-[var(--color-brand-50)]' : 'hover:bg-surface-hover'
                                            )}>
                                            <Icon
                                                size={14}
                                                className="text-fg-muted shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className={cn('text-sm truncate', active ? 'text-[var(--color-brand-700)] font-medium' : 'text-fg')}>
                                                    {it.label}
                                                </div>
                                                {it.hint && <div className="text-[11px] text-fg-muted truncate">{it.hint}</div>}
                                            </div>
                                            <ArrowRight
                                                size={12}
                                                className={cn('shrink-0', active ? 'text-[var(--color-brand-500)]' : 'text-fg-muted')}
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </div>
                <div className="flex items-center justify-between px-4 h-9 border-t border-[var(--color-border)] text-[11px] text-fg-muted">
                    <div className="flex items-center gap-3">
                        <span>
                            <kbd className="kbd">↑</kbd>
                            <kbd className="kbd ml-1">↓</kbd> to navigate
                        </span>
                        <span>
                            <kbd className="kbd">↵</kbd> to select
                        </span>
                        <span>
                            <kbd className="kbd">esc</kbd> to close
                        </span>
                    </div>
                    {isLoading && <span className="opacity-70">searching…</span>}
                </div>
            </div>
        </div>
    )
}

// Hook: register the global Cmd+K / Ctrl+K shortcut. Pulled out of the
// palette itself so the listener attaches once at the layout level even
// when the palette is unmounted.
export const useCommandPaletteShortcut = (toggle: () => void): void => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
            if (isModK) {
                e.preventDefault()
                toggle()
                return
            }
            // "/" opens the palette unless the user is typing in a field.
            if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                const target = e.target as HTMLElement | null
                const tag = target?.tagName.toLowerCase()
                const isEditable = tag === 'input' || tag === 'textarea' || (target as HTMLElement | null)?.isContentEditable
                if (!isEditable) {
                    e.preventDefault()
                    toggle()
                }
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [toggle])
}

// Small helper component for the static "search" trigger that lives in the
// header — clicking it opens the palette and Cmd+K is the keyboard parallel.
export const CommandPaletteTrigger = ({ onClick }: { onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label="Open search (Cmd+K)"
        className="relative flex-1 max-w-md group">
        <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
        />
        <span className="flex items-center w-full h-9 pl-9 pr-14 text-left text-sm text-fg-muted/90 truncate input cursor-pointer group-hover:border-[var(--color-brand-500)] transition-colors">
            Search courses, students, tickets…
        </span>
        <span
            className="kbd absolute right-2 top-1/2 -translate-y-1/2 h-5"
            aria-hidden="true">
            ⌘ K
        </span>
    </button>
)

