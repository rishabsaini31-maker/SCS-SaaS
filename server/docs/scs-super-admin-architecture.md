# SCS Super Admin Architecture

## Purpose

The Super Admin system is the platform-owner control plane for SCS. It is separate from tenant/shop auth and is mounted under `/api/v1/scs-admin`.

## Core Separation

- Tenant users continue to authenticate with the existing tenant JWT flow.
- Super Admin users authenticate with a separate JWT payload: `adminId`, `adminType`, and optional `sessionId`.
- Super Admin routes do not pass through tenant isolation middleware.
- Tenants never gain access to global platform data.

## Database Additions

- `SuperAdmin`: separate global admin table with its own password hash and status.
- `AuthSession`: shared session table for tenant-owner and super-admin logins.
- `Tenant.status`: `ACTIVE` or `SUSPENDED`.
- `Tenant.address`: shop address captured during shop creation.

## Bootstrap

On startup, the server ensures a default super-admin account exists using:

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `SUPER_ADMIN_TYPE`

## Authentication

### Super Admin

- `POST /api/v1/scs-admin/login`
- `GET /api/v1/scs-admin/me`

### Tenant Owner

- Existing tenant auth remains unchanged except for session tracking and suspension checks.

## Admin APIs

### Shop / Tenant Management

- `GET /api/v1/scs-admin/tenants`
- `POST /api/v1/scs-admin/shops`
- `PATCH /api/v1/scs-admin/tenants/:tenantId/status`
- `POST /api/v1/scs-admin/tenants/:tenantId/reset-owner-password`

### Dashboard

- `GET /api/v1/scs-admin/dashboard`

## Platform Metrics

- total tenants
- active tenants
- invoice count
- product count
- active sessions

## Security Rules

- Super Admin JWTs are validated separately from tenant JWTs.
- Suspended tenants are blocked at login.
- Owner password resets revoke active owner sessions.
- Suspended tenant sessions are revoked.
- Active sessions are counted from the shared `AuthSession` table.

## Notes

- This architecture does not replace the tenant system.
- It adds a parallel global admin control plane for the SaaS owner.
