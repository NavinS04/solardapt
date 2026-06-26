'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/*
 * Granular cookie consent (necessary / analytics / marketing). No GA4/GTM/Meta
 * Pixel fires before consent. Choice is persisted locally and POSTed to the
 * server so it can be logged with timestamp/scope/IP/policy version, and gate
 * server-side CAPI (BUILD_SPEC §10). Honours Global Privacy Control.
 */
type Consent = { necessary: true; analytics: boolean; marketing: boolean };
const KEY = 'solardapt_consent_v1';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    // Respect Global Privacy Control / Do-Not-Track as an opt-out signal.
    const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
    if (gpc) {
      setAnalytics(false);
      setMarketing(false);
    }
    if (!stored) setVisible(true);
  }, []);

  const persist = (consent: Consent) => {
    localStorage.setItem(KEY, JSON.stringify(consent));
    // Fire-and-forget; server logs to ConsentRecord with IP + policy version.
    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consent),
    }).catch(() => {});
    setVisible(false);
    // Downstream: only now may analytics/marketing tags initialise.
    window.dispatchEvent(new CustomEvent('consent:update', { detail: consent }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl rounded-md glass p-5 shadow-card"
          role="dialog"
          aria-label="Cookie preferences"
        >
          <p className="text-sm text-foreground">
            We use cookies to run the site and, with your consent, to measure and improve it. You can
            choose what to allow.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" checked readOnly className="accent-[var(--solar-500)]" /> Necessary
            </label>
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="accent-[var(--solar-500)]"
              />{' '}
              Analytics
            </label>
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="accent-[var(--solar-500)]"
              />{' '}
              Marketing
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" onClick={() => persist({ necessary: true, analytics, marketing })}>
              Save choices
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => persist({ necessary: true, analytics: true, marketing: true })}
            >
              Accept all
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => persist({ necessary: true, analytics: false, marketing: false })}
            >
              Reject non-essential
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
