'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotionSafe } from '@/components/motion/MotionProvider';

// Approximate node positions on an equirectangular map (percentages).
// UK-first; expansion markets per the ICP manual.
const MARKETS = [
  { name: 'UK', x: 47, y: 29, primary: true },
  { name: 'Ireland', x: 44, y: 32, primary: false },
  { name: 'USA', x: 22, y: 38, primary: false },
  { name: 'Australia', x: 83, y: 72, primary: false },
  { name: 'Middle East', x: 58, y: 44, primary: false },
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
          title="Built for the UK. Ready for the world."
          subtitle="UK-first — fluent in MCS, SEG, DNO and the VAT window — expanding across Ireland, the USA, Australia and the Middle East."
        />

        <div
          ref={ref}
          className="relative mx-auto mt-16 aspect-[2/1] w-full max-w-4xl rounded-md glass"
          role="img"
          aria-label="World map highlighting Solardapt's markets: UK first, then Ireland, USA, Australia and the Middle East."
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
                className={`block rounded-full bg-solar-gradient shadow-glow ${m.primary ? 'size-4' : 'size-3'}`}
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.2, type: 'spring', stiffness: 200, damping: 12 }}
              />
              <span
                className={`absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-xs ${
                  m.primary ? 'font-semibold text-solar-400' : 'text-muted-foreground'
                }`}
              >
                {m.name}
                {m.primary && ' · HQ'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
