import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, BookOpen, Activity, Plus, ArrowRight, FileText } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getMyDashboard } from '../services/dashboard.service'

// Real-data trainer dashboard — `/dashboard/me` returns this trainer's owned
// course count, draft count, and active student count from the backend.
export const TrainerDashboard = () => {
    const dashQuery = useQuery({ queryKey: ['dashboard', 'me'], queryFn: getMyDashboard, staleTime: 60_000 })
    const stats = dashQuery.data?.stats ?? {}
    const nextActions = dashQuery.data?.nextActions ?? []

    return (
        <>
            <PageHeader
                eyebrow="Teaching"
                title="Your classroom at a glance"
                description="Real-time totals for the courses you own."
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

            {dashQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-24"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="My courses"
                        value={stats.myCourses ?? 0}
                        delta={`${stats.draftCourses ?? 0} draft`}
                        icon={<BookOpen size={18} />}
                        accent="brand"
                    />
                    <StatCard
                        label="Active students"
                        value={stats.activeStudents ?? 0}
                        icon={<Activity size={18} />}
                        accent="purple"
                    />
                    <StatCard
                        label="Pending quizzes"
                        value={stats.pendingQuizzes ?? 0}
                        icon={<ClipboardCheck size={18} />}
                        accent="orange"
                    />
                    <StatCard
                        label="Drafts"
                        value={stats.draftCourses ?? 0}
                        icon={<FileText size={18} />}
                        accent="pink"
                    />
                </div>
            )}

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-fg">Next actions</h2>
                    <Link to="/app/courses">
                        <Button
                            size="sm"
                            variant="ghost"
                            rightIcon={<ArrowRight size={14} />}>
                            All courses
                        </Button>
                    </Link>
                </div>
                {nextActions.length === 0 ? (
                    <div className="text-sm text-fg-soft py-4 text-center">Nothing waiting on you.</div>
                ) : (
                    <ul className="space-y-2.5">
                        {nextActions.map((a, i) => (
                            <li key={i}>
                                <Link
                                    to={a.link.startsWith('/app') ? a.link : `/app${a.link}`}
                                    className="w-full border rounded-md p-3 flex items-center justify-between hover:bg-surface-hover transition-colors text-left">
                                    <span className="text-sm text-fg">{a.label}</span>
                                    <Badge tone="brand">Open</Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </>
    )
}
