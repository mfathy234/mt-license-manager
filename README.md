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
