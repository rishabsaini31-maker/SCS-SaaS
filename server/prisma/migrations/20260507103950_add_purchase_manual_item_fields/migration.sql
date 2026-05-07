-- DropForeignKey
ALTER TABLE "PurchaseLineItem" DROP CONSTRAINT "PurchaseLineItem_productId_fkey";

-- AlterTable
ALTER TABLE "PurchaseLineItem" ADD COLUMN     "productName" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseLineItem" ADD CONSTRAINT "PurchaseLineItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
