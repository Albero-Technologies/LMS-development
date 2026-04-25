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
