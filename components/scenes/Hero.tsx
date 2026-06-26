'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { ease } from '@/lib/motion';
import { useReducedMotionSafe } from '@/components/motion/MotionProvider';
import { VslModal } from './VslModal';

const HEADLINE = ['Predictable', 'Solar', 'Leads.', 'Booked', 'Every', 'Week.'];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionSafe();
  const [vslOpen, setVslOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sunY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '30%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-12%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, reduced ? 1 : 0]);

  return (
    <section
      ref={ref}
      className="relative grain flex min-h-[100svh] items-center overflow-hidden bg-bg-0"
    >
      {/* Animated sunrise scene */}
      <motion.div style={{ y: sunY }} className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Rising sun glow */}
        <div className="absolute bottom-[-30%] left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full bg-solar-gradient opacity-25 blur-[120px] animate-sun-rise" />
        {/* Light rays */}
        <div className="absolute bottom-0 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2 mesh-bg" />
        {/* Horizon line */}
        <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-solar-500/40 to-transparent" />
        {/* Drifting particles */}
        {!reduced &&
          Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-solar-400/60"
              style={{ left: `${(i * 53) % 100}%`, bottom: `${(i * 31) % 60}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          ))}
      </motion.div>

      <motion.div style={{ y: contentY, opacity }} className="container relative pt-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.out }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Exclusive appointments for solar
          installers
        </motion.p>

        {/* Masked word-by-word headline reveal */}
        <h1 className="mx-auto max-w-4xl font-display text-[clamp(2.75rem,8vw,6rem)] font-bold leading-[0.95] tracking-tight">
          {HEADLINE.map((word, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: ease.out, delay: 0.15 + i * 0.08 }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <span className="mt-2 block text-gradient">Without Buying Shared Leads.</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.out, delay: 0.8 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          We build high-converting Meta advertising systems that deliver exclusive homeowner
          appointments directly into your calendar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.out, delay: 0.95 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic>
            <Button size="lg" onClick={() => (window.location.href = '/book')}>
              Book Free Strategy Call <ArrowRight className="size-4" />
            </Button>
          </Magnetic>
          <Button size="lg" variant="secondary" onClick={() => setVslOpen(true)}>
            <Play className="size-4" /> Watch How It Works
          </Button>
        </motion.div>

        {/* Trust strip — markets only. ‹FILL› real proof badges once verified. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-wider text-muted-foreground"
        >
          <span>Exclusive leads</span>
          <span className="text-solar-500">·</span>
          <span>UK</span>
          <span className="text-solar-500">·</span>
          <span>USA</span>
          <span className="text-solar-500">·</span>
          <span>Australia</span>
          <span className="text-solar-500">·</span>
          <span>Middle East</span>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      {!reduced && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-border p-1.5">
            <span className="h-2 w-1 rounded-full bg-solar-500" />
          </div>
        </motion.div>
      )}

      <VslModal open={vslOpen} onClose={() => setVslOpen(false)} />
    </section>
  );
}
