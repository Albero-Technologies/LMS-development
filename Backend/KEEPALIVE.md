# Backend keepalive — cron-job.org

The Render free-tier web service spins down after **~15 min of inactivity**,
which makes the first cold request after a quiet stretch take 30–60 seconds.
To avoid that, an external pinger keeps the service warm by hitting the
health endpoint on a short interval.

## Current setup

| Field          | Value                                                   |
| -------------- | ------------------------------------------------------- |
| Service        | [cron-job.org](https://console.cron-job.org)            |
| Job name       | `Albero API keepalive`                                  |
| Target URL     | `https://lms-development.onrender.com/api/v1/health`    |
| Method         | `GET`                                                   |
| Interval       | every ~10 min (well under Render's 15 min spin-down)    |
| Owner          | _set in the Albero ops account_                         |

## Why this exists outside the repo

- **Render's own Cron service is a paid add-on.** cron-job.org is free,
  unlimited for this use case, and emails on failure.
- **Claude Code scheduled routines have a 1-hour minimum interval**, which is
  longer than Render's 15-min spin-down — they can't solve this.
- **UptimeRobot is an equivalent alternative** (5-min minimum on the free
  tier); pick either, just don't run both — they'll race on alerts.

## What gets hit

`/api/v1/health` is a rate-limited, no-auth endpoint that returns 200 with a
small JSON payload. It does **not** touch the DB or Redis — the ping cost on
the service is negligible. If you want richer keepalive that surfaces
dependency failures, add a `/health/detailed` endpoint and point cron-job.org
at it instead.

## Operations

- **Cold-start spotted?** Check the cron-job.org **HISTORY** panel for the
  job. If the last few pings show non-200 or huge response times, the
  service may be down or the cron may be paused.
- **Renaming the Render service** (e.g. moving off `lms-development` to a
  prod hostname) means updating the target URL in cron-job.org **and** the
  comment block at the top of [`render.yaml`](./render.yaml).
- **Disabling the service** (e.g. permanent shutdown): disable the cron job
  too, otherwise the dashboard will fill up with failure notifications.

## Verification

```bash
curl -i https://lms-development.onrender.com/api/v1/health
```

Should return `HTTP/2 200` with a JSON body. If you instead see a 30+ second
delay before the 200, the keepalive isn't running — check cron-job.org.
