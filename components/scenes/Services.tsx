'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

// From yes to live: the onboarding path, stage by stage. Target is live
// within about 14 days of receiving access.
const STAGES = [
  {
    id: 'call',
    label: 'Walkthrough',
    body: '20 minutes on your current enquiry flow, areas and numbers. You get a straight answer on whether this is a fit, and which postcode districts are still free.',
  },
  {
    id: 'access',
    label: 'Kick-off',
    body: 'Agreement and data processing agreement signed. You give partner access to your Meta account, your survey availability and where alerts should go.',
  },
  {
    id: 'build',
    label: 'Build',
    body: 'Enquiry form and qualifying questions for your area and offer, the instant text and email, survey booking, reminders and the no-show route, all in your name.',
  },
  {
    id: 'test',
    label: 'Test',
    body: 'Every path run end to end on a real phone before launch: a booked homeowner is never chased, STOP stops everything, nothing sends late at night.',
  },
  {
    id: 'launch',
    label: 'Ads live',
    body: 'Daily budget agreed with you in writing first, paid by you directly to Meta. Enquiries start flowing into the system the same day.',
  },
  {
    id: 'report',
    label: 'Weekly report',
    body: 'Every week: spend, enquiries, qualified, booked, attended and cost per attended survey, plus a short call in the first month on what we are changing.',
  },
];

export function Services() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active]!;

  return (
    <section className="relative overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading eyebrow="Getting started" title="From yes to live in about 14 days." />

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
