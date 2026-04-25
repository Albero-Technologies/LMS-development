-- §11 Phase B — central media library so the website editor can list every
-- image/video the tenant has uploaded.

CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'media',
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_assets_tenantId_createdAt_idx" ON "media_assets"("tenantId", "createdAt");

ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
