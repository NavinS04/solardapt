# Solardapt

Production marketing website for **Solardapt** — a niche agency that generates
exclusive, pre-qualified homeowner appointments for solar installers via Meta
Ads. The landing page is the destination for paid Meta traffic; its job is to
convert a cold solar-installer owner into a booked free strategy call.

## Architecture (thin backend, GHL is the system of record)

```
Visitor (Meta, UTM + fbclid)
  → submit lead form  (or book via Calendly)
  → POST /api/lead
       → validate (zod) + honeypot + rate-limit
       → consent-gate + fire Meta CAPI / GA4 conversion (server-side, hashed PII)
       → push lead to GoHighLevel via inbound webhook  (lib/ghl.ts)
  → /thank-you (client-side conversion)
GoHighLevel → nurture (SMS + email), pipeline, reminders, Calendly↔GHL sync
```

**GoHighLevel (GHL) is the system of record** for leads, pipeline, nurture and
reminders. This codebase only validates, gates on consent, fires conversion
events and hands the lead to GHL. There is **no custom CRM, auth, database or
messaging provider** in this repo.

## Stack

- **Next.js 15** (App Router, RSC) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS** + design tokens · **Framer Motion** + **Lenis** smooth scroll
- **GoHighLevel** lead handoff (inbound webhook; API mode stubbed)
- **Meta CAPI** + GA4/GTM + Pixel conversion tracking (consent-gated)
- **Calendly** booking embed (Calendly↔GHL sync configured inside GHL)
- **Vitest** unit tests · **GitHub Actions** CI · Vercel-ready

> Heavy 3D (Three.js/R3F) and GSAP ScrollTrigger from the original spec are
> implemented with Framer Motion + Lenis for a guaranteed-buildable, performant
> baseline. See `docs/MOTION.md` for the upgrade path.

## Quick start

```bash
npm install
cp .env.example .env   # fill what you have; the app runs with blanks
npm run dev            # http://localhost:3000
```

The app builds and runs with empty env. Conversion events and the GHL push
become live once their env vars are supplied.

## GHL setup (the only backend integration)

1. In GHL, create a **Workflow** with an **Inbound Webhook** trigger.
2. Copy the webhook URL into `GHL_INBOUND_WEBHOOK_URL`.
3. Map the incoming fields to contact fields — the payload sends: `name`,
   `email`, `phone`, `business`, `jobsPerMonth`, `market`, `source`, `fbclid`,
   each `utm_*`, and consent fields (`consent_marketing`, `consent_ts`,
   `consent_ip`, `consent_policy_version`).
4. Build the nurture/pipeline/reminder workflows in GHL.
5. Configure the **Calendly ↔ GHL** sync inside GHL (native integration).

See `docs/RUNBOOK.md` for A2P 10DLC / email-sender auth (done in GHL).

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev / production build / serve |
| `type-check` | `tsc --noEmit` |
| `lint` | ESLint (next) |
| `test` / `test:watch` | Vitest |
| `format` | Prettier |

## Structure

```
app/(marketing)   landing, legal, /book, /thank-you
app/api           lead capture, consent audit, health
components/motion  MotionProvider, Reveal, Magnetic, Tilt, Counter
components/scenes  hero, problem, engine, dashboard, calculator, map…
components/ui      buttons, logo, headings, primitives
lib                ghl, meta-capi, calculator, validators, rate-limit, site
tests              unit tests (calculator, validators, ghl)
docs               ARCHITECTURE, RUNBOOK, COMPLIANCE, MOTION, FILL index
```

## Honesty policy

No fabricated proof. Testimonials and review badges only render when real data
is supplied (badges are env-flagged, default OFF). Illustrative dashboard /
calculator figures are clearly labelled. Legal pages are templates requiring
lawyer review.
