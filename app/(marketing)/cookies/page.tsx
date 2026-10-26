import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';

export const metadata: Metadata = { title: 'Cookies' };

export default function Cookies() {
  return (
    <LegalPage title="Cookies" updated="27 October 2026">
      <p>
        <strong>This website does not set any cookies</strong>, and we don’t use analytics, advertising or tracking
        tools. That’s why there’s no cookie banner. Our fonts are served from this site, not from a third party.
      </p>
      <h2>Third parties</h2>
      <p>
        The booking button takes you to Cal.com, which has its own cookie and privacy notice. Social media links take
        you to those platforms, which have their own notices too.
      </p>
      <p>
        If we ever add analytics or similar tools, we’ll update this page and ask for your consent first where the law
        requires it.
      </p>
      <p>
        Questions? See our <a href="/privacy">privacy notice</a>.
      </p>
    </LegalPage>
  );
}
