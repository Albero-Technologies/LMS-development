import { EmailDeliveryStatus } from '@prisma/client'
import nodemailer, { type Transporter } from 'nodemailer'
import config from '../../config/config'
import db from '../../service/db'
import logger from '../../util/logger'

// Per-tenant SMTP support (§4.1). Mail can be sent via three sources, in
// order of preference:
//   1. Per-tenant SMTP credentials at `tenant.settings.environment.smtp`
//      — admins can opt into their own outbound provider when they don't
//      want our platform Gmail to handle their student traffic.
//   2. Platform SMTP from env (NODEMAILER_*) — default for every tenant
//      that hasn't configured their own.
//   3. Skip — when neither is configured, return SKIPPED so dev mode and
//      misconfigured tenants don't crash the request.
//
// Every send writes one row to `email_logs` with status SENT / FAILED /
// SKIPPED so the admin troubleshooter and the dev console can trace
// delivery without grepping process logs.

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

interface TenantMailContext {
    tenantId: string
    name: string
    contactEmail: string | null
    smtp: TenantSmtp | null
}

const resolveTenantContext = async (tenantId: string): Promise<TenantMailContext | null> => {
    const tenant = await db.client.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, settings: true }
    })
    if (!tenant) return null
    const settings = tenant.settings as { contacts?: { primaryEmail?: string }; environment?: { smtp?: TenantSmtp } } | null
    const contactEmail = settings?.contacts?.primaryEmail?.trim() || null
    return {
        tenantId: tenant.id,
        name: tenant.name,
        contactEmail: isValidEmail(contactEmail) ? contactEmail : null,
        smtp: settings?.environment?.smtp ?? null
    }
}

const getTransport = (smtp: TenantSmtp | null): TransportEntry | null => {
    const key = fingerprint(smtp)
    const cached = cache.get(key)
    if (cached) return cached
    const built = smtp ? buildTenantTransport(smtp) : buildPlatformTransport()
    if (built) cache.set(key, built)
    return built ?? buildPlatformTransport()
}

// RFC 5322 lite — strict enough to catch typos but doesn't reject every
// edge-case quoted-local-part the spec technically allows. Empty / null
// strings come back false; we never try to validate placeholder text.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (value: string | null | undefined): value is string => {
    if (!value) return false
    return EMAIL_RE.test(value.trim())
}

// Domains that are guaranteed-non-deliverable. The `.dev` TLD is technically
// valid but our seed data uses `*.acme-institute.dev` for fixture users —
// emailing them in dev produces actual Gmail bounce-backs (see the
// "Address not found" screenshot). We skip those to keep the inbox clean
// without forcing developers to scrub their seed before testing.
const NON_DELIVERABLE_TLDS = ['.test', '.invalid', '.localhost', '.example']
const FAKE_FIXTURE_DOMAINS = ['acme-institute.dev', 'albero-academy.dev', 'albero.dev']

const isFakeRecipient = (email: string): boolean => {
    const lower = email.toLowerCase().trim()
    if (NON_DELIVERABLE_TLDS.some((tld) => lower.endsWith(tld))) return true
    if (FAKE_FIXTURE_DOMAINS.some((d) => lower.endsWith(`@${d}`))) return true
    return false
}

interface TSendInput {
    tenantId?: string
    userId?: string
    to: string
    toName?: string
    subject: string
    html: string
    text: string
    template?: string
}

// One row per attempt, regardless of outcome. Failures are caught and
// logged; never thrown. The caller can read back the EmailLog id from
// the resolved promise if needed (e.g. for retry queues), but most call
// sites just want to know SENT / SKIPPED / FAILED.
const writeLog = async (params: {
    tenantId?: string
    userId?: string
    toEmail: string
    fromEmail: string
    replyTo?: string
    subject: string
    template?: string
    status: EmailDeliveryStatus
    errorReason?: string
    messageId?: string
}): Promise<void> => {
    try {
        await db.client.emailLog.create({
            data: {
                tenantId: params.tenantId ?? null,
                userId: params.userId ?? null,
                toEmail: params.toEmail,
                fromEmail: params.fromEmail,
                replyTo: params.replyTo ?? null,
                subject: params.subject,
                template: params.template ?? null,
                status: params.status,
                errorReason: params.errorReason ?? null,
                messageId: params.messageId ?? null
            }
        })
    } catch (err) {
        // EmailLog write failure is informational — never block the caller.
        logger.warn('EMAIL_LOG_WRITE_FAILED', { meta: { err: (err as Error).message } })
    }
}

// Returns true on SENT, false on SKIPPED, throws on FAILED so BullMQ retries.
//
// SKIP (returns false, no throw):
//   - SMTP not configured (dev with empty NODEMAILER_*)
//   - Recipient address fails RFC 5322 validation
//   - Recipient is on the fake-fixture domain list (seed users)
//   - Tenant has no contact email AND no MAIL_FROM_EMAIL fallback (dev only)
export const sendEmail = async ({ tenantId, userId, to, toName, subject, html, text, template }: TSendInput): Promise<boolean> => {
    const tenantCtx = tenantId ? await resolveTenantContext(tenantId) : null

    // Resolve the From / Reply-To addresses. Priority:
    //   1. Tenant Contact Email (Settings → Profile → Contact Email)
    //   2. MAIL_FROM_EMAIL env var (dev fallback)
    //   3. NODEMAILER_MAIL (the SMTP login itself, last resort)
    const fromEmail = tenantCtx?.contactEmail || config.MAIL_FROM_EMAIL || config.NODEMAILER_MAIL || ''
    const fromName = tenantCtx?.name || config.MAIL_FROM_NAME || 'LearnHub'
    const fromHeader = fromEmail ? `"${fromName}" <${fromEmail}>` : ''
    const replyTo = tenantCtx?.contactEmail ?? config.MAIL_FROM_EMAIL ?? null

    const trimmedTo = to.trim()

    // Recipient validation — bad data should never produce a Gmail bounce.
    if (!isValidEmail(trimmedTo)) {
        await writeLog({
            tenantId,
            userId,
            toEmail: trimmedTo,
            fromEmail: fromEmail || 'unknown',
            replyTo: replyTo ?? undefined,
            subject,
            template,
            status: EmailDeliveryStatus.SKIPPED,
            errorReason: 'invalid_recipient_format'
        })
        logger.warn('MAILER_INVALID_RECIPIENT', { meta: { to: trimmedTo, subject } })
        return false
    }

    if (isFakeRecipient(trimmedTo)) {
        await writeLog({
            tenantId,
            userId,
            toEmail: trimmedTo,
            fromEmail: fromEmail || 'unknown',
            replyTo: replyTo ?? undefined,
            subject,
            template,
            status: EmailDeliveryStatus.SKIPPED,
            errorReason: 'recipient_on_fake_domain'
        })
        logger.info('MAILER_SKIPPED_FAKE_DOMAIN', { meta: { to: trimmedTo, subject } })
        return false
    }

    if (!fromEmail) {
        await writeLog({
            tenantId,
            userId,
            toEmail: trimmedTo,
            fromEmail: 'unconfigured',
            replyTo: replyTo ?? undefined,
            subject,
            template,
            status: EmailDeliveryStatus.SKIPPED,
            errorReason: 'no_from_address_configured'
        })
        logger.warn('MAILER_NO_FROM_CONFIGURED', { meta: { tenantId, subject } })
        return false
    }

    const transportEntry = getTransport(tenantCtx?.smtp ?? null)
    if (!transportEntry) {
        await writeLog({
            tenantId,
            userId,
            toEmail: trimmedTo,
            fromEmail,
            replyTo: replyTo ?? undefined,
            subject,
            template,
            status: EmailDeliveryStatus.SKIPPED,
            errorReason: 'no_smtp_configured'
        })
        logger.info('MAILER_SKIPPED_NO_SMTP', { meta: { to: trimmedTo, subject } })
        return false
    }

    const recipient = toName ? `"${toName}" <${trimmedTo}>` : trimmedTo
    try {
        const info = await transportEntry.transport.sendMail({
            from: fromHeader || transportEntry.from,
            to: recipient,
            replyTo: replyTo ?? undefined,
            subject,
            html,
            text
        })
        await writeLog({
            tenantId,
            userId,
            toEmail: trimmedTo,
            fromEmail,
            replyTo: replyTo ?? undefined,
            subject,
            template,
            status: EmailDeliveryStatus.SENT,
            messageId: info.messageId
        })
        logger.debug('MAILER_SENT', { meta: { to: trimmedTo, subject, messageId: info.messageId, tenantId } })
        return true
    } catch (err) {
        const message = (err as Error).message
        await writeLog({
            tenantId,
            userId,
            toEmail: trimmedTo,
            fromEmail,
            replyTo: replyTo ?? undefined,
            subject,
            template,
            status: EmailDeliveryStatus.FAILED,
            errorReason: message
        })
        throw err
    }
}
