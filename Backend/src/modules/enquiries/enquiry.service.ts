import { EnquiryStage, Role, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import type { TCreateEnquiryInput } from './enquiry.schema'

// Resolve tenant from payload slug first, then fall back to sub-domain parsing
// on the Host header. Keep this small — complex parsing belongs in middleware
// once we have multi-domain tenants in production.
export const resolveTenant = async (slug?: string, host?: string) => {
    const candidate = slug ?? parseSlugFromHost(host)
    if (!candidate) throw AppError.badRequest('Tenant could not be resolved', 'TENANT_UNRESOLVED')
    const tenant = await db.client.tenant.findUnique({ where: { slug: candidate } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
        throw AppError.forbidden('Tenant is not accepting enquiries right now', 'TENANT_INACTIVE')
    }
    return tenant
}

const parseSlugFromHost = (host?: string): string | null => {
    if (!host) return null
    const hostname = host.split(':')[0]
    // Match the leftmost label when there are at least three segments:
    // ascend.learnhub.in → "ascend". Anything else returns null and forces the
    // caller to send `tenantSlug` explicitly.
    const segments = hostname.split('.')
    if (segments.length < 3) return null
    const first = segments[0]
    if (first === 'www' || first === 'app') return null
    return first
}

// Least-loaded counsellor for a tenant. Equal-count ties break by the oldest
// last-assignment so rotation stays fair even when the load is already balanced.
export const pickCounsellor = async (tenantId: string): Promise<string | null> => {
    const counsellors = await db.client.user.findMany({
        where: {
            tenantId,
            role: Role.COUNSELLOR,
            status: UserStatus.ACTIVE,
            deletedAt: null
        },
        select: { id: true }
    })
    if (counsellors.length === 0) return null
    if (counsellors.length === 1) return counsellors[0].id

    // Count NEW enquiries per counsellor.
    const loads = await db.client.enquiry.groupBy({
        by: ['assignedToId'],
        where: { tenantId, stage: EnquiryStage.NEW, assignedToId: { in: counsellors.map((c) => c.id) } },
        _count: { _all: true }
    })
    const loadMap = new Map<string, number>()
    for (const row of loads) {
        if (row.assignedToId) loadMap.set(row.assignedToId, row._count._all)
    }
    for (const c of counsellors) if (!loadMap.has(c.id)) loadMap.set(c.id, 0)

    // Tiebreaker: among the counsellors with the minimum load, pick the one
    // whose last assignment is oldest. This prevents the first id in the list
    // from always getting the new lead when everyone is at 0.
    const minLoad = Math.min(...loadMap.values())
    const candidates = [...loadMap.entries()].filter(([, n]) => n === minLoad).map(([id]) => id)

    if (candidates.length === 1) return candidates[0]

    const lastAssignment = await db.client.enquiry.findMany({
        where: { tenantId, assignedToId: { in: candidates } },
        select: { assignedToId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: candidates.length
    })
    const mostRecent = new Map<string, number>()
    for (const row of lastAssignment) {
        if (row.assignedToId && !mostRecent.has(row.assignedToId)) {
            mostRecent.set(row.assignedToId, row.createdAt.getTime())
        }
    }
    // The counsellor whose last assignment is the oldest (or who has never
    // been assigned an enquiry) takes the new one.
    candidates.sort((a, b) => (mostRecent.get(a) ?? 0) - (mostRecent.get(b) ?? 0))
    return candidates[0]
}

export const createEnquiry = async (tenantId: string, input: TCreateEnquiryInput) => {
    const assignedToId = await pickCounsellor(tenantId)
    return db.client.enquiry.create({
        data: {
            tenantId,
            name: input.name,
            email: input.email,
            phone: input.phone,
            course: input.course,
            language: input.language,
            city: input.city,
            message: input.message,
            source: input.utmSource ? `utm:${input.utmSource}` : 'website',
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            assignedToId
        },
        include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    })
}

export const listEnquiries = async (tenantId: string, filter: { stage?: EnquiryStage; assignedToId?: string }) =>
    db.client.enquiry.findMany({
        where: {
            tenantId,
            ...(filter.stage ? { stage: filter.stage } : {}),
            ...(filter.assignedToId ? { assignedToId: filter.assignedToId } : {})
        },
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    })

export const updateEnquiryStage = async (tenantId: string, id: string, stage: EnquiryStage) => {
    const enquiry = await db.client.enquiry.findUnique({ where: { id } })
    if (!enquiry || enquiry.tenantId !== tenantId) {
        throw AppError.notFound(responseMessage.NOT_FOUND('Enquiry'), 'ENQUIRY_NOT_FOUND')
    }
    return db.client.enquiry.update({ where: { id }, data: { stage } })
}

export const reassignEnquiry = async (tenantId: string, id: string, counsellorId: string) => {
    const enquiry = await db.client.enquiry.findUnique({ where: { id } })
    if (!enquiry || enquiry.tenantId !== tenantId) {
        throw AppError.notFound(responseMessage.NOT_FOUND('Enquiry'), 'ENQUIRY_NOT_FOUND')
    }
    const counsellor = await db.client.user.findUnique({ where: { id: counsellorId } })
    if (!counsellor || counsellor.tenantId !== tenantId || counsellor.role !== Role.COUNSELLOR) {
        throw AppError.badRequest('Target user is not a counsellor for this tenant', 'INVALID_COUNSELLOR')
    }
    return db.client.enquiry.update({ where: { id }, data: { assignedToId: counsellorId } })
}
