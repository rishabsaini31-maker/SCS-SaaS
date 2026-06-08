import prisma from "../../common/db/prisma";
import { createMonthlyBackup, createYearlyBackup } from "./backup.service";

export const runSyncBackupsForAllTenants = async () => {
  console.log("[BackupScheduler] Starting automated backup synchronization check...");
  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE" },
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    for (const tenant of tenants) {
      const startYear = tenant.createdAt.getFullYear();
      const startMonth = tenant.createdAt.getMonth() + 1;

      // 1. Sync Monthly Backups: Backfill all completed months from tenant registration date to last month
      let checkYear = startYear;
      let checkMonth = startMonth;

      while (
        checkYear < currentYear ||
        (checkYear === currentYear && checkMonth < currentMonth)
      ) {
        try {
          await createMonthlyBackup(tenant.id, checkYear, checkMonth);
        } catch (err) {
          console.error(
            `[BackupScheduler] Error running monthly backup for tenant ${tenant.id} (${checkYear}-${checkMonth}):`,
            err,
          );
        }

        checkMonth++;
        if (checkMonth > 12) {
          checkMonth = 1;
          checkYear++;
        }
      }

      // 2. Sync Yearly Backups: Backfill all completed years
      let checkYearForYearly = startYear;
      while (checkYearForYearly < currentYear) {
        try {
          await createYearlyBackup(tenant.id, checkYearForYearly);
        } catch (err) {
          console.error(
            `[BackupScheduler] Error running yearly backup for tenant ${tenant.id} (Year ${checkYearForYearly}):`,
            err,
          );
        }
        checkYearForYearly++;
      }
    }

    console.log("[BackupScheduler] Automated backup synchronization check complete.");
  } catch (err) {
    console.error("[BackupScheduler] Error during automated backup sync:", err);
  }
};

export const startBackupScheduler = () => {
  // Run reconciliation immediately on startup
  runSyncBackupsForAllTenants();

  // Run the check every hour (3600000 ms)
  setInterval(() => {
    runSyncBackupsForAllTenants();
  }, 3600000);
};
