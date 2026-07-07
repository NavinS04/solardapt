'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';

// Pain points straight from the ICP manual — UK installer vocabulary.
const PAINS = [
  'Shared leads sold to 3–6 competing firms',
  '“Free solar grant” clickbait filling the diary with renters and grant tourists',
  'Scaffold booked, customer no-shows — £600–£1,200 gone before a panel is lifted',
  'Enquiries ringing out to voicemail while you’re on a roof',
  'The November–January trough with crews still on payroll',
  'Surveyors walking when the diary runs thin',
  'Checkatrade & directory rankings you don’t control',
  'Quoted-not-signed jobs nobody has time to chase',
];

export function Problem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });

  return (
    <section className="relative overflow-hidden bg-bg-0 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The problem"
          title="Empty diaries kill solar businesses."
          subtitle="You don’t need clicks. You need sat surveys with people who actually own the roof."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Animated empty-diary + flat-lining revenue */}
          <Reveal>
            <div className="glass rounded-md p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your survey diary</span>
                <span className="text-xs text-error">Mostly empty</span>
              </div>
              <div ref={ref} className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, i) => {
                  const booked = [9, 17, 24].includes(i);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: i * 0.012 }}
                      className={`aspect-square rounded-sm ${
                        booked ? 'bg-solar-gradient' : 'bg-white/5'
                      }`}
                    />
                  );
                })}
              </div>
              {/* Flat-lining revenue line */}
              <svg viewBox="0 0 300 60" className="mt-6 h-16 w-full">
                <motion.path
                  d="M0 30 L120 28 L160 30 L300 31"
                  fill="none"
                  stroke="var(--error)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                />
              </svg>
              <p className="text-xs text-muted-foreground">
                Fixed crew costs against volatile demand — the feast-or-famine cycle.
              </p>
            </div>
          </Reveal>

          <ul className="grid gap-3 sm:grid-cols-2">
            {PAINS.map((pain, i) => (
              <Reveal as="li" key={pain} delay={i * 0.05}>
                <div className="flex items-start gap-3 rounded-md border border-border bg-bg-surface/50 p-4">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
                  <span className="text-sm text-muted-foreground">{pain}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
