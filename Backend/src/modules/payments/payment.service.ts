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
