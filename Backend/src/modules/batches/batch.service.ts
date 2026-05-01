import { type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { type TAssignStudentsInput, type TCreateBatchInput, type TTransferStudentInput, type TUpdateBatchInput } from './batch.schema'

// SUPER_ADMIN can scope every batch operation to any tenant via the
// `tenantId` override. For any other role we silently use the caller's
// auth tenant — passing a body/query tenantId from a non-SA client is
// dropped, not validated, so a malicious client can't escalate.
const resolveTargetTenant = (role: Role, authTenantId: string, override?: string): string => {
    if (role === Role.SUPER_ADMIN && override) return override
    return authTenantId
}

export const createBatch = async (role: Role, authTenantId: string, input: TCreateBatchInput) => {
    const tenantId = resolveTargetTenant(role, authTenantId, input.tenantId)
    const course = await db.client.course.findFirst({ where: { id: input.courseId, tenantId } })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'))

    const existing = await db.client.batch.findUnique({
        where: { tenantId_code: { tenantId, code: input.code } }
    })
    if (existing) throw AppError.conflict(responseMessage.ALREADY_EXISTS('Batch'), 'BATCH_CODE_EXISTS')

    return db.client.batch.create({
        data: {
            tenantId,
            courseId: input.courseId,
            name: input.name,
            code: input.code,
            trainerId: input.trainerId ?? course.trainerId,
            startDate: input.startDate,
            endDate: input.endDate,
            capacity: input.capacity
        }
    })
}

export const updateBatch = async (role: Role, authTenantId: string, id: string, input: TUpdateBatchInput) => {
    // SA can edit any tenant's batch; everyone else stays in their own tenant.
    const where = role === Role.SUPER_ADMIN ? { id } : { id, tenantId: authTenantId }
    const batch = await db.client.batch.findFirst({ where })
    if (!batch) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))
    const data: Prisma.BatchUpdateInput = {}
    if (input.name !== undefined) data.name = input.name
    if (input.trainerId !== undefined) {
        data.trainer = input.trainerId ? { connect: { id: input.trainerId } } : { disconnect: true }
    }
    if (input.startDate !== undefined) data.startDate = input.startDate
    if (input.endDate !== undefined) data.endDate = input.endDate
    if (input.capacity !== undefined) data.capacity = input.capacity
    if (input.status !== undefined) data.status = input.status
    return db.client.batch.update({ where: { id }, data })
}

export const listBatches = async (role: Role, authTenantId: string, opts: { courseId?: string; tenantId?: string }) => {
    const tenantId = resolveTargetTenant(role, authTenantId, opts.tenantId)
    return db.client.batch.findMany({
        where: { tenantId, deletedAt: null, ...(opts.courseId ? { courseId: opts.courseId } : {}) },
        include: {
            course: { select: { id: true, title: true } },
            trainer: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { enrollments: true } }
        },
        orderBy: { startDate: 'desc' }
    })
}

export const getBatch = async (role: Role, authTenantId: string, id: string) => {
    const where = role === Role.SUPER_ADMIN ? { id } : { id, tenantId: authTenantId }
    const batch = await db.client.batch.findFirst({
        where,
        include: {
            course: { select: { id: true, title: true } },
            trainer: { select: { id: true, firstName: true, lastName: true } },
            enrollments: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
            }
        }
    })
    if (!batch) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))
    return batch
}

export const deleteBatch = async (role: Role, authTenantId: string, id: string) => {
    const where = role === Role.SUPER_ADMIN ? { id } : { id, tenantId: authTenantId }
    const batch = await db.client.batch.findFirst({ where })
    if (!batch) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))
    await db.client.batch.update({ where: { id }, data: { deletedAt: new Date() } })
}

// Assign an existing enrollment (by userId) to this batch. Assumes the student is already enrolled.
export const assignStudents = async (role: Role, authTenantId: string, batchId: string, input: TAssignStudentsInput) => {
    const where = role === Role.SUPER_ADMIN ? { id: batchId } : { id: batchId, tenantId: authTenantId }
    const batch = await db.client.batch.findFirst({ where })
    if (!batch) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))

    const count = await db.client.enrollment.count({ where: { batchId } })
    if (count + input.userIds.length > batch.capacity) {
        throw AppError.badRequest('Capacity exceeded', 'CAPACITY_EXCEEDED')
    }

    // Only update enrollments that match the course of this batch + tenant.
    await db.client.enrollment.updateMany({
        where: { tenantId: batch.tenantId, userId: { in: input.userIds }, courseId: batch.courseId },
        data: { batchId }
    })
    return { assigned: input.userIds.length }
}

// Transfer a student (preserves progress — we only rewrite batchId).
export const transferStudent = async (role: Role, authTenantId: string, fromBatchId: string, input: TTransferStudentInput) => {
    const tenantWhere = role === Role.SUPER_ADMIN ? {} : { tenantId: authTenantId }
    const [from, to] = await Promise.all([
        db.client.batch.findFirst({ where: { id: fromBatchId, ...tenantWhere } }),
        db.client.batch.findFirst({ where: { id: input.targetBatchId, ...tenantWhere } })
    ])
    if (!from || !to) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))
    if (from.courseId !== to.courseId) {
        throw AppError.badRequest('Cannot transfer across different courses', 'COURSE_MISMATCH')
    }
    if (from.tenantId !== to.tenantId) {
        throw AppError.badRequest('Cannot transfer across different tenants', 'TENANT_MISMATCH')
    }

    const enrollment = await db.client.enrollment.findFirst({
        where: { tenantId: from.tenantId, userId: input.userId, courseId: from.courseId, batchId: fromBatchId }
    })
    if (!enrollment) throw AppError.notFound(responseMessage.NOT_FOUND('Enrollment'))

    await db.client.enrollment.update({ where: { id: enrollment.id }, data: { batchId: to.id } })
    return { ok: true }
}
