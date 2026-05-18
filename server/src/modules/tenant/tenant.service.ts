import prisma from "../../common/db/prisma";
import type { CreateTenantInput } from "./tenant.schema";

export const createTenant = async (data: CreateTenantInput) => {
  return (prisma as any).tenant.create({ data });
};

export const getTenants = async () => {
  return (prisma as any).tenant.findMany({ orderBy: { createdAt: "desc" } });
};

export const getTenantById = async (id: string) => {
  return (prisma as any).tenant.findUnique({ where: { id } });
};
