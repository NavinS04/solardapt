import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';

export const metadata: Metadata = { title: 'Cookie Policy' };

export default function Cookies() {
  return (
    <LegalPage title="Cookie Policy" updated="June 2026">
      <p>
        In line with PECR and the UK GDPR we use a granular consent manager (necessary, analytics,
        marketing). No analytics or marketing cookies, including GA4, Google Tag Manager and the
        Meta Pixel, load before you consent. You can change your choice at any time via the cookie
        banner.
      </p>
      <h2>Categories</h2>
      <p>
        <strong>Necessary:</strong> required to run the site (always on).{' '}
        <strong>Analytics:</strong> measure usage to improve the experience.{' '}
        <strong>Marketing:</strong> measure ad performance and conversions.
      </p>
      <h2>Global Privacy Control</h2>
      <p>We honour GPC and Do-Not-Track browser signals as an opt-out of non-essential cookies.</p>
    </LegalPage>
  );
}
