import crypto from 'crypto'
import Razorpay from 'razorpay'
import config from '../../config/config'
import db from '../../service/db'
import AppError from '../../util/AppError'

// Per-tenant Razorpay credentials (§4.1). When a tenantId is passed in, we
// resolve `tenant.settings.environment.razorpay` and instantiate a tenant-
// scoped client. Tenants without their own keys fall back to the platform
// account. SaaS billing (charging tenants for the platform) ALWAYS uses the
// platform account — that path simply doesn't pass a tenantId.

interface TenantRazorpayCfg {
    keyId?: string
    keySecret?: string
    webhookSecret?: string
}

interface Resolved {
    client: Razorpay
    keyId: string
    keySecret: string
}

let platformClient: Razorpay | null = null
const tenantClients = new Map<string, Resolved>()

const buildPlatform = (): Resolved | null => {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) return null
    if (!platformClient) {
        platformClient = new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET })
    }
    return { client: platformClient, keyId: config.RAZORPAY_KEY_ID, keySecret: config.RAZORPAY_KEY_SECRET }
}

const buildTenant = (cfg: TenantRazorpayCfg): Resolved | null => {
    if (!cfg.keyId || !cfg.keySecret) return null
    const cacheKey = `${cfg.keyId}:${cfg.keySecret.slice(0, 4)}`
    const cached = tenantClients.get(cacheKey)
    if (cached) return cached
    const client = new Razorpay({ key_id: cfg.keyId, key_secret: cfg.keySecret })
    const resolved: Resolved = { client, keyId: cfg.keyId, keySecret: cfg.keySecret }
    tenantClients.set(cacheKey, resolved)
    return resolved
}

const resolveTenantCfg = async (tenantId: string): Promise<TenantRazorpayCfg | null> => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } })
    return (tenant?.settings as { environment?: { razorpay?: TenantRazorpayCfg } } | null)?.environment?.razorpay ?? null
}

// Resolve tenant-or-platform Razorpay client with the actual key id/secret.
// Used by callers that need to know which key id to surface to the frontend.
export const resolveRazorpay = async (tenantId?: string): Promise<Resolved> => {
    if (tenantId) {
        const cfg = await resolveTenantCfg(tenantId)
        if (cfg?.keyId && cfg.keySecret) {
            const r = buildTenant(cfg)
            if (r) return r
        }
    }
    const platform = buildPlatform()
    if (!platform) throw AppError.badRequest('Razorpay is not configured', 'RAZORPAY_NOT_CONFIGURED')
    return platform
}

// Sync, platform-only client. Callers that don't pass a tenantId still work
// with the original behaviour. Used by SaaS-billing where credentials must be
// the platform's own.
export const getRazorpay = (): Razorpay => {
    const platform = buildPlatform()
    if (!platform) throw AppError.badRequest('Razorpay is not configured', 'RAZORPAY_NOT_CONFIGURED')
    return platform.client
}

// Verify the handshake signature returned by the Razorpay Checkout callback.
// Pass the tenantId for tenant-scoped flows (student payments) so the right
// secret is used; omit for platform-scoped flows (SaaS invoices).
export const verifyPaymentSignature = async (orderId: string, paymentId: string, signature: string, tenantId?: string): Promise<boolean> => {
    let secret: string | undefined
    if (tenantId) {
        const cfg = await resolveTenantCfg(tenantId)
        secret = cfg?.keySecret ?? config.RAZORPAY_KEY_SECRET
    } else {
        secret = config.RAZORPAY_KEY_SECRET
    }
    if (!secret) return false
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
    return safeEqual(expected, signature)
}

// Verify webhook payload signature against the shared webhook secret.
// Tries tenant secret first if tenantId given, else platform.
export const verifyWebhookSignature = async (rawBody: string, signature: string, tenantId?: string): Promise<boolean> => {
    let secret: string | undefined
    if (tenantId) {
        const cfg = await resolveTenantCfg(tenantId)
        secret = cfg?.webhookSecret ?? config.RAZORPAY_WEBHOOK_SECRET
    } else {
        secret = config.RAZORPAY_WEBHOOK_SECRET
    }
    if (!secret) return false
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    return safeEqual(expected, signature)
}

const safeEqual = (a: string, b: string): boolean => {
    const ab = Buffer.from(a, 'utf8')
    const bb = Buffer.from(b, 'utf8')
    if (ab.length !== bb.length) return false
    return crypto.timingSafeEqual(ab, bb)
}
