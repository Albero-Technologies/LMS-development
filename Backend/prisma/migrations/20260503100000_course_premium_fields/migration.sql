-- Course premium fields + lesson enrichment.
--
-- Course adds:
--   subtitle              short marketing tagline
--   heroUrl               wide hero image (separate from thumbnailUrl)
--   level                 BEGINNER / INTERMEDIATE / ADVANCED / ALL_LEVELS
--   language              ISO-639-1 code, free-form
--   outcomes / prerequisites / audience  long-form bullet arrays
--   enrolmentCap          optional max-students cap (null = unlimited)
--   startsAt / endsAt     enrolment window (enforced by public checkout)
--   certificateEnabled    issue verifiable cert on 100% completion
--   certificateTemplate   reserved for future template registry
--
-- Lesson adds:
--   freePreview           render outside paywall on the public detail page
--   resources             JSON array of {url, label?, type?} attachments
--
-- All defaults are backward-compatible: existing rows keep working with
-- ALL_LEVELS / 'en' / empty arrays / freePreview=false / resources=null.

CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

ALTER TABLE "courses"
  ADD COLUMN "subtitle"            TEXT,
  ADD COLUMN "heroUrl"             TEXT,
  ADD COLUMN "level"               "CourseLevel" NOT NULL DEFAULT 'ALL_LEVELS',
  ADD COLUMN "language"            TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN "outcomes"            TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "prerequisites"       TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "audience"            TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "enrolmentCap"        INTEGER,
  ADD COLUMN "startsAt"            TIMESTAMP(3),
  ADD COLUMN "endsAt"              TIMESTAMP(3),
  ADD COLUMN "certificateEnabled"  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "certificateTemplate" TEXT;

ALTER TABLE "lessons"
  ADD COLUMN "freePreview" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "resources"   JSONB;
