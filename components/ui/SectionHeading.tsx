'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Masked heading reveal reused across scenes (BUILD_SPEC §5). */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <div
      ref={ref}
      className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}
    >
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: ease.out }}
          className="mb-3 text-sm font-semibold uppercase tracking-widest text-solar-500"
        >
          {eyebrow}
        </motion.p>
      )}
      <h2 className="overflow-hidden font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
        <motion.span
          className="inline-block"
          initial={{ y: '110%' }}
          animate={inView ? { y: 0 } : {}}
          transition={{ duration: 0.8, ease: ease.out }}
        >
          {title}
        </motion.span>
      </h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: ease.out, delay: 0.15 }}
          className={cn('mt-4 text-lg text-muted-foreground', align === 'center' && 'mx-auto')}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
