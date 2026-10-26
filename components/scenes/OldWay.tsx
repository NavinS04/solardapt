'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';

// The four ways installer ad spend is lost after the click.
const BROKEN = [
  {
    label: 'Shared-lead platforms',
    detail:
      'Aggregators sell the same homeowner to several firms at once. They are sick of the phone before you have even called.',
  },
  {
    label: '“Free grant” clickbait',
    detail:
      'Floods of renters and ineligible enquiries that poison the diary with surveys that can never convert.',
  },
  {
    label: 'The missed-call graveyard',
    detail:
      'The enquiry lands while your team is on a roof. By the time someone calls back, the homeowner has booked whoever rang first.',
  },
  {
    label: 'Booked, then no-show',
    detail:
      'A survey in the diary is not a survey that happens. Without reminders and a rebooking route, the slot and the drive are wasted.',
  },
];

export function OldWay() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section className="relative overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The old way"
          title="Ad spend isn’t lost at the click."
          subtitle="It’s lost in the hour after, when nobody gets back to the homeowner in time."
        />

        <div ref={ref} className="mx-auto mt-16 grid grid-cols-1 max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BROKEN.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-md border border-error/20 bg-bg-surface/60 p-6"
            >
              {/* "Leak" drip */}
              <motion.span
                className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-error/50"
                animate={inView ? { y: [0, 20], opacity: [1, 0] } : {}}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}
              />
              <h3 className="font-semibold text-foreground">{item.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </motion.div>
          ))}
        </div>
        <figure className="mx-auto mt-14 max-w-2xl text-center">
          <blockquote className="text-lg text-foreground">
            “Firms that contacted online leads within an hour were nearly seven times as likely to
            qualify them as firms that waited longer.”
          </blockquote>
          <figcaption className="mt-3 text-sm text-muted-foreground">
            Harvard Business Review, 2011
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
