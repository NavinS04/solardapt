# Solardapt

Production marketing website + admin/CRM for **Solardapt** — a niche agency that
generates exclusive, pre-qualified homeowner appointments for solar installers
via Meta Ads. The landing page is the destination for paid Meta traffic; its job
is to convert a cold solar-installer owner into a booked free strategy call.

## Stack

- **Next.js 15** (App Router, RSC) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS** + design tokens · **Framer Motion** + **Lenis** smooth scroll
- **Prisma** + **PostgreSQL** (CRM data model)
- Integration layer for **Resend** (email), **Twilio** (SMS), **Calendly**
  (booking), **Meta CAPI** (server-side conversions) — all guarded so the app
  builds and runs without secrets
- **Vitest** unit tests · **GitHub Actions** CI · Vercel-ready

> Heavy 3D (Three.js/R3F) and GSAP ScrollTrigger from the original spec are
> implemented here with Framer Motion + Lenis for a guaranteed-buildable,
> performant baseline. See `docs/MOTION.md` for the upgrade path.

## Quick start

```bash
npm install          # or pnpm i
cp .env.example .env  # fill what you have; the app runs with blanks
npm run db:generate   # generate the Prisma client
npm run dev           # http://localhost:3000
```

With a real database:

```bash
npm run db:push   # apply the schema
npm run db:seed   # templates, nurture sequence, content defaults
```

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev / production build / serve |
| `type-check` | `tsc --noEmit` |
| `lint` | ESLint (next) |
| `test` / `test:watch` | Vitest |
| `db:generate` / `db:push` / `db:seed` | Prisma client / schema / seed |
| `format` | Prettier |

## Structure

```
app/(marketing)   landing, legal, /book, /thank-you
app/admin         gated CRM (Clerk + RBAC in prod)
app/api           lead capture, consent, health, webhooks
components/motion  MotionProvider, Reveal, Magnetic, Tilt, Counter
components/scenes  hero, problem, engine, dashboard, calculator, map…
components/ui      buttons, logo, headings, primitives
lib                prisma, scoring, calculator, validators, integrations
prisma             schema + seed
emails             transactional templates
tests              unit tests
docs               ARCHITECTURE, RUNBOOK, COMPLIANCE, MOTION, FILL index
```

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md)
- [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md)
- [`docs/MOTION.md`](docs/MOTION.md)
- [`docs/FILL.md`](docs/FILL.md) — everything the owner must supply before launch

## Honesty policy

No fabricated proof. Testimonials and review badges only render when real data
is supplied (badges are env-flagged, default OFF). Illustrative dashboard /
calculator figures are clearly labelled. Legal pages are templates requiring
lawyer review.
