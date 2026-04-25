import {
    AuthProvider,
    CounsellorInviteStatus,
    EnrollmentStatus,
    InvoiceStatus,
    type Prisma,
    Role,
    StudentSignupStatus,
    UserStatus
} from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { hashPassword } from '../../util/password'
import { randomToken } from '../../util/tokens'
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'
import { assertManagerOwnsCounsellor } from '../counsellor-management/counsellor-management.service'
import { type TCreateInviteLinkInput, type TSetTargetInput, type TSubmitOnboardingInput } from './counsellor-invite.schema'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const generatePassword = (): string => {
    // Human-friendly + unambiguous: 4-letter prefix + 4-digit suffix.
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const digits = '23456789'
    let out = ''
    for (let i = 0; i < 4; i++) out += letters[Math.floor(Math.random() * letters.length)]
    for (let i = 0; i < 4; i++) out += digits[Math.floor(Math.random() * digits.length)]
    return out
}

export const createInviteLink = async (tenantId: string, counsellorId: string, input: TCreateInviteLinkInput) => {
    if (input.courseId) {
        const course = await db.client.course.findFirst({ where: { id: input.courseId, tenantId } })
        if (!course) throw AppError.badRequest(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')
    }
    const token = randomToken(16)
    const link = await db.client.counsellorInviteLink.create({
        data: {
            tenantId,
            counsellorId,
            token,
            label: input.label,
            courseId: input.courseId,
            maxUses: input.maxUses,
            expiresAt: new Date(Date.now() + input.expiresInDays * ONE_DAY_MS)
        }
    })
    return link
}

export const listInviteLinks = async (tenantId: string, role: Role, actorId: string) => {
    const where: Prisma.CounsellorInviteLinkWhereInput = { tenantId }
    if (role === Role.COUNSELLOR) where.counsellorId = actorId
    return db.client.counsellorInviteLink.findMany({
        where,
        include: {
            course: { select: { id: true, title: true, slug: true } },
            _count: { select: { signups: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

const assertCounsellorOwnsLink = (link: { counsellorId: string; tenantId: string } | null, role: Role, actorId: string) => {
    if (!link) throw AppError.notFound(responseMessage.NOT_FOUND('Invite link'), 'INVITE_LINK_NOT_FOUND')
    if (role === Role.COUNSELLOR && link.counsellorId !== actorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_LINK_OWNER')
    }
}

export const getInviteLink = async (tenantId: string, role: Role, actorId: string, id: string) => {
    const link = await db.client.counsellorInviteLink.findFirst({
        where: { id, tenantId },
        include: {
            course: { select: { id: true, title: true, slug: true } },
            signups: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    status: true,
                    initialPassword: true,
                    createdAt: true,
                    user: { select: { id: true, status: true, lastLoginAt: true } }
                }
            }
        }
    })
    assertCounsellorOwnsLink(link, role, actorId)
    return link
}

export const revokeInviteLink = async (tenantId: string, role: Role, actorId: string, id: string) => {
    const link = await db.client.counsellorInviteLink.findFirst({ where: { id, tenantId } })
    assertCounsellorOwnsLink(link, role, actorId)
    return db.client.counsellorInviteLink.update({
        where: { id },
        data: { status: CounsellorInviteStatus.REVOKED }
    })
}

// Public — no auth. The invite token grants the right to create a single student record.
export const resolveInviteLink = async (token: string) => {
    const link = await db.client.counsellorInviteLink.findUnique({
        where: { token },
        include: {
            tenant: { select: { id: true, name: true, slug: true, brandingLogo: true, brandingColor: true } },
            counsellor: { select: { id: true, firstName: true, lastName: true } },
            course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } }
        }
    })
    if (!link) throw AppError.notFound(responseMessage.NOT_FOUND('Invite link'), 'INVITE_LINK_NOT_FOUND')
    if (link.status !== CounsellorInviteStatus.ACTIVE) {
        throw AppError.badRequest('Invite link no longer active', 'INVITE_LINK_INACTIVE')
    }
    if (link.expiresAt < new Date()) {
        throw AppError.badRequest('Invite link expired', 'INVITE_LINK_EXPIRED')
    }
    if (link.usesCount >= link.maxUses) {
        throw AppError.badRequest('Invite link has reached its usage limit', 'INVITE_LINK_EXHAUSTED')
    }
    return {
        tenant: link.tenant,
        counsellor: link.counsellor,
        course: link.course,
        expiresAt: link.expiresAt
    }
}

export const submitOnboarding = async (token: string, input: TSubmitOnboardingInput) => {
    const link = await db.client.counsellorInviteLink.findUnique({ where: { token } })
    if (!link) throw AppError.notFound(responseMessage.NOT_FOUND('Invite link'), 'INVITE_LINK_NOT_FOUND')
    if (link.status !== CounsellorInviteStatus.ACTIVE) {
        throw AppError.badRequest('Invite link no longer active', 'INVITE_LINK_INACTIVE')
    }
    if (link.expiresAt < new Date()) {
        throw AppError.badRequest('Invite link expired', 'INVITE_LINK_EXPIRED')
    }
    if (link.usesCount >= link.maxUses) {
        throw AppError.badRequest('Invite link has reached its usage limit', 'INVITE_LINK_EXHAUSTED')
    }

    const email = input.email.toLowerCase()
    const existing = await db.client.user.findUnique({
        where: { tenantId_email: { tenantId: link.tenantId, email } }
    })
    if (existing) throw AppError.conflict(responseMessage.ALREADY_EXISTS('Student'), 'STUDENT_EXISTS')

    const plainPassword = generatePassword()
    const passwordHash = await hashPassword(plainPassword)

    const result = await db.client.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                tenantId: link.tenantId,
                email,
                phone: input.phone,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                role: Role.STUDENT,
                provider: AuthProvider.LOCAL,
                status: UserStatus.ACTIVE,
                emailVerified: true
            }
        })

        // Pack the structured nested blocks into one JSON column. Keeps the
        // signup form open-ended — adding new sections only changes the Zod
        // schema + this object, no migration.
        const extra =
            input.education || input.professional || input.gap
                ? { education: input.education, professional: input.professional, gap: input.gap }
                : undefined

        const signup = await tx.studentSignup.create({
            data: {
                tenantId: link.tenantId,
                inviteLinkId: link.id,
                counsellorId: link.counsellorId,
                userId: user.id,
                firstName: input.firstName,
                lastName: input.lastName,
                email,
                phone: input.phone,
                dateOfBirth: input.dateOfBirth,
                city: input.city,
                state: input.state,
                address: input.address,
                qualification: input.qualification,
                interest: input.interest,
                notes: input.notes,
                extra: extra as Prisma.InputJsonValue | undefined,
                initialPassword: plainPassword,
                status: StudentSignupStatus.CREATED
            }
        })

        const usesCount = link.usesCount + 1
        await tx.counsellorInviteLink.update({
            where: { id: link.id },
            data: {
                usesCount,
                lastUsedAt: new Date(),
                status: usesCount >= link.maxUses ? CounsellorInviteStatus.USED : CounsellorInviteStatus.ACTIVE
            }
        })

        // Auto-enrol into the link's default course at zero progress; counsellorId attribution.
        if (link.courseId) {
            await tx.enrollment.create({
                data: {
                    tenantId: link.tenantId,
                    userId: user.id,
                    courseId: link.courseId,
                    counsellorId: link.counsellorId,
                    status: EnrollmentStatus.PENDING_PAYMENT
                }
            })
        }

        return { user, signup }
    })

    // Notify the counsellor that a student onboarded; notify the student with welcome.
    await notifyQueue.add(NOTIFY_JOB, {
        tenantId: link.tenantId,
        userId: link.counsellorId,
        template: 'counsellor_signup_received',
        data: { firstName: input.firstName, lastName: input.lastName, email }
    })
    await notifyQueue.add(NOTIFY_JOB, {
        tenantId: link.tenantId,
        userId: result.user.id,
        template: 'welcome',
        data: { firstName: input.firstName }
    })

    // Bubble up to the counsellor's manager so they can monitor pipeline activity.
    const counsellor = await db.client.user.findUnique({
        where: { id: link.counsellorId },
        select: { managerId: true, firstName: true, lastName: true }
    })
    if (counsellor?.managerId) {
        await notifyQueue.add(NOTIFY_JOB, {
            tenantId: link.tenantId,
            userId: counsellor.managerId,
            template: 'manager_signup_received',
            data: {
                counsellorName: `${counsellor.firstName} ${counsellor.lastName}`,
                studentName: `${input.firstName} ${input.lastName}`,
                studentEmail: email
            }
        })
    }

    return {
        student: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName
        },
        credentials: {
            email: result.user.email,
            password: plainPassword
        },
        signupId: result.signup.id
    }
}

// Counsellor re-fetches creds for a signup. Plaintext is only available until the student's first login.
export const shareCredentials = async (tenantId: string, role: Role, actorId: string, signupId: string) => {
    const signup = await db.client.studentSignup.findFirst({
        where: { id: signupId, tenantId },
        include: { user: { select: { lastLoginAt: true, email: true } } }
    })
    if (!signup) throw AppError.notFound(responseMessage.NOT_FOUND('Signup'), 'SIGNUP_NOT_FOUND')
    if (role === Role.COUNSELLOR && signup.counsellorId !== actorId) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_SIGNUP_OWNER')
    }
    if (!signup.initialPassword) {
        throw AppError.badRequest('Initial credentials are no longer available — student has signed in. Reset password instead.', 'CREDS_CONSUMED')
    }

    await db.client.studentSignup.update({
        where: { id: signupId },
        data: { status: StudentSignupStatus.CREDS_SHARED }
    })

    return {
        email: signup.email,
        password: signup.initialPassword,
        loginUrl: '/login'
    }
}

// Lists students attributed to this counsellor with progress + payment summary.
export const listMyStudents = async (tenantId: string, role: Role, actorId: string) => {
    const where: Prisma.StudentSignupWhereInput = { tenantId }
    if (role === Role.COUNSELLOR) where.counsellorId = actorId

    const signups = await db.client.studentSignup.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    lastLoginAt: true,
                    enrollments: {
                        select: {
                            id: true,
                            status: true,
                            progressPct: true,
                            course: { select: { id: true, title: true } }
                        }
                    },
                    invoices: {
                        select: { id: true, totalAmount: true, status: true, number: true, dueAt: true, paidAt: true }
                    }
                }
            }
        }
    })

    return signups.map((s) => {
        const invoices = s.user?.invoices ?? []
        const paid = invoices.filter((i) => i.status === InvoiceStatus.PAID)
        const due = invoices.filter((i) => i.status === InvoiceStatus.DUE || i.status === InvoiceStatus.FAILED)
        return {
            signupId: s.id,
            studentId: s.user?.id,
            email: s.email,
            firstName: s.firstName,
            lastName: s.lastName,
            phone: s.phone,
            status: s.status,
            createdAt: s.createdAt,
            lastLoginAt: s.user?.lastLoginAt ?? null,
            enrollments: s.user?.enrollments ?? [],
            payments: {
                totalPaid: paid.reduce((sum, i) => sum + i.totalAmount, 0),
                pendingAmount: due.reduce((sum, i) => sum + i.totalAmount, 0),
                paidCount: paid.length,
                pendingCount: due.length
            },
            invoices
        }
    })
}

// ----- Targets -----

export const setCounsellorTarget = async (tenantId: string, role: Role, actorId: string, input: TSetTargetInput) => {
    const counsellor = await db.client.user.findFirst({
        where: { id: input.counsellorId, tenantId, role: Role.COUNSELLOR }
    })
    if (!counsellor) throw AppError.notFound(responseMessage.NOT_FOUND('Counsellor'), 'COUNSELLOR_NOT_FOUND')
    // Managers may only set targets for counsellors directly under them.
    await assertManagerOwnsCounsellor(tenantId, role, actorId, input.counsellorId)

    const periodStart = startOfMonth(input.periodStart)
    const periodEnd = endOfMonth(periodStart)

    return db.client.counsellorTarget.upsert({
        where: {
            tenantId_counsellorId_periodStart: {
                tenantId,
                counsellorId: input.counsellorId,
                periodStart
            }
        },
        update: {
            targetSignups: input.targetSignups,
            targetEnrolments: input.targetEnrolments,
            targetRevenue: input.targetRevenue,
            periodEnd
        },
        create: {
            tenantId,
            counsellorId: input.counsellorId,
            periodStart,
            periodEnd,
            targetSignups: input.targetSignups,
            targetEnrolments: input.targetEnrolments,
            targetRevenue: input.targetRevenue
        }
    })
}

export const getCounsellorTarget = async (tenantId: string, counsellorId: string, period?: Date) => {
    const periodStart = startOfMonth(period ?? new Date())
    const periodEnd = endOfMonth(periodStart)

    const target = await db.client.counsellorTarget.findUnique({
        where: { tenantId_counsellorId_periodStart: { tenantId, counsellorId, periodStart } }
    })

    const [signupCount, activeEnrolments, revenueAgg] = await Promise.all([
        db.client.studentSignup.count({
            where: { tenantId, counsellorId, createdAt: { gte: periodStart, lte: periodEnd } }
        }),
        db.client.enrollment.count({
            where: {
                tenantId,
                counsellorId,
                status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
                createdAt: { gte: periodStart, lte: periodEnd }
            }
        }),
        db.client.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                tenantId,
                status: InvoiceStatus.PAID,
                paidAt: { gte: periodStart, lte: periodEnd },
                enrollment: { counsellorId }
            }
        })
    ])

    const targetSignups = target?.targetSignups ?? 0
    const targetEnrolments = target?.targetEnrolments ?? 0
    const targetRevenue = target?.targetRevenue ?? 0
    const revenue = revenueAgg._sum.totalAmount ?? 0

    return {
        period: { start: periodStart, end: periodEnd },
        target: { signups: targetSignups, enrolments: targetEnrolments, revenue: targetRevenue },
        actual: { signups: signupCount, enrolments: activeEnrolments, revenue },
        completionRate: {
            signups: pct(signupCount, targetSignups),
            enrolments: pct(activeEnrolments, targetEnrolments),
            revenue: pct(revenue, targetRevenue)
        }
    }
}

const pct = (actual: number, target: number): number => {
    if (target <= 0) return 0
    return Math.min(100, Math.round((actual / target) * 100))
}

const startOfMonth = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
const endOfMonth = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999))
