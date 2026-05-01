// Student-side batches view. Reads my enrollments and surfaces the batches I
// belong to (one card per active batch). Read-only: trainers/admins assign
// students to batches; the student just sees their cohort + start date here.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, BookOpen, ArrowRight } from 'lucide-react'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { listMyEnrollments, type Enrollment } from '@features/courses/services/enrollment.service'

const fmtDate = (iso: string | null): string => {
    if (!iso) return 'TBD'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const StudentBatchesPage = () => {
    const enrollmentsQuery = useQuery({
        queryKey: ['enrollments', 'mine'],
        queryFn: listMyEnrollments,
        staleTime: 30_000
    })

    // Only count active/completed enrolments that are actually assigned to a
    // batch. Pending-payment rows or unassigned active rows aren't shown here
    // — they'd just confuse the user since "my batches" implies cohort
    // membership.
    const myBatches = useMemo<Enrollment[]>(() => {
        const rows = enrollmentsQuery.data ?? []
        return rows.filter((e) => e.batch && (e.status === 'ACTIVE' || e.status === 'COMPLETED'))
    }, [enrollmentsQuery.data])

    return (
        <>
            <PageHeader
                eyebrow="My learning"
                title="My Batches"
                description="The cohorts you've been assigned to. Your trainer manages who's in which batch."
            />

            {enrollmentsQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <Card key={i}>
                            <Skeleton className="h-10 w-10 rounded-md mb-3" />
                            <Skeleton className="h-5 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </Card>
                    ))}
                </div>
            ) : myBatches.length === 0 ? (
                <Empty
                    icon={<CalendarCheck size={36} />}
                    title="You're not in a batch yet"
                    description="Once you've enrolled in a course and your trainer adds you to a cohort, it'll show up here."
                    action={
                        <Link to="/app/courses">
                            <Button leftIcon={<BookOpen size={14} />}>Browse courses</Button>
                        </Link>
                    }
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myBatches.map((e) => {
                        const batch = e.batch!
                        const course = e.course
                        return (
                            <Card
                                key={e.id}
                                className="flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center">
                                        <CalendarCheck size={18} />
                                    </div>
                                    <Badge tone={e.status === 'COMPLETED' ? 'ok' : 'brand'}>
                                        {e.status === 'COMPLETED' ? 'Completed' : 'Active'}
                                    </Badge>
                                </div>
                                <h3 className="text-base font-semibold text-fg">{batch.name}</h3>
                                <div className="text-[11px] text-fg-muted font-mono mb-2">{batch.code}</div>
                                {course && <div className="text-sm text-fg-soft truncate">{course.title}</div>}
                                <div className="mt-1 text-[11px] text-fg-muted">Starts {fmtDate(batch.startDate)}</div>
                                <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-brand-500)] transition-all"
                                        style={{ width: `${e.progressPct ?? 0}%` }}
                                    />
                                </div>
                                <div className="text-[11px] text-fg-muted mt-1">{e.progressPct ?? 0}% complete</div>
                                {course && (
                                    <div className="mt-4">
                                        <Link to={`/app/courses/${course.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full"
                                                rightIcon={<ArrowRight size={14} />}>
                                                Open course
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}
        </>
    )
}
