# Runbook

## Environment variables (Vercel → Settings → Environment Variables)

All optional; see `.env.example`. After changing any of them, redeploy
(Deployments → latest → ⋯ → Redeploy), because `NEXT_PUBLIC_*` values are baked
in at build time.

| Variable | What it does when set |
| --- | --- |
| `NEXT_PUBLIC_BOOKING_URL` | /book shows a "Choose a time" button to your Cal.com event |
| `LEAD_WEBHOOK_URL` | /book shows the enquiry form; enquiries POST to this Make webhook |
| `LEAD_WEBHOOK_SECRET` | Sent as `x-solardapt-secret`; filter on it in Make |
| `NEXT_PUBLIC_LEGAL_NAME`, `_ADDRESS`, `NEXT_PUBLIC_COMPANY_NUMBER`, `NEXT_PUBLIC_ICO_NUMBER` | Shown on /privacy and /legal |

Old variables from the GHL/Calendly/Meta version (`GHL_*`, `CALENDLY_*`,
`NEXT_PUBLIC_CALENDLY_URL`, `META_*`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`,
`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_VSL_URL`, `NEXT_PUBLIC_BADGE_*`, `SENTRY_DSN`,
`POLICY_VERSION`) are no longer read and can be deleted.

## Make scenario for the enquiry form

1. Make → Create scenario → **Webhooks → Custom webhook** → Add → copy the URL.
2. Put it in `LEAD_WEBHOOK_URL` in Vercel and redeploy.
3. Submit a test enquiry on /book so Make learns the data structure. Fields:
   `name`, `business`, `email`, `phone`, `installs_per_month`, `message`, `page`,
   `utm_*`, `received_at`.
4. If you set `LEAD_WEBHOOK_SECRET`, add a filter after the webhook:
   header `x-solardapt-secret` equals your secret.
5. Next module: **Microsoft 365 Email → Send an email** to yourself (or a row in your
   pipeline sheet). Turn the scenario on.
6. Test again: you should get the email, and the visitor should see /thank-you.
   With the scenario off, the visitor sees "email or call instead": no enquiry is
   ever lost silently.

## Health check

`GET /api/health` → `{ status, leadWebhook, bookingLink }` shows whether the webhook
and booking link are set (values are never shown).

## Release checks

- [ ] Homepage, /demo, /book, /privacy load; demo runs end to end (book, no-show, renter, report)
- [ ] "Book a planning call" reaches Cal.com (or shows email + phone)
- [ ] Enquiry form: success → /thank-you and a Make run; failure → email/phone message
- [ ] Social preview: paste solardapt.com into WhatsApp/LinkedIn and check the card
