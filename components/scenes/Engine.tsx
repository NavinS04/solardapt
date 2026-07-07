'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotionSafe } from '@/components/motion/MotionProvider';

// The "Solardapt Engine" — the full front office, visualised (ICP §1.3).
const NODES = [
  { title: 'Exclusive Ads', detail: 'Solar-specific Meta ads run for you alone in your postcode districts.' },
  { title: 'Conversion Funnel', detail: 'A landing funnel built to pre-sell the survey, not collect clicks.' },
  { title: 'Live Call Answering', detail: 'Every enquiry answered in your trading name — no voicemail graveyard.' },
  { title: 'Qualification', detail: 'Homeowner, roof basics, finance-readiness or grant eligibility — screened before booking.' },
  { title: 'Confirmed Survey', detail: 'Booked into your diary with confirmation call, reminders and reschedule handling.' },
  { title: 'Your Crew Installs', detail: 'Your only job: send a surveyor. Scaffold sequenced, diary sorted.' },
];

export function Engine() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduced = useReducedMotionSafe();

  return (
    <section id="engine" className="relative overflow-hidden bg-bg-0 py-28 scroll-mt-24">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-50" aria-hidden="true" />
      <div className="container relative">
        <SectionHeading
          eyebrow="The Solardapt Engine"
          title="Your entire front office. One system."
          subtitle="We run the ads, own the phones, qualify every enquiry, and hand your surveyors a full, sorted diary."
        />

        <div ref={ref} className="relative mt-20">
          {/* The connecting funnel rail */}
          <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-white/10 lg:block">
            <motion.div
              className="h-full origin-left bg-solar-gradient"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
            />
            {/* Travelling lead particle, qualifying as it goes */}
            {!reduced && (
              <motion.span
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-solar-400 shadow-glow"
                initial={{ left: '0%' }}
                animate={inView ? { left: '100%' } : {}}
                transition={{ duration: 2.4, ease: 'easeInOut', delay: 0.4 }}
              />
            )}
          </div>

          <ol className="grid gap-6 lg:grid-cols-6">
            {NODES.map((node, i) => (
              <motion.li
                key={node.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.18, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full glass">
                  <motion.span
                    className="text-lg font-bold text-gradient"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: 0.4 + i * 0.18, type: 'spring', stiffness: 200, damping: 14 }}
                  >
                    {i + 1}
                  </motion.span>
                </div>
                <h3 className="text-center text-sm font-semibold">{node.title}</h3>
                <p className="mt-1.5 text-center text-xs text-muted-foreground">{node.detail}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
