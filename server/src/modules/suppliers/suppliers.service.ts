import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "./suppliers.schema";

export const createSupplier = async (data: CreateSupplierInput) => {
  if (data.email) {
    const existing = await prisma.supplier.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new CustomError("Email already exists", 400);
  }

  if (data.gstin) {
    const existing = await prisma.supplier.findMany({
      where: { gstin: data.gstin },
    });
    if (existing.length > 0) throw new CustomError("GSTIN already exists", 400);
  }

  return prisma.supplier.create({ data });
};

export const getSupplier = async (id: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { purchases: true, ledgers: true },
  });
  if (!supplier) throw new CustomError("Supplier not found", 404);
  return supplier;
};

export const getSuppliers = async (filters?: {
  status?: string;
  search?: string;
}) => {
  return prisma.supplier.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
          { phone: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateSupplier = async (id: string, data: UpdateSupplierInput) => {
  await getSupplier(id);
  return prisma.supplier.update({
    where: { id },
    data,
  });
};

export const deleteSupplier = async (id: string) => {
  await getSupplier(id);
  return prisma.supplier.delete({ where: { id } });
};

export const getSupplierLedger = async (supplierId: string) => {
  const supplier = await getSupplier(supplierId);
  const ledgers = await prisma.ledgerEntry.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
  });
  return { supplier, ledgers };
};

export const getSupplierRecentItems = async (supplierId: string) => {
  // Group recent purchase line items by productId/productName for a supplier
  const grouped = await prisma.purchaseLineItem.groupBy({
    by: ["productId", "productName"],
    where: { purchase: { supplierId } },
    _max: { createdAt: true, unitPrice: true },
    _count: { _all: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: 20,
  });

  // fetch product names for productIds if available
  const productIds = grouped
    .map((g) => g.productId)
    .filter(Boolean) as string[];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, category: true },
      })
    : [];
  const productMap = new Map(
    products.map((p) => [p.id, { name: p.name, category: p.category || null }]),
  );

  return grouped.map((g) => ({
    productId: g.productId || null,
    productName:
      g.productName ||
      (g.productId ? productMap.get(g.productId)?.name || null : null),
    lastUnitPrice: g._max.unitPrice || null,
    count: g._count._all || 0,
    category: g.productId
      ? productMap.get(g.productId)?.category || null
      : null,
  }));
};
