import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, FileText, Download, AlertTriangle, Building2, Mail, Phone, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { StatCard, Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES, type TRole } from '@shared/constants/roles'
import { StudentFeesPage } from './StudentFeesPage'
import { listAdminInvoices, refundInvoice, type AdminInvoiceRow, type InvoiceStatus } from '../services/payment.service'
import { listClientPaymentsSummary, listTenantPayments, type ClientPaymentSummary, type TenantPayment } from '@features/admin/services/tenant.service'
import { downloadTablePdf, viewTablePdf, fmtPaiseINR, fmtDate, type PdfTableInput } from '@shared/libs/pdf'

// Router mounts this at /app/payments for ADMIN / SUPER_ADMIN / TRAINER / STUDENT.
// Dispatch by role:
//   STUDENT      → pay-now Fees page (Razorpay checkout)
//   SUPER_ADMIN  → cross-tenant SaaS billing rollup
//   ADMIN/TRAINER → student-fee invoices for their tenant
export const PaymentsPage = () => {
    const role = useAuthStore((s) => s.user?.role)
    if (role === ROLES.STUDENT) return <StudentFeesPage />
    if (role === ROLES.SUPER_ADMIN) return <SuperAdminClientPaymentsPage />
    return <AdminPaymentsPage role={role} />
}

const TONE: Record<InvoiceStatus, 'ok' | 'warn' | 'danger' | 'default'> = {
    PAID: 'ok',
    DUE: 'warn',
    FAILED: 'danger',
    REFUNDED: 'default',
    DRAFT: 'default'
}

// ---- SUPER_ADMIN: client (B2B) SaaS-billing rollup --------------------------

const SuperAdminClientPaymentsPage = () => {
    const summaryQuery = useQuery({
        queryKey: ['client-payments-summary'],
        queryFn: listClientPaymentsSummary,
        staleTime: 30_000
    })

    const clients = useMemo(() => summaryQuery.data ?? [], [summaryQuery.data])

    const totals = useMemo(() => {
        const outstanding = clients.reduce((n, c) => n + c.outstanding, 0)
        const overdueClients = clients.filter((c) => c.overdueCount > 0).length
        const pendingClients = clients.filter((c) => c.pendingCount > 0).length
        return { outstanding, overdueClients, pendingClients }
    }, [clients])

    const buildSummaryInput = (): PdfTableInput => ({
        title: 'Client payments — outstanding balances',
        subtitle: 'Tenants with open SaaS invoices',
        summary: [
            { label: 'Total outstanding', value: fmtPaiseINR(totals.outstanding) },
            { label: 'Clients overdue', value: String(totals.overdueClients) },
            { label: 'Clients with pending', value: String(totals.pendingClients) }
        ],
        head: [['Tenant', 'Slug', 'Outstanding', 'Pending', 'Overdue', 'Last paid']],
        body: clients.map((c) => [c.name, `/${c.slug}`, fmtPaiseINR(c.outstanding), c.pendingCount, c.overdueCount, fmtDate(c.lastPaidAt)])
    })

    const previewPdf = () => viewTablePdf(buildSummaryInput())
    const exportPdf = () => {
        downloadTablePdf(`client-payments-${new Date().toISOString().slice(0, 10)}.pdf`, buildSummaryInput())
        toast.success('PDF downloaded')
    }

    // Per-tenant statement: View opens a preview tab; Download saves the PDF.
    const buildStatementInput = (client: ClientPaymentSummary, payments: TenantPayment[]): PdfTableInput => {
        const paid = payments.filter((p) => p.status === 'PAID').reduce((n, p) => n + p.amount, 0)
        const pending = payments.filter((p) => p.status === 'PENDING' || p.status === 'FAILED').reduce((n, p) => n + p.amount, 0)
        return {
            title: `${client.name} — SaaS Statement`,
            subtitle: `Tenant /${client.slug}`,
            summary: [
                { label: 'Paid (lifetime)', value: fmtPaiseINR(paid) },
                { label: 'Outstanding', value: fmtPaiseINR(pending) },
                { label: 'Invoices', value: String(payments.length) }
            ],
            head: [['Issued', 'Plan / period', 'Amount', 'Status', 'Paid on']],
            body: payments.map((p) => [fmtDate(p.createdAt), p.planLabel ?? '—', fmtPaiseINR(p.amount), p.status, fmtDate(p.paidAt)])
        }
    }

    const viewStatement = async (client: ClientPaymentSummary) => {
        try {
            const payments = await listTenantPayments(client.id)
            viewTablePdf(buildStatementInput(client, payments))
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not open statement')
        }
    }

    const downloadStatement = async (client: ClientPaymentSummary) => {
        try {
            const payments = await listTenantPayments(client.id)
            downloadTablePdf(`statement-${client.slug}-${new Date().toISOString().slice(0, 10)}.pdf`, buildStatementInput(client, payments))
            toast.success(`${client.name} statement downloaded`)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not download statement')
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Finance"
                title="Client payments"
                description="Outstanding SaaS balances per tenant. Drill into a tenant from the Tenants page to issue or reconcile a payment."
                actions={
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Eye size={14} />}
                            disabled={clients.length === 0}
                            onClick={previewPdf}>
                            View
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Download size={14} />}
                            disabled={clients.length === 0}
                            onClick={exportPdf}>
                            Download
                        </Button>
                    </>
                }
            />

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Total outstanding"
                    value={fmtPaiseINR(totals.outstanding)}
                    tone="down"
                    icon={<FileText size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Clients overdue"
                    value={`${totals.overdueClients}`}
                    tone={totals.overdueClients > 0 ? 'down' : 'neutral'}
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

            {summaryQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : clients.length === 0 ? (
                <Empty
                    icon={<Building2 size={32} />}
                    title="No tenants yet"
                    description="Issue an invoice from a tenant's Payments tab once you've onboarded one."
                />
            ) : (
                <Card padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-fg-muted font-medium bg-surface-2">
                                    <th className="py-3 px-5">Tenant</th>
                                    <th className="py-3 px-5">Contact</th>
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
                                                <div className="text-xs text-fg-muted font-mono">/{c.slug}</div>
                                            </td>
                                            <td className="py-3 px-5">
                                                {c.contactEmail ? (
                                                    <div className="text-xs text-fg-muted inline-flex items-center gap-1">
                                                        <Mail size={10} /> {c.contactEmail}
                                                    </div>
                                                ) : null}
                                                {c.contactPhone ? (
                                                    <div className="text-xs text-fg-muted inline-flex items-center gap-1">
                                                        <Phone size={10} /> {c.contactPhone}
                                                    </div>
                                                ) : null}
                                                {!c.contactEmail && !c.contactPhone && <span className="text-xs text-fg-muted">—</span>}
                                            </td>
                                            <td className="py-3 px-5 font-mono">
                                                {isClear ? <span className="text-fg-muted">—</span> : <span className="font-semibold text-fg">{fmtPaiseINR(c.outstanding)}</span>}
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
                                                    leftIcon={<Eye size={12} />}
                                                    onClick={() => void viewStatement(c)}>
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<Download size={12} />}
                                                    onClick={() => void downloadStatement(c)}>
                                                    PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </>
    )
}

// ---- ADMIN / TRAINER: collections view (real invoices) ----------------------

const AdminPaymentsPage = ({ role }: { role: TRole | undefined }) => {
    const queryClient = useQueryClient()
    const isTrainer = role === ROLES.TRAINER

    const invoicesQuery = useQuery({
        queryKey: ['admin-invoices'],
        queryFn: listAdminInvoices,
        staleTime: 30_000
    })

    const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data])

    const refundMutation = useMutation({
        mutationFn: refundInvoice,
        onSuccess: () => {
            toast.success('Invoice refunded')
            void queryClient.invalidateQueries({ queryKey: ['admin-invoices'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not refund')
    })

    const overdue = useMemo(
        () => invoices.filter((i) => i.status === 'DUE' && i.dueAt && new Date(i.dueAt).getTime() < Date.now()),
        [invoices]
    )
    const overdueTotal = overdue.reduce((n, i) => n + i.totalAmount, 0)
    const collected = invoices.filter((i) => i.status === 'PAID').reduce((n, i) => n + i.totalAmount, 0)

    const buildInvoicesInput = (): PdfTableInput => ({
        title: 'Payments & overdue',
        subtitle: isTrainer ? 'Invoices for your batches' : 'Tenant invoice activity',
        summary: [
            { label: 'Collected', value: fmtPaiseINR(collected) },
            { label: 'Overdue count', value: String(overdue.length) },
            { label: 'Overdue total', value: fmtPaiseINR(overdueTotal) }
        ],
        head: [['Invoice', 'Student', 'Amount', 'Status', 'Due', 'Paid']],
        body: invoices.map((i) => [
            i.number,
            i.user ? `${i.user.firstName} ${i.user.lastName}`.trim() || i.user.email : '—',
            fmtPaiseINR(i.totalAmount),
            i.status,
            fmtDate(i.dueAt),
            fmtDate(i.paidAt)
        ])
    })

    const previewPdf = () => viewTablePdf(buildInvoicesInput())
    const exportPdf = () => {
        downloadTablePdf(`payments-${new Date().toISOString().slice(0, 10)}.pdf`, buildInvoicesInput())
        toast.success('PDF downloaded')
    }

    const headerProps = isTrainer
        ? {
              eyebrow: 'Batch finance',
              title: 'Payments & overdue',
              description: 'Payment activity for your batches.'
          }
        : {
              eyebrow: 'Finance',
              title: 'Payments & overdue',
              description: "Razorpay + GST invoices. Follow up on overdue, refund in one click with an audit note."
          }

    return (
        <>
            <PageHeader
                {...headerProps}
                actions={
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Eye size={14} />}
                            disabled={invoices.length === 0}
                            onClick={previewPdf}>
                            View
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<Download size={14} />}
                            disabled={invoices.length === 0}
                            onClick={exportPdf}>
                            Download
                        </Button>
                    </>
                }
            />

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Collected"
                    value={fmtPaiseINR(collected)}
                    tone="up"
                    icon={<CreditCard size={18} />}
                    accent="teal"
                />
                <StatCard
                    label={`Overdue · ${overdue.length}`}
                    value={fmtPaiseINR(overdueTotal)}
                    tone={overdue.length > 0 ? 'down' : 'neutral'}
                    icon={<AlertTriangle size={18} />}
                    accent="orange"
                />
                <StatCard
                    label="Total invoices"
                    value={String(invoices.length)}
                    tone="neutral"
                    icon={<FileText size={18} />}
                    accent="brand"
                />
            </div>

            {invoicesQuery.isLoading ? (
                <Card>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-2/3" />
                </Card>
            ) : invoices.length === 0 ? (
                <Empty
                    icon={<FileText size={32} />}
                    title="No invoices yet"
                    description="Invoices are generated automatically when students enrol in a paid course."
                />
            ) : (
                <InvoiceTable
                    invoices={invoices}
                    isTrainer={isTrainer}
                    onRefund={(id) => {
                        if (!window.confirm('Refund this invoice? This cannot be undone.')) return
                        refundMutation.mutate(id)
                    }}
                />
            )}
        </>
    )
}

const InvoiceTable = ({
    invoices,
    isTrainer,
    onRefund
}: {
    invoices: AdminInvoiceRow[]
    isTrainer: boolean
    onRefund: (id: string) => void
}) => (
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
                    {invoices.map((i) => {
                        const isOverdue = i.status === 'DUE' && i.dueAt && new Date(i.dueAt).getTime() < Date.now()
                        return (
                            <tr
                                key={i.id}
                                className="hover:bg-surface-hover">
                                <td className="py-3 px-5 font-mono text-xs">{i.number}</td>
                                <td className="py-3 px-5">
                                    <div className="text-fg font-medium">
                                        {i.user ? `${i.user.firstName} ${i.user.lastName}`.trim() || i.user.email : '—'}
                                    </div>
                                    {i.user?.email && <div className="text-xs text-fg-muted">{i.user.email}</div>}
                                </td>
                                <td className="py-3 px-5 font-mono">{fmtPaiseINR(i.totalAmount)}</td>
                                <td className="py-3 px-5">
                                    <Badge tone={TONE[i.status]}>{i.status}</Badge>
                                    {isOverdue && <span className="ml-2 text-[11px] text-[var(--color-danger)]">Overdue</span>}
                                </td>
                                <td className="py-3 px-5 text-xs text-fg-muted">{fmtDate(i.dueAt)}</td>
                                <td className="py-3 px-5 text-right space-x-1">
                                    {i.status === 'PAID' && !isTrainer && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="!text-[var(--color-danger)]"
                                            onClick={() => onRefund(i.id)}>
                                            Refund
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
)

