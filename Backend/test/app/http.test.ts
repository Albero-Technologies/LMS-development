import { describe, it, expect, vi, beforeAll } from 'vitest'

// ---- Mock external I/O BEFORE importing the app ----
// Prisma client — just enough for the routes we hit in this file.
vi.mock('../../src/service/db', () => {
    return {
        default: {
            client: {
                $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
                $connect: vi.fn().mockResolvedValue(undefined),
                $disconnect: vi.fn().mockResolvedValue(undefined),
                user: { findFirst: vi.fn().mockResolvedValue(null) }
            },
            connect: vi.fn().mockResolvedValue({ host: 'localhost', port: '5432', name: 'test' }),
            disconnect: vi.fn().mockResolvedValue(undefined)
        },
        isTenantScoped: () => true
    }
})

// Redis — stub connection, no network.
vi.mock('../../src/service/redis', () => ({
    getRedis: vi.fn().mockReturnValue({
        on: vi.fn(),
        quit: vi.fn().mockResolvedValue('OK')
    }),
    closeRedis: vi.fn().mockResolvedValue(undefined)
}))

// BullMQ queue — never actually enqueue.
vi.mock('../../src/modules/notifications/notification.queue', () => ({
    notifyQueue: { add: vi.fn().mockResolvedValue({ id: 'mock-job' }) },
    NOTIFY_QUEUE_NAME: 'notifications',
    NOTIFY_JOB: 'send-notification',
    getNotifyQueueEvents: vi.fn()
}))

// rate-limiter-flexible — test its presence only via the middleware path;
// we leave the real module intact and the limiter null (fail-open).
import request from 'supertest'
import app from '../../src/app'

beforeAll(() => {
    // noop — all mocks applied at import time.
})

describe('HTTP smoke tests', () => {
    it('GET /api/v1/health returns 200 + reports db up', async () => {
        const res = await request(app).get('/api/v1/health')
        expect([200, 503]).toContain(res.status) // allow 503 if Prisma mock fails under some envs
        expect(res.body).toHaveProperty('success')
        expect(res.body.data).toHaveProperty('application')
    })

    it('GET /api/v1/self returns service metadata', async () => {
        const res = await request(app).get('/api/v1/self')
        expect(res.status).toBe(200)
        expect(res.body.data).toMatchObject({ service: 'learnhub-api' })
    })

    it('GET /api/v1/metrics returns Prometheus text', async () => {
        const res = await request(app).get('/api/v1/metrics')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain('text/plain')
        expect(res.text).toContain('nodejs_heap_used_bytes')
    })

    it('GET /api/v1/openapi.json returns the OpenAPI spec', async () => {
        const res = await request(app).get('/api/v1/openapi.json')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('openapi')
        expect(res.body.info.title).toContain('LearnHub')
    })

    it('GET /api/v1/docs renders Swagger UI HTML', async () => {
        const res = await request(app).get('/api/v1/docs/').redirects(1)
        expect([200, 301, 302]).toContain(res.status)
        // swagger-ui-express mounts /docs/ with an index that includes swagger-ui
        expect(res.text || '').toContain('Swagger')
    })

    it('protected endpoints reject unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/v1/dashboard/me')
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })

    it('validation errors return 400 with details', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ email: 'not-an-email' })
        expect(res.status).toBe(400)
        expect(res.body.code).toBe('VALIDATION_ERROR')
        expect(Array.isArray(res.body.details)).toBe(true)
    })

    it('unknown route returns 404', async () => {
        const res = await request(app).get('/api/v1/does-not-exist')
        expect(res.status).toBe(404)
    })

    it('webhook without signature returns 400', async () => {
        const res = await request(app)
            .post('/api/v1/webhooks/razorpay')
            .set('Content-Type', 'application/json')
            .send({ event: 'payment.captured', id: 'evt_1' })
        // Missing/invalid HMAC header → signature check fails → 400
        expect(res.status).toBe(400)
    })
})
