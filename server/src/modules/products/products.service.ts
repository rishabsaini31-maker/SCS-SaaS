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

export const updateProduct = async (
  id: string,
  data: UpdateProductInput,
) => {
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
