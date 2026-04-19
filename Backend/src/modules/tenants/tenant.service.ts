import { AuthProvider, Prisma, Role, TenantStatus, UserStatus } from '@prisma/client'
import db from '../../service/db'
import AppError from '../../util/AppError'
import responseMessage from '../../constant/responseMessage'
import { hashPassword } from '../../util/password'
import { TCreateTenantInput, TUpdateTenantBrandingInput } from './tenant.schema'

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

export const updateBranding = async (tenantId: string, input: TUpdateTenantBrandingInput) => {
    const data: Prisma.TenantUpdateInput = {}
    if (input.name !== undefined) data.name = input.name
    if (input.brandingLogo !== undefined) data.brandingLogo = input.brandingLogo
    if (input.brandingColor !== undefined) data.brandingColor = input.brandingColor
    if (input.settings !== undefined) data.settings = input.settings as Prisma.InputJsonValue

    const tenant = await db.client.tenant.update({ where: { id: tenantId }, data })
    return tenant
}
