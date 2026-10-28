'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotionSafe } from '@/components/motion/MotionProvider';

// The Solar Survey Engine: five stages, each removing one leak between
// "I saw your ad" and "the surveyor's here".
const NODES = [
  { title: 'Capture', detail: 'Exclusive ads in your own Meta account, into an enquiry form that asks homeowner, property, roof, bill and timeframe.' },
  { title: 'Contact', detail: 'Text and email to the homeowner within a minute, and an alert to you with their answers and score.' },
  { title: 'Book', detail: 'Homeowners pick a survey slot from your availability. Confirmation, then reminders the day before and on the morning.' },
  { title: 'Recover', detail: 'No-shows get a rebooking text and a callback task for your team. Anyone who replies or opts out stops instantly.' },
  { title: 'Report', detail: 'One page a week: spend, enquiries, qualified, booked, attended, and cost per attended survey.' },
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
          eyebrow="The Solar Survey Engine"
          title="From ad to attended survey. One system."
          subtitle="Five stages, each removing one specific leak. Nothing is added just to look bigger."
        />

        <div ref={ref} className="relative mt-20">
          {/* The connecting rail */}
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

          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
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

        <div className="mt-16 flex justify-center">
          <Link href="/demo" className="group inline-flex items-center gap-2 font-semibold text-solar-400 hover:text-solar-500">
            Watch it handle an enquiry, live
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
