import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import { writeAudit } from '../../util/audit'
import * as service from './payment.service'

export const pending = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyPendingInvoices(req.auth.tenantId, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const invoices = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyInvoices(req.auth.tenantId, req.auth.userId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const pay = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.createOrderForInvoice(req.auth.tenantId, req.auth.userId, req.params.invoiceId)
    await writeAudit({ action: 'payment.order_created', entityType: 'Invoice', entityId: result.invoiceId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

// Pay outstanding balance for a DEMO enrolment that doesn't yet have a
// balance invoice. Service lazily creates a DUE invoice + Razorpay order
// using the tenant's Razorpay credentials.
export const payEnrollmentBalance = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.createOrderForEnrollmentBalance(
        req.auth.tenantId,
        req.auth.userId,
        req.params.enrollmentId
    )
    await writeAudit({ action: 'payment.order_created', entityType: 'Invoice', entityId: result.invoiceId }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

// ADMIN / SUPER_ADMIN / TRAINER — collections view across all students in
// the tenant. Trainers are auto-scoped to their own courses on the server.
export const adminInvoices = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const trainerId = req.auth.role === 'TRAINER' ? req.auth.userId : undefined
    const rows = await service.adminListInvoices(req.auth.tenantId, { trainerId })
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

export const refund = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const invoice = await service.refundInvoice(req.auth.tenantId, req.params.invoiceId)
    await writeAudit({ action: 'payment.refunded', entityType: 'Invoice', entityId: invoice.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, invoice)
}

// Print-ready HTML receipt — students hit this from the Fees page Receipt
// column. The browser's "Save as PDF" turns it into a real PDF without
// needing a server-side renderer. Returns text/html (not JSON) so a
// regular <a target="_blank"> link works.
export const receipt = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const html = await service.renderInvoiceReceipt(req.auth.tenantId, req.params.invoiceId, {
        userId: req.auth.userId,
        role: req.auth.role
    })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', `inline; filename="receipt-${req.params.invoiceId}.html"`)
    res.send(html)
}
