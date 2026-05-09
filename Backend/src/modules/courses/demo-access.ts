import { EnrollmentAccessTier, type Course, type CourseSection, type Enrollment, type Lesson } from '@prisma/client'

// ----------------------------------------------------------------------
// Demo-mode access resolver
// ----------------------------------------------------------------------
//
// One source of truth for "can this enrolled student open this lesson?".
// Used by:
//   - course detail / lesson list endpoints (mark each lesson `locked: true|false`)
//   - lesson video / content endpoints (return 403 when locked)
//   - quiz + assignment listings (filter to demo lessons only)
//   - lesson-progress writes (refuse marking complete when locked)
//
// Resolution order (first match wins):
//   1. enrolment.accessTier === FULL          → unlocked
//   2. course.demoEnabled === false           → locked (no demo offered)
//   3. demoExpiresAt has passed               → locked
//   4. lesson.id in enrolment.demoLessonAllowlist → unlocked
//   5. lesson.demoAccess === true             → unlocked
//   6. section.demoSection === true           → unlocked (trainer marked
//                                                whole section as preview)
//   7. lesson is among the first N (ordered by section.order, then lesson.order)
//      where N = enrolment.demoLessonLimit ?? course.demoLessonDefault
//      → unlocked
//   else                                      → locked

export interface DemoAccessContext {
    enrollment: Pick<Enrollment, 'accessTier' | 'demoLessonLimit' | 'demoLessonAllowlist' | 'demoExpiresAt'>
    course: Pick<Course, 'demoEnabled' | 'demoLessonDefault'>
    sections: (Pick<CourseSection, 'id' | 'order' | 'demoSection'> & {
        lessons: Pick<Lesson, 'id' | 'order' | 'demoAccess'>[]
    })[]
}

export interface LessonGate {
    lessonId: string
    locked: boolean
    reason?: 'expired' | 'demo_disabled' | 'beyond_limit' | 'not_enrolled'
}

// Build a flat lessonId -> gate map for one enrolment. Caller picks
// individual entries by id; map is cheaper than O(N) scans on every read.
export const buildLessonGateMap = (ctx: DemoAccessContext): Map<string, LessonGate> => {
    const map = new Map<string, LessonGate>()
    const flatLessons = ctx.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .flatMap((s) => s.lessons.slice().sort((a, b) => a.order - b.order).map((l) => ({ ...l, sectionDemo: s.demoSection })))

    if (ctx.enrollment.accessTier === EnrollmentAccessTier.FULL) {
        for (const l of flatLessons) map.set(l.id, { lessonId: l.id, locked: false })
        return map
    }

    if (!ctx.course.demoEnabled) {
        for (const l of flatLessons) map.set(l.id, { lessonId: l.id, locked: true, reason: 'demo_disabled' })
        return map
    }

    const expired = !!(ctx.enrollment.demoExpiresAt && ctx.enrollment.demoExpiresAt.getTime() < Date.now())
    if (expired) {
        for (const l of flatLessons) map.set(l.id, { lessonId: l.id, locked: true, reason: 'expired' })
        return map
    }

    const allowlist = new Set<string>(ctx.enrollment.demoLessonAllowlist ?? [])
    const limit = ctx.enrollment.demoLessonLimit ?? ctx.course.demoLessonDefault

    let topUnlocked = 0
    for (const l of flatLessons) {
        if (allowlist.has(l.id) || l.demoAccess || l.sectionDemo) {
            map.set(l.id, { lessonId: l.id, locked: false })
            continue
        }
        if (topUnlocked < limit) {
            map.set(l.id, { lessonId: l.id, locked: false })
            topUnlocked += 1
            continue
        }
        map.set(l.id, { lessonId: l.id, locked: true, reason: 'beyond_limit' })
    }
    return map
}

// Convenience: gate one specific lesson. Same rules as buildLessonGateMap;
// use this for `findLesson` style endpoints where we only need the answer
// for a single id.
export const gateLesson = (ctx: DemoAccessContext, lessonId: string): LessonGate => {
    const map = buildLessonGateMap(ctx)
    return map.get(lessonId) ?? { lessonId, locked: true, reason: 'not_enrolled' }
}

// Quick summary used by the student dashboard banner and course-card chip.
//   tier:        DEMO | FULL
//   lessonsTotal:           total lessons in the course
//   lessonsUnlocked:        how many are open right now
//   demoExpired:            true when accessTier=DEMO + expiry passed
export interface DemoSummary {
    tier: EnrollmentAccessTier
    lessonsTotal: number
    lessonsUnlocked: number
    demoExpired: boolean
    demoExpiresAt: string | null
}

export const summarizeDemoAccess = (ctx: DemoAccessContext): DemoSummary => {
    const map = buildLessonGateMap(ctx)
    const total = map.size
    const unlocked = [...map.values()].filter((g) => !g.locked).length
    const expired = !!(
        ctx.enrollment.accessTier === EnrollmentAccessTier.DEMO &&
        ctx.enrollment.demoExpiresAt &&
        ctx.enrollment.demoExpiresAt.getTime() < Date.now()
    )
    return {
        tier: ctx.enrollment.accessTier,
        lessonsTotal: total,
        lessonsUnlocked: unlocked,
        demoExpired: expired,
        demoExpiresAt: ctx.enrollment.demoExpiresAt?.toISOString() ?? null
    }
}
