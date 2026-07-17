/**
 * Cloudflare R2 Backup System — Backup Encryption
 *
 * AES-256-GCM encryption for backup files.
 * Uses a dedicated encryption key (separate from app-level encryption).
 *
 * Encrypted file format:
 *   [12 bytes IV][16 bytes AuthTag][...encrypted data...]
 *
 * This is a self-contained binary format — the IV and auth tag are
 * prepended to the ciphertext so the .enc file can be decrypted
 * without external metadata.
 */

import crypto from "crypto";
import type { EncryptedPayload } from "./backup.types";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes is standard for GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes auth tag

/**
 * Encrypt backup data using AES-256-GCM.
 *
 * @param plaintext - Raw backup JSON as a Buffer
 * @param encryptionKey - The encryption key (must be at least 32 chars, key is derived via scrypt)
 * @returns Encrypted payload with checksum
 */
export function encryptBackupData(
  plaintext: Buffer,
  encryptionKey: string,
): EncryptedPayload {
  // Derive a 32-byte key using scrypt (consistent with existing encryption.ts pattern)
  const key = crypto.scryptSync(encryptionKey, "scs-backup-salt", 32);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Binary format: [IV (12 bytes)][AuthTag (16 bytes)][Ciphertext]
  const encryptedFile = Buffer.concat([iv, authTag, encrypted]);

  // Compute SHA-256 checksum of the encrypted output
  const checksum = computeChecksum(encryptedFile);

  return {
    data: encryptedFile,
    checksum,
  };
}

/**
 * Compute SHA-256 hex digest of a Buffer.
 */
export function computeChecksum(data: Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Decrypt backup data using AES-256-GCM.
 *
 * @param encryptedFile - The full encrypted buffer [IV + AuthTag + Ciphertext]
 * @param encryptionKey - The encryption key
 * @returns Decrypted plaintext Buffer
 */
export function decryptBackupData(
  encryptedFile: Buffer,
  encryptionKey: string,
): Buffer {
  const key = crypto.scryptSync(encryptionKey, "scs-backup-salt", 32);
  
  if (encryptedFile.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted file format (too short)");
  }

  const iv = encryptedFile.subarray(0, IV_LENGTH);
  const authTag = encryptedFile.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encryptedFile.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted;
  } catch (err: any) {
    throw new Error(`Decryption failed (auth tag mismatch or corrupted data): ${err.message}`);
  }
}

// Re-export constants for potential restore use
export { IV_LENGTH, AUTH_TAG_LENGTH, ALGORITHM };
