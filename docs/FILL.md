# ‹FILL› index — owner must supply before launch

Do not invent these. Build components exist; they render placeholders/empty
states until real data arrives.

## Proof & content
- [ ] Real testimonials: name, company, photo, quote, result
      (`components/scenes/SocialProof.tsx`)
- [ ] Review-platform accounts + counts — flip the `NEXT_PUBLIC_BADGE_*` flags
      ON only when genuinely present
- [ ] VSL video URL + poster image (`NEXT_PUBLIC_VSL_URL`, `/public/brand/vsl-poster.jpg`)
- [ ] Real social URLs (FB/IG/LinkedIn/X/TikTok/YouTube) — `lib/site.ts`; omit any that don't exist
- [ ] Business phone — `lib/site.ts`
- [ ] Pricing/terms (FAQ + Terms page)

## Brand assets (`/public/brand`)
- [ ] `solardapt-logo.png`, `og.png`, `vsl-poster.jpg`

## Integrations (env)
- [ ] Calendly account + event link (`NEXT_PUBLIC_CALENDLY_URL`, `CALENDLY_WEBHOOK_SECRET`)
- [ ] Meta Pixel ID + CAPI token + dataset ID
- [ ] GA4 measurement ID + GTM container ID
- [ ] Resend domain + API key
- [ ] Twilio number + credentials
- [ ] Clerk publishable + secret keys
- [ ] Postgres (`DATABASE_URL`) + Upstash Redis URLs
- [ ] Sentry DSN

## Legal & config
- [ ] Legal entity details for policies (controller, address, company number)
- [ ] A qualified lawyer to review all legal pages
- [ ] Region currency defaults for the calculator (`components/scenes/Calculator.tsx`)
- [ ] Retention periods (Privacy Policy)
