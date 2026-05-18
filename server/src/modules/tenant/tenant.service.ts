import prisma from "../../common/db/prisma";
import { hashPassword } from "../../common/utils/password";
import type { CreateTenantInput } from "./tenant.schema";

export const createTenant = async (data: CreateTenantInput) => {
  const { password, ...tenantData } = data;

  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: tenantData });
    await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: tenant.email,
        passwordHash: hashPassword(password),
      },
    });

    return tenant;
  });
};

export const getTenants = async () => {
  return (prisma as any).tenant.findMany({ orderBy: { createdAt: "desc" } });
};

export const getTenantById = async (id: string) => {
  return (prisma as any).tenant.findUnique({ where: { id } });
};
