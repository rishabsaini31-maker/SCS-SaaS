/**
 * Cloudflare R2 Backup System — Tenant Data Collector
 *
 * Collects a complete snapshot of all tenant data from the database.
 * Each entity type is fetched independently — this is a read-only
 * operation so strict transactional consistency is not required
 * (eventual consistency is acceptable for backup snapshots).
 */

import type { PrismaClient } from "@prisma/client";
import type { TenantBackupSnapshot } from "./backup.types";
import { BackupLogger } from "./backup.logger";

export class BackupDataCollector {
  private readonly prisma: PrismaClient;
  private readonly logger: BackupLogger;

  constructor(prisma: PrismaClient, logger: BackupLogger) {
    this.prisma = prisma;
    this.logger = logger;
  }

  /**
   * Collect a complete data snapshot for a tenant.
   *
   * @param tenantId - The tenant to collect data for
   * @param backupDate - The date this backup represents
   * @returns Complete tenant data snapshot
   */
  async collectTenantData(
    tenantId: string,
    backupDate: Date,
    since?: Date
  ): Promise<TenantBackupSnapshot & { summary: any }> {
    this.logger.info("Starting data collection", { tenantId, incremental: !!since });
    const startTime = Date.now();

    const whereClause: any = { tenantId };
    const whereClauseAppendOnly: any = { tenantId };
    if (since) {
      whereClause.OR = [
        { createdAt: { gt: since } },
        { updatedAt: { gt: since } }
      ];
      whereClauseAppendOnly.createdAt = { gt: since };
    }

    // Fetch tenant info
    const tenant = await (this.prisma as any).tenant.findUnique({
      where: { id: tenantId },
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    // Fetch all tenant data in parallel for performance
    const [
      products,
      categories,
      customers,
      suppliers,
      invoices,
      invoiceLineItems,
      purchases,
      purchaseLineItems,
      payments,
      ledgerEntries,
      settings,
      cashBooks,
      cashTransactions,
      expenses,
      paymentAccounts,
      priceOverrideLogs,
      staffUsers,
    ] = await Promise.all([
      (this.prisma as any).product.findMany({ where: whereClause }),
      (this.prisma as any).category.findMany({ where: whereClause }),
      (this.prisma as any).customer.findMany({ where: whereClause }),
      (this.prisma as any).supplier.findMany({ where: whereClause }),
      (this.prisma as any).invoice.findMany({
        where: whereClause,
        include: { lineItems: true },
      }),
      (this.prisma as any).invoiceLineItem.findMany({ where: whereClauseAppendOnly }),
      (this.prisma as any).purchase.findMany({
        where: whereClause,
        include: { lineItems: true },
      }),
      (this.prisma as any).purchaseLineItem.findMany({ where: whereClauseAppendOnly }),
      (this.prisma as any).payment.findMany({ where: whereClause }),
      (this.prisma as any).ledgerEntry.findMany({ where: whereClauseAppendOnly }),
      (this.prisma as any).tenantSetting.findFirst({
        where: whereClause,
      }),
      (this.prisma as any).cashBook.findMany({ where: whereClause }),
      (this.prisma as any).cashTransaction.findMany({ where: whereClauseAppendOnly }),
      (this.prisma as any).expense.findMany({ where: whereClause }),
      (this.prisma as any).paymentAccount.findMany({ where: whereClause }),
      (this.prisma as any).priceOverrideLog.findMany({ where: whereClauseAppendOnly }),
      (this.prisma as any).staffUser.findMany({
        where: whereClause,
        select: {
          id: true,
          tenantId: true,
          name: true,
          email: true,
          role: true,
          canOverridePrice: true,
          canManageExpenses: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const durationMs = Date.now() - startTime;
    
    const counts: Record<string, number> = {
      products: products.length,
      categories: categories.length,
      customers: customers.length,
      suppliers: suppliers.length,
      sales: invoices.length,
      salesLineItems: invoiceLineItems.length,
      purchases: purchases.length,
      purchaseLineItems: purchaseLineItems.length,
      payments: payments.length,
      ledger: ledgerEntries.length,
      settings: settings ? 1 : 0,
      cashBooks: cashBooks.length,
      cashTransactions: cashTransactions.length,
      expenses: expenses.length,
      paymentAccounts: paymentAccounts.length,
      priceOverrides: priceOverrideLogs.length,
      staff: staffUsers.length
    };

    const changedModules: {name: string, count: number}[] = [];
    const unchangedModules: string[] = [];
    let totalChangedRecords = 0;

    for (const [module, count] of Object.entries(counts)) {
      if (count > 0) {
        changedModules.push({ name: module, count });
        totalChangedRecords += count;
      } else {
        unchangedModules.push(module);
      }
    }

    this.logger.info("Data collection complete", {
      tenantId,
      durationMs,
      totalChangedRecords
    });

    return {
      metadata: {
        tenantId,
        backupDate: backupDate.toISOString(),
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        incremental: !!since,
        since: since ? since.toISOString() : undefined,
      },
      tenant,
      products,
      categories,
      customers,
      suppliers,
      invoices,
      invoiceLineItems,
      purchases,
      purchaseLineItems,
      payments,
      ledgerEntries,
      settings: settings || null,
      cashBooks,
      cashTransactions,
      expenses,
      paymentAccounts,
      priceOverrideLogs,
      staffUsers,
      summary: {
        changedModules,
        unchangedModules,
        totalChangedRecords,
        durationMs
      }
    };
  }
}
