-- SECURITY: Add CHECK constraint to prevent negative stock
-- This provides database-level protection against accidental stock updates
ALTER TABLE "Product" ADD CONSTRAINT "Product_stock_check" CHECK ("stock" >= 0);
