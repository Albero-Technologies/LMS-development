-- Email delivery telemetry + password-reset (set-password) tokens.
--
--   email_logs            — one row per outbound email attempt; SENT / FAILED / SKIPPED.
--                           Surfaced in the admin "email troubleshooting" panel.
--   password_reset_tokens — single-use, hashed-stored tokens for "set your new
--                           password" CTAs (welcome email + forgot-password).

CREATE TYPE "EmailDeliveryStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

CREATE TABLE "email_logs" (
  "id"          TEXT PRIMARY KEY,
  "tenantId"    TEXT,
  "userId"      TEXT,
  "toEmail"     TEXT NOT NULL,
  "fromEmail"   TEXT NOT NULL,
  "replyTo"     TEXT,
  "subject"     TEXT NOT NULL,
  "template"    TEXT,
  "status"      "EmailDeliveryStatus" NOT NULL,
  "errorReason" TEXT,
  "messageId"   TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_logs_tenant_fk" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
);

CREATE INDEX "email_logs_tenant_createdAt_idx" ON "email_logs" ("tenantId", "createdAt");
CREATE INDEX "email_logs_toEmail_idx"          ON "email_logs" ("toEmail");

CREATE TABLE "password_reset_tokens" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "purpose"   TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_user_fk" FOREIGN KEY ("userId") REFERENCES "users"("id")
);

CREATE INDEX "password_reset_tokens_userId_idx"    ON "password_reset_tokens" ("userId");
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens" ("expiresAt");
