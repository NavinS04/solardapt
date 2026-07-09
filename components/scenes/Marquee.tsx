'use client';

import { useReducedMotionSafe } from '@/components/motion/MotionProvider';

const ITEMS = [
  'Postcode exclusive',
  'Live call answering',
  'Confirmed surveys',
  'Show rate protection',
  'Screened enquiries',
  '30 day rolling terms',
  'Your script, your rules',
  'UK based',
];

/** Kinetic keyword strip under the hero — content duplicated for a seamless
 * loop; static row under reduced motion. */
export function Marquee() {
  const reduced = useReducedMotionSafe();
  const row = (key: string) => (
    <div key={key} className="flex items-center" aria-hidden={key === 'b'}>
      {ITEMS.map((item) => (
        <span
          key={`${key}-${item}`}
          className="flex items-center gap-6 whitespace-nowrap px-6 text-sm uppercase tracking-[0.2em] text-muted-foreground"
        >
          {item}
          <span className="h-1 w-1 rounded-full bg-solar-500" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-border bg-bg-1/60 py-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg-0 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg-0 to-transparent" />
      {reduced ? (
        <div className="flex flex-wrap justify-center gap-y-2">{row('a')}</div>
      ) : (
        <div className="marquee-track">
          {row('a')}
          {row('b')}
        </div>
      )}
    </div>
  );
}
