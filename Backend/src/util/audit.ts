import { Request } from 'express'
import db from '../service/db'
import logger from './logger'

type TAuditInput = {
    action: string
    entityType?: string
    entityId?: string
    metadata?: Record<string, unknown>
    tenantId?: string | null
    userId?: string | null
}

export const writeAudit = async (input: TAuditInput, req?: Request): Promise<void> => {
    try {
        await db.client.auditLog.create({
            data: {
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                metadata: input.metadata ? (input.metadata as object) : {},
                tenantId: input.tenantId ?? req?.auth?.tenantId ?? null,
                userId: input.userId ?? req?.auth?.userId ?? null,
                ipAddress: req?.ip ?? null,
                userAgent: req?.headers['user-agent'] ?? null
            }
        })
    } catch (err) {
        // Audit must never block the primary flow.
        logger.error('AUDIT_WRITE_FAILED', { meta: { action: input.action, err: (err as Error).message } })
    }
}
