import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "./customers.schema";
import {
  assertTenantOwnership,
  tenantCreateData,
  tenantWhere,
} from "../../common/tenant/tenant.utils";

export const createCustomer = async (
  data: CreateCustomerInput,
  tenantId?: string,
) => {
  if (data.email) {
    const existing = await prisma.customer.findFirst({
      where: tenantWhere(tenantId, { email: data.email }),
    });
    if (existing) throw new CustomError("Email already exists", 400);
  }

  if (data.gstin) {
    const existing = await prisma.customer.findFirst({
      where: tenantWhere(tenantId, { gstin: data.gstin }),
    });
    if (existing) throw new CustomError("GSTIN already exists", 400);
  }

  return prisma.customer.create({
    data: tenantCreateData(tenantId, data) as any,
  });
};

export const getCustomer = async (id: string, tenantId?: string) => {
  const customer = await prisma.customer.findFirst({
    where: tenantWhere(tenantId, { id }),
    include: { invoices: true, ledgers: true },
  });
  if (!customer) throw new CustomError("Customer not found", 404);
  assertTenantOwnership(tenantId, (customer as any).tenantId, "Customer");
  return customer;
};

export const getCustomers = async (
  filters?: {
    status?: string;
    search?: string;
  },
  tenantId?: string,
) => {
  return prisma.customer.findMany({
    where: {
      ...tenantWhere(tenantId),
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
  tenantId?: string,
) => {
  await getCustomer(id, tenantId);
  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const deleteCustomer = async (id: string, tenantId?: string) => {
  await getCustomer(id, tenantId);
  return prisma.customer.delete({ where: { id } });
};

export const getCustomerLedger = async (
  customerId: string,
  tenantId?: string,
) => {
  const customer = await getCustomer(customerId, tenantId);
  const ledgers = await prisma.ledgerEntry.findMany({
    where: tenantWhere(tenantId, { customerId }),
    orderBy: { createdAt: "desc" },
  });
  return { customer, ledgers };
};
