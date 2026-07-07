import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <p>
        This policy explains how {site.name} (“we”) collects and processes personal data, designed
        to support GDPR, UK GDPR, CCPA/CPRA, PIPEDA and the Australian Privacy Act. Region-specific
        rights apply where relevant.
      </p>
      <h2>Controller</h2>
      <p>‹FILL› legal entity name, registered address and contact. Requests: {site.email}.</p>
      <h2>Data we collect</h2>
      <p>
        Contact details you submit (name, business, email, phone), enquiry details (installs/month,
        market), and technical/marketing metadata (UTM parameters, fbclid, device, approximate
        location, consent records).
      </p>
      <h2>Purposes &amp; legal bases</h2>
      <p>
        To respond to enquiries and provide our services (contract), to measure and improve
        marketing (consent), and to meet legal obligations. We never sell your data.
      </p>
      <h2>Processors</h2>
      <p>
        Vercel (hosting), GoHighLevel (CRM, pipeline and nurture email/SMS — the system of record
        for your enquiry), Calendly (booking), Meta and Google (advertising/analytics, consent-gated).
      </p>
      <h2>Retention</h2>
      <p>‹FILL› retention periods per data category.</p>
      <h2>Your rights</h2>
      <p>
        Access, rectification, erasure, portability, objection and (California) opt-out of sale/share
        and Global Privacy Control. Exercise these via {site.email}.
      </p>
    </LegalPage>
  );
}
