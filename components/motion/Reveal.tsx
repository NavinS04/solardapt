'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { dur, ease } from '@/lib/motion';
import { useReducedMotionSafe } from './MotionProvider';

/** Reveal-on-scroll wrapper: masked/translated entrance, reduced-motion safe. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'span' | 'li';
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduced = useReducedMotionSafe();
  const MotionTag = motion[as];

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? dur.fast : dur.base, ease: ease.out, delay }}
    >
      {children}
    </MotionTag>
  );
}
