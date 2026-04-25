// Local-only course catalog store.
//
// Phase 1 wires this to the backend via TanStack Query. Until then, a Zustand
// store with localStorage persistence gives us a real working UX — add a
// course, add YouTube lessons, watch them, track completion — all from the
// browser, survives reload.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { parseYouTubeId } from '../helpers/youtube'

export type TLesson = {
    id: string
    title: string
    kind: 'youtube' | 'pdf' | 'link'
    /** For youtube kind — the 11-char ID. */
    youtubeId?: string
    /** For pdf/link kind. */
    url?: string
    durationMin?: number
    completed?: boolean
}

export type TSection = {
    id: string
    title: string
    lessons: TLesson[]
}

export type TCourse = {
    id: string
    title: string
    slug: string
    description: string
    price: number
    isPublished: boolean
    enrolledCount: number
    coverUrl?: string | null
    sections: TSection[]
}

type Store = {
    courses: TCourse[]
    // ------- course ops -------
    upsertCourse: (c: TCourse) => void
    deleteCourse: (id: string) => void
    publishCourse: (id: string, published: boolean) => void
    // ------- curriculum ops -------
    addSection: (courseId: string, title: string) => void
    renameSection: (courseId: string, sectionId: string, title: string) => void
    removeSection: (courseId: string, sectionId: string) => void
    addYouTubeLesson: (
        courseId: string,
        sectionId: string,
        args: { title: string; urlOrId: string; durationMin?: number }
    ) => { ok: true } | { ok: false; error: string }
    removeLesson: (courseId: string, sectionId: string, lessonId: string) => void
    markLessonComplete: (courseId: string, sectionId: string, lessonId: string, completed: boolean) => void
}

const newId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2)

const SEED: TCourse[] = [
    {
        id: 'sys-design',
        title: 'System Design Foundations',
        slug: 'sys-design',
        description: 'Learn how to design systems that scale past 1M MAU. Weekly capstone project, 1:1 trainer feedback.',
        price: 4999,
        isPublished: true,
        enrolledCount: 148,
        sections: [
            {
                id: 's1',
                title: 'Module 1 — Fundamentals',
                lessons: [
                    {
                        id: 'l1',
                        title: 'What is system design? · Intro + mindset',
                        kind: 'youtube',
                        youtubeId: 'bUHFg8CZFws', // sample public talk
                        durationMin: 9,
                        completed: true
                    },
                    {
                        id: 'l2',
                        title: 'Latency, throughput, and why both matter',
                        kind: 'youtube',
                        youtubeId: 'Q-x3lJmcVsQ',
                        durationMin: 14
                    }
                ]
            },
            {
                id: 's2',
                title: 'Module 2 — Consistency patterns',
                lessons: [
                    {
                        id: 'l3',
                        title: 'Consistent hashing · walkthrough',
                        kind: 'youtube',
                        youtubeId: 'Q-x3lJmcVsQ',
                        durationMin: 18
                    }
                ]
            }
        ]
    },
    {
        id: 'ts-fs',
        title: 'Full-stack TypeScript',
        slug: 'ts-fs',
        description: 'Build a production app end-to-end with Express, Prisma, Zod, and React 19.',
        price: 5999,
        isPublished: true,
        enrolledCount: 212,
        sections: [
            {
                id: 's1',
                title: 'Module 1 — TypeScript in two hours',
                lessons: [
                    {
                        id: 'l1',
                        title: 'Types vs interfaces — when each',
                        kind: 'youtube',
                        youtubeId: 'BCg4U1FzODs',
                        durationMin: 12
                    }
                ]
            }
        ]
    },
    {
        id: 'dsa-30',
        title: 'DSA in 30 days',
        slug: 'dsa-30',
        description: 'One curated problem a day, weekly timed mock, peer review.',
        price: 2999,
        isPublished: true,
        enrolledCount: 430,
        sections: []
    },
    {
        id: 'react-prod',
        title: 'React for Production',
        slug: 'react-prod',
        description: 'Performance, testing, and shipping patterns that scale past the demo.',
        price: 3999,
        isPublished: false,
        enrolledCount: 0,
        sections: []
    }
]

export const useCourseStore = create<Store>()(
    persist(
        (set) => ({
            courses: SEED,

            upsertCourse: (c) =>
                set((s) => {
                    const i = s.courses.findIndex((x) => x.id === c.id)
                    if (i === -1) return { courses: [c, ...s.courses] }
                    const next = s.courses.slice()
                    next[i] = c
                    return { courses: next }
                }),

            deleteCourse: (id) => set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),

            publishCourse: (id, published) =>
                set((s) => ({
                    courses: s.courses.map((c) => (c.id === id ? { ...c, isPublished: published } : c))
                })),

            addSection: (courseId, title) =>
                set((s) => ({
                    courses: s.courses.map((c) => (c.id === courseId ? { ...c, sections: [...c.sections, { id: newId(), title, lessons: [] }] } : c))
                })),

            renameSection: (courseId, sectionId, title) =>
                set((s) => ({
                    courses: s.courses.map((c) =>
                        c.id !== courseId
                            ? c
                            : {
                                  ...c,
                                  sections: c.sections.map((sec) => (sec.id === sectionId ? { ...sec, title } : sec))
                              }
                    )
                })),

            removeSection: (courseId, sectionId) =>
                set((s) => ({
                    courses: s.courses.map((c) => (c.id !== courseId ? c : { ...c, sections: c.sections.filter((sec) => sec.id !== sectionId) }))
                })),

            addYouTubeLesson: (courseId, sectionId, { title, urlOrId, durationMin }) => {
                const youtubeId = parseYouTubeId(urlOrId)
                if (!youtubeId) return { ok: false, error: "That doesn't look like a YouTube URL or video ID." }
                set((s) => ({
                    courses: s.courses.map((c) =>
                        c.id !== courseId
                            ? c
                            : {
                                  ...c,
                                  sections: c.sections.map((sec) =>
                                      sec.id !== sectionId
                                          ? sec
                                          : {
                                                ...sec,
                                                lessons: [
                                                    ...sec.lessons,
                                                    {
                                                        id: newId(),
                                                        title: title || 'Untitled lesson',
                                                        kind: 'youtube',
                                                        youtubeId,
                                                        durationMin
                                                    }
                                                ]
                                            }
                                  )
                              }
                    )
                }))
                return { ok: true }
            },

            removeLesson: (courseId, sectionId, lessonId) =>
                set((s) => ({
                    courses: s.courses.map((c) =>
                        c.id !== courseId
                            ? c
                            : {
                                  ...c,
                                  sections: c.sections.map((sec) =>
                                      sec.id !== sectionId ? sec : { ...sec, lessons: sec.lessons.filter((l) => l.id !== lessonId) }
                                  )
                              }
                    )
                })),

            markLessonComplete: (courseId, sectionId, lessonId, completed) =>
                set((s) => ({
                    courses: s.courses.map((c) =>
                        c.id !== courseId
                            ? c
                            : {
                                  ...c,
                                  sections: c.sections.map((sec) =>
                                      sec.id !== sectionId
                                          ? sec
                                          : {
                                                ...sec,
                                                lessons: sec.lessons.map((l) => (l.id === lessonId ? { ...l, completed } : l))
                                            }
                                  )
                              }
                    )
                }))
        }),
        {
            name: 'learnhub.courses',
            storage: createJSONStorage(() => localStorage),
            version: 1
        }
    )
)
