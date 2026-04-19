import { AuthProvider, CoursePublishState, CounsellorInviteStatus, LessonType, PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
    const hash = async (pw: string) => bcrypt.hash(pw, 10)

    // Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'acme-institute' },
        update: {},
        create: {
            name: 'Acme Institute',
            slug: 'acme-institute',
            plan: 'STARTER',
            brandingColor: '#2563eb'
        }
    })

    // One user per role — convenient for Phase 1 smoke testing.
    const roles: { email: string; first: string; last: string; role: Role; employeeCode?: string }[] = [
        { email: 'super@acme.dev', first: 'Super', last: 'Admin', role: Role.SUPER_ADMIN },
        { email: 'admin@acme.dev', first: 'Anya', last: 'Admin', role: Role.ADMIN },
        { email: 'trainer@acme.dev', first: 'Tara', last: 'Trainer', role: Role.TRAINER },
        { email: 'student@acme.dev', first: 'Sam', last: 'Student', role: Role.STUDENT },
        {
            email: 'manager@acme.dev',
            first: 'Mira',
            last: 'Manager',
            role: Role.COUNSELLING_MANAGER,
            employeeCode: 'CM-001'
        },
        {
            email: 'counsellor@acme.dev',
            first: 'Cara',
            last: 'Counsellor',
            role: Role.COUNSELLOR,
            employeeCode: 'C-1001'
        },
        { email: 'support@acme.dev', first: 'Sid', last: 'Support', role: Role.SUPPORT },
        { email: 'client@acme.dev', first: 'Bee', last: 'Client', role: Role.CLIENT }
    ]

    for (const r of roles) {
        await prisma.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: r.email } },
            update: { employeeCode: r.employeeCode ?? undefined },
            create: {
                tenantId: tenant.id,
                email: r.email,
                passwordHash: await hash('Password123'),
                firstName: r.first,
                lastName: r.last,
                role: r.role,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                provider: AuthProvider.LOCAL,
                employeeCode: r.employeeCode
            }
        })
    }

    // Wire the seed counsellor under the manager so the team flows have data.
    const seedManager = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: 'manager@acme.dev' } }
    })
    const seedCounsellor = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: 'counsellor@acme.dev' } }
    })
    if (seedManager && seedCounsellor && seedCounsellor.managerId !== seedManager.id) {
        await prisma.user.update({
            where: { id: seedCounsellor.id },
            data: { managerId: seedManager.id }
        })
    }

    const trainer = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: 'trainer@acme.dev' } }
    })

    // One published course with one YouTube lesson + one quiz.
    const existingCourse = await prisma.course.findUnique({
        where: { tenantId_slug: { tenantId: tenant.id, slug: 'js-fundamentals' } }
    })

    if (!existingCourse && trainer) {
        const course = await prisma.course.create({
            data: {
                tenantId: tenant.id,
                trainerId: trainer.id,
                title: 'JavaScript Fundamentals',
                slug: 'js-fundamentals',
                description: 'The MVP demo course.',
                price: 49900,
                currency: 'INR',
                gstPercent: 18,
                publishState: CoursePublishState.PUBLISHED,
                tags: ['js', 'fundamentals']
            }
        })
        const section = await prisma.courseSection.create({
            data: { courseId: course.id, title: 'Getting started', order: 0 }
        })
        await prisma.lesson.create({
            data: {
                sectionId: section.id,
                title: 'Intro to JS',
                type: LessonType.YOUTUBE,
                youtubeId: 'dQw4w9WgXcQ',
                durationSec: 300,
                order: 0
            }
        })
        const quiz = await prisma.quiz.create({
            data: {
                tenantId: tenant.id,
                courseId: course.id,
                title: 'Basic JS Quiz',
                durationSec: 600,
                maxAttempts: 3,
                passPercent: 60,
                isPublished: true
            }
        })
        await prisma.quizQuestion.createMany({
            data: [
                {
                    quizId: quiz.id,
                    prompt: 'Which keyword declares a block-scoped variable?',
                    options: [
                        { id: 'a', text: 'var' },
                        { id: 'b', text: 'let' },
                        { id: 'c', text: 'function' }
                    ],
                    correctIds: ['b'],
                    marks: 1,
                    order: 0
                },
                {
                    quizId: quiz.id,
                    prompt: 'typeof null is?',
                    options: [
                        { id: 'a', text: 'null' },
                        { id: 'b', text: 'object' },
                        { id: 'c', text: 'undefined' }
                    ],
                    correctIds: ['b'],
                    marks: 1,
                    order: 1
                }
            ]
        })
    }

    // Sample active onboarding link for the counsellor — surfaces the new flow in dev.
    const counsellor = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: 'counsellor@acme.dev' } }
    })
    if (counsellor) {
        const seededToken = 'seed-onboarding-token-acme'
        await prisma.counsellorInviteLink.upsert({
            where: { token: seededToken },
            update: {},
            create: {
                tenantId: tenant.id,
                counsellorId: counsellor.id,
                token: seededToken,
                label: 'Demo onboarding link',
                maxUses: 50,
                status: CounsellorInviteStatus.ACTIVE,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        })

        // Quiet the lints — `crypto` is reserved if we extend seed later.
        void crypto
    }

    // eslint-disable-next-line no-console
    console.log('Seed complete:', tenant.slug)
}

main()
    .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
