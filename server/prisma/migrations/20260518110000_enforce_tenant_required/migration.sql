-- Run only after the backfill has completed successfully.

-- Ensure all records have tenantId populated first.
-- The application should use the `shop1` default tenant for all legacy data.

-- Make tenantId required on tables that are part of tenant isolation.
ALTER TABLE "Product" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Supplier" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "InvoiceLineItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Purchase" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "PurchaseLineItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "LedgerEntry" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE IF EXISTS "User" ALTER COLUMN "tenantId" SET NOT NULL;

-- Add tenant-scoped uniqueness and remove global uniqueness.
-- Some of these constraints may differ by naming conventions in your current DB;
-- adjust names if your existing database uses custom names.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_barcode_key";
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_invoiceNumber_key";
ALTER TABLE "Purchase" DROP CONSTRAINT IF EXISTS "Purchase_purchaseNumber_key";
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_paymentNumber_key";
ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "Customer_email_key";
ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "Customer_gstin_key";
ALTER TABLE "Supplier" DROP CONSTRAINT IF EXISTS "Supplier_email_key";
ALTER TABLE "Supplier" DROP CONSTRAINT IF EXISTS "Supplier_gstin_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Product_barcode_tenantId_key" ON "Product"("barcode", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_tenantId_key" ON "Invoice"("invoiceNumber", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_purchaseNumber_tenantId_key" ON "Purchase"("purchaseNumber", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_paymentNumber_tenantId_key" ON "Payment"("paymentNumber", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_tenantId_key" ON "Customer"("email", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_gstin_tenantId_key" ON "Customer"("gstin", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_email_tenantId_key" ON "Supplier"("email", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_gstin_tenantId_key" ON "Supplier"("gstin", "tenantId");
