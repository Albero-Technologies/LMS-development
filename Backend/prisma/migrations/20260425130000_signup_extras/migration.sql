-- Counsellor onboarding form gained address + structured education/
-- professional/gap fields. Address is a flat column; the rest live in a
-- single `extra` JSON blob so the schema stays open-ended.

ALTER TABLE "student_signups"
    ADD COLUMN "address" TEXT,
    ADD COLUMN "extra" JSONB;
