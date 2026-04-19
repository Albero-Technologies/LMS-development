# LearnHub Backend — Beginner's Walkthrough

Welcome! This document walks you through the LearnHub backend **from "I just cloned the repo" to "I shipped my first feature"** — no prior knowledge of the stack assumed.

If you're already comfortable with Node/Prisma/Postgres and just want the quick API reference, read [README.md](./README.md) instead.

---

## Table of contents

1. [What is this project?](#1-what-is-this-project)
2. [The tech stack, in plain English](#2-the-tech-stack-in-plain-english)
3. [Prerequisites — install these first](#3-prerequisites--install-these-first)
4. [First-time setup (step by step)](#4-first-time-setup-step-by-step)
5. [Running the app](#5-running-the-app)
5a. [Environments — which env file loads when](#5a-environments--which-env-file-loads-when)
6. [Folder tour — where does what live?](#6-folder-tour--where-does-what-live)
7. [How a request flows through the code](#7-how-a-request-flows-through-the-code)
8. [Multi-tenancy & RBAC — the mental model](#8-multi-tenancy--rbac--the-mental-model)
9. [Working with the database (Prisma)](#9-working-with-the-database-prisma)
10. [Writing and running tests](#10-writing-and-running-tests)
11. [Trying the API end-to-end](#11-trying-the-api-end-to-end)
12. [File uploads](#12-file-uploads)
13. [Payments & webhooks](#13-payments--webhooks)
14. [Background jobs (BullMQ worker)](#14-background-jobs-bullmq-worker)
15. [Docker — three ways to run it](#15-docker--three-ways-to-run-it)
16. [Logging, health, metrics](#16-logging-health-metrics)
17. [Common dev workflows (cheat sheet)](#17-common-dev-workflows-cheat-sheet)
18. [Adding a new feature — a mini tutorial](#18-adding-a-new-feature--a-mini-tutorial)
19. [Troubleshooting](#19-troubleshooting)
20. [Glossary](#20-glossary)

---

## 1. What is this project?

**LearnHub** is a multi-tenant Learning Management System (think: a Udemy-like
platform that a training institute can run as their own branded site). This
repository is the **backend** — the HTTP API that the web app and (later) the
mobile app talk to.

**Phase 1** is a single Node.js process (a "monolith") that handles:

- Authentication (email/password + Google)
- Courses, lessons, quizzes, enrollments
- Payments (Razorpay) with GST invoices (Zoho Books)
- Support tickets, lead pipeline (for sales/counsellors)
- Role-based dashboards
- File uploads (avatars, course thumbnails, assignments)
- Email notifications

> **Multi-tenant** = one deployment serves many institutes. Every row in the
> database belongs to a `tenantId`. A student at Institute A can never see
> data from Institute B.

---

## 2. The tech stack, in plain English

| Tool | What it is | Why we use it |
| ---- | ---------- | ------------- |
| **Node.js 20** | JavaScript runtime on the server | Industry standard; huge library ecosystem |
| **TypeScript** | JavaScript with types | Catches bugs at compile time |
| **Express 5** | HTTP web framework | Simple, proven, boring (in a good way) |
| **PostgreSQL** (via Neon) | Relational database | Transactions, JSON support, rock-solid |
| **Prisma** | ORM (database toolkit) | Type-safe queries, auto-generated client from schema |
| **Redis** (via Upstash) | In-memory store | Rate limiting, session tracking, job queue backend |
| **BullMQ** | Job queue on top of Redis | Send emails in the background, retry on failure |
| **Zod** | Runtime input validation | Reject bad JSON before it hits your logic |
| **JWT** | Signed auth tokens | Stateless login; no server-side session store |
| **bcrypt** | Password hashing | Never store raw passwords |
| **SendGrid** | Email provider | Welcome / invoice / ticket emails |
| **Razorpay** | Indian payment gateway | Course purchases |
| **multer** | File-upload middleware | Handles `multipart/form-data` |
| **Swagger UI** | Auto-rendered API docs | Try endpoints from a web UI |
| **Winston + pino-http** | Structured logging | JSON logs → easy to grep + ship to Grafana |
| **Helmet** | Security headers | Sensible defaults against OWASP top-10 |
| **Vitest + supertest** | Test runner + HTTP tester | Fast, ESM-first, Jest-compatible API |

Don't panic if you don't know all of these yet. You can ship a small feature
knowing only Express + Prisma + Zod.

---

## 3. Prerequisites — install these first

You need **three** things on your laptop:

### 3.1 Node.js 20 (LTS)

Check:
```bash
node --version     # should print v20.x.x
npm --version      # should print 10.x or newer
```

If missing or older, install from [nodejs.org](https://nodejs.org) or use `nvm`:
```bash
# macOS / Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### 3.2 Git

```bash
git --version      # any 2.x is fine
```

### 3.3 Docker Desktop (recommended but optional)

Docker lets you run Postgres + Redis + the API in one command. If you don't
want Docker, you can install Postgres 16 and Redis 7 natively on your machine
and skip the Docker section.

Check:
```bash
docker --version
docker compose version
```

### 3.4 Nice-to-haves

- **Postman** or **Insomnia** — to hit the API manually. Or just use Swagger UI in the browser.
- **TablePlus** / **DBeaver** / `psql` — to browse the database.
- **VS Code** with the Prisma + ESLint + Prettier extensions.

---

## 4. First-time setup (step by step)

These commands assume you're in the `Backend/` directory. From the repo root:

```bash
cd Backend
```

### Step 1 — install dependencies

```bash
npm install
```

This downloads everything listed in `package.json` into `node_modules/`.
The first run takes 1–2 minutes. You'll see a few warnings — ignore them
unless anything says "ERR!".

> The `npm install` also runs `husky` which installs the git hooks
> (`.husky/pre-commit`, `.husky/commit-msg`) automatically.

### Step 2 — environment variables

Good news: **`.env.development` is already committed with localhost defaults**.
If you're using the Docker Compose Postgres + Redis in Step 3, you don't need
to create any env file to start.

If you want to override a single value (e.g. point at a Neon branch instead of
local Postgres), create a gitignored override file:

```bash
# macOS / Linux
cp .env.example .env.development.local

# Windows (PowerShell)
Copy-Item .env.example .env.development.local
```

Open `.env.development.local` and put **only the keys you want to override**:

```ini
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/learnhub?sslmode=require"
SENDGRID_API_KEY=SG.your-test-key
```

For local development you can leave `SENDGRID_API_KEY` / `RAZORPAY_*` blank —
emails will be skipped (logged instead) and paid courses will fail gracefully.

> **Never commit `.env`, `.env.local`, or `.env.*.local`.** The pre-commit
> hook blocks all of them. Only `.env.example`, `.env.development`, and
> `.env.production` are safe to commit (they carry no real secrets).

See the [Environments section](#5a-environments--which-env-file-loads-when)
below for the full loading order and how to run the production profile locally.

### Step 3 — start Postgres and Redis

**Easiest:** use Docker Compose to run both at once:

```bash
# from Backend/
docker compose -f docker/development/docker-compose.yml up -d postgres redis
```

Check they're up:
```bash
docker ps
# you should see two containers: ..._postgres_... and ..._redis_...
```

If your `.env` uses Docker services, set:
```ini
DATABASE_URL="postgresql://learnhub:learnhub@localhost:5432/learnhub?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Step 4 — set up the database schema

Prisma needs to:
1. Generate a typed client (the `PrismaClient` JS class) from `prisma/schema.prisma`.
2. Apply the schema to your local database.

```bash
npm run prisma:generate       # creates node_modules/@prisma/client
npm run prisma:migrate:dev    # creates the 19 tables in Postgres
```

When asked for a migration name, type something like `init` and press Enter.

### Step 5 — seed demo data

```bash
npm run prisma:seed
```

This creates:
- One tenant: **"Acme Institute"** (slug `acme-institute`)
- One user per role, all with password **`Password123`**
- One published course "JavaScript Fundamentals" with 1 lesson + 1 quiz

### Step 6 — start the server

```bash
npm run dev
```

You should see:
```
▸ ts-node listening on :3000
DATABASE_CONNECTION  { meta: { host: 'localhost', ... } }
REDIS_CONNECTED      { meta: { url: 'redis://localhost:6379' } }
APPLICATION_STARTED  { PORT: 3000, SERVER_URL: '...' }
```

Open **http://localhost:3000/api/v1/docs** in your browser. Congrats — you're running the API. 🎉

### Step 7 (optional) — start the background worker

In a **second terminal**:
```bash
cd Backend
npm run worker:dev
```

This process picks up notification jobs (send welcome email, send ticket
update email, etc.) from the Redis queue. You can leave it off for now — jobs
will just sit in the queue until you start it.

---

## 5. Running the app

You now have **three** ways to run the backend. Pick the one that fits the moment.

### Option A — bare Node (what you did above)

Fast, easy to attach a debugger.

```bash
npm run dev         # API
npm run worker:dev  # worker (separate terminal)
```

### Option B — Docker Compose (full stack in one command)

```bash
docker compose -f docker/development/docker-compose.yml up --build
```

Starts Postgres + Redis + API + Worker + Nginx. Your API is now reachable at:
- `http://localhost:3000` (direct)
- `http://localhost:8080` (through Nginx reverse proxy)

### Option C — production-like container

```bash
docker build -t learnhub-api:prod -f docker/production/Dockerfile .
docker run --rm -p 3000:3000 \
  --env-file .env.production \
  --env-file .env.production.local \
  learnhub-api:prod
```

This builds the multistage production image (≈150MB, no dev deps). Good for
verifying a production build before you push.

---

## 5a. Environments — which env file loads when

This project uses **dotenv-flow**. The loader reads `NODE_ENV` (set by the
npm scripts via `cross-env`) and layers files in this order (later overrides
earlier):

```
.env                      (gitignored, rarely used)
.env.local                (gitignored — personal overrides across envs)
.env.<NODE_ENV>           (COMMITTED — .env.development / .env.production)
.env.<NODE_ENV>.local     (gitignored — real secrets per env)
```

So for `NODE_ENV=development`:
1. `.env.development` ships with sane localhost defaults (committed).
2. Anything in your personal `.env.development.local` wins over it.

### Which file holds what?

| File | Committed? | What goes in it |
| ---- | ---------- | --------------- |
| `.env.example` | yes | A copy-paste template; every key the app understands, with placeholders |
| `.env.development` | yes | Non-secret dev defaults (localhost URLs, dummy JWT secrets, low bcrypt rounds) |
| `.env.production` | yes | Non-secret prod defaults (prod URLs, cookie domain, log level). Secrets are left **blank** here — they come from the platform. |
| `.env.development.local` | **no** (gitignored) | Your personal dev secrets: a real SendGrid test key, a Razorpay test key, a Neon branch URL |
| `.env.production.local` | **no** (gitignored) | Only for running the prod profile **on your laptop**. In a deployed environment, these come from the platform's secret store. |
| `.env`, `.env.local` | **no** (gitignored) | Usually empty; last-resort overrides |

### npm scripts — the four combinations

The scripts are named `<runner>:<env>`. "Runner" is either `dev` (hot-reload
via nodemon) or `start` (compiled `dist/server.js`). "Env" is `dev` or `prod`.

| Script | Runner | NODE_ENV | Env files loaded | Use when… |
| ------ | ------ | -------- | ---------------- | --------- |
| `npm run dev` | nodemon | `development` | `.env.development` + `.env.development.local` | **everyday dev** — hot reload, dev config |
| `npm run dev:dev` | nodemon | `development` | same as above | alias of `npm run dev` (explicit) |
| `npm run dev:prod` | nodemon | `production` | `.env.production` + `.env.production.local` | hot-reload **but with prod config** — smoke test changes against prod env shape |
| `npm run start` | node dist/ | `production` | `.env.production` + `.env.production.local` | what CI runs; closest to the deployed image |
| `npm run start:prod` | node dist/ | `production` | same as above | alias of `npm run start` |
| `npm run start:dev` | node dist/ | `development` | `.env.development` + `.env.development.local` | run the compiled bundle with dev config (rare) |

Worker equivalents: `worker:dev`, `worker:dev:prod`, `worker:start`, `worker:start:dev`.

### The three scenarios, in command form

#### 1. Normal dev (you'll use this 95% of the time)

```bash
npm run dev             # hot reload, dev env
npm run worker:dev      # hot reload, dev env (separate terminal)
```

#### 2. Run the **production profile** locally (smoke test)

Create `.env.production.local` once — it stays on your laptop:

```ini
DATABASE_URL=postgresql://learnhub:learnhub@localhost:5432/learnhub?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=<32+ random bytes>
JWT_REFRESH_SECRET=<32+ different random bytes>

# Override the prod URLs back to localhost so CORS + cookies work
SERVER_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173
ALLOWED_TENANT_ORIGINS=http://localhost:5173
COOKIE_DOMAIN=
COOKIE_SECURE=false
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Then either:

```bash
# Hot-reload runner with prod env
npm run dev:prod
```

or the full compiled run (closest to what CI ships):

```bash
npm run build           # prisma generate + tsc → dist/
npm start               # node dist/server.js with NODE_ENV=production
npm run worker:start    # worker against prod env
```

#### 3. One-off override without touching any file

Inline env vars beat every file:

```bash
DATABASE_URL=postgres://... \
REDIS_URL=redis://... \
npm run dev
```

### Verify which files were actually loaded

Debug output from dotenv-flow:

```bash
DEBUG=dotenv-flow npm run dev
# → dotenv-flow loaded .env.development
# → dotenv-flow loaded .env.development.local
```

Dump the effective env (doesn't start the server):

```bash
npm run env:print
```

Or check the startup log — `APPLICATION_STARTED` prints the effective `ENV`,
`PORT`, and `SERVER_URL`.

### Why not `npm run dev --prod`?

`npm run <script> --flag` doesn't pass `--flag` to your script — npm
interprets it as an npm CLI flag. To pass real args you'd need
`npm run dev -- --prod`, and the script would have to parse `--prod` itself.
We keep it simple by using **named scripts** (`dev:prod`, `start:prod`) —
no flag parsing, no ambiguity, and they show up in `npm run` listings.

---

## 6. Folder tour — where does what live?

```
Backend/
├── prisma/                    ← database schema + migrations + seed
│   ├── schema.prisma          ← single source of truth for DB tables
│   └── seed.ts                ← inserts demo data
│
├── src/                       ← all application code
│   ├── server.ts              ← entry point: starts HTTP server
│   ├── worker.ts              ← entry point: BullMQ worker process
│   ├── app.ts                 ← Express app assembly (middleware, routes)
│   │
│   ├── config/                ← env loading + rate-limiter setup
│   │   ├── config.ts
│   │   └── rateLimiter.ts
│   │
│   ├── constant/              ← magic values live here
│   │   ├── application.ts     ← enum of environments
│   │   ├── policy.ts          ← ★ the 12-module × 7-role RBAC matrix
│   │   └── responseMessage.ts
│   │
│   ├── controller/            ← generic controllers (health, metrics, self)
│   │
│   ├── middleware/            ← Express middleware functions
│   │   ├── auth.ts            ← JWT verify + RBAC + tenant assertion
│   │   ├── validate.ts        ← runs a Zod schema against req.body/query
│   │   ├── upload.ts          ← multer file-upload helpers
│   │   ├── rateLimit.ts       ← Redis rate limiter wrapper
│   │   ├── globalErrorHandler.ts
│   │   ├── asyncHandler.ts    ← wraps async route handlers safely
│   │   └── requestId.ts
│   │
│   ├── modules/               ← ★ one folder per feature area
│   │   ├── auth/              ← login, register, refresh, Google, invites
│   │   ├── tenants/
│   │   ├── users/
│   │   ├── courses/           ← courses, sections, lessons, progress
│   │   ├── enrollments/       ← enrolment + Razorpay + webhooks
│   │   ├── payments/          ← Razorpay HMAC helpers
│   │   ├── quizzes/
│   │   ├── batches/
│   │   ├── leads/             ← counsellor CRM pipeline
│   │   ├── tickets/           ← support
│   │   ├── notifications/     ← BullMQ queue + SendGrid + templates
│   │   ├── dashboards/
│   │   └── uploads/           ← multer upload endpoints
│   │
│   ├── router/
│   │   └── apiRouter.ts       ← mounts every module's router under /api/v1
│   │
│   ├── service/
│   │   ├── db.ts              ← Prisma client + soft-delete middleware
│   │   └── redis.ts           ← ioredis singleton
│   │
│   ├── util/                  ← small helpers (no Express imports)
│   │   ├── AppError.ts        ← ★ the custom error class
│   │   ├── password.ts
│   │   ├── tokens.ts          ← JWT sign/verify
│   │   ├── audit.ts
│   │   ├── errorObject.ts     ← shapes errors into the JSON response
│   │   ├── httpError.ts
│   │   ├── httpResponse.ts    ← shapes success responses
│   │   ├── logger.ts          ← Winston logger
│   │   └── quicker.ts
│   │
│   ├── docs/
│   │   ├── openapi.ts         ← OpenAPI 3.1 spec (hand-authored)
│   │   └── swagger.ts         ← Swagger UI mount
│   │
│   └── types/types.ts         ← shared TS types + Express Request augmentation
│
├── test/                      ← vitest tests
│   ├── setup.ts
│   ├── util/  rbac/  schemas/  docs/  payments/  app/  uploads/
│
├── docker/                    ← Dockerfiles + docker-compose
│   ├── development/
│   └── production/
│
├── nginx/                     ← reverse + forward proxy configs
│   ├── nginx.conf
│   ├── http.conf
│   └── https.conf
│
├── logs/                      ← winston file output (auto-created)
├── public/uploads/            ← multer-written files (auto-created)
│
├── .husky/                    ← git hooks (installed by npm run prepare)
├── .env.example
├── commitlint.config.js
├── eslint.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

The ★ symbols mark the most important files to read first.

---

## 7. How a request flows through the code

Let's trace **`POST /api/v1/courses`** — creating a course.

```
         ┌──────────────┐
  HTTP ──►   app.ts     │  helmet, cors, cookie-parser, pino-http, rate-limit
         └──────┬───────┘
                │
         ┌──────▼─────────────┐
         │ /api/v1 router     │  (src/router/apiRouter.ts)
         └──────┬─────────────┘
                │ mounts /courses
         ┌──────▼──────────────────────────┐
         │ course.router.ts                │
         │                                 │
         │  POST '/'                       │
         │   → requireAuth                 │  ✅ decodes JWT, attaches req.auth
         │   → requirePolicy('course','write') ✅ checks RBAC matrix
         │   → validate(createCourseSchema) ✅ Zod parses req.body
         │   → asyncHandler(ctrl.create)    │
         └──────┬──────────────────────────┘
                │
         ┌──────▼──────────────────────────┐
         │ course.controller.ts            │  thin: unwraps req, calls service
         │   create(req, res)              │
         │     → service.createCourse(...)│
         │     → writeAudit(...)           │
         │     → httpResponse(...)         │
         └──────┬──────────────────────────┘
                │
         ┌──────▼──────────────────────────┐
         │ course.service.ts               │  ★ business logic lives here
         │   createCourse(tenantId, input) │
         │     → check slug unique         │
         │     → decide trainerId          │
         │     → db.client.course.create   │
         └──────┬──────────────────────────┘
                │
         ┌──────▼──────────────────────────┐
         │ prisma/schema.prisma (via db.ts)│  actually talks to Postgres
         └─────────────────────────────────┘
```

Each module follows the **router → controller → service → (Prisma)** pattern.
Routers wire things together, controllers translate HTTP ↔ domain, services do
the work. Only services call the database.

---

## 8. Multi-tenancy & RBAC — the mental model

### Multi-tenancy (one DB, many institutes)

Every domain row (`User`, `Course`, `Enrollment`, ...) has a `tenantId`. Two
institutes store data in the **same tables** but can never see each other's
rows.

How we enforce this:

1. **JWT contains `tid`** (tenant id). Set at login by `auth.service.ts`.
2. **`requireAuth` middleware** pulls the user from DB using BOTH `id` AND `tenantId` from the token. A forged token with a different `tid` won't find the user.
3. **Every service function** takes `tenantId` as its first argument and passes it into the Prisma `where` clause.
4. **`assertSameTenant(req, row)`** is used after a lookup to guarantee the row belongs to the caller's tenant.

### RBAC (role-based access control)

Seven roles: `SUPER_ADMIN`, `ADMIN`, `TRAINER`, `STUDENT`, `COUNSELLOR`,
`SUPPORT`, `CLIENT`.

The matrix lives in `src/constant/policy.ts`. It declares, for each of 12
modules, which roles can `read` and which can `write`.

```ts
// Example: courses
course: {
  read:  ['SUPER_ADMIN','ADMIN','TRAINER','STUDENT','COUNSELLOR','SUPPORT','CLIENT'],
  write: ['SUPER_ADMIN','ADMIN','TRAINER']
}
```

You apply the matrix on a route like this:

```ts
router.post('/', requireAuth, requirePolicy('course','write'), ...)
```

Trainer-scoped rules (e.g. "a trainer can only update *their own* courses")
are enforced at the **service layer**, not the matrix.

---

## 9. Working with the database (Prisma)

### The big picture

`prisma/schema.prisma` is the single source of truth. You write models there.
When you run `prisma migrate`, Prisma generates SQL migration files AND
updates the TypeScript client (`@prisma/client`).

### Everyday Prisma commands

```bash
# Regenerate the TS client after editing schema.prisma (no DB change)
npm run prisma:generate

# Create a new migration for your schema change (dev only)
npm run prisma:migrate:dev -- --name add-wishlist-feature

# Apply pending migrations to an environment (CI / prod)
npm run prisma:migrate:deploy

# Open a GUI in your browser to inspect the tables
npm run prisma:studio
#  → http://localhost:5555

# Re-run the seed
npm run prisma:seed

# Reset the whole DB (deletes everything, re-applies migrations, re-seeds)
npx prisma migrate reset
```

### Reading data — examples

```ts
// Always scope by tenantId!
const courses = await db.client.course.findMany({
  where: { tenantId, publishState: 'PUBLISHED' },
  include: { trainer: { select: { firstName: true, lastName: true } } },
  orderBy: { createdAt: 'desc' },
  take: 20
})
```

### Writing data — examples

```ts
// Transaction: atomically create a tenant + its first admin
const result = await db.client.$transaction(async (tx) => {
  const tenant = await tx.tenant.create({ data: { ... } })
  const admin  = await tx.user.create({   data: { tenantId: tenant.id, ... } })
  return { tenant, admin }
})
```

### Soft deletes

Tables marked "soft-delete" (User, Course, Batch, etc.) have a `deletedAt`
column. A middleware in `src/service/db.ts` transparently:

- Filters out `deletedAt != null` on `findMany` / `findFirst`.
- Converts `prisma.user.delete()` into `prisma.user.update({ deletedAt: now })`.

You rarely think about it — just call `.delete()` as usual.

---

## 10. Writing and running tests

We use **Vitest** (like Jest, but faster) + **supertest** for HTTP tests.

### Run tests

```bash
npm test                 # run everything once
npm run test:watch       # watch mode — re-runs on file change
npm run test:coverage    # + v8 coverage → coverage/index.html
```

### Writing a unit test

Put it in `test/<area>/<name>.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isStrongPassword } from '../../src/util/password'

describe('isStrongPassword', () => {
  it('rejects passwords shorter than 8 chars', () => {
    expect(isStrongPassword('A1b2')).toBe(false)
  })

  it('accepts a letter + digit 8-char password', () => {
    expect(isStrongPassword('Passw0rd')).toBe(true)
  })
})
```

### Writing an HTTP (integration-style) test

See `test/app/http.test.ts` for a full example. The pattern:

1. `vi.mock(...)` the modules that touch Postgres / Redis / SendGrid.
2. Import `app` from `src/app.ts`.
3. Use `supertest(app)` to fire HTTP calls.

```ts
import request from 'supertest'
import app from '../../src/app'

it('returns 200 on /health', async () => {
  const res = await request(app).get('/api/v1/health')
  expect(res.status).toBe(200)
})
```

---

## 11. Trying the API end-to-end

The fastest way: open Swagger UI at
**http://localhost:3000/api/v1/docs** and click "Try it out".

The curl-friendly way (uses seeded `admin@acme.dev`):

### 1. Log in

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@acme.dev","password":"Password123","tenantSlug":"acme-institute"}'
```

Copy the `accessToken` from the JSON response.

### 2. Fetch your user

```bash
TOKEN="paste-access-token-here"
curl -s http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. List courses

```bash
curl -s http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Enrol the seeded student in the seeded course

First log in as the student:

```bash
STUDENT_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@acme.dev","password":"Password123","tenantSlug":"acme-institute"}' \
  | jq -r .data.accessToken)
```

Get the course id:
```bash
COURSE_ID=$(curl -s http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  | jq -r '.data.items[0].id')
```

Create an enrolment (this creates a Razorpay order — or marks it PAID if the
course is free):
```bash
curl -s -X POST http://localhost:3000/api/v1/enrollments \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"courseId\":\"$COURSE_ID\"}" | jq
```

### 5. Hit the dashboard

```bash
curl -s http://localhost:3000/api/v1/dashboard/me \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

You should see your enrolment counted in `stats` and a "Continue X" next action.

---

## 12. File uploads

Hit `POST /api/v1/uploads/avatars` with a `multipart/form-data` body:

```bash
curl -s -X POST http://localhost:3000/api/v1/uploads/avatars \
  -H "Authorization: Bearer $TOKEN" \
  -F 'file=@./my-photo.png' | jq
```

Response:
```json
{
  "success": true,
  "data": {
    "filename": "1760000000000-a1b2c3.png",
    "originalName": "my-photo.png",
    "mimetype": "image/png",
    "size": 42133,
    "url": "/uploads/avatars/<tenant-id>/1760000000000-a1b2c3.png"
  }
}
```

Files land in `public/uploads/<kind>/<tenantId>/`. Nginx serves `/uploads/*`
directly without re-entering Node. MIME and size caps live in
`src/middleware/upload.ts`.

---

## 13. Payments & webhooks

### Local setup

For a completely offline flow, set the course price to `0` in `prisma/seed.ts`
and re-seed. Enrolment then skips Razorpay entirely.

For a full test with Razorpay sandbox:

1. Sign up at [razorpay.com](https://razorpay.com) → get **Test API Key ID** and **Key Secret**.
2. Put them in `.env` as `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
3. Use the frontend (or Postman) to call `POST /enrollments` — you'll get a Razorpay `order.id`.
4. Complete the Checkout handshake and POST the signature back to `/enrollments/verify-payment`.

### Testing webhooks locally

Use [ngrok](https://ngrok.com) to expose your local API:

```bash
ngrok http 3000
# → https://abc123.ngrok-free.app
```

In Razorpay Dashboard → Webhooks, set:
- URL: `https://abc123.ngrok-free.app/api/v1/webhooks/razorpay`
- Secret: matches your `RAZORPAY_WEBHOOK_SECRET` in `.env`

The signature is verified in `src/modules/payments/razorpay.client.ts`.
Unverified requests get a 400.

---

## 14. Background jobs (BullMQ worker)

BullMQ is a Redis-backed job queue. Every time you want to do something slow
(send an email, generate a PDF), you **enqueue** a job and return immediately
to the user.

### Enqueue a job (anywhere in the API code)

```ts
import { notifyQueue, NOTIFY_JOB } from '../notifications/notification.queue'

await notifyQueue.add(NOTIFY_JOB, {
  tenantId,
  userId,
  template: 'payment',
  data: { invoiceNumber: '2026-001', amount: '499.00', currency: 'INR' }
})
```

### Process the job (worker process)

`src/worker.ts` boots a BullMQ `Worker` that calls
`processNotificationJob(job.data)`. Retries with jitter up to 5 times.

```bash
npm run worker:dev
```

If the worker isn't running, jobs accumulate in Redis. Not a bug — just start
it when you need emails to go out.

---

## 15. Docker — three ways to run it

### 15.1 Just the dependencies (Postgres + Redis)

You already did this in step 3. Quick recap:
```bash
docker compose -f docker/development/docker-compose.yml up -d postgres redis
```

### 15.2 Full dev stack (includes API + Worker + Nginx)

```bash
docker compose -f docker/development/docker-compose.yml up --build
```

Pros: closer to production.
Cons: slower feedback than `npm run dev` because of the container layer.

### 15.3 Production image (what CI ships)

```bash
# Build
docker build -t learnhub-api:prod -f docker/production/Dockerfile .

# Run
docker run --rm -p 3000:3000 --env-file .env learnhub-api:prod

# Run the worker off the same image
docker run --rm --env-file .env learnhub-api:prod node dist/worker.js
```

The production image is 4-stage multistage: deps → builder → prod-deps →
runner. Final size is ~150 MB, runs as a non-root `app` user, has a
`/api/v1/health` `HEALTHCHECK`.

---

## 16. Logging, health, metrics

### Logs

Two sinks:
- **Stdout** — human-friendly coloured output in dev, JSON in prod.
- **File** — `logs/development.log` rotated at 10MB × 5 files.

In code, always use the logger — never `console.log` (ESLint blocks it):

```ts
import logger from '../util/logger'

logger.info('USER_CREATED', { meta: { userId, tenantId } })
logger.error('PAYMENT_FAILED', { meta: { orderId, reason } })
```

Every HTTP request also gets a `pino-http` line with `requestId` + `tenantId`.

### Health + metrics endpoints

```bash
# Are we alive?
curl http://localhost:3000/api/v1/health
# { "data": { "db": "up", "application": {...}, "system": {...} } }

# Prometheus exposition — default Node metrics + HTTP RED + domain counters
curl http://localhost:3000/api/v1/metrics | head -20
# http_requests_total{service="learnhub-api",method="GET",route="/api/v1/health",status_code="200"} 12
# http_request_duration_seconds_bucket{...,le="0.01"} ...
# nodejs_heap_size_used_bytes ...
# ...

# Service identity
curl http://localhost:3000/api/v1/self
# { "data": { "service": "learnhub-api", "version": "1.0.0" } }
```

### Grafana dashboards (opt-in)

The repo ships a self-contained Prometheus + Loki + Promtail + Grafana stack
behind a docker-compose profile. Start it when you want dashboards:

```bash
docker compose -f docker/development/docker-compose.yml \
  --profile observability up -d
```

Then open:
- **Grafana**   — `http://localhost:3001`  (admin / admin) — dashboards + log search
- **Prometheus** — `http://localhost:9090` — raw query UI
- **Loki**       — `http://localhost:3100` — API only (query via Grafana)

Pre-provisioned dashboard: *LearnHub · API Overview* — request rate, error %,
p50/p95/p99 latency, top routes, Node heap, login attempts, notification jobs,
and a live log panel.

Two monitoring docs depending on what you need:

- [MONITORING_OVERVIEW.md](./MONITORING_OVERVIEW.md) — beginner-friendly tour:
  what the tools do, scenarios ("a user reported a broken request at 3:14 PM"),
  metrics-vs-logs mental model. Start here.
- [OBSERVABILITY.md](./OBSERVABILITY.md) — reference: every metric name,
  PromQL/LogQL cheat-sheet, adding new metrics, production path,
  troubleshooting.

---

## 17. Common dev workflows (cheat sheet)

```bash
# --- everyday ---
npm run dev                  # start API (hot-reload, dev env)
npm run dev:prod             # start API (hot-reload, PROD env — smoke test)
npm run start                # start API (compiled dist, prod env — what CI ships)
npm run worker:dev           # start worker (hot-reload)
npm run env:print            # dump the effective env after dotenv-flow loads
npm test                     # run tests once
npm run test:watch           # tests in watch mode

# --- observability (opt-in) ---
docker compose -f docker/development/docker-compose.yml --profile observability up -d
#   Grafana:     http://localhost:3001  (admin/admin)
#   Prometheus:  http://localhost:9090
#   Loki:        http://localhost:3100 (query via Grafana)

# --- before committing ---
npm run lint:fix             # auto-fix ESLint
npm run format:fix           # auto-format Prettier
npx tsc --noEmit             # typecheck only (no output)

# --- database ---
npm run prisma:studio        # GUI at localhost:5555
npm run prisma:migrate:dev -- --name "your-change"
npm run prisma:seed
npx prisma migrate reset     # ⚠️ nukes + re-creates local DB

# --- dependencies ---
npm install new-package      # add runtime dep
npm install -D new-package   # add dev dep
npm outdated                 # list outdated packages
npm audit                    # security audit
npm audit fix                # auto-patch low-risk issues

# --- git (husky will enforce) ---
git add .
git commit -m "feat(courses): add tag filter"   # ✅ passes commitlint
git commit -m "added stuff"                     # ❌ blocked

# --- docker ---
docker compose -f docker/development/docker-compose.yml up --build
docker compose -f docker/development/docker-compose.yml down -v  # wipe volumes
docker compose -f docker/development/docker-compose.yml logs -f api
```

---

## 18. Adding a new feature — a mini tutorial

Let's add a "Wishlist": a student can save courses they're interested in.

### Step 1 — model the table in Prisma

Open `prisma/schema.prisma`, add:

```prisma
model Wishlist {
  id        String   @id @default(uuid())
  tenantId  String
  userId    String
  courseId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id])

  @@unique([tenantId, userId, courseId])
  @@map("wishlists")
}
```

Also add back-relations on `User` (`wishlists Wishlist[]`) and `Course`
(`wishlists Wishlist[]`).

Run:

```bash
npm run prisma:migrate:dev -- --name add-wishlist
```

### Step 2 — create the module folder

```bash
mkdir -p src/modules/wishlist
```

Create four files:

**`src/modules/wishlist/wishlist.schema.ts`**
```ts
import { z } from 'zod'

export const addToWishlistSchema = z.object({
  courseId: z.string().uuid()
})

export type TAddToWishlistInput = z.infer<typeof addToWishlistSchema>
```

**`src/modules/wishlist/wishlist.service.ts`**
```ts
import db from '../../service/db'

export const addToWishlist = async (tenantId: string, userId: string, courseId: string) =>
  db.client.wishlist.upsert({
    where: { tenantId_userId_courseId: { tenantId, userId, courseId } },
    update: {},
    create: { tenantId, userId, courseId }
  })

export const listWishlist = async (tenantId: string, userId: string) =>
  db.client.wishlist.findMany({
    where: { tenantId, userId },
    include: { course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } } },
    orderBy: { createdAt: 'desc' }
  })
```

**`src/modules/wishlist/wishlist.controller.ts`**
```ts
import { Request, Response } from 'express'
import httpResponse from '../../util/httpResponse'
import responseMessage from '../../constant/responseMessage'
import * as service from './wishlist.service'

export const add = async (req: Request, res: Response) => {
  if (!req.auth) return
  const row = await service.addToWishlist(req.auth.tenantId, req.auth.userId, req.body.courseId)
  httpResponse(req, res, 201, responseMessage.CREATED, row)
}

export const list = async (req: Request, res: Response) => {
  if (!req.auth) return
  const rows = await service.listWishlist(req.auth.tenantId, req.auth.userId)
  httpResponse(req, res, 200, responseMessage.SUCCESS, rows)
}
```

**`src/modules/wishlist/wishlist.router.ts`**
```ts
import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import { asyncHandler } from '../../middleware/asyncHandler'
import { addToWishlistSchema } from './wishlist.schema'
import * as ctrl from './wishlist.controller'

const router = Router()
router.use(requireAuth)
router.get('/', asyncHandler(ctrl.list))
router.post('/', validate(addToWishlistSchema), asyncHandler(ctrl.add))

export default router
```

### Step 3 — mount the router

Edit `src/router/apiRouter.ts`, add:

```ts
import wishlistRouter from '../modules/wishlist/wishlist.router'
// ...
router.use('/wishlist', wishlistRouter)
```

### Step 4 — add a test

`test/wishlist/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { addToWishlistSchema } from '../../src/modules/wishlist/wishlist.schema'

describe('wishlist schema', () => {
  it('accepts a valid uuid', () => {
    const res = addToWishlistSchema.safeParse({ courseId: '11111111-1111-1111-1111-111111111111' })
    expect(res.success).toBe(true)
  })

  it('rejects a non-uuid', () => {
    expect(addToWishlistSchema.safeParse({ courseId: 'abc' }).success).toBe(false)
  })
})
```

### Step 5 — document it

Edit `src/docs/openapi.ts`, add entries for `/wishlist` under `paths`.

### Step 6 — try it

```bash
npm run dev  # reload

curl -s http://localhost:3000/api/v1/wishlist \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq

curl -s -X POST http://localhost:3000/api/v1/wishlist \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"courseId\":\"$COURSE_ID\"}" | jq
```

### Step 7 — commit

```bash
git add .
git commit -m "feat(courses): add wishlist endpoints"
git push origin dev
```

🎉 You just added a feature end-to-end.

---

## 19. Troubleshooting

### "`prisma: command not found`"
You skipped `npm install`, or `node_modules` got deleted. Run `npm install`.

### "Connection refused on port 5432"
Postgres isn't running. Start it:
```bash
docker compose -f docker/development/docker-compose.yml up -d postgres
```
Or check your local Postgres service is running.

### "ECONNREFUSED 127.0.0.1:6379"
Same as above, for Redis.

### "prisma migrate failed: P3009"
Your local migration history drifted from the code. Nuke and re-apply:
```bash
npx prisma migrate reset
```

### "Invalid token" on every request
Your JWT secrets in `.env` changed after the token was issued. Log in again.

### Pre-commit hook blocks my commit with "secret detected"
Check your staged changes with `git diff --cached`. If it's a false positive
(e.g. a test fixture), use the escape hatch:
```bash
HUSKY_ALLOW_WIP=1 git commit -m "test(auth): fixture for fake ghp_ key"
```

### "Error: cannot find module '@prisma/client'"
Run `npm run prisma:generate`. This also needs to happen whenever you edit
`prisma/schema.prisma`.

### Swagger UI shows an empty page
Your browser cached a broken CSP. Hard-reload (`Ctrl-Shift-R` / `Cmd-Shift-R`)
or open an incognito window.

### Tests fail with "Cannot find module" errors
Run `npm install` again. Then `npm run prisma:generate`.

### `npm run worker:dev` fails to start
The worker needs Redis. Confirm `docker ps` shows redis, or that
`redis-cli ping` returns `PONG`.

### VS Code shows Prisma warnings about `url` / `fullTextSearch` / `prisma.config.ts`

These come from the **VS Code Prisma extension**, which ships its own Prisma
CLI (currently v7). Our project pins `^5.22.0`, so the extension is validating
your schema against a newer Prisma than what actually runs.

What each warning means and how we handle it:

1. **`fullTextSearch` renamed to `fullTextSearchPostgres`** — already fixed.
   The schema no longer declares that preview feature (we never used it).
2. **`datasource.url` no longer supported / move to `prisma.config.ts`** — a
   Prisma 7-only rule. On Prisma 5, `url = env("DATABASE_URL")` in the
   datasource block is required. The repo root has `.vscode/settings.json`
   pinning the extension to the workspace's Prisma binary:
   ```json
   "prisma.useLocalPlugin": true,
   "prisma.prismaPluginPath": "Backend/node_modules/prisma"
   ```
   Reload VS Code (`Ctrl+Shift+P` → *Developer: Reload Window*) and the
   warning disappears.

CLI commands (`npm run prisma:*`) always use the pinned v5.22 from
`node_modules` and are unaffected by either warning.

### I actually want to upgrade to Prisma 7

Heads-up: Prisma 6+ removed `prisma.$use(...)` middleware in favour of
`prisma.$extends(...)`. Our soft-delete logic in
[src/service/db.ts](./src/service/db.ts) uses `$use`, so bumping the major
version is not a drop-in upgrade.

Rough plan if you decide to do it:

1. Bump `prisma` and `@prisma/client` to `^7` in `package.json`.
2. Create `Backend/prisma.config.ts`:
   ```ts
   import 'dotenv-flow/config'
   import { defineConfig } from 'prisma/config'

   export default defineConfig({
     schema: 'prisma/schema.prisma',
     // Prisma 7 reads DATABASE_URL from here instead of the datasource block.
     datasourceUrl: process.env.DATABASE_URL!
   })
   ```
3. Remove `url = env("DATABASE_URL")` from the `datasource db` block in
   `schema.prisma`.
4. In `src/service/db.ts`, pass the URL to the constructor and convert the
   soft-delete middleware from `$use` to `$extends`:
   ```ts
   const prisma = new PrismaClient({
     datasourceUrl: process.env.DATABASE_URL
   }).$extends({
     query: {
       $allModels: {
         async findMany({ model, args, query }) {
           if (SOFT_DELETE_MODELS.has(model)) {
             args.where = { deletedAt: null, ...args.where }
           }
           return query(args)
         }
         // same pattern for findFirst / findUnique / delete / deleteMany
       }
     }
   })
   ```
5. Run the full test suite + smoke-test payments and quizzes before merging.

Keep this as a **separate PR** from feature work.

---

## 20. Glossary

- **Tenant** — one customer institute. Has a unique `slug` (e.g. `acme-institute`).
- **Role** — `SUPER_ADMIN | ADMIN | TRAINER | STUDENT | COUNSELLOR | SUPPORT | CLIENT`.
- **JWT** — "JSON Web Token". A signed, base64 blob the client sends in `Authorization: Bearer <jwt>`.
- **Refresh token** — long-lived token in an httpOnly cookie, used to obtain fresh access tokens.
- **RBAC** — Role-Based Access Control. Our matrix is in `src/constant/policy.ts`.
- **Prisma** — ORM. Our models live in `prisma/schema.prisma`.
- **Migration** — a versioned SQL file that Prisma applies to evolve the DB schema.
- **Soft delete** — setting `deletedAt = now()` instead of `DELETE FROM ...`.
- **BullMQ job** — a message on a Redis-backed queue that a worker processes.
- **Webhook** — an inbound HTTP call from a 3rd party (e.g. Razorpay) to our server.
- **HMAC** — Keyed-hash Message Authentication Code. Proves a webhook came from the real sender.
- **Multer** — middleware that parses `multipart/form-data` (file uploads).
- **Zod** — runtime schema validator. `schema.safeParse(input)` returns `{ success, data, error }`.
- **Tenant isolation** — the rule that a request from tenant A must never see tenant B's rows.
- **Idempotency key** — a client-generated UUID that prevents double-processing a retried request.
- **Conventional Commits** — commit message format: `<type>(<scope>): <subject>`.

---

## Where to next?

- Read the main [README.md](./README.md) for the full API map.
- Open [Swagger UI](http://localhost:3000/api/v1/docs) and click around.
- Browse the code, starting at [src/server.ts](./src/server.ts) → [src/app.ts](./src/app.ts) → [src/router/apiRouter.ts](./src/router/apiRouter.ts).
- Skim one module end-to-end — `auth/` is a good first pick.
- Pick a P1 tracker item from [../LearnHub_Tracker_P1_to_P5.csv](../LearnHub_Tracker_P1_to_P5.csv) and write a PR.

Happy shipping. 🚀
