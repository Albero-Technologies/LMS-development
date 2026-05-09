import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, AlertTriangle, CreditCard, Download, Receipt, Calendar, IndianRupee, History, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { cn } from '@shared/helpers/cn'
import { useAuthStore, fullName } from '@shared/stores/authStore'
import { createPaymentOrder, isOverdue, listMyInvoices, type Invoice } from '../services/payment.service'
import { listMyEnrollments } from '@features/courses/services/enrollment.service'
import { downloadInvoiceReceipt } from '../services/payment.service'
import { openRazorpayCheckout } from '../services/razorpay'

// Amounts come from the backend in paise (smallest currency unit).
const fmtINR = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const daysFromNow = (iso: string): number => Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)

const STATUS_TONE: Record<Invoice['status'], 'ok' | 'warn' | 'danger' | 'default'> = {
    PAID: 'ok',
    DUE: 'warn',
    FAILED: 'danger',
    REFUNDED: 'default',
    DRAFT: 'default'
}

export const StudentFeesPage = () => {
    const user = useAuthStore((s) => s.user)
    const queryClient = useQueryClient()

    const invoicesQuery = useQuery({
        queryKey: ['payments', 'invoices'],
        queryFn: listMyInvoices,
        staleTime: 30_000
    })

    // Driving the DEMO banner — the Fees page is the obvious surface for
    // "you've reserved your seat, settle the balance to unlock". Listing
    // enrolments is cheap; we re-key off ['enrollments', 'mine'] so the
    // realtime sync hook can invalidate this on enrollment:unlocked too.
    const enrollmentsQuery = useQuery({
        queryKey: ['enrollments', 'mine'],
        queryFn: listMyEnrollments,
        staleTime: 30_000
    })

    const [payingId, setPayingId] = useState<string | null>(null)

    const payMutation = useMutation({
        mutationFn: async (invoice: Invoice) => {
            const { order, invoiceNumber } = await createPaymentOrder(invoice.id)
            const courseTitle = invoice.enrollment?.course?.title
            const result = await openRazorpayCheckout({
                keyId: order.keyId,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                invoiceNumber,
                courseTitle,
                prefill: { name: fullName(user), email: user?.email }
            })
            return result
        },
        onSuccess: () => {
            toast.success('Payment received — your enrollment will activate shortly.')
            // Webhook updates the invoice status; refetch a couple of times so the
            // user sees the status flip without manual refresh.
            void queryClient.invalidateQueries({ queryKey: ['payments'] })
            setTimeout(() => queryClient.invalidateQueries({ queryKey: ['payments'] }), 2_000)
            setTimeout(() => queryClient.invalidateQueries({ queryKey: ['payments'] }), 6_000)
            setPayingId(null)
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Payment could not be completed'
            // The dismiss case is normal user behaviour — don't toast it as an error.
            if (msg !== 'PAYMENT_DISMISSED') toast.error(msg)
            setPayingId(null)
        }
    })

    // Memoise so the useMemo below sees a stable reference.
    const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data])

    const buckets = useMemo(() => {
        const overdue: Invoice[] = []
        const due: Invoice[] = []
        const paid: Invoice[] = []
        for (const inv of invoices) {
            if (inv.status === 'PAID') paid.push(inv)
            else if (inv.status === 'DUE' && isOverdue(inv)) overdue.push(inv)
            else if (inv.status === 'DUE') due.push(inv)
        }
        paid.sort((a, b) => new Date(b.paidAt ?? 0).getTime() - new Date(a.paidAt ?? 0).getTime())
        return { overdue, due, paid }
    }, [invoices])

    const overdueTotal = buckets.overdue.reduce((n, i) => n + i.totalAmount, 0)
    const outstandingTotal = overdueTotal + buckets.due.reduce((n, i) => n + i.totalAmount, 0)
    const outstandingCount = buckets.overdue.length + buckets.due.length

    // Match each DEMO enrolment with its outstanding balance — either an
    // existing DUE invoice or, when none exists yet, the implied balance
    // the backend computed from `course.price - paid principal`.
    // Computed before the early-return branches so React's hook ordering
    // stays stable across renders.
    const demoEnrolments = useMemo(() => {
        const list = enrollmentsQuery.data ?? []
        return list
            .filter((e) => e.accessTier === 'DEMO')
            .map((e) => {
                const balance = invoices.find(
                    (inv) => inv.status === 'DUE' && inv.enrollment?.course?.id === e.course?.id
                )
                // Implied balance falls back to course.price - paid when no
                // DUE invoice exists yet (legacy registration-paid rows
                // pre-dating the balance-invoice migration). The student
                // still owes the money — we just don't have an invoice id
                // to point Razorpay at, so the "Pay balance" button routes
                // them back through the public-purchase FULL flow instead.
                const impliedBalanceMinor = balance ? balance.totalAmount : (e.impliedBalanceMinor ?? 0)
                return { enrollment: e, balanceInvoice: balance ?? null, impliedBalanceMinor }
            })
    }, [enrollmentsQuery.data, invoices])

    // Total outstanding from DEMO enrolments — used to suppress the green
    // "all paid up" hero when the student technically has 0 DUE invoices
    // but is still on a DEMO tier owing the balance.
    const demoBalanceTotal = demoEnrolments.reduce((n, d) => n + d.impliedBalanceMinor, 0)

    const handlePay = (invoice: Invoice) => {
        setPayingId(invoice.id)
        payMutation.mutate(invoice)
    }

    if (invoicesQuery.isLoading) {
        return (
            <>
                <PageHeader
                    eyebrow="Fees"
                    title="Your payments"
                    description="Loading your invoices…"
                />
                <Card>
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </Card>
            </>
        )
    }

    if (invoicesQuery.isError) {
        return (
            <>
                <PageHeader
                    eyebrow="Fees"
                    title="Your payments"
                />
                <Empty
                    icon={<Receipt size={32} />}
                    title="Couldn't load invoices"
                    description="Please try again in a moment."
                />
            </>
        )
    }

    return (
        <>
            <PageHeader
                eyebrow="Fees"
                title="Your payments"
                description="Invoices for your enrollments. Pay outstanding fees in one click."
            />

            {demoEnrolments.length > 0 && (
                <div className="space-y-3 mb-6">
                    {demoEnrolments.map(({ enrollment, balanceInvoice, impliedBalanceMinor }) => (
                        <DemoBalanceBanner
                            key={enrollment.id}
                            courseTitle={enrollment.course?.title ?? 'your course'}
                            courseSlug={enrollment.course?.slug ?? null}
                            balanceInvoice={balanceInvoice}
                            impliedBalanceMinor={impliedBalanceMinor}
                            isPaying={!!balanceInvoice && payingId === balanceInvoice.id}
                            onPay={() => balanceInvoice && handlePay(balanceInvoice)}
                        />
                    ))}
                </div>
            )}

            {/* Hide the green "you're all paid up" hero whenever any DEMO
                enrolment still owes the balance — the orange banner above
                already tells the student what they need to do, and showing
                both would contradict itself. */}
            <OutstandingHero
                overdueTotal={overdueTotal}
                outstandingTotal={outstandingTotal}
                overdueCount={buckets.overdue.length}
                outstandingCount={outstandingCount}
                allDemo={demoEnrolments.length > 0 || demoBalanceTotal > 0}
            />

            {outstandingCount > 0 && (
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-fg">Outstanding ({outstandingCount})</h2>
                        {buckets.overdue.length > 0 && (
                            <span className="text-xs text-[var(--color-danger)] font-medium inline-flex items-center gap-1">
                                <AlertTriangle size={12} /> {buckets.overdue.length} overdue
                            </span>
                        )}
                    </div>
                    <div className="grid gap-3">
                        {[...buckets.overdue, ...buckets.due].map((inv) => (
                            <InvoiceRow
                                key={inv.id}
                                inv={inv}
                                isPaying={payingId === inv.id}
                                onPay={() => handlePay(inv)}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-fg inline-flex items-center gap-2">
                        <History
                            size={14}
                            className="text-fg-muted"
                        />{' '}
                        Payment history
                    </h2>
                    <span className="text-xs text-fg-muted">{buckets.paid.length} paid</span>
                </div>
                {buckets.paid.length === 0 ? (
                    <Empty
                        icon={<Receipt size={30} />}
                        title="No payments yet"
                        description="Your paid invoices will appear here."
                    />
                ) : (
                    <Card padded={false}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                        <th className="py-3 px-5">Invoice</th>
                                        <th className="py-3 px-5">Course</th>
                                        <th className="py-3 px-5">Amount</th>
                                        <th className="py-3 px-5">Paid on</th>
                                        <th className="py-3 px-5 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {buckets.paid.map((inv) => (
                                        <tr
                                            key={inv.id}
                                            className="hover:bg-surface-hover">
                                            <td className="py-3 px-5 font-mono text-xs">{inv.number}</td>
                                            <td className="py-3 px-5 text-fg">{inv.enrollment?.course?.title ?? '—'}</td>
                                            <td className="py-3 px-5 font-mono">{fmtINR(inv.totalAmount)}</td>
                                            <td className="py-3 px-5 text-xs text-fg-muted">{inv.paidAt ? fmtDate(inv.paidAt) : '—'}</td>
                                            <td className="py-3 px-5 text-right">
                                                {/* /payments/invoices/:id/receipt streams a printable
                                                    GST receipt — the browser's "Save as PDF" turns it
                                                    into a real PDF. We download as a blob so the
                                                    bearer token in localStorage authenticates the
                                                    request (a plain <a href> can't carry it). */}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<Download size={12} />}
                                                    onClick={() => {
                                                        downloadInvoiceReceipt(inv.id).catch((err: unknown) =>
                                                            toast.error(err instanceof Error ? err.message : 'Could not open receipt')
                                                        )
                                                    }}>
                                                    PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </section>
        </>
    )
}

const OutstandingHero = ({
    overdueTotal,
    outstandingTotal,
    overdueCount,
    outstandingCount,
    allDemo
}: {
    overdueTotal: number
    outstandingTotal: number
    overdueCount: number
    outstandingCount: number
    allDemo?: boolean
}) => {
    // Hide the "all paid up" / outstanding hero whenever any DEMO enrolment
    // still owes the balance — the orange demo banner above already tells
    // the student exactly what they need to do, and the green "you're all
    // paid up" message would directly contradict it.
    if (allDemo) return null
    if (outstandingCount === 0) {
        return (
            <Card className="!p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-[var(--color-success)]/30 bg-[var(--color-success-soft)]">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-fg">You're all paid up</h3>
                        <p className="mt-1 text-sm text-fg-soft">No outstanding invoices. Your paid history is below.</p>
                    </div>
                </div>
            </Card>
        )
    }

    const hasOverdue = overdueCount > 0
    const heroBg = hasOverdue
        ? 'linear-gradient(135deg, var(--color-danger) 0%, #c62a2a 100%)'
        : 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)'

    return (
        <div
            className="rounded-lg p-6 sm:p-8 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            style={{ background: heroBg }}>
            <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/85">
                    {hasOverdue ? <AlertTriangle size={12} /> : <IndianRupee size={12} />}
                    {hasOverdue ? 'Overdue' : 'Outstanding'}
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight">
                        {fmtINR(hasOverdue ? overdueTotal : outstandingTotal)}
                    </span>
                    {hasOverdue && overdueTotal !== outstandingTotal && (
                        <span className="text-sm text-white/85">{fmtINR(outstandingTotal)} total outstanding</span>
                    )}
                </div>
                <p className="mt-2 text-sm text-white/85">
                    {hasOverdue
                        ? `${overdueCount} invoice${overdueCount === 1 ? ' is' : 's are'} past the due date. Pay now to avoid access lockout.`
                        : `${outstandingCount} invoice${outstandingCount === 1 ? '' : 's'} due in the next few days.`}
                </p>
            </div>
        </div>
    )
}

const InvoiceRow = ({ inv, isPaying, onPay }: { inv: Invoice; isPaying: boolean; onPay: () => void }) => {
    const overdue = isOverdue(inv)
    const courseTitle = inv.enrollment?.course?.title ?? '—'
    const dueAtText = inv.dueAt ? fmtDate(inv.dueAt) : 'No due date'
    const daysOverdue = inv.dueAt ? daysFromNow(inv.dueAt) : 0

    return (
        <Card className={cn('!p-5 flex flex-col sm:flex-row sm:items-center gap-4', overdue && 'ring-1 ring-[var(--color-danger)]/30')}>
            <div
                className={cn(
                    'w-10 h-10 rounded-md flex items-center justify-center shrink-0',
                    overdue ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' : 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                )}>
                <Receipt size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <Badge tone={STATUS_TONE[inv.status]}>{overdue ? 'OVERDUE' : inv.status}</Badge>
                    <span className="font-mono text-xs text-fg-muted">{inv.number}</span>
                </div>
                <div className="mt-1 text-sm font-medium text-fg truncate">{courseTitle}</div>
                <div className="mt-1 text-xs text-fg-muted inline-flex items-center gap-1.5">
                    <Calendar size={11} />
                    {overdue ? (
                        <span className="text-[var(--color-danger)] font-medium">
                            {Math.abs(daysOverdue)} day{Math.abs(daysOverdue) === 1 ? '' : 's'} overdue · was due {dueAtText}
                        </span>
                    ) : (
                        <>Due {dueAtText}</>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                    <div className="font-mono text-lg font-semibold text-fg">{fmtINR(inv.totalAmount)}</div>
                    <div className="text-[11px] text-fg-muted">incl. {inv.gstPercent}% GST</div>
                </div>
                <Button
                    size="sm"
                    leftIcon={<CreditCard size={13} />}
                    loading={isPaying}
                    onClick={onPay}>
                    Pay now
                </Button>
            </div>
        </Card>
    )
}

// "You've reserved your seat — pay the balance to unlock all lessons."
// Renders one card per DEMO enrolment with either the matching DUE
// invoice (preferred) or the backend-computed implied balance from
// course.price - paid principal (fallback for legacy registration-paid
// rows that pre-date the balance-invoice migration). Either way the
// student sees the actual amount due — never a placeholder "shortly".
const DemoBalanceBanner = ({
    courseTitle,
    courseSlug,
    balanceInvoice,
    impliedBalanceMinor,
    isPaying,
    onPay
}: {
    courseTitle: string
    courseSlug: string | null
    balanceInvoice: Invoice | null
    impliedBalanceMinor: number
    isPaying: boolean
    onPay: () => void
}) => {
    const balanceShown = balanceInvoice ? balanceInvoice.totalAmount : impliedBalanceMinor
    const hasBalance = balanceShown > 0
    return (
        <Card
            className="!p-5 flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden"
            style={{
                background: 'var(--color-warn-soft,rgba(245,158,11,0.08))',
                border: '1px solid rgba(245,158,11,0.4)'
            }}>
            <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: 'var(--color-warn,#f59e0b)' }} />
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-1" style={{ background: 'var(--color-warn,#f59e0b)', color: '#fff' }}>
                <Lock size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="warn">Demo access</Badge>
                    <span className="text-xs text-fg-muted font-mono">
                        {balanceInvoice ? balanceInvoice.number : hasBalance ? 'balance due' : 'awaiting invoice'}
                    </span>
                </div>
                <div className="mt-1.5 text-sm font-medium text-fg">
                    You've reserved your seat in <strong>{courseTitle}</strong>.
                </div>
                <p className="mt-1 text-xs text-fg-soft">
                    {hasBalance
                        ? `Pay the remaining ${fmtINR(balanceShown)} to unlock every lesson, quiz, and assignment.`
                        : 'A counsellor will share your full-fee invoice shortly.'}
                </p>
            </div>
            {hasBalance && (
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <div className="font-mono text-lg font-semibold text-fg">{fmtINR(balanceShown)}</div>
                        <div className="text-[11px] text-fg-muted">
                            {balanceInvoice ? `incl. ${balanceInvoice.gstPercent}% GST` : 'incl. GST'}
                        </div>
                    </div>
                    {balanceInvoice ? (
                        <Button
                            size="sm"
                            leftIcon={<CreditCard size={13} />}
                            rightIcon={<ArrowRight size={12} />}
                            loading={isPaying}
                            onClick={onPay}>
                            Pay balance
                        </Button>
                    ) : (
                        // Legacy path — no invoice. Send the student back to
                        // the public program page where they can complete the
                        // FULL fee through the normal Razorpay flow.
                        <a href={courseSlug ? `/programs/${courseSlug}#pricing` : '/contact'} target="_blank" rel="noreferrer">
                            <Button
                                size="sm"
                                leftIcon={<CreditCard size={13} />}
                                rightIcon={<ArrowRight size={12} />}>
                                Pay balance
                            </Button>
                        </a>
                    )}
                </div>
            )}
        </Card>
    )
}
