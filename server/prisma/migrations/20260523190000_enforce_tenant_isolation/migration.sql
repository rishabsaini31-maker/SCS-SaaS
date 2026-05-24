-- Database-level tenant isolation backstop.
-- These triggers prevent cross-tenant references and stop tenantId changes
-- after a row has been created.

CREATE OR REPLACE FUNCTION public.enforce_tenant_row_isolation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  related_tenant_id TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW."tenantId" IS DISTINCT FROM OLD."tenantId" THEN
    RAISE EXCEPTION 'tenant isolation violation';
  END IF;

  CASE TG_ARGV[0]
    WHEN 'product' THEN
      NULL;

    WHEN 'customer' THEN
      NULL;

    WHEN 'supplier' THEN
      NULL;

    WHEN 'invoice' THEN
      SELECT "tenantId" INTO related_tenant_id
      FROM "Customer"
      WHERE "id" = NEW."customerId";

      IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
        RAISE EXCEPTION 'tenant isolation violation';
      END IF;

    WHEN 'invoice_line_item' THEN
      SELECT "tenantId" INTO related_tenant_id
      FROM "Invoice"
      WHERE "id" = NEW."invoiceId";

      IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
        RAISE EXCEPTION 'tenant isolation violation';
      END IF;

      SELECT "tenantId" INTO related_tenant_id
      FROM "Product"
      WHERE "id" = NEW."productId";

      IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
        RAISE EXCEPTION 'tenant isolation violation';
      END IF;

    WHEN 'purchase' THEN
      SELECT "tenantId" INTO related_tenant_id
      FROM "Supplier"
      WHERE "id" = NEW."supplierId";

      IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
        RAISE EXCEPTION 'tenant isolation violation';
      END IF;

    WHEN 'purchase_line_item' THEN
      SELECT "tenantId" INTO related_tenant_id
      FROM "Purchase"
      WHERE "id" = NEW."purchaseId";

      IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
        RAISE EXCEPTION 'tenant isolation violation';
      END IF;

      IF NEW."productId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Product"
        WHERE "id" = NEW."productId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

    WHEN 'payment' THEN
      IF NEW."customerId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Customer"
        WHERE "id" = NEW."customerId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

      IF NEW."supplierId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Supplier"
        WHERE "id" = NEW."supplierId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

      IF NEW."invoiceId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Invoice"
        WHERE "id" = NEW."invoiceId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

      IF NEW."purchaseId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Purchase"
        WHERE "id" = NEW."purchaseId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

    WHEN 'ledger_entry' THEN
      IF NEW."customerId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Customer"
        WHERE "id" = NEW."customerId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

      IF NEW."supplierId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Supplier"
        WHERE "id" = NEW."supplierId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

      IF NEW."invoiceId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Invoice"
        WHERE "id" = NEW."invoiceId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

      IF NEW."purchaseId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Purchase"
        WHERE "id" = NEW."purchaseId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

      IF NEW."paymentId" IS NOT NULL THEN
        SELECT "tenantId" INTO related_tenant_id
        FROM "Payment"
        WHERE "id" = NEW."paymentId";

        IF related_tenant_id IS NULL OR related_tenant_id IS DISTINCT FROM NEW."tenantId" THEN
          RAISE EXCEPTION 'tenant isolation violation';
        END IF;
      END IF;

    WHEN 'tenant_setting' THEN
      NULL;

    WHEN 'user' THEN
      NULL;

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "Product_tenant_isolation" ON "Product";
CREATE TRIGGER "Product_tenant_isolation"
BEFORE INSERT OR UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('product');

DROP TRIGGER IF EXISTS "Customer_tenant_isolation" ON "Customer";
CREATE TRIGGER "Customer_tenant_isolation"
BEFORE INSERT OR UPDATE ON "Customer"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('customer');

DROP TRIGGER IF EXISTS "Supplier_tenant_isolation" ON "Supplier";
CREATE TRIGGER "Supplier_tenant_isolation"
BEFORE INSERT OR UPDATE ON "Supplier"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('supplier');

DROP TRIGGER IF EXISTS "Invoice_tenant_isolation" ON "Invoice";
CREATE TRIGGER "Invoice_tenant_isolation"
BEFORE INSERT OR UPDATE ON "Invoice"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('invoice');

DROP TRIGGER IF EXISTS "InvoiceLineItem_tenant_isolation" ON "InvoiceLineItem";
CREATE TRIGGER "InvoiceLineItem_tenant_isolation"
BEFORE INSERT OR UPDATE ON "InvoiceLineItem"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('invoice_line_item');

DROP TRIGGER IF EXISTS "Purchase_tenant_isolation" ON "Purchase";
CREATE TRIGGER "Purchase_tenant_isolation"
BEFORE INSERT OR UPDATE ON "Purchase"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('purchase');

DROP TRIGGER IF EXISTS "PurchaseLineItem_tenant_isolation" ON "PurchaseLineItem";
CREATE TRIGGER "PurchaseLineItem_tenant_isolation"
BEFORE INSERT OR UPDATE ON "PurchaseLineItem"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('purchase_line_item');

DROP TRIGGER IF EXISTS "Payment_tenant_isolation" ON "Payment";
CREATE TRIGGER "Payment_tenant_isolation"
BEFORE INSERT OR UPDATE ON "Payment"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('payment');

DROP TRIGGER IF EXISTS "LedgerEntry_tenant_isolation" ON "LedgerEntry";
CREATE TRIGGER "LedgerEntry_tenant_isolation"
BEFORE INSERT OR UPDATE ON "LedgerEntry"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('ledger_entry');

DROP TRIGGER IF EXISTS "TenantSetting_tenant_isolation" ON "TenantSetting";
CREATE TRIGGER "TenantSetting_tenant_isolation"
BEFORE INSERT OR UPDATE ON "TenantSetting"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('tenant_setting');

DROP TRIGGER IF EXISTS "User_tenant_isolation" ON "User";
CREATE TRIGGER "User_tenant_isolation"
BEFORE INSERT OR UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_row_isolation('user');