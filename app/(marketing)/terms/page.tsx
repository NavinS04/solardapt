import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="June 2026">
      <p>‹FILL› commercial terms, scope of services, payment, cancellation and liability.</p>
      <h2>Use of the site</h2>
      <p>The site and its content are provided for information about our services.</p>
      <h2>No guarantee of results</h2>
      <p>
        Marketing outcomes depend on many factors. We make no guarantee of specific results;
        illustrative figures shown on the site are clearly labelled as such.
      </p>
    </LegalPage>
  );
}
