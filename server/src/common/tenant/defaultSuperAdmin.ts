import prisma from "../db/prisma";
import { hashPassword } from "../utils/password";

const DEFAULT_SUPER_ADMIN = {
  email: process.env.SUPER_ADMIN_EMAIL || "admin@scs.local.invalid",
  adminType: process.env.SUPER_ADMIN_TYPE || "ROOT",
};

const DEFAULT_SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!";

let cachedSuperAdminId: string | null = null;

export async function ensureDefaultSuperAdmin() {
  if (cachedSuperAdminId) return cachedSuperAdminId;

  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: DEFAULT_SUPER_ADMIN.email },
    update: {},
    create: {
      email: DEFAULT_SUPER_ADMIN.email,
      adminType: DEFAULT_SUPER_ADMIN.adminType,
      passwordHash: await hashPassword(DEFAULT_SUPER_ADMIN_PASSWORD),
    },
    select: { id: true },
  });

  cachedSuperAdminId = superAdmin.id;
  return cachedSuperAdminId;
}
