# Microtec License Manager

A single Next.js App Router application for managing Microtec license and subscription records.

## Stack

- Next.js, React, TypeScript
- Prisma with Neon Postgres
- Auth.js / NextAuth credentials auth
- Nodemailer SMTP settings stored in-app
- Tailwind CSS with small local UI primitives

## Getting Started

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `CREDENTIAL_ENCRYPTION_KEY`, and `CRON_SECRET`.
3. Install dependencies with `npm install`.
4. Run migrations with `npm run prisma:migrate`.
5. Start development with `npm run dev`.
6. Open `/setup` and create the first admin user.

Generate an encryption key:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Pull Production Data Locally

Production runs on Vercel (https://mt-license-manager.vercel.app). `scripts/pull-production-data.mjs`
copies the production database into your **local** database. Production is only read (`pg_dump`);
the script refuses to write to any host other than `localhost`.

Prerequisites:

- PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`). The script defaults to
  `C:/Program Files/PostgreSQL/18/bin`; set `PG_BIN` to use another location.
- A local database in `.env.local` with migrations applied (`npm run prisma:deploy`).
- Access to the Vercel project.

1. Pull the production environment (written to `.env.production.local`, which is gitignored):

   ```powershell
   npx vercel login
   npx vercel link --yes --project mt-license-manager
   npx vercel env pull .env.production.local --environment=production
   ```

2. Dry run. This only checks the connection and schema, then prints production row counts:

   ```powershell
   node scripts/pull-production-data.mjs
   ```

3. Copy the data. This **empties every local table** (local users and test data are deleted), then
   restores production data:

   ```powershell
   node scripts/pull-production-data.mjs --yes --sync-key
   ```

   `--sync-key` writes the production `CREDENTIAL_ENCRYPTION_KEY` into `.env.local`. License details
   and credentials are encrypted with it, so they do not decrypt locally without it.

4. Restart `npm run dev` and sign in with your production account.

The dump is written to your temp folder and deleted when the script ends. `.env.production.local`
holds production secrets: never commit it, and delete it when you no longer need it.

### Moving data elsewhere

The same dump works for any PostgreSQL target that has the schema applied:

```powershell
pg_dump --data-only --format=custom --no-owner --exclude-table=_prisma_migrations -f prod.dump "<PRODUCTION_DATABASE_URL>"
pg_restore --data-only --disable-triggers --no-owner -d "<TARGET_DATABASE_URL>" prod.dump
```

The target must use the same `CREDENTIAL_ENCRYPTION_KEY`. For licenses only, the `/licenses/import`
page also accepts the original Excel workbook.

## Cron

Renewal reminders are checked by:

```text
GET /api/cron/check-reminders
Authorization: Bearer <CRON_SECRET>
```

The included GitHub Actions workflow can call the endpoint on a schedule after `APP_URL` and `CRON_SECRET` are configured as repository secrets.

## Deploy As Is

Do not commit `.env` to GitHub. Add these values as GitHub repository secrets, then run the Azure deploy workflow:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `CREDENTIAL_ENCRYPTION_KEY`
- `CRON_SECRET`
- `AZURE_APP_NAME`
- `AZURE_WEBAPP_PUBLISH_PROFILE`
- `APP_URL`

In Azure App Service, add the same runtime app settings:

- `DATABASE_URL`
- `NEXTAUTH_URL=https://your-app.azurewebsites.net`
- `NEXTAUTH_SECRET`
- `CREDENTIAL_ENCRYPTION_KEY`
- `CRON_SECRET`

Then in GitHub:

1. Open the repository.
2. Go to Settings, Secrets and variables, Actions.
3. Add the secrets above.
4. Go to Actions.
5. Run `Deploy Azure App Service`.

The deploy workflow runs:

```powershell
npm ci
npm run prisma:deploy
npm run build
```

For existing data after first deploy, run this locally or as a one-time Azure console command:

```powershell
npm run data:migrate-licenses
```
