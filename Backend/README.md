# LearnHub Backend — Phase 1 MVP

Express + TypeScript API server for LearnHub LMS, multi-tenant from day 0.

**Stack:** Node 20 · Express 5 · Prisma 5 · PostgreSQL (Neon) · Redis (Upstash) · BullMQ · Zod · Nodemailer · Razorpay · multer · swagger-ui-express · JWT · Winston · pino-http · prom-client · vitest + supertest.

**Observability (opt-in via docker-compose profile):** Prometheus · Loki · Promtail · Grafana. Start here → [MONITORING_OVERVIEW.md](./MONITORING_OVERVIEW.md) (the "what is this and why"). Deep dive → [OBSERVABILITY.md](./OBSERVABILITY.md) (queries, metrics catalog, troubleshooting).

---

## Phase 1 modules

| Module          | Epic   | Responsibilities                                                              |
| --------------- | ------ | ----------------------------------------------------------------------------- |
| `auth`          | E1     | Email/password, JWT rotation, invite acceptance                               |
| `tenants`       | E10    | Tenant create (SUPER_ADMIN), branding, settings                               |
| `users`         | E1     | User CRUD, role invites, 7-role policy                                        |
| `courses`       | E2     | Courses, sections, YouTube-embedded lessons, progress tracking                |
| `enrollments`   | E3     | Enrollment, Razorpay order + verify, Zoho Books webhook, refunds              |
| `quizzes`       | E4     | MCQ builder, auto-grading, timer, attempt cap                                 |
| `batches`       | E6     | Batch CRUD, assign/transfer students                                          |
| `leads`         | E7     | Kanban 4-stage pipeline, call logging, next-action                            |
| `tickets`       | E8     | Support tickets, assignment, internal comments                                |
| `notifications` | E9     | Nodemailer templates (welcome/enrollment/payment/ticket) via BullMQ           |
| `dashboards`    | E5     | Per-role stats + next-action list                                             |
| `uploads`       | E2+E10 | Multer file uploads (avatars, thumbnails, branding, attachments, assignments) |

---

## Security

- `helmet`, strict CORS tenant allowlist
- JWT access tokens (15 min) + httpOnly rotating refresh tokens (30 d)
- `tokenVersion` bump on password/role/status change invalidates all sessions
- bcrypt (12 rounds) password hashing
- Per-email login rate limit (5/15 min), global per-IP rate limit — via Redis
- HMAC webhook signature verification (Razorpay, Zoho)
- Prisma soft-delete middleware; `tenant_id` filter enforced in every service
- Structured JSON logs via `pino-http` with request-id + tenantId correlation
- Pre-commit secret scan + `.env` block + debugger/console guard
- CodeQL + gitleaks + Trivy image scan in CI

---

## Getting started

```bash
# 1. Install deps
npm install

# 2. Create .env (see .env.example)
cp .env.example .env

# 3. Generate Prisma client + run migrations
npm run prisma:generate
npm run prisma:migrate:dev

# 4. Seed demo tenant + 7 role users + sample course/quiz
npm run prisma:seed

# 5. Start API + notification worker
npm run dev
# In another terminal:
npm run worker:dev
```

### Seeded login (dev only)

```
Tenant slug: acme-institute
Password:    Password123
Users:       super@albero.academy, admin@albero.academy, trainer@albero.academy,
             student@albero.academy, counsellor@albero.academy, manager@albero.academy,
             support@albero.academy, client@albero.academy
```

### Docker Compose (full stack: Postgres + Redis + API + Worker + Web + Nginx)

The compose files moved to the **repo root** so one stack runs backend + frontend
together. Run from the repo root:

```bash
docker compose -f docker/development/docker-compose.yml up --build
# Edge:      http://localhost:8080/            → frontend SPA
#            http://localhost:8080/api/v1/*    → backend API
# Direct:    http://localhost:3000/api/v1/     → backend
#            http://localhost:5173/            → frontend
```

Data-plane only (when running `npm run dev` on the host):

```bash
docker compose -f docker/development/docker-compose.yml up -d postgres redis
```

---

## API docs — Swagger / OpenAPI

| URL                                         | Purpose                         |
| ------------------------------------------- | ------------------------------- |
| `http://localhost:3000/api/v1/docs`         | Swagger UI (try-it-out enabled) |
| `http://localhost:3000/api/v1/openapi.json` | Raw OpenAPI 3.1 JSON            |
| `http://localhost:8080/api/v1/docs`         | Same, via Nginx reverse proxy   |
| `https://api.learnhub.in/api/v1/docs`       | Production (post-deploy)        |

---

## Testing

```bash
npm test              # vitest run (one-shot)
npm run test:watch    # vitest watch mode
npm run test:coverage # + v8 coverage → coverage/
```

The `test/` folder contains:

| Folder           | Covers                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `test/util/`     | password hashing, JWT sign/verify, AppError, error-object shape                                     |
| `test/rbac/`     | 12-module × 7-role policy matrix integrity                                                          |
| `test/schemas/`  | Zod validation for auth, course, enrollment inputs                                                  |
| `test/payments/` | Razorpay HMAC signature verification                                                                |
| `test/docs/`     | OpenAPI spec integrity (every Phase 1 path documented)                                              |
| `test/app/`      | supertest smoke: `/health`, `/self`, `/metrics`, `/openapi.json`, `/docs`, 401/400/404, webhook sig |
| `test/uploads/`  | multer public-URL rewrite                                                                           |

---

## Code quality

### Husky hooks (auto-installed via `npm run prepare`)

- **`pre-commit`** — secret scan, `.env` guard, debugger/console guard, merge-conflict marker check, `lint-staged` (ESLint + Prettier on staged files only). Escape: `HUSKY_ALLOW_WIP=1 git commit ...`
- **`commit-msg`** — commitlint (Conventional Commits). Skips merge/revert/fixup commits.

### ESLint (strict, type-aware)

`src/` runs under `recommendedTypeChecked` + `stylisticTypeChecked` with:

- `no-console` error (allows `.warn` / `.error` only)
- `@typescript-eslint/no-floating-promises` error
- `@typescript-eslint/no-misused-promises` error
- `@typescript-eslint/no-explicit-any` error
- `@typescript-eslint/no-non-null-assertion` error
- `eqeqeq`, `prefer-template`, `object-shorthand` errors

Relaxed profiles for `test/` and `prisma/seed.ts`.

### Conventional Commits (commitlint)

```
<type>(<scope>): <subject>
```

- **Types:** `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `security`
- **Scopes (warn-only):** `auth`, `users`, `tenants`, `courses`, `lessons`, `enrollments`, `payments`, `quizzes`, `batches`, `leads`, `tickets`, `notifications`, `dashboards`, `uploads`, `docs`, `webhooks`, `infra`, `docker`, `nginx`, `ci`, `deps`, `db`, `prisma`, `config`, `security`, `release`, `repo`
- Subject: 5–80 chars, no trailing period, not PascalCase/UPPER-CASE
- Example: `feat(auth): rotate refresh tokens on every refresh`

---

## CI/CD

Pipelines live at the **repository root** under `.github/workflows/`:

| Workflow               | Triggers                                | What it does                                                                                                                                                                                              |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci-main.yml`          | push + PR to `main`                     | commitlint · gitleaks · CodeQL · backend + frontend gate · npm audit · Trivy image scan · Docker build → GHCR (`production-*` tags) · Prisma migrate deploy · Render deploy · Sentry release · smoke test |
| `ci-uat.yml`           | push + PR to `uat`                      | Same quality gates + Docker build (`uat-*` tags) + auto-deploy to UAT                                                                                                                                     |
| `codeql.yml`           | push/PR to `main` + `uat` + weekly cron | Static analysis, security-extended queries                                                                                                                                                                |
| `_backend-checks.yml`  | reusable                                | typecheck + eslint + prettier + vitest + coverage                                                                                                                                                         |
| `_frontend-checks.yml` | reusable                                | typecheck + eslint + prettier + vitest + vite build                                                                                                                                                       |
| `_docker-build.yml`    | reusable                                | Multi-arch build (amd64+arm64), SBOM, Trivy scan, GHCR push                                                                                                                                               |

The `dev` branch **has no pipeline** — fast iteration. Local husky hooks + pre-push are the safety net.

See [../.github/BRANCHING.md](../.github/BRANCHING.md) for the full promotion flow and required branch-protection rules.

---

## API map (v1)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/invites/accept
GET    /api/v1/auth/me

POST   /api/v1/tenants                      (SUPER_ADMIN)
GET    /api/v1/tenants/me
PATCH  /api/v1/tenants/me

GET    /api/v1/users
POST   /api/v1/users/invites
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/courses
POST   /api/v1/courses
GET    /api/v1/courses/:id
PATCH  /api/v1/courses/:id
DELETE /api/v1/courses/:id
POST   /api/v1/courses/:id/sections
POST   /api/v1/courses/:id/lessons
PATCH  /api/v1/courses/:id/lessons/:lessonId
POST   /api/v1/courses/:id/lessons/:lessonId/progress

POST   /api/v1/enrollments
POST   /api/v1/enrollments/verify-payment
GET    /api/v1/enrollments/mine
GET    /api/v1/enrollments                  (admin)

POST   /api/v1/quizzes
GET    /api/v1/quizzes/:id
PATCH  /api/v1/quizzes/:id
POST   /api/v1/quizzes/:id/attempts
POST   /api/v1/quizzes/attempts/:attemptId/submit
GET    /api/v1/quizzes/attempts/mine

GET    /api/v1/batches
POST   /api/v1/batches
POST   /api/v1/batches/:id/students
POST   /api/v1/batches/:id/transfer

GET    /api/v1/leads
POST   /api/v1/leads
POST   /api/v1/leads/:id/stage
POST   /api/v1/leads/:id/interactions

GET    /api/v1/tickets
POST   /api/v1/tickets
PATCH  /api/v1/tickets/:id
POST   /api/v1/tickets/:id/comments

GET    /api/v1/notifications
POST   /api/v1/notifications/:id/read

GET    /api/v1/dashboard/me

POST   /api/v1/uploads/avatars              (multer: 2MB image)
POST   /api/v1/uploads/course-thumbnails    (multer: 5MB image)
POST   /api/v1/uploads/branding             (multer: 2MB image)
POST   /api/v1/uploads/ticket-attachments   (multer: 5 files, 10MB each, any type)
POST   /api/v1/uploads/assignments          (multer: 25MB doc)

POST   /api/v1/webhooks/razorpay            (raw body, HMAC verified)
POST   /api/v1/webhooks/zoho-books          (shared-secret verified)

GET    /api/v1/health                       (DB + system)
GET    /api/v1/metrics                      (Prometheus exposition — default Node metrics + HTTP RED + domain counters)
GET    /api/v1/docs                         (Swagger UI)
GET    /api/v1/openapi.json                 (raw OpenAPI)
```

---

## Environment

See `.env.example`. Required in production: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODEMAILER_MAIL`, `NODEMAILER_PASS`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.

---

## Phase 1 exit gate coverage

| AC                                           | Covered by                                                 |
| -------------------------------------------- | ---------------------------------------------------------- |
| AC-1 (institute onboarding < 1 hour)         | `POST /tenants` + `POST /users/invites` + invite-accept    |
| AC-2 (per-role dashboards)                   | `GET /dashboard/me` returns per-role stats + next actions  |
| AC-3 (pay + invoice)                         | Razorpay + Zoho Books webhook writes `pdfUrl` to Invoice   |
| AC-4 (3-lesson course + 10-Q quiz)           | Course + Section + Lesson + Quiz endpoints                 |
| AC-5 (4-stage lead kanban + call logs)       | Lead module + interactions                                 |
| AC-6 (ticket open/assign/resolve + internal) | Ticket module with internal comments                       |
| AC-7 (cross-tenant 4xx)                      | `tenantId` filter in every service + `assertSameTenant`    |
| AC-8 (typecheck/lint/unit/Playwright)        | `ci-main.yml` + `ci-uat.yml` run typecheck + lint + vitest |
