import nodemailer, { type Transporter } from 'nodemailer'
import config from '../../config/config'
import logger from '../../util/logger'

// Single-tenant SMTP for Phase 1. Per-tenant SMTP credentials punched in via the
// Superadmin panel will arrive in §4.1 — at that point this module accepts an
// optional `tenantId` and resolves credentials from a per-tenant settings table
// (falling back to the platform default below).

let transporter: Transporter | null = null

const buildTransport = (): Transporter | null => {
    if (!config.NODEMAILER_MAIL || !config.NODEMAILER_PASS) return null

    // If an explicit SMTP host is provided, use generic SMTP options. Otherwise
    // fall back to Gmail's well-known config (works with App Passwords).
    if (config.NODEMAILER_HOST) {
        return nodemailer.createTransport({
            host: config.NODEMAILER_HOST,
            port: config.NODEMAILER_PORT,
            secure: config.NODEMAILER_SECURE,
            auth: { user: config.NODEMAILER_MAIL, pass: config.NODEMAILER_PASS }
        })
    }
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: config.NODEMAILER_MAIL, pass: config.NODEMAILER_PASS }
    })
}

const ensureInit = (): boolean => {
    if (transporter) return true
    transporter = buildTransport()
    return transporter !== null
}

interface TSendInput {
    to: string
    toName?: string
    subject: string
    html: string
    text: string
}

// Returns true if the send succeeded, false if the mailer is not configured (dev mode).
// Throws on actual SMTP failures so BullMQ can retry.
export const sendEmail = async ({ to, toName, subject, html, text }: TSendInput): Promise<boolean> => {
    if (!ensureInit() || !transporter) {
        logger.info('MAILER_SKIPPED', { meta: { reason: 'not_configured', to, subject } })
        return false
    }

    const fromName = config.MAIL_FROM_NAME
    const fromEmail = config.MAIL_FROM_EMAIL || config.NODEMAILER_MAIL
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail
    const recipient = toName ? `"${toName}" <${to}>` : to

    const info = await transporter.sendMail({ from, to: recipient, subject, html, text })
    logger.debug('MAILER_SENT', { meta: { to, subject, messageId: info.messageId } })
    return true
}
