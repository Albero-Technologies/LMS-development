// Load .env BEFORE the PrismaClient is instantiated — otherwise the Prisma
// schema's `env("DATABASE_URL")` resolves to undefined and the seed crashes.
// Prisma's own CLI auto-loads .env, but `ts-node prisma/seed.ts` (what
// `npm run prisma:seed` invokes) bypasses it.
//
// `default_node_env: 'development'` makes dotenv-flow fall back to
// .env.development when NODE_ENV is unset — this repo ships .env.development
// and .env.production but no plain .env, and the seed script doesn't set
// NODE_ENV the way the dev/start scripts do. Without this, dotenv-flow loads
// nothing and DATABASE_URL stays undefined.
import dotenvFlow from 'dotenv-flow'
dotenvFlow.config({ default_node_env: 'development' })

import { AuthProvider, CoursePublishState, CounsellorInviteStatus, LessonType, PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import { seedAlberoAcademy } from './seeds/albero-academy'

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

    // Platform tenant (§3.3) — superadmins live here, separate from any
    // regular customer tenant. Hidden from SA's tenant listing so it doesn't
    // appear as "a tenant they can manage".
    const platformTenant = await prisma.tenant.upsert({
        where: { slug: 'platform' },
        update: {},
        create: {
            name: 'Albero Academy Platform',
            slug: 'platform',
            plan: 'ENTERPRISE',
            brandingColor: '#0062ff'
        }
    })

    // SUPER_ADMIN identity is platform-level: not tied to any tenant's email
    // domain. Lives in the platform tenant. Tenant creation is the SA's job —
    // the user-facing flow is `POST /tenants`, gated to SUPER_ADMIN only.
    const SUPER_ADMIN_EMAIL = 'superadmin@albero.platform'

    // The canonical seed set — one user per role for Acme Institute, plus
    // the platform-level SUPER_ADMIN. Re-running this is idempotent via
    // upsert(tenantId+email).
    const roles: { email: string; first: string; last: string; role: Role; employeeCode?: string }[] = [
        { email: SUPER_ADMIN_EMAIL, first: 'Platform', last: 'Admin', role: Role.SUPER_ADMIN, employeeCode: 'SA-001' },
        { email: 'admin@acme-institute.dev', first: 'Anya', last: 'Admin', role: Role.ADMIN, employeeCode: 'A-001' },
        { email: 'trainer@acme-institute.dev', first: 'Tara', last: 'Trainer', role: Role.TRAINER, employeeCode: 'T-1001' },
        { email: 'student@acme-institute.dev', first: 'Sam', last: 'Student', role: Role.STUDENT },
        {
            email: 'manager@acme-institute.dev',
            first: 'Mira',
            last: 'Manager',
            role: Role.COUNSELLING_MANAGER,
            employeeCode: 'CM-001'
        },
        {
            email: 'counsellor@acme-institute.dev',
            first: 'Cara',
            last: 'Counsellor',
            role: Role.COUNSELLOR,
            employeeCode: 'C-1001'
        },
        { email: 'support@acme-institute.dev', first: 'Sid', last: 'Support', role: Role.SUPPORT, employeeCode: 'S-2001' }
    ]

    for (const r of roles) {
        // SUPER_ADMIN seeds into the platform tenant; everyone else seeds into
        // the customer tenant. This mirrors the §3.3 separation: SA identities
        // never live inside a customer tenant.
        const ownerTenantId = r.role === Role.SUPER_ADMIN ? platformTenant.id : tenant.id
        await prisma.user.upsert({
            where: { tenantId_email: { tenantId: ownerTenantId, email: r.email } },
            update: { employeeCode: r.employeeCode ?? undefined },
            create: {
                tenantId: ownerTenantId,
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
        where: { tenantId_email: { tenantId: tenant.id, email: 'manager@acme-institute.dev' } }
    })
    const seedCounsellor = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: 'counsellor@acme-institute.dev' } }
    })
    if (seedManager && seedCounsellor && seedCounsellor.managerId !== seedManager.id) {
        await prisma.user.update({
            where: { id: seedCounsellor.id },
            data: { managerId: seedManager.id }
        })
    }

    const trainer = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: 'trainer@acme-institute.dev' } }
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
        where: { tenantId_email: { tenantId: tenant.id, email: 'counsellor@acme-institute.dev' } }
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
    }

    // Provision the Albero Academy tenant — its own admin/trainer/counsellor,
    // 3 published flagship courses, multi-page landing site, CMS collections,
    // SEO + analytics. Idempotent.
    await seedAlberoAcademy(prisma)

    // Both tenants seeded — the demo Acme one above, plus Albero Academy via
    // seedAlberoAcademy(). Logging both so the message isn't misread as
    // "only Acme was seeded".
    console.log(`Seed complete · tenants: ${tenant.slug} + albero-academy`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => void prisma.$disconnect())
