/**
 * Cloudflare R2 Backup System — Type Definitions
 *
 * Shared interfaces and constants used across the backup module.
 */

// ─── Month Mapping ───────────────────────────────────────────────

export const MONTH_NAMES: Record<number, string> = {
  1: "01-January",
  2: "02-February",
  3: "03-March",
  4: "04-April",
  5: "05-May",
  6: "06-June",
  7: "07-July",
  8: "08-August",
  9: "09-September",
  10: "10-October",
  11: "11-November",
  12: "12-December",
};

// ─── R2 Configuration ────────────────────────────────────────────

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  encryptionKey: string;
}

// ─── Encrypted Payload ──────────────────────────────────────────

export interface EncryptedPayload {
  /** The encrypted data with IV + authTag prepended as a binary header */
  data: Buffer;
  /** SHA-256 hex digest of the encrypted data */
  checksum: string;
}

// ─── Tenant Backup Snapshot ─────────────────────────────────────

export interface TenantBackupSnapshot {
  metadata: {
    tenantId: string;
    backupDate: string;
    version: string;
    generatedAt: string;
    incremental?: boolean;
    since?: string;
  };
  tenant: Record<string, any>;
  products: Record<string, any>[];
  categories: Record<string, any>[];
  customers: Record<string, any>[];
  suppliers: Record<string, any>[];
  invoices: Record<string, any>[];
  invoiceLineItems: Record<string, any>[];
  purchases: Record<string, any>[];
  purchaseLineItems: Record<string, any>[];
  payments: Record<string, any>[];
  ledgerEntries: Record<string, any>[];
  settings: Record<string, any> | null;
  cashBooks: Record<string, any>[];
  cashTransactions: Record<string, any>[];
  expenses: Record<string, any>[];
  paymentAccounts: Record<string, any>[];
  priceOverrideLogs: Record<string, any>[];
  staffUsers: Record<string, any>[];
}

// ─── Backup Run Summary ─────────────────────────────────────────

export interface BackupRunSummary {
  totalTenants: number;
  successful: number;
  failed: number;
  skipped: number;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  errors: Array<{ tenantId: string; error: string }>;
}
