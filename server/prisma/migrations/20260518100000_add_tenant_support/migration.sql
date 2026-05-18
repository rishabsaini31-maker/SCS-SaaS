-- Create Tenant table
CREATE TABLE IF NOT EXISTS "Tenant" (
  "id" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "ownerName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "gstNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_email_key" ON "Tenant"("email");

-- Add nullable tenantId columns to major tables
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "InvoiceLineItem" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "PurchaseLineItem" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "LedgerEntry" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- If a users table exists in the database, prepare it too.
ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Add useful indexes while keeping tenantId nullable for the initial rollout
CREATE INDEX IF NOT EXISTS "Product_tenantId_idx" ON "Product"("tenantId");
CREATE INDEX IF NOT EXISTS "Customer_tenantId_idx" ON "Customer"("tenantId");
CREATE INDEX IF NOT EXISTS "Supplier_tenantId_idx" ON "Supplier"("tenantId");
CREATE INDEX IF NOT EXISTS "Invoice_tenantId_idx" ON "Invoice"("tenantId");
CREATE INDEX IF NOT EXISTS "InvoiceLineItem_tenantId_idx" ON "InvoiceLineItem"("tenantId");
CREATE INDEX IF NOT EXISTS "Purchase_tenantId_idx" ON "Purchase"("tenantId");
CREATE INDEX IF NOT EXISTS "PurchaseLineItem_tenantId_idx" ON "PurchaseLineItem"("tenantId");
CREATE INDEX IF NOT EXISTS "Payment_tenantId_idx" ON "Payment"("tenantId");
CREATE INDEX IF NOT EXISTS "LedgerEntry_tenantId_idx" ON "LedgerEntry"("tenantId");
CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");

-- Foreign keys are added only after data backfill and when tenantId becomes required.
