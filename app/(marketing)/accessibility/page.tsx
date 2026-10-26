import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Accessibility Statement' };

export default function Accessibility() {
  return (
    <LegalPage title="Accessibility Statement" updated="27 October 2026">
      <p>
        We aim to meet WCAG 2.2 AA. The site is keyboard operable, has visible focus styles, honours reduced-motion
        preferences, and uses semantic markup with text alternatives for images.
      </p>
      <h2>Reduced motion</h2>
      <p>
        If your device requests reduced motion, smooth scrolling and decorative animations are switched off. No content
        is hidden.
      </p>
      <h2>The live demo</h2>
      <p>
        The demo works with a keyboard and announces each new event in the installer’s view to screen readers. Its
        timings are fixed and short; nothing in it expires before you can act.
      </p>
      <h2>Feedback</h2>
      <p>
        Found a barrier? Email <a href={`mailto:${site.email}`}>{site.email}</a> and we’ll fix it.
      </p>
    </LegalPage>
  );
}
