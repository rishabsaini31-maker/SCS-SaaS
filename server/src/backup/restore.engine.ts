import { PrismaClient } from "@prisma/client";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { loadR2Config } from "./r2.config";
import { decryptBackupData } from "./backup.encryption";
import * as zlib from "zlib";
import { promisify } from "util";

const gunzip = promisify(zlib.gunzip);
import type { TenantBackupSnapshot } from "./backup.types";

export type ConflictHandling = "SKIP" | "OVERWRITE";

export interface RestoreScope {
  customers?: boolean;
  suppliers?: boolean;
  products?: boolean;
  inventory?: boolean;
  sales?: boolean;
  purchases?: boolean;
  payments?: boolean;
  expenses?: boolean;
  potaBaki?: boolean;
  settings?: boolean;
  staff?: boolean;
}

export class RestoreEngine {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Downloads and decrypts a backup from Cloudflare R2
   */
  private async downloadAndDecrypt(storagePath: string, isCompressed: boolean): Promise<TenantBackupSnapshot> {
    const config = loadR2Config();
    if (!config) throw new Error("R2 is not configured");

    const s3 = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: storagePath,
    });

    const response = await s3.send(command);
    if (!response.Body) {
      throw new Error("Failed to download backup: Empty body");
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray());
    const decryptedBuffer = decryptBackupData(buffer, config.encryptionKey);
    
    let finalBuffer = decryptedBuffer;
    if (isCompressed) {
      finalBuffer = await gunzip(decryptedBuffer);
    }
    
    const jsonStr = finalBuffer.toString("utf-8");
    return JSON.parse(jsonStr) as TenantBackupSnapshot;
  }

  /**
   * Prepares a dry-run preview of the restore operation.
   */
  async preview(backupId: string, tenantId: string) {
    const backup = await (this.prisma as any).cloudBackup.findUnique({
      where: { id: backupId, tenantId },
    });

    if (!backup) throw new Error("Backup not found or unauthorized");

    const snapshot = await this.downloadAndDecrypt(backup.storagePath, backup.isCompressed);
    
    // Perform simple count matching for the preview
    // A more thorough dry run would compare IDs to see exact insert/update/skip counts
    const preview = {
      customers: snapshot.customers?.length || 0,
      suppliers: snapshot.suppliers?.length || 0,
      products: snapshot.products?.length || 0,
      sales: snapshot.invoices?.length || 0,
      purchases: snapshot.purchases?.length || 0,
      payments: snapshot.payments?.length || 0,
      expenses: snapshot.expenses?.length || 0,
      cashBooks: snapshot.cashBooks?.length || 0,
      estimatedTimeMs: (snapshot.customers?.length || 0) * 10 + 500, // naive estimation
    };

    return preview;
  }

  /**
   * Executes the restore operation in the background.
   */
  async executeRestore(
    restoreId: string,
    backupId: string,
    tenantId: string,
    scope: RestoreScope,
    conflictHandling: ConflictHandling
  ) {
    try {
      await this.updateRestoreStatus(restoreId, "CREATING_SAFETY_BACKUP");
      
      const { createBackupSystem } = require("./index");
      const backupSystem = createBackupSystem(this.prisma);
      if (backupSystem) {
        // We do a full backup before restore. If a backup already exists for today, this will stack as a new version.
        const safetyResult = await backupSystem.service.createBackup(tenantId, new Date());
        if (safetyResult.status.includes("FAILED")) {
           throw new Error("Failed to create safety backup before restore. Aborting restore to prevent data loss.");
        }
        
        // Notify owner
        const { sendRestoreSafetyBackupCreatedEmail } = require("../common/utils/email");
        const tenant = await (this.prisma as any).tenant.findUnique({ where: { id: tenantId }, select: { email: true }});
        if (tenant?.email) {
           await sendRestoreSafetyBackupCreatedEmail(tenant.email).catch(console.error);
        }
      }

      await this.updateRestoreStatus(restoreId, "DOWNLOADING");
      const backup = await (this.prisma as any).cloudBackup.findUnique({
        where: { id: backupId, tenantId },
      });
      if (!backup) throw new Error("Backup not found");

      let backupsToApply: any[] = [];
      
      if (backup.mode === "FULL") {
        backupsToApply.push(backup);
      } else {
        if (!backup.parentBackupId) throw new Error("Incremental backup missing parent FULL backup reference.");
        const fullBackup = await (this.prisma as any).cloudBackup.findUnique({
          where: { id: backup.parentBackupId }
        });
        if (!fullBackup) throw new Error("Parent FULL backup not found.");
        
        const incrementalChain = await (this.prisma as any).cloudBackup.findMany({
          where: {
            tenantId,
            mode: "INCREMENTAL",
            parentBackupId: fullBackup.id,
            backupDate: { lte: backup.backupDate },
            status: "COMPLETED"
          },
          orderBy: { backupDate: "asc" }
        });
        
        backupsToApply = [fullBackup, ...incrementalChain];
      }

      let totalRestored = 0;
      let totalFailed = 0;

      for (let i = 0; i < backupsToApply.length; i++) {
        const b = backupsToApply[i];
        await this.updateRestoreStatus(restoreId, `DECRYPTING ${i+1}/${backupsToApply.length}`);
        const snapshot = await this.downloadAndDecrypt(b.storagePath, b.isCompressed);

        await this.updateRestoreStatus(restoreId, `VALIDATING ${i+1}/${backupsToApply.length}`);
        if (snapshot.metadata.tenantId !== tenantId) {
          throw new Error("Cross-tenant restore prevented.");
        }

        await this.updateRestoreStatus(restoreId, `RESTORING ${i+1}/${backupsToApply.length}`);
        
        // Always OVERWRITE for incremental layers, otherwise use the user's selected strategy for the base layer
        const currentConflictStrategy = (i === 0) ? conflictHandling : "OVERWRITE";
        const reportCounts = await this.applyRestore(tenantId, snapshot, scope, currentConflictStrategy);
        
        totalRestored += reportCounts.restored;
        totalFailed += reportCounts.failed;
      }

      await (this.prisma as any).restoreHistory.update({
        where: { id: restoreId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          durationMs: Date.now() - new Date().getTime(), // Approximate
          restoredRecords: totalRestored,
          failedRecords: totalFailed,
          recoveryReport: {
            restored: totalRestored,
            failed: totalFailed,
            backupVersion: backup.version,
            layersApplied: backupsToApply.length,
            performedBy: "OWNER"
          }
        },
      });
    } catch (err: any) {
      await (this.prisma as any).restoreHistory.update({
        where: { id: restoreId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errorMessage: err.message,
        },
      });
      console.error("Restore failed:", err);
    }
  }

  private async updateRestoreStatus(restoreId: string, status: string) {
    await (this.prisma as any).restoreHistory.update({
      where: { id: restoreId },
      data: { status },
    });
  }

  private async applyRestore(
    tenantId: string,
    snapshot: TenantBackupSnapshot,
    scope: RestoreScope,
    conflictHandling: ConflictHandling
  ): Promise<{restored: number; failed: number}> {
    
    let restoredCount = 0;
    
    // Run everything inside an interactive transaction to ensure atomicity
    await (this.prisma as any).$transaction(
      async (tx: any) => {
        
        // Settings
        if (scope.settings && snapshot.settings) {
          // Exclude relational objects that are nested, just update core fields
          const { id, createdAt, updatedAt, owner, ownerId, ...settingsData } = snapshot.settings;
          await tx.tenant.update({
            where: { id: tenantId },
            data: settingsData
          });
        }

        // Customers
        if (scope.customers && snapshot.customers) {
          await this.processBatch(tx.customer, snapshot.customers, conflictHandling, tenantId);
        }

        // Suppliers
        if (scope.suppliers && snapshot.suppliers) {
          await this.processBatch(tx.supplier, snapshot.suppliers, conflictHandling, tenantId);
        }

        // Categories & Products
        if (scope.products && snapshot.categories) {
          await this.processBatch(tx.category, snapshot.categories, conflictHandling, tenantId);
        }
        if (scope.products && snapshot.products) {
          await this.processBatch(tx.product, snapshot.products, conflictHandling, tenantId);
        }

        // Invoices and Line Items (Sales)
        if (scope.sales && snapshot.invoices) {
          await this.processBatch(tx.invoice, snapshot.invoices, conflictHandling, tenantId);
          if (snapshot.invoiceLineItems) {
             await this.processBatch(tx.invoiceLineItem, snapshot.invoiceLineItems, conflictHandling, tenantId);
          }
        }

        // Purchases and Line Items
        if (scope.purchases && snapshot.purchases) {
          await this.processBatch(tx.purchase, snapshot.purchases, conflictHandling, tenantId);
          if (snapshot.purchaseLineItems) {
            await this.processBatch(tx.purchaseLineItem, snapshot.purchaseLineItems, conflictHandling, tenantId);
          }
        }

        // PaymentAccounts and Payments
        if (scope.payments && snapshot.paymentAccounts) {
           await this.processBatch(tx.paymentAccount, snapshot.paymentAccounts, conflictHandling, tenantId);
        }
        if (scope.payments && snapshot.payments) {
          await this.processBatch(tx.payment, snapshot.payments, conflictHandling, tenantId);
        }

        // Expenses
        if (scope.expenses && snapshot.expenses) {
          await this.processBatch(tx.expense, snapshot.expenses, conflictHandling, tenantId);
        }

        // Pota Baki
        if (scope.potaBaki && snapshot.cashBooks) {
           await this.processBatch(tx.cashBook, snapshot.cashBooks, conflictHandling, tenantId);
           if (snapshot.cashTransactions) {
              await this.processBatch(tx.cashTransaction, snapshot.cashTransactions, conflictHandling, tenantId);
           }
        }
        
      },
      {
        maxWait: 10000, // 10s wait
        timeout: 60000, // 1 min timeout for large restores
      }
    );

    // If transaction succeeds, all requested records are considered restored.
    if (scope.customers) restoredCount += snapshot.customers?.length || 0;
    if (scope.suppliers) restoredCount += snapshot.suppliers?.length || 0;
    if (scope.products) restoredCount += snapshot.products?.length || 0;
    if (scope.sales) restoredCount += snapshot.invoices?.length || 0;
    if (scope.purchases) restoredCount += snapshot.purchases?.length || 0;
    if (scope.payments) restoredCount += snapshot.payments?.length || 0;
    if (scope.expenses) restoredCount += snapshot.expenses?.length || 0;
    if (scope.potaBaki) restoredCount += snapshot.cashBooks?.length || 0;
    if (scope.settings) restoredCount += 1;

    return { restored: restoredCount, failed: 0 };
  }

  /**
   * Helper to process batches of data via Upsert.
   * If conflictHandling === SKIP, we use the existing data if it exists.
   * If conflictHandling === OVERWRITE, we replace the existing data.
   */
  private async processBatch(
    modelDelegate: any,
    items: any[],
    conflictHandling: ConflictHandling,
    tenantId: string
  ) {
    if (!items || items.length === 0) return;

    for (const item of items) {
      // Clean up fields that might cause relation conflicts or are read-only
      // In Prisma, we usually don't insert nested relation arrays directly in upsert like this,
      // so we assume the collector flattened them or we drop unknown keys.
      
      const { 
        invoices, ledgers, payments, purchases, lineItems, 
        transactions, auditLogs, priceOverrides, 
        customer, supplier, tenant, product, invoice, purchase,
        cashBook, expense,
        ...cleanData 
      } = item;

      // Force tenant boundary
      if (cleanData.tenantId) {
        cleanData.tenantId = tenantId;
      }

      // We use upsert. 
      // If SKIP: update logic is empty (or minimally updating updatedAt if required).
      // If OVERWRITE: update logic uses all cleanData.
      const updateData = conflictHandling === "OVERWRITE" ? { ...cleanData } : {};

      try {
        await modelDelegate.upsert({
          where: { id: cleanData.id },
          create: cleanData,
          update: updateData,
        });
      } catch (err: any) {
        // Log individual item errors but we will let it bubble up to rollback the transaction
        console.error(`Failed to restore item ${cleanData.id}`, err.message);
        throw new Error(`Restore failed on record ${cleanData.id}: ${err.message}`);
      }
    }
  }
}
