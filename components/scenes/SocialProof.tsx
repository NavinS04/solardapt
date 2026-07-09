'use client';

import { PhoneCall, MapPin, CalendarCheck } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';

/*
 * Proof section. Until verified client results exist, we show the situations
 * we are built to fix, written as before and after vignettes and clearly
 * labelled as illustrative. Real, named client results replace these the
 * moment they are verified. Publishing invented reviews under real sounding
 * names is banned practice under the UK DMCC Act 2024 and the FTC rule on
 * fake testimonials, so we do not do it.
 */
const VIGNETTES = [
  {
    icon: PhoneCall,
    before: 'Enquiries ringing out to voicemail while the owner is on a roof.',
    after:
      'Every call answered live in the trading name, qualified on the spot and booked before a competitor returns the voicemail.',
    tag: 'Live call answering',
  },
  {
    icon: MapPin,
    before: 'Paying for the same shared lead as three other firms.',
    after:
      'Enquiries generated for one installer only, with postcode district exclusivity written into the agreement.',
    tag: 'Exclusive by district',
  },
  {
    icon: CalendarCheck,
    before: 'Scaffold booked twice in a month for surveys that never showed.',
    after:
      'Confirmation calls, reminders and reschedule handling on every booking, backed by a replacement policy for no shows.',
    tag: 'Show rate protection',
  },
];

export function SocialProof() {
  return (
    <section className="relative overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The switch"
          title="What changes when we take the front office."
          subtitle="Verified client results are published here as they land. Until then, this is the change installers come to us for."
        />

        <div className="mt-6 flex justify-center">
          <Badge>Illustrative scenarios, not client reviews</Badge>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {VIGNETTES.map((v, i) => (
            <Reveal key={v.tag} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-md glass p-7">
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-md bg-solar-500/10 text-solar-400">
                  <v.icon className="size-6" />
                </div>
                <p className="text-sm text-muted-foreground line-through decoration-error/60">
                  {v.before}
                </p>
                <p className="mt-4 text-sm text-foreground">{v.after}</p>
                <span className="mt-auto pt-6 text-xs font-semibold uppercase tracking-widest text-solar-500">
                  {v.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
