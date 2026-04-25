import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, ArrowRight, ClipboardList, GraduationCap, IndianRupee, FileText, BookOpen } from 'lucide-react'
import { Card, StatCard } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { useAuthStore } from '@shared/stores/authStore'
import { DemoModeBanner } from '@features/dashboards/components/DemoModeBanner'
import { getMyDashboard } from '../services/dashboard.service'
import { listMyEnrollments, type Enrollment } from '@features/courses/services/enrollment.service'
import { fmtPaiseINR } from '@shared/libs/pdf'

// Real-data student dashboard. Stats come from `/dashboard/me`; the
// "Continue learning" list is fetched from `/enrollments/mine`.
export const StudentDashboard = () => {
    const user = useAuthStore((s) => s.user)
    const firstName = user?.name?.split(' ')[0] ?? 'there'

    const dashQuery = useQuery({ queryKey: ['dashboard', 'me'], queryFn: getMyDashboard, staleTime: 60_000 })
    const enrollmentsQuery = useQuery({ queryKey: ['enrollments', 'mine'], queryFn: listMyEnrollments, staleTime: 60_000 })

    const stats = dashQuery.data?.stats ?? {}
    const nextActions = dashQuery.data?.nextActions ?? []
    const enrollments = enrollmentsQuery.data ?? []

    return (
        <>
            <DemoModeBanner />

            <div
                className="rounded-lg p-6 sm:p-8 mb-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{
                    background: 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)'
                }}>
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-white/70">Welcome back</div>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Hi {firstName} 👋</h1>
                    <p className="mt-1.5 text-white/85 text-sm">
                        {(stats.activeEnrollments ?? 0) > 0
                            ? `${stats.activeEnrollments} active course(s) — pick up where you left off.`
                            : 'Browse the catalogue to enrol in your first course.'}
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
                    value={stats.activeEnrollments ?? 0}
                    icon={<CalendarCheck size={18} />}
                    accent="brand"
                />
                <StatCard
                    label="Completed courses"
                    value={stats.completedCourses ?? 0}
                    icon={<GraduationCap size={18} />}
                    accent="purple"
                />
                <StatCard
                    label="Quizzes attempted"
                    value={stats.quizzesAttempted ?? 0}
                    icon={<ClipboardList size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Pending fees"
                    value={fmtPaiseINR(stats.pendingAmount)}
                    icon={<IndianRupee size={18} />}
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
                    {enrollmentsQuery.isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                        </div>
                    ) : enrollments.length === 0 ? (
                        <Empty
                            icon={<BookOpen size={28} />}
                            title="No enrolments yet"
                            description="Browse the catalogue and enrol in a course to get started."
                        />
                    ) : (
                        <ul className="divide-y">
                            {enrollments.slice(0, 5).map((e) => (
                                <EnrollmentRow
                                    key={e.id}
                                    enrollment={e}
                                />
                            ))}
                        </ul>
                    )}
                </Card>

                <Card>
                    <h2 className="text-base font-semibold text-fg mb-4">Next actions</h2>
                    {dashQuery.isLoading ? (
                        <Skeleton className="h-16" />
                    ) : nextActions.length === 0 ? (
                        <div className="text-sm text-fg-soft py-4 text-center">All caught up.</div>
                    ) : (
                        <ul className="space-y-3">
                            {nextActions.map((a, i) => (
                                <li
                                    key={i}
                                    className="border rounded-md p-3">
                                    <Link
                                        to={a.link.startsWith('/app') ? a.link : `/app${a.link}`}
                                        className="flex items-start gap-3">
                                        <Badge tone="brand">Open</Badge>
                                        <div className="text-sm text-fg">{a.label}</div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                    {(stats.pendingInvoices ?? 0) > 0 && (
                        <Link
                            to="/app/payments"
                            className="mt-5 block">
                            <Button
                                variant="ghost"
                                className="w-full"
                                leftIcon={<FileText size={14} />}>
                                Pay {stats.pendingInvoices} pending invoice(s)
                            </Button>
                        </Link>
                    )}
                </Card>
            </div>
        </>
    )
}

const EnrollmentRow = ({ enrollment }: { enrollment: Enrollment }) => {
    const courseId = enrollment.course?.id
    const title = enrollment.course?.title ?? 'Untitled course'
    return (
        <li className="py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-fg truncate">{title}</div>
                <div className="text-xs text-fg-muted mt-0.5">Status · {enrollment.status}</div>
            </div>
            <div className="text-right shrink-0">
                {courseId && (
                    <Link to={`/app/courses/${courseId}`}>
                        <Button size="sm">Resume</Button>
                    </Link>
                )}
            </div>
        </li>
    )
}
