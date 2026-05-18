Multi-tenant migration plan (safe, incremental)

Overview

- Shared DB + Shared schema approach using `tenantId` for isolation.

Steps

1. Add `Tenant` table and nullable `tenantId` columns to major tables (done in Prisma schema).
2. Generate a migration from Prisma: `npx prisma migrate dev --name add-tenant-model` (do this in a dev environment first).
3. Create a default tenant row to own existing data:

   -- SQL example
   INSERT INTO "Tenant" ("id","businessName","ownerName","email","createdAt","updatedAt")
   VALUES (gen_random_uuid(), 'Default Business', 'Owner', 'default@example.com', now(), now());

4. Obtain the default tenant id and assign to existing records. Example SQL (Postgres):

   BEGIN;
   UPDATE "Product" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "Customer" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "Supplier" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "Invoice" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "InvoiceLineItem" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "Purchase" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "PurchaseLineItem" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "Payment" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   UPDATE "LedgerEntry" SET "tenantId" = '<DEFAULT_TENANT_ID>' WHERE "tenantId" IS NULL;
   COMMIT;

5. Verify application behavior (run tests, manual verification).
6. Once verified, update Prisma schema to make `tenantId` required and convert global unique constraints to tenant-scoped uniques (e.g., `@@unique([barcode, tenantId])`).
7. Generate and apply the final migration.

Notes

- Always run migrations and data updates on a staging clone first.
- Keep backups before mass-updating records.
- Do not trust tenantId from client; always derive from authenticated token on the server.
