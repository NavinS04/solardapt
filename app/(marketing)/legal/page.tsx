import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Legal Notice' };

export default function Legal() {
  return (
    <LegalPage title="Legal Notice / Imprint" updated="June 2026">
      <p>‹FILL› registered company name, address, company number, VAT/registration and the
        responsible person.</p>
      <h2>Contact</h2>
      <p>{site.email}</p>
      <h2>GDPR &amp; CCPA disclosures</h2>
      <p>
        See our <a href="/privacy">Privacy Policy</a> for the controller identity, data categories,
        purposes, legal bases, retention, processors and how to exercise your rights, including the
        California opt-out of sale/share.
      </p>
    </LegalPage>
  );
}
