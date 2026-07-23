import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type {
  CreatePurchaseInput,
  UpdatePurchaseInput,
} from "./purchases.schema";
import {
  assertTenantOwnership,
  tenantCreateData,
  tenantWhere,
} from "../../common/tenant/tenant.utils";
import { runSerializableTransaction } from "../../common/db/transaction";

type PurchaseNumberClient = {
  purchase: {
    count: any;
  };
};

async function generatePurchaseNumber(
  tenantId?: string,
  tx: PurchaseNumberClient = prisma as any,
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  if (!today) throw new CustomError("Date generation failed", 500);

  const todayStr = today.replace(/-/g, "");
  const count = await tx.purchase.count({
    where: tenantWhere(tenantId, {
      purchaseNumber: { startsWith: `PUR-${todayStr}` },
    }),
  });
  const seq = String(count + 1).padStart(5, "0");
  return `PUR-${todayStr}-${seq}`;
}

export const createPurchase = async (
  data: CreatePurchaseInput,
  tenantId?: string,
) => {
  const supplier = await prisma.supplier.findFirst({
    where: tenantWhere(tenantId, { id: data.supplierId }),
  });
  if (!supplier) throw new CustomError("Supplier not found", 404);

  for (const item of data.lineItems) {
    if (item.productId) {
      const product = await prisma.product.findFirst({
        where: tenantWhere(tenantId, { id: item.productId }),
      });
      if (!product) {
        throw new CustomError(`Product ${item.productId} not found`, 404);
      }
    }
  }

  const purchase = await runSerializableTransaction(async (tx) => {
    const purchaseNumber = await generatePurchaseNumber(tenantId, tx);

    const processedItems = await Promise.all(
      data.lineItems.map(async (item) => {
        const totalPrice = item.unitPrice * item.quantity;
        let product: {
          id: string;
          name: string;
          category: string | null;
        } | null = null;
        let createdNewProduct = false;

        if (item.productId) {
          product = await tx.product.findFirst({
            where: tenantWhere(tenantId, { id: item.productId }),
            select: { id: true, name: true, category: true },
          });
          if (!product) {
            throw new CustomError(`Product ${item.productId} not found`, 404);
          }
        } else {
          const manualName = item.productName?.trim();
          if (!manualName) {
            throw new CustomError("Product name is required", 400);
          }

          product = await tx.product.findFirst({
            where: tenantWhere(tenantId, {
              name: { equals: manualName, mode: "insensitive" },
            } as any),
            select: { id: true, name: true, category: true },
          });

          if (!product) {
            // Check again safely within concurrent execution context or handle unique errors if necessary
            // For general usage, assume parallel creation of unique items is safe.
            product = await tx.product.create({
              data: tenantCreateData(tenantId, {
                name: manualName,
                category: item.category || "General",
                purchasePrice: item.unitPrice,
                sellingPrice: 0,
                gst: 0,
                stock: item.quantity,
                status: "pending",
              }) as any,
              select: { id: true, name: true, category: true },
            });
            createdNewProduct = true;
          }
        }

        const selectedProduct = product!;

        if (!createdNewProduct) {
          const productUpdates: {
            stock?: { increment: number };
            purchasePrice?: number;
            category?: string;
          } = {
            stock: { increment: item.quantity },
            purchasePrice: item.unitPrice,
          };

          if (item.category && !selectedProduct.category) {
            productUpdates.category = item.category;
          }

          await tx.product.update({
            where: { id: selectedProduct.id },
            data: productUpdates,
          });
        }

        return {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          category: item.category || selectedProduct.category || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          createdNewProduct,
        };
      })
    );

    let subtotal = 0;
    const lineItems: typeof processedItems = [];
    for (const p of processedItems) {
      subtotal += p.totalPrice;
      lineItems.push(p);
    }

    const gstRate = data.gstRate !== undefined ? data.gstRate : 18;
    const gstAmount = subtotal * (gstRate / 100);
    const totalAmount = subtotal + gstAmount;

    const newPurchase = await tx.purchase.create({
      data: tenantCreateData(tenantId, {
        purchaseNumber,
        supplierId: data.supplierId,
        subtotal,
        gstAmount,
        totalAmount,
        status: data.status || "created",
        notes: data.notes,
      }) as any,
    });

    const purchaseLineItemsData = lineItems.map(item => tenantCreateData(tenantId, {
      purchaseId: newPurchase.id,
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }) as any);

    await tx.purchaseLineItem.createMany({
      data: purchaseLineItemsData,
    });

    await tx.ledgerEntry.create({
      data: tenantCreateData(tenantId, {
        supplierId: data.supplierId,
        purchaseId: newPurchase.id,
        type: "credit",
        amount: totalAmount,
        description: `Purchase ${purchaseNumber}`,
      }) as any,
    });

    await tx.supplier.update({
      where: { id: data.supplierId },
      data: { payableBalance: { increment: totalAmount } },
    });

    return newPurchase;
  });

  return getPurchase(purchase.id, tenantId);
};

export const getPurchase = async (id: string, tenantId?: string) => {
  const purchase = await prisma.purchase.findFirst({
    where: tenantWhere(tenantId, { id }),
    include: {
      supplier: true,
      lineItems: { include: { product: true } },
      payments: true,
      ledger: true,
    },
  });
  if (!purchase) throw new CustomError("Purchase not found", 404);
  assertTenantOwnership(tenantId, (purchase as any).tenantId, "Purchase");
  return purchase;
};

export const getPurchases = async (
  filters?: {
    supplierId?: string;
    status?: string;
  },
  tenantId?: string,
) => {
  return prisma.purchase.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(filters?.supplierId && { supplierId: filters.supplierId }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      supplier: true,
      lineItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updatePurchase = async (
  id: string,
  data: UpdatePurchaseInput,
  tenantId?: string,
) => {
  await getPurchase(id, tenantId);
  const result = await prisma.purchase.updateMany({
    where: tenantWhere(tenantId, { id }),
    data,
  });
  if (result.count !== 1) throw new CustomError("Purchase not found", 404);
  return getPurchase(id, tenantId);
};

export const getPurchasesBySupplier = async (
  supplierId: string,
  tenantId?: string,
) => {
  const supplier = await prisma.supplier.findFirst({
    where: tenantWhere(tenantId, { id: supplierId }),
  });
  if (!supplier) throw new CustomError("Supplier not found", 404);

  return prisma.purchase.findMany({
    where: tenantWhere(tenantId, { supplierId }),
    include: {
      supplier: true,
      lineItems: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
