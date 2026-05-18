import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreateProductInput, UpdateProductInput } from "./products.schema";
import {
  assertTenantOwnership,
  tenantCreateData,
  tenantWhere,
} from "../../common/tenant/tenant.utils";

export const createProduct = async (
  data: CreateProductInput,
  tenantId?: string,
) => {
  return prisma.product.create({
    data: tenantCreateData(tenantId, {
      ...(data as any),
      status: "active",
    }) as any,
  });
};

export const getProduct = async (id: string, tenantId?: string) => {
  const product = await prisma.product.findFirst({
    where: tenantWhere(tenantId, { id }),
  });
  if (!product) throw new CustomError("Product not found", 404);
  assertTenantOwnership(tenantId, (product as any).tenantId, "Product");
  return product;
};

export const getAllProducts = async (
  filters?: {
    category?: string;
    status?: string;
    search?: string;
    barcode?: string;
  },
  tenantId?: string,
) => {
  return prisma.product.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.barcode && { barcode: filters.barcode }),
      ...(filters?.search && {
        name: { contains: filters.search, mode: "insensitive" },
      }),
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateProduct = async (
  id: string,
  data: UpdateProductInput,
  tenantId?: string,
) => {
  await getProduct(id, tenantId); // Verify exists and tenant
  return prisma.product.update({ where: { id }, data });
};

export const deleteProduct = async (id: string, tenantId?: string) => {
  await getProduct(id, tenantId); // Verify exists and tenant
  return prisma.product.delete({ where: { id } });
};

export const getProductsByIds = async (ids: string[], tenantId?: string) => {
  return prisma.product.findMany({
    where: tenantWhere(tenantId, { id: { in: ids } }),
  });
};

export const getLowStockProducts = async (
  threshold: number = 10,
  tenantId?: string,
) => {
  return prisma.product.findMany({
    where: {
      ...tenantWhere(tenantId),
      stock: { lte: threshold },
    },
    orderBy: { stock: "asc" },
  });
};

export const getProductSuggestions = async (
  query: string,
  tenantId?: string,
) => {
  const q = query.trim();
  if (!q) return [];

  const products = await prisma.product.findMany({
    where: tenantWhere(tenantId, {
      name: { contains: q, mode: "insensitive" },
    } as any),
    take: 6,
    orderBy: { updatedAt: "desc" },
  });

  const manual = await prisma.purchaseLineItem.groupBy({
    by: ["productName"],
    where: tenantWhere(tenantId, {
      productName: { contains: q, mode: "insensitive" },
    } as any),
    _max: { unitPrice: true, createdAt: true },
    _count: { _all: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: 10,
  });

  const suggestions: any[] = [];
  for (const p of products) {
    suggestions.push({
      label: p.name,
      productId: p.id,
      unitPrice: p.purchasePrice,
      category: p.category || null,
    });
  }
  for (const m of manual) {
    if (!m.productName) continue;
    if (
      suggestions.find(
        (s) => s.label.toLowerCase() === m.productName!.toLowerCase(),
      )
    )
      continue;
    suggestions.push({
      label: m.productName,
      productId: null,
      unitPrice: m._max?.unitPrice || null,
      category: null,
    });
  }

  return suggestions.slice(0, 10);
};

export const activateProduct = async (
  id: string,
  sellingPrice: number,
  tenantId?: string,
) => {
  await getProduct(id, tenantId); // Verify exists and tenant
  return prisma.product.update({
    where: { id },
    data: {
      sellingPrice,
      status: "active",
    },
  });
};
