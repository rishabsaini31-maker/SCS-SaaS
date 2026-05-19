import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import {
  countActiveSessions,
  revokeSessionsByTenant,
  revokeSessionsByUser,
} from "../../common/services/authSession";
import { hashPassword } from "../../common/utils/password";
import type {
  CreateShopInput,
  ResetOwnerPasswordInput,
  TenantStatusInput,
} from "./scs-admin.schema";

const tenantSelect = {
  id: true,
  businessName: true,
  ownerName: true,
  email: true,
  phone: true,
  gstNumber: true,
  address: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  settings: {
    select: {
      id: true,
      businessName: true,
      gstNumber: true,
      invoicePrefix: true,
      lowStockThreshold: true,
    },
  },
} as const;

export async function createShop(data: CreateShopInput) {
  const gstNumber = data.gstNumber || data.gst || null;

  const tenant = await prisma.$transaction(async (tx) => {
    const createdTenant = await tx.tenant.create({
      data: {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone ?? null,
        gstNumber,
        address: data.address ?? null,
        status: "ACTIVE",
      },
    });

    await tx.user.create({
      data: {
        tenantId: createdTenant.id,
        email: data.email,
        passwordHash: await hashPassword(data.password),
      },
    });

    await tx.tenantSetting.create({
      data: {
        tenantId: createdTenant.id,
        businessName: data.businessName,
        gstNumber,
        invoicePrefix: "INV-",
        lowStockThreshold: 10,
      },
    });

    return tx.tenant.findUnique({
      where: { id: createdTenant.id },
      select: tenantSelect,
    });
  });

  return { tenant };
}

export async function listTenants() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: tenantSelect,
  });

  return { tenants };
}

export async function updateTenantStatus(
  tenantId: string,
  data: TenantStatusInput,
) {
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: data.status },
    select: tenantSelect,
  });

  if (data.status === "SUSPENDED" && tenant.owner?.id) {
    await revokeSessionsByTenant(tenantId);
    await revokeSessionsByUser(tenant.owner.id);
  }

  return { tenant };
}

export async function resetTenantOwnerPassword(
  tenantId: string,
  data: ResetOwnerPasswordInput,
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      owner: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!tenant?.owner) {
    throw new CustomError("Tenant owner not found", 404);
  }

  await prisma.user.update({
    where: { id: tenant.owner.id },
    data: {
      passwordHash: await hashPassword(data.password),
    },
  });

  await revokeSessionsByUser(tenant.owner.id);

  return {
    tenantId,
    owner: tenant.owner,
  };
}

export async function getDashboardMetrics() {
  const [
    totalTenants,
    activeTenants,
    invoiceCount,
    productCount,
    activeSessions,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.count(),
    prisma.product.count(),
    countActiveSessions(),
  ]);

  return {
    totalTenants,
    activeTenants,
    invoiceCount,
    productCount,
    activeSessions,
  };
}
