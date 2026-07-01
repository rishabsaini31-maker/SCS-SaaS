import prisma from "../db/prisma";

export type AuthAuditEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "ACCOUNT_LOCKED"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "EMAIL_VERIFIED"
  | "EMAIL_VERIFICATION_SENT"
  | "REFRESH_TOKEN_USED"
  | "SESSION_CREATED"
  | "SESSION_REVOKED"
  | "LOGOUT"
  | "LOGOUT_ALL_DEVICES"
  | "NEW_DEVICE_LOGIN"
  | "SUSPICIOUS_LOGIN"
  | "STAFF_LOGIN"
  | "STAFF_LOGOUT";

export type AuthAuditStatus = "SUCCESS" | "FAILED" | "WARNING" | "INFO";

export interface LogAuthEventParams {
  tenantId?: string | null;
  ownerId?: string | null;
  staffId?: string | null;
  eventType: AuthAuditEventType;
  status: AuthAuditStatus;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  deviceType?: string | null;
  country?: string | null;
  city?: string | null;
  sessionId?: string | null;
}

export async function logAuthEvent(params: LogAuthEventParams) {
  try {
    const rec = await prisma.authenticationAuditLog.create({
      data: {
        tenantId: params.tenantId || null,
        ownerId: params.ownerId || null,
        staffId: params.staffId || null,
        eventType: params.eventType,
        status: params.status,
        description: params.description || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        browser: params.browser || null,
        operatingSystem: params.operatingSystem || null,
        deviceType: params.deviceType || null,
        country: params.country || null,
        city: params.city || null,
        sessionId: params.sessionId || null,
      },
    });

    return rec;
  } catch (error) {
    // Do not block main flow on audit failures
    // eslint-disable-next-line no-console
    console.error("Failed to write auth audit log:", error);
    return null;
  }
}

export interface QueryLogsOptions {
  tenantId?: string;
  ownerId?: string;
  staffId?: string;
  eventType?: string;
  status?: string;
  ipAddress?: string;
  deviceType?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  skip?: number;
  take?: number;
}

export async function queryAuthLogs(opts: QueryLogsOptions) {
  const where: any = {};

  if (opts.tenantId) where.tenantId = opts.tenantId;
  if (opts.ownerId) where.ownerId = opts.ownerId;
  if (opts.staffId) where.staffId = opts.staffId;
  if (opts.eventType) where.eventType = opts.eventType;
  if (opts.status) where.status = opts.status;
  if (opts.ipAddress) where.ipAddress = opts.ipAddress;
  if (opts.deviceType) where.deviceType = opts.deviceType;

  if (opts.dateFrom || opts.dateTo) {
    where.createdAt = {};
    if (opts.dateFrom) where.createdAt.gte = opts.dateFrom;
    if (opts.dateTo) where.createdAt.lte = opts.dateTo;
  }

  if (opts.search) {
    where.OR = [
      { description: { contains: opts.search, mode: "insensitive" } },
      { ipAddress: { contains: opts.search, mode: "insensitive" } },
      { userAgent: { contains: opts.search, mode: "insensitive" } },
      { eventType: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  const [count, rows] = await Promise.all([
    prisma.authenticationAuditLog.count({ where }),
    prisma.authenticationAuditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: opts.skip, take: opts.take }),
  ]);

  return { count, rows };
}

export async function exportAuthLogsCsv(opts: QueryLogsOptions) {
  const where: any = {};
  if (opts.tenantId) where.tenantId = opts.tenantId;
  if (opts.dateFrom || opts.dateTo) {
    where.createdAt = {};
    if (opts.dateFrom) where.createdAt.gte = opts.dateFrom;
    if (opts.dateTo) where.createdAt.lte = opts.dateTo;
  }

  const rows = await prisma.authenticationAuditLog.findMany({ where, orderBy: { createdAt: "desc" } });

  const header = [
    "createdAt",
    "tenantId",
    "ownerId",
    "staffId",
    "eventType",
    "status",
    "description",
    "ipAddress",
    "browser",
    "operatingSystem",
    "deviceType",
    "country",
    "city",
    "sessionId",
  ];

  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const csv = [header.join(",")];
  for (const r of rows) {
    csv.push(
      [
        escape(r.createdAt?.toISOString()),
        escape(r.tenantId),
        escape(r.ownerId),
        escape(r.staffId),
        escape(r.eventType),
        escape(r.status),
        escape(r.description),
        escape(r.ipAddress),
        escape(r.browser),
        escape(r.operatingSystem),
        escape(r.deviceType),
        escape(r.country),
        escape(r.city),
        escape(r.sessionId),
      ].join(","),
    );
  }

  return csv.join("\n");
}
