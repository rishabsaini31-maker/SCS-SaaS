import dotenv from "dotenv";
import { z } from "zod";
import path from "path";

dotenv.config();

/**
 * PRODUCTION SECURITY CRITICAL
 *
 * Environment validation schema with strict requirements for production.
 * Server MUST fail on startup if critical secrets are missing.
 *
 * Required in PRODUCTION:
 * - DATABASE_URL (database connection)
 * - JWT_SECRET (token signing, min 32 chars)
 * - SUPER_ADMIN_EMAIL (super admin email)
 * - SUPER_ADMIN_PASSWORD (super admin password)
 *
 * Never has development fallbacks in production mode.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "staging"])
    .default("development"),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),
  CORS_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Surface validation errors
  // eslint-disable-next-line no-console
  console.error("❌ Environment validation failed:");
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

const env = parsed.data;
const isProd = env.NODE_ENV === "production";

/**
 * FAIL-FAST: Production environment validation
 *
 * These checks execute BEFORE the server starts to prevent insecure
 * deployments from running even temporarily.
 */
function validateProductionEnv() {
  const errors: string[] = [];

  if (!env.DATABASE_URL) {
    errors.push("DATABASE_URL is required in production");
  } else if (!env.DATABASE_URL.startsWith("postgresql://")) {
    errors.push(
      "DATABASE_URL must be a PostgreSQL connection string (postgresql://)",
    );
  }

  if (!env.JWT_SECRET) {
    errors.push("JWT_SECRET is required in production");
  } else if (env.JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters in production");
  }

  if (!env.SUPER_ADMIN_EMAIL) {
    errors.push("SUPER_ADMIN_EMAIL is required in production");
  }

  if (!env.SUPER_ADMIN_PASSWORD) {
    errors.push("SUPER_ADMIN_PASSWORD is required in production");
  } else if (env.SUPER_ADMIN_PASSWORD.length < 8) {
    errors.push("SUPER_ADMIN_PASSWORD must be at least 8 characters");
  }

  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      "❌ PRODUCTION SECURITY: Critical environment variables missing",
    );
    errors.forEach((err) => {
      // eslint-disable-next-line no-console
      console.error(`  - ${err}`);
    });
    // eslint-disable-next-line no-console
    console.error(
      "\n⚠️  Server startup blocked. Configure all required environment variables.",
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log("✓ Production environment validation passed");
}

if (isProd) {
  validateProductionEnv();
}

export const config = {
  port: parseInt(env.PORT || "4000", 10),
  nodeEnv: env.NODE_ENV,
  databaseUrl: env.DATABASE_URL || "",
  jwtSecret: env.JWT_SECRET || "",
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  superAdminEmail: env.SUPER_ADMIN_EMAIL || "",
  superAdminPassword: env.SUPER_ADMIN_PASSWORD || "",
  corsOrigins: env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:3003",
      ],
  isProd,
};

/**
 * Runtime assertion for critical config values
 * Prevents missing values from being used elsewhere
 */
export function assertConfig() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET not properly configured. Server cannot start.",
    );
  }
  if (isProd && !config.databaseUrl) {
    throw new Error(
      "FATAL: DATABASE_URL not configured in production. Server cannot start.",
    );
  }
}
