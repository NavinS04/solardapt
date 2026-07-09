'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Counter } from '@/components/motion/Counter';
import { Badge } from '@/components/ui/Badge';

// NOTE: illustrative sample data only — clearly labelled, never presented as a
// real client result. Replace with verified numbers when they exist.
const BARS = [24, 38, 31, 52, 47, 63, 71, 68, 84];

export function Dashboard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <section id="results" className="relative overflow-hidden bg-bg-1 py-28 scroll-mt-24">
      <div className="container">
        <SectionHeading
          eyebrow="The outcome"
          title="What a sorted diary looks like."
          subtitle="Confirmed surveys climbing, crews routed efficiently and revenue you can forecast through the winter, not just the summer."
        />

        <div ref={ref} className="mx-auto mt-16 max-w-5xl">
          <div className="mb-4 flex justify-end">
            <Badge>Illustrative sample data</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: 'Confirmed surveys / month', value: 28, suffix: '' },
              { label: 'Show rate', value: 78, suffix: '%' },
              { label: 'Diary booked ahead', value: 100, suffix: '%' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-md p-6 text-center">
                <div className="font-display text-4xl font-bold text-gradient">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Climbing surveys chart */}
          <div className="mt-6 glass rounded-md p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium">Confirmed surveys, week by week</span>
              <span className="text-xs text-success">▲ Trending up</span>
            </div>
            <div className="flex h-48 items-end gap-3">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-solar-gradient"
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${h}%` } : {}}
                  transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              The comparison that matters: an exclusive, screened, confirmed survey converts at a
              different order of magnitude to a shared lead sold to five of your competitors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
