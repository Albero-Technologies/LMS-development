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

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || '',
    GOOGLE_POST_LOGIN_REDIRECT: process.env.GOOGLE_POST_LOGIN_REDIRECT || '',

    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'no-reply@learnhub.in',
    SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME || 'LearnHub',

    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

    BCRYPT_ROUNDS: num('BCRYPT_ROUNDS', 12),

    ALLOWED_TENANT_ORIGINS: csv('ALLOWED_TENANT_ORIGINS')
}
