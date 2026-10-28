'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { EXAMPLE_CHANGES, EXAMPLE_REPORT, exampleCostPerAttended } from '@/lib/example-report';

// The weekly report every client gets, shown with example figures.
const STAGES = [
  { label: 'Enquiries', value: EXAMPLE_REPORT.enquiries },
  { label: 'Qualified', value: EXAMPLE_REPORT.qualified },
  { label: 'Surveys booked', value: EXAMPLE_REPORT.booked },
  { label: 'Surveys attended', value: EXAMPLE_REPORT.attended },
];

export function Dashboard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <section id="report" className="relative scroll-mt-24 overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The weekly report"
          title="Cost per attended survey. Not cost per click."
          subtitle="One page, every week, in plain numbers, with what we changed and why. You judge the system on surveys that actually happened."
        />

        <div ref={ref} className="mx-auto mt-16 max-w-5xl">
          <div className="mb-4 flex justify-end">
            <Badge>Example figures showing the format. Not client results.</Badge>
          </div>

          <div className="glass rounded-md p-6 sm:p-8">
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <span className="font-medium">Weekly report: example installer</span>
              <span className="text-sm text-muted-foreground">
                Ad spend <b className="text-foreground">£{EXAMPLE_REPORT.spend}</b>
              </span>
            </div>

            <ol className="space-y-3" aria-label="Enquiry to attended survey funnel">
              {STAGES.map((stage, i) => (
                <li key={stage.label} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 text-sm text-muted-foreground sm:w-40">{stage.label}</span>
                  <div className="h-10 flex-1 overflow-hidden rounded-sm bg-white/5">
                    <motion.div
                      className="flex h-full items-center justify-end rounded-sm bg-solar-gradient pr-3 text-sm font-semibold text-white"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${(stage.value / EXAMPLE_REPORT.enquiries) * 100}%` } : {}}
                      transition={{ delay: 0.15 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {stage.value}
                    </motion.div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="rounded-md bg-bg-0 px-6 py-4 text-center">
                <div className="font-display text-3xl font-bold text-gradient">£{exampleCostPerAttended.toFixed(2)}</div>
                <p className="mt-1 text-xs text-muted-foreground">Cost per attended survey</p>
              </div>
              <p className="text-sm text-muted-foreground">
                <b className="text-foreground">What we changed this week:</b> {EXAMPLE_CHANGES.changed}{' '}
                <b className="text-foreground">Next week:</b> {EXAMPLE_CHANGES.next}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
