# Render one-off job: check-db

This repository includes a small connectivity checker at `server/scripts/check-db.js` and a Render job entry in `render.yaml` named `check-db`.

How to run the job from the Render Dashboard (UI):

1. Push `render.yaml` (already in repo) and your branch to GitHub.
2. In Render, open your account and select `New -> Import from GitHub` (or edit your existing service). Render will read `render.yaml` and list available Jobs.
3. Find the `check-db` job and click "Run Job". The job will run with the environment variables configured for the repo/branch (make sure `DATABASE_URL` and other secrets are set in the service environment).

How to run the job with the Render CLI (alternative):

1. Install the Render CLI: https://render.com/docs/cli
2. Authenticate: `render login` (follow prompts)
3. Run the job manually (example):

```bash
# Run the check-db script as a job using your repo's service settings.
render jobs create --service scs-inventory-server --command "node scripts/check-db.js" --branch main
```

Note: CLI flags and names may vary; using the Dashboard UI is the most straightforward.

If the job reports:

- TCP failure: check `DATABASE_URL` host/port and network access.
- TLS failure: ensure `?sslmode=require` is present if your DB requires TLS.

## Fix for deploy error: `P1001: Can't reach database server`

If Render shows this during startup while running `prisma migrate deploy`, apply these checks:

1. Use the Supabase pooler connection string in Render `DATABASE_URL` (not the direct `db.<project-ref>.supabase.co:5432` host).
2. Include `?sslmode=require` at the end of `DATABASE_URL`.
3. Keep startup migration retries enabled (already wired in this repo).

The server startup now retries `prisma migrate deploy` before failing:

- `MIGRATE_MAX_ATTEMPTS` (default: `6`)
- `MIGRATE_RETRY_DELAY_MS` (default: `10000`)

Example for slower DB warmup:

```bash
MIGRATE_MAX_ATTEMPTS=12
MIGRATE_RETRY_DELAY_MS=10000
```

This gives up to ~2 minutes for database reachability during boot.

## Permanent production setup (recommended)

For high-reliability deployments, do not run migrations in web-service startup.
This repository now follows that pattern:

1. Web service start only runs the API server.
2. Migrations run in a dedicated Render job: `migrate-db`.

Recommended deploy order:

1. Run `migrate-db` job.
2. Verify success in logs.
3. Deploy/restart `scs-inventory-server` web service.

Environment variables for this strategy:

- `DATABASE_URL`: Supabase Session/Transaction pooler URL with `sslmode=require`.
- `MIGRATE_MAX_ATTEMPTS`: retry count for migration job.
- `MIGRATE_RETRY_DELAY_MS`: retry delay for migration job.

If the job succeeds on Render but Prisma still errors during `prisma migrate deploy`, paste the job logs here and I'll help interpret them.
