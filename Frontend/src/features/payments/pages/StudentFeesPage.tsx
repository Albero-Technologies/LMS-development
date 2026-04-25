// Student-facing fee portal. One card per invoice, with a loud Pay-now CTA
// on anything DUE/OVERDUE plus a Pay-all-overdue action at the top when
// more than one is outstanding.
//
// The actual Razorpay handoff is mocked here: the PayModal simulates the
// gateway redirect and flips the invoice to PAID. Replace the mock body
// with the Razorpay Checkout call once /api/v1/payments/orders is wired.
import { useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, CreditCard, Download, Receipt, Calendar, IndianRupee, History } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'
import { Select } from '@shared/components/ui/Select'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'
import { useFeeStore, useInvoicesLive, feeTone, invoiceTotal, type TInvoice } from '../stores/feeStore'

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const daysFromNow = (iso: string): number => Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)

export const StudentFeesPage = () => {
    const invoices = useInvoicesLive()
    const payInvoice = useFeeStore((s) => s.payInvoice)
    const payAllOverdue = useFeeStore((s) => s.payAllOverdue)

    const [payTarget, setPayTarget] = useState<TInvoice | 'ALL' | null>(null)

    const buckets = useMemo(() => {
        const overdue = invoices.filter((i) => i.status === 'OVERDUE')
        const due = invoices.filter((i) => i.status === 'DUE')
        const paid = invoices.filter((i) => i.status === 'PAID').sort((a, b) => new Date(b.paidAt ?? 0).getTime() - new Date(a.paidAt ?? 0).getTime())
        return { overdue, due, paid }
    }, [invoices])

    const overdueTotal = buckets.overdue.reduce((n, i) => n + invoiceTotal(i), 0)
    const outstandingTotal = overdueTotal + buckets.due.reduce((n, i) => n + invoiceTotal(i), 0)
    const outstandingCount = buckets.overdue.length + buckets.due.length

    // ------------- Payment handler (mock Razorpay handoff) -------------
    const handlePay = (target: TInvoice | 'ALL', method: string) => {
        // Real integration: open Razorpay Checkout → on success, server verifies
        // HMAC, marks invoice paid, webhook updates client. For Phase 1 we
        // simulate the round-trip locally so the demo actually clicks through.
        if (target === 'ALL') {
            const paid = payAllOverdue(method)
            toast.success(`Paid ${fmtINR(paid)} across ${outstandingCount} invoice${outstandingCount === 1 ? '' : 's'}`)
        } else {
            payInvoice(target.id, method)
            toast.success(`Paid ${fmtINR(invoiceTotal(target))} · ${target.number}`)
        }
        setPayTarget(null)
    }

    return (
        <>
            <PageHeader
                eyebrow="Fees"
                title="Your payments"
                description="Invoices for your enrollments. Pay outstanding fees in one click."
            />

            {/* Hero summary ------------------------------------------------ */}
            <OutstandingHero
                overdueTotal={overdueTotal}
                outstandingTotal={outstandingTotal}
                overdueCount={buckets.overdue.length}
                outstandingCount={outstandingCount}
                onPayAll={() => setPayTarget('ALL')}
            />

            {/* Outstanding list ------------------------------------------- */}
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
                                onPay={() => setPayTarget(inv)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Paid history ----------------------------------------------- */}
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
                                            <td className="py-3 px-5 text-fg">{inv.course}</td>
                                            <td className="py-3 px-5 font-mono">{fmtINR(invoiceTotal(inv))}</td>
                                            <td className="py-3 px-5 text-xs text-fg-muted">
                                                {inv.paidAt ? fmtDate(inv.paidAt) : '—'}
                                                {inv.paymentMethod && <span className="ml-1.5 text-fg-muted">· {inv.paymentMethod}</span>}
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<Download size={12} />}
                                                    onClick={() => toast.success(`Downloaded ${inv.number}.pdf`)}>
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

            {/* Pay modal -------------------------------------------------- */}
            <PayModal
                target={payTarget}
                overdueCount={outstandingCount}
                overdueAmount={outstandingTotal}
                onCancel={() => setPayTarget(null)}
                onConfirm={(method) => payTarget && handlePay(payTarget, method)}
            />
        </>
    )
}

// -----------------------------------------------------------------------------

const OutstandingHero = ({
    overdueTotal,
    outstandingTotal,
    overdueCount,
    outstandingCount,
    onPayAll
}: {
    overdueTotal: number
    outstandingTotal: number
    overdueCount: number
    outstandingCount: number
    onPayAll: () => void
}) => {
    // "All clear" state -------------------------------------------------------
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
            <div className="shrink-0">
                <Button
                    size="lg"
                    className="!bg-white !text-[var(--color-fg)] !border-white hover:!bg-white/90"
                    leftIcon={<CreditCard size={14} />}
                    onClick={onPayAll}>
                    {overdueCount > 1 ? 'Pay all overdue' : 'Pay now'} · {fmtINR(outstandingTotal)}
                </Button>
            </div>
        </div>
    )
}

// -----------------------------------------------------------------------------

const InvoiceRow = ({ inv, onPay }: { inv: TInvoice; onPay: () => void }) => {
    const total = invoiceTotal(inv)
    const daysOverdue = daysFromNow(inv.dueAt)
    const isOverdue = inv.status === 'OVERDUE'

    return (
        <Card className={cn('!p-5 flex flex-col sm:flex-row sm:items-center gap-4', isOverdue && 'ring-1 ring-[var(--color-danger)]/30')}>
            <div
                className={cn(
                    'w-10 h-10 rounded-md flex items-center justify-center shrink-0',
                    isOverdue
                        ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                        : 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                )}>
                <Receipt size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <Badge tone={feeTone[inv.status]}>{inv.status}</Badge>
                    <span className="font-mono text-xs text-fg-muted">{inv.number}</span>
                </div>
                <div className="mt-1 text-sm font-medium text-fg truncate">{inv.course}</div>
                <div className="mt-1 text-xs text-fg-muted inline-flex items-center gap-1.5">
                    <Calendar size={11} />
                    {isOverdue ? (
                        <span className="text-[var(--color-danger)] font-medium">
                            {Math.abs(daysOverdue)} day{Math.abs(daysOverdue) === 1 ? '' : 's'} overdue · was due {fmtDate(inv.dueAt)}
                        </span>
                    ) : (
                        <>
                            Due {fmtDate(inv.dueAt)}{' '}
                            <span className="text-fg-muted">
                                · in {daysOverdue} day{daysOverdue === 1 ? '' : 's'}
                            </span>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                    <div className="font-mono text-lg font-semibold text-fg">{fmtINR(total)}</div>
                    <div className="text-[11px] text-fg-muted">incl. {inv.gstPercent}% GST</div>
                </div>
                <Button
                    size="sm"
                    leftIcon={<CreditCard size={13} />}
                    onClick={onPay}>
                    Pay now
                </Button>
            </div>
        </Card>
    )
}

// -----------------------------------------------------------------------------

const PayModal = ({
    target,
    overdueCount,
    overdueAmount,
    onCancel,
    onConfirm
}: {
    target: TInvoice | 'ALL' | null
    overdueCount: number
    overdueAmount: number
    onCancel: () => void
    onConfirm: (method: string) => void
}) => {
    const [method, setMethod] = useState('UPI')
    const [submitting, setSubmitting] = useState(false)

    const isBatch = target === 'ALL'
    const amount = isBatch ? overdueAmount : target ? invoiceTotal(target) : 0

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        // Replace with Razorpay Checkout in production — this mock simulates a
        // brief redirect so the loading state is visible.
        await new Promise((r) => setTimeout(r, 600))
        setSubmitting(false)
        onConfirm(method)
        setMethod('UPI')
    }

    return (
        <Modal
            open={target !== null}
            onClose={() => {
                if (!submitting) onCancel()
            }}
            title={isBatch ? 'Pay all outstanding' : 'Pay invoice'}
            description={
                isBatch
                    ? `Pay ${overdueCount} invoice${overdueCount === 1 ? '' : 's'} in one transaction.`
                    : target
                      ? `${target.number} · ${target.course}`
                      : ''
            }
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        form="pay-form"
                        type="submit"
                        loading={submitting}
                        leftIcon={!submitting ? <CreditCard size={14} /> : undefined}>
                        Pay {fmtINR(amount)}
                    </Button>
                </>
            }>
            <form
                id="pay-form"
                onSubmit={submit}
                className="space-y-4">
                <div className="rounded-md border bg-surface-2 p-4 space-y-2 text-sm">
                    <Row
                        label={isBatch ? 'Outstanding total' : 'Subtotal'}
                        value={fmtINR(amount)}
                        mono
                        bold
                    />
                    {!isBatch && target && (
                        <>
                            <Row
                                label="GST"
                                value={`${target.gstPercent}%`}
                            />
                            <Row
                                label="Course"
                                value={target.course}
                            />
                        </>
                    )}
                </div>
                <Select
                    label="Payment method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}>
                    <option value="UPI">UPI</option>
                    <option value="Card">Credit / Debit card</option>
                    <option value="Netbanking">Netbanking</option>
                    <option value="Wallet">Wallet</option>
                </Select>
                <p className="text-xs text-fg-muted">
                    You'll be redirected to Razorpay to complete the payment. Your session resumes once the bank confirms.
                </p>
            </form>
        </Modal>
    )
}

const Row = ({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-fg-muted text-xs">{label}</span>
        <span className={cn('text-fg text-right truncate', mono && 'font-mono', bold && 'font-semibold')}>{value}</span>
    </div>
)
