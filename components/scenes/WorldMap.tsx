'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotionSafe } from '@/components/motion/MotionProvider';

// Approximate node positions on an equirectangular map (percentages).
const MARKETS = [
  { name: 'UK', x: 47, y: 30 },
  { name: 'USA', x: 22, y: 38 },
  { name: 'Australia', x: 83, y: 72 },
  { name: 'Middle East', x: 58, y: 44 },
];

export function WorldMap() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduced = useReducedMotionSafe();

  return (
    <section className="relative overflow-hidden bg-bg-0 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Markets"
          title="Booking homeowner appointments across four markets."
          subtitle="UK · USA · Australia · Middle East."
        />

        <div
          ref={ref}
          className="relative mx-auto mt-16 aspect-[2/1] w-full max-w-4xl rounded-md glass"
          role="img"
          aria-label="World map highlighting Solardapt's markets: UK, USA, Australia and the Middle East."
        >
          {/* Dotted-grid world stand-in (lightweight; swap for an R3F globe later). */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(var(--ink-500) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
          {MARKETS.map((m, i) => (
            <div key={m.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
              {!reduced && (
                <motion.span
                  className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-solar-500/40"
                  animate={inView ? { scale: [0.8, 2.6], opacity: [0.8, 0] } : {}}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
                />
              )}
              <motion.span
                className="block size-3 rounded-full bg-solar-gradient shadow-glow"
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.2, type: 'spring', stiffness: 200, damping: 12 }}
              />
              <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground">
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
