# Motion system

## Tokens (`lib/motion.ts`, mirrored in `styles/tokens.css`)

```
ease.out   = [0.16, 1, 0.3, 1]    // expo-out — the signature ease
ease.inOut = [0.65, 0, 0.35, 1]
dur.fast = 0.3   dur.base = 0.6   dur.slow = 1.1
spring.soft = { stiffness: 120, damping: 18, mass: 1 }
stagger.children = 0.06
```

## Primitives (`components/motion`)

- **MotionProvider** — initialises Lenis, exposes `useReducedMotionSafe()`.
- **Reveal** — masked/translated reveal-on-scroll (once, in-view).
- **Magnetic** — cursor-attracted CTA, springs back; off on reduced-motion.
- **Tilt** — 3D card tilt + glow on hover.
- **Counter** — count-up on in-view.

## Signature interactions

Hero sunrise (rising glow, drifting particles, parallax, word-by-word masked
headline), the scroll-built Solardapt Engine funnel with a travelling lead
particle, climbing dashboard bars, magnetic CTAs, tilting glass cards, animated
counters, pulsing world-map nodes, the repeated sunrise-arc divider.

## Reduced motion (WCAG 2.2 AA)

`prefers-reduced-motion: reduce` →
- Lenis is never started; native scroll is used.
- Reveals/headlines become simple opacity fades.
- Particle loops, magnetic and tilt effects are disabled.
- A global CSS safety-net caps all animation/transition durations.
- **No content is hidden** — every reduced-motion path still renders fully.

## Upgrade path (optional)

The scenes are isolated. To restore the spec's GSAP ScrollTrigger pinning and
R3F hero/globe: add the deps, gate them behind `useReducedMotionSafe()` and
lazy-load (`next/dynamic`, `ssr: false`) so they never block first paint or ship
to reduced-motion users. Keep animating only `transform`/`opacity`.
