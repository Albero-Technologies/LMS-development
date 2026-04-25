-- §4.4 + §10.2 — TenantPayment table for SaaS billing (platform → tenant).
-- Distinct from "Invoice" which the tenant uses to bill its own students.
-- Status flow: PENDING → PAID (or FAILED / CANCELLED / REFUNDED).
-- Razorpay handshake fields are nullable until an order is created.

CREATE TYPE "TenantPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

CREATE TABLE "tenant_payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "planLabel" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "description" TEXT,
    "status" "TenantPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gateway" "PaymentGateway" DEFAULT 'RAZORPAY',
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "createdById" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tenant_payments_tenantId_status_idx" ON "tenant_payments"("tenantId", "status");
CREATE INDEX "tenant_payments_tenantId_createdAt_idx" ON "tenant_payments"("tenantId", "createdAt");

ALTER TABLE "tenant_payments"
    ADD CONSTRAINT "tenant_payments_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
