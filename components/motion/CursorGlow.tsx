'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotionSafe } from './MotionProvider';

/*
 * Soft cursor-following glow (desktop, fine pointers only). Purely decorative:
 * pointer-events none, hidden on touch and under reduced motion, and renders
 * nothing until the first pointer move so there's no SSR mismatch.
 */
export function CursorGlow() {
  const reduced = useReducedMotionSafe();
  const [active, setActive] = useState(false);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 250, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 250, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(true);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, x, y]);

  if (reduced || !active) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[65] -ml-40 -mt-40 hidden h-80 w-80 rounded-full md:block"
    >
      <div
        className="h-full w-full rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, var(--solar-400) 0%, transparent 65%)' }}
      />
    </motion.div>
  );
}
