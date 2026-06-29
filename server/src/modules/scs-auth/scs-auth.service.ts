import { randomUUID } from "crypto";
import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import {
  createSuperAdminSession,
  revokeSuperAdminSessions,
} from "../../common/services/authSession";
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
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  });

  if (!superAdmin) {
    throw new CustomError("Invalid email or password", 401);
  }

  if (superAdmin.status !== "ACTIVE") {
    throw new CustomError("Super admin account is suspended", 403);
  }

  // Check if account is locked
  if (superAdmin.lockedUntil && superAdmin.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((superAdmin.lockedUntil.getTime() - Date.now()) / 60000);
    throw new CustomError(`Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`, 403);
  }

  const passwordMatches = await verifyPassword(
    data.password,
    superAdmin.passwordHash,
  );
  if (!passwordMatches) {
    const failedAttempts = superAdmin.failedLoginAttempts + 1;
    const updates: any = { failedLoginAttempts: failedAttempts };
    
    if (failedAttempts >= 5) {
      // Lock for 15 minutes
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await prisma.superAdmin.update({
      where: { id: superAdmin.id },
      data: updates,
    });

    throw new CustomError("Invalid email or password", 401);
  }

  // Reset failed attempts on successful login
  if (superAdmin.failedLoginAttempts > 0 || superAdmin.lockedUntil) {
    await prisma.superAdmin.update({
      where: { id: superAdmin.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
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

/**
 * PRODUCTION SECURITY: Super admin logout with session revocation
 *
 * Revokes all active sessions for the super admin.
 * Frontend must clear the token after receiving this response.
 */
export async function logoutSuperAdmin(adminId: string) {
  await revokeSuperAdminSessions(adminId);

  return {
    success: true,
    message: "Logged out successfully. All sessions revoked.",
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
