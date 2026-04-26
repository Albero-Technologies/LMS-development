import { CoursePublishState, EnrollmentStatus, LessonType, type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import {
    type TCreateCourseInput,
    type TCreateLessonInput,
    type TCreateSectionInput,
    type TListCoursesQuery,
    type TProgressUpdateInput,
    type TUpdateCourseInput,
    type TUpdateLessonInput
} from './course.schema'

export const listCourses = async (tenantId: string, role: Role, userId: string, query: TListCoursesQuery) => {
    // SUPER_ADMIN can scope to any tenant via ?tenantId=. Other roles always
    // use their auth tenant — the override is silently ignored to avoid leaking
    // courses across tenants if a malicious client tries to set it.
    const effectiveTenantId = role === Role.SUPER_ADMIN && query.tenantId ? query.tenantId : tenantId
    const where: Prisma.CourseWhereInput = { tenantId: effectiveTenantId }

    // Students only see PUBLISHED courses unless they are enrolled.
    if (role === Role.STUDENT) {
        where.publishState = CoursePublishState.PUBLISHED
    } else if (query.publishState) {
        where.publishState = query.publishState
    }
    if (query.trainerId) where.trainerId = query.trainerId
    if (query.q) {
        where.OR = [{ title: { contains: query.q, mode: 'insensitive' } }, { description: { contains: query.q, mode: 'insensitive' } }]
    }
    // Trainer self-scope: trainers see only their own drafts.
    if (role === Role.TRAINER && !query.trainerId) where.trainerId = userId

    const [items, total] = await Promise.all([
        db.client.course.findMany({
            where,
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                trainer: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { enrollments: true, sections: true } }
            }
        }),
        db.client.course.count({ where })
    ])

    return { items, total, page: query.page, pageSize: query.pageSize }
}

export const getCourse = async (tenantId: string, id: string, opts?: { includePrivate?: boolean }) => {
    const course = await db.client.course.findFirst({
        where: { id, tenantId },
        include: {
            trainer: { select: { id: true, firstName: true, lastName: true } },
            sections: {
                orderBy: { order: 'asc' },
                include: { lessons: { orderBy: { order: 'asc' } } }
            }
        }
    })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')
    if (!opts?.includePrivate && course.publishState !== CoursePublishState.PUBLISHED) {
        throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')
    }
    return course
}

export const createCourse = async (tenantId: string, input: TCreateCourseInput, actorId: string, actorRole: Role) => {
    const existing = await db.client.course.findUnique({
        where: { tenantId_slug: { tenantId, slug: input.slug } }
    })
    if (existing) throw AppError.conflict(responseMessage.ALREADY_EXISTS('Course'), 'COURSE_SLUG_EXISTS')

    // Trainers can only create courses for themselves.
    const trainerId = input.trainerId ?? (actorRole === Role.TRAINER ? actorId : undefined)

    const course = await db.client.course.create({
        data: {
            tenantId,
            title: input.title,
            slug: input.slug,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
            price: input.price,
            currency: input.currency,
            gstPercent: input.gstPercent,
            trainerId,
            tags: input.tags ?? [],
            publishState: CoursePublishState.DRAFT
        }
    })
    return course
}

export const updateCourse = async (tenantId: string, id: string, input: TUpdateCourseInput, actor: { id: string; role: Role }) => {
    const course = await db.client.course.findFirst({ where: { id, tenantId } })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')

    // Trainer can only update their own courses.
    if (actor.role === Role.TRAINER && course.trainerId !== actor.id) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_COURSE_OWNER')
    }
    // Trainer cannot change trainerId.
    if (actor.role === Role.TRAINER && input.trainerId && input.trainerId !== actor.id) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'TRAINER_REASSIGN_DENIED')
    }

    const updated = await db.client.course.update({
        where: { id },
        data: {
            title: input.title,
            slug: input.slug,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
            price: input.price,
            currency: input.currency,
            gstPercent: input.gstPercent,
            trainerId: input.trainerId,
            tags: input.tags,
            publishState: input.publishState
        }
    })
    return updated
}

export const deleteCourse = async (tenantId: string, id: string) => {
    const course = await db.client.course.findFirst({ where: { id, tenantId } })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')
    await db.client.course.update({ where: { id }, data: { deletedAt: new Date() } })
}

// ---- Sections ----

export const addSection = async (tenantId: string, courseId: string, input: TCreateSectionInput, actor: { id: string; role: Role }) => {
    await assertCourseOwnership(tenantId, courseId, actor)
    return db.client.courseSection.create({
        data: { courseId, title: input.title, order: input.order }
    })
}

export const deleteSection = async (tenantId: string, courseId: string, sectionId: string, actor: { id: string; role: Role }) => {
    await assertCourseOwnership(tenantId, courseId, actor)
    const section = await db.client.courseSection.findFirst({ where: { id: sectionId, courseId } })
    if (!section) throw AppError.notFound(responseMessage.NOT_FOUND('Section'))
    await db.client.courseSection.delete({ where: { id: sectionId } })
}

// ---- Lessons ----

export const addLesson = async (tenantId: string, courseId: string, input: TCreateLessonInput, actor: { id: string; role: Role }) => {
    await assertCourseOwnership(tenantId, courseId, actor)
    const section = await db.client.courseSection.findFirst({ where: { id: input.sectionId, courseId } })
    if (!section) throw AppError.notFound(responseMessage.NOT_FOUND('Section'))

    if (input.type === LessonType.YOUTUBE && !input.youtubeId) {
        throw AppError.badRequest('youtubeId required for YouTube lessons', 'YOUTUBE_ID_MISSING')
    }
    if (input.type === LessonType.EXTERNAL_LIVE && !input.externalUrl) {
        throw AppError.badRequest('externalUrl required for external live lessons', 'EXTERNAL_URL_MISSING')
    }

    return db.client.lesson.create({
        data: {
            sectionId: input.sectionId,
            title: input.title,
            description: input.description,
            type: input.type,
            youtubeId: input.youtubeId,
            externalUrl: input.externalUrl,
            durationSec: input.durationSec,
            order: input.order
        }
    })
}

export const updateLesson = async (
    tenantId: string,
    courseId: string,
    lessonId: string,
    input: TUpdateLessonInput,
    actor: { id: string; role: Role }
) => {
    await assertCourseOwnership(tenantId, courseId, actor)
    const lesson = await db.client.lesson.findFirst({
        where: { id: lessonId, section: { courseId } }
    })
    if (!lesson) throw AppError.notFound(responseMessage.NOT_FOUND('Lesson'))
    return db.client.lesson.update({
        where: { id: lessonId },
        data: {
            title: input.title,
            description: input.description,
            type: input.type,
            youtubeId: input.youtubeId,
            externalUrl: input.externalUrl,
            durationSec: input.durationSec,
            order: input.order
        }
    })
}

export const deleteLesson = async (tenantId: string, courseId: string, lessonId: string, actor: { id: string; role: Role }) => {
    await assertCourseOwnership(tenantId, courseId, actor)
    const lesson = await db.client.lesson.findFirst({ where: { id: lessonId, section: { courseId } } })
    if (!lesson) throw AppError.notFound(responseMessage.NOT_FOUND('Lesson'))
    await db.client.lesson.delete({ where: { id: lessonId } })
}

// ---- Progress ----

export const updateProgress = async (tenantId: string, userId: string, courseId: string, lessonId: string, input: TProgressUpdateInput) => {
    // Must be enrolled and active.
    const enrollment = await db.client.enrollment.findFirst({
        where: {
            tenantId,
            userId,
            courseId,
            status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] }
        }
    })
    if (!enrollment) throw AppError.forbidden(responseMessage.ENROLLMENT_REQUIRED, 'NO_ENROLLMENT')

    // Verify the lesson belongs to this course + tenant.
    const lesson = await db.client.lesson.findFirst({
        where: { id: lessonId, section: { courseId, course: { tenantId } } }
    })
    if (!lesson) throw AppError.notFound(responseMessage.NOT_FOUND('Lesson'))

    const existing = await db.client.lessonProgress.findUnique({
        where: { lessonId_enrollmentId: { lessonId, enrollmentId: enrollment.id } }
    })

    const completed = input.completed ?? existing?.completed ?? false
    const watchedSec = input.watchedSec ?? existing?.watchedSec ?? 0

    const progress = existing
        ? await db.client.lessonProgress.update({
              where: { lessonId_enrollmentId: { lessonId, enrollmentId: enrollment.id } },
              data: {
                  watchedSec,
                  completed,
                  completedAt: completed && !existing.completed ? new Date() : existing.completedAt
              }
          })
        : await db.client.lessonProgress.create({
              data: {
                  lessonId,
                  enrollmentId: enrollment.id,
                  watchedSec,
                  completed,
                  completedAt: completed ? new Date() : null
              }
          })

    // Recompute enrollment progress %.
    const [totalLessons, completedLessons] = await Promise.all([
        db.client.lesson.count({ where: { section: { courseId } } }),
        db.client.lessonProgress.count({ where: { enrollmentId: enrollment.id, completed: true } })
    ])

    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const isCourseComplete = progressPct >= 100

    await db.client.enrollment.update({
        where: { id: enrollment.id },
        data: {
            progressPct,
            status: isCourseComplete ? EnrollmentStatus.COMPLETED : enrollment.status,
            startedAt: enrollment.startedAt ?? new Date(),
            completedAt: isCourseComplete ? new Date() : enrollment.completedAt
        }
    })

    return { progress, enrollmentProgressPct: progressPct }
}

// ---- Helpers ----

const assertCourseOwnership = async (tenantId: string, courseId: string, actor: { id: string; role: Role }) => {
    const course = await db.client.course.findFirst({ where: { id: courseId, tenantId } })
    if (!course) throw AppError.notFound(responseMessage.NOT_FOUND('Course'), 'COURSE_NOT_FOUND')
    if (actor.role === Role.TRAINER && course.trainerId !== actor.id) {
        throw AppError.forbidden(responseMessage.FORBIDDEN, 'NOT_COURSE_OWNER')
    }
    return course
}
