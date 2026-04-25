import { useMemo, useState } from 'react'
import { CreditCard, FileText, RefreshCw, Download, AlertTriangle, Building2, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { StatCard, Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES, type TRole } from '@shared/constants/roles'
import { StudentFeesPage } from './StudentFeesPage'

type Inv = { n: string; who: string; amt: number; st: 'PAID' | 'DUE' | 'OVERDUE' | 'REFUNDED'; due: string; daysOverdue?: number }

const INITIAL: Inv[] = [
    { n: 'INV-2404-001', who: 'Ishaan Mehra', amt: 4999, st: 'PAID', due: 'Apr 04' },
    { n: 'INV-2404-002', who: 'Sneha Patil', amt: 5999, st: 'DUE', due: 'Apr 22' },
    { n: 'INV-2404-003', who: 'Rahul Nair', amt: 3499, st: 'OVERDUE', due: 'Apr 08', daysOverdue: 11 },
    { n: 'INV-2404-004', who: 'Priya Shah', amt: 7499, st: 'OVERDUE', due: 'Apr 12', daysOverdue: 7 },
    { n: 'INV-2403-099', who: 'Rohit Gupta', amt: 2999, st: 'REFUNDED', due: 'Mar 30' }
]

const TONE = {
    PAID: 'ok',
    DUE: 'warn',
    OVERDUE: 'danger',
    REFUNDED: 'default'
} as const

// Router mounts this at /app/payments for ADMIN / SUPER_ADMIN / TRAINER / STUDENT.
// Dispatch by role — SuperAdmin gets the tenant-billing overview, Student gets
// the pay-now Fees page, everyone else sees the admin collections view.
export const PaymentsPage = () => {
    const role = useAuthStore((s) => s.user?.role)
    if (role === ROLES.STUDENT) return <StudentFeesPage />
    if (role === ROLES.SUPER_ADMIN) return <SuperAdminClientPaymentsPage />
    return <AdminPaymentsPage role={role} />
}

// ---- Super Admin: client (B2B) payment pending ------------------------------

type ClientRow = {
    id: string
    name: string
    contact: string
    email: string
    phone: string
    outstanding: number
    overdueCount: number
    pendingCount: number
    lastPaidAt: string | null
}

const CLIENT_PENDING: ClientRow[] = [
    {
        id: 'cl-1',
        name: 'Nimbus Corp',
        contact: 'Aarti Rao',
        email: 'finance@nimbus.io',
        phone: '+91 98200 12345',
        outstanding: 124000,
        overdueCount: 2,
        pendingCount: 3,
        lastPaidAt: '2026-03-08'
    },
    {
        id: 'cl-2',
        name: 'Bluefin Labs',
        contact: 'Rohan Desai',
        email: 'accounts@bluefin.dev',
        phone: '+91 98111 55432',
        outstanding: 58900,
        overdueCount: 1,
        pendingCount: 1,
        lastPaidAt: '2026-04-01'
    },
    {
        id: 'cl-3',
        name: 'Orbit Edtech',
        contact: 'Meera Iyer',
        email: 'meera@orbit.edu',
        phone: '+91 99100 77888',
        outstanding: 32000,
        overdueCount: 0,
        pendingCount: 2,
        lastPaidAt: '2026-04-14'
    },
    {
        id: 'cl-4',
        name: 'Acme Consulting',
        contact: 'Sid Kapoor',
        email: 'billing@acme-con.com',
        phone: '+91 98765 43210',
        outstanding: 0,
        overdueCount: 0,
        pendingCount: 0,
        lastPaidAt: '2026-04-17'
    }
]

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

const SuperAdminClientPaymentsPage = () => {
    const [clients] = useState<ClientRow[]>(CLIENT_PENDING)

    const totals = useMemo(() => {
        const outstanding = clients.reduce((n, c) => n + c.outstanding, 0)
        const overdueClients = clients.filter((c) => c.overdueCount > 0).length
        const pendingClients = clients.filter((c) => c.pendingCount > 0).length
        return { outstanding, overdueClients, pendingClients }
    }, [clients])

    return (
        <>
            <PageHeader
                eyebrow="Finance"
                title="Client payments"
                description="Outstanding balances across client (B2B) accounts. Follow up on overdue invoices first."
                actions={
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Download size={14} />}
                        onClick={() => toast.success('Client statement exported')}>
                        Export
                    </Button>
                }
            />

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Total outstanding"
                    value={fmtINR(totals.outstanding)}
                    tone="down"
                    icon={<FileText size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Clients overdue"
                    value={`${totals.overdueClients}`}
                    tone="down"
                    icon={<AlertTriangle size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Clients with pending"
                    value={`${totals.pendingClients}`}
                    tone="neutral"
                    icon={<Building2 size={18} />}
                    accent="brand"
                />
            </div>

            <Card padded={false}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                <th className="py-3 px-5">Client</th>
                                <th className="py-3 px-5">Finance contact</th>
                                <th className="py-3 px-5">Outstanding</th>
                                <th className="py-3 px-5">Pending</th>
                                <th className="py-3 px-5">Last paid</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {clients.map((c) => {
                                const isClear = c.outstanding === 0
                                return (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-surface-hover">
                                        <td className="py-3 px-5">
                                            <div className="font-medium text-fg">{c.name}</div>
                                            <div className="text-xs text-fg-muted">{c.id.toUpperCase()}</div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="text-fg">{c.contact}</div>
                                            <div className="text-xs text-fg-muted inline-flex items-center gap-1">
                                                <Mail size={10} /> {c.email}
                                            </div>
                                            <div className="text-xs text-fg-muted inline-flex items-center gap-1">
                                                <Phone size={10} /> {c.phone}
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 font-mono">
                                            {isClear ? (
                                                <span className="text-fg-muted">—</span>
                                            ) : (
                                                <span className="font-semibold text-fg">{fmtINR(c.outstanding)}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-5">
                                            {c.overdueCount > 0 && <Badge tone="danger">{c.overdueCount} overdue</Badge>}
                                            {c.pendingCount > 0 && c.overdueCount === 0 && <Badge tone="warn">{c.pendingCount} due</Badge>}
                                            {isClear && <Badge tone="ok">All paid</Badge>}
                                        </td>
                                        <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(c.lastPaidAt)}</td>
                                        <td className="py-3 px-5 text-right space-x-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => toast.success(`Opened ${c.name} statement`)}>
                                                Statement
                                            </Button>
                                            {!isClear && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => toast.success(`Reminder sent to ${c.contact}`)}>
                                                    Remind
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    )
}

// ---- Admin / Trainer / Client collections view -------------------------------
// Admin & Trainer see overdue + all invoice activity. Client sees their own
// billing (same layout, handled on the backend via scoping in Phase 2).

const AdminPaymentsPage = ({ role }: { role: TRole | undefined }) => {
    const [invoices, setInvoices] = useState<Inv[]>(INITIAL)
    const [syncing, setSyncing] = useState(false)

    const isTrainer = role === ROLES.TRAINER

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

    const overdue = invoices.filter((i) => i.st === 'OVERDUE')
    const overdueTotal = overdue.reduce((n, i) => n + i.amt, 0)
    const collected = invoices.filter((i) => i.st === 'PAID').reduce((n, i) => n + i.amt, 0)

    const headerProps = isTrainer
        ? {
              eyebrow: 'Batch finance',
              title: 'Payments & overdue',
              description: 'Payment activity for your batches. Flag overdue learners so the admin team can follow up.'
          }
        : {
              eyebrow: 'Finance',
              title: 'Payments & overdue',
              description: 'Razorpay + GST invoices. Follow up on overdue, refund in one click with an audit note.'
          }

    return (
        <>
            <PageHeader
                {...headerProps}
                actions={
                    !isTrainer && (
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
                    )
                }
            />

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Collected (30d)"
                    value={fmtINR(collected)}
                    tone="up"
                    delta="+24%"
                    icon={<CreditCard size={18} />}
                    accent="teal"
                />
                <StatCard
                    label={`Overdue · ${overdue.length}`}
                    value={fmtINR(overdueTotal)}
                    tone="down"
                    icon={<AlertTriangle size={18} />}
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
                                    <td className="py-3 px-5 font-mono">{fmtINR(i.amt)}</td>
                                    <td className="py-3 px-5">
                                        <Badge tone={TONE[i.st]}>{i.st}</Badge>
                                        {i.st === 'OVERDUE' && i.daysOverdue && (
                                            <span className="ml-2 text-[11px] text-[var(--color-danger)]">{i.daysOverdue}d late</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-5 text-xs text-fg-muted">{i.due}</td>
                                    <td className="py-3 px-5 text-right space-x-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toast.success(`Opened ${i.n}.pdf`)}>
                                            PDF
                                        </Button>
                                        {i.st === 'OVERDUE' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => toast.success(`Reminder sent for ${i.n}`)}>
                                                Remind
                                            </Button>
                                        )}
                                        {i.st === 'PAID' && !isTrainer && (
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
