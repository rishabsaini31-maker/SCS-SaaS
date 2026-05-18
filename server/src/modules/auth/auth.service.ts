import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import signAuthToken from "../../common/utils/jwt";
import { verifyPassword } from "../../common/utils/password";
import type { LoginInput } from "./auth.schema";

const ownerSelect = {
  id: true,
  email: true,
  tenantId: true,
  tenant: {
    select: {
      id: true,
      businessName: true,
      ownerName: true,
      email: true,
      phone: true,
      gstNumber: true,
    },
  },
} as const;

export async function loginOwner(data: LoginInput) {
  const owner = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      ...ownerSelect,
      passwordHash: true,
    },
  });

  if (!owner) {
    throw new CustomError("Invalid email or password", 401);
  }

  const passwordMatches = verifyPassword(data.password, owner.passwordHash);
  if (!passwordMatches) {
    throw new CustomError("Invalid email or password", 401);
  }

  const token = signAuthToken({
    userId: owner.id,
    tenantId: owner.tenantId,
  });

  return {
    token,
    user: {
      id: owner.id,
      email: owner.email,
      tenantId: owner.tenantId,
    },
    tenant: owner.tenant,
  };
}

export async function getCurrentSession(userId: string, tenantId: string) {
  const owner = await prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: ownerSelect,
  });

  if (!owner) {
    throw new CustomError("Session not found", 401);
  }

  return {
    user: {
      id: owner.id,
      email: owner.email,
      tenantId: owner.tenantId,
    },
    tenant: owner.tenant,
  };
}
