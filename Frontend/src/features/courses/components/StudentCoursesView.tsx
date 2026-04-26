import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, CreditCard, Search, GraduationCap, Play, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Tabs } from '@shared/components/ui/Tabs'
import { useAuthStore } from '@shared/stores/authStore'
import { formatCoursePrice, listCourses, type TCourse } from '../services/course.service'
import {
    isPaid,
    isPending,
    listMyEnrollments,
    startEnrollment,
    verifyEnrollmentPayment,
    type Enrollment,
    type StartEnrollmentResponse
} from '../services/enrollment.service'
import { openRazorpayCheckout } from '@features/payments/services/razorpay'

type Tab = 'all' | 'enrolled' | 'mine'

const TAB_DEFS: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All courses' },
    { value: 'enrolled', label: 'Enrolled' },
    { value: 'mine', label: 'My courses' }
]

export const StudentCoursesView = () => {
    const user = useAuthStore((s) => s.user)
    const queryClient = useQueryClient()
    const [tab, setTab] = useState<Tab>('all')
    const [q, setQ] = useState('')

    const coursesQuery = useQuery({
        queryKey: ['courses', 'public'],
        queryFn: () => listCourses(),
        staleTime: 60_000
    })
    const enrollmentsQuery = useQuery({
        queryKey: ['enrollments', 'mine'],
        queryFn: listMyEnrollments,
        staleTime: 30_000
    })

    const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data])
    const enrollments = useMemo(() => enrollmentsQuery.data ?? [], [enrollmentsQuery.data])

    const enrollmentByCourse = useMemo(() => {
        const m = new Map<string, Enrollment>()
        for (const e of enrollments) m.set(e.courseId, e)
        return m
    }, [enrollments])

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        const match = (c: TCourse) => !needle || c.title.toLowerCase().includes(needle) || (c.slug && c.slug.toLowerCase().includes(needle))

        if (tab === 'all') return courses.filter(match)
        if (tab === 'enrolled') {
            const ids = new Set(enrollments.filter(isPending).map((e) => e.courseId))
            return courses.filter((c) => ids.has(c.id) && match(c))
        }
        // tab === 'mine'
        const ids = new Set(enrollments.filter(isPaid).map((e) => e.courseId))
        return courses.filter((c) => ids.has(c.id) && match(c))
    }, [tab, q, courses, enrollments])

    const counts = useMemo(
        () => ({
            all: courses.length,
            enrolled: enrollments.filter(isPending).length,
            mine: enrollments.filter(isPaid).length
        }),
        [courses, enrollments]
    )

    // Two-step flow: Enrol creates a PENDING_PAYMENT enrollment without
    // opening Razorpay (so the student can confirm before being asked for
    // money). For free courses the backend activates immediately, so we
    // shortcut to "Owned" and skip the pay step.
    const enrollMutation = useMutation({
        mutationFn: async (courseId: string): Promise<{ paid: boolean; courseId: string }> => {
            const res: StartEnrollmentResponse = await startEnrollment({ courseId })
            return { paid: !!(res.free || !res.order), courseId }
        },
        onSuccess: ({ paid }) => {
            if (paid) {
                toast.success('Enrolled — your course is now in My courses.')
                setTab('mine')
            } else {
                toast.success('Enrolled. Pay to unlock the course.')
                setTab('enrolled')
            }
            void queryClient.invalidateQueries({ queryKey: ['enrollments'] })
            void queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (err: unknown) => {
            toast.error(err instanceof Error ? err.message : 'Could not enrol')
        }
    })

    // Pay step — re-issues the order via startEnrollment (idempotent for
    // PENDING_PAYMENT enrolments on the backend), opens Razorpay, then
    // verifies the handshake. Once verified, the enrollment flips to ACTIVE
    // and admin/counsellor enrolment lists pick it up via cache invalidation.
    const payMutation = useMutation({
        mutationFn: async (courseId: string): Promise<{ courseId: string }> => {
            const res: StartEnrollmentResponse = await startEnrollment({ courseId })
            if (res.free || !res.order) return { courseId }
            const handshake = await openRazorpayCheckout({
                keyId: res.order.keyId,
                orderId: res.order.id,
                amount: res.order.amount,
                currency: res.order.currency,
                invoiceNumber: res.invoice.number,
                courseTitle: courses.find((c) => c.id === courseId)?.title,
                prefill: { name: user?.name, email: user?.email }
            })
            await verifyEnrollmentPayment({
                razorpayOrderId: handshake.razorpay_order_id,
                razorpayPaymentId: handshake.razorpay_payment_id,
                razorpaySignature: handshake.razorpay_signature
            })
            return { courseId }
        },
        onSuccess: () => {
            toast.success('Payment received — course unlocked.')
            setTab('mine')
            void queryClient.invalidateQueries({ queryKey: ['enrollments'] })
            void queryClient.invalidateQueries({ queryKey: ['courses'] })
            void queryClient.invalidateQueries({ queryKey: ['payments'] })
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not complete payment'
            if (msg !== 'PAYMENT_DISMISSED') toast.error(msg)
        }
    })

    return (
        <>
            <PageHeader
                eyebrow="Catalog"
                title="Courses"
                description="Browse the catalog, enrol in any course, and pay to unlock it."
                actions={
                    <div className="w-64 hidden sm:block">
                        <Input
                            placeholder="Search courses"
                            leftIcon={<Search size={14} />}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            aria-label="Search courses"
                        />
                    </div>
                }
            />

            <Tabs<Tab>
                tabs={TAB_DEFS.map((t) => ({ ...t, count: counts[t.value] }))}
                value={tab}
                onChange={setTab}
                className="mb-4"
            />

            {coursesQuery.isLoading || enrollmentsQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <Card key={i}>
                            <Skeleton className="h-32 w-full mb-3" />
                            <Skeleton className="h-4 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </Card>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Empty
                    icon={tab === 'mine' ? <GraduationCap size={32} /> : <BookOpen size={32} />}
                    title={
                        tab === 'mine'
                            ? "You don't own any courses yet"
                            : tab === 'enrolled'
                              ? 'No pending enrolments'
                              : q
                                ? 'No matches'
                                : 'No courses available yet'
                    }
                    description={
                        tab === 'mine'
                            ? 'Enrol in a course from the All courses tab and pay to add it here.'
                            : tab === 'enrolled'
                              ? 'Click Enrol on any course to start one.'
                              : q
                                ? 'Try a different search term.'
                                : 'Check back soon — your institute will publish courses here.'
                    }
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((course) => {
                        const enrollment = enrollmentByCourse.get(course.id) ?? null
                        const enrolling = enrollMutation.isPending && enrollMutation.variables === course.id
                        const paying = payMutation.isPending && payMutation.variables === course.id
                        return (
                            <CourseCard
                                key={course.id}
                                course={course}
                                enrollment={enrollment}
                                enrolling={enrolling}
                                paying={paying}
                                onEnroll={() => enrollMutation.mutate(course.id)}
                                onPay={() => payMutation.mutate(course.id)}
                            />
                        )
                    })}
                </div>
            )}
        </>
    )
}

const CourseCard = ({
    course,
    enrollment,
    enrolling,
    paying,
    onEnroll,
    onPay
}: {
    course: TCourse
    enrollment: Enrollment | null
    enrolling: boolean
    paying: boolean
    onEnroll: () => void
    onPay: () => void
}) => {
    const owned = enrollment ? isPaid(enrollment) : false
    const pending = enrollment ? isPending(enrollment) : false
    const price = formatCoursePrice(course.price, course.currency)

    return (
        <Card className="!p-0 overflow-hidden flex flex-col">
            <div className="aspect-[16/9] bg-surface-2 relative">
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-fg-muted">
                        <BookOpen size={32} />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    {owned ? (
                        <Badge tone="ok">
                            <Check size={10} /> Owned
                        </Badge>
                    ) : pending ? (
                        <Badge tone="warn">Enrolled · pay to unlock</Badge>
                    ) : (
                        <Badge>{price}</Badge>
                    )}
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-fg">{course.title}</h3>
                {course.description && <p className="mt-1 text-xs text-fg-soft line-clamp-2">{course.description}</p>}
                <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-sm text-fg">{price}</span>
                    {owned ? (
                        <Link to={`/app/courses/${course.id}`}>
                            <Button
                                size="sm"
                                leftIcon={<Play size={12} />}>
                                Open course
                            </Button>
                        </Link>
                    ) : pending ? (
                        <Button
                            size="sm"
                            leftIcon={<CreditCard size={12} />}
                            loading={paying}
                            onClick={onPay}>
                            Pay now
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            loading={enrolling}
                            onClick={onEnroll}>
                            Enrol
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}
