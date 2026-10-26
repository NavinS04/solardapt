'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin sunrise-arc bar tracking scroll progress (BUILD_SPEC §6.0). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-solar-gradient"
      aria-hidden="true"
    />
  );
}
