-- Drop legacy lead pipeline -------------------------------------------------

ALTER TABLE "lead_interactions" DROP CONSTRAINT IF EXISTS "lead_interactions_leadId_fkey";
ALTER TABLE "lead_interactions" DROP CONSTRAINT IF EXISTS "lead_interactions_userId_fkey";
ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_tenantId_fkey";
ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_assignedToId_fkey";
ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_createdById_fkey";

DROP TABLE IF EXISTS "lead_interactions";
DROP TABLE IF EXISTS "leads";
DROP TYPE IF EXISTS "LeadStage";
DROP TYPE IF EXISTS "LeadInteractionType";

-- New enums ------------------------------------------------------------------

CREATE TYPE "CounsellorInviteStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');
CREATE TYPE "StudentSignupStatus" AS ENUM ('CREATED', 'CREDS_SHARED', 'ENROLLED');

-- Track counsellor attribution on enrolments --------------------------------

ALTER TABLE "enrollments" ADD COLUMN "counsellorId" TEXT;
CREATE INDEX "enrollments_tenantId_counsellorId_idx" ON "enrollments"("tenantId", "counsellorId");

-- counsellor_invite_links ---------------------------------------------------

CREATE TABLE "counsellor_invite_links" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "counsellorId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "label" TEXT,
    "courseId" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CounsellorInviteStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "counsellor_invite_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "counsellor_invite_links_token_key" ON "counsellor_invite_links"("token");
CREATE INDEX "counsellor_invite_links_tenantId_counsellorId_idx" ON "counsellor_invite_links"("tenantId", "counsellorId");
CREATE INDEX "counsellor_invite_links_token_idx" ON "counsellor_invite_links"("token");

ALTER TABLE "counsellor_invite_links" ADD CONSTRAINT "counsellor_invite_links_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "counsellor_invite_links" ADD CONSTRAINT "counsellor_invite_links_counsellorId_fkey" FOREIGN KEY ("counsellorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "counsellor_invite_links" ADD CONSTRAINT "counsellor_invite_links_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- student_signups -----------------------------------------------------------

CREATE TABLE "student_signups" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "inviteLinkId" TEXT NOT NULL,
    "counsellorId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "city" TEXT,
    "state" TEXT,
    "qualification" TEXT,
    "interest" TEXT,
    "notes" TEXT,
    "initialPassword" TEXT,
    "status" "StudentSignupStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_signups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_signups_userId_key" ON "student_signups"("userId");
CREATE INDEX "student_signups_tenantId_counsellorId_idx" ON "student_signups"("tenantId", "counsellorId");

ALTER TABLE "student_signups" ADD CONSTRAINT "student_signups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_signups" ADD CONSTRAINT "student_signups_inviteLinkId_fkey" FOREIGN KEY ("inviteLinkId") REFERENCES "counsellor_invite_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_signups" ADD CONSTRAINT "student_signups_counsellorId_fkey" FOREIGN KEY ("counsellorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_signups" ADD CONSTRAINT "student_signups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- counsellor_targets --------------------------------------------------------

CREATE TABLE "counsellor_targets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "counsellorId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "targetSignups" INTEGER NOT NULL DEFAULT 0,
    "targetEnrolments" INTEGER NOT NULL DEFAULT 0,
    "targetRevenue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counsellor_targets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "counsellor_targets_tenantId_counsellorId_periodStart_key" ON "counsellor_targets"("tenantId", "counsellorId", "periodStart");

ALTER TABLE "counsellor_targets" ADD CONSTRAINT "counsellor_targets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "counsellor_targets" ADD CONSTRAINT "counsellor_targets_counsellorId_fkey" FOREIGN KEY ("counsellorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
