# Branching & Promotion Model

```
    dev  ── PR ──▶  uat  ── PR ──▶  main
    (no CI)        (ci-uat.yml)     (ci-main.yml)
   sandbox        soak / QA         production
```

## Branches

| Branch | Purpose | Pipeline | Who pushes |
| ------ | ------- | -------- | ---------- |
| `dev`  | Integration sandbox. Fast iteration, no CI on push (only pre-commit + pre-push hooks locally). | — | Any engineer |
| `uat`  | Production-equivalent build consumed by QA + product + friendly institutes. | `.github/workflows/ci-uat.yml` | Merge from `dev` via PR |
| `main` | Production. Every merge here = release candidate. | `.github/workflows/ci-main.yml` | Merge from `uat` via PR |

## Why no CI on `dev`?

- Dev is where half-finished work lives; blocking every commit on a full CI run
  slows the single-founder team to a crawl.
- Local husky hooks (`pre-commit`, `commit-msg`) still catch the
  fast-to-detect mistakes: secrets, console.log, bad commit messages.
- `pre-push` runs typecheck + tests before work leaves the laptop.
- By the time code reaches `uat`, it has already been soaked locally.

## Required branch protection (configure in repo settings)

### `main`
- Require PR before merge (1 approval minimum)
- Require `CI passed` status check from `ci-main.yml` + `CodeQL`
- Require branches to be up to date before merge
- Require linear history (no merge commits)
- Require signed commits (recommended)
- Disallow force-push + direct push
- Include administrators

### `uat`
- Require PR before merge (1 approval)
- Require `CI passed` from `ci-uat.yml`
- Allow force-push for designated release captain only

### `dev`
- No restrictions. (Optionally require `CodeQL` alerts to not regress.)

## Environments (Settings → Environments)

| Name | Required reviewers | Secrets |
| ---- | ------------------ | ------- |
| `production` | 1 senior engineer + tech lead | `DATABASE_URL_PROD`, `RENDER_DEPLOY_HOOK`, `SENTRY_AUTH_TOKEN` |
| `uat` | optional | `DATABASE_URL_UAT`, `RENDER_DEPLOY_HOOK_UAT`, `SENTRY_AUTH_TOKEN` |

## Commit message format

```
<type>(<scope>): <subject>

[optional body, wrapped at 120 chars]

[optional footer e.g. "Closes #123"]
```

**Allowed types:** `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `security`

**Recommended scopes:** `auth`, `users`, `tenants`, `courses`, `lessons`, `enrollments`, `payments`, `quizzes`, `batches`, `leads`, `tickets`, `notifications`, `dashboards`, `uploads`, `docs`, `webhooks`, `infra`, `docker`, `nginx`, `ci`, `deps`, `db`, `prisma`, `config`, `security`, `release`, `repo`

**Examples:**
- `feat(auth): add Google OAuth callback handler`
- `fix(payments): verify Razorpay signature with timing-safe compare`
- `ci(deps): bump docker/build-push-action to v6`
- `security(auth): bump bcrypt rounds to 12`
