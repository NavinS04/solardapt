'use client';

import { Star } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';

/*
 * Social proof. ONLY real testimonials should ship here. Until verified ones
 * exist we render clearly-marked placeholders and gate review badges behind
 * config flags defaulting to OFF (BUILD_SPEC §6.10). Never present invented
 * facts as real.
 */
// TODO: replace with real, verified testimonials (name, company, photo, result).
const TESTIMONIALS: { name: string; company: string; quote: string; result: string }[] = [];

// Gate each badge behind a flag — defaults OFF. Flip only when the account is real.
const BADGES = {
  google: process.env.NEXT_PUBLIC_BADGE_GOOGLE === 'true',
  trustpilot: process.env.NEXT_PUBLIC_BADGE_TRUSTPILOT === 'true',
  metaPartner: process.env.NEXT_PUBLIC_BADGE_META_PARTNER === 'true',
  clutch: process.env.NEXT_PUBLIC_BADGE_CLUTCH === 'true',
};

export function SocialProof() {
  const hasTestimonials = TESTIMONIALS.length > 0;
  const activeBadges = Object.entries(BADGES).filter(([, on]) => on);

  return (
    <section className="relative overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Proof"
          title="Results from solar installers we work with."
          subtitle="We only publish verified results. Yours could be next."
        />

        {activeBadges.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {activeBadges.map(([key]) => (
              <span key={key} className="rounded-full border border-border bg-muted px-4 py-2 text-xs capitalize text-muted-foreground">
                {key} verified
              </span>
            ))}
          </div>
        )}

        {hasTestimonials ? (
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.06}>
                <figure className="h-full rounded-md glass p-6">
                  <div className="mb-3 flex gap-0.5 text-solar-500">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-foreground">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="block text-muted-foreground">{t.company}</span>
                    <span className="mt-1 block text-solar-400">{t.result}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        ) : (
          // Graceful empty state — honest placeholder, no fabricated numbers.
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="flex h-full flex-col rounded-md border border-dashed border-border bg-bg-surface/40 p-6">
                  <div className="mb-3 flex gap-0.5 text-muted-foreground/40">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4" />
                    ))}
                  </div>
                  {/* TODO: real testimonial */}
                  <p className="text-sm text-muted-foreground">
                    Verified installer results will appear here as we publish them.
                  </p>
                  <p className="mt-auto pt-6 text-xs uppercase tracking-widest text-muted-foreground/60">
                    Awaiting verified result
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
