# Runbook

## Deploy (Vercel)

1. Import the repo into Vercel.
2. Set environment variables from `.env.example` (Production + Preview).
3. Build command `npm run build`; Vercel runs `prisma generate` via the
   postinstall/`db:generate` step. Run `prisma migrate deploy` (or `db push`)
   against the production database on first deploy.
4. `vercel.json` registers a cron hitting `/api/health` hourly — repurpose/extend
   for nurture reminders and the job queue.

## Local bootstrap

```bash
npm i && npm run db:generate && npm run dev
# with a DB: npm run db:push && npm run db:seed
```

## Rotating keys

All secrets live in Vercel env vars (never in the repo). To rotate: update the
value in Vercel, redeploy. The integration layer reads `process.env` at request
time, so no code change is needed. Affected providers: Clerk, Resend, Twilio,
Calendly, Meta CAPI, GA4/GTM, database, Redis, Sentry.

## Fulfilling data-subject requests (GDPR/CCPA)

1. Verify the requester's identity.
2. Record the request in `DataRequest` (`type: export | delete`).
3. **Export:** query `Lead`, `Activity`, `Appointment`, `MessageLog`,
   `ConsentRecord` for the subject; deliver the package securely.
4. **Delete:** delete/anonymise the subject's rows (cascades remove related
   activity); keep a minimal audit trail of the deletion in `AuditLog`.
5. Mark the `DataRequest` complete.

## Incident basics

- Health: `GET /api/health` returns DB status.
- Errors: wire `SENTRY_DSN` for FE+BE capture.
- Webhooks are idempotent (`WebhookEvent.idempotencyKey`); safe to replay.
