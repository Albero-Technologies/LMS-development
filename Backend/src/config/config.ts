import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

const num = (key: string, fallback: number): number => {
    const v = process.env[key]
    if (!v) return fallback
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
}

const bool = (key: string, fallback = false): boolean => {
    const v = process.env[key]
    if (v === undefined) return fallback
    return v === 'true' || v === '1'
}

const csv = (key: string): string[] => {
    const v = process.env[key]
    if (!v) return []
    return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
}

export default {
    ENV: process.env.ENV || 'development',
    PORT: num('PORT', 3000),
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

    DATABASE_URL: process.env.DATABASE_URL || '',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change',
    JWT_ACCESS_TTL_SECONDS: num('JWT_ACCESS_TTL_SECONDS', 15 * 60),
    JWT_REFRESH_TTL_SECONDS: num('JWT_REFRESH_TTL_SECONDS', 30 * 24 * 60 * 60),

    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
    COOKIE_SECURE: bool('COOKIE_SECURE', false),

    // Nodemailer (default transport: Gmail App Password). For generic SMTP set
    // NODEMAILER_HOST + NODEMAILER_PORT + NODEMAILER_SECURE; otherwise the Gmail
    // service shorthand is used. Leave NODEMAILER_MAIL/PASS blank in dev to log
    // emails without sending.
    NODEMAILER_MAIL: process.env.NODEMAILER_MAIL || '',
    NODEMAILER_PASS: process.env.NODEMAILER_PASS || '',
    NODEMAILER_HOST: process.env.NODEMAILER_HOST || '',
    NODEMAILER_PORT: num('NODEMAILER_PORT', 587),
    NODEMAILER_SECURE: bool('NODEMAILER_SECURE', false),
    MAIL_FROM_EMAIL: process.env.MAIL_FROM_EMAIL || '',
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'Albero Academy',

    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

    // Google Sheets (Phase 2 §9.2). Service-account credentials are platform-wide;
    // each tenant chooses which sheet to push to via tenant.settings.googleSheetId.
    // Leave both blank to disable the Sheets push (fire-and-forget no-op).
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '',
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY || '',

    BCRYPT_ROUNDS: num('BCRYPT_ROUNDS', 12),

    ALLOWED_TENANT_ORIGINS: csv('ALLOWED_TENANT_ORIGINS'),

    // IPs that bypass the auth/global rate limiters. Loopback addresses are
    // always whitelisted in dev so an SA repeatedly testing logins on
    // localhost never hits the 5-per-15-min wall. Add prod-side admin IPs via
    // RATE_LIMIT_WHITELIST="1.2.3.4,5.6.7.8" in env.
    RATE_LIMIT_WHITELIST: csv('RATE_LIMIT_WHITELIST')
}
