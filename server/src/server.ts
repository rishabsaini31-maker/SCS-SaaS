import app from "./app";
import dotenv from "dotenv";
import {
  ensureDefaultTenant,
  ensureOwnerAccounts,
} from "./common/tenant/defaultTenant";
import { getTenantSettings } from "./modules/settings/settings.service";

dotenv.config();

const PORT = process.env.PORT || 4000;

(async () => {
  const tenantId = await ensureDefaultTenant();
  await ensureOwnerAccounts();
  await getTenantSettings(tenantId);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
