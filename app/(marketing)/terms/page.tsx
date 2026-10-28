import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';

export const metadata: Metadata = { title: 'Website Terms' };

export default function Terms() {
  return (
    <LegalPage title="Website Terms" updated="27 October 2026">
      <p>
        These terms cover your use of solardapt.com. Our services to clients are covered by a separate written
        agreement, not by this page.
      </p>
      <h2>Information on this site</h2>
      <p>
        We describe our service as accurately as we can, but the site is general information, not an offer or advice.
        Nothing on this site is a promise of a particular number of enquiries, surveys, installs or revenue.
      </p>
      <h2>The demo and calculator</h2>
      <p>
        The <a href="/demo">demo</a> uses a fictional installer and example figures, and sends nothing. The calculator
        works only from the figures you enter, to show value at stake; it isn’t a forecast of results.
      </p>
      <h2>Using the site</h2>
      <p>
        Please don’t misuse the site, attempt to break its security or copy its content for commercial use without
        permission.
      </p>
      <h2>Liability</h2>
      <p>
        We aren’t liable for losses from relying on general information on this site. Nothing in these terms limits
        liability that can’t be limited under English law.
      </p>
      <h2>Law</h2>
      <p>These terms are governed by the law of England and Wales.</p>
    </LegalPage>
  );
}
