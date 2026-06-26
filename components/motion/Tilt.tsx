'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { useReducedMotionSafe } from './MotionProvider';

/** 3D tilt + glow on hover for cards (BUILD_SPEC §5). */
export function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [8, -8]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-8, 8]), { stiffness: 150, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      style={{ rotateX: reduced ? 0 : rx, rotateY: reduced ? 0 : ry, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
