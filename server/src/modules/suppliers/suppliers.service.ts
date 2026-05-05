import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreateSupplierInput, UpdateSupplierInput } from "./suppliers.schema";

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

export const updateSupplier = async (
  id: string,
  data: UpdateSupplierInput,
) => {
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
