# Backend — First-Boot Setup

The exact sequence that was used to get the server running on a fresh clone.
Every command is copy-pasteable. Run them from the `Backend/` directory.

> For a full walkthrough with the "why" behind each step, see [DOCS.md](./DOCS.md).
> This file is the tight cookbook.

---

## 0 · Prerequisites

Verify once:

```bash
node --version     # v20.x
npm --version      # 10.x or newer
docker --version
docker compose version
```

If any of those are missing, install them first — see [DOCS.md §3](./DOCS.md#3-prerequisites--install-these-first).

---

## 1 · Install dependencies

```bash
cd Backend
npm install
```

`npm install` also auto-runs `husky` to wire the git hooks.

---

## 2 · Environment configuration

`.env.development` is already committed with localhost-friendly defaults — **you don't need to create any env file for the standard dev flow**.

Only create `.env.development.local` if you want to override a specific value (e.g. point `DATABASE_URL` at a Neon branch, or add real SendGrid keys). That file is gitignored.

---

## 3 · Start Postgres + Redis (Docker)

```bash
docker compose -f docker/development/docker-compose.yml up -d postgres redis
```

Confirm they're up:

```bash
docker ps
```

Expected (abbreviated):
```
NAMES                     STATUS                        PORTS
learnhub-dev-redis-1      Up X seconds (healthy)        0.0.0.0:6379->6379/tcp
learnhub-dev-postgres-1   Up X seconds (healthy)        0.0.0.0:5432->5432/tcp
```

Wait until Postgres finishes its healthcheck (usually ≤5s):

```bash
# Windows/macOS/Linux-agnostic
docker exec learnhub-dev-postgres-1 pg_isready -U learnhub
# → accepting connections
```

---

## 4 · Apply the Prisma migration

On a fresh database you must run the initial migration. Pass `DATABASE_URL`
inline because some shells don't auto-load `.env.development` when Prisma is
invoked from outside Node:

**Bash / PowerShell (bash-compatible):**
```bash
DATABASE_URL="postgresql://learnhub:learnhub@localhost:5432/learnhub?schema=public" \
  npx prisma migrate dev --name init --skip-seed
```

**Windows PowerShell native:**
```powershell
$env:DATABASE_URL = "postgresql://learnhub:learnhub@localhost:5432/learnhub?schema=public"
npx prisma migrate dev --name init --skip-seed
```

Expected output includes:
```
Applying migration `YYYYMMDDHHMMSS_init`
The following migration(s) have been created and applied from new schema changes:
  migrations/
    └─ YYYYMMDDHHMMSS_init/
      └─ migration.sql
Your database is now in sync with your schema.
✔ Generated Prisma Client (v5.22.0)
```

> The Prisma CLI will print an "update available → v7" banner. Ignore it.
> The project is pinned to Prisma 5.22 on purpose — see
> [DOCS.md §19 "I actually want to upgrade to Prisma 7"](./DOCS.md#i-actually-want-to-upgrade-to-prisma-7).

---

## 5 · (Optional) Seed demo data

Adds one tenant, one user per role (all password `Password123`), one course,
one quiz.

```bash
npm run prisma:seed
```

---

## 6 · Start the dev server

```bash
npm run dev
```

A healthy boot prints (colours stripped):

```
[nodemon] starting `ts-node src/server.ts`
INFO  DATABASE_CONNECTION   { host: 'localhost:5432', name: 'learnhub', port: '5432' }
INFO  RATE_LIMITER_INITIALIZED
INFO  APPLICATION_STARTED   { PORT: 3000, SERVER_URL: 'http://localhost:3000', ENV: 'development' }
INFO  REDIS_CONNECTED       { url: 'redis://localhost:6379' }
```

Start the notification worker in a **second terminal** (optional in dev):

```bash
npm run worker:dev
```

---

## 7 · Smoke tests

```bash
curl http://localhost:3000/api/v1/health
# → { "data": { "db": "up", ... } }

curl http://localhost:3000/api/v1/self
# → { "data": { "service": "learnhub-api", "version": "1.0.0" } }

curl -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/v1/openapi.json
# → 200
```

Open **Swagger UI** in a browser:

```
http://localhost:3000/api/v1/docs
```

---

## 8 · What got fixed during first-boot

When the dev server was first booted on a new machine, two TypeScript errors
surfaced from `tsc --strict`. They're already fixed in the repo; documenting
the root cause here so you recognise the pattern.

### Symptom

```
src/modules/courses/course.controller.ts(16,82):
  error TS2345: Argument of type 'Role' is not assignable to parameter of
  type '"SUPER_ADMIN" | "ADMIN" | "TRAINER"'.
src/modules/quizzes/quiz.controller.ts(32,76):
  same error
```

### Cause

TypeScript infers an inline literal array as a **narrow tuple of string
literals**, not `Role[]`. `Array.prototype.includes()` then refuses anything
outside that tuple.

```ts
// ❌ TS infers the array as ("SUPER_ADMIN" | "ADMIN" | "TRAINER")[]
//    and rejects `req.auth.role` (typed as the full Role enum)
const isAuthor = [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER].includes(req.auth.role)
```

### Fix

Give the array an explicit `Role[]` annotation so `.includes()` accepts any
`Role`:

```ts
// ✅
const authorRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.TRAINER]
const isAuthor = authorRoles.includes(req.auth.role)
```

If you add more `roles.includes(user.role)` checks in new code, copy this
pattern from the start.

---

## 8.5 · (Optional) Observability stack

To get Grafana dashboards + log search locally:

```bash
docker compose -f docker/development/docker-compose.yml \
  --profile observability up -d
```

Then open **http://localhost:3001** (admin / admin) — the *LearnHub · API Overview*
dashboard is pre-provisioned and will start populating as soon as traffic hits
the API.

- Never-done-monitoring-before intro → [MONITORING_OVERVIEW.md](./MONITORING_OVERVIEW.md)
- Full reference (queries, metrics catalog) → [OBSERVABILITY.md](./OBSERVABILITY.md)

---

## 9 · Shutting down

```bash
# Stop the dev server
Ctrl+C  (in the terminal running npm run dev)

# Stop and keep the DB data
docker compose -f docker/development/docker-compose.yml down

# Stop AND wipe the DB + Redis (fresh start next time)
docker compose -f docker/development/docker-compose.yml down -v
```

---

## 10 · One-liner — full fresh start

For when you want to wipe everything and bring it back:

```bash
# From Backend/
docker compose -f docker/development/docker-compose.yml down -v \
  && docker compose -f docker/development/docker-compose.yml up -d postgres redis \
  && sleep 3 \
  && DATABASE_URL="postgresql://learnhub:learnhub@localhost:5432/learnhub?schema=public" \
     npx prisma migrate deploy \
  && npm run prisma:seed \
  && npm run dev
```

PowerShell equivalent:
```powershell
docker compose -f docker/development/docker-compose.yml down -v
docker compose -f docker/development/docker-compose.yml up -d postgres redis
Start-Sleep -Seconds 3
$env:DATABASE_URL = "postgresql://learnhub:learnhub@localhost:5432/learnhub?schema=public"
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

---

## Troubleshooting in 30 seconds

| Symptom | First thing to try |
| ------- | ------------------ |
| `Can't reach database server at localhost:5432` | `docker ps` — is postgres running? If not, rerun step 3. |
| `ECONNREFUSED 127.0.0.1:6379` | Same, for redis. |
| `Error: P3009` from prisma migrate | Reset: `npx prisma migrate reset` |
| `Cannot find module '@prisma/client'` | `npm run prisma:generate` |
| Nodemon keeps restarting in a loop | Check the last log line — usually a TS error. `npx tsc --noEmit` pinpoints it. |
| Swagger UI shows blank page | Hard-reload (`Ctrl-Shift-R`) — cached broken CSP from an older build. |
| Prisma CLI banner nagging to upgrade to v7 | Ignore. We're pinned to v5.22. See [DOCS.md §19](./DOCS.md#i-actually-want-to-upgrade-to-prisma-7). |

For more, see [DOCS.md §19 Troubleshooting](./DOCS.md#19-troubleshooting).
