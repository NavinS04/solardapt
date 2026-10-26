# Brand assets

Drop the owner-supplied files here before launch (BUILD_SPEC §0, §14):

- `solardapt-logo.png` — the wordmark with rising half-sun. Until present, the
  app renders an on-brand inline SVG fallback (see `components/ui/Logo.tsx`).
- `og.png` — 1200×630 social share image.
- `vsl-poster.jpg` — poster frame for the "Watch How It Works" video.

`<LogoImage>` switches to the real PNG once `solardapt-logo.png` exists.
