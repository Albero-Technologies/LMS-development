# Observability — Prometheus · Grafana · Loki

> **New here?** Read [MONITORING_OVERVIEW.md](./MONITORING_OVERVIEW.md) first —
> it explains *what* monitoring does and *why*, with scenarios. This doc is
> the reference: queries, configuration, adding metrics, troubleshooting.

LearnHub ships with a self-contained **dev observability stack** behind a
docker-compose profile. It's off by default (dev iteration stays fast); flip
it on when you want dashboards, log search, or to debug production-like
behavior locally.

```
┌───────────┐    /api/v1/metrics     ┌────────────┐
│  Node API │ ◀────── scrape ─────── │ Prometheus │
└─────┬─────┘                         └─────┬──────┘
      │ stdout + logs/*.log                  │
      ▼                                      ▼
┌──────────┐  docker socket  ┌──────┐    ┌─────────┐
│ Promtail │────── tail ────▶│ Loki │◀──▶│ Grafana │
└──────────┘                  └──────┘    └─────────┘
                                              ▲
                                              │ you, debugging
```

---

## 1 · What you get

| URL | What | Login |
| --- | ---- | ----- |
| `http://localhost:3001`  | Grafana — dashboards + Explore (logs & metrics) | `admin` / `admin` |
| `http://localhost:9090`  | Prometheus — raw query UI | — |
| `http://localhost:3100`  | Loki — API only (use Grafana to query) | — |

Pre-provisioned in Grafana on first boot:

- **Datasources**: Prometheus, Loki.
- **Dashboard**: *LearnHub · API Overview* — request rate, error %, p50/p95/p99
  latency, in-flight, top routes, Node heap, login attempts, notification jobs,
  and a live Loki log panel.

---

## 2 · Start the stack

```bash
cd Backend

# one-time: pull images + bring everything up
docker compose -f docker/development/docker-compose.yml \
  --profile observability up -d --build

# tail logs of just the new services
docker compose -f docker/development/docker-compose.yml \
  logs -f prometheus loki promtail grafana
```

First boot takes ~1 min to pull images. After that, `up -d` returns in seconds.

### Stopping

```bash
# stop observability but keep core stack
docker compose -f docker/development/docker-compose.yml stop prometheus loki promtail grafana

# stop everything (keeps data in volumes)
docker compose -f docker/development/docker-compose.yml --profile observability down

# nuke everything INCLUDING the dashboards / TSDB / logs
docker compose -f docker/development/docker-compose.yml --profile observability down -v
```

---

## 3 · Verifying it works

### Prometheus is scraping the API

```bash
# Should return 200 and show the target as "up"
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job:.labels.job, health}'
```

Expected:
```json
{ "job": "prometheus",    "health": "up" }
{ "job": "learnhub-api",  "health": "up" }
```

### The API is exposing real Prometheus metrics

```bash
curl -s http://localhost:3000/api/v1/metrics | head -30
```

You should see:

```
# HELP http_requests_total Total number of HTTP requests handled.
# TYPE http_requests_total counter
http_requests_total{service="learnhub-api",env="development",method="GET",route="/api/v1/health",status_code="200"} 12
# HELP http_request_duration_seconds HTTP request latency in seconds.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{...,le="0.01"} ...
...
# HELP nodejs_heap_size_used_bytes Node.js heap size used.
...
```

### Grafana has auto-provisioned the datasources

Open `http://localhost:3001` → **Connections → Data sources**. You should see
`Prometheus` (default) and `Loki`, both green.

### The dashboard is loaded

`Dashboards → LearnHub → LearnHub · API Overview`. Fire a few requests to
warm it up:

```bash
for i in {1..50}; do
  curl -s http://localhost:3000/api/v1/health >/dev/null
  curl -s http://localhost:3000/api/v1/self   >/dev/null
done
```

Within ~15s the request-rate panel should light up.

### Logs are flowing to Loki

Grafana → **Explore** → pick `Loki` → query:

```logql
{service="api"}
```

You'll see structured JSON from the API container. Filter by level:

```logql
{service="api"} | json | level = "error"
```

---

## 4 · What metrics are exposed

The API registry exposes three layers (all at `/api/v1/metrics`):

### Layer 1 — Node.js defaults (from `prom-client`)

- `nodejs_heap_size_used_bytes`, `nodejs_heap_size_total_bytes`
- `nodejs_eventloop_lag_seconds`
- `nodejs_active_handles`, `nodejs_active_requests`
- `process_cpu_seconds_total`
- `process_open_fds`, `process_max_fds`

### Layer 2 — HTTP (RED method)

Emitted by `src/middleware/metrics.ts` on every response.

- `http_requests_total{method, route, status_code}` — counter
- `http_request_duration_seconds{method, route, status_code}` — histogram with
  buckets `[10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s]`
- `http_requests_in_flight{method}` — gauge

The `route` label uses the **Express route pattern**, not the raw URL, so
`/courses/:id` stays a single label value regardless of the UUID. Unknown
paths are emitted as their sanitized template (`/:id` / `/:uuid`) to keep
cardinality bounded.

### Layer 3 — Domain (grows as Phase 1 features land)

- `auth_logins_total{outcome}` — `success | invalid_credentials | rate_limited`
- `payment_events_total{gateway, status}` — `razorpay|stripe × verified|failed|duplicate`
- `notification_jobs_total{template, outcome}` — `welcome|invite|... × sent|failed`

Add new ones in [src/service/metrics.ts](./src/service/metrics.ts) and
`import` them wherever you increment.

---

## 5 · Useful queries

### Prometheus (Grafana → Explore → Prometheus)

```promql
# Request rate over the last 5 minutes
sum(rate(http_requests_total{service="learnhub-api"}[5m]))

# Error rate (% of 5xx)
100 * sum(rate(http_requests_total{status_code=~"5.."}[5m]))
    / clamp_min(sum(rate(http_requests_total[5m])), 1)

# p95 latency
histogram_quantile(0.95,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# Top 10 slowest routes (p95)
topk(10, histogram_quantile(0.95,
  sum by (le, route) (rate(http_request_duration_seconds_bucket[5m]))))

# Login failure rate
sum(rate(auth_logins_total{outcome!="success"}[5m]))
  / clamp_min(sum(rate(auth_logins_total[5m])), 1)
```

### Loki (Grafana → Explore → Loki)

```logql
# All API logs
{service="api"}

# Just errors
{service="api"} | json | level = "error"

# Logs for a specific tenant
{service="api"} | json | meta_tenantId = "<tenant-uuid>"

# Request trace by requestId
{service="api"} | json | meta_requestId = "<request-id-from-response-header>"

# Slow requests (needs logger enrichment — see §7)
{service="api"} | json | responseTime_ms > 500

# Rate of ERROR lines per minute
rate({service="api"} | json | level = "error" [1m])
```

---

## 6 · Correlating logs ↔ metrics

Every HTTP response carries an `x-request-id` header (set by the
[requestId middleware](./src/middleware/requestId.ts)). The same id appears
as `meta.requestId` in every log line emitted during that request.

Typical debug flow:

1. User reports a slow / failing request.
2. Find it in the API overview dashboard — a spike in p95 or a red 5xx bar.
3. Click **View in Loki** on the log panel (or switch to Explore → Loki).
4. Query `{service="api"} | json | status >= 500`.
5. Grab the `requestId` from the problem line.
6. Pivot: `{service="api"} | json | meta_requestId = "<id>"` — you now have
   every log emitted while that request was in-flight.

---

## 7 · Adding a new metric

Two steps.

**Declare it in [src/service/metrics.ts](./src/service/metrics.ts):**

```ts
export const quizAttemptsTotal = new client.Counter({
  name: 'quiz_attempts_total',
  help: 'Quiz attempts by outcome.',
  labelNames: ['outcome'] as const, // started | submitted | expired
  registers: [registry]
})
```

**Increment it at the point of action:**

```ts
import { quizAttemptsTotal } from '../../service/metrics'

// in quiz.service.ts after submit:
quizAttemptsTotal.inc({ outcome: attempt.passed ? 'submitted' : 'failed' })
```

Prometheus picks it up on the next scrape (within 15s). Add a panel in
Grafana via **Dashboards → New → Add visualization**.

**Cardinality rule of thumb:** labels should have <~100 distinct values. Never
label with `userId`, `tenantId`, request URL, email, or anything user-supplied.
High-cardinality context belongs in **Loki**, not Prometheus.

---

## 8 · Production story (outside Docker)

On Render / ECS / k8s, swap the local stack for a managed variant:

| Concern | Local (this doc) | Production |
| ------- | ---------------- | ---------- |
| Metrics | Prometheus container | Grafana Cloud Prometheus / AMP / Managed VM |
| Logs    | Loki single-binary | Grafana Cloud Loki / CloudWatch Logs / OpenSearch |
| Shipper | Promtail via docker.sock | Promtail/Alloy DaemonSet / CloudWatch agent |
| Dashboards | Auto-provisioned Grafana | Grafana Cloud with the same JSON |
| Auth    | `admin/admin` | SSO (OIDC) |
| Retention | 7 days (Loki) / 15 days (Prom) | 30–90 days per SLO budget |

The application code (the `/metrics` endpoint + winston logs) is identical —
only the infrastructure around it changes. Keep the JSON dashboards in
`observability/grafana/provisioning/dashboards/json/` under version control
so prod and dev stay in sync.

---

## 9 · Troubleshooting

### `learnhub-api` target is `down` in Prometheus

1. Check the API is reachable from inside the docker network:
   ```bash
   docker compose -f docker/development/docker-compose.yml \
     exec prometheus wget -qO- http://api:3000/api/v1/health
   ```
2. If it hangs, the API container is unhealthy. Check its logs:
   ```bash
   docker compose -f docker/development/docker-compose.yml logs api --tail 50
   ```

### No logs appear in Loki

- The docker socket mount must be writable to the Docker group. On Windows
  + Docker Desktop, this is automatic; on Linux make sure your user is in
  the `docker` group.
- Check Promtail is running and targets the right containers:
  ```bash
  docker compose -f docker/development/docker-compose.yml logs promtail
  # Look for "entry" lines being pushed.
  ```
- Fallback: the file-based scraper reads from `/var/log/learnhub/*.log`
  which is mounted from the `api_logs` volume. Try:
  ```logql
  {job="winston"}
  ```

### Grafana dashboard shows "No data"

- Fire a few requests to warm up the counters (see §3).
- Check the Prometheus datasource is green:
  Grafana → Connections → Data sources → Prometheus → Save & test.
- Open the dashboard in edit mode, click a panel → **Query inspector** → run
  to see the raw PromQL result.

### `http_requests_total` labels explode

You probably pushed a raw `:id` value into a metric somewhere. Run:

```bash
curl -s http://localhost:3000/api/v1/metrics | grep -c http_requests_total
```

If this number grows on every new request, audit the `labelRoute()` function
in [src/middleware/metrics.ts](./src/middleware/metrics.ts) and any manual
`.inc({...})` call — you're using a high-cardinality value as a label.

### Grafana loses its datasources on restart

That only happens if you edited them via the UI (which writes to the sqlite
DB, not the provisioning files). Our provisioning marks datasources as
`editable: false` to prevent this. If you need to change one, edit
[observability/grafana/provisioning/datasources/datasources.yml](./observability/grafana/provisioning/datasources/datasources.yml)
and restart Grafana.
