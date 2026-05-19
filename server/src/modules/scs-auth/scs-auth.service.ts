import { randomUUID } from "crypto";
import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import { createSuperAdminSession } from "../../common/services/authSession";
import { hashPassword, verifyPassword } from "../../common/utils/password";
import signSuperAdminToken from "../../common/utils/scsAdminJwt";
import type { ScsAdminLoginInput } from "./scs-auth.schema";

const superAdminSelect = {
  id: true,
  email: true,
  adminType: true,
  status: true,
} as const;

export async function loginSuperAdmin(data: ScsAdminLoginInput) {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { email: data.email },
    select: {
      ...superAdminSelect,
      passwordHash: true,
    },
  });

  if (!superAdmin) {
    throw new CustomError("Invalid email or password", 401);
  }

  if (superAdmin.status !== "ACTIVE") {
    throw new CustomError("Super admin account is suspended", 403);
  }

  const passwordMatches = await verifyPassword(
    data.password,
    superAdmin.passwordHash,
  );
  if (!passwordMatches) {
    throw new CustomError("Invalid email or password", 401);
  }

  const sessionId = randomUUID();
  await createSuperAdminSession({
    superAdminId: superAdmin.id,
    tokenId: sessionId,
  });

  const token = signSuperAdminToken({
    adminId: superAdmin.id,
    adminType: superAdmin.adminType,
    sessionId,
  });

  return {
    token,
    admin: {
      id: superAdmin.id,
      email: superAdmin.email,
      adminType: superAdmin.adminType,
    },
    sessionId,
  };
}

export async function getCurrentSuperAdmin(adminId: string) {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { id: adminId },
    select: superAdminSelect,
  });

  if (!superAdmin) {
    throw new CustomError("Session not found", 401);
  }

  return {
    admin: {
      id: superAdmin.id,
      email: superAdmin.email,
      adminType: superAdmin.adminType,
    },
  };
}

export async function ensureSuperAdminPassword(
  email: string,
  password: string,
) {
  return prisma.superAdmin.upsert({
    where: { email },
    update: {
      passwordHash: await hashPassword(password),
    },
    create: {
      email,
      passwordHash: await hashPassword(password),
      adminType: "ROOT",
    },
  });
}
