import prisma from "../db/prisma";

const TENANT_OWNER_SESSION_EXPIRY_DAYS = 7;
const SUPER_ADMIN_SESSION_EXPIRY_DAYS = 7;

function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createTenantOwnerSession(params: {
  userId: string;
  tenantId: string;
  tokenId: string;
}) {
  return prisma.authSession.create({
    data: {
      subjectType: "TENANT_OWNER",
      userId: params.userId,
      tenantId: params.tenantId,
      tokenId: params.tokenId,
      expiresAt: addDays(TENANT_OWNER_SESSION_EXPIRY_DAYS),
    },
  });
}

export async function createSuperAdminSession(params: {
  superAdminId: string;
  tokenId: string;
}) {
  return prisma.authSession.create({
    data: {
      subjectType: "SUPER_ADMIN",
      superAdminId: params.superAdminId,
      tokenId: params.tokenId,
      expiresAt: addDays(SUPER_ADMIN_SESSION_EXPIRY_DAYS),
    },
  });
}

export async function getActiveSession(tokenId: string) {
  return prisma.authSession.findFirst({
    where: {
      tokenId,
      status: "ACTIVE",
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function revokeSessionsByTenant(tenantId: string) {
  return prisma.authSession.updateMany({
    where: {
      tenantId,
      status: "ACTIVE",
      revokedAt: null,
    },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });
}

export async function revokeSessionsByUser(userId: string) {
  return prisma.authSession.updateMany({
    where: {
      userId,
      status: "ACTIVE",
      revokedAt: null,
    },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });
}

export async function revokeSuperAdminSessions(superAdminId: string) {
  return prisma.authSession.updateMany({
    where: {
      superAdminId,
      status: "ACTIVE",
      revokedAt: null,
    },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });
}

export async function countActiveSessions() {
  return prisma.authSession.count({
    where: {
      status: "ACTIVE",
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}
