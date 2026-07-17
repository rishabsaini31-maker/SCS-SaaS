/**
 * Cloudflare R2 Backup System — R2 Configuration
 *
 * Reads Cloudflare R2 configuration from environment variables.
 * Returns null if R2 is not configured (allows graceful degradation).
 */

import type { R2Config } from "./backup.types";

/**
 * Load R2 configuration from environment variables.
 * Returns null if critical variables are missing (server can still start).
 */
export function loadR2Config(): R2Config | null {
  const accountId = process.env["R2_ACCOUNT_ID"];
  const accessKeyId = process.env["R2_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["R2_SECRET_ACCESS_KEY"];
  const bucketName = process.env["R2_BUCKET_NAME"];
  const endpoint = process.env["R2_ENDPOINT"];
  const encryptionKey = process.env["R2_BACKUP_ENCRYPTION_KEY"];

  // All fields are required for R2 to function
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !endpoint || !encryptionKey) {
    return null;
  }

  // Validate encryption key length (AES-256 requires 32 bytes)
  if (encryptionKey.length < 32) {
    // eslint-disable-next-line no-console
    console.error(
      "[CloudBackup] R2_BACKUP_ENCRYPTION_KEY must be at least 32 characters for AES-256 encryption"
    );
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    encryptionKey,
  };
}
