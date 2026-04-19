import { Prisma } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { TAssignStudentsInput, TCreateBatchInput, TTransferStudentInput, TUpdateBatchInput } from './batch.schema'

export const createBatch = async (tenantId: string, input: TCreateBatchInput) => {
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

export const updateBatch = async (tenantId: string, id: string, input: TUpdateBatchInput) => {
    const batch = await db.client.batch.findFirst({ where: { id, tenantId } })
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

export const listBatches = async (tenantId: string, courseId?: string) => {
    return db.client.batch.findMany({
        where: { tenantId, ...(courseId ? { courseId } : {}) },
        include: {
            course: { select: { id: true, title: true } },
            trainer: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { enrollments: true } }
        },
        orderBy: { startDate: 'desc' }
    })
}

export const getBatch = async (tenantId: string, id: string) => {
    const batch = await db.client.batch.findFirst({
        where: { id, tenantId },
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

export const deleteBatch = async (tenantId: string, id: string) => {
    const batch = await db.client.batch.findFirst({ where: { id, tenantId } })
    if (!batch) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))
    await db.client.batch.update({ where: { id }, data: { deletedAt: new Date() } })
}

// Assign an existing enrollment (by userId) to this batch. Assumes the student is already enrolled.
export const assignStudents = async (tenantId: string, batchId: string, input: TAssignStudentsInput) => {
    const batch = await db.client.batch.findFirst({ where: { id: batchId, tenantId } })
    if (!batch) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))

    const count = await db.client.enrollment.count({ where: { batchId } })
    if (count + input.userIds.length > batch.capacity) {
        throw AppError.badRequest('Capacity exceeded', 'CAPACITY_EXCEEDED')
    }

    // Only update enrollments that match the course of this batch.
    await db.client.enrollment.updateMany({
        where: { tenantId, userId: { in: input.userIds }, courseId: batch.courseId },
        data: { batchId }
    })
    return { assigned: input.userIds.length }
}

// Transfer a student (preserves progress — we only rewrite batchId).
export const transferStudent = async (tenantId: string, fromBatchId: string, input: TTransferStudentInput) => {
    const [from, to] = await Promise.all([
        db.client.batch.findFirst({ where: { id: fromBatchId, tenantId } }),
        db.client.batch.findFirst({ where: { id: input.targetBatchId, tenantId } })
    ])
    if (!from || !to) throw AppError.notFound(responseMessage.NOT_FOUND('Batch'))
    if (from.courseId !== to.courseId) {
        throw AppError.badRequest('Cannot transfer across different courses', 'COURSE_MISMATCH')
    }

    const enrollment = await db.client.enrollment.findFirst({
        where: { tenantId, userId: input.userId, courseId: from.courseId, batchId: fromBatchId }
    })
    if (!enrollment) throw AppError.notFound(responseMessage.NOT_FOUND('Enrollment'))

    await db.client.enrollment.update({ where: { id: enrollment.id }, data: { batchId: to.id } })
    return { ok: true }
}
