CREATE TABLE IF NOT EXISTS "TenantSetting" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "businessName" TEXT,
  "gstNumber" TEXT,
  "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
  "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TenantSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TenantSetting_tenantId_key" ON "TenantSetting"("tenantId");
CREATE INDEX IF NOT EXISTS "TenantSetting_tenantId_idx" ON "TenantSetting"("tenantId");

ALTER TABLE "TenantSetting"
  ADD CONSTRAINT "TenantSetting_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
