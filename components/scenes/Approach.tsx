'use client';

import { Quote, CalendarX2, Wrench, MapPinOff, BadgeX } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';

/*
 * How Navin thinks and the calls he will make, in his own voice. Everything
 * here is either his real background or a commitment about how he works.
 * No client stories: there are none yet, and we do not invent them.
 */
const NO_CALLS = [
  {
    icon: CalendarX2,
    title: 'If your diary is already full',
    detail:
      'I’ll tell you to wait. Booking surveys you can’t get to only costs you reviews and goodwill.',
  },
  {
    icon: Wrench,
    title: 'If the leak is after the survey',
    detail:
      'Slow quotes or a weak close won’t be fixed by more bookings. I’ll say so, rather than sell you the wrong fix.',
  },
  {
    icon: MapPinOff,
    title: 'If you can’t cover an area',
    detail:
      'We don’t run ads there. A homeowner who waits a fortnight for a surveyor remembers your name for the wrong reason.',
  },
  {
    icon: BadgeX,
    title: 'If you want guaranteed installs',
    detail:
      'I won’t promise them. Results depend on your team and your area as much as my system, and anyone who guarantees them is guessing with your money.',
  },
];

export function Approach() {
  return (
    <section id="approach" className="relative scroll-mt-24 overflow-hidden bg-bg-0 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="How I work"
          title="More enquiries won’t fix a leak."
          subtitle="Most installers don’t need more people asking. They need more of the people who ask to end up with a surveyor at the door. That gap is the only thing I work on."
        />

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal>
            <figure className="glow-border relative flex h-full flex-col rounded-md glass p-8">
              <Quote className="size-8 text-solar-400" aria-hidden="true" />
              <blockquote className="mt-4 font-display text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold leading-snug">
                I treat an enquiry that goes quiet the way I treat a fault: find where it fails, fix
                the cause, then measure that it stays fixed.
              </blockquote>
              <figcaption className="mt-auto pt-6 text-sm text-muted-foreground">
                Navin Sonsana, founder
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col gap-4 rounded-md glass p-8 text-muted-foreground">
              <p>
                My day job is product integrity engineering: tracing why something went wrong, proving
                the cause with data, and making sure the fix holds. I build the Solar Survey Engine the
                same way, step by step, with every stage counted.
              </p>
              <p>
                Before that I ran bars on matchdays. A queue you don’t serve in the first minute walks
                to the next bar. Homeowners asking about solar are no different: the installer who
                answers first usually gets the survey.
              </p>
              <p className="text-foreground">
                So every enquiry gets a reply within a minute, the homeowner picks their own survey
                time, and I report every week on what actually happened.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <h3 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            When I’ll tell you no
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Good judgement is knowing when not to take the money. These are the calls I’ll make, and
            you’ll hear them on the first walkthrough.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {NO_CALLS.map((call, i) => (
              <Reveal key={call.title} delay={i * 0.06}>
                <div className="flex h-full gap-4 rounded-md glass p-6">
                  <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-solar-500/10 text-solar-400">
                    <call.icon className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{call.title}</h4>
                    <p className="mt-1.5 text-sm text-muted-foreground">{call.detail}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
