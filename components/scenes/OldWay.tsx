'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const BROKEN = [
  { label: 'Boosted posts', detail: 'No offer, no qualification — clicks that never call back.' },
  { label: 'Shared lead lists', detail: 'The same homeowner sold to five of your competitors.' },
  { label: 'Referrals only', detail: 'Unpredictable and impossible to scale on demand.' },
];

export function OldWay() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section className="relative overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The old way"
          title="The leaky pipeline most installers run."
          subtitle="Traditional marketing leaks money at every stage — and you feel it in your calendar."
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
          There&apos;s a better way to fill the calendar →
        </p>
      </div>
    </section>
  );
}
