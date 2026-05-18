import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import { tenantCreateData } from "../../common/tenant/tenant.utils";
import type { z } from "zod";
import { updateTenantSettingsSchema } from "./settings.schema";

type UpdateTenantSettingsInput = z.infer<typeof updateTenantSettingsSchema>;

export const getTenantSettings = async (tenantId?: string) => {
  if (!tenantId) throw new CustomError("Tenant context required", 403);

  const settings = await prisma.tenantSetting.findUnique({
    where: { tenantId },
  });

  if (settings) return settings;

  return prisma.tenantSetting.create({
    data: tenantCreateData(tenantId, {
      businessName: null,
      gstNumber: null,
      invoicePrefix: "INV-",
      lowStockThreshold: 10,
    }) as any,
  });
};

export const updateTenantSettings = async (
  tenantId: string | undefined,
  data: UpdateTenantSettingsInput,
) => {
  if (!tenantId) throw new CustomError("Tenant context required", 403);

  await getTenantSettings(tenantId);

  return prisma.tenantSetting.upsert({
    where: { tenantId },
    update: data,
    create: tenantCreateData(tenantId, {
      businessName: data.businessName ?? null,
      gstNumber: data.gstNumber ?? null,
      invoicePrefix: data.invoicePrefix ?? "INV-",
      lowStockThreshold: data.lowStockThreshold ?? 10,
    }) as any,
  });
};

export const getBusinessProfile = async (tenantId?: string) => {
  const settings = await getTenantSettings(tenantId);
  return {
    businessName: settings.businessName,
    gstNumber: settings.gstNumber,
    invoicePrefix: settings.invoicePrefix,
    lowStockThreshold: settings.lowStockThreshold,
  };
};
