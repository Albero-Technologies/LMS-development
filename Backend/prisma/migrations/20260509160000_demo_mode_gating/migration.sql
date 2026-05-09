-- DEMO mode access gating.
--
-- Adds a tri-state per enrolment: lifecycle status (existing) + access tier
-- (DEMO | FULL) + lesson-level overrides for trainers/admins.
--
-- Existing rows default to FULL so paid-up legacy enrolments keep their
-- access exactly as before. The public-purchase flow flips new
-- registration-fee rows to DEMO at write time.

CREATE TYPE "EnrollmentAccessTier" AS ENUM ('DEMO', 'FULL');

-- Course-level demo settings
ALTER TABLE "courses"
  ADD COLUMN "demoEnabled"       BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "demoLessonDefault" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "demoExpiryDays"    INTEGER;

-- Section-level demo flag — when true, every lesson in the section
-- inherits demo access (overridable per lesson).
ALTER TABLE "course_sections"
  ADD COLUMN "demoSection" BOOLEAN NOT NULL DEFAULT false;

-- Lesson-level demo flag — distinct from `freePreview` (anonymous
-- marketing-page preview); demoAccess gates DEMO-tier enrolments.
ALTER TABLE "lessons"
  ADD COLUMN "demoAccess" BOOLEAN NOT NULL DEFAULT false;

-- Enrolment: access tier + per-student overrides + manual-upgrade audit.
ALTER TABLE "enrollments"
  ADD COLUMN "accessTier"          "EnrollmentAccessTier" NOT NULL DEFAULT 'FULL',
  ADD COLUMN "demoLessonLimit"     INTEGER,
  ADD COLUMN "demoLessonAllowlist" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "demoExpiresAt"       TIMESTAMP(3),
  ADD COLUMN "manualUpgradeAt"     TIMESTAMP(3),
  ADD COLUMN "manualUpgradeReason" TEXT,
  ADD COLUMN "manualUpgradeById"   TEXT;

CREATE INDEX "enrollments_tenantId_accessTier_idx" ON "enrollments" ("tenantId", "accessTier");
