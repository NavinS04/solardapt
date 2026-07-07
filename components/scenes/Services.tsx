'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

// The engagement, stage by stage — land the core retainer, prove the diary
// fills, then optimise everything upstream of the install (ICP §8).
const STAGES = [
  {
    id: 'audit',
    label: 'Audit',
    body: 'We map your current enquiry flow, postcodes and economics — where the money leaks between click and diary — before a penny goes on ads.',
  },
  {
    id: 'build',
    label: 'Funnel build',
    body: 'Landing funnel and qualification logic built for your service area and your model — private-pay finance-ready, or correctly screened grant work.',
  },
  {
    id: 'launch',
    label: 'Ads live',
    body: 'Exclusive Meta campaigns in your postcode districts. Controlled spend, one ad set first, instrumented end-to-end. Billed transparently.',
  },
  {
    id: 'phones',
    label: 'Phones answered',
    body: 'Every enquiry answered live in your trading name, to a script you approve. Recordings available. You keep aftercare calls; we take new enquiries.',
  },
  {
    id: 'diary',
    label: 'Diary managed',
    body: 'Qualified callers become confirmed surveys in your calendar — confirmation call, reminders, reschedule handling, geographic clustering where possible.',
  },
  {
    id: 'optimise',
    label: 'Optimise & scale',
    body: 'We drive cost-per-confirmed-survey down and show-rate up, then scale spend only once the unit economics are proven in your numbers.',
  },
];

export function Services() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active]!;

  return (
    <section className="relative overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading eyebrow="The process" title="How we take over your front office." />

        <div className="mx-auto mt-16 max-w-4xl">
          {/* Timeline rail */}
          <div className="relative flex justify-between overflow-x-auto pb-2">
            <div className="absolute left-0 right-0 top-3 h-0.5 bg-white/10" />
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className="relative z-10 flex shrink-0 flex-col items-center gap-2 px-3"
                aria-pressed={active === i}
              >
                <span
                  className={`size-6 rounded-full border-2 transition-colors ${
                    i <= active ? 'border-solar-500 bg-solar-gradient' : 'border-white/20 bg-bg-1'
                  }`}
                />
                <span className={`text-xs ${active === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 rounded-md glass p-8"
            >
              <span className="text-sm font-semibold uppercase tracking-widest text-solar-500">
                Step {active + 1} · {stage.label}
              </span>
              <p className="mt-3 text-lg text-muted-foreground">{stage.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
