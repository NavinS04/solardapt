// Named motion tokens (BUILD_SPEC §5). Define once, reuse everywhere.
// Mirrors the CSS variables in styles/tokens.css.
import type { Transition, Variants } from 'framer-motion';

export const ease = {
  out: [0.16, 1, 0.3, 1] as const, // expo-out — the signature ease
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const dur = { fast: 0.3, base: 0.6, slow: 1.1 } as const;

export const spring = {
  soft: { type: 'spring', stiffness: 120, damping: 18, mass: 1 } as Transition,
};

export const stagger = { children: 0.06 } as const;

// Reusable reveal variants. Children stagger in; honour reduced motion at the
// call site by passing `reduced` to swap to a simple opacity fade.
export const revealParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: stagger.children, delayChildren: 0.05 } },
};

export const revealChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
};

export const reducedChild: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.fast } },
};
