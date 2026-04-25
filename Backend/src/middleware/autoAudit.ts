// AutoAudit middleware — writes an AuditLog row for every successful mutation
// so the audit_logs table is never empty in a running tenant. Controllers may
// still call writeAudit() for richer entity tracking; those co-exist.
//
// Why this exists: relying on controllers to remember to call writeAudit()
// leaves silent holes when new routes are added. A response-level fallback
// guarantees coverage.
import { type NextFunction, type Request, type Response } from 'express'
import db from '../service/db'
import logger from '../util/logger'

const TRACKED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Paths we never want to flood audit_logs with.
const SKIP_PREFIXES = ['/api/v1/health', '/api/v1/metrics', '/api/v1/docs', '/api/v1/webhooks']

const shouldSkip = (url: string): boolean => SKIP_PREFIXES.some((prefix) => url.startsWith(prefix))

const deriveAction = (req: Request): string => {
    const segments = (req.baseUrl + req.path)
        .replace(/^\/api\/v\d+\//, '')
        .split('/')
        .filter(Boolean)
        .filter((s) => !/^[0-9a-f-]{8,}$/i.test(s))
    const resource = segments[0] ?? 'unknown'
    const sub = segments[1] && !/^[0-9a-f-]{8,}$/i.test(segments[1]) ? `.${segments[1]}` : ''
    const verb = req.method === 'POST' ? 'create' : req.method === 'DELETE' ? 'delete' : 'update'
    return `${resource}${sub}.${verb}`
}

export const autoAudit = (req: Request, res: Response, next: NextFunction): void => {
    if (!TRACKED_METHODS.has(req.method) || shouldSkip(req.originalUrl)) {
        return next()
    }

    res.on('finish', () => {
        if (res.statusCode >= 400) return

        // Never block the response — fire-and-forget.
        void db.client.auditLog
            .create({
                data: {
                    action: deriveAction(req),
                    entityType: null,
                    entityId: null,
                    metadata: {
                        method: req.method,
                        path: req.originalUrl,
                        status: res.statusCode,
                        requestId: req.requestId ?? null
                    },
                    tenantId: req.auth?.tenantId ?? null,
                    userId: req.auth?.userId ?? null,
                    ipAddress: req.ip ?? null,
                    userAgent: req.headers['user-agent'] ?? null
                }
            })
            .catch((err: unknown) => {
                logger.error('AUTO_AUDIT_FAILED', {
                    meta: { path: req.originalUrl, method: req.method, err: (err as Error).message }
                })
            })
    })

    next()
}

export default autoAudit
