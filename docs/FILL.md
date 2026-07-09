# ‹FILL› index — owner must supply before launch

Do not invent these. Build components exist; they render placeholders/empty
states until real data arrives.

## Proof & content
- [ ] Real testimonials: name, company, photo, quote, result
      (`components/scenes/SocialProof.tsx`)
- [ ] Review-platform accounts + counts — flip the `NEXT_PUBLIC_BADGE_*` flags
      ON only when genuinely present
- [ ] VSL video URL + poster image (`NEXT_PUBLIC_VSL_URL`, `/public/brand/vsl-poster.jpg`)
- [x] Social URLs — Instagram, Facebook, TikTok, LinkedIn wired in `lib/site.ts`
- [x] Business phone — +44 7427 845540 (`lib/site.ts`)
- [ ] Pricing/terms (FAQ + Terms page)

## Brand assets (`/public/brand`)
- [ ] `solardapt-logo.png`, `og.png`, `vsl-poster.jpg`

## GoHighLevel (the backend)
- [ ] `GHL_INBOUND_WEBHOOK_URL` — create an Inbound Webhook trigger in a GHL Workflow
- [ ] Map incoming fields → GHL contact fields (see README / RUNBOOK)
- [ ] Build nurture (SMS + email), pipeline and reminder workflows in GHL
- [ ] Configure the **Calendly ↔ GHL** sync inside GHL
- [ ] Complete **A2P 10DLC** (SMS) and **email domain authentication** inside GHL

## Booking & tracking (env)
- [x] Calendly event link — https://calendly.com/navinsonsana-solardapt/30min
- [ ] Meta Pixel ID + CAPI token + dataset ID
- [ ] GA4 measurement ID + GTM container ID
- [ ] Sentry DSN (optional, recommended)

## Legal & config
- [ ] Legal entity details for policies (controller, address, company number)
- [ ] A qualified lawyer to review all legal pages
- [ ] Region currency defaults for the calculator (`components/scenes/Calculator.tsx`)
- [ ] Retention periods (Privacy Policy)
