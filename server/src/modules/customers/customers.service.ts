import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreateCustomerInput, UpdateCustomerInput } from "./customers.schema";

export const createCustomer = async (data: CreateCustomerInput) => {
  if (data.email) {
    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new CustomError("Email already exists", 400);
  }

  if (data.gstin) {
    const existing = await prisma.customer.findMany({
      where: { gstin: data.gstin },
    });
    if (existing.length > 0) throw new CustomError("GSTIN already exists", 400);
  }

  return prisma.customer.create({ data });
};

export const getCustomer = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { invoices: true, ledgers: true },
  });
  if (!customer) throw new CustomError("Customer not found", 404);
  return customer;
};

export const getCustomers = async (filters?: {
  status?: string;
  search?: string;
}) => {
  return prisma.customer.findMany({
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

export const updateCustomer = async (
  id: string,
  data: UpdateCustomerInput,
) => {
  const customer = await getCustomer(id);
  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const deleteCustomer = async (id: string) => {
  const customer = await getCustomer(id);
  return prisma.customer.delete({ where: { id } });
};

export const getCustomerLedger = async (customerId: string) => {
  const customer = await getCustomer(customerId);
  const ledgers = await prisma.ledgerEntry.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
  return { customer, ledgers };
};
