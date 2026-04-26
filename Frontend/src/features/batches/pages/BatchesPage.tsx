// Batches — operations view for tenant admins, trainers, counsellors.
//
//   Trainer / Admin: full CRUD — create batch under a course, assign students,
//                    edit name / trainer / dates / capacity, transfer students.
//   Counsellor:      read-only view — see which batches have which students,
//                    monitor capacity. Backend gates writes via the 'batch'
//                    write policy (TRAINER, ADMIN, SUPER_ADMIN), so the UI
//                    just hides the action buttons for read-only roles.
//
// Course-scoped: every batch belongs to one Course, students must already be
// enrolled in that course before they can be assigned to a batch.
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, Users, Plus, ArrowRight, AlertCircle, UserPlus, Search, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Modal } from '@shared/components/ui/Modal'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import {
    assignStudentsToBatch,
    createBatch,
    deleteBatch,
    fmtBatchDate,
    getBatchStatusTone,
    listBatches,
    transferStudent,
    updateBatch,
    type BatchRow,
    type BatchStatus
} from '../services/batch.service'
import { listCourses } from '@features/courses/services/course.service'
import { listUsers } from '@features/users/services/user.service'
import { listAllTenants } from '@features/admin/services/tenant.service'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'

const slugifyCode = (s: string): string =>
    s
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 16) || 'BATCH'

export const BatchesPage = () => {
    const user = useAuthStore((s) => s.user)
    const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
    const canEdit = user && [ROLES.TRAINER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role as never)

    const [createOpen, setCreateOpen] = useState(false)
    const [editBatch, setEditBatch] = useState<BatchRow | null>(null)
    const [manageBatch, setManageBatch] = useState<BatchRow | null>(null)
    const [courseFilter, setCourseFilter] = useState('')

    // SUPER_ADMIN flow — pick a tenant, then see + author batches inside it.
    // Other roles operate inside their own tenant; the picker stays hidden.
    const [tenantId, setTenantId] = useState('')
    const tenantsQuery = useQuery({
        queryKey: ['tenants'],
        queryFn: listAllTenants,
        staleTime: 60_000,
        enabled: !!isSuperAdmin
    })
    const tenants = tenantsQuery.data ?? []
    useEffect(() => {
        if (!isSuperAdmin) return
        if (!tenantId && tenants.length > 0) setTenantId(tenants[0].id)
    }, [isSuperAdmin, tenantId, tenants])

    const batchesQuery = useQuery({
        queryKey: ['batches', tenantId || 'mine', courseFilter || 'all'],
        queryFn: () =>
            listBatches({
                courseId: courseFilter || undefined,
                tenantId: isSuperAdmin ? tenantId || undefined : undefined
            }),
        staleTime: 30_000,
        // SA must wait for a tenant pick before issuing the request — otherwise
        // the page lands in the platform tenant and the user wonders why
        // their newly-created batches aren't there.
        enabled: !isSuperAdmin || tenantId.length > 0
    })
    const coursesQuery = useQuery({
        queryKey: ['courses', 'for-batches', tenantId || 'mine'],
        queryFn: () => listCourses(isSuperAdmin && tenantId ? { tenantId } : undefined),
        staleTime: 60_000,
        enabled: !isSuperAdmin || tenantId.length > 0
    })

    const batches = batchesQuery.data ?? []
    const courses = coursesQuery.data ?? []
    const activeTenantSlug = tenants.find((t) => t.id === tenantId)?.slug

    return (
        <>
            <PageHeader
                eyebrow={isSuperAdmin ? 'Super Admin' : 'Operations'}
                title="Batches"
                description={
                    isSuperAdmin
                        ? activeTenantSlug
                            ? `Cohorts at /${activeTenantSlug}. Switch tenants to monitor a different institute.`
                            : 'Pick a tenant to see their cohorts.'
                        : 'Group students by cohort. Assign trainers, transfer students, monitor capacity.'
                }
                actions={
                    <>
                        {isSuperAdmin && (
                            <div className="w-64 hidden sm:block">
                                <Select
                                    aria-label="Choose tenant"
                                    value={tenantId}
                                    onChange={(e) => setTenantId(e.target.value)}>
                                    {tenants.length === 0 && <option value="">Loading…</option>}
                                    {tenants.map((t) => (
                                        <option
                                            key={t.id}
                                            value={t.id}>
                                            {t.name} (/{t.slug})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                        <div className="w-56 hidden sm:block">
                            <Select
                                aria-label="Filter by course"
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}>
                                <option value="">All courses</option>
                                {courses.map((c) => (
                                    <option
                                        key={c.id}
                                        value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        {canEdit && (
                            <Button
                                size="sm"
                                leftIcon={<Plus size={14} />}
                                disabled={isSuperAdmin && !tenantId}
                                onClick={() => setCreateOpen(true)}>
                                New batch
                            </Button>
                        )}
                    </>
                }
            />

            {batchesQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <Card key={i}>
                            <Skeleton className="h-10 w-10 rounded-md mb-3" />
                            <Skeleton className="h-5 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </Card>
                    ))}
                </div>
            ) : batchesQuery.isError ? (
                <Card>
                    <div className="flex items-center gap-3 text-fg-soft">
                        <AlertCircle
                            size={18}
                            className="text-[var(--color-danger)]"
                        />
                        <span className="text-sm">Could not load batches.</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => batchesQuery.refetch()}>
                            Retry
                        </Button>
                    </div>
                </Card>
            ) : batches.length === 0 ? (
                <Empty
                    icon={<CalendarCheck size={36} />}
                    title={courseFilter ? 'No batches for this course yet' : 'No batches yet'}
                    description={
                        canEdit
                            ? 'Create the first cohort to start grouping students together.'
                            : 'Once your trainer or admin creates batches, they will show up here.'
                    }
                    action={
                        canEdit ? (
                            <Button
                                leftIcon={<Plus size={14} />}
                                onClick={() => setCreateOpen(true)}>
                                New batch
                            </Button>
                        ) : null
                    }
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((b) => {
                        const enrolled = b._count.enrollments
                        const pct = b.capacity ? Math.round((enrolled / b.capacity) * 100) : 0
                        const trainerName = b.trainer ? [b.trainer.firstName, b.trainer.lastName].filter(Boolean).join(' ').trim() : 'Unassigned'
                        return (
                            <Card key={b.id}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center">
                                        <CalendarCheck size={18} />
                                    </div>
                                    <Badge tone={getBatchStatusTone(b.status)}>{b.status.toLowerCase()}</Badge>
                                </div>
                                <h3 className="text-base font-semibold text-fg">{b.name}</h3>
                                <div className="text-[11px] text-fg-muted font-mono">{b.code}</div>
                                <div className="mt-1 text-xs text-fg-soft truncate">{b.course?.title ?? '—'}</div>
                                <div className="mt-2 flex items-center gap-3 text-xs text-fg-muted">
                                    <span className="inline-flex items-center gap-1">
                                        <Users size={12} />
                                        {enrolled}/{b.capacity}
                                    </span>
                                    <span>·</span>
                                    <span className="truncate">{trainerName}</span>
                                </div>
                                <div className="mt-1 text-[11px] text-fg-muted">Starts {fmtBatchDate(b.startDate)}</div>
                                <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-brand-500)]"
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                                <div className="mt-4 flex items-center gap-1.5">
                                    <Button
                                        variant="ghost"
                                        className="flex-1"
                                        rightIcon={<ArrowRight size={14} />}
                                        onClick={() => setManageBatch(b)}>
                                        {canEdit ? 'Manage' : 'View'}
                                    </Button>
                                    {canEdit && (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="subtle"
                                                aria-label="Edit batch"
                                                onClick={() => setEditBatch(b)}>
                                                <Pencil size={14} />
                                            </Button>
                                            <DeleteBatchButton batch={b} />
                                        </>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <CreateBatchModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                courses={courses}
                tenantId={isSuperAdmin ? tenantId : undefined}
            />

            <EditBatchModal
                batch={editBatch}
                onClose={() => setEditBatch(null)}
            />

            <ManageBatchModal
                batch={manageBatch}
                onClose={() => setManageBatch(null)}
                canEdit={!!canEdit}
            />
        </>
    )
}

const CreateBatchModal = ({
    open,
    onClose,
    courses,
    tenantId
}: {
    open: boolean
    onClose: () => void
    courses: { id: string; title: string }[]
    tenantId?: string
}) => {
    const queryClient = useQueryClient()
    const [courseId, setCourseId] = useState('')
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [codeTouched, setCodeTouched] = useState(false)
    const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [endDate, setEndDate] = useState('')
    const [capacity, setCapacity] = useState('50')

    const reset = () => {
        setCourseId('')
        setName('')
        setCode('')
        setCodeTouched(false)
        setStartDate(new Date().toISOString().slice(0, 10))
        setEndDate('')
        setCapacity('50')
    }

    const mutation = useMutation({
        mutationFn: () =>
            createBatch({
                courseId,
                name: name.trim(),
                code: code.trim(),
                startDate: new Date(startDate).toISOString(),
                endDate: endDate ? new Date(endDate).toISOString() : undefined,
                capacity: Number(capacity) || 50,
                tenantId
            }),
        onSuccess: () => {
            toast.success('Batch created')
            void queryClient.invalidateQueries({ queryKey: ['batches'] })
            reset()
            onClose()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not create batch')
    })

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New batch"
            description="A cohort of students taking one course together. Assign trainer + dates here, then add students from the manage view."
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        disabled={!courseId || !name || !code || !startDate}
                        onClick={() => mutation.mutate()}>
                        Create batch
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Select
                    label="Course"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">Pick a course…</option>
                    {courses.map((c) => (
                        <option
                            key={c.id}
                            value={c.id}>
                            {c.title}
                        </option>
                    ))}
                </Select>
                <Input
                    label="Batch name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        if (!codeTouched) setCode(slugifyCode(e.target.value))
                    }}
                    placeholder="April 2026 cohort"
                />
                <Input
                    label="Code"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value)
                        setCodeTouched(true)
                    }}
                    placeholder="APR2026"
                    hint="Short identifier shown on attendance sheets and certificates. Must be unique within the tenant."
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Starts"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                        label="Ends (optional)"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <Input
                    label="Capacity"
                    type="number"
                    min={1}
                    max={1000}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    hint="Maximum students this batch can hold."
                />
            </div>
        </Modal>
    )
}

const ManageBatchModal = ({
    batch,
    onClose,
    canEdit
}: {
    batch: BatchRow | null
    onClose: () => void
    canEdit: boolean
}) => {
    const queryClient = useQueryClient()
    const [assignOpen, setAssignOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [transferTarget, setTransferTarget] = useState<{ userId: string; name: string } | null>(null)

    // Refresh the batch detail so the assigned-students list is current.
    const detailQuery = useQuery({
        queryKey: ['batch', batch?.id],
        queryFn: () => (batch ? import('../services/batch.service').then((m) => m.getBatch(batch.id)) : null),
        enabled: !!batch,
        staleTime: 10_000
    })
    const detail = detailQuery.data ?? null

    if (!batch) return null

    const enrolled = detail?.enrollments ?? []
    const filtered = enrolled.filter((e) => {
        const needle = search.trim().toLowerCase()
        if (!needle) return true
        const name = [e.user.firstName, e.user.lastName].filter(Boolean).join(' ').toLowerCase()
        return name.includes(needle) || e.user.email.toLowerCase().includes(needle)
    })

    return (
        <>
            <Modal
                open={!!batch}
                onClose={onClose}
                title={batch.name}
                description={`${batch.course?.title ?? '—'} · code ${batch.code}`}
                size="lg"
                footer={<Button onClick={onClose}>Done</Button>}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Stat
                            label="Status"
                            value={batch.status.toLowerCase()}
                        />
                        <Stat
                            label="Capacity"
                            value={`${enrolled.length}/${batch.capacity}`}
                        />
                        <Stat
                            label="Starts"
                            value={fmtBatchDate(batch.startDate)}
                        />
                        <Stat
                            label="Ends"
                            value={fmtBatchDate(batch.endDate)}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2 gap-3">
                            <h3 className="text-sm font-semibold text-fg">Students in this batch</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-44 hidden sm:block">
                                    <Input
                                        placeholder="Search"
                                        leftIcon={<Search size={14} />}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                {canEdit && (
                                    <Button
                                        size="sm"
                                        leftIcon={<UserPlus size={12} />}
                                        onClick={() => setAssignOpen(true)}>
                                        Assign students
                                    </Button>
                                )}
                            </div>
                        </div>
                        {detailQuery.isLoading ? (
                            <div className="space-y-2">
                                {[0, 1, 2].map((i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-10 w-full"
                                    />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-sm text-fg-muted px-3 py-6 border border-dashed rounded-md text-center">
                                {search
                                    ? 'No students match your search.'
                                    : 'No students assigned yet. Use Assign students to add enrolled students to this batch.'}
                            </div>
                        ) : (
                            <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
                                {filtered.map((e) => {
                                    const fullName =
                                        [e.user.firstName, e.user.lastName].filter(Boolean).join(' ').trim() || e.user.email
                                    return (
                                        <div
                                            key={e.id}
                                            className="flex items-center justify-between px-3 py-2.5 hover:bg-surface-hover gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-fg truncate">{fullName}</div>
                                                <div className="text-[11px] text-fg-muted truncate">{e.user.email}</div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[11px] text-fg-muted">{e.progressPct ?? 0}%</span>
                                                <Badge tone={e.status === 'ACTIVE' ? 'brand' : e.status === 'COMPLETED' ? 'ok' : 'warn'}>
                                                    {e.status === 'PENDING_PAYMENT' ? 'Pending pay' : e.status.toLowerCase()}
                                                </Badge>
                                                {canEdit && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setTransferTarget({ userId: e.userId, name: fullName })}>
                                                        Transfer
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <AssignStudentsModal
                open={assignOpen}
                onClose={() => setAssignOpen(false)}
                batch={batch}
                alreadyAssignedUserIds={new Set(enrolled.map((e) => e.userId))}
                onAssigned={() => {
                    void queryClient.invalidateQueries({ queryKey: ['batches'] })
                    void queryClient.invalidateQueries({ queryKey: ['batch', batch.id] })
                }}
            />

            <TransferStudentModal
                target={transferTarget}
                fromBatch={batch}
                onClose={() => setTransferTarget(null)}
                onTransferred={() => {
                    setTransferTarget(null)
                    void queryClient.invalidateQueries({ queryKey: ['batches'] })
                    void queryClient.invalidateQueries({ queryKey: ['batch', batch.id] })
                }}
            />
        </>
    )
}

// Transfer a single student from this batch to another batch of the SAME
// course. Lists candidate target batches via listBatches({ courseId }) and
// excludes the current batch + any batch that's at capacity.
const TransferStudentModal = ({
    target,
    fromBatch,
    onClose,
    onTransferred
}: {
    target: { userId: string; name: string } | null
    fromBatch: BatchRow
    onClose: () => void
    onTransferred: () => void
}) => {
    const [targetBatchId, setTargetBatchId] = useState('')

    // Reset selection when the picker opens with a new student.
    useEffect(() => {
        if (target) setTargetBatchId('')
    }, [target?.userId])

    const candidatesQuery = useQuery({
        queryKey: ['batches', 'transfer-candidates', fromBatch.courseId, fromBatch.tenantId],
        queryFn: () => listBatches({ courseId: fromBatch.courseId, tenantId: fromBatch.tenantId }),
        enabled: !!target,
        staleTime: 30_000
    })
    const candidates = (candidatesQuery.data ?? []).filter((b) => {
        if (b.id === fromBatch.id) return false
        if (b.status === 'CANCELLED' || b.status === 'ENDED') return false
        return b._count.enrollments < b.capacity
    })

    const mutation = useMutation({
        mutationFn: () => {
            if (!target) throw new Error('No target student')
            return transferStudent(fromBatch.id, { userId: target.userId, targetBatchId })
        },
        onSuccess: () => {
            toast.success('Student transferred')
            onTransferred()
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not transfer')
    })

    if (!target) return null

    return (
        <Modal
            open={!!target}
            onClose={onClose}
            title={`Transfer ${target.name}`}
            description={`Move from "${fromBatch.name}" to another batch in the same course. The student's progress is preserved.`}
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        disabled={!targetBatchId}
                        onClick={() => mutation.mutate()}>
                        Transfer
                    </Button>
                </>
            }>
            <div className="space-y-3">
                {candidatesQuery.isLoading ? (
                    <Skeleton className="h-10 w-full" />
                ) : candidates.length === 0 ? (
                    <div className="text-sm text-fg-muted px-3 py-6 border border-dashed rounded-md text-center">
                        No other batches in this course have spare capacity. Create one first or wait for an existing batch to open up.
                    </div>
                ) : (
                    <Select
                        label="Move to"
                        value={targetBatchId}
                        onChange={(e) => setTargetBatchId(e.target.value)}>
                        <option value="">Pick a target batch…</option>
                        {candidates.map((b) => (
                            <option
                                key={b.id}
                                value={b.id}>
                                {b.name} ({b._count.enrollments}/{b.capacity}) · {b.code}
                            </option>
                        ))}
                    </Select>
                )}
            </div>
        </Modal>
    )
}

const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-md border border-[var(--color-border)] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
        <div className="text-sm font-medium text-fg mt-0.5 capitalize">{value}</div>
    </div>
)

// Pick students who are enrolled in this batch's course but not yet in any
// batch (or in another batch). The backend's assign endpoint filters by
// courseId server-side, so we don't have to be perfectly clean here — but a
// pre-filter UI keeps the picker short and reduces "no-op" assignments.
const AssignStudentsModal = ({
    open,
    onClose,
    batch,
    alreadyAssignedUserIds,
    onAssigned
}: {
    open: boolean
    onClose: () => void
    batch: BatchRow
    alreadyAssignedUserIds: Set<string>
    onAssigned: () => void
}) => {
    const [picked, setPicked] = useState<Set<string>>(new Set())
    const [q, setQ] = useState('')

    const studentsQuery = useQuery({
        queryKey: ['users', 'students', batch.id],
        queryFn: () => listUsers({ role: 'STUDENT', pageSize: 100 }),
        enabled: open,
        staleTime: 30_000
    })
    const students = studentsQuery.data?.items ?? []
    const filtered = students.filter((u) => {
        const needle = q.trim().toLowerCase()
        if (!needle) return true
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ').toLowerCase()
        return name.includes(needle) || u.email.toLowerCase().includes(needle)
    })

    const togglePick = (id: string) => {
        const next = new Set(picked)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setPicked(next)
    }

    const mutation = useMutation({
        mutationFn: () => assignStudentsToBatch(batch.id, Array.from(picked)),
        onSuccess: ({ assigned }) => {
            toast.success(`Assigned ${assigned} student${assigned === 1 ? '' : 's'}`)
            setPicked(new Set())
            onAssigned()
            onClose()
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Could not assign'
            toast.error(msg)
        }
    })

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Assign students to ${batch.name}`}
            description="Only students who are already enrolled in this batch's course will be moved into the batch — the backend silently drops any who aren't enrolled, so it's safe to multi-select."
            size="lg"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        disabled={picked.size === 0}
                        onClick={() => mutation.mutate()}>
                        Assign {picked.size > 0 ? `(${picked.size})` : ''}
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Input
                    placeholder="Search students by name or email"
                    leftIcon={<Search size={14} />}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                {studentsQuery.isLoading ? (
                    <div className="space-y-2">
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-10 w-full"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-sm text-fg-muted text-center py-6 border border-dashed rounded-md">
                        No students {q ? 'match your search' : 'in your tenant yet'}.
                    </div>
                ) : (
                    <div className="border rounded-md divide-y max-h-80 overflow-y-auto">
                        {filtered.map((u) => {
                            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email
                            const alreadyIn = alreadyAssignedUserIds.has(u.id)
                            const checked = picked.has(u.id)
                            return (
                                <label
                                    key={u.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer ${
                                        alreadyIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-hover'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="accent-[var(--color-brand-500)]"
                                        disabled={alreadyIn}
                                        checked={checked}
                                        onChange={() => togglePick(u.id)}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-fg truncate">{fullName}</div>
                                        <div className="text-[11px] text-fg-muted truncate">{u.email}</div>
                                    </div>
                                    {alreadyIn && <span className="text-[11px] text-fg-muted">Already in batch</span>}
                                </label>
                            )
                        })}
                    </div>
                )}
            </div>
        </Modal>
    )
}

// Delete a batch (soft-delete server-side). Confirms first, then invalidates
// the batches list so the deleted card disappears immediately.
const DeleteBatchButton = ({ batch }: { batch: BatchRow }) => {
    const queryClient = useQueryClient()
    const confirm = useConfirm()
    const mutation = useMutation({
        mutationFn: () => deleteBatch(batch.id),
        onSuccess: () => {
            toast.success('Batch deleted')
            void queryClient.invalidateQueries({ queryKey: ['batches'] })
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not delete')
    })
    return (
        <Button
            size="icon"
            variant="subtle"
            aria-label="Delete batch"
            loading={mutation.isPending}
            onClick={async () => {
                const ok = await confirm({
                    title: `Delete "${batch.name}"?`,
                    description: 'Existing student assignments stay on their enrolment, just unlinked from this batch.',
                    confirmLabel: 'Delete',
                    tone: 'danger'
                })
                if (ok) mutation.mutate()
            }}>
            <Trash2 size={14} />
        </Button>
    )
}

// Edit a batch — name, capacity, dates, status. Course + code are immutable
// post-creation so attendance sheets and certificates that reference the code
// don't break retroactively.
const EditBatchModal = ({ batch, onClose }: { batch: BatchRow | null; onClose: () => void }) => {
    const queryClient = useQueryClient()
    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [capacity, setCapacity] = useState('50')
    const [status, setStatus] = useState<BatchStatus>('UPCOMING')

    useEffect(() => {
        if (!batch) return
        setName(batch.name)
        setStartDate(batch.startDate ? batch.startDate.slice(0, 10) : '')
        setEndDate(batch.endDate ? batch.endDate.slice(0, 10) : '')
        setCapacity(String(batch.capacity))
        setStatus(batch.status)
    }, [batch])

    const mutation = useMutation({
        mutationFn: () =>
            updateBatch(batch!.id, {
                name: name.trim(),
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                endDate: endDate ? new Date(endDate).toISOString() : null,
                capacity: Number(capacity) || batch!.capacity,
                status
            }),
        onSuccess: () => {
            toast.success('Batch updated')
            void queryClient.invalidateQueries({ queryKey: ['batches'] })
            onClose()
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not save')
    })

    if (!batch) return null

    return (
        <Modal
            open={!!batch}
            onClose={onClose}
            title={`Edit ${batch.name}`}
            description={`Course ${batch.course?.title ?? '—'} · code ${batch.code}. Course and code are locked once a batch exists.`}
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        disabled={!name}
                        onClick={() => mutation.mutate()}>
                        Save
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <Input
                    label="Batch name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Starts"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                        label="Ends (optional)"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Capacity"
                        type="number"
                        min={1}
                        max={1000}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                    />
                    <Select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as BatchStatus)}>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="RUNNING">Running</option>
                        <option value="ENDED">Ended</option>
                        <option value="CANCELLED">Cancelled</option>
                    </Select>
                </div>
            </div>
        </Modal>
    )
}

