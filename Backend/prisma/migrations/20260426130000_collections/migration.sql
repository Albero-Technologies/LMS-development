-- §11 Phase C — generic per-tenant CMS collections (Blog, Events, Press, etc).
-- Each Collection defines its own field schema; items store data as JSON.

CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "collections_tenantId_slug_key" ON "collections"("tenantId", "slug");

ALTER TABLE "collections"
    ADD CONSTRAINT "collections_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;


CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "collection_items_collectionId_slug_key" ON "collection_items"("collectionId", "slug");
CREATE INDEX "collection_items_tenantId_collectionId_published_idx" ON "collection_items"("tenantId", "collectionId", "published");

ALTER TABLE "collection_items"
    ADD CONSTRAINT "collection_items_collectionId_fkey"
    FOREIGN KEY ("collectionId") REFERENCES "collections"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
