'use client';

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useRef, useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { ease } from '@/lib/motion';
import { useReducedMotionSafe } from '@/components/motion/MotionProvider';
import { VslModal } from './VslModal';

/*
 * Hero structure (per owner spec):
 *   line 1 — eyebrow: who this is for
 *   line 2 — headline: the goal of the installers we target
 *   line 3 — sub-headline: who we are NOT for
 *
 * Scene layers (back → front): star field → aurora blobs → rotating light
 * rays → rising sun glow → perspective horizon grid → content. The whole
 * scene tilts subtly with the cursor and parallaxes on scroll. Every layer is
 * transform/opacity only and collapses to a static backdrop under
 * prefers-reduced-motion.
 */
const HEADLINE = ['A', 'Full', 'Diary.', 'Booked', 'Crews.', 'Predictable', 'Revenue.'];

// Deterministic pseudo-random star placement (stable between server/client).
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: ((i * 47) % 100) + (i % 3),
  top: ((i * 29) % 55) + 2,
  size: (i % 3) + 1,
  delay: (i % 7) * 0.45,
}));

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionSafe();
  const [vslOpen, setVslOpen] = useState(false);

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '28%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-14%']);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, reduced ? 1 : 0]);

  // Cursor parallax tilt — the scene leans gently toward the pointer.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 60, damping: 20 });
  const tiltY = useSpring(useTransform(my, [0, 1], [-10, 10]), { stiffness: 60, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative grain flex min-h-[100svh] items-center overflow-hidden bg-bg-0"
    >
      {/* ── Scene ─────────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: sceneY, x: reduced ? 0 : tiltX, rotateX: 0 }}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {/* Star field */}
        {!reduced &&
          STARS.map((s, i) => (
            <span
              key={i}
              className="twinkle absolute rounded-full bg-white/70"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}

        {/* Aurora blobs */}
        <div
          className="aurora h-[55vh] w-[55vh] opacity-25"
          style={{ left: '8%', top: '6%', background: 'var(--solar-400)', animationDelay: '0s', animationDuration: reduced ? '0s' : undefined }}
        />
        <div
          className="aurora h-[45vh] w-[45vh] opacity-20"
          style={{ right: '4%', top: '18%', background: 'var(--solar-600)', animationDelay: '-6s' }}
        />
        <div
          className="aurora h-[38vh] w-[38vh] opacity-15"
          style={{ left: '38%', top: '34%', background: '#7dd3fc', animationDelay: '-12s' }}
        />

        {/* Rotating volumetric rays */}
        {!reduced && <div className="sun-rays" />}

        {/* Rising sun glow */}
        <motion.div
          style={{ y: reduced ? 0 : tiltY }}
          className="absolute bottom-[-32%] left-1/2 h-[85vh] w-[85vh] -translate-x-1/2 rounded-full bg-solar-gradient opacity-30 blur-[110px] animate-sun-rise"
        />
        {/* Sun core */}
        <div className="absolute bottom-[6%] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-solar-gradient opacity-70 blur-2xl" />

        {/* Horizon line + perspective grid */}
        <div className="absolute bottom-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-solar-500/50 to-transparent" />
        {!reduced && <div className="horizon-grid" />}
      </motion.div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <motion.div style={{ y: contentY, opacity }} className="container relative pt-24 text-center">
        {/* Line 1 — eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.out }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-solar-500/30 bg-solar-500/5 px-4 py-1.5 text-xs uppercase tracking-widest text-solar-400 backdrop-blur-sm"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          For established residential solar installers
        </motion.p>

        {/* Line 2 — headline (goal), masked word-by-word + sheen kicker */}
        <h1 className="mx-auto max-w-4xl font-display text-[clamp(2.75rem,8vw,6rem)] font-bold leading-[0.95] tracking-tight">
          {HEADLINE.map((word, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: '110%', rotate: 4 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.9, ease: ease.out, delay: 0.15 + i * 0.08 }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <span className="mt-2 block overflow-hidden pb-2">
            <motion.span
              className={`inline-block ${reduced ? 'text-gradient' : 'text-sheen'}`}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: ease.out, delay: 0.15 + HEADLINE.length * 0.08 }}
            >
              Even in November.
            </motion.span>
          </span>
        </h1>

        {/* Line 3 — sub-headline (who we are NOT for) */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.out, delay: 0.95 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          Not for one-van startups or shared-lead bargain hunters. We&apos;re the full front office —
          ads, funnel, live call answering and confirmed surveys in your diary — for installers
          serious about growth. One installer per postcode district.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.out, delay: 1.1 }}
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
