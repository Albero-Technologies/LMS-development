# Commit Message Conventions

This repo follows **Conventional Commits** with a lightweight body style. Keep messages short, imperative, and scoped to the area you touched.

---

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

- `<scope>` and `<body>` are optional. `<footer>` is optional.
- Wrap the body at ~72 columns.
- Use the imperative mood: *add*, *fix*, *remove* — not *added* / *fixes*.
- Keep the subject ≤ 72 characters, no trailing period, start lowercase after the colon.

---

## Types

| Type       | When to use                                                         |
| ---------- | ------------------------------------------------------------------- |
| `feat`     | A new user-visible feature or capability                            |
| `fix`      | A bug fix                                                           |
| `refactor` | Code change that neither adds a feature nor fixes a bug             |
| `perf`     | Performance improvement                                             |
| `chore`    | Tooling, configs, deps, CI — no runtime behavior change             |
| `docs`     | Documentation only                                                  |
| `test`     | Adding or updating tests only                                       |
| `style`    | Formatting, whitespace, lint fixes (no logic change)                |
| `build`    | Build system, bundler, Docker, package scripts                      |
| `ci`       | CI/CD workflow changes                                              |
| `revert`   | Reverts a previous commit                                           |

---

## Scopes

Use a scope when the change is localized to one area of the monorepo. Common scopes in this repo:

- `backend` — Express/Prisma API, workers, migrations
- `frontend` — React app, design system, routes
- `docker` — compose files, Dockerfiles
- `nginx` — edge config
- `ci` — GitHub Actions workflows
- `deps` — dependency bumps
- `db` — Prisma schema / migrations

Skip the scope when the change spans the whole repo (e.g. `feat: rename LearnHub to Albero Academy across the application`).

---

## Subject line rules

- One line, ≤ 72 chars.
- Imperative: `add`, `remove`, `update`, `fix`, `drop`.
- Lowercase the first word after the colon.
- No trailing period.
- Say *what* and *why* in spirit, not *how*. Details go in the body.

Good:
- `feat(backend): add COUNSELLING_MANAGER role, team reports, tasks`
- `fix(frontend): prevent theme flash on first paint`
- `refactor(backend): replace lead pipeline with counsellor onboarding`
- `chore: remove CodeQL workflow (Advanced Security not enabled)`

Avoid:
- `Updated some stuff.` (vague, past tense, period)
- `fix bug` (no context)
- `feat(frontend): Added a new page for the student fees section with routing and payment integration and bug fixes` (too long, mixes concerns)

---

## Body

Use the body for anything that doesn't fit in the subject. Prefer bullet points grouped by area.

- Each bullet is one concrete change.
- Group related bullets under a sub-heading (`Backend`, `Frontend`, `Infra`, `Docs`) when a commit spans multiple areas.
- Mention migration IDs, model names, route paths, and flags when relevant — future grep targets.
- Explain the *why* when the *what* is not self-evident.

Example:

```
feat(backend): add COUNSELLING_MANAGER role, team reports, tasks

- Add COUNSELLING_MANAGER role with User.managerId self-relation +
  employeeCode; managers can invite counsellors and write team targets.
- New counsellor-management module: team roster, assign-manager,
  individual + team reports, task CRUD.
- Add CounsellorTask model (status, priority, dueAt, completedAt) +
  indexes.
- Notifications: counsellor_signup_received, manager_signup_received,
  counsellor_task_assigned, counsellor_task_completed.
- Migration 20260419180000_counselling_manager_tasks; seed adds
  manager@acme.dev (CM-001) linking counsellor@acme.dev (C-1001).
```

---

## Footer

- `BREAKING CHANGE: <description>` — any backwards-incompatible change. Include migration notes.
- `Closes #123`, `Refs #456` — link issues / PRs.
- `Co-Authored-By: Name <email>` — when pair-programming or AI-assisted.

Example:

```
feat(backend): drop public /auth/register

BREAKING CHANGE: user creation now flows through super-admin tenant
creation, counsellor onboarding tokens, or admin invite only. Any
client calling POST /auth/register will receive 404.

Closes #42
```

---

## Scope vs. splitting commits

- **One logical change per commit.** If the subject needs an "and" or a semicolon chaining two unrelated things, split it.
- Exception: tightly coupled changes across layers (e.g. a Prisma migration + the route that uses it) belong in one commit.
- Refactors and feature work in the same file should still be separate commits when possible.

---

## Quick reference

```
feat(frontend): add student fees page and integrate with payments flow
fix(backend): prevent double-charge on Razorpay webhook retry
refactor(backend): replace lead pipeline with counsellor onboarding + payments
chore(deps): bump prisma from 7.1.0 to 7.2.0
docs: add commit conventions
ci: run frontend tests on ci-dev
build(docker): split Dockerfile.backend per env
perf(frontend): lazy-load course builder route
test(backend): cover counsellor target rollups
revert: feat(backend): add experimental fee waiver endpoint
```

---

## Pre-commit hooks

Husky runs lint-staged + guards on every commit (secret scan, `.env` block, `debugger`/`console` block, merge-conflict block). If a hook fails:

1. Fix the underlying issue.
2. Re-stage the fix.
3. Create a **new** commit — do not `--amend` after a failed hook, as the original commit never landed.
4. Never bypass with `--no-verify` unless explicitly agreed.
