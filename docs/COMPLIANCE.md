# Compliance

> **All legal copy in this project is a template and must be reviewed by a
> qualified lawyer before production.** We do not claim global compliance — no
> site can guarantee that. The build targets the major frameworks below and
> makes behaviour configurable.

## Where lead data lives

Lead data is forwarded to and stored in **GoHighLevel (GHL)**, a processor. The
website itself keeps no copy of lead records. GHL must be listed as a processor
in the Privacy Policy (it is, in `app/(marketing)/privacy/page.tsx`).

## Frameworks supported

- **GDPR** (EU) and **UK GDPR** — opt-in consent for analytics/marketing.
- **CCPA/CPRA** (California) — opt-out model, Global Privacy Control honoured.
- **PIPEDA** (Canada) and **Australian Privacy Act** — same consent + rights
  tooling.

## Consent & cookies

- Granular manager: necessary / analytics / marketing.
- No GA4, GTM or Meta Pixel before consent. Server-side Meta CAPI fires only with
  marketing consent.
- GPC / Do-Not-Track treated as an opt-out of non-essential cookies.
- Consent is recorded two ways: a structured **consent audit log**
  (`CONSENT_AUDIT`, with timestamp/scope/IP/policy version) before any tracker
  fires, and as **custom fields on the GHL contact** when a lead is submitted —
  so the system of record carries the consent state.

## Data-subject rights

Intake is via the contact email on the legal pages; **fulfilment happens in GHL**
where the data lives (see `RUNBOOK.md`). There is no admin UI to maintain.

## Security (OWASP-aware)

zod validation on every boundary · honeypot + rate limiting on the public form ·
strict security headers + HSTS (`next.config.mjs`) · secrets only in env · PII
hashed before it reaches Meta CAPI · the GHL push is server-side only · no lead
data persisted on our infrastructure.

## Messaging compliance (handled in GHL)

Double opt-in, unsubscribe / List-Unsubscribe, SMS STOP/HELP, quiet hours and
A2P 10DLC / email domain authentication are all configured and enforced inside
GoHighLevel — not in this codebase.

## Per-launch checklist

- [ ] Lawyer-reviewed Privacy, Cookie, Terms, Accessibility, Legal Notice.
- [ ] GHL listed as processor; controller identity, retention and processor list
      filled in.
- [ ] Pixel/CAPI dataset configured and consent-gated.
- [ ] A2P 10DLC + email sender auth completed inside GHL.
- [ ] WCAG 2.2 AA contrast verified for orange-on-dark and orange-on-white.
