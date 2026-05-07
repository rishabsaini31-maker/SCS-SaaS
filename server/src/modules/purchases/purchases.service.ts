import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreatePurchaseInput } from "./purchases.schema";

async function generatePurchaseNumber(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  if (!today) throw new CustomError("Date generation failed", 500);

  const todayStr = today.replace(/-/g, "");
  const count = await prisma.purchase.count({
    where: { purchaseNumber: { startsWith: `PUR-${todayStr}` } },
  });
  const seq = String(count + 1).padStart(5, "0");
  return `PUR-${todayStr}-${seq}`;
}

export const createPurchase = async (data: CreatePurchaseInput) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: data.supplierId },
  });
  if (!supplier) throw new CustomError("Supplier not found", 404);

  // validate provided productIds (if any)
  for (const item of data.lineItems) {
    if (item.productId) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product)
        throw new CustomError(`Product ${item.productId} not found`, 404);
    }
  }

  const purchase = await prisma.$transaction(async (tx) => {
    const purchaseNumber = await generatePurchaseNumber();

    let subtotal = 0;
    const lineItems: Array<{
      productId: string;
      productName: string;
      category: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      createdNewProduct: boolean;
    }> = [];
    for (const item of data.lineItems) {
      const totalPrice = item.unitPrice * item.quantity;
      subtotal += totalPrice;
      let product: {
        id: string;
        name: string;
        category: string | null;
      } | null = null;
      let createdNewProduct = false;

      if (item.productId) {
        product = await tx.product.findUnique({
          where: { id: item.productId },
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
          where: { name: { equals: manualName, mode: "insensitive" } },
          select: { id: true, name: true, category: true },
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              name: manualName,
              category: item.category || "General",
              purchasePrice: item.unitPrice,
              sellingPrice: item.unitPrice,
              gst: 0,
              stock: item.quantity,
              status: "active",
            },
            select: { id: true, name: true, category: true },
          });
          createdNewProduct = true;
        }
      }

      if (!createdNewProduct) {
        const productUpdates: {
          stock?: { increment: number };
          purchasePrice?: number;
          category?: string;
        } = {
          stock: { increment: item.quantity },
          purchasePrice: item.unitPrice,
        };

        if (item.category && !product.category) {
          productUpdates.category = item.category;
        }

        await tx.product.update({
          where: { id: product.id },
          data: productUpdates,
        });
      }

      lineItems.push({
        productId: product.id,
        productName: product.name,
        category: item.category || product.category || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        createdNewProduct,
      });
    }

    const gstAmount = subtotal * 0.18;
    const totalAmount = subtotal + gstAmount;

    const newPurchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        supplierId: data.supplierId,
        subtotal,
        gstAmount,
        totalAmount,
        status: data.status || "created",
        notes: data.notes,
      },
    });

    for (const item of lineItems) {
      await tx.purchaseLineItem.create({
        data: {
          purchaseId: newPurchase.id,
          productId: item.productId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      });
    }

    await tx.ledgerEntry.create({
      data: {
        supplierId: data.supplierId,
        purchaseId: newPurchase.id,
        type: "credit",
        amount: totalAmount,
        description: `Purchase ${purchaseNumber}`,
      },
    });

    await tx.supplier.update({
      where: { id: data.supplierId },
      data: { payableBalance: { increment: totalAmount } },
    });

    return newPurchase;
  });

  return getPurchase(purchase.id);
};

export const getPurchase = async (id: string) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      lineItems: { include: { product: true } },
      payments: true,
      ledger: true,
    },
  });
  if (!purchase) throw new CustomError("Purchase not found", 404);
  return purchase;
};

export const getPurchases = async (filters?: {
  supplierId?: string;
  status?: string;
}) => {
  return prisma.purchase.findMany({
    where: {
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

export const getPurchasesBySupplier = async (supplierId: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });
  if (!supplier) throw new CustomError("Supplier not found", 404);

  return prisma.purchase.findMany({
    where: { supplierId },
    include: {
      supplier: true,
      lineItems: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
