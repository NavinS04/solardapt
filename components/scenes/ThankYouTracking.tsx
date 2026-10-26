'use client';

import { useEffect } from 'react';

/*
 * Fires client-side conversion signals on the thank-you page (BUILD_SPEC §7),
 * but only after marketing consent. Server-side CAPI already fired on submit;
 * these are deduped via the shared event_id in production.
 */
export function ThankYouTracking() {
  useEffect(() => {
    try {
      const consent = JSON.parse(localStorage.getItem('solardapt_consent_v1') ?? '{}');
      if (!consent.marketing) return;
      // window.fbq?.('track', 'Lead'); window.gtag?.('event', 'generate_lead');
      window.dispatchEvent(new CustomEvent('conversion:lead'));
    } catch {
      /* no-op */
    }
  }, []);
  return null;
}
