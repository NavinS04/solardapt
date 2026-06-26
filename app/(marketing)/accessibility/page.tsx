import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Accessibility Statement' };

export default function Accessibility() {
  return (
    <LegalPage title="Accessibility Statement" updated="June 2026">
      <p>
        We aim to meet WCAG 2.2 AA. The site is keyboard operable, has visible focus styles, honours
        reduced-motion preferences (animations are disabled or simplified), and uses semantic markup
        with descriptive alternatives.
      </p>
      <h2>Reduced motion</h2>
      <p>
        If your device requests reduced motion, smooth scrolling and decorative animations are
        switched off and pinned scenes become simple cross-fades — no content is hidden.
      </p>
      <h2>Feedback</h2>
      <p>Found a barrier? Email {site.email} and we’ll address it.</p>
    </LegalPage>
  );
}
