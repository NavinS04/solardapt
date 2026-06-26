# Compliance

> **All legal copy in this project is a template and must be reviewed by a
> qualified lawyer before production.** We do not claim global compliance — no
> site can guarantee that. The build targets the major frameworks below and
> makes behaviour configurable.

## Frameworks supported

- **GDPR** (EU) and **UK GDPR** — opt-in consent for analytics/marketing,
  consent logged with timestamp, scope, IP and policy version (`ConsentRecord`).
- **CCPA/CPRA** (California) — opt-out model, Global Privacy Control honoured.
- **PIPEDA** (Canada) and **Australian Privacy Act** — supported via the same
  consent + rights tooling.

## Consent & cookies

- Granular manager: necessary / analytics / marketing.
- No GA4, GTM or Meta Pixel before consent. Server-side CAPI is gated on the
  same marketing consent.
- GPC / Do-Not-Track treated as an opt-out of non-essential cookies.

## Data-subject rights

Self-serve export/deletion flows are modelled via `DataRequest` with admin
fulfilment (see RUNBOOK) and an audit trail.

## Security (OWASP-aware)

zod validation on every boundary · Prisma parameterised queries · honeypot +
rate limiting on public forms · signed/verified webhooks · strict security
headers + HSTS (`next.config.mjs`) · secrets only in env · PII hashed before it
reaches Meta CAPI · dependency audit in CI.

## Email/SMS

Double opt-in for marketing email · one-click unsubscribe + List-Unsubscribe ·
SMS STOP/HELP handling · quiet hours/throttling · marketing only to consented
contacts.

## Per-launch checklist

- [ ] Lawyer-reviewed Privacy, Cookie, Terms, Accessibility, Legal Notice.
- [ ] Controller identity, retention periods and processor list filled in.
- [ ] Pixel/CAPI dataset configured and consent-gated.
- [ ] WCAG 2.2 AA contrast verified for orange-on-dark and orange-on-white.
