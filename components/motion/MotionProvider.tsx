'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/*
 * Single source of truth for motion. Initialises Lenis smooth scrolling and
 * exposes a reduced-motion flag. When the user prefers reduced motion we never
 * start Lenis and components fall back to simple cross-fades (BUILD_SPEC §5).
 */
const ReducedMotionContext = createContext(false);

export const useReducedMotionSafe = () => useContext(ReducedMotionContext);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let frame = 0;

    // Lazy-load Lenis so it never blocks first paint and is skipped entirely
    // for reduced-motion users.
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [reduced]);

  return <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>;
}
