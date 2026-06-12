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
  let user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      ...ownerSelect,
      passwordHash: true,
    },
  });

  let staffUser = null;

  if (!user) {
    staffUser = await prisma.staffUser.findUnique({
      where: { email: data.email },
      include: {
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
      },
    });

    if (!staffUser) {
      throw new CustomError("Invalid email or password", 401);
    }
  }

  const account = user || staffUser;
  if (!account) {
    throw new CustomError("Invalid email or password", 401);
  }

  if (account.tenant?.status === "SUSPENDED") {
    throw new CustomError("Tenant is suspended", 403);
  }

  if (staffUser && !staffUser.isActive) {
    throw new CustomError("Your account has been disabled", 403);
  }

  const passwordMatches = await verifyPassword(
    data.password,
    account.passwordHash,
  );
  if (!passwordMatches) {
    throw new CustomError("Invalid email or password", 401);
  }

  const sessionId = randomUUID();
  await createTenantOwnerSession({
    userId: account.id,
    tenantId: account.tenantId,
    tokenId: sessionId,
  });

  const token = signAuthToken({
    userId: account.id,
    tenantId: account.tenantId,
    sessionId,
    role: staffUser ? staffUser.role : "OWNER",
    staffId: staffUser ? staffUser.id : undefined,
  });

  if (staffUser) {
    await prisma.staffUser.update({
      where: { id: staffUser.id },
      data: { lastLoginAt: new Date() },
    });
  }

  return {
    token,
    user: {
      id: account.id,
      email: account.email,
      tenantId: account.tenantId,
      role: staffUser ? staffUser.role : "OWNER",
      name: staffUser ? staffUser.name : account.tenant?.ownerName,
    },
    tenant: account.tenant,
    sessionId,
  };
}

export async function getCurrentSession(userId: string, tenantId: string, role: string = "OWNER", staffId?: string) {
  if (role === "SALESMAN" || staffId) {
    const staff = await prisma.staffUser.findFirst({
      where: { id: staffId || userId, tenantId },
      include: {
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
      },
    });

    if (!staff) {
      throw new CustomError("Session not found", 401);
    }

    return {
      user: {
        id: staff.id,
        email: staff.email,
        tenantId: staff.tenantId,
        role: staff.role,
        name: staff.name,
      },
      tenant: staff.tenant,
    };
  }

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
      role: "OWNER",
      name: owner.tenant?.ownerName,
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
