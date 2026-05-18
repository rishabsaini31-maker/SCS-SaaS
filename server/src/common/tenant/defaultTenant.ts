import prisma from "../db/prisma";

const DEFAULT_TENANT = {
  businessName: "shop1",
  ownerName: "System",
  email: "shop1@local.invalid",
  phone: null,
  gstNumber: null,
};

let cachedDefaultTenantId: string | null = null;

export async function ensureDefaultTenant() {
  if (cachedDefaultTenantId) return cachedDefaultTenantId;

  const tenant = await prisma.tenant.upsert({
    where: { email: DEFAULT_TENANT.email },
    update: {},
    create: DEFAULT_TENANT,
    select: { id: true },
  });

  cachedDefaultTenantId = tenant.id;
  return cachedDefaultTenantId;
}

export async function getDefaultTenantId() {
  return ensureDefaultTenant();
}
