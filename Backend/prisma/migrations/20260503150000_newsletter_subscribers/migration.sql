-- Newsletter subscribers — captured by the public marketing site (5173) and
-- managed per-tenant by ADMIN/SA in the dashboard.

CREATE TABLE "newsletter_subscribers" (
    "id"          TEXT PRIMARY KEY,
    "tenantId"    TEXT NOT NULL,
    "email"       TEXT NOT NULL,
    "name"        TEXT,
    "source"      TEXT NOT NULL DEFAULT 'website',
    "status"      TEXT NOT NULL DEFAULT 'active',
    "utmSource"   TEXT,
    "utmMedium"   TEXT,
    "utmCampaign" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscribers_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "newsletter_subscribers_tenantId_email_key"
    ON "newsletter_subscribers"("tenantId", "email");

CREATE INDEX "newsletter_subscribers_tenantId_createdAt_idx"
    ON "newsletter_subscribers"("tenantId", "createdAt");
