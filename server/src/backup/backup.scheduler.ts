/**
 * Cloudflare R2 Backup System — Scheduler
 *
 * Runs daily at 2:00 AM local server time.
 * Uses setTimeout to align to the target hour, then setInterval for 24h cycles.
 */

import { CloudBackupService } from "./backup.service";
import { BackupLogger } from "./backup.logger";
import * as cron from "node-cron";

export class BackupScheduler {
  private readonly backupService: CloudBackupService;
  private readonly logger: BackupLogger;
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  constructor(backupService: CloudBackupService, logger: BackupLogger) {
    this.backupService = backupService;
    this.logger = logger;
  }



  /**
   * Execute the backup run with error handling.
   * The scheduler must never crash — all errors are caught and logged.
   */
  private async executeBackupRun(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Backup run already in progress, skipping this cycle");
      return;
    }

    this.isRunning = true;
    try {
      this.logger.info("Scheduled backup run starting");
      const summary = await this.backupService.runBackupForAllTenants();
      this.logger.info("Scheduled backup run finished", {
        successful: summary.successful,
        failed: summary.failed,
        skipped: summary.skipped,
        durationMs: summary.durationMs,
      });
    } catch (error) {
      this.logger.error("Scheduled backup run crashed", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start the scheduler.
   * Runs daily at 2:00 AM using node-cron.
   */
  start(): void {
    this.logger.info("Scheduler started. Next backup scheduled at 2:00 AM (0 2 * * *)");

    this.cronJob = cron.schedule("0 2 * * *", async () => {
      await this.executeBackupRun();
    });
  }

  /**
   * Stop the scheduler and cancel any pending timers.
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.logger.info("Scheduler stopped");
  }
}
