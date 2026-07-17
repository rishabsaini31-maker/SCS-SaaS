import app from "./app";
import dotenv from "dotenv";
import { config, assertConfig } from "./common/config";

dotenv.config();

// SECURITY: Validate critical config BEFORE anything else
try {
  assertConfig();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error("❌ Configuration validation failed:");
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const PORT = config.port;
const shouldRunStartupBootstrap =
  config.nodeEnv !== "production" ||
  process.env.RUN_STARTUP_BOOTSTRAP === "true";

// eslint-disable-next-line no-console
console.log(
  `✓ Prisma runtime mode: ${config.databaseUrl.includes("pooler.supabase.com") ? "Supabase pooler" : "direct"}`,
);

if (!shouldRunStartupBootstrap && config.nodeEnv === "production") {
  // eslint-disable-next-line no-console
  console.log("✓ Production startup bootstrap disabled");
}

(async () => {
  try {
    if (shouldRunStartupBootstrap) {
      const { ensureDefaultTenant, ensureOwnerAccounts } =
        await import("./common/tenant/defaultTenant");
      const { ensureDefaultSuperAdmin } =
        await import("./common/tenant/defaultSuperAdmin");
      const { getTenantSettings } =
        await import("./modules/settings/settings.service");

      const tenantId = await ensureDefaultTenant();
      await ensureOwnerAccounts();
      await ensureDefaultSuperAdmin();
      await getTenantSettings(tenantId);
    }

    app.listen(PORT, async () => {
      // eslint-disable-next-line no-console
      console.log(`✓ Server running on port ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`✓ Environment: ${config.nodeEnv}`);

      // Start Cloud Backup scheduler (daily at 2:00 AM)
      try {
        const { createBackupSystem } = await import("./backup");
        const prismaModule = await import("./common/db/prisma");
        const backupSystem = createBackupSystem(prismaModule.default as any);
        if (backupSystem) {
          backupSystem.scheduler.start();
          // eslint-disable-next-line no-console
          console.log("✓ Cloud backup scheduler initialized (daily at 2:00 AM)");
        } else {
          // eslint-disable-next-line no-console
          console.log("⚠ Cloud backup system disabled (R2 not configured)");
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to start cloud backup scheduler:", err);
      }

      // Start legacy backup scheduler (hourly DB snapshots)
      try {
        const { startBackupScheduler } = await import("./modules/backup/backup.scheduler");
        startBackupScheduler();
        // eslint-disable-next-line no-console
        console.log("✓ Legacy backup scheduler initialized");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to start legacy backup scheduler:", err);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to start server:");
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
