// Counsellor + Manager students view. Each row is a StudentSignup the
// counsellor brought in via a shareable link, with quick access to:
//   - their courses + progress (from enrollments)
//   - fee status (paid / pending)
//   - share credentials (re-emails the initial password)
//   - open the full detail modal (profile + edit + fees + enrolments)
//
// Managers see the union across their team's students.
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, GraduationCap, Send, Eye, KeyRound, BookOpen, Users } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Modal } from '@shared/components/ui/Modal'
import { fmtPaiseINR, fmtDate } from '@shared/libs/pdf'
import { listMyStudents, shareStudentCreds, type MyStudent, type SharedCreds } from '../services/counsellor.service'
import { UserDetailModal } from '@features/users/components/UserDetailModal'

export const CounsellorStudentsPage = () => {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [openDetailId, setOpenDetailId] = useState<string | null>(null)
    const [credsModal, setCredsModal] = useState<{ student: MyStudent; creds: SharedCreds } | null>(null)

    const studentsQuery = useQuery({
        queryKey: ['counsellor', 'students'],
        queryFn: listMyStudents,
        staleTime: 30_000
    })

    const filtered = useMemo(() => {
        const list = studentsQuery.data ?? []
        const q = search.trim().toLowerCase()
        if (!q) return list
        return list.filter((s) =>
            [s.firstName, s.lastName, s.email, s.phone ?? '']
                .filter(Boolean)
                .map((v) => v.toLowerCase())
                .some((v) => v.includes(q))
        )
    }, [studentsQuery.data, search])

    const totals = useMemo(() => {
        const list = studentsQuery.data ?? []
        return {
            count: list.length,
            paid: list.reduce((n, s) => n + s.payments.totalPaid, 0),
            outstanding: list.reduce((n, s) => n + s.payments.pendingAmount, 0)
        }
    }, [studentsQuery.data])

    const shareMutation = useMutation({
        mutationFn: (signupId: string) => shareStudentCreds(signupId),
        onSuccess: (creds, signupId) => {
            const student = (studentsQuery.data ?? []).find((s) => s.signupId === signupId)
            if (student) setCredsModal({ student, creds })
            void queryClient.invalidateQueries({ queryKey: ['counsellor', 'students'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not fetch credentials')
    })

    return (
        <>
            <PageHeader
                eyebrow="Your students"
                title="Students"
                description="Everyone you've enrolled via a share-link. Click a row for the full profile, fees, and enrolments."
                actions={
                    <div className="w-72">
                        <Input
                            placeholder="Search by name, email, phone"
                            leftIcon={<Search size={14} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search students"
                        />
                    </div>
                }
            />

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <KpiTile
                    label="Students"
                    value={totals.count}
                    icon={<Users size={16} />}
                />
                <KpiTile
                    label="Total paid"
                    value={fmtPaiseINR(totals.paid)}
                    icon={<GraduationCap size={16} />}
                />
                <KpiTile
                    label="Outstanding"
                    value={fmtPaiseINR(totals.outstanding)}
                    icon={<GraduationCap size={16} />}
                />
            </div>

            {studentsQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : filtered.length === 0 ? (
                <Empty
                    icon={<GraduationCap size={32} />}
                    title={search ? 'No matches' : 'No students yet'}
                    description={search ? 'Try a different search.' : "When someone signs up via your shareable link, they'll appear here."}
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted bg-surface-2">
                                    <th className="py-3 px-5">Student</th>
                                    <th className="py-3 px-5">Joined</th>
                                    <th className="py-3 px-5">Courses</th>
                                    <th className="py-3 px-5">Progress</th>
                                    <th className="py-3 px-5">Fees</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((s) => (
                                    <StudentRow
                                        key={s.signupId}
                                        student={s}
                                        onOpenDetail={() => s.studentId && setOpenDetailId(s.studentId)}
                                        onShareCreds={() => shareMutation.mutate(s.signupId)}
                                        sharing={shareMutation.isPending && shareMutation.variables === s.signupId}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <UserDetailModal
                open={!!openDetailId}
                userId={openDetailId}
                canEdit
                onClose={() => setOpenDetailId(null)}
            />

            <CredsModal
                state={credsModal}
                onClose={() => setCredsModal(null)}
            />
        </>
    )
}

const StudentRow = ({
    student,
    onOpenDetail,
    onShareCreds,
    sharing
}: {
    student: MyStudent
    onOpenDetail: () => void
    onShareCreds: () => void
    sharing: boolean
}) => {
    const fullName = `${student.firstName} ${student.lastName}`.trim() || student.email
    const enrolments = student.enrollments
    // Show top-2 courses inline; rest are visible in the detail modal.
    const visibleCourses = enrolments.slice(0, 2)
    const moreCount = Math.max(0, enrolments.length - visibleCourses.length)
    // Average progress across active enrolments — quick health glance.
    const avgProgress = enrolments.length > 0 ? Math.round(enrolments.reduce((n, e) => n + (e.progressPct ?? 0), 0) / enrolments.length) : null

    return (
        <tr
            className="hover:bg-surface-hover cursor-pointer"
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return
                onOpenDetail()
            }}>
            <td className="py-3 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-500)] text-white text-xs flex items-center justify-center font-semibold">
                        {fullName[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-fg font-medium truncate">{fullName}</div>
                        <div className="text-xs text-fg-muted truncate">{student.email}</div>
                    </div>
                </div>
            </td>
            <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(student.createdAt)}</td>
            <td className="py-3 px-5">
                {enrolments.length === 0 ? (
                    <span className="text-xs text-fg-muted">—</span>
                ) : (
                    <div className="flex flex-col gap-1">
                        {visibleCourses.map((e) => (
                            <span
                                key={e.id}
                                className="text-xs text-fg inline-flex items-center gap-1.5">
                                <BookOpen
                                    size={11}
                                    className="text-fg-muted"
                                />
                                <span className="truncate">{e.course?.title ?? '—'}</span>
                            </span>
                        ))}
                        {moreCount > 0 && <span className="text-[11px] text-fg-muted">+{moreCount} more</span>}
                    </div>
                )}
            </td>
            <td className="py-3 px-5">
                {avgProgress === null ? (
                    <span className="text-xs text-fg-muted">—</span>
                ) : (
                    <div className="w-24">
                        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--color-brand-500)] transition-all"
                                style={{ width: `${avgProgress}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-fg-muted mt-0.5 font-mono">{avgProgress}%</div>
                    </div>
                )}
            </td>
            <td className="py-3 px-5">
                <div className="text-xs">
                    <span className="text-fg font-medium">{fmtPaiseINR(student.payments.totalPaid)}</span>
                    {student.payments.pendingAmount > 0 && (
                        <span className="ml-1 text-[var(--color-danger)]">· {fmtPaiseINR(student.payments.pendingAmount)} due</span>
                    )}
                </div>
            </td>
            <td className="py-3 px-5 text-right space-x-1">
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Eye size={12} />}
                    onClick={onOpenDetail}>
                    View
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Send size={12} />}
                    loading={sharing}
                    onClick={onShareCreds}>
                    Share creds
                </Button>
            </td>
        </tr>
    )
}

const KpiTile = ({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) => (
    <Card className="!p-4">
        <div className="flex items-center justify-between">
            <span className="text-xs text-fg-muted">{label}</span>
            <span className="text-fg-muted">{icon}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold text-fg">{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </Card>
)

const CredsModal = ({ state, onClose }: { state: { student: MyStudent; creds: SharedCreds } | null; onClose: () => void }) => {
    const copy = (text: string) => {
        if (!text) return
        navigator.clipboard.writeText(text).then(
            () => toast.success('Copied'),
            () => toast.error('Could not copy')
        )
    }
    return (
        <Modal
            open={!!state}
            onClose={onClose}
            title="Login credentials"
            description={state ? `For ${state.student.firstName} ${state.student.lastName}`.trim() : ''}
            footer={<Button onClick={onClose}>Done</Button>}>
            {state && (
                <div className="space-y-4">
                    <p className="text-sm text-fg-soft inline-flex items-center gap-2">
                        <KeyRound
                            size={14}
                            className="text-[var(--color-brand-500)]"
                        />
                        Share these securely. The password is shown only when first generated.
                    </p>
                    <div className="rounded-md border p-3 space-y-2">
                        <Row
                            label="Email"
                            value={state.creds.email}
                            onCopy={() => copy(state.creds.email)}
                        />
                        <Row
                            label="Password"
                            value={state.creds.password ?? '—'}
                            onCopy={() => state.creds.password && copy(state.creds.password)}
                            danger={!state.creds.password}
                        />
                    </div>
                    {!state.creds.password && (
                        <Badge tone="warn">The student already logged in — this password has been cleared. Trigger a password reset instead.</Badge>
                    )}
                </div>
            )}
        </Modal>
    )
}

const Row = ({ label, value, onCopy, danger }: { label: string; value: string; onCopy: () => void; danger?: boolean }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-fg-muted">{label}</span>
        <div className="flex items-center gap-2 min-w-0">
            <code className={`font-mono text-sm truncate ${danger ? 'text-[var(--color-danger)]' : 'text-fg'}`}>{value}</code>
            <Button
                size="sm"
                variant="ghost"
                onClick={onCopy}>
                Copy
            </Button>
        </div>
    </div>
)
