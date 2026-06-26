'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

// Mirrors the plan's execution roadmap: Foundation → Launch → Optimise → Scale.
const STAGES = [
  { id: 'audit', label: 'Audit', body: 'We map your current lead flow, offer and economics to find the gap — before spending a penny on ads.' },
  { id: 'build', label: 'Funnel build', body: 'Landing page, instant form and qualification logic built specifically for solar homeowners.' },
  { id: 'creative', label: 'Creative & copy', body: 'Solar-specific ad creative and messaging frameworks designed to stop the scroll and pre-sell the call.' },
  { id: 'launch', label: 'Launch', body: 'We go live with a controlled spend and a single ad set, instrumented end-to-end.' },
  { id: 'optimise', label: 'Optimise', body: 'We drive down cost-per-appointment and push up show-rate with continuous testing.' },
  { id: 'scale', label: 'Scale', body: 'Once the unit economics are proven, we scale spend and add retention so the pipeline compounds.' },
];

export function Services() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active]!;

  return (
    <section className="relative overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading eyebrow="The process" title="How we build your engine, step by step." />

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
