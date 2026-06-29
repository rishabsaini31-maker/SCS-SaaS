import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import { tenantCreateData } from "../../common/tenant/tenant.utils";
import type { z } from "zod";
import { updateTenantSettingsSchema } from "./settings.schema";
import { encrypt, decrypt } from "../../common/utils/encryption";

type UpdateTenantSettingsInput = z.infer<typeof updateTenantSettingsSchema>;

export const getTenantSettings = async (tenantId?: string) => {
  if (!tenantId) throw new CustomError("Tenant context required", 403);

  const settings = await prisma.tenantSetting.findUnique({
    where: { tenantId },
    include: { tenant: true },
  });

  if (settings) {
    return {
      ...settings,
      ownerName: settings.tenant.ownerName,
      phone: settings.tenant.phone,
      email: settings.tenant.email,
      address: settings.tenant.address,
      secrets: settings.encryptedSecrets ? decrypt(settings.encryptedSecrets) : undefined,
    };
  }

  const newSettings = await prisma.tenantSetting.create({
    data: tenantCreateData(tenantId, {
      businessName: null,
      gstNumber: null,
      invoicePrefix: "INV-",
      lowStockThreshold: 10,
      defaultGst: 18,
      taxCalculation: true,
    }) as any,
    include: { tenant: true },
  });

  return {
    ...newSettings,
    ownerName: newSettings.tenant?.ownerName,
    phone: newSettings.tenant?.phone,
    email: newSettings.tenant?.email,
    address: newSettings.tenant?.address,
  };
};

export const updateTenantSettings = async (
  tenantId: string | undefined,
  data: UpdateTenantSettingsInput,
) => {
  if (!tenantId) throw new CustomError("Tenant context required", 403);

  await getTenantSettings(tenantId);

  const tenantUpdateData: any = {};
  if (data.businessName !== undefined) tenantUpdateData.businessName = data.businessName;
  if (data.ownerName !== undefined) tenantUpdateData.ownerName = data.ownerName;
  if (data.phone !== undefined) tenantUpdateData.phone = data.phone;
  if (data.email !== undefined && data.email !== "") tenantUpdateData.email = data.email;
  if (data.address !== undefined) tenantUpdateData.address = data.address;
  if (data.gstNumber !== undefined) tenantUpdateData.gstNumber = data.gstNumber;

  if (Object.keys(tenantUpdateData).length > 0) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: tenantUpdateData,
    });
  }

  const updatedSettings = await prisma.tenantSetting.upsert({
    where: { tenantId },
    update: {
      businessName: data.businessName,
      gstNumber: data.gstNumber,
      invoicePrefix: data.invoicePrefix,
      lowStockThreshold: data.lowStockThreshold,
      defaultGst: data.defaultGst,
      taxCalculation: data.taxCalculation,
      ...(data.secrets !== undefined && { encryptedSecrets: encrypt(data.secrets) }),
    },
    create: tenantCreateData(tenantId, {
      businessName: data.businessName ?? null,
      gstNumber: data.gstNumber ?? null,
      invoicePrefix: data.invoicePrefix ?? "INV-",
      lowStockThreshold: data.lowStockThreshold ?? 10,
      defaultGst: data.defaultGst ?? 18,
      taxCalculation: data.taxCalculation ?? true,
      encryptedSecrets: data.secrets ? encrypt(data.secrets) : undefined,
    }) as any,
  });

  return getTenantSettings(tenantId);
};

export const getBusinessProfile = async (tenantId?: string) => {
  const settings = await getTenantSettings(tenantId);
  return {
    businessName: settings.businessName,
    ownerName: settings.ownerName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    gstNumber: settings.gstNumber,
    invoicePrefix: settings.invoicePrefix,
    lowStockThreshold: settings.lowStockThreshold,
  };
};
