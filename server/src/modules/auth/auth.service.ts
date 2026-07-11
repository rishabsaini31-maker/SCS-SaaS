import crypto from "crypto";
import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import {
  createTenantOwnerSession,
  getActiveSessionsForUser,
  revokeSessionById,
  revokeSessionsByUser,
  revokeAllRefreshTokensForUser,
  createRefreshToken,
  getActiveRefreshToken,
  revokeRefreshToken,
} from "../../common/services/authSession";
import signAuthToken from "../../common/utils/jwt";
import {
  sendNewLoginNotification,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendSuspiciousLoginEmail,
  sendVerificationEmail,
} from "../../common/utils/email";
import { hashPassword, verifyPassword } from "../../common/utils/password";
import type {
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schema";
import { randomUUID } from "crypto";
import { logAuthEvent } from "../../common/services/authAuditLog";

type AuthContext = {
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  operatingSystem?: string;
};

const ownerSelect = {
  id: true,
  email: true,
  tenantId: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  emailVerified: true,
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
      businessType: true,
    },
  },
} as const;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000";
}

async function getAccountByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...ownerSelect,
      passwordHash: true,
    },
  });

  if (user) {
    return { user, staffUser: null };
  }

  const staffUser = await prisma.staffUser.findUnique({
    where: { email },
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
          businessType: true,
        },
      },
    },
  });

  return { user: null, staffUser };
}

export async function loginOwner(data: LoginInput, context?: AuthContext) {
  const { user, staffUser } = await getAccountByEmail(data.email);

  if (!user && !staffUser) {
    throw new CustomError("Invalid email or password", 401);
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

  if (account.lockedUntil && account.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((account.lockedUntil.getTime() - Date.now()) / 60000);
    throw new CustomError(
      `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
      403,
    );
  }

  const passwordMatches = await verifyPassword(data.password, account.passwordHash);
  if (!passwordMatches) {
    const failedAttempts = account.failedLoginAttempts + 1;
    const updates: Record<string, unknown> = { failedLoginAttempts: failedAttempts };

    if (failedAttempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await sendSuspiciousLoginEmail(account.email, failedAttempts);
      // Audit: Account locked / suspicious activity
      try {
        await logAuthEvent({
          tenantId: account.tenantId,
          ownerId: user ? user.id : undefined,
          staffId: staffUser ? staffUser.id : undefined,
          eventType: "ACCOUNT_LOCKED",
          status: "WARNING",
          description: `Account locked after ${failedAttempts} failed attempts`,
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent,
          browser: context?.browser,
          operatingSystem: context?.operatingSystem,
        });
      } catch {}
    }

    if (staffUser) {
      await prisma.staffUser.update({ where: { id: staffUser.id }, data: updates });
    } else {
      await prisma.user.update({ where: { id: account.id }, data: updates });
    }

    throw new CustomError("Invalid email or password", 401);
  }

  const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true";
  if (requireEmailVerification && !account.emailVerified) {
    throw new CustomError("Please verify your email before logging in.", 403);
  }

  if (account.failedLoginAttempts > 0 || account.lockedUntil) {
    if (staffUser) {
      await prisma.staffUser.update({
        where: { id: staffUser.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    } else {
      await prisma.user.update({
        where: { id: account.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }
  }

  const sessionId = randomUUID();
  const accessToken = signAuthToken(
    {
      userId: account.id,
      tenantId: account.tenantId,
      sessionId,
      role: staffUser ? staffUser.role : "OWNER",
      staffId: staffUser ? staffUser.id : undefined,
    },
    "15m",
  );
  const refreshTokenPlain = createSecureToken();
  const refreshTokenHash = hashToken(refreshTokenPlain);

  await prisma.$transaction(async (tx) => {
    await tx.authSession.create({
      data: {
        subjectType: "TENANT_OWNER",
        userId: account.id,
        tenantId: account.tenantId,
        tokenId: sessionId,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        browser: context?.browser,
        operatingSystem: context?.operatingSystem,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await tx.refreshToken.create({
      data: {
        userId: account.id,
        tenantId: account.tenantId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      },
    });
  });

  if (staffUser) {
    await prisma.staffUser.update({
      where: { id: staffUser.id },
      data: { lastLoginAt: new Date() },
    });
  }

  await sendNewLoginNotification(account.email, {
    browser: context?.browser,
    os: context?.operatingSystem,
    ip: context?.ipAddress,
    time: new Date().toISOString(),
  });

  // Audit: Successful login and session creation
  try {
    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: user ? user.id : account.id,
      staffId: staffUser ? staffUser.id : undefined,
      eventType: staffUser ? "STAFF_LOGIN" : "LOGIN_SUCCESS",
      status: "SUCCESS",
      description: "User logged in successfully",
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      browser: context?.browser,
      operatingSystem: context?.operatingSystem,
      sessionId,
    });

    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: user ? user.id : account.id,
      staffId: staffUser ? staffUser.id : undefined,
      eventType: "SESSION_CREATED",
      status: "SUCCESS",
      description: "New session created",
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      browser: context?.browser,
      operatingSystem: context?.operatingSystem,
      sessionId,
    });
  } catch {}

  return {
    accessToken,
    refreshToken: refreshTokenPlain,
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

export async function refreshOwnerToken(data: RefreshTokenInput, context?: AuthContext) {
  const refreshTokenHash = hashToken(data.refreshToken);
  const record = await getActiveRefreshToken(refreshTokenHash);

  if (!record) {
    // Audit: failed refresh token use
    try {
      await logAuthEvent({
        tenantId: undefined,
        ownerId: undefined,
        staffId: undefined,
        eventType: "REFRESH_TOKEN_USED",
        status: "FAILED",
        description: "Invalid or expired refresh token attempted",
      });
    } catch {}

    throw new CustomError("Invalid or expired refresh token", 401);
  }

  // Look up in User (owner) table first, then fall back to StaffUser
  const ownerAccount = await prisma.user.findUnique({
    where: { id: record.userId },
    select: {
      ...ownerSelect,
      passwordHash: true,
    },
  });

  const staffAccount = !ownerAccount
    ? await prisma.staffUser.findUnique({
        where: { id: record.userId },
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
              businessType: true,
            },
          },
        },
      })
    : null;

  const account = ownerAccount || staffAccount;

  if (!account) {
    throw new CustomError("Invalid or expired refresh token", 401);
  }

  const isStaff = !!staffAccount;
  const role = isStaff ? staffAccount!.role : "OWNER";

  const sessionId = randomUUID();
  const newRefreshTokenPlain = createSecureToken();
  const newRefreshTokenHash = hashToken(newRefreshTokenPlain);

  const result = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    await tx.authSession.create({
      data: {
        subjectType: "TENANT_OWNER",
        userId: account.id,
        tenantId: account.tenantId,
        tokenId: sessionId,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        browser: context?.browser,
        operatingSystem: context?.operatingSystem,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await tx.refreshToken.create({
      data: {
        userId: account.id,
        tenantId: account.tenantId,
        tokenHash: newRefreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      },
    });

    return {
      accessToken: signAuthToken(
        {
          userId: account.id,
          tenantId: account.tenantId,
          sessionId,
          role,
          ...(isStaff && { staffId: staffAccount!.id }),
        },
        "15m",
      ),
      refreshToken: newRefreshTokenPlain,
      user: {
        id: account.id,
        email: account.email,
        tenantId: account.tenantId,
        role,
        name: isStaff ? staffAccount!.name : (ownerAccount as any)?.tenant?.ownerName,
      },
      tenant: account.tenant,
      sessionId,
    };
  });

  // Audit: refresh token used and session created
  try {
    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: isStaff ? undefined : account.id,
      staffId: isStaff ? account.id : undefined,
      eventType: "REFRESH_TOKEN_USED",
      status: "SUCCESS",
      description: "Refresh token rotated and new session created",
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      browser: context?.browser,
      operatingSystem: context?.operatingSystem,
      sessionId: result.sessionId,
    });

    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: isStaff ? undefined : account.id,
      staffId: isStaff ? account.id : undefined,
      eventType: "SESSION_CREATED",
      status: "SUCCESS",
      description: "Session created via refresh token",
      sessionId: result.sessionId,
    });
  } catch {}

  return result;
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
            businessType: true,
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
        canOverridePrice: staff.canOverridePrice,
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

export async function logoutOwner(userId: string, refreshToken?: string, sessionId?: string) {
  const tokenHash = refreshToken ? hashToken(refreshToken) : null;

  if (tokenHash) {
    await revokeRefreshTokenByHash(tokenHash);
  }

  if (sessionId) {
    await revokeSessionById(sessionId, userId);
  } else {
    await revokeSessionsByUser(userId);
  }

  // Audit: logout
  try {
    await logAuthEvent({
      tenantId: undefined,
      ownerId: userId,
      eventType: "LOGOUT",
      status: "SUCCESS",
      description: sessionId ? `Logout session ${sessionId}` : "Logout",
      sessionId,
    });
  } catch {}

  return {
    success: true,
    message: "Logged out successfully.",
  };
}

export async function logoutAllOwnerSessions(userId: string) {
  await revokeSessionsByUser(userId);
  await revokeAllRefreshTokensForUser(userId);

  // Audit: logout all devices
  try {
    await logAuthEvent({
      tenantId: undefined,
      ownerId: userId,
      eventType: "LOGOUT_ALL_DEVICES",
      status: "SUCCESS",
      description: "User logged out from all devices",
    });
  } catch {}

  return {
    success: true,
    message: "Logged out from all devices successfully.",
  };
}

export async function forgotPassword(data: ForgotPasswordInput, frontendUrl?: string) {
  const { user, staffUser } = await getAccountByEmail(data.email);
  const account = user || staffUser;

  if (account) {
    const token = createSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: account.id,
        tokenHash,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(account.email, token, frontendUrl || getFrontendUrl());
    // Audit: password reset requested
    try {
      await logAuthEvent({
        tenantId: account.tenantId,
        ownerId: account.id,
        staffId: (account as any).role ? undefined : undefined,
        eventType: "PASSWORD_RESET_REQUEST",
        status: "INFO",
        description: "Password reset requested",
        ipAddress: undefined,
        userAgent: undefined,
      });
    } catch {}
  }

  return {
    success: true,
    message: "If an account exists, a password reset link has been sent.",
  };
}

export async function resetPassword(data: ResetPasswordInput) {
  const tokenHash = hashToken(data.token);
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) {
    // Audit: invalid reset token attempt
    try {
      await logAuthEvent({
        tenantId: undefined,
        ownerId: undefined,
        eventType: "PASSWORD_RESET_SUCCESS",
        status: "FAILED",
        description: "Invalid or expired password reset token attempted",
      });
    } catch {}

    throw new CustomError("Reset token is invalid or has expired", 401);
  }

  const account = await prisma.user.findUnique({
    where: { id: resetToken.userId },
    select: { id: true, email: true, passwordHash: true, tenantId: true },
  }) || await prisma.staffUser.findUnique({
    where: { id: resetToken.userId },
    select: { id: true, email: true, passwordHash: true, tenantId: true },
  });

  if (!account) {
    throw new CustomError("Reset token is invalid", 401);
  }

  await prisma.$transaction(async (tx) => {
    if ("tenantId" in account && account.tenantId) {
      await tx.user.update({
        where: { id: account.id },
        data: { passwordHash: await hashPassword(data.password) },
      });
    } else {
      await tx.staffUser.update({
        where: { id: account.id },
        data: { passwordHash: await hashPassword(data.password) },
      });
    }

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await tx.authSession.updateMany({
      where: { userId: account.id, status: "ACTIVE", revokedAt: null },
      data: { status: "REVOKED", revokedAt: new Date() },
    });

    await tx.refreshToken.updateMany({
      where: { userId: account.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });

  await sendPasswordChangedEmail(account.email);

  // Audit: password reset success
  try {
    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: account.id,
      eventType: "PASSWORD_RESET_SUCCESS",
      status: "SUCCESS",
      description: "Password reset and sessions revoked",
    });

    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: account.id,
      eventType: "PASSWORD_CHANGED",
      status: "SUCCESS",
      description: "Password changed via reset flow",
    });
  } catch {}

  return {
    success: true,
    message: "Password updated successfully. Please sign in again.",
  };
}

export async function sendVerification(data: { email: string }, frontendUrl?: string) {
  const { user, staffUser } = await getAccountByEmail(data.email);
  const account = user || staffUser;

  if (!account) {
    return {
      success: true,
      message: "If an account exists, a verification link has been sent.",
    };
  }

  if (account.emailVerified) {
    return {
      success: true,
      message: "Email already verified.",
    };
  }

  const token = createSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      userId: account.id,
      tokenHash,
      expiresAt,
    },
  });

  await sendVerificationEmail(account.email, token, frontendUrl || getFrontendUrl());

  // Audit: verification email sent
  try {
    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: account.id,
      eventType: "EMAIL_VERIFICATION_SENT",
      status: "INFO",
      description: "Email verification link sent",
    });
  } catch {}

  return {
    success: true,
    message: "Verification email sent.",
  };
}

export async function verifyEmail(data: VerifyEmailInput) {
  const tokenHash = hashToken(data.token);
  const tokenRecord = await prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash,
      verifiedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!tokenRecord) {
    // Audit: invalid verification token
    try {
      await logAuthEvent({
        tenantId: undefined,
        ownerId: undefined,
        eventType: "EMAIL_VERIFIED",
        status: "FAILED",
        description: "Invalid or expired email verification token attempted",
      });
    } catch {}

    throw new CustomError("Verification token is invalid or has expired", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
  const staffUser = await prisma.staffUser.findUnique({ where: { id: tokenRecord.userId } });
  const account = user || staffUser;

  if (!account) {
    throw new CustomError("Verification token is invalid", 401);
  }

  await prisma.$transaction(async (tx) => {
    if (user) {
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    } else if (staffUser) {
      await tx.staffUser.update({
        where: { id: staffUser.id },
        data: { emailVerified: true },
      });
    }

    await tx.emailVerificationToken.update({
      where: { id: tokenRecord.id },
      data: { verifiedAt: new Date() },
    });
  });
  // Audit: email verified
  try {
    await logAuthEvent({
      tenantId: account.tenantId,
      ownerId: account.id,
      staffId: staffUser ? staffUser.id : undefined,
      eventType: "EMAIL_VERIFIED",
      status: "SUCCESS",
      description: "Email address verified",
    });
  } catch {}

  return {
    success: true,
    message: "Email verified successfully.",
  };
}

export async function listActiveSessions(userId: string) {
  const sessions = await getActiveSessionsForUser(userId);
  return {
    sessions,
  };
}

export async function revokeSession(userId: string, sessionId: string) {
  await revokeSessionById(sessionId, userId);
  try {
    await logAuthEvent({
      ownerId: userId,
      eventType: "SESSION_REVOKED",
      status: "SUCCESS",
      description: `Session ${sessionId} revoked by user`,
      sessionId,
    });
  } catch {}

  return {
    success: true,
    message: "Session revoked.",
  };
}

async function revokeRefreshTokenByHash(tokenHash: string) {
  const record = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null },
  });

  if (record) {
    await revokeRefreshToken(record.id);
  }
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
  const accessToken = signAuthToken({
    userId: owner.id,
    tenantId: owner.tenantId,
    sessionId,
  }, "15m");
  const refreshTokenPlain = createSecureToken();
  const refreshTokenHash = hashToken(refreshTokenPlain);

  await prisma.$transaction(async (tx) => {
    await tx.authSession.create({
      data: {
        subjectType: "TENANT_OWNER",
        userId: owner.id,
        tenantId: owner.tenantId,
        tokenId: sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await tx.refreshToken.create({
      data: {
        userId: owner.id,
        tenantId: owner.tenantId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  });

  // Audit: demo login and session created
  try {
    await logAuthEvent({
      tenantId: owner.tenantId,
      ownerId: owner.id,
      eventType: "LOGIN_SUCCESS",
      status: "SUCCESS",
      description: "Demo owner login",
      sessionId,
    });

    await logAuthEvent({
      tenantId: owner.tenantId,
      ownerId: owner.id,
      eventType: "SESSION_CREATED",
      status: "SUCCESS",
      description: "Demo session created",
      sessionId,
    });
  } catch {}

  return {
    accessToken,
    refreshToken: refreshTokenPlain,
    user: {
      id: owner.id,
      email: owner.email,
      tenantId: owner.tenantId,
    },
    tenant: owner.tenant,
    sessionId,
  };
}
