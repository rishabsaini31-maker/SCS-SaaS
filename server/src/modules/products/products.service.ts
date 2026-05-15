import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreateProductInput, UpdateProductInput } from "./products.schema";

export const createProduct = async (data: CreateProductInput) => {
  return prisma.product.create({
    data: {
      ...data,
      status: "active",
    },
  });
};

export const getProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product) throw new CustomError("Product not found", 404);
  return product;
};

export const getAllProducts = async (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) => {
  return prisma.product.findMany({
    where: {
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        name: { contains: filters.search, mode: "insensitive" },
      }),
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  await getProduct(id); // Verify exists
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  await getProduct(id); // Verify exists
  return prisma.product.delete({ where: { id } });
};

export const getProductsByIds = async (ids: string[]) => {
  return prisma.product.findMany({
    where: { id: { in: ids } },
  });
};

export const getLowStockProducts = async (threshold: number = 10) => {
  return prisma.product.findMany({
    where: {
      stock: { lte: threshold },
    },
    orderBy: { stock: "asc" },
  });
};

export const getProductSuggestions = async (query: string) => {
  const q = query.trim();
  if (!q) return [];

  const products = await prisma.product.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    take: 6,
    orderBy: { updatedAt: "desc" },
  });

  const manual = await prisma.purchaseLineItem.groupBy({
    by: ["productName"],
    where: { productName: { contains: q, mode: "insensitive" } },
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
      unitPrice: m._max.unitPrice || null,
      category: null,
    });
  }

  return suggestions.slice(0, 10);
};

export const activateProduct = async (id: string, sellingPrice: number) => {
  await getProduct(id); // Verify exists
  return prisma.product.update({
    where: { id },
    data: {
      sellingPrice,
      status: "active",
    },
  });
};
