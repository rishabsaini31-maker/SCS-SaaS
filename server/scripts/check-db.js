#!/usr/bin/env node
/*
  Lightweight DB connectivity checker.
  Usage:
    DATABASE_URL='postgresql://user:pass@host:5432/db?sslmode=require' node scripts/check-db.js

  It attempts a TCP connect and an optional TLS handshake to the host:port parsed from the URL.
*/
const net = require('net');
const tls = require('tls');
const { URL } = require('url');

function parseDatabaseUrl(dbUrl) {
  // ensure scheme is present
  if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must start with postgres:// or postgresql://');
  }
  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = parseInt(url.port || '5432', 10);
  const requiresSsl = (url.searchParams.get('sslmode') || '').toLowerCase() === 'require';
  return { host, port, requiresSsl, redacted: `${url.protocol}//${url.username}:<REDACTED>@${host}:${port}${url.pathname}${url.search}` };
}

async function tcpCheck(host, port, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port, timeout }, () => {
      socket.end();
      resolve();
    });
    socket.on('error', (err) => reject(err));
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('TCP connection timed out'));
    });
  });
}

async function tlsCheck(host, port, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false, timeout }, () => {
      socket.end();
      resolve();
    });
    socket.on('error', (err) => reject(err));
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('TLS handshake timed out'));
    });
  });
}

async function main() {
  try {
    const dbUrl = process.env.DATABASE_URL || process.argv[2];
    if (!dbUrl) {
      console.error('Usage: set DATABASE_URL env var or pass it as the first arg');
      process.exit(2);
    }
    const { host, port, requiresSsl, redacted } = parseDatabaseUrl(dbUrl);
    console.log('Testing database connectivity to:', redacted);

    try {
      await tcpCheck(host, port);
      console.log(`✅ TCP connection to ${host}:${port} succeeded`);
    } catch (err) {
      console.error(`❌ TCP connection to ${host}:${port} failed:`, err.message || err);
      process.exit(3);
    }

    if (requiresSsl) {
      try {
        await tlsCheck(host, port);
        console.log(`✅ TLS handshake to ${host}:${port} succeeded`);
      } catch (err) {
        console.error(`❌ TLS handshake to ${host}:${port} failed:`, err.message || err);
        process.exit(4);
      }
    } else {
      console.log('ℹ️  SSL not required by DATABASE_URL (sslmode not set to require)');
    }

    console.log('If both checks passed but Prisma still fails, the issue may be credentials, database user permissions, or provider-side network allowlisting.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
