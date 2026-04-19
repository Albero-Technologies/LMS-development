import sgMail from '@sendgrid/mail'
import config from '../../config/config'
import logger from '../../util/logger'

let initialized = false

const ensureInit = (): boolean => {
    if (!config.SENDGRID_API_KEY) return false
    if (!initialized) {
        sgMail.setApiKey(config.SENDGRID_API_KEY)
        initialized = true
    }
    return true
}

type TSendInput = {
    to: string
    toName?: string
    subject: string
    html: string
    text: string
}

// Returns true if the send succeeded, false if SendGrid is not configured (dev mode).
export const sendEmail = async ({ to, toName, subject, html, text }: TSendInput): Promise<boolean> => {
    if (!ensureInit()) {
        logger.info('SENDGRID_SKIPPED', { meta: { reason: 'not_configured', to, subject } })
        return false
    }

    await sgMail.send({
        to: toName ? { email: to, name: toName } : to,
        from: { email: config.SENDGRID_FROM_EMAIL, name: config.SENDGRID_FROM_NAME },
        subject,
        html,
        text
    })
    return true
}
