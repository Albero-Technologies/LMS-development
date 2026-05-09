import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Lock, Clock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { listMyEnrollments, type Enrollment } from '@features/courses/services/enrollment.service'

// Sticky strip rendered above the AppLayout navbar for STUDENT users who
// have any DEMO-tier enrolment. Shows:
//   - "Demo access" label + course title
//   - Live countdown to demoExpiresAt (DDd HHh MMm SSs) when set,
//     or just "Pay the balance to unlock" when no expiry
//   - Real outstanding balance from course.price - paid (computed by
//     the backend; we just render it)
//   - "Complete payment" CTA → /app/payments
// Hides itself when the student is FULL on every enrolment, or when
// rendered outside a STUDENT role.

const fmtTimeRemaining = (target: number): string => {
    const ms = target - Date.now()
    if (ms <= 0) return '0d 00h 00m 00s'
    const totalSec = Math.floor(ms / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    const secs = totalSec % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`
}

const fmtINR = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export const DemoCountdownStrip = () => {
    const role = useAuthStore((s) => s.user?.role)
    const isStudent = role === ROLES.STUDENT

    const enrollmentsQuery = useQuery({
        queryKey: ['enrollments', 'mine'],
        queryFn: listMyEnrollments,
        enabled: isStudent,
        staleTime: 60_000
    })

    const demoEnrolment = useMemo<Enrollment | null>(() => {
        const list = enrollmentsQuery.data ?? []
        // Surface the most-urgent demo enrolment: prefer the one with the
        // soonest expiry, falling back to the first DEMO row.
        const demos = list.filter((e) => e.accessTier === 'DEMO')
        if (demos.length === 0) return null
        const withExpiry = demos.filter((e) => e.demoExpiresAt)
        if (withExpiry.length > 0) {
            return withExpiry.sort((a, b) => new Date(a.demoExpiresAt!).getTime() - new Date(b.demoExpiresAt!).getTime())[0]
        }
        return demos[0]
    }, [enrollmentsQuery.data])

    // Re-render every second so the countdown ticks. Only mount the timer
    // when we actually have an expiry to count down — otherwise the strip
    // shows a static "balance pending" message and we can save the cycles.
    const expiresAt = demoEnrolment?.demoExpiresAt ? new Date(demoEnrolment.demoExpiresAt).getTime() : null
    const [, setTick] = useState(0)
    useEffect(() => {
        if (!expiresAt) return
        const id = setInterval(() => setTick((t) => t + 1), 1000)
        return () => clearInterval(id)
    }, [expiresAt])

    if (!isStudent) return null
    if (!demoEnrolment) return null

    const balance = demoEnrolment.impliedBalanceMinor ?? 0
    const expired = expiresAt !== null && expiresAt <= Date.now()
    const courseTitle = demoEnrolment.course?.title ?? 'your course'

    // Two visual modes — urgent (red, expired or < 24h) vs. nudge (amber).
    const isUrgent = expired || (expiresAt !== null && expiresAt - Date.now() < 24 * 3600 * 1000)
    const bg = isUrgent
        ? 'linear-gradient(90deg, var(--color-danger,#ef4444) 0%, #f97316 100%)'
        : 'linear-gradient(90deg, var(--color-warn,#f59e0b) 0%, #f97316 100%)'

    return (
        <div
            role="status"
            className="w-full text-white shadow-sm"
            style={{ background: bg }}>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12.5px] sm:text-[13px]">
                <div className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.12em] text-[10.5px]">
                    <Lock size={12} /> Demo access
                </div>
                <span className="hidden sm:inline opacity-50">·</span>
                <span className="font-medium truncate max-w-[60vw] sm:max-w-none">
                    {courseTitle}
                </span>
                {expiresAt !== null && (
                    <>
                        <span className="hidden sm:inline opacity-50">·</span>
                        <span className="inline-flex items-center gap-1.5 font-mono">
                            <Clock size={12} />
                            {expired ? 'Expired' : fmtTimeRemaining(expiresAt)}
                        </span>
                    </>
                )}
                {balance > 0 && (
                    <>
                        <span className="hidden sm:inline opacity-50">·</span>
                        <span className="font-semibold">
                            {fmtINR(balance)} balance due
                        </span>
                    </>
                )}
                <Link
                    to="/app/payments"
                    className="inline-flex items-center gap-1 ml-1 px-3 py-1 rounded-full text-[11.5px] font-semibold transition-transform hover:translate-y-[-1px]"
                    style={{ background: 'rgba(255,255,255,0.95)', color: isUrgent ? '#b91c1c' : '#92400e' }}>
                    Complete payment <ArrowRight size={11} />
                </Link>
            </div>
        </div>
    )
}
