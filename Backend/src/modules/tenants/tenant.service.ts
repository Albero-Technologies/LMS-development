import { AuthProvider, type Prisma, Role, TenantStatus, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { hashPassword } from '../../util/password'
import { type TCreateTenantInput, type TUpdateTenantBrandingInput } from './tenant.schema'

// Bootstrap a tenant with its first admin — a single transaction so a failed admin create
// never leaves a tenant orphaned.
export const createTenant = async (input: TCreateTenantInput) => {
    const existing = await db.client.tenant.findUnique({ where: { slug: input.slug } })
    if (existing) throw AppError.conflict(responseMessage.ALREADY_EXISTS('Tenant'), 'TENANT_EXISTS')

    const adminPasswordHash = await hashPassword(input.adminPassword)

    return db.client.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                name: input.name,
                slug: input.slug,
                plan: input.plan || 'FREE',
                status: TenantStatus.ACTIVE,
                brandingLogo: input.brandingLogo,
                brandingColor: input.brandingColor
            }
        })

        const admin = await tx.user.create({
            data: {
                tenantId: tenant.id,
                email: input.adminEmail.toLowerCase(),
                passwordHash: adminPasswordHash,
                firstName: input.adminFirstName,
                lastName: input.adminLastName,
                role: Role.ADMIN,
                status: UserStatus.ACTIVE,
                emailVerified: true,
                provider: AuthProvider.LOCAL
            }
        })

        return { tenant, admin: { id: admin.id, email: admin.email, role: admin.role } }
    })
}

export const getTenant = async (tenantId: string) => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')
    return tenant
}

// SUPER_ADMIN cross-tenant listing — used by the SA panel (§4.1). Includes
// counts so the table can show "X users / Y courses" without N+1 round-trips.
export const listAllTenants = async () => {
    const rows = await db.client.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { users: true, courses: true } }
        }
    })
    return rows.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        status: t.status,
        brandingLogo: t.brandingLogo,
        brandingColor: t.brandingColor,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        userCount: t._count.users,
        courseCount: t._count.courses
    }))
}

// SUPER_ADMIN tenant detail — overview-tab payload. Returns the tenant + the
// first ADMIN user (the contact person), counts, and full settings JSON.
export const getTenantDetail = async (tenantId: string) => {
    const tenant = await db.client.tenant.findUnique({
        where: { id: tenantId },
        include: {
            _count: { select: { users: true, courses: true, enquiries: true, tickets: true } }
        }
    })
    if (!tenant) throw AppError.notFound(responseMessage.NOT_FOUND('Tenant'), 'TENANT_NOT_FOUND')

    const admin = await db.client.user.findFirst({
        where: { tenantId, role: 'ADMIN', deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, lastLoginAt: true, createdAt: true }
    })

    return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        brandingLogo: tenant.brandingLogo,
        brandingColor: tenant.brandingColor,
        settings: tenant.settings,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        admin,
        counts: {
            users: tenant._count.users,
            courses: tenant._count.courses,
            enquiries: tenant._count.enquiries,
            tickets: tenant._count.tickets
        }
    }
}

export const setTenantStatus = async (tenantId: string, status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL') => {
    const tenant = await db.client.tenant.update({
        where: { id: tenantId },
        data: { status }
    })
    return tenant
}

export const updateBranding = async (tenantId: string, input: TUpdateTenantBrandingInput) => {
    const data: Prisma.TenantUpdateInput = {}
    if (input.name !== undefined) data.name = input.name
    if (input.brandingLogo !== undefined) data.brandingLogo = input.brandingLogo
    if (input.brandingColor !== undefined) data.brandingColor = input.brandingColor
    if (input.settings !== undefined) data.settings = input.settings as Prisma.InputJsonValue

    const tenant = await db.client.tenant.update({ where: { id: tenantId }, data })
    return tenant
}
