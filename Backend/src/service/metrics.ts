import client, { type Counter, type Gauge, type Histogram, type Registry } from 'prom-client'
import config from '../config/config'

// ---------------------------------------------------------------------------
// Prometheus registry + canonical RED metrics for the API.
// Registered at /api/v1/metrics; scraped by Prometheus every 15s.
// ---------------------------------------------------------------------------

export const registry: Registry = new client.Registry()

registry.setDefaultLabels({
    service: 'learnhub-api',
    env: config.ENV
})

// Default Node.js process metrics (heap, CPU, GC, event-loop lag, open FDs).
client.collectDefaultMetrics({ register: registry })

// ---- HTTP (RED) -----------------------------------------------------------
// Route label uses Express route pattern (e.g. "/users/:id") — never the raw
// URL — so cardinality stays bounded. Tenant id is high-cardinality; we keep
// it in logs (Loki) instead of metrics.
export const httpRequestsTotal: Counter<string> = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests handled.',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [registry]
})

export const httpRequestDuration: Histogram<string> = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency in seconds.',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [registry]
})

export const httpRequestsInFlight: Gauge<string> = new client.Gauge({
    name: 'http_requests_in_flight',
    help: 'Number of HTTP requests currently being processed.',
    labelNames: ['method'] as const,
    registers: [registry]
})

// ---- Domain counters (useful for Phase 1 dashboards) ----------------------
export const authLoginsTotal: Counter<string> = new client.Counter({
    name: 'auth_logins_total',
    help: 'Total successful + failed login attempts.',
    labelNames: ['outcome'] as const, // success | invalid_credentials | rate_limited
    registers: [registry]
})

export const paymentEventsTotal: Counter<string> = new client.Counter({
    name: 'payment_events_total',
    help: 'Payment gateway events received and processed.',
    labelNames: ['gateway', 'status'] as const, // razorpay | stripe × verified | failed | duplicate
    registers: [registry]
})

export const notificationJobsTotal: Counter<string> = new client.Counter({
    name: 'notification_jobs_total',
    help: 'BullMQ notification jobs by outcome.',
    labelNames: ['template', 'outcome'] as const, // welcome|invite|... × sent|failed
    registers: [registry]
})
