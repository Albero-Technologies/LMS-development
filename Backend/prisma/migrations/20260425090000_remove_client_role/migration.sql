-- Phase 2 §5.1 — Remove the CLIENT role.
-- ADMIN is now the canonical tenant-owner role; the prior B2B/parent-account
-- distinction was redundant and added permission noise. Existing CLIENT users
-- are remapped to ADMIN so they keep access to their tenant data.
--
-- Postgres does not support dropping a single enum value, so we cast the
-- column to TEXT, drop and recreate the enum without CLIENT, and cast back.

BEGIN;

-- 1. Remap any rows still on the deprecated value.
UPDATE "User" SET "role" = 'ADMIN' WHERE "role" = 'CLIENT';
UPDATE "Invite" SET "role" = 'ADMIN' WHERE "role" = 'CLIENT';

-- 2. Detach columns from the enum so we can drop it.
ALTER TABLE "User" ALTER COLUMN "role" TYPE TEXT USING "role"::text;
ALTER TABLE "Invite" ALTER COLUMN "role" TYPE TEXT USING "role"::text;

DROP TYPE "Role";

CREATE TYPE "Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'TRAINER',
    'STUDENT',
    'COUNSELLING_MANAGER',
    'COUNSELLOR',
    'SUPPORT'
);

-- 3. Reattach columns to the new enum.
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";
ALTER TABLE "Invite" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";

COMMIT;
