## What does this PR do?

<!-- One or two sentences. Link the tracker item (e.g. P1-E1-01) if relevant. -->

## Why?

<!-- The business / product / technical motivation. Why now? -->

## Scope

- [ ] Backend (`Backend/`)
- [ ] Frontend (`Frontend/`)
- [ ] Infra / Docker / Nginx
- [ ] CI / workflows
- [ ] Docs / tracker only

## Tracker item(s)

<!-- e.g. P1-E3-01 Razorpay integration. Use "N/A" if not applicable. -->

## How was it tested?

- [ ] `npm test` passes locally
- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint --max-warnings=0 .` clean
- [ ] Manual smoke test (describe below)

<!-- Manual test steps -->

## Screenshots / recordings (UI only)

<!-- Drop before/after screenshots or a short loom. -->

## Database / Prisma migration?

- [ ] No DB changes
- [ ] Additive migration (safe to deploy before code)
- [ ] Non-additive migration (flag here — needs deploy ordering)

## Risk / rollback

<!-- What breaks if this is wrong? How do we roll back? -->

## Security considerations

- [ ] No new dependencies
- [ ] New dependencies reviewed via `npm audit`
- [ ] No new secrets / env vars (or `.env.example` updated)
- [ ] RBAC / tenant-isolation unaffected

## Checklist

- [ ] Follows Conventional Commits (e.g. `feat(auth): ...`)
- [ ] Branch targets `dev` → `uat` → `main` (never skip)
- [ ] CODEOWNERS reviewers assigned automatically
- [ ] Updated docs (README / OpenAPI / tracker) where needed
