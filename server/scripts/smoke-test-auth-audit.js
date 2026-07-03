#!/usr/bin/env node
/* Smoke test for Authentication Audit Logging
   - Creates test tenants/users
   - Exercises auth flows via HTTP
   - Verifies AuthenticationAuditLog entries via Prisma
*/

const fetch = globalThis.fetch.bind(globalThis);
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function waitForServer() {
  const url = `${BASE}/health`;
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Server did not become ready in time');
}

async function ensureUser(email, password, tenantName = null) {
  let tenant = await prisma.tenant.findUnique({ where: { email } });
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { email, businessName: tenantName || email, ownerName: 'Test Owner' } });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, passwordHash, tenantId: tenant.id } });
  } else {
    await prisma.user.update({ where: { email }, data: { passwordHash, tenantId: tenant.id } });
  }

  return { tenant, user };
}

async function queryLogs(filter) {
  const where = filter || {};
  return prisma.authenticationAuditLog.findMany({ where, orderBy: { createdAt: 'desc' } });
}

async function logExistsForTenantOrOwner(tenantId, ownerId, eventType, status) {
  const rows = await prisma.authenticationAuditLog.findMany({ where: { OR: [{ tenantId }, { ownerId }], eventType, status } });
  return rows.length > 0;
}

async function run() {
  console.log('Waiting for server...');
  await waitForServer();
  console.log('Server ready');

  // Create two tenants/users for isolation tests
  const pw = 'TestPassword!234';
  const { tenant: tA, user: uA } = await ensureUser('test-a@local.invalid', pw, 'Test A');
  const { tenant: tB, user: uB } = await ensureUser('test-b@local.invalid', pw, 'Test B');

  // Clean up pre-existing logs for these tenants to make assertions deterministic
  await prisma.authenticationAuditLog.deleteMany({ where: { tenantId: { in: [tA.id, tB.id] } } });

  // 1) Login success
  console.log('Testing login success...');
  let res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: uA.email, password: pw }),
  });
  const loginOk = res.status === 200;
  if (!loginOk) throw new Error('Login failed unexpectedly');
  // Extract cookies from Set-Cookie header
  const sc = res.headers.get('set-cookie') || '';
  const cookies = {};
  const parts = sc.split(/,\s*/);
  for (const c of parts) {
    const m = c.match(/([^=]+)=([^;]+);/);
    if (m) cookies[m[1]] = m[2];
  }
  const accessToken = cookies['auth-token'];
  const refreshToken = cookies['refresh-token'];

  // Verify LOGIN_SUCCESS and SESSION_CREATED logs exist
  let logs = await queryLogs({ tenantId: tA.id });
  if (!logs.some((l) => l.eventType === 'LOGIN_SUCCESS')) throw new Error('LOGIN_SUCCESS log missing');
  if (!logs.some((l) => l.eventType === 'SESSION_CREATED')) throw new Error('SESSION_CREATED log missing');
  console.log('Login success logs verified');

  // 2) Refresh token rotation
  console.log('Testing refresh token...');
  // Call refresh using cookie
  res = await fetch(`${BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Cookie: `refresh-token=${refreshToken}; auth-token=${accessToken}` },
    body: JSON.stringify({}),
  });
  const refOk = res.status === 200;
  if (!refOk) throw new Error('Refresh failed');
  const sc2 = res.headers.get('set-cookie') || '';
  const cookies2 = {};
  const parts2 = sc2.split(/,\s*/);
  for (const c of parts2) {
    const m = c.match(/([^=]+)=([^;]+);/);
    if (m) cookies2[m[1]] = m[2];
  }
  const newRefreshToken = cookies2['refresh-token'];
  if (!newRefreshToken) throw new Error('Refresh did not return new token');
  logs = await queryLogs({ tenantId: tA.id });
  if (!logs.some((l) => l.eventType === 'REFRESH_TOKEN_USED' && l.status === 'SUCCESS')) throw new Error('REFRESH_TOKEN_USED success log missing');
  console.log('Refresh logs verified');

  // 3) Logout
  console.log('Testing logout...');
  res = await fetch(`${BASE}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${accessToken}`, Cookie: `auth-token=${accessToken}; refresh-token=${newRefreshToken || refreshToken}` },
  });
  if (res.status !== 200) throw new Error('Logout failed');
  if (!(await logExistsForTenantOrOwner(tA.id, uA.id, 'LOGOUT', 'SUCCESS'))) throw new Error('LOGOUT log missing');
  console.log('Logout log verified');

  // 4) Session revocation: create a fresh session, then revoke
  console.log('Testing session revocation...');
  res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: uA.email, password: pw }),
  });
  if (res.status !== 200) throw new Error('Fresh login failed');
  const scFresh = res.headers.get('set-cookie') || '';
  const cookiesFresh = {};
  for (const c of scFresh.split(/,\s*/)) {
    const m = c.match(/([^=]+)=([^;]+);/);
    if (m) cookiesFresh[m[1]] = m[2];
  }
  const freshAccess = cookiesFresh['auth-token'];
  // find an active session for this user directly via Prisma (reliable)
  const active = await prisma.authSession.findFirst({ where: { userId: uA.id, status: 'ACTIVE', revokedAt: null } });
  const sessionId = active?.id;
  if (!sessionId) throw new Error('No session found to revoke');
  res = await fetch(`${BASE}/api/v1/auth/sessions/${sessionId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${freshAccess}` } });
  if (res.status !== 200) {
    const body = await res.text().catch(() => '');
    console.error('Revoke response:', res.status, body);
    throw new Error('Revoke session failed');
  }
  if (!(await logExistsForTenantOrOwner(tA.id, uA.id, 'SESSION_REVOKED', 'SUCCESS'))) throw new Error('SESSION_REVOKED missing');
  console.log('Session revoke log verified');

  // 5) Password reset flow
  console.log('Testing password reset...');
  res = await fetch(`${BASE}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: uA.email }),
  });
  if (res.status !== 200) throw new Error('Forgot password failed');
  // fetch latest token from DB
  const tokenRec = await prisma.passwordResetToken.findFirst({ where: { userId: uA.id }, orderBy: { createdAt: 'desc' } });
  if (!tokenRec) throw new Error('Password reset token not created');
  // We don't have plaintext token; but send reset with the stored token by reading tokenHash is impossible. Instead, generate a new reset token via service? Workaround: directly create a valid reset token entry and use it.
  const crypto = require('crypto');
  const newToken = crypto.randomBytes(16).toString('hex');
  const tokenHash = require('crypto').createHash('sha256').update(newToken).digest('hex');
  await prisma.passwordResetToken.create({ data: { userId: uA.id, tokenHash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) } });
  // perform reset
  res = await fetch(`${BASE}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: newToken, password: 'NewPass!23456' }),
  });
  if (res.status !== 200) throw new Error('Reset password failed');
  logs = await queryLogs({ tenantId: tA.id });
  if (!logs.some((l) => l.eventType === 'PASSWORD_RESET_SUCCESS')) throw new Error('PASSWORD_RESET_SUCCESS missing');
  if (!logs.some((l) => l.eventType === 'PASSWORD_CHANGED')) throw new Error('PASSWORD_CHANGED missing');
  console.log('Password reset logs verified');

  // 6) Login failed -> account locked after 5 attempts
  console.log('Testing failed login leading to account lock...');
  const badEmail = 'temp-lock@local.invalid';
  const { tenant: tC, user: uC } = await ensureUser(badEmail, 'GoodPass!234');
  // ensure failed attempts reset
  await prisma.user.update({ where: { id: uC.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  for (let i = 0; i < 5; i++) {
    await fetch(`${BASE}/api/v1/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: badEmail, password: 'wrong' }) });
  }
  if (!(await logExistsForTenantOrOwner(tC.id, uC.id, 'ACCOUNT_LOCKED', 'WARNING'))) throw new Error('ACCOUNT_LOCKED log missing');
  console.log('Account lock log verified');

  // 7) Tenant isolation: ensure user A cannot view tenant B logs
  console.log('Testing tenant isolation for audit logs...');
  // fetch logs as user A with access token
  res = await fetch(`${BASE}/api/v1/auth/logs`, { headers: { Authorization: `Bearer ${freshAccess}` } });
  const ownerLogs = await res.json();
  if (!ownerLogs.logs) throw new Error('Failed to fetch logs as owner');
  if (ownerLogs.logs.some((l) => l.tenantId === tB.id)) throw new Error('Tenant isolation violated: owner can see other tenant logs');
  console.log('Tenant isolation verified');

  console.log('All smoke tests passed');
}

run().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(2);
});
