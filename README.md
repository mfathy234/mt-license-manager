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
