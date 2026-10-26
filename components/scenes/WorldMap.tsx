'use client';

import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useReducedMotionSafe } from '@/components/motion/MotionProvider';

/*
 * Interactive 3D market panel. The whole scene sits in a perspective camera
 * and leans with the cursor; markers, connection arcs and the caption float
 * at different depths so the parallax reads as real 3D. Reduced motion gets
 * the same panel, static. We serve every market, led by the four below.
 */
const MARKETS = [
  { name: 'UK', x: 47, y: 26, hub: true },
  { name: 'USA', x: 20, y: 36 },
  { name: 'Middle East', x: 58, y: 46 },
  { name: 'Australia', x: 82, y: 70 },
];

const HUB = MARKETS[0]!;

export function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduced = useReducedMotionSafe();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 80, damping: 16 });
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 80, damping: 16 });

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <section className="relative overflow-hidden bg-bg-0 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Markets"
          title="Wherever installers work, we work."
          subtitle="Every market is welcome. We lead with the UK, USA, Australia and the Middle East."
        />

        <div className="mt-16 [perspective:1200px]">
          <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={reset}
            style={{
              rotateX: reduced ? 0 : rotateX,
              rotateY: reduced ? 0 : rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative mx-auto aspect-[4/3] w-full max-w-4xl rounded-md glass sm:aspect-[2/1]"
            role="img"
            aria-label="Three dimensional map showing Solardapt serving every market, led by the UK, USA, Australia and the Middle East."
          >
            {/* Base plane: dotted globe grid + atmosphere sheen */}
            <div
              className="absolute inset-0 rounded-md opacity-30"
              style={{
                backgroundImage: 'radial-gradient(var(--ink-500) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
            <div
              className="absolute inset-0 rounded-md"
              style={{
                background:
                  'radial-gradient(60% 80% at 50% 20%, rgba(248,152,24,0.10), transparent 70%)',
              }}
            />

            {/* Connection arcs from the UK hub, floating above the base */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ transform: 'translateZ(24px)' }}
              aria-hidden="true"
            >
              {MARKETS.filter((m) => !m.hub).map((m, i) => {
                const midX = (HUB.x + m.x) / 2;
                const midY = Math.min(HUB.y, m.y) - 16;
                return (
                  <motion.path
                    key={m.name}
                    d={`M ${HUB.x} ${HUB.y} Q ${midX} ${midY} ${m.x} ${m.y}`}
                    fill="none"
                    stroke="var(--solar-500)"
                    strokeWidth="0.35"
                    strokeDasharray="2 1.4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 0.7 } : {}}
                    transition={{ duration: 1.4, delay: 0.4 + i * 0.3, ease: 'easeInOut' }}
                  />
                );
              })}
            </svg>

            {/* Market markers, lifted off the plane */}
            {MARKETS.map((m, i) => (
              <div
                key={m.name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translateZ(46px)' }}
              >
                {!reduced && (
                  <motion.span
                    className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-solar-500/40"
                    animate={inView ? { scale: [0.8, 2.6], opacity: [0.8, 0] } : {}}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
                  />
                )}
                <motion.span
                  className={`block rounded-full bg-solar-gradient shadow-glow ${m.hub ? 'size-4' : 'size-3'}`}
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.2 + i * 0.18, type: 'spring', stiffness: 200, damping: 12 }}
                />
                <span
                  className={`absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-xs ${
                    m.hub ? 'font-semibold text-solar-400' : 'text-muted-foreground'
                  }`}
                >
                  {m.name}
                  {m.hub && ' · HQ'}
                </span>
              </div>
            ))}

            {/* Floating caption, nearest the camera */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              style={{ transform: 'translateZ(64px)' }}
            >
              <span className="glass whitespace-nowrap rounded-full px-4 py-1.5 text-xs text-muted-foreground">
                One installer per district, in any market
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
