import { useState } from 'react'
import { CreditCard, FileText, RefreshCw, Download } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { StatCard, Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { StudentFeesPage } from './StudentFeesPage'

type Inv = { n: string; who: string; amt: number; st: 'PAID' | 'DUE' | 'REFUNDED'; due: string }

const INITIAL: Inv[] = [
    { n: 'INV-2404-001', who: 'Ishaan Mehra', amt: 4999, st: 'PAID', due: 'Apr 04' },
    { n: 'INV-2404-002', who: 'Sneha Patil', amt: 5999, st: 'DUE', due: 'Apr 22' },
    { n: 'INV-2403-099', who: 'Rohit Gupta', amt: 2999, st: 'REFUNDED', due: 'Mar 30' }
]

const TONE = {
    PAID: 'ok',
    DUE: 'warn',
    REFUNDED: 'default'
} as const

// Router mounts this at /app/payments for ADMIN / SUPER_ADMIN / STUDENT / CLIENT.
// Students see a pay-now-centric Fees page; everyone else sees the admin
// collections view below. Keeping the dispatcher here lets the route stay stable.
export const PaymentsPage = () => {
    const role = useAuthStore((s) => s.user?.role)
    if (role === ROLES.STUDENT) return <StudentFeesPage />
    return <AdminPaymentsPage />
}

// ---- Admin / Super Admin collections view ------------------------------------

const AdminPaymentsPage = () => {
    const [invoices, setInvoices] = useState<Inv[]>(INITIAL)
    const [syncing, setSyncing] = useState(false)

    const sync = async () => {
        setSyncing(true)
        await new Promise((r) => setTimeout(r, 700))
        setSyncing(false)
        toast.success('Synced with Razorpay — 0 new payments')
    }

    const refund = (n: string) => {
        if (!window.confirm(`Refund ${n}? This cannot be undone.`)) return
        setInvoices((xs) => xs.map((i) => (i.n === n ? { ...i, st: 'REFUNDED' } : i)))
        toast.success(`${n} refunded`)
    }

    return (
        <>
            <PageHeader
                eyebrow="Finance"
                title="Payments & invoices"
                description="Razorpay + GST invoices. Refund in one click with an auditable note."
                actions={
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<RefreshCw size={14} />}
                            onClick={sync}
                            loading={syncing}>
                            Sync Razorpay
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Download size={14} />}
                            onClick={() => toast.success('Statement downloaded')}>
                            Statement
                        </Button>
                    </>
                }
            />

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Collected (30d)"
                    value="₹3.8L"
                    tone="up"
                    delta="+24%"
                    icon={<CreditCard size={18} />}
                    accent="teal"
                />
                <StatCard
                    label="Overdue"
                    value="₹58k"
                    tone="down"
                    icon={<FileText size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Payment success"
                    value="97.4%"
                    tone="up"
                    icon={<CreditCard size={18} />}
                    accent="brand"
                />
            </div>

            <Card padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                <th className="py-3 px-5">Invoice</th>
                                <th className="py-3 px-5">Student</th>
                                <th className="py-3 px-5">Amount</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5">Due</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {invoices.map((i) => (
                                <tr
                                    key={i.n}
                                    className="hover:bg-surface-hover">
                                    <td className="py-3 px-5 font-mono text-xs">{i.n}</td>
                                    <td className="py-3 px-5 text-fg font-medium">{i.who}</td>
                                    <td className="py-3 px-5 font-mono">₹{i.amt.toLocaleString('en-IN')}</td>
                                    <td className="py-3 px-5">
                                        <Badge tone={TONE[i.st]}>{i.st}</Badge>
                                    </td>
                                    <td className="py-3 px-5 text-xs text-fg-muted">{i.due}</td>
                                    <td className="py-3 px-5 text-right space-x-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toast.success(`Opened ${i.n}.pdf`)}>
                                            PDF
                                        </Button>
                                        {i.st === 'PAID' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="!text-[var(--color-danger)]"
                                                onClick={() => refund(i.n)}>
                                                Refund
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    )
}
