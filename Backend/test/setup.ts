// Test-wide env setup — runs before any test file imports production code.
// Keeps tests fully offline: no Postgres / Redis / SMTP / Razorpay calls.

process.env.ENV = 'development'
process.env.NODE_ENV = 'test'
process.env.PORT = process.env.PORT ?? '0'
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test'
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'
process.env.JWT_ACCESS_SECRET = 'test-access-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
process.env.JWT_ACCESS_TTL_SECONDS = '900'
process.env.JWT_REFRESH_TTL_SECONDS = '2592000'
process.env.BCRYPT_ROUNDS = '4' // fast hashes in tests
process.env.CORS_ORIGIN = 'http://localhost:5173'
process.env.ALLOWED_TENANT_ORIGINS = 'http://localhost:5173'
process.env.NODEMAILER_MAIL = ''
process.env.NODEMAILER_PASS = ''
process.env.RAZORPAY_KEY_ID = ''
process.env.RAZORPAY_KEY_SECRET = ''
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret'
