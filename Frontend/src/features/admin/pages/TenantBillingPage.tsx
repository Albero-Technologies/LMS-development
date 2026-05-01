import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, IndianRupee, History, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore, fullName } from '@shared/stores/authStore'
import { openRazorpayCheckout } from '@features/payments/services/razorpay'
import {
    getMyTenant,
    listMyTenantPayments,
    payMyTenantPayment,
    verifyMyTenantPayment,
    type TenantPayment,
    type TenantPaymentStatus
} from '../services/tenant.service'

const fmtINR = (paise: number, currency: string): string => {
    if (currency === 'INR') return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    return `${currency} ${(paise / 100).toFixed(2)}`
}
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_TONE: Record<TenantPaymentStatus, 'ok' | 'warn' | 'danger' | 'default'> = {
    PAID: 'ok',
    PENDING: 'warn',
    FAILED: 'danger',
    CANCELLED: 'default',
    REFUNDED: 'default'
}

// Tenant ADMIN's own SaaS billing page (§10.2). Lists invoices the SUPER_ADMIN
// has issued and lets the admin pay each PENDING one through the embedded
// Razorpay checkout. Status flips to PAID once the signature verification call
// returns successfully — refetch picks it up.
export const TenantBillingPage = () => {
    const queryClient = useQueryClient()
    const user = useAuthStore((s) => s.user)

    const tenantQuery = useQuery({ queryKey: ['tenant', 'me'], queryFn: getMyTenant, staleTime: 60_000 })
    const paymentsQuery = useQuery({ queryKey: ['tenant', 'me', 'payments'], queryFn: listMyTenantPayments, staleTime: 30_000 })

    const [payingId, setPayingId] = useState<string | null>(null)

    const payMutation = useMutation({
        mutationFn: async (payment: TenantPayment) => {
            const { order } = await payMyTenantPayment(payment.id)
            if (!order.keyId) throw new Error('Razorpay key not configured for this environment')
            const result = await openRazorpayCheckout({
                keyId: order.keyId,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                invoiceNumber: payment.id.slice(0, 8).toUpperCase(),
                courseTitle: payment.planLabel ?? 'SaaS subscription',
                prefill: { name: fullName(user), email: user?.email },
                themeColor: tenantQuery.data?.brandingColor ?? undefined
            })
            await verifyMyTenantPayment(payment.id, {
                razorpayOrderId: result.razorpay_order_id,
                razorpayPaymentId: result.razorpay_payment_id,
                razorpaySignature: result.razorpay_signature
            })
        },
        onSuccess: () => {
            toast.success('Payment received — thank you!')
            void queryClient.invalidateQueries({ queryKey: ['tenant', 'me', 'payments'] })
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Payment failed'
            if (msg !== 'PAYMENT_DISMISSED') toast.error(msg)
        },
        onSettled: () => setPayingId(null)
    })

    const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data])
    const pendingTotal = payments.filter((p) => p.status === 'PENDING').reduce((n, p) => n + p.amount, 0)
    const paidTotal = payments.filter((p) => p.status === 'PAID').reduce((n, p) => n + p.amount, 0)
    const oldestPending = payments.find((p) => p.status === 'PENDING')

    return (
        <>
            <PageHeader
                eyebrow="Subscription"
                title="Billing"
                description="Pay your platform subscription invoices and review previous payments."
            />

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                        <AlertTriangle size={14} /> Outstanding
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-fg">{fmtINR(pendingTotal, 'INR')}</div>
                    {oldestPending && <div className="mt-1 text-xs text-fg-muted">Oldest invoice from {fmtDate(oldestPending.createdAt)}</div>}
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                        <CheckCircle2 size={14} /> Paid (lifetime)
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-fg">{fmtINR(paidTotal, 'INR')}</div>
                </Card>
                <Card className="!p-4">
                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                        <History size={14} /> Invoices
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-fg">{payments.length}</div>
                </Card>
            </div>

            {paymentsQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : payments.length === 0 ? (
                <Empty
                    icon={<IndianRupee size={32} />}
                    title="No invoices yet"
                    description="When the platform issues an invoice for your subscription, it'll show up here."
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">Issued</th>
                                    <th className="py-3 px-5">Plan / period</th>
                                    <th className="py-3 px-5">Amount</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(p.createdAt)}</td>
                                        <td className="py-3 px-5">
                                            <div className="text-fg">{p.planLabel ?? 'Subscription'}</div>
                                            {(p.periodStart || p.periodEnd) && (
                                                <div className="text-xs text-fg-muted">
                                                    {p.periodStart ? fmtDate(p.periodStart) : '?'} → {p.periodEnd ? fmtDate(p.periodEnd) : '?'}
                                                </div>
                                            )}
                                            {p.description && <div className="text-xs text-fg-soft mt-0.5 line-clamp-2">{p.description}</div>}
                                        </td>
                                        <td className="py-3 px-5 font-mono text-sm">{fmtINR(p.amount, p.currency)}</td>
                                        <td className="py-3 px-5">
                                            <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                                            {p.paidAt && <div className="text-[10px] text-fg-muted mt-0.5">Paid {fmtDate(p.paidAt)}</div>}
                                        </td>
                                        <td className="py-3 px-5 text-right">
                                            {p.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    leftIcon={<CreditCard size={14} />}
                                                    loading={payMutation.isPending && payingId === p.id}
                                                    onClick={() => {
                                                        setPayingId(p.id)
                                                        payMutation.mutate(p)
                                                    }}>
                                                    Pay now
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </>
    )
}
