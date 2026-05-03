import { EnquiryStage, type Prisma, Role, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import logger from '../../util/logger'
import { appendRow } from './google-sheets.client'
import { enqueueNotification } from '../notifications/notification.queue'
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
    // Pack the optional structured blocks into a single JSON column so the
    // form can grow without a migration per section.
    const extra =
        input.education || input.professional || input.gap
            ? { education: input.education, professional: input.professional, gap: input.gap }
            : undefined

    const enquiry = await db.client.enquiry.create({
        data: {
            tenantId,
            name: input.name,
            email: input.email,
            phone: input.phone,
            course: input.course,
            language: input.language,
            city: input.city,
            address: input.address,
            qualification: input.qualification,
            message: input.message,
            source: input.utmSource ? `utm:${input.utmSource}` : 'website',
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            extra: extra as Prisma.InputJsonValue | undefined,
            assignedToId
        },
        include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    })

    // Fire-and-forget push to the tenant's Google Sheet (§9.2). The marketing
    // team's existing spreadsheet stays in sync without blocking the public
    // form's response. Errors are logged, never surfaced to the prospect.
    void pushEnquiryToSheet(tenantId, enquiry, 'contact-form').catch((err: unknown) => {
        logger.error('SHEETS_PUSH_FAILED', { meta: { enquiryId: enquiry.id, err: (err as Error).message } })
    })

    // Notify the assigned counsellor so the bell (and email, when SMTP is
    // configured) lights up immediately. Best-effort — never block the public
    // enquiry response on this.
    if (assignedToId) {
        void enqueueNotification({
            tenantId,
            userId: assignedToId,
            template: 'enquiry_assigned_counsellor',
            data: {
                studentName: input.name,
                courseTitle: input.course,
                email: input.email,
                phone: input.phone
            }
        })
    }

    return enquiry
}

// Sheet row shape — STABLE across callers. If you reorder, also rename the
// column headers in any onboarding doc. Order is the row layout used in the
// Google Sheet (left → right): time-of-event, identity, intent, attribution,
// internal routing, source channel.
//
// formType labels which surface produced the row so admins can filter the
// sheet by funnel: a "contact-form" row from /contact, a "enroll-checkout"
// row from a public Razorpay init, etc. Stage tracks whether the lead has
// since been progressed (CONVERTED / DEMO_SCHEDULED / LOST) — useful when
// the sheet is the marketing team's primary view.
type EnquiryLike = Pick<
    Awaited<ReturnType<typeof db.client.enquiry.create>>,
    'name' | 'email' | 'phone' | 'course' | 'city' | 'language' | 'message' | 'source' | 'utmSource' | 'utmMedium' | 'utmCampaign' | 'assignedToId' | 'stage' | 'id'
>

export type EnquiryFormType = 'contact-form' | 'enroll-checkout'

export const pushEnquiryToSheet = async (tenantId: string, enquiry: EnquiryLike, formType: EnquiryFormType): Promise<void> => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId } })
    const settings = tenant?.settings as {
        googleSheetId?: string
        googleSheetRange?: string
        environment?: { googleSheets?: { serviceAccountJson?: string } }
    } | null
    const sheetId = settings?.googleSheetId
    if (!sheetId) return

    await appendRow({
        sheetId,
        range: settings?.googleSheetRange ?? 'Sheet1!A1',
        serviceAccountJson: settings?.environment?.googleSheets?.serviceAccountJson,
        values: [
            new Date().toISOString(),
            formType,
            enquiry.name,
            enquiry.email,
            enquiry.phone,
            enquiry.course,
            enquiry.city ?? '',
            enquiry.language ?? '',
            enquiry.message ?? '',
            enquiry.source ?? '',
            enquiry.utmSource ?? '',
            enquiry.utmMedium ?? '',
            enquiry.utmCampaign ?? '',
            enquiry.stage,
            enquiry.assignedToId ?? '',
            enquiry.id
        ]
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

// Allowed stage transitions for the enquiry/lead pipeline.
// CONVERTED and LOST are terminal — once an enquiry lands there it stays there
// (a fresh enquiry is the right fix for someone who returns later). NEW can
// route forward to a demo, straight to a sale, or to LOST. DEMO_SCHEDULED can
// roll back to NEW if the demo gets cancelled, otherwise progresses or drops.
const STAGE_TRANSITIONS: Record<EnquiryStage, readonly EnquiryStage[]> = {
    NEW: [EnquiryStage.DEMO_SCHEDULED, EnquiryStage.CONVERTED, EnquiryStage.LOST],
    DEMO_SCHEDULED: [EnquiryStage.NEW, EnquiryStage.CONVERTED, EnquiryStage.LOST],
    CONVERTED: [],
    LOST: []
}

export const assertValidStageTransition = (from: EnquiryStage, to: EnquiryStage): void => {
    if (from === to) {
        throw AppError.badRequest(`Enquiry is already in stage ${to}`, 'ENQUIRY_STAGE_NOOP')
    }
    if (!STAGE_TRANSITIONS[from].includes(to)) {
        throw AppError.badRequest(
            `Cannot transition enquiry from ${from} to ${to}. Allowed next stages: ${STAGE_TRANSITIONS[from].join(', ') || '(terminal — none)'}`,
            'ENQUIRY_STAGE_INVALID'
        )
    }
}

export interface TStageUpdateResult {
    enquiry: Awaited<ReturnType<typeof db.client.enquiry.update>>
    previousStage: EnquiryStage
}

export const updateEnquiryStage = async (tenantId: string, id: string, stage: EnquiryStage): Promise<TStageUpdateResult> => {
    const enquiry = await db.client.enquiry.findUnique({ where: { id } })
    if (!enquiry || enquiry.tenantId !== tenantId) {
        throw AppError.notFound(responseMessage.NOT_FOUND('Enquiry'), 'ENQUIRY_NOT_FOUND')
    }
    assertValidStageTransition(enquiry.stage, stage)
    const updated = await db.client.enquiry.update({ where: { id }, data: { stage } })
    return { enquiry: updated, previousStage: enquiry.stage }
}

// Counselling-track roles that can own a lead. Admins should be able to
// hand a lead to either an individual counsellor or a counselling manager
// (managers sometimes pick up high-value leads themselves).
const ASSIGNABLE_ROLES: Role[] = [Role.COUNSELLOR, Role.COUNSELLING_MANAGER]

export const reassignEnquiry = async (tenantId: string, id: string, counsellorId: string) => {
    const enquiry = await db.client.enquiry.findUnique({ where: { id } })
    if (!enquiry || enquiry.tenantId !== tenantId) {
        throw AppError.notFound(responseMessage.NOT_FOUND('Enquiry'), 'ENQUIRY_NOT_FOUND')
    }
    const counsellor = await db.client.user.findUnique({ where: { id: counsellorId } })
    if (!counsellor || counsellor.tenantId !== tenantId || !ASSIGNABLE_ROLES.includes(counsellor.role)) {
        throw AppError.badRequest('Target user is not a counsellor or counselling manager for this tenant', 'INVALID_COUNSELLOR')
    }
    return db.client.enquiry.update({
        where: { id },
        data: { assignedToId: counsellorId },
        include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    })
}
