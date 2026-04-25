import { type Prisma, Role } from '@prisma/client'
import db from '../../service/db'

export interface TAuditFilters {
    tenantId?: string
    userId?: string
    action?: string
    dateFrom?: Date
    dateTo?: Date
    search?: string
}

export interface TAuditScope {
    actorRole: Role
    actorTenantId: string
}

export interface TAuditQuery extends TAuditFilters {
    page: number
    pageSize: number
}

const buildWhere = (scope: TAuditScope, filters: TAuditFilters): Prisma.AuditLogWhereInput => {
    const where: Prisma.AuditLogWhereInput = {}

    // Tenant scoping — SUPER_ADMIN can read across tenants (optionally filter to one),
    // every other actor is pinned to their own tenant.
    if (scope.actorRole === Role.SUPER_ADMIN) {
        if (filters.tenantId) where.tenantId = filters.tenantId
    } else {
        where.tenantId = scope.actorTenantId
    }

    if (filters.userId) where.userId = filters.userId
    if (filters.action) where.action = { startsWith: filters.action }
    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
        if (filters.dateTo) where.createdAt.lte = filters.dateTo
    }
    if (filters.search) {
        const needle = filters.search
        where.OR = [
            { action: { contains: needle, mode: 'insensitive' } },
            { entityType: { contains: needle, mode: 'insensitive' } },
            { entityId: { contains: needle, mode: 'insensitive' } }
        ]
    }
    return where
}

export const listAuditLogs = async (scope: TAuditScope, query: TAuditQuery) => {
    const where = buildWhere(scope, query)
    const { page, pageSize } = query

    const [items, total] = await Promise.all([
        db.client.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                tenant: { select: { id: true, name: true, slug: true } },
                user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } }
            }
        }),
        db.client.auditLog.count({ where })
    ])

    return {
        items: items.map((row) => ({
            id: row.id,
            action: row.action,
            entityType: row.entityType,
            entityId: row.entityId,
            metadata: row.metadata,
            ipAddress: row.ipAddress,
            userAgent: row.userAgent,
            createdAt: row.createdAt,
            tenant: row.tenant ? { id: row.tenant.id, name: row.tenant.name, slug: row.tenant.slug } : null,
            actor: row.user
                ? { id: row.user.id, email: row.user.email, name: `${row.user.firstName} ${row.user.lastName}`, role: row.user.role }
                : null
        })),
        total,
        page,
        pageSize
    }
}
