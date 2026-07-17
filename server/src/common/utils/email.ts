/**
 * PRODUCTION SECURITY: Email notification service (mock implementation).
 *
 * In production, replace the console.log calls with an actual email
 * transport (e.g., Nodemailer with SMTP, SendGrid, Resend, AWS SES).
 *
 * All email functions follow the same pattern:
 * 1. Build the email payload (to, subject, body)
 * 2. Send it (currently logged to console)
 * 3. Return success
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // TODO: Replace with real email transport in production
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📧 [EMAIL SERVICE] To: ${payload.to}`);
  console.log(`   Subject: ${payload.subject}`);
  console.log(`   Body: ${payload.html}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  return true;
}

// ─── Password Reset ──────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  frontendUrl: string = "http://localhost:3000",
): Promise<boolean> {
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: email,
    subject: "SCS Flow — Reset Your Password",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
}

export async function sendPasswordChangedEmail(email: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "SCS Flow — Password Changed Successfully",
    html: `
      <h2>Password Changed</h2>
      <p>Your password was changed successfully.</p>
      <p>If you did not make this change, contact support immediately.</p>
    `,
  });
}

// ─── Email Verification ──────────────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  frontendUrl: string = "http://localhost:3000",
): Promise<boolean> {
  const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
  return sendEmail({
    to: email,
    subject: "SCS Flow — Verify Your Email Address",
    html: `
      <h2>Email Verification</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

// ─── Security Notifications ─────────────────────────────────────────────────

export async function sendNewLoginNotification(
  email: string,
  details: { browser?: string; os?: string; ip?: string; time: string },
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "SCS Flow — New Login Detected",
    html: `
      <h2>New Login to Your Account</h2>
      <p>A new login was detected on your SCS Flow account.</p>
      <ul>
        <li><strong>Browser:</strong> ${details.browser || "Unknown"}</li>
        <li><strong>Operating System:</strong> ${details.os || "Unknown"}</li>
        <li><strong>IP Address:</strong> ${details.ip || "Unknown"}</li>
        <li><strong>Time:</strong> ${details.time}</li>
      </ul>
      <p>If this wasn't you, change your password immediately.</p>
    `,
  });
}

export async function sendSuspiciousLoginEmail(
  email: string,
  attempts: number,
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "SCS Flow — Suspicious Login Activity",
    html: `
      <h2>Suspicious Login Activity</h2>
      <p>There have been ${attempts} failed login attempts on your account.</p>
      <p>Your account has been temporarily locked for 15 minutes.</p>
      <p>If this was not you, consider changing your password.</p>
    `,
  });
}

// ─── Backup Notifications ───────────────────────────────────────────────────

export async function sendCloudBackupSuccessEmail(
  email: string,
  details: { fileName: string; fileSize: string; time: string }
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "SCS Flow — Cloud Backup Successful",
    html: `
      <h2>Cloud Backup Successful</h2>
      <p>Your SCS Flow automated daily backup has completed successfully.</p>
      <ul>
        <li><strong>File Name:</strong> ${details.fileName}</li>
        <li><strong>Size:</strong> ${details.fileSize}</li>
        <li><strong>Time:</strong> ${details.time}</li>
      </ul>
      <p>Your data is securely encrypted and stored in Cloudflare R2.</p>
    `,
  });
}

export async function sendCloudBackupFailedEmail(
  email: string,
  details: { reason: string; time: string }
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "SCS Flow — ⚠️ Cloud Backup Failed",
    html: `
      <h2>Cloud Backup Failed</h2>
      <p>Your SCS Flow automated backup has failed.</p>
      <ul>
        <li><strong>Time:</strong> ${details.time}</li>
        <li><strong>Reason:</strong> ${details.reason}</li>
      </ul>
      <p>Please check your Backup Dashboard in Settings for more details or contact support.</p>
    `,
  });
}

export async function sendManualBackupCompletedEmail(
  email: string,
  details: { fileName: string; fileSize: string; time: string; status: string }
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `SCS Flow — Manual Backup ${details.status}`,
    html: `
      <h2>Manual Cloud Backup ${details.status}</h2>
      <p>The manual backup you requested has finished.</p>
      <ul>
        <li><strong>Status:</strong> ${details.status}</li>
        <li><strong>File Name:</strong> ${details.fileName}</li>
        <li><strong>Size:</strong> ${details.fileSize}</li>
        <li><strong>Time:</strong> ${details.time}</li>
      </ul>
    `,
  });
}

export async function sendRestoreSafetyBackupCreatedEmail(
  email: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `SCS Flow — Restore Safety Backup Created`,
    html: `
      <h2>Restore Safety Backup Completed</h2>
      <p>A fresh safety backup of your database was successfully taken right before your restore operation began.</p>
      <p>This ensures you can always recover your data if the restore was a mistake.</p>
    `,
  });
}
