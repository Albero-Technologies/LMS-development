-- Enquiry form gained the same address + qualification + structured
-- education/professional/gap blocks the onboarding form already has.
-- Address / qualification are flat columns; the rest live in `extra` JSON.

ALTER TABLE "enquiries"
    ADD COLUMN "address" TEXT,
    ADD COLUMN "qualification" TEXT,
    ADD COLUMN "extra" JSONB;
