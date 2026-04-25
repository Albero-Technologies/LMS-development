import express, { type Application, type NextFunction, type Request, type Response } from 'express'
import path from 'path'
import router from './router/apiRouter'
import globalErrorHandler from './middleware/globalErrorHandler'
import responseMessage from './constant/responseMessage'
import httpError from './util/httpError'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http'
import pino from 'pino'
import requestId from './middleware/requestId'
import rateLimit from './middleware/rateLimit'
import metrics from './middleware/metrics'
import autoAudit from './middleware/autoAudit'
import webhookRouter from './modules/enrollments/webhook.router'
import config from './config/config'

const app: Application = express()
app.set('trust proxy', true)

// Structured request logging (PRD NFR) — pino-http.
const httpLogger = pinoHttp({
    logger: pino({ level: config.ENV === 'production' ? 'info' : 'debug' }),
    customProps: (req) => ({ requestId: (req as Request).requestId, tenantId: (req as Request).auth?.tenantId }),
    customLogLevel: (_req, res, err) => {
        if (err) return 'error'
        if (res.statusCode >= 500) return 'error'
        if (res.statusCode >= 400) return 'warn'
        return 'info'
    },
    redact: ['req.headers.authorization', 'req.headers.cookie']
})

// ---- Security headers + CORS ----
// Helmet's default CSP blocks Swagger UI's inline script. Disable CSP only
// on the docs path; keep strict defaults elsewhere.
app.use('/api/v1/docs', helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

const corsOrigins = [config.CORS_ORIGIN, ...config.ALLOWED_TENANT_ORIGINS].filter(Boolean)

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true)
            if (corsOrigins.includes(origin) || corsOrigins.includes('*')) return cb(null, true)
            return cb(new Error('CORS origin not allowed'))
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
        credentials: true,
        maxAge: 600
    })
)

// ---- Webhook routes first — need raw body for signature verification. ----
app.use(
    '/api/v1/webhooks',
    express.json({
        verify: (req, _res, buf) => {
            ;(req as unknown as { rawBody: string }).rawBody = buf.toString('utf8')
        },
        limit: '1mb'
    }),
    webhookRouter
)

// ---- Standard parsers for the rest of the API. ----
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())
app.use(requestId)
app.use(httpLogger)
app.use(metrics)
app.use(autoAudit)
app.use(express.static(path.join(__dirname, '../', 'public')))

// ---- Global IP-based rate limit ----
app.use('/api/', rateLimit)

// ---- Versioned API ----
app.use('/api/v1', router)

// ---- 404 ----
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('route'))
    } catch (err) {
        httpError(next, err, req, 404)
    }
})

// ---- Global error handler ----
app.use(globalErrorHandler)

export default app
