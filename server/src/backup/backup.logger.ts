/**
 * Cloudflare R2 Backup System — Structured Logger
 *
 * All backup operations log through this logger with consistent
 * formatting, timestamps, and structured context.
 */

export class BackupLogger {
  private readonly prefix = "[CloudBackup]";

  info(message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    // eslint-disable-next-line no-console
    console.log(`${timestamp} ${this.prefix} INFO: ${message}${contextStr}`);
  }

  warn(message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    // eslint-disable-next-line no-console
    console.warn(`${timestamp} ${this.prefix} WARN: ${message}${contextStr}`);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    const errorStr = error instanceof Error
      ? ` | Error: ${error.message}`
      : error
        ? ` | Error: ${String(error)}`
        : "";
    // eslint-disable-next-line no-console
    console.error(`${timestamp} ${this.prefix} ERROR: ${message}${errorStr}${contextStr}`);
  }
}
