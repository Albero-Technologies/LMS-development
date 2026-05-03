import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Banknote, CreditCard, ShieldCheck, X, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Modal } from '@shared/components/ui/Modal'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { fmtPaiseINR } from '@shared/libs/pdf'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import {
    listPaymentRequests,
    createPaymentRequest,
    reviewPaymentRequest,
    cancelPaymentRequest,
    type PaymentRequestRow,
    type PaymentRequestStatus
} from '../services/paymentRequest.service'
import { listMonitorStudents } from '../services/studentsMonitor.service'

// Counsellor → admin offline payment workflow. The tab gives:
//   - status chips (PENDING / APPROVED / REJECTED / CANCELLED)
//   - a "Request offline payment" button for counsellors / managers
//   - a row-level approve/reject for admins on PENDING requests
//
// Notifications fire from the backend on every transition (submit / approve
// / reject) so the bell + email reach the right side automatically.

const STATUS_TONES: Record<PaymentRequestStatus, 'brand' | 'ok' | 'warn' | 'danger' | 'default'> = {
    PENDING: 'warn',
    APPROVED: 'ok',
    REJECTED: 'danger',
    CANCELLED: 'default'
}

const fmtDate = (iso: string | null): string => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export const PaymentRequestsTab = ({ tenantSlug }: { tenantSlug?: string }) => {
    const role = useAuthStore((s) => s.user?.role)
    const canApprove = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
    const canRequest = role === ROLES.COUNSELLOR || role === ROLES.COUNSELLING_MANAGER || canApprove

    const queryClient = useQueryClient()
    const [status, setStatus] = useState<PaymentRequestStatus | 'ALL'>('PENDING')
    const [page, setPage] = useState(1)
    const [createOpen, setCreateOpen] = useState(false)
    const [reviewing, setReviewing] = useState<PaymentRequestRow | null>(null)

    const requestsQuery = useQuery({
        queryKey: ['payment-requests', { tenantSlug, status, page }],
        queryFn: () =>
            listPaymentRequests({
                tenantSlug,
                status: status === 'ALL' ? undefined : status,
                page,
                pageSize: 25
            }),
        staleTime: 15_000,
        placeholderData: (prev) => prev
    })

    const reviewMutation = useMutation({
        mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVE' | 'REJECT'; reason?: string }) =>
            reviewPaymentRequest(id, { decision, rejectionReason: reason }),
        onSuccess: () => {
            toast.success('Request updated')
            void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
            void queryClient.invalidateQueries({ queryKey: ['students-monitor'] })
            setReviewing(null)
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not update request')
    })

    const cancelMutation = useMutation({
        mutationFn: (id: string) => cancelPaymentRequest(id),
        onSuccess: () => {
            toast.success('Request cancelled')
            void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not cancel request')
    })

    const items = requestsQuery.data?.items ?? []

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ALL'] as const).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => {
                            setStatus(s)
                            setPage(1)
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            status === s
                                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white shadow-sm'
                                : 'border-line text-fg-soft bg-surface-2 hover:translate-y-[-1px]'
                        }`}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
                {canRequest && (
                    <div className="ml-auto">
                        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
                            Request offline payment
                        </Button>
                    </div>
                )}
            </div>

            <Card padded={false}>
                {requestsQuery.isLoading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                ) : items.length === 0 ? (
                    <Empty
                        icon={<Banknote size={32} />}
                        title="Nothing here"
                        description="Counsellors submit cash / EMI requests; admins approve them. Once they do, requests show up here."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wide text-fg-muted bg-surface-2">
                                    <th className="py-2.5 px-5 font-semibold">Student</th>
                                    <th className="py-2.5 px-5 font-semibold">Counsellor</th>
                                    <th className="py-2.5 px-5 font-semibold">Method</th>
                                    <th className="py-2.5 px-5 font-semibold text-right">Amount</th>
                                    <th className="py-2.5 px-5 font-semibold">Status</th>
                                    <th className="py-2.5 px-5 font-semibold">Submitted</th>
                                    <th className="py-2.5 px-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((r) => (
                                    <tr key={r.id}>
                                        <td className="py-3 px-5">
                                            <div className="text-fg font-medium">{r.student.name}</div>
                                            <div className="text-xs text-fg-muted truncate">{r.student.email}</div>
                                        </td>
                                        <td className="py-3 px-5 text-xs">
                                            <div className="text-fg">{r.requestedBy.name}</div>
                                            <div className="text-fg-muted truncate">{r.requestedBy.email}</div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-fg-soft">
                                                {r.method === 'CASH' ? <Banknote size={13} /> : <CreditCard size={13} />}
                                                {r.method}
                                                {r.method === 'EMI' && r.emiTotal && r.emiSequence ? (
                                                    <span className="text-fg-muted">
                                                        ({r.emiSequence}/{r.emiTotal})
                                                    </span>
                                                ) : null}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5 text-right font-mono">{r.amountDisplay}</td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STATUS_TONES[r.status]}>{r.status}</Badge>
                                            {r.status === 'REJECTED' && r.rejectionReason && (
                                                <div className="mt-1 text-[11px] text-fg-muted truncate max-w-[160px]" title={r.rejectionReason}>
                                                    {r.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(r.createdAt)}</td>
                                        <td className="py-3 px-5 text-right">
                                            {r.status === 'PENDING' && canApprove && (
                                                <Button size="sm" leftIcon={<ShieldCheck size={12} />} onClick={() => setReviewing(r)}>
                                                    Review
                                                </Button>
                                            )}
                                            {r.status === 'PENDING' && !canApprove && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<X size={12} />}
                                                    loading={cancelMutation.isPending && cancelMutation.variables === r.id}
                                                    onClick={() => cancelMutation.mutate(r.id)}>
                                                    Cancel
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <CreateRequestModal open={createOpen} onClose={() => setCreateOpen(false)} tenantSlug={tenantSlug} />
            <ReviewRequestModal
                request={reviewing}
                onClose={() => setReviewing(null)}
                onSubmit={(decision, reason) =>
                    reviewing && reviewMutation.mutate({ id: reviewing.id, decision, reason })
                }
                pending={reviewMutation.isPending}
            />
        </>
    )
}

// ---------- Create modal ---------------------------------------------------

const CreateRequestModal = ({ open, onClose, tenantSlug }: { open: boolean; onClose: () => void; tenantSlug?: string }) => {
    const queryClient = useQueryClient()
    const [studentId, setStudentId] = useState('')
    const [method, setMethod] = useState<'CASH' | 'EMI'>('CASH')
    const [amountInput, setAmountInput] = useState('')
    const [emiTotal, setEmiTotal] = useState(6)
    const [emiSequence, setEmiSequence] = useState(1)
    const [note, setNote] = useState('')

    // Tiny student search — reuse the funnel list to find candidates. We
    // only show students the actor can request for; backend enforces the
    // permission gate again at submit time.
    const studentsQuery = useQuery({
        queryKey: ['payment-requests', 'student-picker', tenantSlug],
        queryFn: () => listMonitorStudents({ pageSize: 50, tenantSlug }),
        enabled: open,
        staleTime: 60_000
    })

    const amountMinor = useMemo(() => {
        const num = Number(amountInput.replace(/[^0-9.]/g, ''))
        if (!Number.isFinite(num) || num <= 0) return 0
        return Math.round(num * 100)
    }, [amountInput])

    const reset = () => {
        setStudentId('')
        setAmountInput('')
        setMethod('CASH')
        setEmiTotal(6)
        setEmiSequence(1)
        setNote('')
    }

    const submitMutation = useMutation({
        mutationFn: () =>
            createPaymentRequest({
                studentId,
                method,
                amountMinor,
                note: note || undefined,
                emiTotal: method === 'EMI' ? emiTotal : undefined,
                emiSequence: method === 'EMI' ? emiSequence : undefined
            }),
        onSuccess: () => {
            toast.success('Payment request submitted — admin will review')
            void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
            reset()
            onClose()
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not submit request')
    })

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="Request offline payment"
            description="Counsellors capture cash or EMI payments here. An admin must approve before the invoice is marked paid."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        loading={submitMutation.isPending}
                        disabled={!studentId || amountMinor <= 0}
                        onClick={() => submitMutation.mutate()}>
                        Submit request
                    </Button>
                </>
            }>
            <div className="space-y-3">
                <label className="block text-xs font-medium text-fg-soft">
                    Student
                    <Select className="mt-1" value={studentId} onChange={(e) => setStudentId(e.target.value)} aria-label="Student">
                        <option value="">Select a student…</option>
                        {studentsQuery.data?.items.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} · {s.email}
                            </option>
                        ))}
                    </Select>
                </label>
                <label className="block text-xs font-medium text-fg-soft">
                    Method
                    <Select className="mt-1" value={method} onChange={(e) => setMethod(e.target.value as 'CASH' | 'EMI')}>
                        <option value="CASH">Cash (offline)</option>
                        <option value="EMI">EMI installment</option>
                    </Select>
                </label>
                <label className="block text-xs font-medium text-fg-soft">
                    Amount (₹)
                    <Input
                        type="text"
                        inputMode="numeric"
                        className="mt-1"
                        value={amountInput}
                        placeholder="e.g. 25000"
                        onChange={(e) => setAmountInput(e.target.value)}
                    />
                    <span className="block mt-1 text-[11px] text-fg-muted">
                        Charged: <strong>{amountMinor > 0 ? fmtPaiseINR(amountMinor) : '—'}</strong>
                    </span>
                </label>
                {method === 'EMI' && (
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block text-xs font-medium text-fg-soft">
                            Total installments
                            <Input
                                type="number"
                                min={2}
                                max={60}
                                className="mt-1"
                                value={emiTotal}
                                onChange={(e) => setEmiTotal(Math.max(2, Math.min(60, Number(e.target.value) || 2)))}
                            />
                        </label>
                        <label className="block text-xs font-medium text-fg-soft">
                            This installment number
                            <Input
                                type="number"
                                min={1}
                                max={emiTotal}
                                className="mt-1"
                                value={emiSequence}
                                onChange={(e) => setEmiSequence(Math.max(1, Math.min(emiTotal, Number(e.target.value) || 1)))}
                            />
                        </label>
                    </div>
                )}
                <label className="block text-xs font-medium text-fg-soft">
                    Note for the admin (optional)
                    <textarea
                        rows={3}
                        className="mt-1 w-full rounded-md border bg-surface text-fg text-sm p-2"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Receipt #1234, collected at branch on 15 May."
                    />
                </label>
            </div>
        </Modal>
    )
}

// ---------- Review modal --------------------------------------------------

const ReviewRequestModal = ({
    request,
    onClose,
    onSubmit,
    pending
}: {
    request: PaymentRequestRow | null
    onClose: () => void
    onSubmit: (decision: 'APPROVE' | 'REJECT', reason?: string) => void
    pending: boolean
}) => {
    const [reason, setReason] = useState('')
    return (
        <Modal
            open={!!request}
            onClose={onClose}
            title={request ? `Review request from ${request.requestedBy.name}` : ''}
            description={request ? `${request.method} payment of ${request.amountDisplay} for ${request.student.name}` : ''}
            footer={
                request && (
                    <>
                        <Button
                            variant="ghost"
                            leftIcon={<X size={14} />}
                            loading={pending}
                            onClick={() => onSubmit('REJECT', reason)}
                            disabled={!reason.trim()}>
                            Reject
                        </Button>
                        <Button leftIcon={<CheckCircle2 size={14} />} loading={pending} onClick={() => onSubmit('APPROVE')}>
                            Approve & mark paid
                        </Button>
                    </>
                )
            }>
            {request && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <Field label="Student" value={request.student.name} sub={request.student.email} />
                        <Field label="Counsellor" value={request.requestedBy.name} sub={request.requestedBy.email} />
                        <Field label="Method" value={request.method} sub={request.method === 'EMI' && request.emiTotal ? `${request.emiSequence}/${request.emiTotal}` : undefined} />
                        <Field label="Amount" value={request.amountDisplay} sub={fmtPaiseINR(request.amountMinor)} />
                    </div>
                    {request.note && (
                        <div className="rounded-md border p-3 bg-surface-2 text-xs text-fg-soft">
                            <div className="font-semibold mb-1 text-fg">Counsellor's note</div>
                            {request.note}
                        </div>
                    )}
                    {request.invoice && (
                        <div className="rounded-md border p-3 bg-surface-2 text-xs">
                            <div className="font-semibold mb-1 text-fg">Linked invoice</div>
                            {request.invoice.number} · {fmtPaiseINR(request.invoice.totalAmount)} · {request.invoice.status}
                        </div>
                    )}
                    <label className="block text-xs font-medium text-fg-soft">
                        Rejection reason (required to reject)
                        <textarea
                            rows={3}
                            className="mt-1 w-full rounded-md border bg-surface text-fg text-sm p-2"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. need clearer receipt; amount mismatch"
                        />
                    </label>
                    <div className="flex items-start gap-2 text-[11px] text-fg-muted">
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        Approving will flip the linked invoice to PAID and notify the counsellor.
                    </div>
                </div>
            )}
        </Modal>
    )
}

const Field = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div>
        <div className="text-[11px] uppercase tracking-wide text-fg-muted">{label}</div>
        <div className="mt-0.5 text-fg font-medium truncate">{value}</div>
        {sub && <div className="text-[11px] text-fg-muted truncate">{sub}</div>}
    </div>
)
