-- Pricing tiers + payment methods + counsellor-driven offline payment requests.
--
-- Course gains:
--   priceTiers              JSONB array of tier objects (key, label, priceMinor, …).
--                           Empty array means the legacy single-price flow applies.
--   registrationFeeMinor    Per-course override of the tenant default reservation fee.
--
-- Invoice gains:
--   paymentMethod  ONLINE | EMI | CASH — how the student paid.
--   paymentNote    Free-form audit note (e.g. "Cash collected at branch", "EMI 3 of 6").
--
-- New PaymentRequest model — counsellors submit, admins approve.

CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'EMI', 'CASH');
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

ALTER TABLE "courses"
  ADD COLUMN "priceTiers"            JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "registrationFeeMinor"  INTEGER;

ALTER TABLE "invoices"
  ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN "paymentNote"   TEXT;

CREATE TABLE "payment_requests" (
  "id"               TEXT PRIMARY KEY,
  "tenantId"         TEXT NOT NULL,
  "invoiceId"        TEXT,
  "requestedById"    TEXT NOT NULL,
  "studentId"        TEXT NOT NULL,
  "method"           "PaymentMethod" NOT NULL,
  "amountMinor"      INTEGER NOT NULL,
  "currency"         TEXT NOT NULL DEFAULT 'INR',
  "note"             TEXT,
  "emiTotal"         INTEGER,
  "emiSequence"      INTEGER,
  "status"           "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerId"       TEXT,
  "reviewedAt"       TIMESTAMP(3),
  "rejectionReason"  TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  "deletedAt"        TIMESTAMP(3),
  CONSTRAINT "payment_requests_tenant_fk"        FOREIGN KEY ("tenantId")      REFERENCES "tenants"("id"),
  CONSTRAINT "payment_requests_invoice_fk"       FOREIGN KEY ("invoiceId")     REFERENCES "invoices"("id"),
  CONSTRAINT "payment_requests_requestedBy_fk"   FOREIGN KEY ("requestedById") REFERENCES "users"("id"),
  CONSTRAINT "payment_requests_student_fk"       FOREIGN KEY ("studentId")     REFERENCES "users"("id"),
  CONSTRAINT "payment_requests_reviewer_fk"      FOREIGN KEY ("reviewerId")    REFERENCES "users"("id")
);

CREATE INDEX "payment_requests_tenant_status_idx"      ON "payment_requests" ("tenantId", "status");
CREATE INDEX "payment_requests_tenant_requestedBy_idx" ON "payment_requests" ("tenantId", "requestedById");
CREATE INDEX "payment_requests_tenant_student_idx"    ON "payment_requests" ("tenantId", "studentId");
