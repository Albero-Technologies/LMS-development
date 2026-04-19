import { Link, useNavigate } from 'react-router-dom'
import { Video, ClipboardCheck, BookOpen, Activity, Plus, ArrowRight } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'

const PENDING = [
    { id: 1, title: 'Assignment · REST Design', count: '8 submissions pending', to: '/app/courses', tone: 'warn' as const },
    { id: 2, title: 'Quiz · DSA Week 5', count: 'Publishing tomorrow', to: '/app/quizzes', tone: 'brand' as const },
    { id: 3, title: 'Lesson · Error handling in Node', count: 'Draft', to: '/app/courses', tone: 'default' as const }
]

export const TrainerDashboard = () => {
    const navigate = useNavigate()
    return (
        <>
            <PageHeader
                eyebrow="Teaching"
                title="Your classroom at a glance"
                description="Courses, quizzes, and today's sessions in one place."
                actions={
                    <>
                        <Link to="/app/quizzes">
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Plus size={14} />}>
                                New quiz
                            </Button>
                        </Link>
                        <Link to="/app/courses">
                            <Button
                                size="sm"
                                leftIcon={<Plus size={14} />}>
                                New course
                            </Button>
                        </Link>
                    </>
                }
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Students assigned"
                    value={132}
                    icon={<Activity size={18} />}
                    accent="brand"
                />
                <StatCard
                    label="Lessons published"
                    value={58}
                    icon={<BookOpen size={18} />}
                    accent="purple"
                />
                <StatCard
                    label="Quizzes"
                    value={21}
                    icon={<ClipboardCheck size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Next live class"
                    value="6:00 PM"
                    delta="in 3h 12m"
                    icon={<Video size={18} />}
                    accent="pink"
                />
            </div>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-fg">Drafts & pending grading</h2>
                    <Button
                        size="sm"
                        variant="ghost"
                        rightIcon={<ArrowRight size={14} />}
                        onClick={() => navigate('/app/courses')}>
                        All courses
                    </Button>
                </div>
                <ul className="divide-y">
                    {PENDING.map((t) => (
                        <li
                            key={t.id}
                            className="py-4 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-fg">{t.title}</div>
                                <div className="text-xs text-fg-muted mt-0.5">{t.count}</div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Badge tone={t.tone}>{t.tone === 'warn' ? 'Needs grading' : t.tone === 'brand' ? 'Scheduled' : 'Draft'}</Badge>
                                <Link to={t.to}>
                                    <Button
                                        size="sm"
                                        variant="ghost">
                                        Open
                                    </Button>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </>
    )
}
