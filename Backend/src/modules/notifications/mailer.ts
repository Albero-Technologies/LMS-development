import nodemailer, { type Transporter } from 'nodemailer'
import config from '../../config/config'
import db from '../../service/db'
import logger from '../../util/logger'

// Per-tenant SMTP support (§4.1). When a tenantId is passed in, we look up
// tenant.settings.environment.smtp and use those credentials. Tenants without
// SMTP configured fall back to the platform default in env vars. Transporters
// are cached by a fingerprint of their config so we don't rebuild on every send
// — invalidate by simply changing one of the values, since a different
// fingerprint produces a different cache slot.

interface TenantSmtp {
    host?: string
    port?: number
    user?: string
    password?: string
    from?: string
    secure?: boolean
}

interface TransportEntry {
    transport: Transporter
    from: string
}

const cache = new Map<string, TransportEntry>()

const buildPlatformTransport = (): TransportEntry | null => {
    if (!config.NODEMAILER_MAIL || !config.NODEMAILER_PASS) return null
    const transport = config.NODEMAILER_HOST
        ? nodemailer.createTransport({
              host: config.NODEMAILER_HOST,
              port: config.NODEMAILER_PORT,
              secure: config.NODEMAILER_SECURE,
              auth: { user: config.NODEMAILER_MAIL, pass: config.NODEMAILER_PASS }
          })
        : nodemailer.createTransport({
              service: 'gmail',
              auth: { user: config.NODEMAILER_MAIL, pass: config.NODEMAILER_PASS }
          })
    const fromName = config.MAIL_FROM_NAME
    const fromEmail = config.MAIL_FROM_EMAIL || config.NODEMAILER_MAIL
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail
    return { transport, from }
}

const buildTenantTransport = (smtp: TenantSmtp): TransportEntry | null => {
    if (!smtp.host || !smtp.user || !smtp.password) return null
    const transport = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port ?? 587,
        secure: !!smtp.secure,
        auth: { user: smtp.user, pass: smtp.password }
    })
    const from = smtp.from || smtp.user
    return { transport, from }
}

const fingerprint = (smtp: TenantSmtp | null): string => (smtp ? JSON.stringify(smtp) : 'platform')

const resolveTenantSmtp = async (tenantId: string): Promise<TenantSmtp | null> => {
    const tenant = await db.client.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } })
    const env = (tenant?.settings as { environment?: { smtp?: TenantSmtp } } | null)?.environment
    if (!env?.smtp) return null
    return env.smtp
}

const getTransport = async (tenantId?: string): Promise<TransportEntry | null> => {
    const smtp = tenantId ? await resolveTenantSmtp(tenantId) : null
    const key = fingerprint(smtp)
    const cached = cache.get(key)
    if (cached) return cached
    const built = smtp ? buildTenantTransport(smtp) : buildPlatformTransport()
    if (built) cache.set(key, built)
    return built ?? buildPlatformTransport()
}

interface TSendInput {
    tenantId?: string
    to: string
    toName?: string
    subject: string
    html: string
    text: string
}

// Returns true if the send succeeded, false if no mailer is configured (dev mode).
// Throws on actual SMTP failures so BullMQ can retry.
export const sendEmail = async ({ tenantId, to, toName, subject, html, text }: TSendInput): Promise<boolean> => {
    const entry = await getTransport(tenantId)
    if (!entry) {
        logger.info('MAILER_SKIPPED', { meta: { reason: 'not_configured', to, subject } })
        return false
    }

    const recipient = toName ? `"${toName}" <${to}>` : to
    const info = await entry.transport.sendMail({ from: entry.from, to: recipient, subject, html, text })
    logger.debug('MAILER_SENT', { meta: { to, subject, messageId: info.messageId, tenantId } })
    return true
}
