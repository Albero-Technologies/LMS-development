import { InvoiceStatus, PaymentGateway, type Prisma } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { resolveRazorpay } from './razorpay.client'

const baseInvoiceSelect = {
    id: true,
    number: true,
    amount: true,
    currency: true,
    gstPercent: true,
    gstAmount: true,
    totalAmount: true,
    status: true,
    dueAt: true,
    paidAt: true,
    pdfUrl: true,
    gateway: true,
    gatewayOrderId: true,
    enrollmentId: true,
    createdAt: true,
    enrollment: {
        select: {
            id: true,
            status: true,
            course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } }
        }
    }
} satisfies Prisma.InvoiceSelect

// Filter out invoices that are orphaned by an ACTIVE / COMPLETED enrollment.
// These can exist on accounts that pre-date the idempotency fix in
// startEnrollment, where each click of "Pay now" used to mint a fresh invoice
// and only one of them got paid — leaving the others dangling as "you still
// owe ₹X" ghosts. The enum has no CANCELLED state, so we just hide them on
// read instead of mutating.
const orphanFilter = {
    NOT: {
        AND: [
            { status: { in: [InvoiceStatus.DUE, InvoiceStatus.FAILED] } },
            { enrollment: { status: { in: ['ACTIVE' as const, 'COMPLETED' as const] } } }
        ]
    }
} satisfies Prisma.InvoiceWhereInput

export const listMyPendingInvoices = async (tenantId: string, userId: string) => {
    return db.client.invoice.findMany({
        where: {
            tenantId,
            userId,
            status: { in: [InvoiceStatus.DUE, InvoiceStatus.FAILED] },
            ...orphanFilter
        },
        select: baseInvoiceSelect,
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }]
    })
}

export const listMyInvoices = async (tenantId: string, userId: string) => {
    return db.client.invoice.findMany({
        where: { tenantId, userId, ...orphanFilter },
        select: baseInvoiceSelect,
        orderBy: { createdAt: 'desc' }
    })
}

// ADMIN / TRAINER — all invoices in the tenant. Trainers see only invoices
// for their own courses; admins see everything.
export const adminListInvoices = async (tenantId: string, opts: { trainerId?: string }) => {
    const where: Prisma.InvoiceWhereInput = { tenantId }
    if (opts.trainerId) where.enrollment = { course: { trainerId: opts.trainerId } }
    return db.client.invoice.findMany({
        where,
        select: {
            ...baseInvoiceSelect,
            user: { select: { id: true, firstName: true, lastName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
    })
}

// ADMIN — soft refund. Marks invoice as REFUNDED; the actual gateway-side
// refund is initiated separately (Razorpay dashboard / webhook).
export const refundInvoice = async (tenantId: string, invoiceId: string) => {
    const invoice = await db.client.invoice.findFirst({ where: { id: invoiceId, tenantId } })
    if (!invoice) throw AppError.notFound(responseMessage.NOT_FOUND('Invoice'), 'INVOICE_NOT_FOUND')
    if (invoice.status !== InvoiceStatus.PAID) {
        throw AppError.badRequest('Only paid invoices can be refunded', 'INVOICE_NOT_PAID')
    }
    return db.client.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.REFUNDED }
    })
}

// Issue / re-issue a Razorpay order for an invoice the caller owns.
// Reuses an existing order if the invoice already has one to keep handshake signatures stable.
export const createOrderForInvoice = async (tenantId: string, userId: string, invoiceId: string) => {
    const invoice = await db.client.invoice.findFirst({
        where: { id: invoiceId, tenantId, userId },
        select: baseInvoiceSelect
    })
    if (!invoice) throw AppError.notFound(responseMessage.NOT_FOUND('Invoice'), 'INVOICE_NOT_FOUND')
    if (invoice.status === InvoiceStatus.PAID) {
        throw AppError.conflict('Invoice already paid', 'INVOICE_PAID')
    }
    if (invoice.totalAmount <= 0) {
        throw AppError.badRequest('Invoice has no payable amount', 'INVOICE_ZERO')
    }

    let orderId = invoice.gatewayOrderId
    let amount = invoice.totalAmount

    const rp = await resolveRazorpay(tenantId)
    if (!orderId) {
        const order = await rp.client.orders.create({
            amount: invoice.totalAmount,
            currency: invoice.currency,
            receipt: invoice.number,
            notes: { tenantId, invoiceId: invoice.id, userId }
        })
        orderId = order.id
        amount = Number(order.amount)
        await db.client.invoice.update({
            where: { id: invoice.id },
            data: {
                gatewayOrderId: orderId,
                gateway: PaymentGateway.RAZORPAY,
                status: InvoiceStatus.DUE
            }
        })
    }

    return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        order: {
            id: orderId,
            amount,
            currency: invoice.currency,
            keyId: rp.keyId
        }
    }
}

// Render a printable receipt as HTML. The browser's Print → Save as PDF
// flow turns this into a real PDF without needing a server-side PDF
// library. Tenant branding (color + logo + contact email) flows through
// so each receipt looks like the institute issued it.
export const renderInvoiceReceipt = async (
    tenantId: string,
    invoiceId: string,
    actor: { userId: string; role: string }
): Promise<string> => {
    const invoice = await db.client.invoice.findFirst({
        where: { id: invoiceId, tenantId },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            enrollment: { include: { course: { select: { title: true } } } },
            tenant: { select: { name: true, brandingColor: true, brandingLogo: true, settings: true } }
        }
    })
    if (!invoice) throw AppError.notFound(responseMessage.NOT_FOUND('Invoice'))

    // Students can only view their own receipts; staff see anyone in tenant.
    const STAFF = ['ADMIN', 'SUPER_ADMIN', 'TRAINER', 'COUNSELLOR', 'COUNSELLING_MANAGER', 'SUPPORT']
    if (!STAFF.includes(actor.role) && invoice.userId !== actor.userId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'INVOICE_FORBIDDEN')
    }

    const tenant = invoice.tenant
    const contactEmail = (tenant.settings as { contacts?: { primaryEmail?: string } } | null)?.contacts?.primaryEmail ?? ''
    const brand = tenant.brandingColor || '#0d4f3c'
    const logo = tenant.brandingLogo
    const studentName = `${invoice.user.firstName} ${invoice.user.lastName}`.trim() || invoice.user.email
    const courseTitle = invoice.enrollment?.course?.title ?? '—'
    const fmt = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`
    const date = (d: Date | null) =>
        d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

    const esc = (s: string): string =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Receipt ${esc(invoice.number)}</title>
<style>
@page { size: A4; margin: 18mm; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; }
h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; }
.muted { color: #64748b; }
.brand { color: ${brand}; }
table { width: 100%; border-collapse: collapse; margin-top: 18px; }
th, td { padding: 10px 12px; text-align: left; }
thead { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.totals td { padding: 6px 12px; }
.print-btn { position: fixed; top: 16px; right: 16px; padding: 10px 14px; background: ${brand}; color: #fff; border: 0; border-radius: 8px; font-size: 13px; cursor: pointer; }
@media print { .print-btn { display: none; } }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
<div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid ${brand};padding-bottom:18px;">
  <div>
    ${logo ? `<img src="${esc(logo)}" alt="${esc(tenant.name)}" style="max-height:48px;display:block;margin-bottom:8px;" />` : `<h1>${esc(tenant.name)}</h1>`}
    ${contactEmail ? `<div class="muted" style="font-size:12px;">${esc(contactEmail)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Receipt</div>
    <div style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:18px;margin-top:4px;">${esc(invoice.number)}</div>
    <div class="muted" style="font-size:12px;margin-top:4px;">Issued ${date(invoice.createdAt)}</div>
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px;">
  <div>
    <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Billed to</div>
    <div style="font-weight:600;margin-top:4px;">${esc(studentName)}</div>
    <div class="muted" style="font-size:12px;">${esc(invoice.user.email)}</div>
  </div>
  <div>
    <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Status</div>
    <div style="font-weight:600;margin-top:4px;color:${invoice.status === 'PAID' ? '#10b981' : '#f59e0b'};">${esc(invoice.status)}</div>
    ${invoice.paidAt ? `<div class="muted" style="font-size:12px;">Paid on ${date(invoice.paidAt)}</div>` : ''}
  </div>
</div>

<table>
  <thead>
    <tr><th>Item</th><th style="text-align:right;">Amount</th></tr>
  </thead>
  <tbody>
    <tr><td>${esc(courseTitle)}<div class="muted" style="font-size:11px;">${esc(invoice.paymentMethod ?? '')}${invoice.paymentNote ? ` · ${esc(invoice.paymentNote)}` : ''}</div></td><td style="text-align:right;">${fmt(invoice.amount)}</td></tr>
  </tbody>
</table>

<table class="totals" style="margin-top:8px;max-width:280px;margin-left:auto;">
  <tr><td class="muted">Subtotal</td><td style="text-align:right;">${fmt(invoice.amount)}</td></tr>
  <tr><td class="muted">GST (${invoice.gstPercent}%)</td><td style="text-align:right;">${fmt(invoice.gstAmount)}</td></tr>
  <tr style="border-top:1px solid #e2e8f0;"><td style="font-weight:700;">Total</td><td style="text-align:right;font-weight:700;">${fmt(invoice.totalAmount)}</td></tr>
</table>

<div class="muted" style="margin-top:48px;font-size:11px;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px;">
  ${invoice.gatewayPaymentId ? `Razorpay payment ${esc(invoice.gatewayPaymentId)} · ` : ''}This receipt was generated by ${esc(tenant.name)}.
</div>
</body></html>`
}
