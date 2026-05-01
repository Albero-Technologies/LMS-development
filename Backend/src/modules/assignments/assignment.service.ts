import { AssignmentSubmissionStatus, type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import {
    type TCreateAssignmentInput,
    type TGradeSubmissionInput,
    type TListAssignmentsQuery,
    type TSubmitAssignmentInput,
    type TUpdateAssignmentInput
} from './assignment.schema'

// ---- Listing -------------------------------------------------------------

// Trainer / admin: see every assignment in the tenant. Student: see only
// PUBLISHED assignments for courses they are ACTIVE-enrolled in.
//
// Trainer scope: trainers only see assignments they created OR for courses
// where they are the assigned trainer — this matches the existing course list
// pattern so a trainer doesn't accidentally see another trainer's drafts.
export const listAssignments = async (tenantId: string, role: Role, userId: string, query: TListAssignmentsQuery) => {
    const where: Prisma.AssignmentWhereInput = { tenantId, deletedAt: null }
    if (query.courseId) where.courseId = query.courseId

    if (role === Role.STUDENT) {
        where.isPublished = true
        // Only assignments for courses the student is enrolled in (ACTIVE / COMPLETED).
        const myEnrolledCourses = await db.client.enrollment.findMany({
            where: { tenantId, userId, status: { in: ['ACTIVE', 'COMPLETED'] } },
            select: { courseId: true }
        })
        where.courseId = query.courseId ? query.courseId : { in: myEnrolledCourses.map((e) => e.courseId) }
    } else if (role === Role.TRAINER) {
        // Trainers see assignments they created or for courses where they are the trainer of record.
        where.OR = [{ trainerId: userId }, { course: { trainerId: userId } }]
    }

    if (query.status === 'published') where.isPublished = true
    if (query.status === 'draft') where.isPublished = false

    const rows = await db.client.assignment.findMany({
        where,
        include: {
            course: { select: { id: true, title: true, slug: true } },
            trainer: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { submissions: true } }
        },
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }]
    })

    if (role !== Role.STUDENT) return rows

    // Augment each row with the calling student's submission status so the
    // UI can show "Submitted / Pending / Graded" without a second round-trip.
    const submissions = await db.client.assignmentSubmission.findMany({
        where: { tenantId, userId, assignmentId: { in: rows.map((r) => r.id) } }
    })
    const byAssignment = new Map(submissions.map((s) => [s.assignmentId, s]))
    return rows.map((r) => ({ ...r, mySubmission: byAssignment.get(r.id) ?? null }))
}

// ---- Detail --------------------------------------------------------------

export const getAssignment = async (tenantId: string, role: Role, userId: string, id: string) => {
    const assignment = await db.client.assignment.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: {
            course: { select: { id: true, title: true, slug: true } },
            trainer: { select: { id: true, firstName: true, lastName: true } }
        }
    })
    if (!assignment) throw AppError.notFound(responseMessage.NOT_FOUND('Assignment'), 'ASSIGNMENT_NOT_FOUND')

    // Students only see their own submission. Staff see every submission.
    if (role === Role.STUDENT) {
        if (!assignment.isPublished) throw AppError.notFound(responseMessage.NOT_FOUND('Assignment'), 'ASSIGNMENT_NOT_FOUND')
        // Confirm enrolment in the course.
        const enrolled = await db.client.enrollment.findFirst({
            where: { tenantId, userId, courseId: assignment.courseId, status: { in: ['ACTIVE', 'COMPLETED'] } }
        })
        if (!enrolled) throw AppError.forbidden('Enrol in this course first', 'NOT_ENROLLED')
        const mine = await db.client.assignmentSubmission.findUnique({
            where: { assignmentId_userId: { assignmentId: assignment.id, userId } }
        })
        return { ...assignment, mySubmission: mine, submissions: [] as never[] }
    }

    const submissions = await db.client.assignmentSubmission.findMany({
        where: { tenantId, assignmentId: assignment.id },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }]
    })
    return { ...assignment, mySubmission: null, submissions }
}

// ---- Authoring (trainer / admin) ----------------------------------------

export const createAssignment = async (tenantId: string, userId: string, input: TCreateAssignmentInput) => {
    const course = await db.client.course.findFirst({ where: { id: input.courseId, tenantId } })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')

    return db.client.assignment.create({
        data: {
            tenantId,
            courseId: input.courseId,
            title: input.title,
            description: input.description,
            instructions: input.instructions,
            dueAt: input.dueAt,
            maxScore: input.maxScore,
            isPublished: input.isPublished,
            // Default trainer to the caller (handy for self-authored work) but
            // explicit overrides win.
            trainerId: input.trainerId ?? userId
        }
    })
}

export const updateAssignment = async (tenantId: string, id: string, input: TUpdateAssignmentInput) => {
    const existing = await db.client.assignment.findFirst({ where: { id, tenantId, deletedAt: null } })
    if (!existing) throw AppError.notFound(responseMessage.NOT_FOUND('Assignment'), 'ASSIGNMENT_NOT_FOUND')

    const data: Prisma.AssignmentUpdateInput = {}
    if (input.title !== undefined) data.title = input.title
    if (input.description !== undefined) data.description = input.description
    if (input.instructions !== undefined) data.instructions = input.instructions
    if (input.dueAt !== undefined) data.dueAt = input.dueAt
    if (input.maxScore !== undefined) data.maxScore = input.maxScore
    if (input.isPublished !== undefined) data.isPublished = input.isPublished
    if (input.trainerId !== undefined) {
        data.trainer = input.trainerId ? { connect: { id: input.trainerId } } : { disconnect: true }
    }
    return db.client.assignment.update({ where: { id }, data })
}

export const deleteAssignment = async (tenantId: string, id: string) => {
    const existing = await db.client.assignment.findFirst({ where: { id, tenantId, deletedAt: null } })
    if (!existing) throw AppError.notFound(responseMessage.NOT_FOUND('Assignment'), 'ASSIGNMENT_NOT_FOUND')
    await db.client.assignment.update({ where: { id }, data: { deletedAt: new Date() } })
}

// ---- Student submission --------------------------------------------------

export const submitAssignment = async (tenantId: string, userId: string, assignmentId: string, input: TSubmitAssignmentInput) => {
    const assignment = await db.client.assignment.findFirst({ where: { id: assignmentId, tenantId, deletedAt: null } })
    if (!assignment) throw AppError.notFound(responseMessage.NOT_FOUND('Assignment'), 'ASSIGNMENT_NOT_FOUND')
    if (!assignment.isPublished) throw AppError.forbidden('Assignment not published', 'ASSIGNMENT_UNPUBLISHED')

    // Must be enrolled to submit.
    const enrolled = await db.client.enrollment.findFirst({
        where: { tenantId, userId, courseId: assignment.courseId, status: { in: ['ACTIVE', 'COMPLETED'] } }
    })
    if (!enrolled) throw AppError.forbidden('Enrol in this course first', 'NOT_ENROLLED')

    if (!input.textAnswer && !input.fileUrl) {
        throw AppError.badRequest('Provide a text answer or a file URL', 'EMPTY_SUBMISSION')
    }

    // If the assignment is past due AND the existing submission is GRADED or
    // SUBMITTED (not RETURNED), block re-submits — staff can RETURN to allow
    // edits when they want a re-do.
    const existing = await db.client.assignmentSubmission.findUnique({
        where: { assignmentId_userId: { assignmentId, userId } }
    })
    if (existing && (existing.status === AssignmentSubmissionStatus.GRADED || existing.status === AssignmentSubmissionStatus.SUBMITTED)) {
        throw AppError.conflict('Already submitted', 'ALREADY_SUBMITTED')
    }

    const status = input.seal ? AssignmentSubmissionStatus.SUBMITTED : AssignmentSubmissionStatus.DRAFT
    const submittedAt = input.seal ? new Date() : null

    return db.client.assignmentSubmission.upsert({
        where: { assignmentId_userId: { assignmentId, userId } },
        update: {
            textAnswer: input.textAnswer ?? null,
            fileUrl: input.fileUrl ?? null,
            status,
            submittedAt: submittedAt ?? existing?.submittedAt ?? null
        },
        create: {
            tenantId,
            assignmentId,
            userId,
            textAnswer: input.textAnswer ?? null,
            fileUrl: input.fileUrl ?? null,
            status,
            submittedAt
        }
    })
}

// ---- Staff grading -------------------------------------------------------

export const gradeSubmission = async (tenantId: string, graderId: string, submissionId: string, input: TGradeSubmissionInput) => {
    const submission = await db.client.assignmentSubmission.findFirst({
        where: { id: submissionId, tenantId },
        include: { assignment: true }
    })
    if (!submission) throw AppError.notFound(responseMessage.NOT_FOUND('Submission'), 'SUBMISSION_NOT_FOUND')
    if (submission.status === AssignmentSubmissionStatus.DRAFT) {
        throw AppError.badRequest('Submission is still a draft', 'DRAFT_SUBMISSION')
    }
    if (input.score > submission.assignment.maxScore) {
        throw AppError.badRequest(`Score exceeds max (${submission.assignment.maxScore})`, 'SCORE_OVER_MAX')
    }

    return db.client.assignmentSubmission.update({
        where: { id: submission.id },
        data: {
            score: input.score,
            feedback: input.feedback ?? null,
            status: input.status,
            gradedById: graderId,
            gradedAt: new Date()
        }
    })
}
