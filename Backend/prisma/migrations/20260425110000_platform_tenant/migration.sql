-- §3.3 — Separate superadmin identity from any customer tenant.
-- Creates a dedicated "platform" tenant if missing and re-pegs every existing
-- SUPER_ADMIN user onto it. Idempotent: re-running on an already-migrated DB
-- leaves the platform tenant intact and the UPDATE matches zero rows.

INSERT INTO "tenants" ("id", "name", "slug", "plan", "status", "brandingColor", "settings", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'Albero Academy Platform', 'platform', 'ENTERPRISE', 'ACTIVE', '#0062ff', '{}'::jsonb, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "tenants" WHERE "slug" = 'platform');

UPDATE "users"
SET "tenantId" = (SELECT "id" FROM "tenants" WHERE "slug" = 'platform')
WHERE "role" = 'SUPER_ADMIN'
  AND "tenantId" <> (SELECT "id" FROM "tenants" WHERE "slug" = 'platform');

-- Rename historical SA emails (super@acme.dev, super@albero.academy) to the
-- platform-neutral address. The SA must not appear to belong to any tenant's
-- email domain. Skipped if the new address already exists (re-runs are safe).
UPDATE "users"
SET "email" = 'superadmin@albero.platform'
WHERE "role" = 'SUPER_ADMIN'
  AND "email" IN ('super@acme.dev', 'super@albero.academy')
  AND NOT EXISTS (
      SELECT 1 FROM "users" u2
      WHERE u2."email" = 'superadmin@albero.platform' AND u2."tenantId" = "users"."tenantId"
  );
