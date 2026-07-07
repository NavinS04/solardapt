# Architecture

## Overview

A Next.js 15 App-Router marketing site with a **deliberately thin backend**.
GoHighLevel (GHL) is the system of record; the site's only backend job is to
capture a lead, gate on consent, fire conversion events, and hand the lead to
GHL.

Surfaces:

1. **Marketing** (`app/(marketing)`) — the immersive landing page (the Meta
   destination) plus legal/utility routes. Statically rendered where possible so
   content is crawlable despite the animation.
2. **API** (`app/api`) — three thin route handlers: `lead`, `consent`, `health`.

There is no `/admin`, no custom CRM, no authentication, no database and no
messaging provider in this codebase — all of that now lives in GHL.

## Rendering & motion

- Server Components by default; client components only where interactivity or
  motion requires it (`'use client'`).
- `MotionProvider` initialises Lenis smooth scroll and exposes a reduced-motion
  flag via context. Every animated component degrades to a cross-fade when the
  user prefers reduced motion.
- Scroll storytelling uses Framer Motion `useScroll` / `useInView`.

## Backend flow — lead capture → GHL

```
Visitor (Meta, UTM + fbclid)
  → POST /api/lead
     → zod validate + honeypot + rate-limit
     → if marketing consent: Meta CAPI Lead event (hashed PII, event_id dedupe)
     → pushLeadToGHL()  →  GHL inbound webhook  (first_name, last_name, email,
                            phone, business, jobs_per_month, market, source,
                            utm_source/medium/campaign, fbclid, consent_given,
                            consent_timestamp)
     → return { ok, eventId, forwarded }       (never blocks on GHL failure)
  → /thank-you (client-side conversion, consent-gated)

GHL workflows: nurture (SMS + email), pipeline placement, reminders.
Calendly → GHL booking sync: configured inside GHL, not in this code.
```

## The GHL handoff (`lib/ghl.ts`)

- `toGHLPayload(lead, meta)` maps our internal lead shape to flat GHL contact
  fields, including attribution and consent metadata for auditability.
- `pushLeadToGHL(payload)` POSTs to `GHL_INBOUND_WEBHOOK_URL`, **retries once
  with backoff**, handles non-2xx, and **never throws** — a GHL failure logs the
  full lead for manual recovery (wire Sentry here) but still returns success to
  the visitor.
- Provider-agnostic: `GHL_MODE = "webhook" | "api"`. `webhook` is implemented;
  `api` (GHL API key + Location ID) is stubbed so callers never change when you
  switch.

## Conversion tracking (`lib/meta-capi.ts`)

Server-side Meta CAPI with hashed PII and an `event_id` shared with the browser
Pixel for dedupe. Fires only with marketing consent. No-ops without env.

## Compliance primitives (lean)

- `POST /api/consent` writes a **structured consent audit line**
  (`CONSENT_AUDIT …`) with scope, IP and policy version — serverless-friendly,
  captured by the host log drain / Sentry. Lead-level consent additionally
  travels into GHL as custom fields.
- Data-subject requests are intaken via the contact email on the legal pages and
  **fulfilled in GHL**, where the data lives (see `RUNBOOK.md`).
- Public-form protection: zod validation, honeypot and an in-memory fixed-window
  rate limiter (`lib/rate-limit.ts`) — stateless, no Redis.

## Why no datastore

The site forwards leads immediately to GHL and keeps no copy, so there is
nothing to persist server-side. This removes Postgres/Prisma, Redis, Clerk,
Twilio and Resend — and their cost and operational surface — entirely.
