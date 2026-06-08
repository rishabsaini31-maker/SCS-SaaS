import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import {
  createTenantOwnerSession,
  revokeSessionsByUser,
} from "../../common/services/authSession";
import signAuthToken from "../../common/utils/jwt";
import { verifyPassword } from "../../common/utils/password";
import type { LoginInput } from "./auth.schema";
import { randomUUID } from "crypto";

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
      address: true,
      status: true,
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

  if (owner.tenant?.status === "SUSPENDED") {
    throw new CustomError("Tenant is suspended", 403);
  }

  const passwordMatches = await verifyPassword(
    data.password,
    owner.passwordHash,
  );
  if (!passwordMatches) {
    throw new CustomError("Invalid email or password", 401);
  }

  const sessionId = randomUUID();
  await createTenantOwnerSession({
    userId: owner.id,
    tenantId: owner.tenantId,
    tokenId: sessionId,
  });

  const token = signAuthToken({
    userId: owner.id,
    tenantId: owner.tenantId,
    sessionId,
  });

  return {
    token,
    user: {
      id: owner.id,
      email: owner.email,
      tenantId: owner.tenantId,
    },
    tenant: owner.tenant,
    sessionId,
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

/**
 * PRODUCTION SECURITY: Logout with server-side session revocation
 *
 * Revokes all active sessions for the user, preventing token reuse.
 * Frontend must clear the token after logout.
 */
export async function logoutOwner(userId: string) {
  // Revoke all active sessions
  await revokeSessionsByUser(userId);

  return {
    success: true,
    message: "Logged out successfully. All sessions revoked.",
  };
}

export async function loginDemoOwner() {
  let owner = await prisma.user.findUnique({
    where: { email: "shop1@local.invalid" },
    select: ownerSelect,
  });

  if (!owner) {
    const { ensureDefaultTenant } = await import("../../common/tenant/defaultTenant");
    await ensureDefaultTenant();
    owner = await prisma.user.findUnique({
      where: { email: "shop1@local.invalid" },
      select: ownerSelect,
    });
  }

  if (!owner) {
    throw new CustomError("Demo owner account not found", 404);
  }

  if (owner.tenant?.status === "SUSPENDED") {
    throw new CustomError("Demo Tenant is suspended", 403);
  }

  const sessionId = randomUUID();
  await createTenantOwnerSession({
    userId: owner.id,
    tenantId: owner.tenantId,
    tokenId: sessionId,
  });

  const token = signAuthToken({
    userId: owner.id,
    tenantId: owner.tenantId,
    sessionId,
  });

  return {
    token,
    user: {
      id: owner.id,
      email: owner.email,
      tenantId: owner.tenantId,
    },
    tenant: owner.tenant,
    sessionId,
  };
}
