-- Add COUNSELLING_MANAGER role -----------------------------------------------
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COUNSELLING_MANAGER' BEFORE 'COUNSELLOR';

-- Drop the legacy zoho field (no live consumers; webhook removed) ------------
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "zohoInvoiceId";

-- User: manager self-ref + employee code -------------------------------------
ALTER TABLE "users" ADD COLUMN "managerId" TEXT;
ALTER TABLE "users" ADD COLUMN "employeeCode" TEXT;
CREATE INDEX "users_tenantId_managerId_idx" ON "users"("tenantId", "managerId");
ALTER TABLE "users"
    ADD CONSTRAINT "users_managerId_fkey"
    FOREIGN KEY ("managerId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- New enums for tasks --------------------------------------------------------
CREATE TYPE "CounsellorTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE "CounsellorTaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- counsellor_tasks ----------------------------------------------------------
CREATE TABLE "counsellor_tasks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CounsellorTaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "CounsellorTaskPriority" NOT NULL DEFAULT 'NORMAL',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "counsellor_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "counsellor_tasks_tenantId_assigneeId_status_idx" ON "counsellor_tasks"("tenantId", "assigneeId", "status");
CREATE INDEX "counsellor_tasks_tenantId_createdById_idx" ON "counsellor_tasks"("tenantId", "createdById");

ALTER TABLE "counsellor_tasks"
    ADD CONSTRAINT "counsellor_tasks_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "counsellor_tasks"
    ADD CONSTRAINT "counsellor_tasks_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "counsellor_tasks"
    ADD CONSTRAINT "counsellor_tasks_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
