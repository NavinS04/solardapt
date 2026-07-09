'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';

// The three ways installer marketing money dies (ICP §1.3, §3.3).
const BROKEN = [
  {
    label: 'Shared-lead platforms',
    detail:
      'GreenMatch, Bark and MyBuilder sell the same homeowner to several firms at once. They are sick of the phone before you have even called.',
  },
  {
    label: '“Free grant” clickbait',
    detail:
      'Floods of renters and ineligible enquiries that poison the diary with surveys that can never convert.',
  },
  {
    label: 'The missed-call graveyard',
    detail:
      'Ads work and the phone rings. Then it rings out, because you are on a roof. The enquiry goes cold within the hour.',
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
          title="Most installer campaigns don’t fail at the click."
          subtitle="They fail at the phone. That is where your last marketing budget died."
        />

        <div ref={ref} className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-3">
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
        <p className="mt-12 text-center text-lg text-muted-foreground">
          There&apos;s a better way to fill the diary →
        </p>
      </div>
    </section>
  );
}
