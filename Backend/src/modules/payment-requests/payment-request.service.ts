import { InvoiceStatus, PaymentGateway, PaymentRequestStatus, type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { enqueueNotification } from '../notifications/notification.queue'
import type {
    TCancelPaymentRequestInput,
    TCreatePaymentRequestInput,
    TListPaymentRequestsInput,
    TReviewPaymentRequestInput
} from './payment-request.schema'

interface ScopeContext {
    role: Role
    tenantId: string
    userId: string
}

const fmtName = (u: { firstName: string; lastName: string } | null | undefined): string => (u ? `${u.firstName} ${u.lastName}`.trim() || '—' : '—')

const fmtAmount = (amountMinor: number, currency: string): string => {
    if (currency === 'INR') return `₹${(amountMinor / 100).toLocaleString('en-IN')}`
    return `${currency} ${(amountMinor / 100).toLocaleString()}`
}

// Scope filter for SA cross-tenant listing. Other roles always see their own
// tenant only — silently ignore any tenantSlug they pass.
const resolveTenantWhere = async (slug: string | undefined, ctx: ScopeContext): Promise<{ tenantId?: string; tenant?: Prisma.TenantWhereInput }> => {
    if (ctx.role !== Role.SUPER_ADMIN) return { tenantId: ctx.tenantId }
    if (!slug || slug === '__all__') return { tenant: { slug: { not: 'platform' } } }
    const tenant = await db.client.tenant.findUnique({ where: { slug } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    return { tenantId: tenant.id }
}

// Only counsellors / managers / admin / SA can create requests. Counsellors
// can only request for students they own (via StudentSignup or Enrollment
// attribution). Admins/SA can request on behalf of anyone in their tenant.
const ensureCanRequestFor = async (ctx: ScopeContext, studentId: string): Promise<void> => {
    if (ctx.role === Role.ADMIN || ctx.role === Role.SUPER_ADMIN) return

    if (ctx.role === Role.COUNSELLING_MANAGER) {
        // Manager can request for any of their team's students or their own.
        const direct = await db.client.studentSignup.findFirst({
            where: { tenantId: ctx.tenantId, userId: studentId, counsellor: { OR: [{ id: ctx.userId }, { managerId: ctx.userId }] } }
        })
        if (direct) return
        throw AppError.forbidden('Student is not under your team', 'STUDENT_OUT_OF_SCOPE')
    }

    if (ctx.role === Role.COUNSELLOR) {
        const owned = await db.client.studentSignup.findFirst({
            where: { tenantId: ctx.tenantId, userId: studentId, counsellorId: ctx.userId }
        })
        if (owned) return
        // Or attributed via an Enrollment.counsellorId
        const attributed = await db.client.enrollment.findFirst({
            where: { tenantId: ctx.tenantId, userId: studentId, counsellorId: ctx.userId }
        })
        if (attributed) return
        throw AppError.forbidden('Student is not in your bucket', 'STUDENT_OUT_OF_SCOPE')
    }

    throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')
}

export const createPaymentRequest = async (input: TCreatePaymentRequestInput, ctx: ScopeContext) => {
    if (ctx.role === Role.STUDENT || ctx.role === Role.TRAINER || ctx.role === Role.SUPPORT) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')
    }

    await ensureCanRequestFor(ctx, input.studentId)

    const student = await db.client.user.findFirst({
        where: { id: input.studentId, tenantId: ctx.tenantId, role: Role.STUDENT }
    })
    if (!student) throw AppError.notFound(responseMessage.NOT_FOUND('Student'), 'STUDENT_NOT_FOUND')

    if (input.invoiceId) {
        const invoice = await db.client.invoice.findFirst({
            where: { id: input.invoiceId, tenantId: ctx.tenantId, userId: input.studentId }
        })
        if (!invoice) throw AppError.notFound(responseMessage.NOT_FOUND('Invoice'), 'INVOICE_NOT_FOUND')
        if (invoice.status === InvoiceStatus.PAID) {
            throw AppError.badRequest('Invoice is already paid', 'INVOICE_ALREADY_PAID')
        }
    }

    const created = await db.client.paymentRequest.create({
        data: {
            tenantId: ctx.tenantId,
            invoiceId: input.invoiceId ?? null,
            requestedById: ctx.userId,
            studentId: input.studentId,
            method: input.method,
            amountMinor: input.amountMinor,
            currency: input.currency,
            note: input.note ?? null,
            emiTotal: input.emiTotal ?? null,
            emiSequence: input.emiSequence ?? null,
            status: PaymentRequestStatus.PENDING
        },
        include: {
            requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            student: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
    })

    // Notify every ADMIN in the tenant that an offline-payment approval is
    // sitting in their queue. Admin notification stays best-effort.
    const admins = await db.client.user.findMany({
        where: { tenantId: ctx.tenantId, role: { in: [Role.ADMIN] }, status: 'ACTIVE', deletedAt: null },
        select: { id: true }
    })
    for (const a of admins) {
        await enqueueNotification({
            tenantId: ctx.tenantId,
            userId: a.id,
            template: 'payment_request_submitted',
            data: {
                counsellorName: fmtName(created.requestedBy),
                studentName: fmtName(created.student),
                method: created.method,
                amountDisplay: fmtAmount(created.amountMinor, created.currency),
                note: created.note ?? undefined,
                requestId: created.id
            }
        })
    }

    return created
}

export const listPaymentRequests = async (input: TListPaymentRequestsInput, ctx: ScopeContext) => {
    const tenantScope = await resolveTenantWhere(input.tenantSlug, ctx)
    const where: Prisma.PaymentRequestWhereInput = { ...tenantScope, deletedAt: null }

    if (input.status) where.status = input.status as PaymentRequestStatus
    if (input.studentId) where.studentId = input.studentId
    if (input.requestedById) where.requestedById = input.requestedById

    // Counsellor sees only their own requests; manager sees their team's.
    if (ctx.role === Role.COUNSELLOR) where.requestedById = ctx.userId
    if (ctx.role === Role.COUNSELLING_MANAGER) {
        const team = await db.client.user.findMany({
            where: { tenantId: ctx.tenantId, managerId: ctx.userId, deletedAt: null },
            select: { id: true }
        })
        const ids = [ctx.userId, ...team.map((t) => t.id)]
        where.requestedById = { in: ids }
    }
    if (ctx.role === Role.STUDENT || ctx.role === Role.TRAINER || ctx.role === Role.SUPPORT) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')
    }

    const [items, total] = await Promise.all([
        db.client.paymentRequest.findMany({
            where,
            include: {
                requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                student: { select: { id: true, firstName: true, lastName: true, email: true } },
                reviewer: { select: { id: true, firstName: true, lastName: true, email: true } },
                invoice: { select: { id: true, number: true, totalAmount: true, status: true } },
                tenant: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize
        }),
        db.client.paymentRequest.count({ where })
    ])

    return {
        items: items.map((r) => ({
            ...r,
            requestedBy: { id: r.requestedBy.id, name: fmtName(r.requestedBy), email: r.requestedBy.email },
            student: { id: r.student.id, name: fmtName(r.student), email: r.student.email },
            reviewer: r.reviewer ? { id: r.reviewer.id, name: fmtName(r.reviewer), email: r.reviewer.email } : null,
            amountDisplay: fmtAmount(r.amountMinor, r.currency)
        })),
        total,
        page: input.page,
        pageSize: input.pageSize
    }
}

export const reviewPaymentRequest = async (id: string, input: TReviewPaymentRequestInput, ctx: ScopeContext) => {
    if (ctx.role !== Role.ADMIN && ctx.role !== Role.SUPER_ADMIN) {
        throw AppError.forbidden('Only admins can approve or reject payment requests', 'ROLE_FORBIDDEN')
    }

    const request = await db.client.paymentRequest.findFirst({
        where: {
            id,
            ...(ctx.role === Role.SUPER_ADMIN ? {} : { tenantId: ctx.tenantId }),
            deletedAt: null
        },
        include: {
            requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            student: { select: { id: true, firstName: true, lastName: true, email: true } },
            invoice: true
        }
    })
    if (!request) throw AppError.notFound(responseMessage.NOT_FOUND('Payment request'), 'PAYMENT_REQUEST_NOT_FOUND')
    if (request.status !== PaymentRequestStatus.PENDING) {
        throw AppError.badRequest(`Request is already ${request.status.toLowerCase()}`, 'PAYMENT_REQUEST_FINALIZED')
    }

    if (input.decision === 'REJECT') {
        const updated = await db.client.paymentRequest.update({
            where: { id: request.id },
            data: {
                status: PaymentRequestStatus.REJECTED,
                reviewerId: ctx.userId,
                reviewedAt: new Date(),
                rejectionReason: input.rejectionReason ?? null
            }
        })

        await enqueueNotification({
            tenantId: request.tenantId,
            userId: request.requestedById,
            template: 'payment_request_rejected',
            data: {
                method: request.method,
                studentName: fmtName(request.student),
                reason: input.rejectionReason ?? '',
                requestId: request.id
            }
        })

        return { request: updated, invoice: null }
    }

    // APPROVE — flip the linked invoice to PAID, or create a fresh PAID one.
    const result = await db.client.$transaction(async (tx) => {
        let invoice = request.invoice
        if (invoice) {
            invoice = await tx.invoice.update({
                where: { id: invoice.id },
                data: {
                    status: InvoiceStatus.PAID,
                    paidAt: new Date(),
                    paymentMethod: request.method,
                    paymentNote: input.invoiceNote ?? request.note ?? null
                }
            })
        } else {
            const baseCount = await tx.invoice.count({ where: { tenantId: request.tenantId } })
            const number = `OFF-${String(baseCount + 1).padStart(6, '0')}`
            const gst = Math.round((request.amountMinor * 18) / 100)
            invoice = await tx.invoice.create({
                data: {
                    tenantId: request.tenantId,
                    userId: request.studentId,
                    number,
                    amount: request.amountMinor,
                    gstPercent: 18,
                    gstAmount: gst,
                    totalAmount: request.amountMinor + gst,
                    currency: request.currency,
                    gateway: PaymentGateway.RAZORPAY,
                    paymentMethod: request.method,
                    paymentNote: input.invoiceNote ?? request.note ?? null,
                    status: InvoiceStatus.PAID,
                    paidAt: new Date()
                }
            })
        }

        const updated = await tx.paymentRequest.update({
            where: { id: request.id },
            data: {
                status: PaymentRequestStatus.APPROVED,
                reviewerId: ctx.userId,
                reviewedAt: new Date(),
                invoiceId: invoice.id
            }
        })

        return { request: updated, invoice }
    })

    await enqueueNotification({
        tenantId: request.tenantId,
        userId: request.requestedById,
        template: 'payment_request_approved',
        data: {
            method: request.method,
            studentName: fmtName(request.student),
            amountDisplay: fmtAmount(request.amountMinor, request.currency),
            invoiceNumber: result.invoice.number,
            requestId: request.id
        }
    })

    return result
}

export const cancelPaymentRequest = async (id: string, input: TCancelPaymentRequestInput, ctx: ScopeContext) => {
    const request = await db.client.paymentRequest.findFirst({
        where: { id, ...(ctx.role === Role.SUPER_ADMIN ? {} : { tenantId: ctx.tenantId }), deletedAt: null }
    })
    if (!request) throw AppError.notFound(responseMessage.NOT_FOUND('Payment request'), 'PAYMENT_REQUEST_NOT_FOUND')

    // Only the requester (or admin/SA) can cancel a pending request.
    if (request.requestedById !== ctx.userId && ctx.role !== Role.ADMIN && ctx.role !== Role.SUPER_ADMIN) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'ROLE_FORBIDDEN')
    }
    if (request.status !== PaymentRequestStatus.PENDING) {
        throw AppError.badRequest('Only pending requests can be cancelled', 'PAYMENT_REQUEST_FINALIZED')
    }

    return db.client.paymentRequest.update({
        where: { id: request.id },
        data: {
            status: PaymentRequestStatus.CANCELLED,
            rejectionReason: input.reason ?? null,
            reviewedAt: new Date()
        }
    })
}
