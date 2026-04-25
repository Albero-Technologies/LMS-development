import { PrismaClient } from '@prisma/client'
import config from '../config/config'
import logger from '../util/logger'

// Tables that carry tenant_id — Prisma middleware enforces the filter + soft-delete.
const TENANT_SCOPED_MODELS = new Set<string>([
    'User',
    'Invite',
    'Course',
    'CourseSection',
    'Batch',
    'Enrollment',
    'Invoice',
    'PaymentEvent',
    'Quiz',
    'QuizAttempt',
    'CounsellorInviteLink',
    'StudentSignup',
    'CounsellorTarget',
    'Ticket',
    'Notification'
])

const SOFT_DELETE_MODELS = new Set<string>(['Tenant', 'User', 'Course', 'Batch', 'Enrollment', 'Quiz', 'CounsellorInviteLink', 'Ticket'])

const prisma = new PrismaClient({
    log: config.ENV === 'development' ? ['warn', 'error'] : ['error']
})

// `findUnique({ where: { tenantId_email: { tenantId, email } } })` is a
// compound-key shorthand only valid on findUnique. When we rewrite to
// findFirst (so we can layer `deletedAt: null`), flatten the compound key
// into its constituent equality filters — otherwise Prisma errors out with
// `Unknown argument tenantId_email`.
const flattenCompoundUniqueKeys = (where: Record<string, unknown> | undefined): Record<string, unknown> => {
    if (!where) return {}
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(where)) {
        const looksCompound = key.includes('_') && value && typeof value === 'object' && !Array.isArray(value)
        if (looksCompound) {
            for (const [innerKey, innerValue] of Object.entries(value as Record<string, unknown>)) {
                out[innerKey] = innerValue
            }
        } else {
            out[key] = value
        }
    }
    return out
}

// Soft-delete middleware — transparently filter deleted_at on reads.
prisma.$use(async (params, next) => {
    if (!params.model || !SOFT_DELETE_MODELS.has(params.model)) {
        return next(params)
    }

    if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = params.action === 'findUnique' ? 'findFirst' : params.action
        params.args = params.args || {}
        params.args.where = { ...flattenCompoundUniqueKeys(params.args.where), deletedAt: null }
    }

    if (params.action === 'findMany' || params.action === 'count' || params.action === 'aggregate') {
        params.args = params.args || {}
        params.args.where = { deletedAt: null, ...(params.args.where || {}) }
    }

    if (params.action === 'delete') {
        params.action = 'update'
        params.args.data = { deletedAt: new Date() }
    }

    if (params.action === 'deleteMany') {
        params.action = 'updateMany'
        params.args.data = { ...(params.args.data || {}), deletedAt: new Date() }
    }

    return next(params)
})

export const isTenantScoped = (model?: string): boolean => (model ? TENANT_SCOPED_MODELS.has(model) : false)

export default {
    client: prisma,
    connect: async () => {
        try {
            await prisma.$connect()
            // smoke query
            await prisma.$queryRaw`SELECT 1`
            return {
                host: new URL(config.DATABASE_URL).host,
                name: new URL(config.DATABASE_URL).pathname.replace('/', ''),
                port: new URL(config.DATABASE_URL).port || '5432'
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error'
            throw new Error(`Database connection failed: ${msg}`)
        }
    },
    disconnect: async () => {
        try {
            await prisma.$disconnect()
        } catch (err) {
            logger.error('DB_DISCONNECT_ERROR', { meta: err })
        }
    }
}
