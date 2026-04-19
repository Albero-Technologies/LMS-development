import { Link } from 'react-router-dom'
import { Play, CalendarCheck, Trophy, Flame, ArrowRight, ClipboardList } from 'lucide-react'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'

const IN_PROGRESS = [
    { id: 'c1', title: 'System Design Foundations', pct: 46, nextLesson: 'L3.2 — Consistent hashing' },
    { id: 'c2', title: 'Full-stack TypeScript', pct: 78, nextLesson: 'L8 — tRPC + Zod end-to-end' },
    { id: 'c3', title: 'Data Structures in 30 days', pct: 22, nextLesson: 'L5 — Stacks, in depth' }
]

const UPCOMING = [
    { when: 'Today · 6:00 PM', title: 'Live doubt class — SQL', tone: 'brand' as const },
    { when: 'Tomorrow', title: 'Quiz · DSA Week 5', tone: 'warn' as const },
    { when: 'Thu', title: 'Assignment due · REST APIs', tone: 'default' as const }
]

export const StudentDashboard = () => {
    const user = useAuthStore((s) => s.user)
    const firstName = user?.name?.split(' ')[0] ?? 'there'

    return (
        <>
            {/* Gradient welcome banner — mirrors lms.pen student dashboard */}
            <div
                className="rounded-lg p-6 sm:p-8 mb-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{
                    background:
                        'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)'
                }}>
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-white/70">Welcome back</div>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Hi {firstName} 👋</h1>
                    <p className="mt-1.5 text-white/85 text-sm">
                        Pick up where you left off. 3 lessons queued for today.
                    </p>
                </div>
                <Link to="/app/courses">
                    <Button
                        variant="ghost"
                        className="!bg-white/15 !border-white/25 !text-white hover:!bg-white/25"
                        rightIcon={<ArrowRight size={14} />}>
                        Browse catalog
                    </Button>
                </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Active enrollments"
                    value={3}
                    icon={<CalendarCheck size={18} />}
                    accent="brand"
                />
                <StatCard
                    label="Lessons this week"
                    value={12}
                    delta="+4 vs last week"
                    tone="up"
                    icon={<Play size={18} />}
                    accent="purple"
                />
                <StatCard
                    label="Quiz average"
                    value="84%"
                    delta="+6 pts"
                    tone="up"
                    icon={<Trophy size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Streak"
                    value="9 days"
                    icon={<Flame size={18} />}
                    accent="pink"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-fg">Continue learning</h2>
                        <Link to="/app/courses">
                            <Button
                                size="sm"
                                variant="ghost"
                                rightIcon={<ArrowRight size={14} />}>
                                All courses
                            </Button>
                        </Link>
                    </div>
                    <ul className="divide-y">
                        {IN_PROGRESS.map((c) => (
                            <li
                                key={c.id}
                                className="py-4 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-fg truncate">{c.title}</div>
                                    <div className="text-xs text-fg-muted mt-0.5">Next · {c.nextLesson}</div>
                                    <div className="mt-2 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--color-brand-500)] transition-all"
                                            style={{ width: `${c.pct}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="font-mono text-xs text-fg-muted">{c.pct}%</div>
                                    <Link to={`/app/courses/${c.id}`}>
                                        <Button
                                            size="sm"
                                            className="mt-2">
                                            Resume
                                        </Button>
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <h2 className="text-base font-semibold text-fg mb-4">Upcoming</h2>
                    <ul className="space-y-3">
                        {UPCOMING.map((e) => (
                            <li
                                key={e.title}
                                className="border rounded-md p-3 flex items-start gap-3">
                                <Badge tone={e.tone}>{e.when}</Badge>
                                <div className="text-sm text-fg">{e.title}</div>
                            </li>
                        ))}
                    </ul>
                    <Link
                        to="/app/quizzes"
                        className="mt-5 block">
                        <Button
                            variant="ghost"
                            className="w-full"
                            leftIcon={<ClipboardList size={14} />}>
                            My quizzes
                        </Button>
                    </Link>
                </Card>
            </div>
        </>
    )
}
