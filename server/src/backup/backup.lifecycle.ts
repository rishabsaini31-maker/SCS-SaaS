import { PrismaClient } from "@prisma/client";
import { R2StorageClient } from "./r2.client";
import { loadR2Config } from "./r2.config";
import { BackupLogger } from "./backup.logger";

export class BackupLifecycleManager {
  private prisma: PrismaClient;
  private logger: BackupLogger;
  private r2Client: R2StorageClient | null;

  constructor(prisma: PrismaClient, logger: BackupLogger) {
    this.prisma = prisma;
    this.logger = logger;
    const config = loadR2Config();
    this.r2Client = config ? new R2StorageClient(config, logger) : null;
  }

  /**
   * Run Retention Policy: Disabled in final workflow. Keep permanently.
   */
  async runRetentionPolicy() {
    this.logger.info("Retention policy is disabled. All backups are kept permanently.");
  }

  /**
   * Run Archive Promotion: Promotes DAILY backups to MONTHLY or YEARLY.
   */
  async runArchivePromotion() {
    this.logger.info("Starting archive promotion");
    const today = new Date();
    const isLastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === today.getDate();
    const isLastDayOfYear = today.getMonth() === 11 && today.getDate() === 31;

    if (!isLastDayOfMonth && !isLastDayOfYear) {
      this.logger.info("Not the last day of month or year, skipping promotion.");
      return;
    }

    // Get all tenants
    const tenants = await (this.prisma as any).tenant.findMany({ select: { id: true } });

    for (const tenant of tenants) {
      // Find the latest completed backup for this tenant today
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const latestBackup = await (this.prisma as any).cloudBackup.findFirst({
        where: {
          tenantId: tenant.id,
          status: "COMPLETED",
          backupDate: { gte: startOfDay },
        },
        orderBy: { backupDate: "desc" },
      });

      if (latestBackup) {
        const promotionType = isLastDayOfYear ? "YEARLY" : "MONTHLY";
        await (this.prisma as any).cloudBackup.update({
          where: { id: latestBackup.id },
          data: { 
            type: promotionType,
            isImmutable: true
          },
        });
        this.logger.info(`Promoted backup ${latestBackup.id} to ${promotionType} and locked it for tenant ${tenant.id}`);
      } else {
        this.logger.warn(`No completed backup found today for tenant ${tenant.id} to promote.`);
      }
    }
  }

  /**
   * Run Integrity Verification: Randomly or systematically verify backups.
   */
  async runIntegrityVerification() {
    this.logger.info("Starting integrity verification");
    if (!this.r2Client) return;

    // Pick a batch of 50 UNVERIFIED or oldest verified backups
    const backups = await (this.prisma as any).cloudBackup.findMany({
      where: { status: "COMPLETED" },
      orderBy: [
        { integrity: "asc" }, // UNVERIFIED first
        { lastVerifiedAt: "asc" },
      ],
      take: 50,
      include: { tenant: { select: { email: true } } },
    });

    for (const backup of backups) {
      try {
        const existsAndSizeMatch = await this.r2Client.verifyUpload(backup.storagePath, Number(backup.fileSize));
        
        let newIntegrity = existsAndSizeMatch ? "VERIFIED" : "CORRUPTED";

        await (this.prisma as any).cloudBackup.update({
          where: { id: backup.id },
          data: {
            integrity: newIntegrity,
            lastVerifiedAt: new Date(),
          },
        });

        // Notify if corrupted
        if (newIntegrity === "CORRUPTED" && backup.tenant.email) {
            // Note: send email utility can be imported and used here
            this.logger.error(`Backup ${backup.id} marked as CORRUPTED.`);
        }

      } catch (err: any) {
        if (err.name === 'NotFound' || err.message.includes('404')) {
           await (this.prisma as any).cloudBackup.update({
             where: { id: backup.id },
             data: { integrity: "MISSING", lastVerifiedAt: new Date() }
           });
           this.logger.error(`Backup ${backup.id} marked as MISSING.`);
        }
      }
    }
  }
}
