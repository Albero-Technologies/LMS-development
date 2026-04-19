-- Public website enquiries (leads). A student fills the enquiry form; we
-- create the row here and assign to the next counsellor via least-loaded
-- round-robin at the service layer. No user account is created.

-- CreateEnum
CREATE TYPE "EnquiryStage" AS ENUM ('NEW', 'DEMO_SCHEDULED', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "language" TEXT,
    "city" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "stage" "EnquiryStage" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiries_tenantId_stage_createdAt_idx" ON "enquiries"("tenantId", "stage", "createdAt");

-- CreateIndex
CREATE INDEX "enquiries_tenantId_assignedToId_stage_idx" ON "enquiries"("tenantId", "assignedToId", "stage");

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
