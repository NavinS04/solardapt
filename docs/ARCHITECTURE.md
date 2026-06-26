# Architecture

## Overview

Single Next.js 15 App-Router project serving three surfaces:

1. **Marketing** (`app/(marketing)`) — the immersive landing page (the Meta
   destination) plus legal/utility routes. Statically rendered where possible so
   content is crawlable despite the animation.
2. **Admin/CRM** (`app/admin`) — a gated dashboard for leads, pipeline and
   analytics. Wrapped by Clerk auth + RBAC in production (`middleware.ts`).
3. **API** (`app/api`) — route handlers for lead capture, consent logging,
   health and signed webhooks.

## Rendering & motion

- Server Components by default; client components only where interactivity or
  motion requires it (`'use client'`).
- `MotionProvider` initialises Lenis smooth scroll and exposes a reduced-motion
  flag via context. Every animated component reads it and degrades to a simple
  cross-fade when the user prefers reduced motion.
- Scroll storytelling uses Framer Motion `useScroll` / `useInView` rather than
  GSAP ScrollTrigger — fewer moving parts, SSR-safe, easy to budget. The
  scene components are isolated so swapping in GSAP/R3F later is mechanical.

## Data flow — lead capture

```
Visitor (Meta, UTM + fbclid)
  → POST /api/lead
     → zod validate + honeypot + rate-limit
     → scoreLead() → score + grade
     → prisma.lead.create   (best-effort; non-blocking)
     → Meta CAPI Lead event (hashed PII, event_id dedupe)
     → Resend confirmation + Twilio SMS (no-op without keys)
  → /thank-you (client conversion, consent-gated)
Calendly webhook → /api/webhooks/calendly (signature + idempotency)
     → upsert Appointment, advance stage, schedule reminders
```

## Data model (Prisma)

`User` · `Lead` · `Activity` · `Appointment` · `Sequence` / `SequenceStep` /
`Enrollment` · `Template` · `MessageLog` · `Content` · `ConsentRecord` ·
`DataRequest` · `AuditLog` · `WebhookEvent` · `Job`. See `prisma/schema.prisma`.

## Integration layer

`lib/integrations.ts` wraps Resend, Twilio and Meta CAPI behind functions that
**degrade gracefully** when env vars are absent (log instead of throw). This
keeps the app buildable and runnable in any environment; production simply
supplies the keys. Webhook signatures are verified with a constant-time compare.

## Reliability hooks (extension points)

`WebhookEvent` (idempotency), `Job` (queue/retry/backoff), `AuditLog` and the
`/api/health` probe are modelled and stubbed. Back the rate limiter and queue
with Upstash Redis in production; add Sentry via `SENTRY_DSN`.
