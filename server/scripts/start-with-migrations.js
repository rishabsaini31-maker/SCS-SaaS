#!/usr/bin/env node
/*
  Wrapper to run `prisma migrate deploy` but optionally allow the server
  to start when the DB is unreachable. This is a temporary operational
  escape hatch to let the app start while you debug network issues.

  Controls:
    ALLOW_START_ON_DB_FAILURE=true  -> continue startup even if migration fails

  This script exits with non-zero unless ALLOW_START_ON_DB_FAILURE is set
  and the failure is a connectivity error (P1001).
*/
const { spawn } = require('child_process');

function runMigrations() {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) return resolve();
      const err = new Error(`prisma migrate deploy exited with code ${code}`);
      err.code = code;
      return reject(err);
    });
    child.on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    console.log('> Running prisma migrate deploy (startup wrapper)');
    await runMigrations();
    console.log('> Migrations applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('> Migrations failed:', err.message || err);

    const allow = String(process.env.ALLOW_START_ON_DB_FAILURE || '').toLowerCase() === 'true';
    if (!allow) {
      console.error('> ALLOW_START_ON_DB_FAILURE not set — aborting startup');
      process.exit(1);
    }

    // If allowed, only continue on connectivity-related failures (best-effort check)
    const isConnectivityError = (err && err.message && err.message.includes("P1001")) || false;
    if (isConnectivityError) {
      console.warn('> Connectivity error detected (P1001). Continuing startup because ALLOW_START_ON_DB_FAILURE=true');
      process.exit(0);
    }

    console.error('> Migration failed for non-connectivity reason. Refusing to continue even though ALLOW_START_ON_DB_FAILURE=true');
    process.exit(1);
  }
})();
