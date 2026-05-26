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

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`✓ Server running on port ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`✓ Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to start server:");
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
