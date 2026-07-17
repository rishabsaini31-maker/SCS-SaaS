/**
 * Cloudflare R2 Backup System — R2 Storage Client
 *
 * S3-compatible client for Cloudflare R2 using the AWS SDK.
 * Handles upload, head (metadata check), and upload verification.
 */

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { R2Config } from "./backup.types";
import { BackupLogger } from "./backup.logger";

export class R2StorageClient {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly logger: BackupLogger;

  constructor(config: R2Config, logger: BackupLogger) {
    this.bucketName = config.bucketName;
    this.logger = logger;

    this.s3 = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Upload an encrypted backup file to R2.
   *
   * @param key - The storage path (e.g., "tenant-001/2026/01-January/2026-01-01_02-00AM.json.enc")
   * @param body - The encrypted file contents
   * @param metadata - Optional metadata to store with the object
   */
  async upload(
    key: string,
    body: Buffer,
    metadata?: Record<string, string>,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: "application/octet-stream",
      Metadata: metadata,
    });

    await this.s3.send(command);
    this.logger.info("File uploaded to R2", { key, size: body.length });
  }

  /**
   * Verify a file exists in R2 and matches expected size.
   *
   * @param key - The storage path to verify
   * @param expectedSize - Expected file size in bytes
   * @returns true if the file exists and size matches
   */
  async verifyUpload(key: string, expectedSize: number): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3.send(command);
      const actualSize = response.ContentLength ?? 0;

      if (actualSize !== expectedSize) {
        this.logger.warn("Upload size mismatch", {
          key,
          expected: expectedSize,
          actual: actualSize,
        });
        return false;
      }

      this.logger.info("Upload verified successfully", { key, size: actualSize });
      return true;
    } catch (error) {
      this.logger.error("Upload verification failed", error, { key });
      return false;
    }
  }

  /**
   * Delete an object from R2.
   *
   * @param key - The storage path to delete
   */
  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3.send(command);
      this.logger.info("Deleted file from R2", { key });
    } catch (error) {
      this.logger.error("Failed to delete from R2", error, { key });
      throw error;
    }
  }
}
