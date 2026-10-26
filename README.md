# Solardapt

Marketing site for **Solardapt** and its product, the **Solar Survey Engine**: the
system between an established UK solar installer's ad spend and a surveyor in the
homeowner's living room. The site's jobs are to explain the offer, let an installer
**try the system live at `/demo`**, and book a 20-minute walkthrough.

## How it fits together

```
Installer visits (cold call follow-up, LinkedIn, referral)
  → homepage: problem, five stages, weekly report, calculator, founding programme, FAQ
  → /demo: interactive walkthrough with a fictional installer (client-side only, sends nothing)
  → /book: Cal.com link (NEXT_PUBLIC_BOOKING_URL) or email/phone
           + optional enquiry form → POST /api/lead → Make.com webhook (LEAD_WEBHOOK_URL)
```

The site stores nothing. Enquiries go straight to Make, and the form only shows
"thank you" once Make has accepted the enquiry. If the webhook isn't set, the form
is hidden and visitors are offered email and phone instead.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS** + design tokens (`styles/tokens.css`) · **Framer Motion** + **Lenis**
- **Vitest** unit tests · **GitHub Actions** CI · deployed on **Vercel**

## Quick start

```bash
npm install
cp .env.example .env.local   # every value is optional; the site runs with blanks
npm run dev                  # http://localhost:3000
```

Environment variables are listed in `.env.example`. Set them in Vercel → Settings →
Environment Variables, then redeploy. See `docs/RUNBOOK.md` for the Make scenario.

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
app/(marketing)    homepage, /demo, /book, /thank-you, legal pages
app/api            lead (enquiry → Make), health
components/demo    SurveyDemo: the interactive Solar Survey Engine demo
components/scenes  homepage sections
components/motion  MotionProvider, Reveal, Magnetic, Tilt, Counter
components/ui      buttons, logo, headings, primitives
lib                site config, faqs, calculator, example report, validators, lead-forward
tests              unit tests (calculator, validators, lead-forward)
docs               RUNBOOK, MOTION
```

## Honesty policy

No invented proof. Solardapt has no client results yet and the site says so. The
weekly report on the homepage and in the demo uses example figures, labelled as such.
The calculator multiplies only the visitor's own inputs: it is not a forecast. No
guarantees of surveys, installs or revenue anywhere on the site.
