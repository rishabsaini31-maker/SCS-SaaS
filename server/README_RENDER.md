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

If the job succeeds on Render but Prisma still errors during `prisma migrate deploy`, paste the job logs here and I'll help interpret them.
