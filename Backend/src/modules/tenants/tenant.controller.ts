import { type Request, type Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './tenant.service'
import { writeAudit } from '../../util/audit'

// Tenant creation is typically performed by a SUPER_ADMIN or via a signed onboarding flow.
// Phase 1 leaves the route open behind SUPER_ADMIN auth; see router.
export const createTenant = async (req: Request, res: Response): Promise<void> => {
    const result = await service.createTenant(req.body)
    await writeAudit({ action: 'tenant.create', entityType: 'Tenant', entityId: result.tenant.id, tenantId: result.tenant.id }, req)
    httpResponse(req, res, 201, responseMessage.CREATED, result)
}

export const getMyTenant = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenant = await service.getTenant(req.auth.tenantId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}

// Public lookup by slug — used by the per-tenant landing page (§9.1) before
// the user is authenticated. Returns only the brand-safe subset.
export const getPublicTenant = async (req: Request, res: Response): Promise<void> => {
    const tenant = await service.getPublicTenantBySlug(req.params.slug)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}

// Public read for the CMS — published items only. The renderer's
// Collection-list section calls this so the public site can show blog posts
// / events / press without needing auth.
export const getPublicCollectionItems = async (req: Request, res: Response): Promise<void> => {
    const data = await service.listPublicCollectionItems(req.params.slug, req.params.collectionSlug)
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

// Public detail read — blog post / resource page slug-based lookup. Drafts
// 404 even with a direct link.
export const getPublicCollectionItem = async (req: Request, res: Response): Promise<void> => {
    const data = await service.getPublicCollectionItem(req.params.slug, req.params.collectionSlug, req.params.itemSlug)
    httpResponse(req, res, 200, responseMessage.SUCCESS, data)
}

export const updateMyTenantBranding = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const tenant = await service.updateBranding(req.auth.tenantId, req.body)
    await writeAudit({ action: 'tenant.branding_update', entityType: 'Tenant', entityId: tenant.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}

// SUPER_ADMIN — cross-tenant listing for the SA panel.
export const listAllTenants = async (req: Request, res: Response): Promise<void> => {
    const rows = await service.listAllTenants()
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

// SUPER_ADMIN — full tenant detail for the SA panel's tenant page.
export const getTenantDetail = async (req: Request, res: Response): Promise<void> => {
    const detail = await service.getTenantDetail(req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, detail)
}

// SUPER_ADMIN — update branding/settings of any tenant (Phase B).
export const updateTenantById = async (req: Request, res: Response): Promise<void> => {
    const tenant = await service.updateBranding(req.params.id, req.body)
    await writeAudit({ action: 'tenant.update', entityType: 'Tenant', entityId: tenant.id, tenantId: tenant.id }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}

// SUPER_ADMIN — send a billing reminder to a tenant (§4.2). The body shape is
// validated lightly here; everything is optional so the SA can ship a quick
// "your invoice is due" without filling every field.
export const sendBillingReminder = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const body = req.body as { amount?: number; currency?: string; dueDate?: string; planLabel?: string; note?: string }
    const auth = req.auth

    const senderUser = await import('../../service/db').then((m) => m.default.client.user.findUnique({ where: { id: auth.userId } }))
    const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}`.trim() || senderUser.email : 'Super Admin'

    const result = await service.sendBillingReminder(req.params.id, {
        amount: typeof body.amount === 'number' ? body.amount : undefined,
        currency: body.currency,
        dueDate: body.dueDate,
        planLabel: body.planLabel,
        note: body.note,
        senderId: req.auth.userId,
        senderName
    })

    await writeAudit(
        {
            action: 'tenant.reminder_sent',
            entityType: 'Tenant',
            entityId: req.params.id,
            metadata: { sentTo: result.sentTo, amount: body.amount, dueDate: body.dueDate }
        },
        req
    )

    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

// SUPER_ADMIN — list every SaaS billing record for a tenant (§4.4).
export const listTenantPayments = async (req: Request, res: Response): Promise<void> => {
    const rows = await service.listTenantPayments(req.params.id)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

// SUPER_ADMIN — Client Payments rollup. One row per tenant with their
// outstanding SaaS balance, overdue count, last paid date.
export const listClientPaymentsSummary = async (req: Request, res: Response): Promise<void> => {
    const rows = await service.listClientPaymentsSummary()
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

// SUPER_ADMIN — issue a SaaS invoice for a tenant. Razorpay order creation
// happens on the tenant-admin side when they actually pay (next batch).
export const createTenantPayment = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const body = req.body as {
        amount?: number
        currency?: string
        planLabel?: string
        periodStart?: string
        periodEnd?: string
        description?: string
    }
    if (typeof body.amount !== 'number' || body.amount <= 0) {
        httpResponse(req, res, 400, 'amount must be a positive integer (paise)')
        return
    }
    const payment = await service.createTenantPayment(req.params.id, {
        amount: body.amount,
        currency: body.currency,
        planLabel: body.planLabel,
        periodStart: body.periodStart ? new Date(body.periodStart) : undefined,
        periodEnd: body.periodEnd ? new Date(body.periodEnd) : undefined,
        description: body.description,
        createdById: req.auth.userId
    })
    await writeAudit(
        {
            action: 'tenant.payment_created',
            entityType: 'TenantPayment',
            entityId: payment.id,
            tenantId: payment.tenantId,
            metadata: { amount: payment.amount, currency: payment.currency, planLabel: payment.planLabel }
        },
        req
    )
    httpResponse(req, res, 201, responseMessage.CREATED, payment)
}

// SUPER_ADMIN — manual mark-as-paid (e.g. wire transfer outside Razorpay).
export const setTenantPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as { status?: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' }
    const allowed = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']
    if (!body.status || !allowed.includes(body.status)) {
        httpResponse(req, res, 400, `status must be one of ${allowed.join(', ')}`)
        return
    }
    const payment = await service.setTenantPaymentStatus(req.params.id, req.params.paymentId, body.status)
    await writeAudit(
        {
            action: 'tenant.payment_status_update',
            entityType: 'TenantPayment',
            entityId: payment.id,
            tenantId: payment.tenantId,
            metadata: { status: payment.status }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, payment)
}

// Tenant ADMIN — list this tenant's own SaaS invoices (§10.2).
export const getMyTenantPayments = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const rows = await service.listMyTenantPayments(req.auth.tenantId)
    httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}

// Tenant ADMIN — create / fetch a Razorpay order for one of THEIR pending SaaS
// invoices, so they can pay via the embedded checkout (§10.2).
export const payTenantPayment = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const result = await service.createTenantPaymentOrder(req.auth.tenantId, req.params.id)
    await writeAudit(
        {
            action: 'tenant.payment_order_created',
            entityType: 'TenantPayment',
            entityId: req.params.id,
            metadata: { orderId: result.order.id }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, result)
}

// Tenant ADMIN — verify the Razorpay signature after checkout success (§10.2).
export const verifyTenantPayment = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) return
    const body = req.body as {
        razorpayOrderId?: string
        razorpayPaymentId?: string
        razorpaySignature?: string
    }
    if (!body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) {
        httpResponse(req, res, 400, 'razorpayOrderId, razorpayPaymentId and razorpaySignature are required')
        return
    }
    const payment = await service.verifyTenantPaymentSignature(req.auth.tenantId, req.params.id, {
        razorpayOrderId: body.razorpayOrderId,
        razorpayPaymentId: body.razorpayPaymentId,
        razorpaySignature: body.razorpaySignature
    })
    await writeAudit(
        {
            action: 'tenant.payment_paid',
            entityType: 'TenantPayment',
            entityId: payment.id,
            metadata: { gatewayPaymentId: payment.gatewayPaymentId }
        },
        req
    )
    httpResponse(req, res, 200, responseMessage.SUCCESS, payment)
}

// SUPER_ADMIN — flip status (suspend / reinstate). The accompanying audit log
// is what makes this action accountable.
export const setStatus = async (req: Request, res: Response): Promise<void> => {
    const status = (req.body as { status?: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' }).status
    if (status !== 'ACTIVE' && status !== 'SUSPENDED' && status !== 'TRIAL') {
        httpResponse(req, res, 400, 'Invalid status — must be ACTIVE, SUSPENDED, or TRIAL')
        return
    }
    const tenant = await service.setTenantStatus(req.params.id, status)
    await writeAudit({ action: 'tenant.status_update', entityType: 'Tenant', entityId: tenant.id, metadata: { status } }, req)
    httpResponse(req, res, 200, responseMessage.SUCCESS, tenant)
}
