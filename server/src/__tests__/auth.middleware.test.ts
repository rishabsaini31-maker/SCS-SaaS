import test from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import prisma from "../common/db/prisma";
import signAuthToken from "../common/utils/jwt";
import { authenticateJWT } from "../common/middlewares/auth";
import { authenticateSuperAdmin, requireSuperAdmin } from "../common/middlewares/superAdminAuth";
import { requireRole, requireOwner } from "../common/middlewares/requireRole";
import { refreshOwnerToken } from "../modules/auth/auth.service";
import { CustomError } from "../common/errors/CustomError";

function createMockResponse() {
  const headers: Record<string, string> = {};
  const res = {
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    body: undefined as unknown,
    headers,
  } as unknown as Response;

  return res;
}

function createReq(overrides: Partial<Request> = {}) {
  return {
    cookies: {},
    headers: {},
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as unknown as Request;
}

function setProductionEnv() {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  return () => {
    process.env.NODE_ENV = previous;
  };
}

test("authenticateJWT returns 401 for invalid JWT", async () => {
  const restoreEnv = setProductionEnv();
  const req = createReq({ cookies: { "auth-token": "invalid.jwt.token" } });
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  await authenticateJWT(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Invalid JWT" });
  restoreEnv();
});

test("authenticateJWT returns 401 for revoked session", async () => {
  const restoreEnv = setProductionEnv();
  const prismaAny = prisma as any;
  const originalSessionFindFirst = prismaAny.authSession.findFirst;
  const originalTenantFindFirst = prismaAny.tenant.findFirst;
  prismaAny.authSession.findFirst = async () => null;
  prismaAny.tenant.findFirst = async () => ({ id: "tenant-1", status: "ACTIVE" });

  const token = signAuthToken({ userId: "user-1", tenantId: "tenant-1", sessionId: "session-1" }, "15m");
  const req = createReq({ cookies: { "auth-token": token } });
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  await authenticateJWT(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Expired or revoked session" });

  prismaAny.authSession.findFirst = originalSessionFindFirst;
  prismaAny.tenant.findFirst = originalTenantFindFirst;
  restoreEnv();
});

test("authenticateJWT returns 403 for suspended tenant", async () => {
  const restoreEnv = setProductionEnv();
  const prismaAny = prisma as any;
  const originalSessionFindFirst = prismaAny.authSession.findFirst;
  const originalTenantFindFirst = prismaAny.tenant.findFirst;
  prismaAny.authSession.findFirst = async () => ({ userId: "user-1", tenantId: "tenant-1" });
  prismaAny.tenant.findFirst = async () => ({ id: "tenant-1", status: "SUSPENDED" });

  const token = signAuthToken({ userId: "user-1", tenantId: "tenant-1", sessionId: "session-1" }, "15m");
  const req = createReq({ cookies: { "auth-token": token } });
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  await authenticateJWT(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: "Tenant is suspended" });

  prismaAny.authSession.findFirst = originalSessionFindFirst;
  prismaAny.tenant.findFirst = originalTenantFindFirst;
  restoreEnv();
});

test("authenticateSuperAdmin returns 401 for revoked session", async () => {
  const restoreEnv = setProductionEnv();
  const prismaAny = prisma as any;
  const originalSessionFindFirst = prismaAny.authSession.findFirst;
  const originalSuperAdminFindFirst = prismaAny.superAdmin.findFirst;
  prismaAny.authSession.findFirst = async () => null;
  prismaAny.superAdmin.findFirst = async () => ({ id: "admin-1", email: "admin@example.com", adminType: "SUPER_ADMIN", status: "ACTIVE" });

  const token = signAuthToken({ adminId: "admin-1", adminType: "SUPER_ADMIN", sessionId: "session-1" } as any, "15m");
  const req = createReq({ cookies: { "auth-token": token } });
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  await authenticateSuperAdmin(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Expired or revoked session" });

  prismaAny.authSession.findFirst = originalSessionFindFirst;
  prismaAny.superAdmin.findFirst = originalSuperAdminFindFirst;
  restoreEnv();
});

test("requireRole returns 403 when permission is missing", () => {
  const req = createReq({ user: { userId: "u1", tenantId: "t1", role: "SALESMAN" } as any });
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  requireOwner(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: "Forbidden: Access denied" });
});

test("requireSuperAdmin returns 403 when context is missing", () => {
  const req = createReq();
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  requireSuperAdmin(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: "Super admin context required" });
});

test("refreshOwnerToken returns 401 for invalid refresh token", async () => {
  const prismaAny = prisma as any;
  const originalRefreshFindFirst = prismaAny.refreshToken.findFirst;
  prismaAny.refreshToken.findFirst = async () => null;

  await assert.rejects(
    () => refreshOwnerToken({ refreshToken: "invalid-token" }),
    (error: unknown) => error instanceof CustomError && error.status === 401,
  );

  prismaAny.refreshToken.findFirst = originalRefreshFindFirst;
});
