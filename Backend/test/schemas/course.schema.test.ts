import { describe, it, expect } from 'vitest'
import { createCourseSchema, createLessonSchema, progressUpdateSchema } from '../../src/modules/courses/course.schema'
import { LessonType } from '@prisma/client'

describe('course schemas', () => {
    it('accepts a valid course', () => {
        const res = createCourseSchema.safeParse({
            title: 'Intro to Testing',
            slug: 'intro-to-testing',
            price: 49900,
            currency: 'INR',
            gstPercent: 18
        })
        expect(res.success).toBe(true)
    })

    it('rejects an invalid slug (uppercase / spaces / leading dash)', () => {
        expect(createCourseSchema.safeParse({ title: 'X', slug: 'Bad Slug', price: 0 }).success).toBe(false)
        expect(createCourseSchema.safeParse({ title: 'X', slug: '-bad', price: 0 }).success).toBe(false)
    })

    it('caps GST to a legal range', () => {
        expect(createCourseSchema.safeParse({ title: 'X', slug: 'x-y', price: 0, gstPercent: 99 }).success).toBe(false)
    })

    describe('lessonSchema', () => {
        it('accepts a YouTube lesson', () => {
            const res = createLessonSchema.safeParse({
                sectionId: '11111111-1111-1111-1111-111111111111',
                title: 'Part 1',
                type: LessonType.YOUTUBE,
                youtubeId: 'dQw4w9WgXcQ',
                durationSec: 300
            })
            expect(res.success).toBe(true)
        })

        it('rejects a lesson with an out-of-range duration', () => {
            const res = createLessonSchema.safeParse({
                sectionId: '11111111-1111-1111-1111-111111111111',
                title: 'Part 1',
                type: LessonType.YOUTUBE,
                durationSec: 100_000
            })
            expect(res.success).toBe(false)
        })
    })

    describe('progressUpdateSchema', () => {
        it('accepts partial updates', () => {
            expect(progressUpdateSchema.safeParse({ watchedSec: 120 }).success).toBe(true)
            expect(progressUpdateSchema.safeParse({ completed: true }).success).toBe(true)
            expect(progressUpdateSchema.safeParse({}).success).toBe(true)
        })

        it('rejects non-integer watched values', () => {
            expect(progressUpdateSchema.safeParse({ watchedSec: -1 }).success).toBe(false)
            expect(progressUpdateSchema.safeParse({ watchedSec: 'five' }).success).toBe(false)
        })
    })
})
