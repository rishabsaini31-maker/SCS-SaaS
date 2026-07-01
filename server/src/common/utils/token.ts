import { randomBytes, createHash } from "crypto";

/**
 * PRODUCTION SECURITY: Secure token generation and hashing utilities.
 *
 * Tokens are generated with 32 bytes of cryptographic randomness
 * and hashed with SHA-256 before storage. The plaintext token is
 * returned only once to the client; only the hash is persisted.
 */

/**
 * Generate a cryptographically secure random token (hex-encoded).
 * Returns the raw (plaintext) token string to send to the user.
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a plaintext token with SHA-256 for safe database storage.
 * This is a one-way operation — the original token cannot be recovered.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
