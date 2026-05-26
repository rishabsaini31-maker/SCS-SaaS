#!/usr/bin/env node

const { spawn } = require("child_process");

const maxAttempts = Number(process.env.MIGRATE_MAX_ATTEMPTS || 6);
const delayMs = Number(process.env.MIGRATE_RETRY_DELAY_MS || 10000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runPrismaMigrate() {
  return new Promise((resolve) => {
    const child = spawn("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("close", (code) => {
      resolve(code === 0);
    });

    child.on("error", () => {
      resolve(false);
    });
  });
}

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // eslint-disable-next-line no-console
    console.log(
      `Running prisma migrate deploy (attempt ${attempt}/${maxAttempts})`,
    );

    const success = await runPrismaMigrate();
    if (success) {
      // eslint-disable-next-line no-console
      console.log("Prisma migrations applied successfully");
      process.exit(0);
    }

    if (attempt < maxAttempts) {
      // eslint-disable-next-line no-console
      console.warn(
        `Migration attempt ${attempt} failed. Retrying in ${Math.round(delayMs / 1000)}s...`,
      );
      await sleep(delayMs);
    }
  }

  // eslint-disable-next-line no-console
  console.error("Migration failed after all retry attempts.");
  // eslint-disable-next-line no-console
  console.error(
    "If this is Supabase + Render, use the Supabase pooler host in DATABASE_URL and include ?sslmode=require.",
  );
  process.exit(1);
}

main();
