# Monitoring Overview

A non-code walkthrough of how monitoring works in this project and how you'd
actually use it day-to-day. You don't need to read any other docs to follow
this — just a rough idea of what "server", "logs", and "metrics" mean.

> **Related docs**
> - [OBSERVABILITY.md](./OBSERVABILITY.md) — the detailed how-to (queries,
>   cheat sheets, adding metrics, debugging the stack itself)
> - [DOCS.md](./DOCS.md) — the full beginner walkthrough of the backend
> - [SETUP.md](./SETUP.md) — cookbook-style first-boot commands

---

## 1 · Why monitoring exists

When the app is running, you want to answer three questions without touching
the code:

1. **Is it healthy right now?** (the RED method — Rate, Errors, Duration)
2. **If something broke, what and when?**
3. **If users complain about one request, what happened on the server during
   that request?**

Three tools, each good at one thing:

| Tool | Answers | Analogy |
| ---- | ------- | ------- |
| **Prometheus** | "How many requests per second? How fast? How many failed?" | The speedometer + tachometer + fuel gauge |
| **Loki** | "What did the server say in the last 10 minutes?" | The flight recorder |
| **Grafana** | "Show me all of the above on one screen" | The dashboard in front of the driver |

---

## 2 · The four moving parts

```
     ┌──────────────┐
     │   Your API   │  ◀── users
     │  (Express)   │
     └──────┬───────┘
            │
            │ writes numbers every time a request happens
            │ writes log lines for everything that matters
            ▼
   ┌─────────────────┐              ┌──────────────┐
   │  /api/v1/metrics│ ◀── scrapes ─│  Prometheus  │   (stores numbers)
   │  (HTTP endpoint)│  every 15s   └──────────────┘
   └─────────────────┘
            │                             │
            │ winston writes JSON         │ Grafana pulls
            │ to stdout + logs/*.log      │ numbers from here
            ▼                             ▼
       ┌──────────┐  tails logs   ┌──────────┐
       │ Promtail │──────────────▶│   Loki   │
       └──────────┘               │ (stores  │
                                  │  logs)   │
                                  └────┬─────┘
                                       │ Grafana pulls
                                       │ logs from here
                                       ▼
                                ┌───────────────┐
                                │    Grafana    │  ◀── you, in a browser
                                └───────────────┘
```

Plain English:

- **Your API** is the thing being watched. It already exposes numbers at
  `/api/v1/metrics` and writes structured log lines to stdout + a log file.
- **Prometheus** is a time-series database that pulls numbers from your API
  every 15 seconds and stores them.
- **Promtail** is a little log-shipper that tails every Docker container's
  log stream and forwards the lines.
- **Loki** is a log database, optimized for "give me all lines where
  level=error in the last hour".
- **Grafana** is a web UI that queries both Prometheus and Loki and draws
  graphs + shows logs. It's the only thing you actually open in a browser.

You don't interact with Prometheus / Loki / Promtail directly unless
something's broken. You use Grafana.

---

## 3 · What gets measured

### Numbers (Prometheus)

Three tiers, all exposed at `/api/v1/metrics`:

**Tier 1 — the Node process itself** (free, from `prom-client`)

- How much memory is the heap using?
- How much CPU time has the process consumed?
- Is the event loop lagging? (sign of a blocked process)
- How many open file descriptors / sockets?

**Tier 2 — HTTP traffic (the RED method)**

- **R**ate — requests per second, broken down by route + status code
- **E**rrors — count of 4xx / 5xx responses
- **D**uration — latency histogram, so we can compute p50 / p95 / p99

**Tier 3 — business counters (grows over time)**

- Logins: success vs failed vs rate-limited
- Payment events: verified / failed / duplicate
- Notification jobs: sent vs failed

### Words (Loki)

Every log line the API writes — structured as JSON — flows into Loki with
labels like `service=api`, `level=error`, `requestId=abc-123`,
`tenantId=xxx`.

The nice thing: Loki is cheap because it **only indexes labels, not the log
body**. So you can search "all errors from tenant X in the last hour" in
milliseconds, but a raw text search across all logs is slower (and that's
fine — you rarely need it).

---

## 4 · Starting the stack

The observability stack is **opt-in** — off by default so dev feedback stays
fast. Turn it on when you want dashboards:

```bash
cd Backend
docker compose -f docker/development/docker-compose.yml --profile observability up -d
```

Wait ~60 seconds on first run (pulls Docker images). Then open:

| URL | What you'll do there |
| --- | -------------------- |
| `http://localhost:3001` | **Grafana** — this is where you spend 99% of your time. Login `admin` / `admin`. |
| `http://localhost:9090` | Prometheus — only open this if Grafana is broken and you want to sanity-check raw metrics. |
| `http://localhost:3100` | Loki — you don't visit this manually; Grafana talks to it. |

---

## 5 · What you'll actually do with it

### Scenario A — "is everything OK?"

1. Open **Grafana** (`:3001`).
2. Sidebar → **Dashboards** → **LearnHub** → **LearnHub · API Overview**.
3. Top row tells you at-a-glance:
   - **Request rate** — should be non-zero if traffic is hitting the API.
   - **Error rate %** — green <1%, yellow 1–5%, red >5%.
   - **p95 latency** — green <500ms, yellow 500ms–1s, red >1s.
   - **In-flight** — should be small; if this climbs and stays high,
     something is blocking.
4. Middle rows show the same numbers as graphs over time — spot a spike,
   zoom in.

You don't need to remember any query syntax. The dashboard is pre-built.

### Scenario B — "a user reported a broken request at 3:14 PM"

1. Grafana → top-right time picker → set to `3:10 PM - 3:20 PM`.
2. Look at the **Request rate by status class** panel — a red band = 5xx
   errors.
3. Scroll down to the **Recent API logs** panel (it's live, reading from
   Loki).
4. Click the panel title → **View** → filter by `level = "error"`.
5. Find a line with the failure — grab the `requestId` (it looks like a
   UUID).
6. Go to sidebar → **Explore** → pick **Loki** datasource.
7. Query: `{service="api"} | json | meta_requestId = "<paste id>"`
8. Grafana now shows every single log line that was emitted while that
   request was being processed — middleware entry, service calls, DB
   queries, the exact error stack trace, the response being sent.

The `requestId` is what makes this possible. Every HTTP response carries an
`x-request-id` header, and every log line emitted during that request
carries the same id.

### Scenario C — "payments look slow"

1. Grafana → **Explore** → Prometheus datasource.
2. Query:
   ```
   histogram_quantile(0.95,
     sum by (le, route) (
       rate(http_request_duration_seconds_bucket{route=~".*payment.*"}[5m])
     ))
   ```
3. That's p95 latency per payment route, updating live. If one route is an
   outlier, you've localized the problem.
4. Cross-reference with Loki:
   ```
   {service="api"} | json | route =~ ".*payment.*" | responseTime_ms > 500
   ```

### Scenario D — "I want to know when someone's brute-forcing logins"

The `auth_logins_total{outcome="rate_limited"}` counter ticks up every time
the Redis rate limiter blocks a login attempt. Add a panel or an alert on:

```
rate(auth_logins_total{outcome="rate_limited"}[5m])
```

If that's >0 for more than a minute, someone's hammering `/auth/login`.

---

## 6 · The mental model of "metrics vs logs"

A common question from people new to this: *which one should I use?*

| Question | Tool |
| -------- | ---- |
| "How often does X happen?" | **Metrics** (counter) |
| "How long does X take?" | **Metrics** (histogram) |
| "Is X happening right now?" | **Metrics** (gauge) |
| "What exactly happened during X?" | **Logs** |
| "Which tenant / user / record caused X?" | **Logs** (never metrics — cardinality) |

The golden rule: **anything you could group by user / tenant / record ID
belongs in logs, not metrics**. Putting `userId` or `tenantId` as a
Prometheus label explodes the time series count and grinds Prometheus to a
halt. Keep Prometheus labels bounded to roles, routes, status codes,
outcomes.

---

## 7 · What's already set up for you

You don't have to configure anything for basic monitoring to work — it's all
pre-provisioned:

- The API **already emits** default Node metrics, HTTP RED, and domain
  counters.
- Prometheus **already scrapes** the API at `/api/v1/metrics` every 15
  seconds.
- Promtail **already tails** every container log through the Docker socket.
- Loki **already ingests** those lines, auto-parses JSON, extracts labels.
- Grafana **already has** both data sources wired up on boot.
- A **starter dashboard** is loaded with 12 pre-built panels covering the
  core RED metrics + logs + business counters.

Turn the profile on, hit the API a few times to warm the counters, open
Grafana, done.

---

## 8 · When you want to add something new

Two common additions:

### A new metric

Say, "count every time a student submits a quiz":

1. Declare a counter in `src/service/metrics.ts` (copy an existing one —
   5 lines).
2. Import it in `quiz.service.ts` and call `.inc({ outcome: 'submitted' })`
   at the right spot.
3. Within 15s Prometheus scrapes it. Add a panel in Grafana — click **New →
   Add visualization**, type a query like `rate(quiz_submissions_total[5m])`,
   save.

### A new alert

Say, "ping me if error rate > 5% for 5 minutes":

Grafana → **Alerting** → new alert rule, paste the PromQL, pick a contact
point (email / Slack / webhook). Grafana evaluates it every minute and
fires the contact point when the condition holds.

For Phase 1 we didn't pre-configure alerts — add them when you know your
SLOs.

---

## 9 · Production vs local

Same tools, different homes:

| Layer | Local (this setup) | Production |
| ----- | ------------------ | ---------- |
| Metrics store | Prometheus container on your laptop | Grafana Cloud Prometheus / AWS Managed Prometheus |
| Log store | Loki single-binary container | Grafana Cloud Loki / CloudWatch / OpenSearch |
| Log shipper | Promtail via Docker socket | Promtail or Grafana Alloy as a DaemonSet |
| Dashboards | Auto-provisioned local Grafana | Grafana Cloud — same JSON dashboards |
| Alerts | None yet | Grafana Alerting → Slack / PagerDuty |

The **application code doesn't change**. `/metrics` and winston logs work
identically in both worlds. Only the infra around them is different.

---

## 10 · What to read next

- **The detailed how-to** — [OBSERVABILITY.md](./OBSERVABILITY.md) — every
  PromQL/LogQL query you'll use, how to correlate, how to add metrics, how
  to debug the stack itself.
- **The plumbing** — the YAMLs under `observability/` — configs are short
  (under 50 lines each) and commented.
- **The live dashboard JSON** —
  `observability/grafana/provisioning/dashboards/json/api-overview.json` —
  every panel is just a query + a visualization type.

---

## TL;DR — the one-paragraph summary

Your API already knows how to report its own numbers (at `/api/v1/metrics`)
and writes structured logs. When you run
`docker compose ... --profile observability up -d`, four sidecar containers
spin up: **Prometheus** pulls the numbers every 15 seconds, **Promtail**
tails container logs and feeds them to **Loki**, and **Grafana** gives you
a single browser UI that queries both — with a pre-made dashboard covering
request rate, error %, p50/p95/p99 latency, top routes, Node heap, and a
live log panel. For day-to-day use, you open Grafana at
`http://localhost:3001`, look at the dashboard, and if something's red, you
jump to **Explore → Loki**, filter by the request ID from a failing line,
and you have the full story. You don't edit configs, don't write queries,
don't learn new tools — until you want to, at which point each layer is
small and documented.
