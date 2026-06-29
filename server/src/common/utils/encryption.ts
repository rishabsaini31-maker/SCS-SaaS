import crypto from "crypto";

// Ensure this matches the length required by the algorithm (32 bytes for aes-256-gcm)
// In production, this MUST be set in environment variables!
const ENCRYPTION_KEY = process.env.APP_ENCRYPTION_KEY || "fallback_key_for_dev_only_32_byte";
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypts a string using AES-256-GCM
 * @returns Format: iv:encryptedData:authTag
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  // 12 bytes is standard for GCM IV
  const iv = crypto.randomBytes(12);
  
  // Ensure the key is exactly 32 bytes (256 bits)
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypts a string that was encrypted with the encrypt function
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(":")) {
    return encryptedText; // Probably not encrypted
  }

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const [ivHex, encrypted, authTagHex] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    // Ensure the key is exactly 32 bytes (256 bits)
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    // If decryption fails (e.g. key changed), we don't want to crash the whole app.
    // In a real app you might want to handle this differently.
    return "[DECRYPTION_FAILED]";
  }
}
