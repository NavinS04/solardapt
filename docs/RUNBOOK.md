# Runbook

## Deploy (Vercel)

1. Import the repo into Vercel.
2. Set environment variables from `.env.example` (Production + Preview). The only
   required integration for the lead flow is `GHL_INBOUND_WEBHOOK_URL`.
3. Build command `npm run build`. No database migrations — the app is stateless.
4. `vercel.json` registers an hourly cron hitting `/api/health`.

## Local bootstrap

```bash
npm i && npm run dev
```

## GoHighLevel setup

1. **Inbound webhook:** create a GHL Workflow with an *Inbound Webhook* trigger;
   put its URL in `GHL_INBOUND_WEBHOOK_URL`. Map incoming fields → contact
   fields (exact keys): `first_name`, `last_name`, `email`, `phone`, `business`,
   `jobs_per_month`, `market`, `source`, `utm_source`, `utm_medium`,
   `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `consent_given`,
   `consent_timestamp`, `consent_ip`, `consent_policy_version`. The contract is
   defined by `GHLWebhookBody` in `lib/ghl.ts` — keep this mapping in sync.
2. **Nurture & pipeline:** build SMS + email sequences, pipeline stages and
   reminders as GHL workflows. None of this lives in the website.
3. **Calendly ↔ GHL:** connect Calendly inside GHL (native integration /
   connector) so bookings sync into GHL automatically. The website only hosts the
   Calendly embed (`NEXT_PUBLIC_CALENDLY_URL`).
4. **Messaging compliance (in GHL):** complete **A2P 10DLC** registration for
   SMS and **email sender domain authentication** (SPF/DKIM) inside GHL before
   sending nurture. STOP/HELP and unsubscribe are handled by GHL.

## Switching GHL to API mode (later)

Set `GHL_MODE=api` and supply `GHL_API_KEY` + `GHL_LOCATION_ID`, then implement
the stubbed `api` branch in `lib/ghl.ts`. No caller changes are required.

## Rotating keys

All secrets live in Vercel env vars. To rotate: update the value, redeploy. The
integration layer reads `process.env` at request time. Affected: GHL webhook/API,
Meta CAPI, GA4/GTM, Sentry.

## Fulfilling data-subject requests (GDPR/CCPA)

Lead data lives in **GoHighLevel**. The website keeps no lead copy.

1. Requests arrive via the contact email on the legal pages.
2. **Export:** locate the contact in GHL and export their record + activity.
3. **Delete:** delete/anonymise the contact in GHL.
4. Consent audit lines (`CONSENT_AUDIT`) are in the host logs / Sentry if a fuller
   trail is needed.
5. Record completion per your internal process.

## Incident basics

- Health: `GET /api/health` reports whether the GHL handoff is configured.
- Errors: wire `SENTRY_DSN` for FE+BE capture; `pushLeadToGHL` already logs
  failed leads with full payload for manual recovery.
