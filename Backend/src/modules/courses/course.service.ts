import { CoursePublishState, EnrollmentStatus, LessonType, type Prisma, Role } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { buildLessonGateMap, summarizeDemoAccess, type DemoAccessContext } from './demo-access'
import {
    type TCreateCourseInput,
    type TCreateLessonInput,
    type TCreateSectionInput,
    type TListCoursesQuery,
    type TProgressUpdateInput,
    type TUpdateCourseInput,
    type TUpdateLessonInput,
    type TUpdateSectionInput
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

export const getCourse = async (tenantId: string, id: string, opts?: { includePrivate?: boolean; viewerUserId?: string }) => {
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

    // When the viewer is a student, attach a per-lesson `locked` flag and
    // a course-level demo summary derived from their enrolment. Returns
    // unmodified course for trainers / admins / SAs (they always see the
    // full curriculum).
    if (opts?.viewerUserId) {
        const enrollment = await db.client.enrollment.findUnique({
            where: { tenantId_userId_courseId: { tenantId, userId: opts.viewerUserId, courseId: course.id } },
            select: {
                accessTier: true,
                demoLessonLimit: true,
                demoLessonAllowlist: true,
                demoExpiresAt: true,
                status: true
            }
        })

        if (enrollment) {
            const ctx: DemoAccessContext = {
                enrollment,
                course: { demoEnabled: course.demoEnabled, demoLessonDefault: course.demoLessonDefault },
                sections: course.sections
            }
            const gateMap = buildLessonGateMap(ctx)
            const summary = summarizeDemoAccess(ctx)

            // Lock-aware section + lesson copies. Hide the YouTube id /
            // external URL on locked lessons so a curious student can't
            // hand-craft a request to play paid content. Front-end gets a
            // `locked: true` flag + a placeholder thumbnail and renders the
            // padlock overlay.
            const sections = course.sections.map((s) => ({
                ...s,
                lessons: s.lessons.map((l) => {
                    const gate = gateMap.get(l.id)
                    const locked = !!gate?.locked
                    return {
                        ...l,
                        locked,
                        lockReason: gate?.reason ?? null,
                        youtubeId: locked ? null : l.youtubeId,
                        externalUrl: locked ? null : l.externalUrl
                    }
                })
            }))
            return { ...course, sections, demoAccess: summary, enrollment }
        }
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
            subtitle: input.subtitle,
            slug: input.slug,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
            heroUrl: input.heroUrl,
            price: input.price,
            currency: input.currency,
            gstPercent: input.gstPercent,
            trainerId,
            tags: input.tags ?? [],
            level: input.level,
            language: input.language,
            outcomes: input.outcomes ?? [],
            prerequisites: input.prerequisites ?? [],
            audience: input.audience ?? [],
            enrolmentCap: input.enrolmentCap ?? null,
            startsAt: input.startsAt ? new Date(input.startsAt) : null,
            endsAt: input.endsAt ? new Date(input.endsAt) : null,
            certificateEnabled: input.certificateEnabled ?? false,
            certificateTemplate: input.certificateTemplate ?? null,
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

    // Normalise dates: pass through `null` to clear, `Date` to set, leave
    // `undefined` so Prisma keeps the existing value untouched.
    const startsAt = input.startsAt === undefined ? undefined : input.startsAt === null ? null : new Date(input.startsAt)
    const endsAt = input.endsAt === undefined ? undefined : input.endsAt === null ? null : new Date(input.endsAt)

    const updated = await db.client.course.update({
        where: { id },
        data: {
            title: input.title,
            subtitle: input.subtitle,
            slug: input.slug,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
            heroUrl: input.heroUrl,
            price: input.price,
            currency: input.currency,
            gstPercent: input.gstPercent,
            trainerId: input.trainerId,
            tags: input.tags,
            level: input.level,
            language: input.language,
            outcomes: input.outcomes,
            prerequisites: input.prerequisites,
            audience: input.audience,
            enrolmentCap: input.enrolmentCap,
            startsAt,
            endsAt,
            certificateEnabled: input.certificateEnabled,
            certificateTemplate: input.certificateTemplate,
            demoEnabled: input.demoEnabled,
            demoLessonDefault: input.demoLessonDefault,
            demoExpiryDays: input.demoExpiryDays,
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

export const updateSection = async (
    tenantId: string,
    courseId: string,
    sectionId: string,
    input: TUpdateSectionInput,
    actor: { id: string; role: Role }
) => {
    await assertCourseOwnership(tenantId, courseId, actor)
    const section = await db.client.courseSection.findFirst({ where: { id: sectionId, courseId } })
    if (!section) throw AppError.notFound(responseMessage.NOT_FOUND('Section'))
    return db.client.courseSection.update({
        where: { id: sectionId },
        data: { title: input.title, order: input.order }
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
            order: input.order,
            freePreview: input.freePreview ?? false,
            demoAccess: input.demoAccess ?? false,
            // Prisma's Json column accepts the array directly; cast through
            // unknown because TS infers the literal too narrowly.
            resources: (input.resources ?? null) as unknown as Prisma.InputJsonValue
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
            order: input.order,
            freePreview: input.freePreview,
            demoAccess: input.demoAccess,
            resources: input.resources === undefined ? undefined : ((input.resources ?? null) as unknown as Prisma.InputJsonValue)
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

    // Demo gate — refuse progress writes on locked lessons. We re-fetch the
    // course curriculum to feed the resolver because a single Lesson row
    // can't tell us about its siblings (the limit-based unlock rule needs
    // them). Cheap because course detail is already cache-able.
    const courseRow = await db.client.course.findFirst({
        where: { id: courseId, tenantId },
        select: {
            demoEnabled: true,
            demoLessonDefault: true,
            sections: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    order: true,
                    demoSection: true,
                    lessons: { orderBy: { order: 'asc' }, select: { id: true, order: true, demoAccess: true } }
                }
            }
        }
    })
    if (courseRow) {
        const gate = buildLessonGateMap({
            enrollment,
            course: { demoEnabled: courseRow.demoEnabled, demoLessonDefault: courseRow.demoLessonDefault },
            sections: courseRow.sections
        }).get(lessonId)
        if (gate?.locked) {
            throw AppError.forbidden('This lesson is locked until you complete payment.', 'LESSON_LOCKED')
        }
    }

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
